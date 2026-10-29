
import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

import { db } from '../db';
import { autenticar } from '../middlewares/autenticar';
import type { RequestComUsuario } from '../middlewares/autenticar';

const rotas = Router();

rotas.use(autenticar);

// Verifica no banco se o usuário é administrador.
rotas.use((
  req: RequestComUsuario,
  res: Response,
  next: NextFunction
) => {
  const atual = db.prepare(
    'SELECT tipo FROM usuarios WHERE id = ?'
  ).get(req.usuarioId!) as
    { tipo: string } | undefined;

  if (!atual) {
    res.status(401).json({ erro: 'Sessão inválida.' });
    return;
  }

  if (atual.tipo !== 'admin') {
    res.status(403).json({
      erro: 'Acesso exclusivo do administrador.'
    });
    return;
  }

  next();
});

// LISTAR USUÁRIOS
rotas.get('/', (_req, res) => {
  const usuarios = db.prepare(`
    SELECT id, nome, email, tipo, criado_em
    FROM usuarios
    ORDER BY nome COLLATE NOCASE
  `).all();

  res.json({ usuarios });
});

// CADASTRAR PROFESSOR
rotas.post('/', async (req, res) => {
  const { nome, email, senha } = req.body ?? {};

  if (
    typeof nome !== 'string' ||
    nome.trim().length < 2 ||
    nome.trim().length > 120 ||
    typeof email !== 'string' ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof senha !== 'string' ||
    Buffer.byteLength(senha, 'utf8') < 8 ||
    Buffer.byteLength(senha, 'utf8') > 72
  ) {
    res.status(400).json({
      erro: 'Informe nome, e-mail válido e senha de 8 a 72 bytes.'
    });
    return;
  }

  const emailNormalizado = email.trim().toLowerCase();

  const existente = db.prepare(
    'SELECT id FROM usuarios WHERE lower(email) = ?'
  ).get(emailNormalizado);

  if (existente) {
    res.status(409).json({
      erro: 'Este e-mail já está cadastrado.'
    });
    return;
  }

  try {
    const id = randomUUID();
    const hash = await bcrypt.hash(senha, 12);

    db.prepare(`
      INSERT INTO usuarios (id, nome, email, senha, tipo)
      VALUES (?, ?, ?, ?, 'usuario')
    `).run(id, nome.trim(), emailNormalizado, hash);

    const usuario = db.prepare(`
      SELECT id, nome, email, tipo, criado_em
      FROM usuarios
      WHERE id = ?
    `).get(id);

    res.status(201).json({ usuario });
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).json({
      erro: 'Não foi possível cadastrar o usuário.'
    });
  }
});

// EXCLUIR PROFESSOR
rotas.delete('/:id', (req: RequestComUsuario, res) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    res.status(400).json({ erro: 'ID inválido.' });
    return;
  }

  if (req.usuarioId === id) {
    res.status(400).json({
      erro: 'Você não pode excluir sua própria conta.'
    });
    return;
  }

  const usuario = db.prepare(
    'SELECT tipo FROM usuarios WHERE id = ?'
  ).get(id) as { tipo: string } | undefined;

  if (!usuario) {
    res.status(404).json({
      erro: 'Usuário não encontrado.'
    });
    return;
  }

  if (usuario.tipo === 'admin') {
    res.status(403).json({
      erro: 'Não é permitido excluir administradores.'
    });
    return;
  }

  db.prepare(
    'DELETE FROM usuarios WHERE id = ?'
  ).run(id);

  res.sendStatus(204);
});

export default rotas;
