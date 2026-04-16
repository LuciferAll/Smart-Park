import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "PETUGAS" && session.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized: Akses ditolak" }, { status: 401 });
    }

    const { plat_nomor, jenis } = await req.json();

    if (!plat_nomor || !jenis) {
      return NextResponse.json({ message: "Plat nomor dan jenis kendaraan wajib diisi" }, { status: 400 });
    }

    // Upsert Kendaraan based on unique plat_nomor
    const kendaraan = await prisma.kendaraan.upsert({
      where: { plat_nomor },
      update: { jenis_kendaraan: jenis }, // Jika ganti jenis, update
      create: {
        plat_nomor,
        jenis_kendaraan: jenis,
      }
    });

    // Gunakan area parkir yang di-assign ke petugas (dari session)
    // Jika tidak ada, fallback ke area pertama atau buat default
    let area;
    if (session.id_area) {
      area = await prisma.areaParkir.findUnique({ where: { id: session.id_area } });
    }
    if (!area) {
      area = await prisma.areaParkir.findFirst();
    }
    if (!area) {
      area = await prisma.areaParkir.create({
        data: { nama_area: "Area Utama", max_kapasitas: 200 }
      });
    }

    // Cek kapasitas area parkir
    if (area.terisi >= area.max_kapasitas) {
      return NextResponse.json(
        { message: `Area ${area.nama_area} sudah penuh (${area.terisi}/${area.max_kapasitas})!` },
        { status: 400 }
      );
    }

    // Validasi double parking (kendaraan belum bayar/keluar)
    const activePark = await prisma.transaksi.findFirst({
      where: { 
        id_kendaraan: kendaraan.id, 
        status_pembayaran: "PENDING"
      }
    });

    if (activePark) {
      return NextResponse.json(
        { 
          code: "DUPLICATE_PLAT", 
          message: `Plat ${plat_nomor} masih tercatat di dalam area parkir (belum checkout)!` 
        }, 
        { status: 409 }
      );
    }

    // Generate Nomor Tiket Unik
    const no_tiket = `TKT-${new Date().getTime().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Increment terisi di area parkir
    await prisma.areaParkir.update({
      where: { id: area.id },
      data: { terisi: { increment: 1 } }
    });

    // Buat Log Aktivitas (Opsional)
    await prisma.logAktivitas.create({
      data: {
        id_user: session.id,
        aksi: `Otorisasi Kendaraan Masuk: ${plat_nomor} (${area.nama_area})`,
      }
    });

    // Create Transaksi
    const transaksi = await prisma.transaksi.create({
      data: {
        no_tiket,
        id_user: session.id,
        id_kendaraan: kendaraan.id,
        id_area: area.id,
      }
    });

    return NextResponse.json({ 
      message: "Tiket berhasil diterbitkan", 
      transaksi 
    });
  } catch (error) {
    console.error("API Masuk Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server saat memproses tiket masuk" }, { status: 500 });
  }
}
