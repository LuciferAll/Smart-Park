"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { CheckCircle2, ArrowRight, RotateCcw, ArrowLeft, Car, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const MAX_PLAT = 15;

type JenisKendaraan = { id: string; nama: string };

export default function KendaraanMasukPage() {
  const [platNomor, setPlatNomor] = useState("");
  const [jenis, setJenis] = useState("");
  const [jenisOptions, setJenisOptions] = useState<JenisKendaraan[]>([]);
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [lastTicket, setLastTicket] = useState<any>(null);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch jenis kendaraan dari master data
  useEffect(() => {
    fetch("/api/admin/kendaraan")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJenisOptions(data);
          if (data.length > 0 && !jenis) setJenis(data[0].nama);
        }
      })
      .catch(() => {});
  }, []);

  const handlePlatChange = (val: string) => {
    setDuplicateError(""); // clear duplicate error when typing
    if (val.length > MAX_PLAT) {
      toast.error(`Plat nomor maksimal ${MAX_PLAT} karakter`);
      return;
    }
    setPlatNomor(val.toUpperCase());
  };

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError("");
    if (!platNomor.trim()) { toast.error("Plat nomor wajib diisi"); return; }
    if (!jenis) { toast.error("Pilih jenis kendaraan"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/transaksi/masuk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plat_nomor: platNomor.trim(), jenis }) });
      const data = await res.json();
      if (!res.ok) { 
        if (res.status === 409 || data.code === "DUPLICATE_PLAT") {
          setDuplicateError(data.message);
          toast.error(data.message, { 
            icon: '⚠️', 
            duration: 5000,
            style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' } 
          });
        } else {
          toast.error(data.message); 
        }
      } else { 
        toast.success("Tiket berhasil diterbitkan!"); 
        setLastTicket(data.transaksi); 
        setPlatNomor(""); 
      }
    } catch { toast.error("Gagal terhubung ke server"); }
    finally { setLoading(false); }
  };

  const handleReset = () => { setLastTicket(null); setPlatNomor(""); setDuplicateError(""); };

  // Dynamic columns based on count
  const colsClass = jenisOptions.length <= 3 ? "grid-cols-3" : jenisOptions.length <= 5 ? "grid-cols-5" : "grid-cols-4";

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-lg">

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

        <AnimatePresence mode="wait">
          {!lastTicket ? (
            <motion.div key="input" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.3 }}>

              <div className="text-center mb-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
                  KENDARAAN MASUK
                </motion.div>
                <h1 className="text-3xl font-bold text-foreground">Catat Kendaraan Baru</h1>
                <p className="text-sm text-muted-foreground mt-2 font-mono">{now.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>

              <Card className="glass-card rounded-2xl border-0 shadow-xl overflow-hidden relative">
                {/* Visual red glow border if error */}
                {duplicateError && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-red-500 animate-pulse" />
                )}
                
                <form onSubmit={handleMasuk}>
                  <CardContent className="p-6 space-y-5">
                    
                    <AnimatePresence>
                      {duplicateError && (
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
                              <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Peringatan Duplikasi!</h4>
                              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 leading-snug">
                                {duplicateError}
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setDuplicateError("")}
                                className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-700 mt-2 hover:underline"
                              >
                                Abaikan & Ketik Ulang
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Plat Input */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5 block">Plat Nomor</label>
                      <Input
                        value={platNomor}
                        onChange={(e) => handlePlatChange(e.target.value)}
                        className={`text-center text-3xl font-extrabold uppercase h-20 tracking-[0.3em] rounded-2xl bg-muted/40 border-2 transition-colors focus:border-primary ${duplicateError ? 'border-red-400 focus:border-red-500 text-red-600' : 'border-transparent text-foreground'}`}
                        disabled={loading}
                        autoFocus
                      />
                      <p className="text-[10px] text-muted-foreground text-right mt-1">{platNomor.length}/{MAX_PLAT}</p>
                    </div>

                    {/* Jenis — dynamic pill selector from master data */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2 block">Jenis Kendaraan</label>
                      {jenisOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada jenis kendaraan. Hubungi admin.</p>
                      ) : (
                        <div className={`grid ${colsClass} gap-2`}>
                          {jenisOptions.map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setJenis(opt.nama)}
                              className={`py-3 rounded-xl text-sm font-medium transition-all ${jenis === opt.nama ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                            >
                              <Car className="w-4 h-4 mx-auto mb-1" />
                              {opt.nama}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button size="lg" className="w-full h-14 rounded-2xl text-base font-bold bg-[#0f172a] hover:bg-[#1e293b] text-white border-none" type="submit" disabled={loading || !platNomor.trim() || !jenis}>
                        {loading ? (
                          <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</span>
                        ) : (
                          <span className="flex items-center gap-2">Simpan & Cetak Tiket <ArrowRight className="w-4 h-4" /></span>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </form>
              </Card>
            </motion.div>

          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20, stiffness: 300 }}>
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", damping: 15 }} className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Tiket Diterbitkan</h2>
                <p className="text-sm text-muted-foreground">Kendaraan berhasil dicatat masuk</p>
              </div>

              <Card className="mt-8 rounded-2xl border-0 bg-[#0f172a] text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center border-b border-white/10 pb-4 mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Nomor Tiket</p>
                    <p className="text-2xl font-mono font-bold tracking-[0.2em] mt-1">{lastTicket.no_tiket}</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Waktu Masuk</span><span className="font-medium">{new Date(lastTicket.waktu_masuk).toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold">AKTIF</span></div>
                  </div>
                </CardContent>
              </Card>

              <motion.div whileTap={{ scale: 0.98 }} className="mt-6">
                <Button size="lg" className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Input Kendaraan Lagi
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
