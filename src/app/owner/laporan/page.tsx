import prisma from "@/lib/prisma";
import LaporanClient from "./LaporanClient";

export default async function LaporanPage() {
  const transaksi = await prisma.transaksi.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kendaraan: true,
      user: true,
      area: true
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Rekap Transaksi Harian</h1>
        <p className="text-slate-500 mt-1">Laporan detail kendaraan masuk dan keluar per hari ini beserta riwayat sebelumnya</p>
      </div>
      <LaporanClient data={transaksi} />
    </div>
  );
}
