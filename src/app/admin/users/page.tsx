import prisma from "@/lib/prisma";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const [users, areas] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { area: true } }),
    prisma.areaParkir.findMany({ orderBy: { nama_area: "asc" } }),
  ]);
  return <UsersClient data={JSON.parse(JSON.stringify(users))} areas={JSON.parse(JSON.stringify(areas))} />;
}
