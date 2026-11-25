import { TAMANHO_MINIMO_SENHA } from "@/lib/senha";

type Professor = { nome: string; email: string | null; cor: string; ativo: boolean };
/** Login do professor, quando existe. */
type Acesso = { ativo: boolean } | null;

export default function CamposProfessor({ professor, acesso }: { professor?: Professor; acesso?: Acesso }) {
  const temLogin = Boolean(acesso);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-[2fr_2fr_auto] sm:items-end">
        <label className="rotulo">
          Nome
          <input name="nome" required defaultValue={professor?.nome} className="campo" />
        </label>
        <label className="rotulo">
          E-mail <span className="ajuda">{temLogin ? "(usado para entrar)" : "(obrigatório para liberar o acesso)"}</span>
          <input
            name="email"
            type="email"
            required={temLogin}
            autoComplete="off"
            defaultValue={professor?.email ?? ""}
            className="campo"
          />
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

      <fieldset className="rounded-lg border border-gray-200 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">Acesso ao sistema</legend>
        <p className="mb-3 text-sm text-gray-500">
          {temLogin
            ? "O professor entra com o e-mail acima e só visualiza as agendas. Preencha a senha apenas para trocá-la."
            : `Defina uma senha inicial para o professor entrar com o e-mail acima (mínimo de ${TAMANHO_MINIMO_SENHA} caracteres). Deixe em branco para cadastrar sem acesso.`}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rotulo">
            {temLogin ? "Nova senha" : "Senha inicial"}
            <input
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={TAMANHO_MINIMO_SENHA}
              className="campo"
            />
          </label>
          <label className="rotulo">
            Confirmar senha
            <input
              name="confirmarSenha"
              type="password"
              autoComplete="new-password"
              minLength={TAMANHO_MINIMO_SENHA}
              className="campo"
            />
          </label>
        </div>
        {acesso && (
          <label className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <input name="acesso" type="checkbox" defaultChecked={acesso.ativo} className="h-4 w-4" />
            Acesso liberado (desmarque para bloquear o login sem apagar o professor)
          </label>
        )}
      </fieldset>
    </div>
  );
}
