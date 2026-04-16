"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar, CalendarDays, Activity, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stats = {
  totalAll: number;
  totalAllCount: number;
  totalBulan: number;
  totalBulanCount: number;
  totalMinggu: number;
  totalMingguCount: number;
  totalHariIni: number;
  totalHariIniCount: number;
};

type ChartItem = { label: string; value: number };

const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function OwnerDashboardClient({ stats, chartData }: { stats: Stats; chartData: ChartItem[] }) {
  const maxChart = Math.max(...chartData.map(d => d.value), 1);

  const cards = [
    { title: "Pendapatan Total", value: stats.totalAll, count: stats.totalAllCount, icon: <DollarSign className="w-5 h-5" />, gradient: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/20" },
    { title: "Bulan Ini", value: stats.totalBulan, count: stats.totalBulanCount, icon: <CalendarDays className="w-5 h-5" />, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20" },
    { title: "Minggu Ini", value: stats.totalMinggu, count: stats.totalMingguCount, icon: <Calendar className="w-5 h-5" />, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
    { title: "Hari Ini", value: stats.totalHariIni, count: stats.totalHariIniCount, icon: <TrendingUp className="w-5 h-5" />, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Laporan Eksekutif</h1>
        <p className="text-slate-500 mt-1">Ringkasan pendapatan dan performa operasional parkir</p>
      </motion.div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card className="glass-card rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground">{fmtRp(card.value)}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{card.count} transaksi lunas</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart: Pendapatan 7 Hari Terakhir */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card className="glass-card rounded-2xl border-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Pendapatan 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <div className="flex items-end gap-3 h-52">
              {chartData.map((item, i) => {
                const heightPercent = maxChart > 0 ? (item.value / maxChart) * 100 : 0;
                return (
                  <motion.div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* Value label */}
                    <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                      {item.value > 0 ? `${(item.value / 1000).toFixed(0)}k` : "0"}
                    </span>
                    
                    {/* Bar Container */}
                    <div className="w-full flex-1 flex flex-col justify-end relative">
                      <div
                        className="w-full rounded-t-xl rounded-b-md bg-gradient-to-t from-indigo-600 to-indigo-400 min-h-[4px] transition-all duration-500 hover:from-indigo-500 hover:to-purple-400 cursor-pointer relative group"
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-lg">
                          {fmtRp(item.value)}
                        </div>
                      </div>
                    </div>
                    {/* Day label */}
                    <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
