import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ambil 15 log aktivitas terbaru
    const logs = await prisma.logAktivitas.findMany({
      take: 15,
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json({ notifications: logs });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
