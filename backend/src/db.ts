import { Pool } from 'pg';
import { config } from './config';

// Pool = conjunto de conexões reutilizáveis para o PostgreSQL.
export const pool = new Pool({ connectionString: config.databaseUrl });
