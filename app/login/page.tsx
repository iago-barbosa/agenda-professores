import type { Metadata } from "next";
import FormularioLogin from "./formulario";

export const metadata: Metadata = { title: "Entrar · Agenda de Professores" };

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Agenda de Professores</h1>
        <p className="mb-6 text-sm opacity-80">Entre com seu e-mail e senha.</p>
        <FormularioLogin />
      </div>
    </main>
  );
}
