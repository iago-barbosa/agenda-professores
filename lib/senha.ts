import bcrypt from "bcryptjs";

// bcryptjs é JavaScript puro: não precisa compilar nada no Windows.
const CUSTO = 12;

export function gerarHashSenha(senha: string) {
  return bcrypt.hash(senha, CUSTO);
}

export function conferirSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export const TAMANHO_MINIMO_SENHA = 8;
