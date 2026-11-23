type Professor = { nome: string; email: string | null; cor: string; ativo: boolean };

export default function CamposProfessor({ professor }: { professor?: Professor }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[2fr_2fr_auto] sm:items-end">
      <label className="rotulo">
        Nome
        <input name="nome" required defaultValue={professor?.nome} className="campo" />
      </label>
      <label className="rotulo">
        E-mail <span className="ajuda">(opcional)</span>
        <input name="email" type="email" defaultValue={professor?.email ?? ""} className="campo" />
      </label>
      <label className="rotulo">
        Cor
        <input
          name="cor"
          type="color"
          defaultValue={professor?.cor ?? "#0f6cbd"}
          className="h-10 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
        />
      </label>
      {professor && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 sm:col-span-3">
          <input name="ativo" type="checkbox" defaultChecked={professor.ativo} className="h-4 w-4" />
          Ativo (aparece no calendário e nos formulários)
        </label>
      )}
    </div>
  );
}
