"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import toast from "react-hot-toast";
import { Search, Loader2, CreditCard, Banknote, Clock, Tag, Car, Timer, ArrowRight, ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

declare global { interface Window { snap: any; } }

const MAX_SEARCH = 20;

export default function KendaraanKeluarPage() {
  const [param, setParam] = useState("");
  const [transaksi, setTransaksi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"search" | "pay">("search");
  const [areaError, setAreaError] = useState("");
  const [uangTunai, setUangTunai] = useState("");
  const [aktifList, setAktifList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const itemsPerPage = 5;
  const totalPages = Math.ceil(aktifList.length / itemsPerPage);
  const paginatedList = aktifList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    fetch("/api/transaksi/aktif").then(r => r.json()).then(d => {
      if (d.aktif) setAktifList(d.aktif);
    });
  }, []);

  const handleParamChange = (val: string) => {
    setAreaError("");
    const cleanVal = val.replace(/\s/g, "").toUpperCase();
    if (cleanVal.length > MAX_SEARCH) {
      toast.error(`Maksimal ${MAX_SEARCH} karakter`);
      return;
    }
    setParam(cleanVal);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAreaError("");
    if (!param.trim()) return toast.error("Masukkan plat nomor atau nomor tiket");
    if (param.length < 3) return toast.error("Minimal 3 karakter tanpa spasi.");
    setLoading(true); setTransaksi(null);
    try {
      const res = await fetch("/api/transaksi/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ param: param.trim() }) });
      const data = await res.json();
      if (!res.ok) { 
        if (res.status === 403) {
          setAreaError(data.message);
          toast.error("Akses Ditolak: Area Berbeda", { icon: '🚫' });
        } else {
          toast.error(data.message); 
        }
      } else { 
        toast.success("Data ditemukan"); setTransaksi(data.transaksi); setStep("pay"); 
      }
    } catch { toast.error("Gagal terhubung ke server"); }
    finally { setLoading(false); }
  };

  const handlePayMidtrans = () => {
    if (!transaksi?.midtrans_token) { handlePayCash(); return; }
    window.snap.pay(transaksi.midtrans_token, {
      onSuccess: () => { toast.success("Pembayaran berhasil!"); fetch("/api/transaksi/update-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: transaksi.id, status: "LUNAS" }) }).then(() => router.push(`/petugas/struk/${transaksi.id}`)); },
      onPending: () => toast("Menunggu pembayaran..."),
      onError: () => toast.error("Pembayaran gagal"),
      onClose: () => toast.error("Pop-up ditutup"),
    });
  };

  const kembalian = uangTunai ? parseInt(uangTunai) - (transaksi?.total_biaya || 0) : -1;

  const handlePayCash = async () => {
    if (kembalian < 0) {
      toast.error("Uang tunai kurang dari total!");
      return;
    }
    const res = await fetch("/api/transaksi/update-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: transaksi?.id, status: "LUNAS" }) });
    if (res.ok) { toast.success("Pembayaran tunai berhasil!"); router.push(`/petugas/struk/${transaksi?.id}?tunai=${uangTunai}&kembali=${kembalian}`); }
  };

  const handleBack = () => { setStep("search"); setTransaksi(null); setParam(""); setAreaError(""); setUangTunai(""); };

  return (
    <div className="max-w-2xl mx-auto">
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />

      {/* Back Navigation Box */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-4"
      >
        <button
          onClick={() => router.push("/petugas/dashboard")}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Kembali ke Terminal</p>
            <p className="text-[11px] text-muted-foreground">Dashboard petugas</p>
          </div>
        </button>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            KENDARAAN KELUAR
          </div>
          <h1 className="text-2xl font-bold text-foreground">Proses Checkout</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-muted">
            <div className={`w-2 h-2 rounded-full ${step === "search" ? "bg-primary" : "bg-muted-foreground/30"}`} />
            <span className={step === "search" ? "text-foreground" : "text-muted-foreground"}>Cari</span>
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <div className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-muted">
            <div className={`w-2 h-2 rounded-full ${step === "pay" ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
            <span className={step === "pay" ? "text-foreground" : "text-muted-foreground"}>Bayar</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "search" ? (
          /* ══════════════════════════════════════
             STEP 1 — Search by plat / tiket
             ══════════════════════════════════════ */
          <motion.div key="search" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <Card className="glass-card rounded-2xl border-0 shadow-xl overflow-hidden relative">
              {/* Visual red glow border if error */}
              {areaError && (
                <div className="absolute inset-x-0 top-0 h-1 bg-red-500 animate-pulse" />
              )}
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-5">
                  <AnimatePresence>
                    {areaError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, height: "auto", scale: 1 }} 
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 flex items-start gap-3">
                          <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-2 shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Akses Ditolak</h4>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 leading-snug">
                              {areaError}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5 block">Plat Nomor atau Nomor Tiket</label>
                    <Input
                      value={param}
                      onChange={(e) => handleParamChange(e.target.value)}
                      disabled={loading}
                      className={`text-center text-2xl font-bold uppercase h-16 tracking-[0.2em] rounded-2xl bg-muted/40 border-2 transition-colors focus:border-emerald-500 ${areaError ? 'border-red-400 focus:border-red-500 text-red-600' : 'border-transparent text-foreground'}`}
                      autoFocus
                    />
                    <p className="text-[10px] text-muted-foreground text-right mt-1">{param.length}/{MAX_SEARCH}</p>
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={loading || !param.trim()} className="w-full h-14 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                      {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Mencari...</span> : <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Cari Kendaraan</span>}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>

            {/* Tabel Kendaraan Aktif Paginated */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500"/> Kendaraan Aktif di Area Anda</h3>
                <Badge variant="secondary" className="rounded-lg">{aktifList.length} Kendaraan</Badge>
              </div>
              
              <Card className="rounded-2xl border-0 shadow-lg overflow-hidden glass-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] uppercase tracking-wider py-2">Tiket</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider py-2">Plat</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider py-2">Masuk</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-right py-2">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">Bersih! Tidak ada kendaraan aktif.</TableCell></TableRow>
                    ) : paginatedList.map(t => (
                      <TableRow key={t.id} className="hover:bg-accent/20">
                        <TableCell className="font-mono text-xs font-bold py-2">{t.no_tiket}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-primary py-2">{t.kendaraan.plat_nomor}</TableCell>
                        <TableCell className="text-xs py-2">{new Date(t.waktu_masuk).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</TableCell>
                        <TableCell className="text-right py-2">
                          <Button size="sm" className="h-7 text-[10px] rounded-lg px-3 bg-slate-900 border-none font-bold tracking-wider hover:bg-slate-700 text-white" onClick={() => {
                            setParam(t.kendaraan.plat_nomor);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>Pilih</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-4 py-2 border-t flex items-center justify-between bg-card text-xs">
                    <span className="text-muted-foreground font-semibold">Halaman {page} dari {totalPages}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-accent" disabled={page === 1} onClick={() => setPage(page-1)}><ChevronLeft className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-accent" disabled={page === totalPages} onClick={() => setPage(page+1)}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>

        ) : transaksi && (

          /* ══════════════════════════════════════
             STEP 2 — Invoice & Payment
             ══════════════════════════════════════ */
          <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-4">

            {/* Invoice Card */}
            <Card className="rounded-2xl border-0 bg-[#0f172a] text-white overflow-hidden shadow-xl">
              <CardContent className="p-0">
                {/* Top: Plat + Jenis */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Plat Nomor</p>
                      <p className="text-2xl font-mono font-extrabold tracking-[0.2em] mt-1">{transaksi.kendaraan.plat_nomor}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-slate-300">
                      {transaksi.kendaraan.jenis_kendaraan}
                    </div>
                  </div>
                </div>

                {/* Middle: Details grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  <InfoCell icon={<Tag className="w-3.5 h-3.5" />} label="No Tiket" value={transaksi.no_tiket} mono />
                  <InfoCell icon={<Car className="w-3.5 h-3.5" />} label="Jenis" value={transaksi.kendaraan.jenis_kendaraan} />
                  <InfoCell icon={<Clock className="w-3.5 h-3.5" />} label="Masuk" value={new Date(transaksi.waktu_masuk).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} />
                  <InfoCell icon={<Clock className="w-3.5 h-3.5" />} label="Keluar" value={new Date(transaksi.waktu_keluar).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} />
                </div>

                {/* Duration bar */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Timer className="w-4 h-4" />
                    <span className="text-xs">Durasi Parkir</span>
                  </div>
                  <span className="text-lg font-bold">{transaksi.durasi_jam} Jam</span>
                </div>

                {/* Total — hero */}
                <div className="px-6 py-5 bg-emerald-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-100">TOTAL BAYAR</span>
                    <span className="text-3xl font-extrabold">Rp {transaksi.total_biaya?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Input */}
            <div className="bg-muted p-4 rounded-2xl border mb-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-2">Penerimaan Uang Tunai (Rp)</label>
              <Input
                type="number"
                value={uangTunai}
                onChange={(e) => setUangTunai(e.target.value)}
                placeholder="Masukkan jumlah uang..."
                className="h-12 text-lg font-bold"
              />
              {uangTunai && kembalian >= 0 && (
                <div className="mt-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl flex justify-between font-bold text-sm border border-emerald-200 dark:border-emerald-800">
                  <span>Kembalian:</span>
                  <span>Rp {kembalian.toLocaleString('id-ID')}</span>
                </div>
              )}
              {uangTunai && kembalian < 0 && (
                <div className="mt-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-xl font-bold text-sm border border-red-200 dark:border-red-800">
                  Uang tunai kurang Rp {Math.abs(kembalian).toLocaleString('id-ID')}
                </div>
              )}
            </div>

            {/* Payment buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileTap={{ scale: kembalian >= 0 ? 0.97 : 1 }}>
                <Button size="lg" disabled={kembalian < 0} variant="outline" className="w-full h-14 text-base gap-2 rounded-2xl font-semibold bg-emerald-600 hover:bg-emerald-700 hover:text-white text-white border-none shadow-lg outline-none" onClick={handlePayCash}>
                  <Banknote className="w-5 h-5" /> Bayar Tunai
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" className="w-full h-14 text-base gap-2 rounded-2xl border-none font-semibold shadow-lg text-slate-700 bg-white hover:bg-slate-50" onClick={handlePayMidtrans}>
                  <CreditCard className="w-5 h-5" /> QRIS / Online
                </Button>
              </motion.div>
            </div>

            <button
              onClick={handleBack}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Cari Kendaraan Lain</p>
                <p className="text-[11px] text-muted-foreground">Kembali ke pencarian</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCell({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-4 bg-[#0f172a]">
      <div className="flex items-center gap-1.5 text-slate-500 mb-1">{icon}<span className="text-[10px] uppercase tracking-wider">{label}</span></div>
      <p className={`text-sm font-medium ${mono ? "font-mono tracking-widest" : ""}`}>{value}</p>
    </div>
  );
}
