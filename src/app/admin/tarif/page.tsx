import prisma from "@/lib/prisma";
import TarifClient from "./TarifClient";

export default async function AdminTarifPage() {
  const [tarifRaw, jenisKendaraan] = await Promise.all([
    prisma.tarif.findMany(),
    prisma.jenisKendaraan.findMany({ orderBy: { nama: "asc" } }),
  ]);
  
  // Decimal objects cannot be passed to Client Components, convert via JSON
  const tarif = JSON.parse(JSON.stringify(tarifRaw)).map((t: any) => ({
    ...t,
    tarif_per_jam: Number(t.tarif_per_jam)
  }));

  return <TarifClient data={tarif} jenisOptions={JSON.parse(JSON.stringify(jenisKendaraan))} />;
}
