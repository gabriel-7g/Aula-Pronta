// Este arquivo faz a ligação entre o formulário (React) e a API (Express).
export type TipoUsuario = 'admin' | 'usuario';
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
}
interface Sessao { token: string; usuario: Usuario }
interface ResultadoLogin {
  sucesso: boolean;
  mensagem?: string;
  usuario?: Usuario;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SESSAO_KEY = 'lousaSessao';

export const emailValido = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function obterSessao(): Sessao | null {
  const dados = sessionStorage.getItem(SESSAO_KEY);
  if (!dados) return null;
  try {
    const sessao = JSON.parse(dados) as Sessao;
    if (!sessao?.token || !sessao.usuario?.id || !sessao.usuario?.email ||
        !['admin', 'usuario'].includes(sessao.usuario.tipo)) {
      sessionStorage.removeItem(SESSAO_KEY);
      return null;
    }
    return sessao;
  } catch {
    sessionStorage.removeItem(SESSAO_KEY);
    return null;
  }
}

export function sair() {
  sessionStorage.removeItem(SESSAO_KEY);
}

export async function fazerLogin(email: string, senha: string): Promise<ResultadoLogin> {
  const emailNormalizado = email.trim().toLowerCase();
  if (!emailNormalizado) return { sucesso: false, mensagem: 'Informe seu e-mail.' };
  if (!emailValido(emailNormalizado)) return { sucesso: false, mensagem: 'Informe um e-mail válido.' };
  if (!senha) return { sucesso: false, mensagem: 'Informe sua senha.' };
  try {
    const resposta = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailNormalizado, senha })
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      return { sucesso: false, mensagem: dados?.erro || 'E-mail ou senha inválidos.' };
    }
    if (!dados?.token || !dados?.usuario?.id || !dados.usuario?.nome ||
        !['admin', 'usuario'].includes(dados.usuario.tipo)) {
      return { sucesso: false, mensagem: 'Resposta inválida do servidor.' };
    }
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify({ token: dados.token, usuario: dados.usuario }));
    return { sucesso: true, usuario: dados.usuario };
  } catch {
    return { sucesso: false, mensagem: 'Não foi possível conectar ao servidor.' };
  }
}

export async function obterPerfil(): Promise<Usuario> {
  const sessao = obterSessao();
  if (!sessao) throw new Error('Você não está autenticado.');
  const resposta = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${sessao.token}` }
  });
  if (!resposta.ok) {
    if (resposta.status === 401) sair();
    throw new Error('Não foi possível validar sua sessão.');
  }
  const dados = await resposta.json();
  return dados.usuario as Usuario;
}
