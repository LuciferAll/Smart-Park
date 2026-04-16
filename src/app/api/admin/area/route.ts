import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// GET all area — also auto-fix negative terisi values
export async function GET() {
  // Fix any negative terisi values by recalculating from actual PENDING transactions
  const areas = await prisma.areaParkir.findMany();
  
  for (const area of areas) {
    const actualCount = await prisma.transaksi.count({
      where: { id_area: area.id, status_pembayaran: "PENDING" }
    });
    
    if (area.terisi !== actualCount) {
      await prisma.areaParkir.update({
        where: { id: area.id },
        data: { terisi: actualCount }
      });
      area.terisi = actualCount;
    }
  }

  return NextResponse.json(areas);
}

// CREATE or UPDATE area
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, nama_area, max_kapasitas } = await req.json();

  if (!nama_area || !max_kapasitas) {
    return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
  }

  if (id) {
    const area = await prisma.areaParkir.update({
      where: { id },
      data: { nama_area, max_kapasitas: Number(max_kapasitas) }
    });
    return NextResponse.json({ message: "Area berhasil diperbarui", area });
  } else {
    const area = await prisma.areaParkir.create({
      data: { nama_area, max_kapasitas: Number(max_kapasitas) }
    });
    return NextResponse.json({ message: "Area berhasil dibuat", area });
  }
}

// DELETE area
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.areaParkir.delete({ where: { id } });
  return NextResponse.json({ message: "Area berhasil dihapus" });
}
