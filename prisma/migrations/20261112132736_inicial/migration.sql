-- CreateTable
CREATE TABLE "Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#0f6cbd',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UC" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cargaHoraria" INTEGER,
    "cursoId" INTEGER NOT NULL,
    CONSTRAINT "UC_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "cursoId" INTEGER NOT NULL,
    CONSTRAINT "Turma_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SerieAlocacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "professorId" INTEGER NOT NULL,
    "ucId" INTEGER NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataFim" TEXT NOT NULL,
    "diasSemana" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SerieAlocacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SerieAlocacao_ucId_fkey" FOREIGN KEY ("ucId") REFERENCES "UC" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SerieAlocacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alocacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "professorId" INTEGER NOT NULL,
    "ucId" INTEGER NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME NOT NULL,
    "serieId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alocacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alocacao_ucId_fkey" FOREIGN KEY ("ucId") REFERENCES "UC" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alocacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alocacao_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "SerieAlocacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");

-- CreateIndex
CREATE INDEX "Alocacao_inicio_idx" ON "Alocacao"("inicio");

-- CreateIndex
CREATE INDEX "Alocacao_professorId_inicio_idx" ON "Alocacao"("professorId", "inicio");
