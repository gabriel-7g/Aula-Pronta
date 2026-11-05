
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const pastaDados = resolve(__dirname, '../data');

mkdirSync(pastaDados, { recursive: true });

export const caminhoBanco = join(
  pastaDados,
  'lousa.sqlite'
);

export const db = new DatabaseSync(caminhoBanco);

db.exec('PRAGMA foreign_keys = ON');

// Executa primeiro o SQL dos usuários.
const sqlUsuarios = readFileSync(
  resolve(__dirname, '../../database/01_criar_tabelas.sql'),
  'utf8'
);

db.exec(sqlUsuarios);

// Depois cria a tabela de planejamentos.
const sqlPlanejamentos = readFileSync(
  resolve(__dirname, '../../database/03_criar_planejamentos.sql'),
  'utf8'
);

db.exec(sqlPlanejamentos);

console.log('Banco SQLite conectado!');
console.log('Tabelas de usuários e planejamentos verificadas!');
