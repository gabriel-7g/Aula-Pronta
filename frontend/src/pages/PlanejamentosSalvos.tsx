
import { useEffect, useMemo, useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';

import { obterPerfil, sair } from '../services/auth';
import type { Usuario } from '../services/auth';

import { listarPlanejamentos, excluirPlanejamento } from '../services/planejamentos';
import type { Planejamento } from '../services/planejamentos';
import { exportarPDF } from '../services/exportarPDF';

import './Auth.css';
import './Planejamentos.css';
import './PlanejamentosSalvos.css';

// Ignora diferenças de acentuação e letras maiúsculas.
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export default function PlanejamentosSalvos() {
  const router = useIonRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [busca, setBusca] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Carrega os dados do usuário e as aulas cadastradas.
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const perfil = await obterPerfil();
        const lista = await listarPlanejamentos();

        if (!ativo) return;
        setUsuario(perfil);
        setPlanejamentos(lista);
      } catch (e) {
        if (ativo) {
          setErro(e instanceof Error ? e.message : 'Não foi possível carregar suas aulas.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => { ativo = false; };
  }, []);

  // Organiza as disciplinas sem repetições.
  const disciplinas = useMemo(() =>
    [...new Set(planejamentos.map(p => p.disciplina))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [planejamentos]
  );

  // Filtra as aulas pelo texto pesquisado e pela disciplina selecionada.
  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim());

    return planejamentos.filter(p => {
      const correspondeBusca = !termo ||
        [p.titulo, p.disciplina, p.turma].some(
          campo => normalizar(campo).includes(termo)
        );

      const correspondeDisciplina = !disciplina ||
        normalizar(p.disciplina) === normalizar(disciplina);

      return correspondeBusca && correspondeDisciplina;
    });
  }, [planejamentos, busca, disciplina]);

  function limparFiltros() {
    setBusca('');
    setDisciplina('');
  }

  function novaAula() {
    router.push('/planejamentos', 'root', 'push');
  }

  function editar(p: Planejamento) {
    router.push(
      `/planejamentos?editar=${encodeURIComponent(p.id)}`,
      'forward',
      'push'
    );
  }

  // Exclui uma aula após confirmação.
  async function excluir(p: Planejamento) {
    if (excluindoId || !window.confirm(`Deseja realmente excluir a aula "${p.titulo}"?`)) {
      return;
    }

    setErro('');
    setSucesso('');
    setExcluindoId(p.id);

    try {
      await excluirPlanejamento(p.id);
      setPlanejamentos(anteriores => anteriores.filter(aula => aula.id !== p.id));
      setSucesso('Aula excluída com sucesso!');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível excluir a aula.');
    } finally {
      setExcluindoId(null);
    }
  }

  // Exporta a aula selecionada em PDF.
  function baixarPDF(p: Planejamento) {
    setErro('');
    setSucesso('');

    try {
      exportarPDF(p, usuario?.nome);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível gerar o PDF.');
    }
  }

  function logout() {
    sair();
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-auth">
        <div className="pagina-auth pl-pagina pl-salvos">
          <main className="pl-container">

            {/* CABEÇALHO */}
            <header className="pl-topo">
              <div className="auth-marca">
                <span className="auth-marca-simbolo" aria-hidden="true" />
                Lousa
              </div>

              <div className="pl-navegacao">
                <button type="button" className="pl-botao-secundario" onClick={novaAula}>
                  + Nova aula
                </button>
                <button type="button" className="pl-botao-secundario" onClick={logout}>
                  Sair
                </button>
              </div>
            </header>

            <section className="auth-card pl-card">
              <span className="auth-fita" aria-hidden="true" />

              <div className="pl-cabecalho">
                <span className="auth-etiqueta">organização pedagógica</span>
                <h1>Minhas aulas salvas</h1>
                <p>Consulte, pesquise e gerencie seus planejamentos.</p>
              </div>

              {/* MENSAGENS */}
              {erro && <div className="pl-feedback pl-erro" role="alert">{erro}</div>}
              {sucesso && <div className="pl-feedback pl-sucesso" role="status">{sucesso}</div>}
              {carregando && <p>Carregando aulas...</p>}

              {!carregando && usuario && (
                <>
                  {/* PESQUISA E FILTROS */}
                  <section className="pl-secao-filtros">
                    <h2>Pesquisar aulas</h2>

                    <div className="pl-filtros">
                      <div className="pl-campo">
                        <label htmlFor="busca-aulas">Pesquisar</label>
                        <input
                          id="busca-aulas"
                          type="search"
                          placeholder="Título, disciplina ou turma..."
                          value={busca}
                          onChange={e => setBusca(e.target.value)}
                        />
                      </div>

                      <div className="pl-campo">
                        <label htmlFor="filtro-disciplina">Disciplina</label>
                        <select
                          id="filtro-disciplina"
                          value={disciplina}
                          onChange={e => setDisciplina(e.target.value)}
                        >
                          <option value="">Todas as disciplinas</option>
                          {disciplinas.map(nome => (
                            <option key={nome} value={nome}>{nome}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pl-filtros-rodape">
                      <p>Exibindo {resultados.length} de {planejamentos.length} aulas</p>
                      {(busca || disciplina) && (
                        <button type="button" className="pl-botao-secundario" onClick={limparFiltros}>
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </section>

                  {/* AULAS CADASTRADAS */}
                  <section className="pl-secao">
                    <h2>Planejamentos encontrados ({resultados.length})</h2>

                    {planejamentos.length === 0 ? (
                      <div className="pl-vazio">
                        <p>Você ainda não cadastrou nenhuma aula.</p>
                        <button type="button" className="pl-botao-principal" onClick={novaAula}>
                          Criar primeira aula
                        </button>
                      </div>
                    ) : resultados.length === 0 ? (
                      <div className="pl-vazio">
                        <p>Nenhuma aula encontrada.</p>
                        <button type="button" className="pl-botao-secundario" onClick={limparFiltros}>
                          Mostrar todas
                        </button>
                      </div>
                    ) : (
                      <div className="pl-lista">
                        {resultados.map(p => (
                          <article className="pl-item" key={p.id}>
                            <div className="pl-item-topo">
                              <div>
                                <h3>{p.titulo}</h3>
                                <p>{p.disciplina} {' • '} {p.turma}</p>
                              </div>

                              <span className="pl-data">
                                {p.data_aula.split('-').reverse().join('/')}
                              </span>
                            </div>

                            <p><strong>Duração:</strong> {p.duracao_minutos} minutos</p>
                            <p><strong>Objetivo:</strong> {p.objetivo}</p>
                            <p><strong>Conteúdo:</strong> {p.conteudo}</p>
                            <p><strong>Metodologia:</strong> {p.metodologia}</p>

                            {/* AÇÕES DO PLANEJAMENTO */}
                            <div className="pl-acoes">
                              <button
                                type="button"
                                className="pl-botao-secundario"
                                onClick={() => editar(p)}
                              >
                                Editar aula
                              </button>

                              <button
                                type="button"
                                className="pl-botao-pdf"
                                onClick={() => baixarPDF(p)}
                              >
                                Exportar PDF
                              </button>

                              <button
                                type="button"
                                className="pl-botao-excluir"
                                disabled={excluindoId !== null}
                                onClick={() => void excluir(p)}
                              >
                                {excluindoId === p.id ? 'Excluindo...' : 'Excluir'}
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
              Planejamentos mais simples. Aulas mais organizadas.
            </p>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
