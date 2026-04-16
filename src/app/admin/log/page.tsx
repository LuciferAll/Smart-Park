import prisma from "@/lib/prisma";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default async function AdminLogPage() {
  const logs = await prisma.logAktivitas.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
    include: { user: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Activity className="w-6 h-6 text-primary" /> Log Aktivitas</h1>
        <p className="text-sm text-muted-foreground mt-1">100 aktivitas terakhir di dalam sistem</p>
      </div>

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
            {logs.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-12">Belum ada aktivitas tercatat</TableCell></TableRow>
            )}
            {logs.map((log: any) => (
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
