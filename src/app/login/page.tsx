"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Car, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_USERNAME = 30;
  const MAX_PASSWORD = 50;

  const handleUsernameChange = (val: string) => {
    if (val.length > MAX_USERNAME) {
      toast.error(`Username maksimal ${MAX_USERNAME} karakter`);
      return;
    }
    setUsername(val);
  };

  const handlePasswordChange = (val: string) => {
    if (val.length > MAX_PASSWORD) {
      toast.error(`Password maksimal ${MAX_PASSWORD} karakter`);
      return;
    }
    setPassword(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error("Username dan password wajib diisi"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Login gagal"); setLoading(false); return; }
      toast.success(`Selamat datang, ${data.user.name}!`);
      const redirectMap: Record<string, string> = { ADMIN: "/admin/dashboard", PETUGAS: "/petugas/dashboard", OWNER: "/owner/dashboard" };
      setTimeout(() => router.push(redirectMap[data.user.role] || "/"), 1200);
    } catch { toast.error("Kesalahan jaringan"); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#fafafa]">
      {/* ─── Left Panel: Dark Professional Branding ──────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex w-[45%] relative items-center justify-center bg-[#0f172a]"
      >
        {/* Subtle top-right accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-slate-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm px-12 text-white">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">SmartPark</span>
            </div>

            <h1 className="text-3xl font-bold mb-3 leading-tight tracking-tight">
              Sistem Parkir<br />Modern & Efisien
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-10">
              Pencatatan otomatis, perhitungan tarif real-time, dan pembayaran digital dalam satu platform.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 rounded-xl py-3 px-1 flex flex-col justify-center items-center">
                <span className="block text-lg font-bold">24/7</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider whitespace-nowrap mt-0.5">Monitoring</span>
              </div>
              <div className="bg-white/5 rounded-xl py-3 px-1 flex flex-col justify-center items-center">
                <span className="block text-lg font-bold">3</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider whitespace-nowrap mt-0.5">Role Akses</span>
              </div>
              <div className="bg-white/5 rounded-xl py-3 px-1 flex flex-col justify-center items-center">
                <span className="block text-lg font-bold">Auto</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider whitespace-nowrap mt-0.5">Kalkulasi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Right Panel: Login Form ───────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#0f172a]">SmartPark</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Masuk ke akun</h2>
          <p className="text-slate-500 text-sm mb-8">Masukkan kredensial untuk melanjutkan</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Username</Label>
              <Input
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                className="h-11 rounded-xl bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 text-right mt-1">{username.length}/{MAX_USERNAME}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  className="h-11 rounded-xl bg-white border-slate-200 pr-11 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-right mt-1">{password.length}/{MAX_PASSWORD}</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-[#1e293b] text-white transition-colors"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                <span className="flex items-center gap-2">Masuk <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-10">
            SmartPark v2.0 — Sistem Manajemen Parkir
          </p>
        </motion.div>
      </div>
    </div>
  );
}
