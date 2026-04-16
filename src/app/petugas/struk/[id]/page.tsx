import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Car } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

export default async function CetakStrukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaksi = await prisma.transaksi.findUnique({
    where: { id },
    include: { kendaraan: true, user: true, area: true }
  });

  if (!transaksi || transaksi.status_pembayaran !== "LUNAS") {
    return notFound();
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-black min-h-screen flex flex-col items-center justify-start py-10 print:py-0 print:bg-white">
      <div className="w-full max-w-sm bg-white border-2 border-slate-200 border-dashed p-6 shadow-xl print:shadow-none print:border-none print:p-0 print:m-0">
        <div className="text-center border-b-2 border-slate-200 border-dashed pb-4 mb-4">
          <div className="flex justify-center mb-2">
            <Car className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-slate-900">SmartPark</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">{transaksi.area.nama_area}</p>
        </div>

        <div className="space-y-2 text-sm font-mono mb-4 text-slate-700">
          <div className="flex justify-between">
            <span>NO TIKET</span>
            <span className="font-bold text-slate-950">{transaksi.no_tiket}</span>
          </div>
          <div className="flex justify-between">
            <span>PLAT NOMOR</span>
            <span className="font-bold text-slate-950 uppercase tracking-widest">{transaksi.kendaraan.plat_nomor}</span>
          </div>
          <div className="flex justify-between">
            <span>JENIS</span>
            <span>{transaksi.kendaraan.jenis_kendaraan}</span>
          </div>
          <div className="border-t border-dashed my-2 border-slate-300"></div>
          <div className="flex justify-between">
            <span>MASUK</span>
            <span>{transaksi.waktu_masuk.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>KELUAR</span>
            <span>{transaksi.waktu_keluar?.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>DURASI</span>
            <span>{transaksi.durasi_jam} Jam</span>
          </div>
          <div className="border-t border-dashed my-2 border-slate-300"></div>
          <div className="flex justify-between text-lg font-bold text-slate-950 mt-4">
            <span>TOTAL BIAYA</span>
            <span>Rp {transaksi.total_biaya?.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>STATUS</span>
            <span className="bg-black text-white px-1 ml-2">LUNAS</span>
          </div>
        </div>

        <div className="text-center pt-4 border-t-2 border-slate-200 border-dashed">
          <p className="text-xs font-mono text-slate-600">Simpan struk ini sebagai bukti pembayaran yang sah.</p>
          <p className="text-[10px] font-mono text-slate-400 mt-2">Petugas: {transaksi.user.name}</p>
        </div>
      </div>
      
      <PrintButton />
    </div>
  );
}
