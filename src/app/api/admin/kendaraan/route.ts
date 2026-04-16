import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

// GET all jenis kendaraan (public for dropdowns)
export async function GET() {
  const data = await prisma.jenisKendaraan.findMany({ orderBy: { nama: "asc" } });
  return NextResponse.json(data);
}

// CREATE or UPDATE jenis kendaraan
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, nama } = await req.json();

  if (!nama || !nama.trim()) {
    return NextResponse.json({ message: "Nama jenis kendaraan wajib diisi" }, { status: 400 });
  }

  try {
    if (id) {
      // UPDATE
      await prisma.jenisKendaraan.update({
        where: { id },
        data: { nama: nama.trim() },
      });

      await prisma.logAktivitas.create({
        data: { id_user: session.id, aksi: `Edit jenis kendaraan: ${nama.trim()}` },
      });

      return NextResponse.json({ message: "Jenis kendaraan berhasil diperbarui" });
    } else {
      // CREATE
      const exists = await prisma.jenisKendaraan.findUnique({ where: { nama: nama.trim() } });
      if (exists) {
        return NextResponse.json({ message: "Jenis kendaraan sudah ada" }, { status: 400 });
      }

      await prisma.jenisKendaraan.create({
        data: { nama: nama.trim() },
      });

      await prisma.logAktivitas.create({
        data: { id_user: session.id, aksi: `Tambah jenis kendaraan: ${nama.trim()}` },
      });

      return NextResponse.json({ message: "Jenis kendaraan berhasil ditambahkan" });
    }
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Jenis kendaraan sudah ada" }, { status: 400 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// DELETE jenis kendaraan
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  try {
    const jenis = await prisma.jenisKendaraan.findUnique({ where: { id } });
    await prisma.jenisKendaraan.delete({ where: { id } });

    await prisma.logAktivitas.create({
      data: { id_user: session.id, aksi: `Hapus jenis kendaraan: ${jenis?.nama}` },
    });

    return NextResponse.json({ message: "Jenis kendaraan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
