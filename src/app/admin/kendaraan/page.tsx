import prisma from "@/lib/prisma";
import KendaraanClient from "./KendaraanClient";

export default async function AdminKendaraanPage() {
  const data = await prisma.jenisKendaraan.findMany({ orderBy: { nama: "asc" } });
  return <KendaraanClient data={JSON.parse(JSON.stringify(data))} />;
}
