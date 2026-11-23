import { campo, rotulo } from "@/app/ui/estilos";
import { NOME_MODALIDADE } from "./modalidades";

export default function CamposCurso({ curso }: { curso?: { nome: string; modalidade: string } }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className={rotulo}>
        Nome do curso
        <input name="nome" required defaultValue={curso?.nome} className={`${campo} w-80`} />
      </label>
      <label className={rotulo}>
        Modalidade
        <select name="modalidade" required defaultValue={curso?.modalidade ?? "TECNICO"} className={campo}>
          {Object.entries(NOME_MODALIDADE).map(([valor, nome]) => (
            <option key={valor} value={valor}>
              {nome}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
