"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, ClipboardList, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import Link from "next/link";

type Tarif = {
  jenis_kendaraan: string;
  tarif_jam_pertama: number;
  tarif_berikutnya: number;
  max_biaya_per_hari: number;
};

type Transaksi = {
  id: string;
  no_tiket: string;
  waktu_masuk: string;
  kendaraan: {
    plat_nomor: string;
    jenis_kendaraan: string;
  };
  status_pembayaran: string;
};

type Props = {
  transaksi: Transaksi[];
  tarif: Tarif[];
  namaArea: string;
};

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function PetugasDashboardClient({ transaksi, tarif, namaArea }: Props) {
  const [now, setNow] = useState(new Date());

  // Realtime clock update setiap 5 detik agar tabel terasa hidup dan perhitungan biaya otomatis update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk menghitung simulasi biaya secara realtime di frontend
  const hitungBiayaSimulasi = (waktuMasuk: string, jenisKendaraan: string) => {
    const start = new Date(waktuMasuk).getTime();
    const current = now.getTime();
    const millis = current - start;
    const minutes = Math.ceil(millis / (1000 * 60)); 
    const durasiMenit = minutes > 0 ? minutes : 1; 

    // Cari konfigurasi tarif untuk jenis kendaraan ini (case-insensitive)
    const masterTarif = tarif.find(t => t.jenis_kendaraan.toLowerCase() === jenisKendaraan.toLowerCase());
    
    if (!masterTarif) {
      // Fallback per jam
      const basePerJam: Record<string, number> = {
        MOTOR: 2000,
        MOBIL: 5000,
        TRUK: 10000,
        SEPEDA: 1000,
        BUS: 15000,
      };
      const base = basePerJam[jenisKendaraan.toUpperCase()] || 2000;
      return base * durasiMenit;
    }

    let biaya = masterTarif.tarif_jam_pertama + (durasiMenit - 1) * masterTarif.tarif_berikutnya;
    if (biaya > masterTarif.max_biaya_per_hari) {
      biaya = masterTarif.max_biaya_per_hari;
    }
    return biaya;
  };

  const getMenitTelahBerlalu = (waktuMasuk: string) => {
    const start = new Date(waktuMasuk).getTime();
    const current = now.getTime();
    return Math.floor((current - start) / (1000 * 60));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terminal Petugas</h1>
          <p className="text-sm text-muted-foreground mt-1">Selamat bertugas, {namaArea}</p>
        </div>
      </motion.div>

      <StaggerContainer className="grid gap-6 md:grid-cols-2">
        <StaggerItem>
          <Link href="/petugas/masuk" className="block group h-full">
            <Card className="glass-card rounded-2xl border-0 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-[1.01]">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Kendaraan Masuk</CardTitle>
                <CardDescription>Catat kendaraan baru yang masuk ke area</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs font-semibold text-primary group-hover:underline">Buka halaman →</span>
              </CardContent>
            </Card>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/petugas/keluar" className="block group h-full">
            <Card className="glass-card rounded-2xl border-0 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-[1.01]">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Keluar & Bayar</CardTitle>
                <CardDescription>Proses tiket keluar dan tagih pembayaran</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs font-semibold text-primary group-hover:underline">Buka halaman →</span>
              </CardContent>
            </Card>
          </Link>
        </StaggerItem>
      </StaggerContainer>

      {/* Tabel Kendaraan Aktif (Area Sendiri, Tanpa Kolom Petugas, Biaya Live) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card rounded-2xl border-0 overflow-hidden shadow-lg">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary animate-pulse" /> Kendaraan Aktif di Area Anda
            </h3>
            <Badge variant="secondary" className="rounded-lg">{transaksi.length} Total</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs uppercase tracking-wider">Tiket</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Plat Nomor</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Jenis</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Durasi (Jam)</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksi.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Area parkir ini sedang kosong saat ini.</TableCell></TableRow>
              )}
              {transaksi.map((t) => {
                const liveBiaya = hitungBiayaSimulasi(t.waktu_masuk, t.kendaraan.jenis_kendaraan);
                const menitLalu = getMenitTelahBerlalu(t.waktu_masuk);
                const jamSimulasi = menitLalu > 0 ? menitLalu : 1;
                return (
                  <TableRow key={t.id} className="hover:bg-accent/20 transition-colors">
                    <TableCell className="font-mono text-xs font-medium tracking-wider">{t.no_tiket}</TableCell>
                    <TableCell className="font-mono font-bold uppercase">{t.kendaraan.plat_nomor}</TableCell>
                    <TableCell className="text-sm capitalize">{t.kendaraan.jenis_kendaraan.toLowerCase()}</TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">{jamSimulasi} <span className="text-[10px]">Jam (Simulasi)</span></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-500 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase font-bold tracking-widest">
                        Di Dalam
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatRp(liveBiaya)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Panduan */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card rounded-2xl border-0 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" /> Panduan Singkat</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p><strong>1.</strong> Kendaraan datang → <strong>Kendaraan Masuk</strong> → ketik plat → Simpan</p>
            <p><strong>2.</strong> Kendaraan pergi → <strong>Keluar & Bayar</strong> → ketik plat/tiket → tagih & bayar otomatis</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
