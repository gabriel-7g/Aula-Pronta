import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';

async function cadastrar(
  nome: string,
  email: string,
  senha: string,
  tipo: 'admin' | 'usuario'
) {
  if (!nome || !email || !senha || senha.length < 8) {
    throw new Error(
      'Preencha os dados no .env. Senha mínima: 8 caracteres.'
    );
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const sql = `
    INSERT INTO usuarios (id, nome, email, senha, tipo)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      nome = excluded.nome,
      senha = excluded.senha,
      tipo = excluded.tipo
  `;

  db.prepare(sql).run(
    randomUUID(),
    nome.trim(),
    email.trim().toLowerCase(),
    senhaHash,
    tipo
  );

  console.log(`Usuário cadastrado: ${email}`);
}

async function main() {
  try {
    await cadastrar(
      process.env.SEED_ADMIN_NAME || '',
      process.env.SEED_ADMIN_EMAIL || '',
      process.env.SEED_ADMIN_PASSWORD || '',
      'admin'
    );

    await cadastrar(
      process.env.SEED_USER_NAME || '',
      process.env.SEED_USER_EMAIL || '',
      process.env.SEED_USER_PASSWORD || '',
      'usuario'
    );

    console.log('Banco local criado com sucesso!');
  } finally {
    db.close();
  }
}

main().catch(console.error);