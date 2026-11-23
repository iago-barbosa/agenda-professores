import { campo, rotulo } from "@/app/ui/estilos";

type Professor = { nome: string; email: string | null; cor: string; ativo: boolean };

export default function CamposProfessor({ professor }: { professor?: Professor }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className={rotulo}>
        Nome
        <input name="nome" required defaultValue={professor?.nome} className={campo} />
      </label>
      <label className={rotulo}>
        E-mail (opcional)
        <input name="email" type="email" defaultValue={professor?.email ?? ""} className={campo} />
      </label>
      <label className={rotulo}>
        Cor no calendário
        <input name="cor" type="color" defaultValue={professor?.cor ?? "#0f6cbd"} className="h-8 w-16" />
      </label>
      {professor && (
        <label className="flex items-center gap-2 pb-1 text-sm">
          <input name="ativo" type="checkbox" defaultChecked={professor.ativo} />
          Ativo
        </label>
      )}
    </div>
  );
}
