"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Receipt, FileText, Filter } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/motion";

export default function LaporanClient({ data }: { data: any[] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredData = data.filter((t) => {
    if (!startDate && !endDate) return true;
    const tDate = new Date(t.waktu_masuk);
    const yyyy = tDate.getFullYear();
    const mm = String(tDate.getMonth() + 1).padStart(2, '0');
    const dd = String(tDate.getDate()).padStart(2, '0');
    const dStr = `${yyyy}-${mm}-${dd}`;

    if (startDate && endDate) return dStr >= startDate && dStr <= endDate;
    if (startDate) return dStr >= startDate;
    if (endDate) return dStr <= endDate;
    return true;
  });
  const exportToCSV = () => {
    try {
      const headers = ["No Tiket", "Plat Nomor", "Jenis", "Area", "Petugas", "Masuk", "Keluar", "Durasi (Jam)", "Total Biaya", "Status"];
      const csvData = filteredData.map(t => [
        t.no_tiket, t.kendaraan.plat_nomor, t.kendaraan.jenis_kendaraan, t.area.nama_area, t.user.name,
        new Date(t.waktu_masuk).toLocaleString('id-ID').replace(/,/g, ''),
        t.waktu_keluar ? new Date(t.waktu_keluar).toLocaleString('id-ID').replace(/,/g, '') : "-",
        t.durasi_jam || "-", t.total_biaya || "0", t.status_pembayaran
      ]);
      const csvContent = [headers.join(","), ...csvData.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", `laporan_parkir_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success("Laporan berhasil diunduh");
    } catch { toast.error("Gagal mengunduh"); }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Rekap Transaksi Parkir", 14, 15);
      
      const tableColumn = ["No Tiket", "Plat Nomor", "Masuk", "Keluar", "Durasi", "Biaya", "Status"];
      const tableRows: any[] = [];

      filteredData.forEach(t => {
        const rowData = [
          t.no_tiket,
          t.kendaraan.plat_nomor,
          new Date(t.waktu_masuk).toLocaleString('id-ID'),
          t.waktu_keluar ? new Date(t.waktu_keluar).toLocaleString('id-ID') : "-",
          t.durasi_jam ? `${t.durasi_jam} Menit` : "-",
          `Rp ${t.total_biaya?.toLocaleString('id-ID') || '0'}`,
          t.status_pembayaran
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] }
      });

      doc.save(`laporan_parkir_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Laporan PDF berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh PDF");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Receipt className="w-6 h-6 text-primary" /> Rekap Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-1">Laporan lengkap transaksi {startDate || endDate ? 'sesuai filter' : 'keseluruhan'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Tanggal Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-card p-2 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"><Filter className="w-3 h-3 inline mr-1"/> Mulai</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm bg-muted/50 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sampai</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm bg-muted/50 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            {(startDate || endDate) && (
              <Button variant="ghost" onClick={() => {setStartDate(""); setEndDate("");}} className="h-8 px-3 text-xs text-rose-500 hover:bg-rose-50">Reset</Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-rose-600 hover:bg-rose-700 rounded-xl text-white border-none shadow-lg shadow-rose-500/20" onClick={exportToPDF}>
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white border-none shadow-lg shadow-emerald-500/20" onClick={exportToCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>
      </motion.div>

      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider">Tiket</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Plat</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Masuk</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Keluar</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Durasi</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Biaya</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 && <TableRow><TableCell colSpan={7}><EmptyState icon={<Receipt className="w-6 h-6" />} title="Belum ada transaksi" description="Tidak ada transaksi untuk rentang waktu yang dipilih" /></TableCell></TableRow>}
            {filteredData.map((t: any) => (
              <TableRow key={t.id} className="hover:bg-accent/30 transition-colors">
                <TableCell className="font-mono text-xs uppercase tracking-widest">{t.no_tiket}</TableCell>
                <TableCell className="font-mono uppercase">{t.kendaraan.plat_nomor}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{new Date(t.waktu_masuk).toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{t.waktu_keluar ? new Date(t.waktu_keluar).toLocaleString('id-ID') : '-'}</TableCell>
                <TableCell>{t.durasi_jam ? `${t.durasi_jam} Menit` : '-'}</TableCell>
                <TableCell className="font-semibold">Rp {t.total_biaya?.toLocaleString('id-ID') || '0'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs rounded-lg ${t.status_pembayaran === 'LUNAS' ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'}`}>{t.status_pembayaran}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
