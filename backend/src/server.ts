import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { pool } from './db';
import authRoutes from './routes/authRoutes';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' }
}));
app.use('/api/auth', authRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'online', banco: 'conectado' });
  } catch {
    res.status(503).json({ status: 'erro', banco: 'desconectado' });
  }
});
app.use((_req, res) => { res.status(404).json({ erro: 'Rota não encontrada.' }); });

const servidor = app.listen(config.port, '127.0.0.1', () => {
  console.log(`API Lousa disponível em http://localhost:${config.port}`);
});

process.on('SIGINT', () => { servidor.close(() => pool.end().finally(() => process.exit(0))); });
