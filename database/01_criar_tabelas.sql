-- Execute este script no Query Tool do banco lousa_login (PostgreSQL 15+).
-- O banco lousa_login é criado ANTES pelo pgAdmin (veja o guia).
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo VARCHAR(10) NOT NULL DEFAULT 'usuario'
         CHECK (tipo IN ('admin', 'usuario')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_minusculo
    ON usuarios (LOWER(email));

-- A coluna senha guarda o HASH bcrypt, nunca a senha em texto puro.
-- Os dois usuários serão inseridos pelo comando npm run seed do backend.
