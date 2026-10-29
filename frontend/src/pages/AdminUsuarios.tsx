
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  obterPerfil,
  obterSessao,
  sair
} from '../services/auth';

import type { Usuario } from '../services/auth';

import './Auth.css';
import './AdminUsuarios.css';

type UsuarioLista = Usuario & {
  criado_em: string;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

async function chamarApi(
  caminho: string,
  opcoes: RequestInit = {}
) {
  const sessao = obterSessao();

  if (!sessao) {
    throw new Error('Faça login novamente.');
  }

  const resposta = await fetch(
    `${API_URL}${caminho}`,
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

  if (resposta.status === 204) {
    return null;
  }

  const dados = await resposta
    .json()
    .catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      dados.erro || 'Erro ao comunicar com o servidor.'
    );
  }

  return dados;
}

export default function AdminUsuarios() {
  const router = useIonRouter();

  const [admin, setAdmin] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const perfil = await obterPerfil();

        if (!ativo) return;

        if (perfil.tipo !== 'admin') {
          router.push('/planejamentos', 'root', 'replace');
          return;
        }

        setAdmin(perfil);

        const dados = await chamarApi('/api/usuarios');

        if (ativo) {
          setUsuarios(dados.usuarios);
        }
      } catch (e) {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar os usuários.'
          );
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [router]);

  async function cadastrar(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErro('');
    setSucesso('');
    setSalvando(true);

    try {
      const dados = await chamarApi('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          email,
          senha
        })
      });

      setUsuarios(anteriores =>
        [...anteriores, dados.usuario].sort(
          (a, b) => a.nome.localeCompare(b.nome)
        )
      );

      setNome('');
      setEmail('');
      setSenha('');

      setSucesso('Professor cadastrado com sucesso!');
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível cadastrar.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(usuario: UsuarioLista) {
    const confirmou = window.confirm(
      `Excluir o professor ${usuario.nome}?`
    );

    if (!confirmou) return;

    setErro('');
    setSucesso('');

    try {
      await chamarApi(
        `/api/usuarios/${encodeURIComponent(usuario.id)}`,
        { method: 'DELETE' }
      );

      setUsuarios(anteriores =>
        anteriores.filter(item => item.id !== usuario.id)
      );

      setSucesso('Professor excluído com sucesso.');
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível excluir.'
      );
    }
  }

  function logout() {
    sair();
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-auth">
        <div className="pagina-auth">
          <main className="auth-container admin-container">

            <div className="admin-topo">
              <div className="auth-marca">
                <span className="auth-marca-simbolo" />
                Lousa
              </div>

              <button
                type="button"
                className="admin-sair"
                onClick={logout}
              >
                Sair
              </button>
            </div>

            <section className="auth-card admin-card">
              <span
                className="auth-fita"
                aria-hidden="true"
              />

              <div className="admin-cabecalho">
                <span className="auth-etiqueta">
                  área administrativa
                </span>

                <h1>Gerenciar usuários</h1>

                <p>
                  {admin
                    ? `Olá, ${admin.nome}. Cadastre e acompanhe os professores.`
                    : 'Validando seu acesso...'}
                </p>
              </div>

              {erro && (
                <p className="admin-feedback admin-erro" role="alert">
                  {erro}
                </p>
              )}

              {sucesso && (
                <p className="admin-feedback admin-sucesso" role="status">
                  {sucesso}
                </p>
              )}

              {admin && (
                <>
                  <form
                    onSubmit={cadastrar}
                    className="admin-secao admin-formulario"
                  >
                    <h2>Cadastrar professor</h2>

                    <div className="admin-campos">
                      <div className="auth-campo">
                        <label htmlFor="novo-nome">Nome</label>
                        <input
                          id="novo-nome"
                          value={nome}
                          maxLength={120}
                          minLength={2}
                          required
                          placeholder="Nome completo"
                          onChange={e => setNome(e.target.value)}
                        />
                      </div>

                      <div className="auth-campo">
                        <label htmlFor="novo-email">E-mail</label>
                        <input
                          id="novo-email"
                          type="email"
                          value={email}
                          maxLength={255}
                          required
                          placeholder="professor@email.com"
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="auth-campo">
                        <label htmlFor="nova-senha">Senha inicial</label>
                        <input
                          id="nova-senha"
                          type="password"
                          value={senha}
                          minLength={8}
                          required
                          autoComplete="new-password"
                          placeholder="Mínimo de 8 caracteres"
                          onChange={e => setSenha(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="auth-botao-principal"
                      disabled={salvando}
                    >
                      {salvando
                        ? 'Cadastrando...'
                        : 'Cadastrar professor'}
                    </button>
                  </form>

                  <div className="admin-secao">
                    <h2>
                      Usuários cadastrados ({usuarios.length})
                    </h2>

                    <div className="admin-lista">
                      {usuarios.map(usuario => (
                        <div
                          className="admin-usuario"
                          key={usuario.id}
                        >
                          <div className="admin-dados">
                            <strong>{usuario.nome}</strong>
                            <span>{usuario.email}</span>
                          </div>

                          <span className="admin-tipo">
                            {usuario.tipo === 'admin'
                              ? 'Administrador'
                              : 'Professor'}
                          </span>

                          {usuario.tipo === 'usuario' && (
                            <button
                              type="button"
                              className="admin-excluir"
                              onClick={() => void excluir(usuario)}
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
