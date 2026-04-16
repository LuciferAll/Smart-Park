import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartPark — Sistem Parkir Modern",
  description: "Aplikasi manajemen parkir SaaS terdepan dengan otomasi tarif, pembayaran digital, dan laporan real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          reverseOrder={true}
          toastOptions={{
            className: "!bg-card !text-card-foreground !border !border-border !shadow-lg !rounded-xl !font-sans text-sm",
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
