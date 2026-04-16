import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// GET all tarif
export async function GET() {
  const tarif = await prisma.tarif.findMany();
  return NextResponse.json(tarif);
}

// CREATE or UPDATE tarif
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, jenis_kendaraan, tarif_per_jam } = await req.json();

  if (!jenis_kendaraan || !tarif_per_jam) {
    return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
  }

  if (id) {
    // Update existing
    const tarif = await prisma.tarif.update({
      where: { id },
      data: { jenis_kendaraan, tarif_per_jam: Number(tarif_per_jam) }
    });
    return NextResponse.json({ message: "Tarif berhasil diperbarui", tarif });
  } else {
    // Create new
    const exists = await prisma.tarif.findUnique({ where: { jenis_kendaraan } });
    if (exists) {
      return NextResponse.json({ message: "Tarif untuk jenis kendaraan ini sudah ada. Gunakan edit." }, { status: 400 });
    }
    const tarif = await prisma.tarif.create({
      data: { jenis_kendaraan, tarif_per_jam: Number(tarif_per_jam) }
    });
    return NextResponse.json({ message: "Tarif berhasil dibuat", tarif });
  }
}

// DELETE tarif
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.tarif.delete({ where: { id } });
  return NextResponse.json({ message: "Tarif berhasil dihapus" });
}
