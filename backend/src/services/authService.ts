import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { config } from '../config';

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'usuario';
}
interface UsuarioBanco extends UsuarioPublico { senha: string }

export async function autenticarUsuario(email: string, senha: string) {
  const emailNormalizado = email.trim().toLowerCase();

  // $1 é um parâmetro seguro, evitando injeção de SQL.
  const consulta = await pool.query<UsuarioBanco>(
    'SELECT id, nome, email, senha, tipo FROM usuarios WHERE LOWER(email) = $1 LIMIT 1',
    [emailNormalizado]
  );
  const usuario = consulta.rows[0];
  if (!usuario) return null;
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) return null;

  const dadosPublicos: UsuarioPublico = {
    id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo
  };
  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email, tipo: usuario.tipo },
    config.jwtSecret,
    { expiresIn: '8h' }
  );
  return { token, usuario: dadosPublicos };
}

export async function buscarUsuarioPorId(id: string): Promise<UsuarioPublico | null> {
  const consulta = await pool.query<UsuarioPublico>(
    'SELECT id, nome, email, tipo FROM usuarios WHERE id = $1 LIMIT 1',
    [id]
  );
  return consulta.rows[0] || null;
}
