"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "@/app/login/actions";
import {
  IconeCalendario,
  IconeCursos,
  IconeLote,
  IconeProfessores,
  IconeSair,
} from "@/app/ui/icones";

const ITENS = [
  { href: "/", texto: "Calendário", Icone: IconeCalendario, admin: false },
  {
    href: "/alocacoes/lote",
    texto: "Alocação em lote",
    Icone: IconeLote,
    admin: true,
  },
  {
    href: "/professores",
    texto: "Professores",
    Icone: IconeProfessores,
    admin: true,
  },
  {
    href: "/cursos",
    texto: "Cursos, UCs e turmas",
    Icone: IconeCursos,
    admin: true,
  },
];

export default function MenuLateral({
  nome,
  papel,
}: {
  nome: string;
  papel: "ADMIN" | "PROFESSOR";
}) {
  const caminho = usePathname();
  const ativo = (href: string) =>
    href === "/" ? caminho === "/" : caminho.startsWith(href);
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primaria text-white">
          <IconeCalendario className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">Agenda de</p>
          <p className="text-sm font-semibold text-gray-900">Professores</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
        {ITENS.filter((i) => !i.admin || papel === "ADMIN").map(
          ({ href, texto, Icone }) => (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                ativo(href)
                  ? "bg-blue-50 text-primaria"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icone />
              {texto}
            </Link>
          ),
        )}
      </nav>

      <div className="hidden items-center gap-3 border-t border-gray-200 px-4 py-4 lg:flex">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
          {iniciais}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-gray-900">{nome}</p>
          <p className="text-xs text-gray-500">
            {papel === "ADMIN" ? "Administrador" : "Professor"}
          </p>
        </div>
        <form action={sair}>
          <button
            type="submit"
            title="Sair"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <IconeSair />
            <span className="sr-only">Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
