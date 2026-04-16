import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/admin", "/petugas", "/owner"];
const publicRoutes = ["/login", "/"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Ambil dan decrypt token dari cookie
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  // Jika mencoba akses route terlarang dan belum login -> lempar ke login
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Jika BUKA halaman publik TAPI sudah login -> lempar ke dashboardnya
  if (isPublicRoute && session?.id) {
    return NextResponse.redirect(new URL(`/${session.role.toLowerCase()}/dashboard`, req.nextUrl));
  }

  // Role Based Routing
  if (session?.id) {
    if (path.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${session.role.toLowerCase()}/dashboard`, req.nextUrl));
    }
    if (path.startsWith("/owner") && session.role !== "OWNER") {
      return NextResponse.redirect(new URL(`/${session.role.toLowerCase()}/dashboard`, req.nextUrl));
    }
    if (path.startsWith("/petugas") && session.role !== "PETUGAS" && session.role !== "ADMIN") {
      // Admin punya privilese mengakses routes petugas jika perlu
      return NextResponse.redirect(new URL(`/${session.role.toLowerCase()}/dashboard`, req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Konfigurasikan route mana yang ingin di observe Middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
