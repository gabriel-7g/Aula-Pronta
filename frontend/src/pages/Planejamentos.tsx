
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { useLocation } from 'react-router-dom';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';

import { obterPerfil, sair } from '../services/auth';
import type { Usuario } from '../services/auth';

import {
  listarPlanejamentos,
  criarPlanejamento,
  editarPlanejamento
} from '../services/planejamentos';

import type {
  DadosPlanejamento
} from '../services/planejamentos';

import './Auth.css';
import './Planejamentos.css';

function formularioVazio(): DadosPlanejamento {
  return {
    titulo: '',
    disciplina: '',
    turma: '',
    objetivo: '',
    conteudo: '',
    metodologia: '',
    duracao_minutos: 50,
    data_aula: ''
  };
}

export default function Planejamentos() {
  const router = useIonRouter();
  const location = useLocation();

  // Se a URL tiver ?editar=ID, abre o formulário em modo edição.
  const editarId = new URLSearchParams(location.search).get('editar');

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [formulario, setFormulario] =
    useState<DadosPlanejamento>(formularioVazio());

  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState('');

  // Valida o login e, se necessário, carrega a aula para edição.
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro('');

      try {
        const perfil = await obterPerfil();
        if (!ativo) return;

        setUsuario(perfil);

        if (editarId) {
          const lista = await listarPlanejamentos();
          if (!ativo) return;

          const planejamento = lista.find(p => p.id === editarId);

          if (!planejamento) {
            setErro(
              'Planejamento não encontrado ou sem permissão para editar.'
            );
            setEditandoId(null);
            setFormulario(formularioVazio());
            return;
          }

          setEditandoId(planejamento.id);

          setFormulario({
            titulo: planejamento.titulo,
            disciplina: planejamento.disciplina,
            turma: planejamento.turma,
            objetivo: planejamento.objetivo,
            conteudo: planejamento.conteudo,
            metodologia: planejamento.metodologia,
            duracao_minutos: planejamento.duracao_minutos,
            data_aula: planejamento.data_aula
          });
        } else {
          setEditandoId(null);
          setFormulario(formularioVazio());
        }
      } catch (e) {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar o formulário.'
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [editarId]);

  function atualizarCampo<K extends keyof DadosPlanejamento>(
    campo: K,
    valor: DadosPlanejamento[K]
  ) {
    setFormulario(anterior => ({
      ...anterior,
      [campo]: valor
    }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (salvando) return;

    setErro('');
    setSalvando(true);

    try {
      if (editandoId) {
        await editarPlanejamento(editandoId, formulario);
      } else {
        await criarPlanejamento(formulario);
      }

      // Depois de salvar, abre a página de aulas cadastradas.
      router.push('/planejamentos/salvos', 'root', 'replace');
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível salvar a aula.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    if (editandoId) {
      router.push('/planejamentos/salvos', 'root', 'replace');
    } else {
      setFormulario(formularioVazio());
    }
  }

  function logout() {
    sair();
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-auth">
        <div className="pagina-auth pl-pagina">
          <main className="pl-container">

            <header className="pl-topo">
              <div className="auth-marca">
                <span
                  className="auth-marca-simbolo"
                  aria-hidden="true"
                />
                Lousa
              </div>

              <div className="pl-navegacao">
                {usuario?.tipo === 'admin' && (
                  <button
                    type="button"
                    className="pl-botao-secundario"
                    onClick={() =>
                      router.push(
                        '/admin/usuarios',
                        'root',
                        'replace'
                      )
                    }
                  >
                    Gerenciar usuários
                  </button>
                )}

                <button
                  type="button"
                  className="pl-botao-secundario"
                  onClick={() =>
                    router.push(
                      '/planejamentos/salvos',
                      'forward',
                      'push'
                    )
                  }
                >
                  Ver aulas salvas
                </button>

                <button
                  type="button"
                  className="pl-botao-secundario"
                  onClick={logout}
                >
                  Sair
                </button>
              </div>
            </header>

            <section className="auth-card pl-card">
              <span className="auth-fita" aria-hidden="true" />

              <div className="pl-cabecalho">
                <span className="auth-etiqueta">
                  organização pedagógica
                </span>

                <h1>
                  {editandoId
                    ? 'Editar planejamento'
                    : 'Criar planejamento'}
                </h1>

                <p>
                  {usuario
                    ? `Olá, ${usuario.nome}! Organize sua próxima aula.`
                    : 'Validando sua sessão...'}
                </p>
              </div>

              {erro && (
                <div className="pl-feedback pl-erro" role="alert">
                  {erro}
                </div>
              )}

              {carregando ? (
                <p>Carregando formulário...</p>
              ) : usuario && !(editarId && !editandoId) ? (
                <form
                  className="pl-formulario"
                  onSubmit={salvar}
                >
                  <h2>
                    {editandoId
                      ? 'Dados da aula'
                      : 'Novo planejamento de aula'}
                  </h2>

                  <div className="pl-campos">

                    <div className="pl-campo">
                      <label htmlFor="pl-titulo">
                        Título da aula
                      </label>

                      <input
                        id="pl-titulo"
                        required
                        maxLength={150}
                        placeholder="Ex.: Introdução à Fotossíntese"
                        value={formulario.titulo}
                        onChange={e =>
                          atualizarCampo('titulo', e.target.value)
                        }
                      />
                    </div>

                    <div className="pl-campo">
                      <label htmlFor="pl-disciplina">
                        Disciplina
                      </label>

                      <input
                        id="pl-disciplina"
                        required
                        maxLength={100}
                        placeholder="Ex.: Ciências"
                        value={formulario.disciplina}
                        onChange={e =>
                          atualizarCampo('disciplina', e.target.value)
                        }
                      />
                    </div>

                    <div className="pl-campo">
                      <label htmlFor="pl-turma">
                        Turma
                      </label>

                      <input
                        id="pl-turma"
                        required
                        maxLength={100}
                        placeholder="Ex.: 7º ano"
                        value={formulario.turma}
                        onChange={e =>
                          atualizarCampo('turma', e.target.value)
                        }
                      />
                    </div>

                    <div className="pl-campo">
                      <label htmlFor="pl-data">
                        Data da aula
                      </label>

                      <input
                        id="pl-data"
                        type="date"
                        required
                        value={formulario.data_aula}
                        onChange={e =>
                          atualizarCampo('data_aula', e.target.value)
                        }
                      />
                    </div>

                    <div className="pl-campo">
                      <label htmlFor="pl-duracao">
                        Duração (minutos)
                      </label>

                      <input
                        id="pl-duracao"
                        type="number"
                        min={1}
                        max={600}
                        required
                        value={formulario.duracao_minutos}
                        onChange={e =>
                          atualizarCampo(
                            'duracao_minutos',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="pl-campo pl-campo-inteiro">
                      <label htmlFor="pl-objetivo">
                        Objetivo da aula
                      </label>

                      <textarea
                        id="pl-objetivo"
                        required
                        maxLength={3000}
                        rows={3}
                        placeholder="O que os alunos deverão aprender?"
                        value={formulario.objetivo}
                        onChange={e =>
                          atualizarCampo('objetivo', e.target.value)
                        }
                      />
                    </div>

                    <div className="pl-campo pl-campo-inteiro">
                      <label htmlFor="pl-conteudo">
                        Conteúdo
                      </label>

                      <textarea
                        id="pl-conteudo"
                        required
                        maxLength={5000}
                        rows={4}
                        placeholder="Descreva os assuntos trabalhados."
                        value={formulario.conteudo}
                        onChange={e =>
                          atualizarCampo('conteudo', e.target.value)
                        }
                      />
                    </div>

                    <div className="pl-campo pl-campo-inteiro">
                      <label htmlFor="pl-metodologia">
                        Metodologia
                      </label>

                      <textarea
                        id="pl-metodologia"
                        required
                        maxLength={5000}
                        rows={4}
                        placeholder="Como a aula será desenvolvida?"
                        value={formulario.metodologia}
                        onChange={e =>
                          atualizarCampo('metodologia', e.target.value)
                        }
                      />
                    </div>

                  </div>

                  <div className="pl-acoes">
                    <button
                      type="submit"
                      className="pl-botao-principal"
                      disabled={salvando}
                    >
                      {salvando
                        ? 'Salvando...'
                        : editandoId
                          ? 'Salvar alterações'
                          : 'Cadastrar planejamento'}
                    </button>

                    <button
                      type="button"
                      className="pl-botao-secundario"
                      onClick={cancelar}
                      disabled={salvando}
                    >
                      {editandoId
                        ? 'Cancelar edição'
                        : 'Limpar formulário'}
                    </button>
                  </div>
                </form>
              ) : null}

            </section>

            <p className="auth-rodape">
              Planejamentos mais simples. Aulas mais organizadas.
            </p>

          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
