"use client";

import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function PrintButton() {
  const router = useRouter();
  
  return (
    <div className="flex gap-3 justify-center mt-8 print:hidden">
      <Button variant="outline" onClick={() => router.push("/petugas/dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </Button>
      <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
        <Printer className="w-4 h-4 mr-2" /> Cetak Struk
      </Button>
    </div>
  );
}
