import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import usuarioRoutes from './routes/usuarioRoutes';

import { config } from './config';
import { db } from './db';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl
}));
app.use(express.json());

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    erro: 'Muitas tentativas de login.'
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/api/health', (_req, res) => {
  try {
    db.prepare('SELECT 1').get();

    res.json({
      status: 'online',
      banco: 'conectado',
      tipo: 'SQLite local'
    });
  } catch {
    res.status(500).json({
      status: 'erro',
      banco: 'desconectado'
    });
  }
});


app.get('/', (_req, res) => {
  res.status(200).json({
    projeto: 'AulaPronta',
    mensagem: 'Bem-vindo à API do AulaPronta!',
    status: 'online',
    banco: 'SQLite Local'
  });
});


app.listen(config.port, () => {
  console.log(
    `Servidor rodando em http://localhost:${config.port}`
  );
});