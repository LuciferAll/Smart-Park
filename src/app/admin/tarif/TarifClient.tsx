"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/motion";

const MAX_TARIF = 9;

type JenisOption = { id: string; nama: string };

function lc(val: string, max: number, setter: (v: string) => void, label: string) {
  if (val.length > max) { toast.error(`${label} maksimal ${max} digit`); return; }
  setter(val);
}

export default function TarifClient({ data, jenisOptions }: { data: any[]; jenisOptions: JenisOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const defaultJenis = jenisOptions.length > 0 ? jenisOptions[0].nama : "";
  const [form, setForm] = useState({ id: "", jenis_kendaraan: defaultJenis, tarif_per_jam: "" });
  const [isEdit, setIsEdit] = useState(false);

  const openAdd = () => { setForm({ id: "", jenis_kendaraan: defaultJenis, tarif_per_jam: "" }); setIsEdit(false); setOpen(true); };
  const openEdit = (t: any) => { setForm({ id: t.id, jenis_kendaraan: t.jenis_kendaraan, tarif_per_jam: String(t.tarif_per_jam) }); setIsEdit(true); setOpen(true); };

  const handleSave = async () => {
    if (!form.tarif_per_jam) { toast.error("Semua field wajib diisi"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tarif", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: isEdit ? form.id : undefined, jenis_kendaraan: form.jenis_kendaraan, tarif_per_jam: Number(form.tarif_per_jam) }) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); setOpen(false); router.refresh(); }
    } catch { toast.error("Gagal terhubung"); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus tarif ini?")) return;
    try {
      const res = await fetch("/api/admin/tarif", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); router.refresh(); }
    } catch { toast.error("Gagal terhubung"); }
  };

  const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><DollarSign className="w-6 h-6 text-primary" /> Master Tarif</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfigurasi harga parkir per jam (simulasi berjalan 1 menit nyata = 1 jam aplikasi)</p>
        </div>
        <Button className="gradient-indigo rounded-xl text-white border-none shadow-lg shadow-primary/20" onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Tambah Tarif</Button>
      </motion.div>

      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider">Jenis</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Tarif Perjam</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && <TableRow><TableCell colSpan={3}><EmptyState icon={<DollarSign className="w-6 h-6" />} title="Belum ada tarif" description="Tambahkan tarif untuk mulai menghitung biaya" /></TableCell></TableRow>}
            {data.map((t: any) => (
              <TableRow key={t.id} className="hover:bg-accent/30 transition-colors">
                <TableCell className="font-medium">{t.jenis_kendaraan}</TableCell>
                <TableCell>{fmtRp(t.tarif_per_jam)} / Jam</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{isEdit ? "Edit Tarif" : "Tambah Tarif Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Jenis Kendaraan</Label>
              <Select value={form.jenis_kendaraan} onValueChange={val => setForm({ ...form, jenis_kendaraan: val || defaultJenis })} disabled={isEdit}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Pilih jenis..." /></SelectTrigger>
                <SelectContent>
                  {jenisOptions.map(j => (
                    <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Tarif Per Jam (Rp)</Label><Input type="number" value={form.tarif_per_jam} onChange={e => lc(e.target.value, MAX_TARIF, v => setForm({...form, tarif_per_jam: v}), "Tarif")} className="rounded-xl h-11" /><p className="text-[10px] text-muted-foreground text-right">{form.tarif_per_jam.length}/{MAX_TARIF}</p></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Batal</Button><Button className="gradient-indigo rounded-xl text-white border-none" onClick={handleSave} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
