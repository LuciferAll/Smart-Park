import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET all users
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

// CREATE user
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, username, password, role, id_area } = await req.json();
  if (!name || !username || !password || !role) {
    return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ message: "Username sudah terpakai" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, username, password: hashed, role, id_area: role === "PETUGAS" ? id_area || null : null }
  });

  await prisma.logAktivitas.create({
    data: { id_user: session.id, aksi: `Membuat user baru: ${username} (${role})` }
  });

  return NextResponse.json({ message: "User berhasil dibuat", user });
}

// DELETE user
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (id === session.id) {
    return NextResponse.json({ message: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "User berhasil dihapus" });
}
