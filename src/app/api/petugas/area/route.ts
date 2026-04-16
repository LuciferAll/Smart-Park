import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PETUGAS" || !session.id_area) {
    return NextResponse.json({ max_kapasitas: 0, terisi: 0 }, { status: 403 });
  }
  const area = await prisma.areaParkir.findUnique({ where: { id: session.id_area }});
  if (!area) return NextResponse.json({ max_kapasitas: 0, terisi: 0 }, { status: 404 });
  return NextResponse.json({ max_kapasitas: area.max_kapasitas, terisi: area.terisi });
}
