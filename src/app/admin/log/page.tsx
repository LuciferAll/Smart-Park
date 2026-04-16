import prisma from "@/lib/prisma";
import { Activity } from "lucide-react";
import LogClient from "./LogClient";

export default async function AdminLogPage() {
  const logs = await prisma.logAktivitas.findMany({
    orderBy: { timestamp: "desc" },
    include: { user: true }
  });

  return <LogClient logs={logs} />;
}
