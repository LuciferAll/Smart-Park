"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogClient({ logs }: { logs: any[] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (!startDate && !endDate) return true;
    const tDate = new Date(log.timestamp);
    const yyyy = tDate.getFullYear();
    const mm = String(tDate.getMonth() + 1).padStart(2, '0');
    const dd = String(tDate.getDate()).padStart(2, '0');
    const dStr = `${yyyy}-${mm}-${dd}`;

    if (startDate && endDate) return dStr >= startDate && dStr <= endDate;
    if (startDate) return dStr >= startDate;
    if (endDate) return dStr <= endDate;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Activity className="w-6 h-6 text-primary" /> Log Aktivitas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Riwayat aktivitas sistem {startDate || endDate ? 'sesuai filter' : 'keseluruhan'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-card p-2 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"><Filter className="w-3 h-3 inline mr-1" /> Mulai</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm bg-muted/50 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sampai</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm bg-muted/50 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            {(startDate || endDate) && (
              <Button variant="ghost" onClick={() => { setStartDate(""); setEndDate(""); }} className="h-8 px-3 text-xs text-rose-500 hover:bg-rose-50">Reset</Button>
            )}
          </div>
        </div>
      </motion.div>

      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider">Aksi</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Pelaku</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-12">Tidak ada aktivitas pada waktu tersebut</TableCell></TableRow>
            )}
            {filteredLogs.map((log: any) => (
              <TableRow key={log.id} className="hover:bg-accent/30 transition-colors">
                <TableCell className="font-medium">{log.aksi}</TableCell>
                <TableCell className="text-sm">{log.user.name}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs rounded-lg">{log.user.role}</Badge></TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString('id-ID')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
