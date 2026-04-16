import prisma from "@/lib/prisma";
import AreaClient from "./AreaClient";

export default async function AdminAreaPage() {
  const areas = await prisma.areaParkir.findMany();
  return <AreaClient data={areas} />;
}
