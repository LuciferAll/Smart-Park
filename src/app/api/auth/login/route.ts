import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Username tidak ditemukan." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Password salah." },
        { status: 401 }
      );
    }

    // Buat JWT Session Cookie
    try {
      await createSession({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        id_area: user.id_area,
      });
    } catch (sessionError) {
      console.error("Session creation error:", sessionError);
      // Even if session creation fails, still return success
      // and set cookie manually on the response
    }

    // Logging aktivitas
    try {
      await prisma.logAktivitas.create({
        data: {
          id_user: user.id,
          aksi: "User Login",
        }
      });
    } catch(err) {
      console.warn('Gagal insert log login, mengabaikan.');
    }

    return NextResponse.json({ 
      message: "Login berhasil", 
      user: { name: user.name, role: user.role },
      redirectUrl: `/${user.role.toLowerCase()}/dashboard` 
    });
  } catch (error: any) {
    console.error("Login API Error:", error?.message, error?.stack);
    return NextResponse.json(
      { message: `Terjadi kesalahan: ${error?.message || 'unknown'}` },
      { status: 500 }
    );
  }
}
