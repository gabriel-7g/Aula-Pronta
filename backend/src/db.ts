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

const sql = readFileSync(
  resolve(__dirname, '../../database/01_criar_tabelas.sql'),
  'utf8'
);

db.exec(sql);

console.log('Banco SQLite conectado!');