import { NextResponse, type NextRequest } from "next/server";

// Checagem rápida: sem o cookie de sessão, nem tenta abrir a página.
// A validação de verdade (cookie válido, usuário ativo, papel) fica em lib/auth.ts.
const COOKIE_SESSAO = "agenda_sessao";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = request.cookies.has(COOKIE_SESSAO);

  if (pathname === "/login") return NextResponse.next();

  if (!temSessao) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ erro: "Faça login para continuar." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Tudo, menos arquivos estáticos do Next e o favicon.
  matcher: ["/((?!_next|favicon.ico).*)"],
};
