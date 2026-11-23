import type { Metadata } from "next";
import FormularioLogin from "./formulario";
import { IconeCalendario } from "@/app/ui/icones";

export const metadata: Metadata = { title: "Entrar · Agenda de Professores" };

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria text-white shadow-sm">
            <IconeCalendario className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Agenda de Professores</h1>
            <p className="text-sm text-gray-500">Entre com seu e-mail e senha</p>
          </div>
        </div>
        <div className="cartao">
          <FormularioLogin />
        </div>
      </div>
    </main>
  );
}
