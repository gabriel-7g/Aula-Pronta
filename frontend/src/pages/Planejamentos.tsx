
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import { obterPerfil, sair } from '../services/auth';
import type { Usuario } from '../services/auth';

import {
  listarPlanejamentos,
  criarPlanejamento,
  editarPlanejamento,
  excluirPlanejamento
} from '../services/planejamentos';

import type {
  Planejamento,
  DadosPlanejamento
} from '../services/planejamentos';

import './Auth.css';
import './Planejamentos.css';

// Retorna os campos vazios para um novo planejamento.
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

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [planejamentos, setPlanejamentos] =
    useState<Planejamento[]>([]);

  const [formulario, setFormulario] =
    useState<DadosPlanejamento>(formularioVazio());

  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Valida o usuário e carrega os planejamentos.
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const perfil = await obterPerfil();

        if (!ativo) return;

        setUsuario(perfil);

        const lista = await listarPlanejamentos();

        if (ativo) {
          setPlanejamentos(lista);
        }
      } catch (e) {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar os planejamentos.'
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  // Atualiza os campos do formulário.
  function atualizarCampo<K extends keyof DadosPlanejamento>(
    campo: K,
    valor: DadosPlanejamento[K]
  ) {
    setFormulario(anterior => ({
      ...anterior,
      [campo]: valor
    }));
  }

  // Cadastra ou atualiza um planejamento.
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (salvando) return;

    setErro('');
    setSucesso('');
    setSalvando(true);

    try {
      if (editandoId) {
        await editarPlanejamento(editandoId, formulario);

        setSucesso('Planejamento atualizado com sucesso!');
      } else {
        await criarPlanejamento(formulario);

        setSucesso('Planejamento cadastrado com sucesso!');
      }

      const lista = await listarPlanejamentos();

      setPlanejamentos(lista);
      setFormulario(formularioVazio());
      setEditandoId(null);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível salvar o planejamento.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // Preenche o formulário com um planejamento existente.
  function prepararEdicao(planejamento: Planejamento) {
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

    setErro('');
    setSucesso('');
  }

  // Cancela a edição e limpa os campos.
  function cancelarEdicao() {
    setEditandoId(null);
    setFormulario(formularioVazio());
    setErro('');
  }

  // Exclui um planejamento após confirmação.
  async function excluir(planejamento: Planejamento) {
    if (salvando) return;

    const confirmou = window.confirm(
      `Deseja excluir o planejamento "${planejamento.titulo}"?`
    );

    if (!confirmou) return;

    setErro('');
    setSucesso('');

    try {
      await excluirPlanejamento(planejamento.id);

      setPlanejamentos(anteriores =>
        anteriores.filter(
          item => item.id !== planejamento.id
        )
      );

      if (editandoId === planejamento.id) {
        cancelarEdicao();
      }

      setSucesso('Planejamento excluído com sucesso!');
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível excluir o planejamento.'
      );
    }
  }

  // Encerra a sessão e retorna ao login.
  function logout() {
    sair();
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-auth">
        <div className="pagina-auth pl-pagina">
          <main className="pl-container">

            {/* CABEÇALHO */}
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
                  onClick={logout}
                >
                  Sair
                </button>
              </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <section className="auth-card pl-card">
              <span
                className="auth-fita"
                aria-hidden="true"
              />

              <div className="pl-cabecalho">
                <span className="auth-etiqueta">
                  organização pedagógica
                </span>

                <h1>Meus planejamentos</h1>

                <p>
                  {usuario
                    ? `Olá, ${usuario.nome}! Organize suas aulas aqui.`
                    : 'Validando sua sessão...'}
                </p>
              </div>

              {/* MENSAGENS */}
              {erro && (
                <div
                  className="pl-feedback pl-erro"
                  role="alert"
                >
                  {erro}
                </div>
              )}

              {sucesso && (
                <div
                  className="pl-feedback pl-sucesso"
                  role="status"
                >
                  {sucesso}
                </div>
              )}

              {carregando && (
                <p>Carregando seus planejamentos...</p>
              )}

              {!carregando && usuario && (
                <>

                  {/* FORMULÁRIO */}
                  <form
                    onSubmit={salvar}
                    className="pl-formulario"
                  >
                    <h2>
                      {editandoId
                        ? 'Editar planejamento'
                        : 'Novo planejamento'}
                    </h2>

                    <div className="pl-campos">

                      {/* TÍTULO */}
                      <div className="pl-campo">
                        <label htmlFor="pl-titulo">
                          Título da aula
                        </label>

                        <input
                          id="pl-titulo"
                          required
                          maxLength={150}
                          value={formulario.titulo}
                          placeholder="Ex.: Introdução à Fotossíntese"
                          onChange={e =>
                            atualizarCampo(
                              'titulo',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* DISCIPLINA */}
                      <div className="pl-campo">
                        <label htmlFor="pl-disciplina">
                          Disciplina
                        </label>

                        <input
                          id="pl-disciplina"
                          required
                          maxLength={100}
                          value={formulario.disciplina}
                          placeholder="Ex.: Ciências"
                          onChange={e =>
                            atualizarCampo(
                              'disciplina',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* TURMA */}
                      <div className="pl-campo">
                        <label htmlFor="pl-turma">
                          Turma
                        </label>

                        <input
                          id="pl-turma"
                          required
                          maxLength={100}
                          value={formulario.turma}
                          placeholder="Ex.: 7º ano"
                          onChange={e =>
                            atualizarCampo(
                              'turma',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* DATA */}
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
                            atualizarCampo(
                              'data_aula',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* DURAÇÃO */}
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

                      {/* OBJETIVO */}
                      <div className="pl-campo pl-campo-inteiro">
                        <label htmlFor="pl-objetivo">
                          Objetivo da aula
                        </label>

                        <textarea
                          id="pl-objetivo"
                          required
                          maxLength={3000}
                          rows={3}
                          value={formulario.objetivo}
                          placeholder="O que os alunos deverão aprender?"
                          onChange={e =>
                            atualizarCampo(
                              'objetivo',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* CONTEÚDO */}
                      <div className="pl-campo pl-campo-inteiro">
                        <label htmlFor="pl-conteudo">
                          Conteúdo
                        </label>

                        <textarea
                          id="pl-conteudo"
                          required
                          maxLength={5000}
                          rows={4}
                          value={formulario.conteudo}
                          placeholder="Descreva os assuntos trabalhados."
                          onChange={e =>
                            atualizarCampo(
                              'conteudo',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* METODOLOGIA */}
                      <div className="pl-campo pl-campo-inteiro">
                        <label htmlFor="pl-metodologia">
                          Metodologia
                        </label>

                        <textarea
                          id="pl-metodologia"
                          required
                          maxLength={5000}
                          rows={4}
                          value={formulario.metodologia}
                          placeholder="Como a aula será desenvolvida?"
                          onChange={e =>
                            atualizarCampo(
                              'metodologia',
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    {/* BOTÕES DO FORMULÁRIO */}
                    <div className="pl-acoes">
                      <button
                        className="pl-botao-principal"
                        type="submit"
                        disabled={salvando}
                      >
                        {salvando
                          ? 'Salvando...'
                          : editandoId
                            ? 'Salvar alterações'
                            : 'Cadastrar planejamento'}
                      </button>

                      {editandoId && (
                        <button
                          type="button"
                          className="pl-botao-secundario"
                          onClick={cancelarEdicao}
                          disabled={salvando}
                        >
                          Cancelar edição
                        </button>
                      )}
                    </div>
                  </form>

                  {/* LISTAGEM DE PLANEJAMENTOS */}
                  <section className="pl-secao">
                    <h2>
                      Planejamentos cadastrados (
                      {planejamentos.length})
                    </h2>

                    {planejamentos.length === 0 ? (
                      <p className="pl-vazio">
                        Nenhum planejamento cadastrado ainda.
                      </p>
                    ) : (
                      <div className="pl-lista">
                        {planejamentos.map(planejamento => (
                          <article
                            className="pl-item"
                            key={planejamento.id}
                          >
                            <div className="pl-item-topo">
                              <div>
                                <h3>
                                  {planejamento.titulo}
                                </h3>

                                <p>
                                  {planejamento.disciplina}
                                  {' • '}
                                  {planejamento.turma}
                                </p>
                              </div>

                              <span className="pl-data">
                                {planejamento.data_aula
                                  .split('-')
                                  .reverse()
                                  .join('/')}
                              </span>
                            </div>

                            <p>
                              <strong>Duração:</strong>{' '}
                              {planejamento.duracao_minutos}
                              {' minutos'}
                            </p>

                            <p>
                              <strong>Objetivo:</strong>{' '}
                              {planejamento.objetivo}
                            </p>

                            <p>
                              <strong>Conteúdo:</strong>{' '}
                              {planejamento.conteudo}
                            </p>

                            <p>
                              <strong>Metodologia:</strong>{' '}
                              {planejamento.metodologia}
                            </p>

                            {/* AÇÕES */}
                            <div className="pl-acoes">
                              <button
                                type="button"
                                className="pl-botao-secundario"
                                disabled={salvando}
                                onClick={() =>
                                  prepararEdicao(planejamento)
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="pl-botao-excluir"
                                disabled={salvando}
                                onClick={() =>
                                  void excluir(planejamento)
                                }
                              >
                                Excluir
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>

                </>
              )}
            </section>

            <p className="auth-rodape">
              Planejamentos mais simples.
              Aulas mais organizadas.
            </p>

          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
