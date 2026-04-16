"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/motion";

const LIMITS = { nama: 50, kapasitas: 5 };
const defaultForm = { id: "", nama_area: "", max_kapasitas: "" };

function lc(val: string, max: number, setter: (v: string) => void, label: string) {
  if (val.length > max) { toast.error(`${label} maksimal ${max} karakter`); return; }
  setter(val);
}

export default function AreaClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isEdit, setIsEdit] = useState(false);

  const openAdd = () => { setForm(defaultForm); setIsEdit(false); setOpen(true); };
  const openEdit = (a: any) => { setForm({ id: a.id, nama_area: a.nama_area, max_kapasitas: String(a.max_kapasitas) }); setIsEdit(true); setOpen(true); };

  const handleSave = async () => {
    if (!form.nama_area || !form.max_kapasitas) { toast.error("Semua field wajib diisi"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/area", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: isEdit ? form.id : undefined, nama_area: form.nama_area, max_kapasitas: Number(form.max_kapasitas) }) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); setOpen(false); router.refresh(); }
    } catch { toast.error("Gagal terhubung"); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus area ini?")) return;
    try {
      const res = await fetch("/api/admin/area", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); router.refresh(); }
    } catch { toast.error("Gagal terhubung"); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> Area Parkir</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola zona dan kapasitas area parkir</p>
        </div>
        <Button className="gradient-indigo rounded-xl text-white border-none shadow-lg shadow-primary/20" onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Tambah Area</Button>
      </motion.div>

      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider">Nama Area</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Kapasitas</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Terisi</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && <TableRow><TableCell colSpan={5}><EmptyState icon={<MapPin className="w-6 h-6" />} title="Belum ada area" description="Tambahkan area parkir untuk memulai" /></TableCell></TableRow>}
            {data.map((a: any) => {
              const terisi = Math.max(a.terisi, 0);
              const pct = a.max_kapasitas > 0 ? Math.round((terisi / a.max_kapasitas) * 100) : 0;
              return (
                <TableRow key={a.id} className="hover:bg-accent/30 transition-colors">
                  <TableCell className="font-medium">{a.nama_area}</TableCell>
                  <TableCell>{a.max_kapasitas} unit</TableCell>
                  <TableCell>{terisi} unit</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{isEdit ? "Edit Area" : "Tambah Area Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Area / Zona</Label><Input value={form.nama_area} onChange={e => lc(e.target.value, LIMITS.nama, v => setForm({...form, nama_area: v}), "Nama area")} className="rounded-xl h-11" /><p className="text-[10px] text-muted-foreground text-right">{form.nama_area.length}/{LIMITS.nama}</p></div>
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Kapasitas Maksimal</Label><Input type="number" value={form.max_kapasitas} onChange={e => lc(e.target.value, LIMITS.kapasitas, v => setForm({...form, max_kapasitas: v}), "Kapasitas")} className="rounded-xl h-11" /><p className="text-[10px] text-muted-foreground text-right">{form.max_kapasitas.length}/{LIMITS.kapasitas}</p></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Batal</Button><Button className="gradient-indigo rounded-xl text-white border-none" onClick={handleSave} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
