import prisma from "@/lib/prisma";
import OwnerDashboardClient from "./OwnerDashboardClient";

export default async function OwnerDashboardPage() {
  const now = new Date();

  // Hari ini
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Minggu ini (Senin)
  const weekStart = new Date(now);
  const dayOfWeek = weekStart.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Bulan ini
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Query semua pendapatan
  const [totalAll, totalBulan, totalMinggu, totalHariIni, totalTransaksiHariIni] = await Promise.all([
    prisma.transaksi.aggregate({
      _sum: { total_biaya: true },
      _count: true,
      where: { status_pembayaran: "LUNAS" }
    }),
    prisma.transaksi.aggregate({
      _sum: { total_biaya: true },
      _count: true,
      where: { status_pembayaran: "LUNAS", updatedAt: { gte: monthStart } }
    }),
    prisma.transaksi.aggregate({
      _sum: { total_biaya: true },
      _count: true,
      where: { status_pembayaran: "LUNAS", updatedAt: { gte: weekStart } }
    }),
    prisma.transaksi.aggregate({
      _sum: { total_biaya: true },
      _count: true,
      where: { status_pembayaran: "LUNAS", updatedAt: { gte: todayStart } }
    }),
    prisma.transaksi.count({
      where: { status_pembayaran: "LUNAS", updatedAt: { gte: todayStart } }
    }),
  ]);

  // Data chart: Pendapatan 7 hari terakhir
  const chartData: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const agg = await prisma.transaksi.aggregate({
      _sum: { total_biaya: true },
      where: {
        status_pembayaran: "LUNAS",
        updatedAt: { gte: dayStart, lte: dayEnd }
      }
    });

    chartData.push({
      label: dayStart.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      value: agg._sum.total_biaya || 0
    });
  }

  return (
    <OwnerDashboardClient
      stats={{
        totalAll: totalAll._sum.total_biaya || 0,
        totalAllCount: totalAll._count,
        totalBulan: totalBulan._sum.total_biaya || 0,
        totalBulanCount: totalBulan._count,
        totalMinggu: totalMinggu._sum.total_biaya || 0,
        totalMingguCount: totalMinggu._count,
        totalHariIni: totalHariIni._sum.total_biaya || 0,
        totalHariIniCount: totalTransaksiHariIni,
      }}
      chartData={chartData}
    />
  );
}
