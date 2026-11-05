
import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

import { db } from '../db';
import { autenticar } from '../middlewares/autenticar';
import type { RequestComUsuario } from '../middlewares/autenticar';

const rotas = Router();

interface DadosPlanejamento {
  titulo: string;
  disciplina: string;
  turma: string;
  objetivo: string;
  conteudo: string;
  metodologia: string;
  duracao_minutos: number;
  data_aula: string;
}

// Valida os dados enviados pelo frontend.
function validarDados(
  dados: unknown
): dados is DadosPlanejamento {
  if (
    !dados ||
    typeof dados !== 'object' ||
    Array.isArray(dados)
  ) {
    return false;
  }

  const entrada = dados as Record<string, unknown>;

  const campos: Record<string, number> = {
    titulo: 150,
    disciplina: 100,
    turma: 100,
    objetivo: 3000,
    conteudo: 5000,
    metodologia: 5000
  };

  for (const [campo, limite] of Object.entries(campos)) {
    const valor = entrada[campo];

    if (
      typeof valor !== 'string' ||
      !valor.trim() ||
      valor.length > limite
    ) {
      return false;
    }
  }

  const duracao = entrada.duracao_minutos;
  const dataAula = entrada.data_aula;

  if (
    typeof duracao !== 'number' ||
    !Number.isInteger(duracao) ||
    duracao < 1 ||
    duracao > 600
  ) {
    return false;
  }

  if (
    typeof dataAula !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dataAula)
  ) {
    return false;
  }

  const [ano, mes, dia] = dataAula.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

// Todas as rotas exigem autenticação JWT.
rotas.use(autenticar);

// Confirma se o usuário autenticado existe.
rotas.use((
  req: RequestComUsuario,
  res: Response,
  next: NextFunction
) => {
  const usuario = db.prepare(
    'SELECT id FROM usuarios WHERE id = ?'
  ).get(req.usuarioId!);

  if (!usuario) {
    res.status(401).json({
      erro: 'Usuário não encontrado. Faça login novamente.'
    });
    return;
  }

  next();
});

// LISTAR PLANEJAMENTOS
rotas.get('/', (req: RequestComUsuario, res) => {
  const planejamentos = db.prepare(`
    SELECT *
    FROM planejamentos
    WHERE usuario_id = ?
    ORDER BY data_aula DESC, criado_em DESC
  `).all(req.usuarioId!);

  res.json({ planejamentos });
});

// CONSULTAR PLANEJAMENTO
rotas.get('/:id', (req: RequestComUsuario, res) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    res.status(400).json({
      erro: 'ID do planejamento inválido.'
    });
    return;
  }

  const planejamento = db.prepare(`
    SELECT *
    FROM planejamentos
    WHERE id = ? AND usuario_id = ?
  `).get(id, req.usuarioId!);

  if (!planejamento) {
    res.status(404).json({
      erro: 'Planejamento não encontrado.'
    });
    return;
  }

  res.json({ planejamento });
});

// CRIAR PLANEJAMENTO
rotas.post('/', (req: RequestComUsuario, res) => {
  if (!validarDados(req.body)) {
    res.status(400).json({
      erro: 'Dados inválidos. Preencha todos os campos corretamente.'
    });
    return;
  }

  const dados = req.body as DadosPlanejamento;
  const id = randomUUID();

  db.prepare(`
    INSERT INTO planejamentos (
      id,
      usuario_id,
      titulo,
      disciplina,
      turma,
      objetivo,
      conteudo,
      metodologia,
      duracao_minutos,
      data_aula
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.usuarioId!,
    dados.titulo.trim(),
    dados.disciplina.trim(),
    dados.turma.trim(),
    dados.objetivo.trim(),
    dados.conteudo.trim(),
    dados.metodologia.trim(),
    dados.duracao_minutos,
    dados.data_aula
  );

  const planejamento = db.prepare(`
    SELECT *
    FROM planejamentos
    WHERE id = ? AND usuario_id = ?
  `).get(id, req.usuarioId!);

  res.status(201).json({
    mensagem: 'Planejamento criado com sucesso.',
    planejamento
  });
});

// EDITAR PLANEJAMENTO
rotas.put('/:id', (req: RequestComUsuario, res) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    res.status(400).json({
      erro: 'ID do planejamento inválido.'
    });
    return;
  }

  if (!validarDados(req.body)) {
    res.status(400).json({
      erro: 'Dados inválidos. Preencha todos os campos corretamente.'
    });
    return;
  }

  const dados = req.body as DadosPlanejamento;

  const resultado = db.prepare(`
    UPDATE planejamentos
    SET
      titulo = ?,
      disciplina = ?,
      turma = ?,
      objetivo = ?,
      conteudo = ?,
      metodologia = ?,
      duracao_minutos = ?,
      data_aula = ?
    WHERE id = ? AND usuario_id = ?
  `).run(
    dados.titulo.trim(),
    dados.disciplina.trim(),
    dados.turma.trim(),
    dados.objetivo.trim(),
    dados.conteudo.trim(),
    dados.metodologia.trim(),
    dados.duracao_minutos,
    dados.data_aula,
    id,
    req.usuarioId!
  );

  if (resultado.changes === 0) {
    res.status(404).json({
      erro: 'Planejamento não encontrado.'
    });
    return;
  }

  const planejamento = db.prepare(`
    SELECT *
    FROM planejamentos
    WHERE id = ? AND usuario_id = ?
  `).get(id, req.usuarioId!);

  res.json({
    mensagem: 'Planejamento atualizado com sucesso.',
    planejamento
  });
});

// EXCLUIR PLANEJAMENTO
rotas.delete('/:id', (req: RequestComUsuario, res) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    res.status(400).json({
      erro: 'ID do planejamento inválido.'
    });
    return;
  }

  const resultado = db.prepare(`
    DELETE FROM planejamentos
    WHERE id = ? AND usuario_id = ?
  `).run(id, req.usuarioId!);

  if (resultado.changes === 0) {
    res.status(404).json({
      erro: 'Planejamento não encontrado.'
    });
    return;
  }

  res.json({
    mensagem: 'Planejamento excluído com sucesso.'
  });
});

export default rotas;
