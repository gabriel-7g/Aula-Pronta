import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db';

async function cadastrar(nome: string | undefined, email: string | undefined,
  senha: string | undefined, tipo: 'admin' | 'usuario') {
  if (!nome || !email || !senha || Buffer.byteLength(senha, 'utf8') < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
    throw new Error(`Defina SEED_${tipo === 'admin' ? 'ADMIN' : 'USER'}_NAME, _EMAIL e _PASSWORD (senha de 8 a 72 bytes) no .env`);
  }
  const hash = await bcrypt.hash(senha, 12);
  const resultado = await pool.query<{ email: string }>(
    `INSERT INTO usuarios (nome, email, senha, tipo)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, senha = EXCLUDED.senha, tipo = EXCLUDED.tipo
     RETURNING email`,
    [nome.trim(), email.trim().toLowerCase(), hash, tipo]
  );
  console.log(`Conta ${tipo} pronta: ${resultado.rows[0].email}`);
}

async function main() {
  try {
    await cadastrar(process.env.SEED_ADMIN_NAME, process.env.SEED_ADMIN_EMAIL,
      process.env.SEED_ADMIN_PASSWORD, 'admin');
    await cadastrar(process.env.SEED_USER_NAME, process.env.SEED_USER_EMAIL,
      process.env.SEED_USER_PASSWORD, 'usuario');
    console.log('Cadastros concluídos. Teste o login pelo navegador.');
  } catch (erro) {
    console.error('Não foi possível criar os usuários:', erro);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
void main();
