import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import PetugasDashboardClient from "./PetugasDashboardClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PetugasDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "PETUGAS") {
    redirect("/login");
  }

  // Ambil transaksi PENDING yang masuk di area milik petugas ini
  const pendingTransaksi = await prisma.transaksi.findMany({
    where: {
      status_pembayaran: "PENDING",
      id_area: session.id_area || undefined // filter berdasarkan area petugas
    },
    include: {
      kendaraan: true
    },
    orderBy: { waktu_masuk: "desc" }
  });

  // Ambil semua tarif untuk perhitungan simulasi real-time di client
  const tarifList = await prisma.tarif.findMany();

  return (
    <PetugasDashboardClient 
      transaksi={JSON.parse(JSON.stringify(pendingTransaksi))} 
      tarif={tarifList}
      namaArea={session.name} // bisa dipakai untuk greetings
    />
  );
}
