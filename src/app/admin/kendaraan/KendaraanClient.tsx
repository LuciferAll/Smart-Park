"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, Car, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/motion";

const LIMITS = { nama: 30, search: 30 };

function lc(val: string, max: number, setter: (v: string) => void, label: string) {
  if (val.length > max) { toast.error(`${label} maksimal ${max} karakter`); return; }
  setter(val);
}

export default function KendaraanClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id: "", nama: "" });
  const [isEdit, setIsEdit] = useState(false);

  const filtered = data.filter(k =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ id: "", nama: "" }); setIsEdit(false); setOpen(true); };
  const openEdit = (k: any) => {
    setForm({ id: k.id, nama: k.nama });
    setIsEdit(true); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama.trim()) { toast.error("Nama jenis kendaraan wajib diisi"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kendaraan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: isEdit ? form.id : undefined, nama: form.nama.trim() })
      });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); setOpen(false); router.refresh(); }
    } catch { toast.error("Gagal terhubung ke server"); }
    setLoading(false);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Yakin hapus jenis kendaraan "${nama}"?`)) return;
    try {
      const res = await fetch("/api/admin/kendaraan", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); router.refresh(); }
    } catch { toast.error("Gagal terhubung"); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Car className="w-6 h-6 text-primary" /> Jenis Kendaraan</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola master data jenis kendaraan yang tersedia</p>
        </div>
        <Button className="gradient-indigo rounded-xl text-white border-none shadow-lg shadow-primary/20" onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Tambah Jenis</Button>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => lc(e.target.value, LIMITS.search, setSearch, "Pencarian")} className="pl-10 rounded-xl h-11 bg-card border-border" placeholder="Cari jenis kendaraan..." />
      </div>

      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider w-12">#</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Nama Jenis Kendaraan</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Dibuat</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4}><EmptyState icon={<Car className="w-6 h-6" />} title="Tidak ada jenis kendaraan" description="Tambahkan jenis kendaraan baru" /></TableCell></TableRow>
            )}
            {filtered.map((k: any, i: number) => (
              <TableRow key={k.id} className="hover:bg-accent/30 transition-colors">
                <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-semibold text-foreground">{k.nama}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(k.createdAt).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => openEdit(k)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(k.id, k.nama)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{isEdit ? "Edit Jenis Kendaraan" : "Tambah Jenis Kendaraan Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Jenis Kendaraan</Label>
              <Input
                value={form.nama}
                onChange={e => lc(e.target.value, LIMITS.nama, v => setForm({...form, nama: v}), "Nama")}
                className="rounded-xl h-11"
                placeholder="Contoh: Sepeda, Motor, Mobil..."
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground text-right">{form.nama.length}/{LIMITS.nama}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Batal</Button>
            <Button className="gradient-indigo rounded-xl text-white border-none" onClick={handleSave} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
