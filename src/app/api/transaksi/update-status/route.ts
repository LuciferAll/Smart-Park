import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "PETUGAS" && session.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: "ID dan status wajib diisi" }, { status: 400 });
    }

    // Fetch transaksi dulu untuk cek status sebelumnya
    const existing = await prisma.transaksi.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // Update status
    const transaksi = await prisma.transaksi.update({
      where: { id },
      data: { status_pembayaran: status }
    });

    // Hanya decrement terisi jika status berubah dari PENDING ke LUNAS
    // dan pastikan terisi tidak negatif
    if (status === "LUNAS" && existing.status_pembayaran === "PENDING") {
      const area = await prisma.areaParkir.findUnique({ where: { id: transaksi.id_area } });
      if (area && area.terisi > 0) {
        await prisma.areaParkir.update({
          where: { id: transaksi.id_area },
          data: { terisi: { decrement: 1 } }
        });
      }
    }

    return NextResponse.json({ message: "Status pembayaran diperbarui", transaksi });
  } catch (error) {
    console.error("API Update Status Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
