
import { obterSessao, sair } from './auth';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface DadosPlanejamento {
  titulo: string;
  disciplina: string;
  turma: string;
  objetivo: string;
  conteudo: string;
  metodologia: string;
  duracao_minutos: number;
  data_aula: string;
}

export interface Planejamento extends DadosPlanejamento {
  id: string;
  usuario_id: string;
  criado_em: string;
}

async function requisitar<T>(
  caminho: string,
  opcoes: RequestInit = {}
): Promise<T> {
  const sessao = obterSessao();

  if (!sessao) {
    throw new Error('Faça login para continuar.');
  }

  const resposta = await fetch(
    `${API_URL}/api/planejamentos${caminho}`,
    {
      ...opcoes,
      headers: {
        Authorization: `Bearer ${sessao.token}`,
        ...(opcoes.body
          ? { 'Content-Type': 'application/json' }
          : {})
      }
    }
  );

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    if (resposta.status === 401) {
      sair();
    }

    throw new Error(
      dados.erro || 'Não foi possível concluir a operação.'
    );
  }

  return dados as T;
}

export async function listarPlanejamentos() {
  const resultado = await requisitar<{
    planejamentos: Planejamento[];
  }>('/');

  return resultado.planejamentos;
}

export async function criarPlanejamento(
  dados: DadosPlanejamento
) {
  return requisitar<{ planejamento: Planejamento }>(
    '/',
    {
      method: 'POST',
      body: JSON.stringify(dados)
    }
  );
}

export async function editarPlanejamento(
  id: string,
  dados: DadosPlanejamento
) {
  return requisitar<{ planejamento: Planejamento }>(
    `/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(dados)
    }
  );
}

export async function excluirPlanejamento(id: string) {
  return requisitar<{ mensagem: string }>(
    `/${encodeURIComponent(id)}`,
    {
      method: 'DELETE'
    }
  );
}
