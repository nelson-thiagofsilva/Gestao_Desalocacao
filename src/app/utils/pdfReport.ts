import jsPDF from 'jspdf';
import autoTable, { type RowInput, type CellDef } from 'jspdf-autotable';
import { type AreaData, type RawDataRow, type DesalocacaoMensalRow } from './dataParser';

// ─── Cores — espelham o tema do projeto ──────────────────────────────────────
const C = {
  headerBg:    [30,  58,  95]  as [number,number,number], // primary dark blue
  headerText:  [255, 255, 255] as [number,number,number],
  accent:      [59,  130, 246] as [number,number,number], // blue-500
  rowAlt:      [248, 250, 252] as [number,number,number], // slate-50
  totalBg:     [226, 232, 240] as [number,number,number], // slate-200
  border:      [203, 213, 225] as [number,number,number], // slate-300
  white:       [255, 255, 255] as [number,number,number],
  text:        [15,  23,  42]  as [number,number,number], // slate-900
  muted:       [100, 116, 139] as [number,number,number], // slate-500
  lightBg:     [239, 246, 255] as [number,number,number], // blue-50
  red:         [220,  38,  38] as [number,number,number], // red-600
  green:       [22,  163,  74] as [number,number,number], // green-600
  yellow:      [202, 138,   4] as [number,number,number], // yellow-600
  subText:     [71,  85, 105]  as [number,number,number], // slate-600
  sectionBg:   [241, 245, 249] as [number,number,number], // slate-100
};

// ─── Página A4 landscape ─────────────────────────────────────────────────────
const PW = 297, PH = 210, ML = 10, MR = 10, MT_BODY = 18;
const CW = PW - ML - MR; // 277mm

// ─── Formatadores ─────────────────────────────────────────────────────────────
const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number, dec = 2) =>
  `${v.toFixed(dec)}%`;

const hrs = (v: number) => `${Math.round(v)}h`;

const now = () =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());

// ─── Capa ─────────────────────────────────────────────────────────────────────
function drawCover(doc: jsPDF, mes: string, ano: string) {
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PW, PH, 'F');

  // faixa central
  doc.setFillColor(46, 93, 159);
  doc.rect(0, PH * 0.36, PW, PH * 0.3, 'F');

  // linhas accent
  doc.setFillColor(...C.accent);
  doc.rect(0, PH * 0.36, PW, 2, 'F');
  doc.rect(0, PH * 0.66 - 2, PW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...C.white);
  doc.text('Relatório de Gestão Consolidado', PW / 2, PH * 0.555, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(191, 212, 242);
  doc.text('Consolidação Mensal  ·  Consolidação Anual', PW / 2, PH * 0.48, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(148, 184, 224);
  doc.text(`Período de referência: ${mes} / ${ano}`, PW / 2, PH * 0.415, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(`Gerado em ${now()}`, PW / 2, PH - 10, { align: 'center' });
}

// ─── Cabeçalho de página ─────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string, sub: string, page: number) {
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PW, 13, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, 11.5, PW, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text(title, ML, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(sub, PW - MR, 8, { align: 'right' });

  // rodapé
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, PH - 7, PW - MR, PH - 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text(`Página ${page}  ·  Gerado em ${now()}`, PW / 2, PH - 3.5, { align: 'center' });
}

// ─── Barra de KPIs ────────────────────────────────────────────────────────────
function drawKpiBar(doc: jsPDF, items: { label: string; value: string }[], y: number): number {
  const n = items.length;
  const iw = CW / n;
  const bh = 14;

  items.forEach((item, i) => {
    const x = ML + i * iw;
    doc.setFillColor(...C.lightBg);
    doc.roundedRect(x + 0.4, y, iw - 0.8, bh, 1.5, 1.5, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 0.4, y, iw - 0.8, bh, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...C.muted);
    doc.text(item.label.toUpperCase(), x + iw / 2, y + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.headerBg);
    doc.text(item.value, x + iw / 2, y + 10.5, { align: 'center' });
  });

  return y + bh + 3;
}

// ─── Título de seção ──────────────────────────────────────────────────────────
function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...C.sectionBg);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(ML, y, 2.5, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.headerBg);
  doc.text(title, ML + 5, y + 4.8);
  return y + 9;
}

// ─── Estilos base de tabela ───────────────────────────────────────────────────
const BASE_STYLES = {
  styles: {
    fontSize: 6,
    cellPadding: 1.8,
    overflow: 'linebreak' as const,
    valign: 'middle' as const,
    lineColor: C.border as [number,number,number],
    lineWidth: 0.2,
    textColor: C.text as [number,number,number],
  },
  headStyles: {
    fillColor: C.headerBg as [number,number,number],
    textColor: C.white as [number,number,number],
    fontStyle: 'bold' as const,
    fontSize: 6,
    halign: 'center' as const,
    valign: 'middle' as const,
    lineColor: C.border as [number,number,number],
    lineWidth: 0.2,
  },
  footStyles: {
    fillColor: C.totalBg as [number,number,number],
    textColor: C.text as [number,number,number],
    fontStyle: 'bold' as const,
    fontSize: 6,
    lineColor: C.border as [number,number,number],
    lineWidth: 0.2,
  },
  alternateRowStyles: {
    fillColor: C.rowAlt as [number,number,number],
  },
  margin: { left: ML, right: MR },
  tableWidth: CW,
  theme: 'grid' as const,
};

// ─── Helpers de célula ────────────────────────────────────────────────────────
function cell(content: string, halign: 'left'|'center'|'right' = 'center'): CellDef {
  return { content, styles: { halign } };
}

function cellBold(content: string, halign: 'left'|'center'|'right' = 'center'): CellDef {
  return { content, styles: { halign, fontStyle: 'bold' } };
}

function cellColored(content: string, rgb: [number,number,number]): CellDef {
  return { content, styles: { halign: 'center', textColor: rgb, fontStyle: 'bold' } };
}

function varCell(val: number): CellDef {
  const color = val > 0 ? C.red : val < 0 ? C.green : C.muted;
  return { content: pct(val), styles: { halign: 'center', textColor: color, fontStyle: 'bold' } };
}

function tipoCellVal(custo: number, perc: number, horas: number): CellDef {
  return {
    content: `${brl(custo)}\n${pct(perc)} · ${hrs(horas)}`,
    styles: { halign: 'right', fontSize: 5.5 },
  };
}

// ─── Totais ───────────────────────────────────────────────────────────────────
function calcTotals(data: AreaData[]) {
  return data.reduce((acc, d) => ({
    custoTotal:   acc.custoTotal   + d.custoTotal,
    colab:        acc.colab        + d.totalColaboradores,
    debitoBH:     acc.debitoBH     + d.debitoBH.custo,
    hDebitoBH:    acc.hDebitoBH    + d.debitoBH.horas,
    desalocacao:  acc.desalocacao  + d.desalocacao.custo,
    hDes:         acc.hDes         + d.desalocacao.horas,
    faturado:     acc.faturado     + d.faturado.custo,
    hFat:         acc.hFat         + d.faturado.horas,
    overhead:     acc.overhead     + d.overhead.custo,
    hOvh:         acc.hOvh         + d.overhead.horas,
    ferias:       acc.ferias       + d.ferias.custo,
    hFer:         acc.hFer         + d.ferias.horas,
    custoMedioFTE: acc.custoMedioFTE + d.custoMedioFTE,
    ociRS:        acc.ociRS        + d.ociososidadeRS,
    ociFTE:       acc.ociFTE       + d.ociososidadeFTE,
  }), {
    custoTotal:0, colab:0,
    debitoBH:0, hDebitoBH:0,
    desalocacao:0, hDes:0,
    faturado:0, hFat:0,
    overhead:0, hOvh:0,
    ferias:0, hFer:0,
    custoMedioFTE:0, ociRS:0, ociFTE:0,
  });
}

// ─── Tabela de Consolidação (mensal e anual) ──────────────────────────────────
function buildConsolidationTable(
  doc: jsPDF,
  data: AreaData[],
  startY: number,
  hideOciosidade: boolean
) {
  const tot = calcTotals(data);
  const pctDesSF = tot.custoTotal ? (tot.desalocacao / tot.custoTotal) * 100 : 0;
  const pctDesCF = tot.custoTotal ? ((tot.desalocacao + tot.ferias) / tot.custoTotal) * 100 : 0;

  const head: RowInput[] = [[
    { content: 'Área / Time', styles: { halign: 'left' } },
    'Custo Total',
    '%',
    'Colab.',
    '% Colab.',
    'Débito BH\n% · Horas',
    'Desalocação\n% · Horas',
    'Faturado\n% · Horas',
    'Overhead\n% · Horas',
    'Férias\n% · Horas',
    '% Des.\n(-Férias)',
    '% Des.\n(+Férias)',
    'Meta',
    'Var.\nMeta',
    ...(!hideOciosidade ? ['Custo Méd.\nFTE', 'Ocio.\nR$', 'Ocio.\nFTE'] : []),
  ]];

  const body: RowInput[] = data.map(d => {
    const varColor = d.variacaoMeta > 0 ? C.red : d.variacaoMeta < 0 ? C.green : C.muted;
    return [
      cell(d.area, 'left'),
      cell(brl(d.custoTotal), 'right'),
      cell(pct(d.percentualCustoTotal)),
      cell(String(d.totalColaboradores)),
      cell(pct(d.percentualColaboradores)),
      tipoCellVal(d.debitoBH.custo,    d.debitoBH.percentual,    d.debitoBH.horas),
      tipoCellVal(d.desalocacao.custo, d.desalocacao.percentual, d.desalocacao.horas),
      tipoCellVal(d.faturado.custo,    d.faturado.percentual,    d.faturado.horas),
      tipoCellVal(d.overhead.custo,    d.overhead.percentual,    d.overhead.horas),
      tipoCellVal(d.ferias.custo,      d.ferias.percentual,      d.ferias.horas),
      cell(pct(d.percentualDesalocacaoSemFerias)),
      cell(pct(d.percentualDesalocacaoComFerias)),
      cell(pct(d.meta)),
      { content: pct(d.variacaoMeta), styles: { halign: 'center', textColor: varColor, fontStyle: 'bold' } },
      ...(!hideOciosidade ? [
        cell(brl(d.custoMedioFTE), 'right'),
        cell(d.ociososidadeRS.toFixed(2)),
        cell(d.ociososidadeFTE.toFixed(2)),
      ] : []),
    ] as RowInput;
  });

  const footRow: RowInput = [
    cellBold('TOTAL', 'left'),
    cellBold(brl(tot.custoTotal), 'right'),
    cellBold('100,00%'),
    cellBold(String(tot.colab)),
    cellBold(''),
    { content: `${brl(tot.debitoBH)}\n${hrs(tot.hDebitoBH)}`,   styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(tot.desalocacao)}\n${hrs(tot.hDes)}`,     styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(tot.faturado)}\n${hrs(tot.hFat)}`,        styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(tot.overhead)}\n${hrs(tot.hOvh)}`,        styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(tot.ferias)}\n${hrs(tot.hFer)}`,          styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    cellBold(pct(pctDesSF)),
    cellBold(pct(pctDesCF)),
    cellBold(''),
    cellBold(''),
    ...(!hideOciosidade ? [
      cellBold(brl(tot.custoMedioFTE / Math.max(data.length, 1)), 'right'),
      cellBold(tot.ociRS.toFixed(2)),
      cellBold(tot.ociFTE.toFixed(2)),
    ] : []),
  ];

  // Larguras de coluna (soma ≤ 277mm)
  const tipoW = hideOciosidade ? 18 : 17;
  const colW: number[] = [
    22,      // Área
    17,      // Custo Total
    8,       // %
    7,       // Colab
    8,       // % Colab
    tipoW, tipoW, tipoW, tipoW, tipoW, // 5 tipos
    10, 10,  // % Des -/+
    8,       // Meta
    9,       // Var Meta
    ...(!hideOciosidade ? [13, 10, 9] : []),
  ];

  autoTable(doc, {
    ...BASE_STYLES,
    startY,
    head,
    body,
    foot: [footRow],
    columnStyles: Object.fromEntries(colW.map((w, i) => [i, { cellWidth: w }])),
    didParseCell: (data) => {
      if (data.section === 'foot') {
        data.cell.styles.fillColor = C.totalBg;
      }
      // colorir % des (+Férias) nas linhas de dados
      if (data.section === 'body' && data.column.index === 11) {
        const val = parseFloat((data.cell.raw as string).replace('%', '').replace(',', '.'));
        if (!isNaN(val) && val > 0) {
          data.cell.styles.textColor =
            val <= 10 ? C.green : val <= 20 ? C.yellow : C.red;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });
}

// ─── Tabela % Desalocação por Mês ─────────────────────────────────────────────
const MONTH_LABELS: Record<string, string> = {
  '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez',
};

function buildDesalocacaoMensalTable(doc: jsPDF, data: DesalocacaoMensalRow[], ano: string, startY: number) {
  if (!data.length) return;

  const meses = [...new Set(data.flatMap(r => Object.keys(r.meses)))].sort();

  const head: RowInput[] = [[
    { content: 'Área / Time', styles: { halign: 'left' } },
    ...meses.map(m => MONTH_LABELS[m] ?? m),
  ]];

  const body: RowInput[] = data.map(row => [
    cell(row.area, 'left'),
    ...meses.map(m => {
      const val = row.meses[m] ?? 0;
      if (val === 0) return cell('—');
      const color = val <= 10 ? C.green : val <= 20 ? C.yellow : C.red;
      return { content: pct(val), styles: { halign: 'center', textColor: color, fontStyle: 'bold' } } as CellDef;
    }),
  ]);

  const mesW = Math.max(14, (CW - 30) / Math.max(meses.length, 1));

  autoTable(doc, {
    ...BASE_STYLES,
    startY,
    head,
    body,
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },
      ...Object.fromEntries(meses.map((_, i) => [i + 1, { cellWidth: mesW, halign: 'center' }])),
    },
  });
}

// ─── Exportação principal ─────────────────────────────────────────────────────
export function generatePdfReport(opts: {
  monthlyData:       AreaData[];
  yearlyData:        AreaData[];
  rawData:           RawDataRow[];
  desalocacaoMensal: DesalocacaoMensalRow[];
  mes:               string;
  ano:               string;
}) {
  const { monthlyData, yearlyData, rawData, desalocacaoMensal, mes, ano } = opts;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Página 1: Capa ───────────────────────────────────────────────────────
  drawCover(doc, mes, ano);

  // ── Página 2: Consolidação Mensal ────────────────────────────────────────
  doc.addPage();
  drawHeader(doc, `Consolidação Mensal — ${mes} / ${ano}`, `${mes} / ${ano}`, 2);

  const tot_m = calcTotals(monthlyData);
  const pctFatM  = tot_m.custoTotal ? (tot_m.faturado / tot_m.custoTotal) * 100 : 0;
  const pctDesM  = tot_m.custoTotal ? ((tot_m.desalocacao + tot_m.ferias) / tot_m.custoTotal) * 100 : 0;

  let y = MT_BODY;
  y = drawKpiBar(doc, [
    { label: 'Custo Total',       value: brl(tot_m.custoTotal) },
    { label: 'Colaboradores',     value: String(tot_m.colab) },
    { label: 'Total Faturado',    value: brl(tot_m.faturado) },
    { label: '% Faturado',        value: pct(pctFatM) },
    { label: 'Total Desalocação', value: brl(tot_m.desalocacao) },
    { label: '% Des. c/ Férias',  value: pct(pctDesM) },
    { label: 'Total Overhead',    value: brl(tot_m.overhead) },
    { label: 'Total Férias',      value: brl(tot_m.ferias) },
  ], y);

  buildConsolidationTable(doc, monthlyData, y, false);

  // ── Página 3: Consolidação Anual ─────────────────────────────────────────
  doc.addPage();
  drawHeader(doc, `Consolidação Anual — ${ano}`, ano, 3);

  const tot_a = calcTotals(yearlyData);
  const pctFatA  = tot_a.custoTotal ? (tot_a.faturado / tot_a.custoTotal) * 100 : 0;
  const pctDesA  = tot_a.custoTotal ? ((tot_a.desalocacao + tot_a.ferias) / tot_a.custoTotal) * 100 : 0;

  y = MT_BODY;
  y = drawKpiBar(doc, [
    { label: 'Custo Total Anual',  value: brl(tot_a.custoTotal) },
    { label: 'Meses c/ Dados',     value: String(new Set(rawData.filter(r => r.ano === ano).map(r => r.mes)).size) },
    { label: 'Total Faturado',     value: brl(tot_a.faturado) },
    { label: '% Faturado',         value: pct(pctFatA) },
    { label: 'Total Desalocação',  value: brl(tot_a.desalocacao) },
    { label: '% Des. c/ Férias',   value: pct(pctDesA) },
    { label: 'Total Overhead',     value: brl(tot_a.overhead) },
    { label: 'Total Férias',       value: brl(tot_a.ferias) },
  ], y);

  buildConsolidationTable(doc, yearlyData, y, true);

  // ── % Desalocação por Mês ─────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 10;
  const remainingSpace = PH - finalY - 15;

  const sectionY = remainingSpace > 40 ? finalY + 6 : (doc.addPage(), drawHeader(doc, `% Desalocação (+Férias) por Mês — ${ano}`, ano, 4), MT_BODY);

  if (remainingSpace > 40) {
    drawSectionTitle(doc, `% Desalocação (+Férias) por Mês — Ano ${ano}`, sectionY);
    buildDesalocacaoMensalTable(doc, desalocacaoMensal, ano, sectionY + 9);
  } else {
    drawSectionTitle(doc, `% Desalocação (+Férias) por Mês — Ano ${ano}`, sectionY);
    buildDesalocacaoMensalTable(doc, desalocacaoMensal, ano, sectionY + 9);
  }

  doc.save(`Relatorio_Gestao_${mes}_${ano}.pdf`);
}
