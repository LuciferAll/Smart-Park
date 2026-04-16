"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2, Users, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/motion";

const LIMITS = { name: 50, username: 30, password: 50, search: 50 };

function limitedChange(val: string, max: number, setter: (v: string) => void, label: string) {
  if (val.length > max) { toast.error(`${label} maksimal ${max} karakter`); return; }
  setter(val);
}

type AreaParkir = { id: string; nama_area: string };

export default function UsersClient({ data, areas }: { data: any[]; areas: AreaParkir[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "PETUGAS", id_area: "" });

  const filtered = data.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.password) { toast.error("Semua field wajib diisi"); return; }
    if (form.role === "PETUGAS" && !form.id_area) { toast.error("Area parkir wajib dipilih untuk petugas"); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        id_area: form.role === "PETUGAS" ? form.id_area : null,
      };
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); setForm({ name: "", username: "", password: "", role: "PETUGAS", id_area: "" }); setOpen(false); router.refresh(); }
    } catch { toast.error("Gagal terhubung ke server"); }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin hapus user "${name}"?`)) return;
    try {
      const res = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const text = await res.text(); const json = text ? JSON.parse(text) : {};
      if (!res.ok) { toast.error(json.message || "Gagal"); } else { toast.success(json.message || "Berhasil"); router.refresh(); }
    } catch { toast.error("Gagal terhubung"); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Manajemen User</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola akun petugas, admin, dan owner</p>
        </div>
        <Button className="gradient-indigo rounded-xl text-white border-none shadow-lg shadow-primary/20" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Tambah User
        </Button>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => limitedChange(e.target.value, LIMITS.search, setSearch, "Pencarian")} className="pl-10 rounded-xl h-11 bg-card border-border" />
      </div>

      <Card className="glass-card rounded-2xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider">Nama</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Username</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Area Parkir</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Terdaftar</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6}><EmptyState icon={<Users className="w-6 h-6" />} title="Tidak ada user" description="Belum ada user atau tidak cocok dengan pencarian" /></TableCell></TableRow>
            )}
            {filtered.map((u: any) => (
              <TableRow key={u.id} className="hover:bg-accent/30 transition-colors">
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{u.username}</TableCell>
                <TableCell><RoleBadge role={u.role} /></TableCell>
                <TableCell>
                  {u.area ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      <MapPin className="w-3 h-3 text-primary" />
                      {u.area.nama_area}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.id, u.name)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>Tambah User Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label><Input value={form.name} onChange={e => limitedChange(e.target.value, LIMITS.name, v => setForm({...form, name: v}), "Nama")} className="rounded-xl h-11" /><p className="text-[10px] text-muted-foreground text-right">{form.name.length}/{LIMITS.name}</p></div>
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label><Input value={form.username} onChange={e => limitedChange(e.target.value, LIMITS.username, v => setForm({...form, username: v}), "Username")} className="rounded-xl h-11" /><p className="text-[10px] text-muted-foreground text-right">{form.username.length}/{LIMITS.username}</p></div>
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label><Input type="password" value={form.password} onChange={e => limitedChange(e.target.value, LIMITS.password, v => setForm({...form, password: v}), "Password")} className="rounded-xl h-11" /><p className="text-[10px] text-muted-foreground text-right">{form.password.length}/{LIMITS.password}</p></div>
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
              <Select value={form.role} onValueChange={val => setForm({ ...form, role: val || "PETUGAS", id_area: val !== "PETUGAS" ? "" : form.id_area })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="PETUGAS">Petugas</SelectItem><SelectItem value="OWNER">Owner</SelectItem></SelectContent>
              </Select>
            </div>

            {/* Area Parkir dropdown — hanya tampil jika role = PETUGAS */}
            {form.role === "PETUGAS" && (
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Area Parkir <span className="text-destructive">*</span>
                </Label>
                <Select value={form.id_area} onValueChange={val => setForm({ ...form, id_area: val || "" })}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Pilih area parkir..." /></SelectTrigger>
                  <SelectContent>
                    {areas.length === 0 ? (
                      <SelectItem value="_none" disabled>Belum ada area parkir</SelectItem>
                    ) : (
                      areas.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nama_area}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Kendaraan yang diinput petugas ini akan otomatis masuk ke area ini</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Batal</Button>
            <Button className="gradient-indigo rounded-xl text-white border-none" onClick={handleCreate} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const s: Record<string, string> = { ADMIN: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30", OWNER: "text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950/30", PETUGAS: "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30" };
  return <Badge variant="outline" className={`text-xs rounded-lg ${s[role] || ""}`}>{role}</Badge>;
}
