import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type AreaData, type RawDataRow } from './dataParser';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  primary:    [26,  43,  74]  as [number,number,number],
  secondary:  [46,  93, 159]  as [number,number,number],
  accent:     [59, 130, 246]  as [number,number,number],
  headerBg:   [30,  58,  95]  as [number,number,number],
  rowAlt:     [248,250,252]   as [number,number,number],
  totalBg:    [226,232,240]   as [number,number,number],
  border:     [203,213,225]   as [number,number,number],
  white:      [255,255,255]   as [number,number,number],
  text:       [30,  41,  59]  as [number,number,number],
  muted:      [100,116,139]   as [number,number,number],
  lightBlue:  [239,246,255]   as [number,number,number],
  success:    [22, 101, 52]   as [number,number,number],
};

// ─── Formatadores ─────────────────────────────────────────────────────────────
const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number) =>
  `${v.toFixed(1)}%`;

const hrs = (v: number) =>
  `${v.toFixed(1)}h`;

const now = () =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());

// ─── Constantes de layout ─────────────────────────────────────────────────────
const PAGE_W = 297; // A4 landscape width mm
const PAGE_H = 210;
const ML = 10;
const MR = 10;
const MT = 10;
const CONTENT_W = PAGE_W - ML - MR;

// ─── Helpers de desenho ───────────────────────────────────────────────────────
function drawPageHeader(doc: jsPDF, title: string, subtitle: string, pageNum: number) {
  // barra topo
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PAGE_W, 14, 'F');
  // linha accent
  doc.setFillColor(...C.accent);
  doc.rect(0, 12.5, PAGE_W, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text(title, ML, 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(subtitle, PAGE_W - MR, 8.5, { align: 'right' });

  // rodapé
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, PAGE_H - 8, PAGE_W - MR, PAGE_H - 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text(`Página ${pageNum}  ·  Gerado em ${now()}`, PAGE_W / 2, PAGE_H - 4.5, { align: 'center' });
}

function drawCoverPage(doc: jsPDF, mes: string, ano: string) {
  // fundo
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // faixa central
  doc.setFillColor(...C.secondary);
  doc.rect(0, PAGE_H * 0.38, PAGE_W, PAGE_H * 0.28, 'F');

  // linhas accent
  doc.setFillColor(...C.accent);
  doc.rect(0, PAGE_H * 0.38, PAGE_W, 2, 'F');
  doc.rect(0, PAGE_H * 0.66 - 2, PAGE_W, 2, 'F');

  // título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...C.white);
  doc.text('Relatório de Gestão Consolidado', PAGE_W / 2, PAGE_H * 0.56, { align: 'center' });

  // subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(191, 212, 242);
  doc.text('Consolidação Mensal  ·  Consolidação Anual', PAGE_W / 2, PAGE_H * 0.49, { align: 'center' });

  // período
  doc.setFontSize(9);
  doc.setTextColor(148, 184, 224);
  doc.text(`Período de referência: ${mes} / ${ano}`, PAGE_W / 2, PAGE_H * 0.42, { align: 'center' });

  // rodapé
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em ${now()}`, PAGE_W / 2, PAGE_H - 12, { align: 'center' });
}

function drawKpiBar(doc: jsPDF, items: { label: string; value: string }[], y: number) {
  const n = items.length;
  const itemW = CONTENT_W / n;
  const barH = 14;

  items.forEach((item, i) => {
    const x = ML + i * itemW;
    // fundo
    doc.setFillColor(...C.lightBlue);
    doc.roundedRect(x + 0.5, y, itemW - 1, barH, 2, 2, 'F');
    // borda leve
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 0.5, y, itemW - 1, barH, 2, 2, 'S');

    // label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.text(item.label.toUpperCase(), x + itemW / 2, y + 4.5, { align: 'center' });

    // valor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primary);
    doc.text(item.value, x + itemW / 2, y + 10.5, { align: 'center' });
  });

  return y + barH + 4;
}

// ─── Montagem da tabela mensal ────────────────────────────────────────────────
function buildMonthlyTable(data: AreaData[]) {
  const head = [[
    'Área / Time', 'Custo Total', '%', 'Colab.',
    'Faturado', 'Hrs Fat.',
    'Desalocação', 'Hrs Des.',
    'Overhead', 'Hrs Ovh.',
    'Férias', 'Hrs Fér.',
    '% Des. s/Fér.', '% Des. c/Fér.',
  ]];

  const totals = data.reduce((acc, d) => {
    acc.custo += d.custoTotal;
    acc.colab += d.totalColaboradores;
    acc.fat   += d.faturado.custo;
    acc.des   += d.desalocacao.custo;
    acc.ovh   += d.overhead.custo;
    acc.fer   += d.ferias.custo;
    acc.hFat  += d.faturado.horas;
    acc.hDes  += d.desalocacao.horas;
    acc.hOvh  += d.overhead.horas;
    acc.hFer  += d.ferias.horas;
    return acc;
  }, { custo:0, colab:0, fat:0, des:0, ovh:0, fer:0, hFat:0, hDes:0, hOvh:0, hFer:0 });

  const pctDesSF = totals.custo ? (totals.des / totals.custo) * 100 : 0;
  const pctDesCF = totals.custo ? ((totals.des + totals.fer) / totals.custo) * 100 : 0;

  const body = data.map(d => [
    d.area,
    brl(d.custoTotal),
    pct(d.percentualCustoTotal),
    String(d.totalColaboradores),
    brl(d.faturado.custo),
    hrs(d.faturado.horas),
    brl(d.desalocacao.custo),
    hrs(d.desalocacao.horas),
    brl(d.overhead.custo),
    hrs(d.overhead.horas),
    brl(d.ferias.custo),
    hrs(d.ferias.horas),
    pct(d.percentualDesalocacaoSemFerias),
    pct(d.percentualDesalocacaoComFerias),
  ]);

  const foot = [[
    'TOTAL',
    brl(totals.custo),
    '100,0%',
    String(totals.colab),
    brl(totals.fat),
    hrs(totals.hFat),
    brl(totals.des),
    hrs(totals.hDes),
    brl(totals.ovh),
    hrs(totals.hOvh),
    brl(totals.fer),
    hrs(totals.hFer),
    pct(pctDesSF),
    pct(pctDesCF),
  ]];

  return { head, body, foot, totals };
}

// ─── Montagem da tabela anual ─────────────────────────────────────────────────
const MESES_ORDER = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function buildAnnualTable(data: AreaData[], rawData: RawDataRow[], ano: string) {
  const filtered = rawData.filter(r => r.ano === ano);
  const meses = [...new Set(filtered.map(r => r.mes))].sort(
    (a, b) => MESES_ORDER.indexOf(a) - MESES_ORDER.indexOf(b)
  );

  // custo por area/mes
  const mesMap: Record<string, Record<string, number>> = {};
  filtered.forEach(r => {
    const area = r.time || 'Sem Time';
    if (!mesMap[area]) mesMap[area] = {};
    mesMap[area][r.mes] = (mesMap[area][r.mes] || 0) + r.custo_projeto;
  });

  const totals = data.reduce((acc, d) => {
    acc.custo += d.custoTotal;
    acc.colab += d.totalColaboradores;
    acc.fat   += d.faturado.custo;
    acc.des   += d.desalocacao.custo;
    acc.ovh   += d.overhead.custo;
    acc.fer   += d.ferias.custo;
    meses.forEach(m => { acc[m] = (acc[m] || 0) + (mesMap[d.area]?.[m] || 0); });
    return acc;
  }, { custo:0, colab:0, fat:0, des:0, ovh:0, fer:0 } as Record<string, number>);

  const pctDesCF = totals.custo ? ((totals.des + totals.fer) / totals.custo) * 100 : 0;

  const head = [[
    'Área / Time', 'Custo Total', '%', 'Colab.',
    'Faturado', 'Desalocação', 'Overhead', 'Férias', '% Des. c/Fér.',
    ...meses.map(m => m.slice(0, 3)),
  ]];

  const body = data.map(d => {
    const desCF = d.custoTotal ? ((d.desalocacao.custo + d.ferias.custo) / d.custoTotal) * 100 : 0;
    return [
      d.area,
      brl(d.custoTotal),
      pct(d.percentualCustoTotal),
      String(d.totalColaboradores),
      brl(d.faturado.custo),
      brl(d.desalocacao.custo),
      brl(d.overhead.custo),
      brl(d.ferias.custo),
      pct(desCF),
      ...meses.map(m => brl(mesMap[d.area]?.[m] || 0)),
    ];
  });

  const foot = [[
    'TOTAL',
    brl(totals.custo),
    '100,0%',
    String(totals.colab),
    brl(totals.fat),
    brl(totals.des),
    brl(totals.ovh),
    brl(totals.fer),
    pct(pctDesCF),
    ...meses.map(m => brl(totals[m] || 0)),
  ]];

  return { head, body, foot, totals, meses };
}

// ─── Estilos de tabela ────────────────────────────────────────────────────────
function applyTableTheme(table: ReturnType<typeof autoTable>, doc: jsPDF) {}

// ─── Exportação principal ─────────────────────────────────────────────────────
export function generatePdfReport(opts: {
  monthlyData: AreaData[];
  yearlyData:  AreaData[];
  rawData:     RawDataRow[];
  mes:         string;
  ano:         string;
}) {
  const { monthlyData, yearlyData, rawData, mes, ano } = opts;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Capa ──────────────────────────────────────────────────────────────────
  drawCoverPage(doc, mes, ano);

  // ── Pág 2: Consolidação Mensal ────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, `Consolidação Mensal — ${mes} / ${ano}`, `${mes} / ${ano}`, 2);

  let curY = MT + 8;

  // linha separadora título
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.6);
  doc.line(ML, curY, ML + CONTENT_W, curY);
  curY += 4;

  // KPIs mensais
  const mTotals = buildMonthlyTable(monthlyData).totals;
  const totalCustoM = mTotals.custo;
  const pctFatM  = totalCustoM ? (mTotals.fat / totalCustoM) * 100 : 0;
  const pctDesM  = totalCustoM ? ((mTotals.des + mTotals.fer) / totalCustoM) * 100 : 0;

  curY = drawKpiBar(doc, [
    { label: 'Custo Total',        value: brl(totalCustoM) },
    { label: 'Colaboradores',      value: String(mTotals.colab) },
    { label: 'Total Faturado',     value: brl(mTotals.fat) },
    { label: '% Faturado',         value: pct(pctFatM) },
    { label: 'Total Desalocação',  value: brl(mTotals.des) },
    { label: '% Des. c/ Férias',   value: pct(pctDesM) },
    { label: 'Total Overhead',     value: brl(mTotals.ovh) },
    { label: 'Total Férias',       value: brl(mTotals.fer) },
  ], curY);

  const { head: mHead, body: mBody, foot: mFoot } = buildMonthlyTable(monthlyData);

  const rightCols = [1, 4, 6, 8, 10];
  const centerCols = [2, 3, 5, 7, 9, 11, 12, 13];

  autoTable(doc, {
    startY: curY,
    head: mHead,
    body: mBody,
    foot: mFoot,
    margin: { left: ML, right: MR },
    tableWidth: CONTENT_W,
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 2, overflow: 'linebreak', valign: 'middle' },
    headStyles: {
      fillColor: C.headerBg, textColor: C.white,
      fontStyle: 'bold', fontSize: 7, halign: 'center',
    },
    footStyles: {
      fillColor: C.totalBg, textColor: C.text,
      fontStyle: 'bold', fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: {
      0:  { halign: 'left',  cellWidth: 32 },
      1:  { halign: 'right', cellWidth: 22 },
      2:  { halign: 'center', cellWidth: 12 },
      3:  { halign: 'center', cellWidth: 11 },
      4:  { halign: 'right', cellWidth: 22 },
      5:  { halign: 'center', cellWidth: 14 },
      6:  { halign: 'right', cellWidth: 22 },
      7:  { halign: 'center', cellWidth: 14 },
      8:  { halign: 'right', cellWidth: 20 },
      9:  { halign: 'center', cellWidth: 14 },
      10: { halign: 'right', cellWidth: 18 },
      11: { halign: 'center', cellWidth: 14 },
      12: { halign: 'center', cellWidth: 16 },
      13: { halign: 'center', cellWidth: 16 },
    },
    didParseCell: (data) => {
      if (data.section === 'foot') {
        data.cell.styles.fillColor = C.totalBg;
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 0) data.cell.styles.halign = 'left';
      }
    },
  });

  // ── Pág 3: Consolidação Anual ─────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, `Consolidação Anual — ${ano}`, ano, 3);

  curY = MT + 8;
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.6);
  doc.line(ML, curY, ML + CONTENT_W, curY);
  curY += 4;

  const { head: aHead, body: aBody, foot: aFoot, totals: aTotals, meses } =
    buildAnnualTable(yearlyData, rawData, ano);

  const totalCustoA = aTotals.custo;
  const pctFatA  = totalCustoA ? (aTotals.fat / totalCustoA) * 100 : 0;
  const pctDesA  = totalCustoA ? ((aTotals.des + aTotals.fer) / totalCustoA) * 100 : 0;

  curY = drawKpiBar(doc, [
    { label: 'Custo Total Anual',  value: brl(totalCustoA) },
    { label: 'Meses com Dados',    value: String(meses.length) },
    { label: 'Total Faturado',     value: brl(aTotals.fat) },
    { label: '% Faturado',         value: pct(pctFatA) },
    { label: 'Total Desalocação',  value: brl(aTotals.des) },
    { label: '% Des. c/ Férias',   value: pct(pctDesA) },
    { label: 'Total Overhead',     value: brl(aTotals.ovh) },
    { label: 'Total Férias',       value: brl(aTotals.fer) },
  ], curY);

  // larguras dinâmicas para colunas de mês
  const fixedW = 32 + 22 + 12 + 11 + 22 + 22 + 20 + 18 + 14;
  const mesW = meses.length > 0
    ? Math.max(14, (CONTENT_W - fixedW) / meses.length)
    : 16;

  const annualColStyles: Record<number, object> = {
    0: { halign: 'left',  cellWidth: 32 },
    1: { halign: 'right', cellWidth: 22 },
    2: { halign: 'center', cellWidth: 12 },
    3: { halign: 'center', cellWidth: 11 },
    4: { halign: 'right', cellWidth: 22 },
    5: { halign: 'right', cellWidth: 22 },
    6: { halign: 'right', cellWidth: 20 },
    7: { halign: 'right', cellWidth: 18 },
    8: { halign: 'center', cellWidth: 14 },
  };
  meses.forEach((_, i) => {
    annualColStyles[9 + i] = { halign: 'right', cellWidth: mesW };
  });

  autoTable(doc, {
    startY: curY,
    head: aHead,
    body: aBody,
    foot: aFoot,
    margin: { left: ML, right: MR },
    tableWidth: CONTENT_W,
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 2, overflow: 'linebreak', valign: 'middle' },
    headStyles: {
      fillColor: C.headerBg, textColor: C.white,
      fontStyle: 'bold', fontSize: 7, halign: 'center',
    },
    footStyles: {
      fillColor: C.totalBg, textColor: C.text,
      fontStyle: 'bold', fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: annualColStyles,
    didParseCell: (data) => {
      if (data.section === 'foot') {
        data.cell.styles.fillColor = C.totalBg;
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 0) data.cell.styles.halign = 'left';
      }
      // linha separadora antes das colunas de mês
      if (data.column.index === 8) {
        data.cell.styles.lineWidth = { right: 0.5 };
      }
    },
  });

  // ── Download ──────────────────────────────────────────────────────────────
  const filename = `Relatorio_Gestao_${mes}_${ano}.pdf`;
  doc.save(filename);
}
