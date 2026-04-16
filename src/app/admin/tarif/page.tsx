import prisma from "@/lib/prisma";
import TarifClient from "./TarifClient";

export default async function AdminTarifPage() {
  const [tarif, jenisKendaraan] = await Promise.all([
    prisma.tarif.findMany(),
    prisma.jenisKendaraan.findMany({ orderBy: { nama: "asc" } }),
  ]);
  return <TarifClient data={tarif} jenisOptions={JSON.parse(JSON.stringify(jenisKendaraan))} />;
}
