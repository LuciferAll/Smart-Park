import prisma from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const [totalUsers, totalKendaraan, totalArea, totalTransaksi, pendapatan] = await Promise.all([
    prisma.user.count(),
    prisma.kendaraan.count(),
    prisma.areaParkir.count(),
    prisma.transaksi.count(),
    prisma.transaksi.aggregate({ _sum: { total_biaya: true }, where: { status_pembayaran: "LUNAS" } }),
  ]);

  const recentTransaksi = await prisma.transaksi.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { kendaraan: true, user: true },
  });

  const tarifList = await prisma.tarif.findMany();

  return (
    <AdminDashboardClient
      stats={{
        totalUsers,
        totalKendaraan,
        totalArea,
        totalTransaksi,
        totalPendapatan: pendapatan._sum.total_biaya || 0,
      }}
      recentTransaksi={recentTransaksi}
      tarif={tarifList}
    />
  );
}
