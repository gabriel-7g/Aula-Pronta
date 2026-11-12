
import { jsPDF } from 'jspdf';
import type { Planejamento } from './planejamentos';

// Formata datas no padrão brasileiro.
function formatarData(data: string): string {
  const partes = data.slice(0, 10).split('-');

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Remove caracteres inválidos do nome do arquivo.
function nomeArquivoSeguro(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'aula';
}

// Gera um PDF com todos os dados do planejamento.
export function exportarPDF(
  planejamento: Planejamento,
  nomeProfessor?: string
): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();

  const margem = 18;
  const larguraTexto = largura - margem * 2;
  const limiteInferior = altura - 23;

  let y = 43;

  // Desenha o cabeçalho em cada página.
  function cabecalho(continuacao = false): void {
    pdf.setFillColor(32, 64, 47);
    pdf.rect(0, 0, largura, 32, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(19);
    pdf.text('AulaPronta', margem, 16);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(
      continuacao
        ? 'Planejamento de aula - continuação'
        : 'Planejamento de aula',
      margem,
      25
    );

    pdf.setTextColor(34, 31, 25);
  }

  // Inicia uma nova página quando necessário.
  function novaPagina(): void {
    pdf.addPage();
    cabecalho(true);
    y = 43;
  }

  function garantirEspaco(espaco: number): void {
    if (y + espaco > limiteInferior) {
      novaPagina();
    }
  }

  // Escreve um campo com título e texto.
  // Os textos longos são divididos automaticamente.
  function escreverCampo(
    titulo: string,
    valor: string
  ): void {
    garantirEspaco(19);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(32, 64, 47);
    pdf.text(titulo, margem, y);

    y += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(34, 31, 25);

    const texto = valor.trim() || 'Não informado';

    const linhas: string[] = pdf.splitTextToSize(
      texto,
      larguraTexto
    );

    // Cada linha verifica se ainda cabe na página.
    for (const linha of linhas) {
      garantirEspaco(6);

      pdf.text(linha || ' ', margem, y);
      y += 5.5;
    }

    y += 7;
  }

  cabecalho();

  escreverCampo(
    'Título da aula',
    planejamento.titulo
  );

  if (nomeProfessor) {
    escreverCampo('Professor(a)', nomeProfessor);
  }

  escreverCampo(
    'Disciplina',
    planejamento.disciplina
  );

  escreverCampo(
    'Turma',
    planejamento.turma
  );

  escreverCampo(
    'Data da aula',
    formatarData(planejamento.data_aula)
  );

  escreverCampo(
    'Duração',
    `${planejamento.duracao_minutos} minutos`
  );

  escreverCampo(
    'Objetivo da aula',
    planejamento.objetivo
  );

  escreverCampo(
    'Conteúdo programático',
    planejamento.conteudo
  );

  escreverCampo(
    'Metodologia',
    planejamento.metodologia
  );

  // Adiciona rodapé e numeração em todas as páginas.
  const totalPaginas = pdf.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    pdf.setPage(pagina);

    pdf.setDrawColor(220, 220, 215);
    pdf.line(
      margem,
      altura - 18,
      largura - margem,
      altura - 18
    );

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(110, 110, 110);

    pdf.text(
      'AulaPronta - Planejamento de aula',
      margem,
      altura - 12
    );

    pdf.text(
      `Página ${pagina} de ${totalPaginas}`,
      largura - margem,
      altura - 12,
      { align: 'right' }
    );
  }

  const nome = nomeArquivoSeguro(planejamento.titulo);

  // Faz o navegador baixar o documento.
  pdf.save(`planejamento-${nome}.pdf`);
}
