
CREATE TABLE IF NOT EXISTS planejamentos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    disciplina TEXT NOT NULL,
    turma TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    metodologia TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL
        CHECK (duracao_minutos > 0),
    data_aula TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_planejamentos_usuario
ON planejamentos (usuario_id);
