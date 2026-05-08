import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/api/register",
  "/api/convite",
  "/api/auth",
  "/",
  "/login",
  "/register",
  "/convite",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas - sem verificação de auth
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return NextResponse.next();

  // Verificar token Firebase no cookie __session ou no header Authorization
  const token =
    req.cookies.get("__session")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    // Para API routes retorna 401; para páginas redireciona para login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
