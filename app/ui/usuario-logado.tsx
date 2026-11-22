import { sair } from "@/app/login/actions";
import type { UsuarioAtual } from "@/lib/auth";

const NOME_PAPEL = { ADMIN: "Admin", PROFESSOR: "Professor" } as const;

export default function UsuarioLogado({ usuario }: { usuario: UsuarioAtual }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>
        {usuario.nome} <span className="opacity-70">({NOME_PAPEL[usuario.papel]})</span>
      </span>
      <form action={sair}>
        <button type="submit" className="rounded border px-2 py-1 hover:bg-black/5">
          Sair
        </button>
      </form>
    </div>
  );
}
