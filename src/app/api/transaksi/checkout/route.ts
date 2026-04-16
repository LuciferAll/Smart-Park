import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
const midtransClient = require('midtrans-client');

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "PETUGAS" && session.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { param } = await req.json(); // bisa berupa plat_nomor atau no_tiket

    if (!param) {
      return NextResponse.json({ message: "Tiket atau Plat Nomor wajib diisi" }, { status: 400 });
    }

    // Cari transaksi parkir yang belum lunas
    const transaksi = await prisma.transaksi.findFirst({
      where: {
        status_pembayaran: "PENDING",
        OR: [
          { no_tiket: param },
          { kendaraan: { plat_nomor: param } }
        ]
      },
      include: {
        kendaraan: true
      }
    });

    if (!transaksi) {
      return NextResponse.json(
        { message: "Kendaraan tidak ditemukan atau sudah dibayar." },
        { status: 404 }
      );
    }

    // Validasi: Petugas hanya bisa checkout kendaraan di areanya sendiri
    if (session.role === "PETUGAS" && session.id_area && transaksi.id_area !== session.id_area) {
      return NextResponse.json(
        { message: "Kendaraan ini parkir di area lain. Anda tidak bisa memproses pembayarannya!" },
        { status: 403 }
      );
    }

    // Hitung Tarif Berdasarkan Durasi (SIMULASI: 1 Menit nyata = 1 Jam tagihan aplikasi)
    const waktuKeluar = new Date();
    const millis = waktuKeluar.getTime() - transaksi.waktu_masuk.getTime();
    const simulatedHours = Math.ceil(millis / (1000 * 60)); // round up ke menit terdekat, dianggap sebagai jam
    const durasiJam = simulatedHours > 0 ? simulatedHours : 1; // minimal 1 jam (1 menit nyata)

    // Ambil konfigurasi Tarif, case-insensitive
    let biaya = 0;
    const masterTarif = await prisma.tarif.findFirst({
      where: { 
        jenis_kendaraan: { equals: transaksi.kendaraan.jenis_kendaraan }
      }
    });

    if (!masterTarif) {
      // Fallback per jam
      const basePerJam: Record<string, number> = {
        MOTOR: 2000,
        MOBIL: 5000,
        TRUK: 10000,
        SEPEDA: 1000,
        BUS: 15000,
      };
      const base = basePerJam[transaksi.kendaraan.jenis_kendaraan.toUpperCase()] || 2000;
      biaya = base * durasiJam;
    } else {
      // tarif_jam_pertama = tarif jam pertama, tarif_berikutnya = tarif per jam berikutnya
      biaya = masterTarif.tarif_jam_pertama + (durasiJam - 1) * masterTarif.tarif_berikutnya;
      if (biaya > masterTarif.max_biaya_per_hari) {
        biaya = masterTarif.max_biaya_per_hari;
      }
    }

    // Update Transaksi dengan data kalkulasi (Masih Pending)
    await prisma.transaksi.update({
      where: { id: transaksi.id },
      data: {
        waktu_keluar: waktuKeluar,
        durasi_jam: durasiJam,
        total_biaya: biaya,
      }
    });

    // Create Midtrans Snap Token
    let snapToken = null;
    let order_id = `PARK-${transaksi.no_tiket}-${new Date().getTime()}`;
    
    if (biaya > 0) {
      let snap = new midtransClient.Snap({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder',
        clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder'
      });

      let parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: biaya
        },
        item_details: [{
           id: transaksi.id,
           price: biaya,
           quantity: 1,
           name: `Parkir ${transaksi.kendaraan.jenis_kendaraan} - ${durasiJam} Jam`
        }],
        customer_details: {
          first_name: "Customer",
          last_name: transaksi.kendaraan.plat_nomor,
        }
      };

      try {
        const snapResponse = await snap.createTransaction(parameter);
        snapToken = snapResponse.token;

        // Simpan token ke database
        await prisma.transaksi.update({
          where: { id: transaksi.id },
          data: { midtrans_token: snapToken }
        });
      } catch (midtransErr) {
        console.error("Midtrans Snippet error:", midtransErr);
        // Tetap return biaya supaya kasir manual bisa proceed
      }
    }

    // Buat Log Aktivitas Checkout (Opsional)
    await prisma.logAktivitas.create({
      data: {
        id_user: session.id,
        aksi: `Proses Checkout Kendaraan: ${transaksi.kendaraan.plat_nomor}`,
      }
    });

    return NextResponse.json({ 
      message: "Rincian parkir berhasil dikalkulasi", 
      transaksi: {
        ...transaksi,
        waktu_keluar: waktuKeluar,
        durasi_jam: durasiJam,
        total_biaya: biaya,
        midtrans_token: snapToken,
        order_id
      }
    });
  } catch (error) {
    console.error("API Checkout Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server saat checkout" }, { status: 500 });
  }
}
