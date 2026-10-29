import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { config } from '../config';

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'usuario';
}

interface UsuarioBanco extends UsuarioPublico {
  senha: string;
}

export async function autenticarUsuario(
  email: string,
  senha: string
) {
  const usuario = db.prepare(
    `SELECT id, nome, email, senha, tipo
     FROM usuarios
     WHERE email = ?
     LIMIT 1`
  ).get(email.trim().toLowerCase()) as
    unknown as UsuarioBanco | undefined;

  if (!usuario) return null;

  const senhaCorreta = await bcrypt.compare(
    senha,
    usuario.senha
  );

  if (!senhaCorreta) return null;

  const usuarioPublico: UsuarioPublico = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo
  };

  const token = jwt.sign(
    {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: usuarioPublico
  };
}

export async function buscarUsuarioPorId(
  id: string
): Promise<UsuarioPublico | null> {
  const usuario = db.prepare(
    `SELECT id, nome, email, tipo
     FROM usuarios
     WHERE id = ?
     LIMIT 1`
  ).get(id) as unknown as UsuarioPublico | undefined;

  return usuario || null;
}