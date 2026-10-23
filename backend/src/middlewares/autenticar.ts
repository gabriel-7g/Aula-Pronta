import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface RequestComUsuario extends Request { usuarioId?: string }

export function autenticar(req: RequestComUsuario, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;
  const [esquema, token] = authorization?.split(' ') || [];
  if (esquema !== 'Bearer' || !token) {
    res.status(401).json({ erro: 'Token não informado ou malformado.' });
    return;
  }
  try {
    const dados = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    if (typeof dados === 'string' || typeof dados.sub !== 'string') {
      res.status(401).json({ erro: 'Token inválido.' });
      return;
    }
    req.usuarioId = dados.sub;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}
