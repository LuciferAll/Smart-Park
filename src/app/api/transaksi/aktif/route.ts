import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "PETUGAS" || !session.id_area) {
      return NextResponse.json({ aktif: [] });
    }

    const unparsed = await prisma.transaksi.findMany({
      where: {
        status_pembayaran: "PENDING",
        id_area: session.id_area
      },
      include: {
        kendaraan: true
      },
      orderBy: { waktu_masuk: "desc" }
    });

    return NextResponse.json({ aktif: unparsed });
  } catch (error) {
    return NextResponse.json({ aktif: [] });
  }
}
