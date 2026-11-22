import Link from "next/link";
import type { UsuarioAtual } from "@/lib/auth";
import UsuarioLogado from "@/app/ui/usuario-logado";

const LINKS_ADMIN = [
  { href: "/", texto: "Calendário" },
  { href: "/alocacoes/lote", texto: "Alocação em lote" },
  { href: "/professores", texto: "Professores" },
  { href: "/cursos", texto: "Cursos, UCs e turmas" },
];

export default function Cabecalho({ usuario }: { usuario: UsuarioAtual }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
      <nav className="flex flex-wrap gap-4 text-sm">
        {usuario.papel === "ADMIN" ? (
          LINKS_ADMIN.map((l) => (
            <Link key={l.href} href={l.href} className="text-[#0f6cbd] hover:underline">
              {l.texto}
            </Link>
          ))
        ) : (
          <Link href="/" className="text-[#0f6cbd] hover:underline">
            Calendário
          </Link>
        )}
      </nav>
      <UsuarioLogado usuario={usuario} />
    </header>
  );
}
