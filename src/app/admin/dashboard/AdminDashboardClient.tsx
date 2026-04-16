"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { Users, Car, MapPin, Receipt, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Props = {
  stats: { totalUsers: number; totalKendaraan: number; totalArea: number; totalTransaksi: number; totalPendapatan: number };
  recentTransaksi: any[];
  tarif: any[];
};

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function AdminDashboardClient({ stats, recentTransaksi, tarif }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const hitungBiayaSimulasi = (waktuMasuk: string, jenisKendaraan: string) => {
    const start = new Date(waktuMasuk).getTime();
    const current = now.getTime();
    const millis = current - start;
    const minutes = Math.ceil(millis / (1000 * 60)); 
    const durasiMenit = minutes > 0 ? minutes : 1; 

    const masterTarif = tarif?.find(t => t.jenis_kendaraan.toLowerCase() === jenisKendaraan?.toLowerCase());
    
    if (!masterTarif) {
      const basePerJam: Record<string, number> = { MOTOR: 2000, MOBIL: 5000, TRUK: 10000, SEPEDA: 1000, BUS: 15000 };
      const base = basePerJam[jenisKendaraan?.toUpperCase()] || 2000;
      return base * durasiMenit;
    }

    let biaya = masterTarif.tarif_jam_pertama + (durasiMenit - 1) * masterTarif.tarif_berikutnya;
    if (biaya > masterTarif.max_biaya_per_hari) {
      biaya = masterTarif.max_biaya_per_hari;
    }
    return biaya;
  };
  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { title: "Kendaraan Terdaftar", value: stats.totalKendaraan, icon: <Car className="w-5 h-5" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { title: "Area Parkir", value: stats.totalArea, icon: <MapPin className="w-5 h-5" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { title: "Total Transaksi", value: stats.totalTransaksi, icon: <Receipt className="w-5 h-5" />, color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan sistem parkir secara keseluruhan</p>
      </motion.div>

      {/* Stat Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <StaggerItem key={i}>
            <Card className="glass-card rounded-2xl border-0 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Revenue Card */}
      <StaggerContainer>
        <StaggerItem>
          <Card className="glass-card rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pendapatan (Lunas)</p>
                  <p className="text-4xl font-extrabold text-foreground mt-2">{formatRp(stats.totalPendapatan)}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card rounded-2xl border-0 overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-primary" /> Transaksi Terbaru
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs uppercase tracking-wider">Tiket</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Plat</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Petugas</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransaksi.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">Belum ada transaksi</TableCell></TableRow>
              )}
              {recentTransaksi.map((t: any) => {
                const biayaTampil = t.status_pembayaran === "PENDING" ? hitungBiayaSimulasi(t.waktu_masuk, t.kendaraan?.jenis_kendaraan) : (t.total_biaya || 0);
                return (
                  <TableRow key={t.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell className="font-mono text-xs uppercase tracking-widest">{t.no_tiket}</TableCell>
                    <TableCell className="font-mono uppercase">{t.kendaraan?.plat_nomor}</TableCell>
                    <TableCell className="text-sm">{t.user?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${t.status_pembayaran === "LUNAS" ? "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30"}`}>
                        {t.status_pembayaran}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${t.status_pembayaran === "PENDING" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                      {formatRp(biayaTampil)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}
