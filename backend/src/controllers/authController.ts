import type { Request, Response } from 'express';
import { autenticarUsuario, buscarUsuarioPorId } from '../services/authService';
import type { RequestComUsuario } from '../middlewares/autenticar';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || !email.trim() || email.length > 255 ||
        typeof senha !== 'string' || !senha || senha.length > 1024) {
      res.status(400).json({ erro: 'Informe um e-mail e uma senha válidos.' });
      return;
    }
    const resultado = await autenticarUsuario(email, senha);
    if (!resultado) {
      res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
      return;
    }
    res.status(200).json(resultado);
  } catch (erro) {
    console.error('Falha no login:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

export async function perfil(req: RequestComUsuario, res: Response): Promise<void> {
  try {
    const usuario = await buscarUsuarioPorId(req.usuarioId!);
    if (!usuario) { res.status(401).json({ erro: 'Conta não encontrada.' }); return; }
    res.status(200).json({ usuario });
  } catch (erro) {
    console.error('Falha ao consultar perfil:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}
