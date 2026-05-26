// @ts-ignore – jspdf-autotable augments jsPDF prototype
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { type AreaData, type RawDataRow, type DesalocacaoMensalRow } from './dataParser';

// ─── Paleta #782170 ───────────────────────────────────────────────────────────
const C = {
  primary:    [120,  33, 112] as [number,number,number], // #782170
  primaryDk:  [ 89,  24,  83] as [number,number,number], // #591853
  primaryLt:  [248, 237, 247] as [number,number,number], // tint claro
  accent:     [180,  60, 170] as [number,number,number], // roxo médio
  white:      [255, 255, 255] as [number,number,number],
  text:       [ 15,  23,  42] as [number,number,number], // slate-900
  muted:      [100, 116, 139] as [number,number,number], // slate-500
  rowAlt:     [252, 246, 252] as [number,number,number], // tint lilás suave
  totalBg:    [236, 219, 234] as [number,number,number], // lilás claro
  border:     [210, 180, 208] as [number,number,number], // lilás borda
  sectionBg:  [244, 235, 243] as [number,number,number], // fundo seção
  red:        [220,  38,  38] as [number,number,number],
  green:      [ 22, 163,  74] as [number,number,number],
  yellow:     [202, 138,   4] as [number,number,number],
};

// ─── Layout A4 landscape ──────────────────────────────────────────────────────
const PW = 297, PH = 210, ML = 10, MR = 10;
const CW = PW - ML - MR; // 277 mm

// ─── Formatadores ─────────────────────────────────────────────────────────────
const brl  = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const pct  = (v: number) => `${v.toFixed(2)}%`;
const hrs  = (v: number) => `${Math.round(v)}h`;
const now  = () =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());

// ─── Capa ─────────────────────────────────────────────────────────────────────
function drawCover(doc: jsPDF, mes: string, ano: string) {
  doc.setFillColor(...C.primaryDk);
  doc.rect(0, 0, PW, PH, 'F');

  doc.setFillColor(...C.primary);
  doc.rect(0, PH * 0.36, PW, PH * 0.30, 'F');

  doc.setFillColor(...C.accent);
  doc.rect(0, PH * 0.36, PW, 2, 'F');
  doc.rect(0, PH * 0.66 - 2, PW, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.white);
  doc.text('Relatório de Gestão Consolidado', PW / 2, PH * 0.555, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(230, 190, 228);
  doc.text('Consolidação Mensal  ·  Consolidação Anual', PW / 2, PH * 0.48, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(200, 160, 198);
  doc.text(`Período de referência: ${mes} / ${ano}`, PW / 2, PH * 0.415, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(`Gerado em ${now()}`, PW / 2, PH - 10, { align: 'center' });
}

// ─── Cabeçalho de página ─────────────────────────────────────────────────────
function drawPageHeader(doc: jsPDF, title: string, sub: string) {
  doc.setFillColor(...C.primary);
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

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, PH - 7, PW - MR, PH - 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text(`Gerado em ${now()}`, PW / 2, PH - 3.5, { align: 'center' });
}

// ─── Barra de KPIs ────────────────────────────────────────────────────────────
function drawKpiBar(doc: jsPDF, items: { label: string; value: string }[], y: number): number {
  const n = items.length;
  const iw = CW / n;
  const bh = 14;

  items.forEach((item, i) => {
    const x = ML + i * iw;
    doc.setFillColor(...C.primaryLt);
    doc.roundedRect(x + 0.4, y, iw - 0.8, bh, 1.5, 1.5, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 0.4, y, iw - 0.8, bh, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...C.muted);
    doc.text(item.label.toUpperCase(), x + iw / 2, y + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text(item.value, x + iw / 2, y + 10.5, { align: 'center' });
  });

  return y + bh + 3;
}

// ─── Título de sub-seção ──────────────────────────────────────────────────────
function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...C.sectionBg);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFillColor(...C.primary);
  doc.rect(ML, y, 2.5, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.primaryDk);
  doc.text(title, ML + 5, y + 4.8);
  return y + 9;
}

// ─── Acumulador de totais ─────────────────────────────────────────────────────
function calcTotals(data: AreaData[]) {
  return data.reduce((a, d) => ({
    custo:  a.custo  + d.custoTotal,
    colab:  a.colab  + d.totalColaboradores,
    debBH:  a.debBH  + d.debitoBH.custo,     hDebBH: a.hDebBH + d.debitoBH.horas,
    des:    a.des    + d.desalocacao.custo,   hDes:   a.hDes   + d.desalocacao.horas,
    fat:    a.fat    + d.faturado.custo,      hFat:   a.hFat   + d.faturado.horas,
    ovh:    a.ovh    + d.overhead.custo,      hOvh:   a.hOvh   + d.overhead.horas,
    fer:    a.fer    + d.ferias.custo,        hFer:   a.hFer   + d.ferias.horas,
    ociRS:  a.ociRS  + d.ociososidadeRS,
    ociFTE: a.ociFTE + d.ociososidadeFTE,
  }), { custo:0,colab:0,debBH:0,hDebBH:0,des:0,hDes:0,fat:0,hFat:0,ovh:0,hOvh:0,fer:0,hFer:0,ociRS:0,ociFTE:0 });
}

// ─── Tabela de consolidação (mensal ou anual) ─────────────────────────────────
function buildConsolidationTable(doc: jsPDF, data: AreaData[], startY: number, hideOciosidade: boolean) {
  const t = calcTotals(data);
  const pDesSF = t.custo ? (t.des / t.custo) * 100 : 0;
  const pDesCF = t.custo ? ((t.des + t.fer) / t.custo) * 100 : 0;

  const baseHead = [
    'Área / Time','Custo Total','%','Colab.','% Colab.',
    'Débito BH\n% · Hrs','Desalocação\n% · Hrs','Faturado\n% · Hrs',
    'Overhead\n% · Hrs','Férias\n% · Hrs',
    '% Des.\n(-Fér.)','% Des.\n(+Fér.)','Meta','Var.\nMeta',
  ];
  const ocioHead = hideOciosidade ? [] : ['C. Médio\nFTE','Ocio.\nR$','Ocio.\nFTE'];
  const head = [[...baseHead, ...ocioHead]];

  // helper: célula de tipo (R$ + % · Hrs)
  const tipoCell = (custo: number, perc: number, horas: number) => ({
    content: `${brl(custo)}\n${pct(perc)} · ${hrs(horas)}`,
    styles: { halign: 'right', fontSize: 5.5 },
  });

  const body = data.map(d => {
    const varColor = d.variacaoMeta > 0 ? C.red : d.variacaoMeta < 0 ? C.green : C.muted;
    const desCFColor = d.percentualDesalocacaoComFerias <= 10 ? C.green
                     : d.percentualDesalocacaoComFerias <= 20 ? C.yellow : C.red;
    const baseRow = [
      { content: d.area,                                  styles: { halign: 'left' } },
      { content: brl(d.custoTotal),                       styles: { halign: 'right' } },
      { content: pct(d.percentualCustoTotal),             styles: { halign: 'center' } },
      { content: String(d.totalColaboradores),            styles: { halign: 'center' } },
      { content: pct(d.percentualColaboradores),          styles: { halign: 'center' } },
      tipoCell(d.debitoBH.custo,    d.debitoBH.percentual,    d.debitoBH.horas),
      tipoCell(d.desalocacao.custo, d.desalocacao.percentual, d.desalocacao.horas),
      tipoCell(d.faturado.custo,    d.faturado.percentual,    d.faturado.horas),
      tipoCell(d.overhead.custo,    d.overhead.percentual,    d.overhead.horas),
      tipoCell(d.ferias.custo,      d.ferias.percentual,      d.ferias.horas),
      { content: pct(d.percentualDesalocacaoSemFerias),   styles: { halign: 'center' } },
      { content: pct(d.percentualDesalocacaoComFerias),   styles: { halign: 'center', textColor: desCFColor, fontStyle: 'bold' } },
      { content: pct(d.meta),                             styles: { halign: 'center' } },
      { content: pct(d.variacaoMeta),                     styles: { halign: 'center', textColor: varColor, fontStyle: 'bold' } },
    ];
    const ocioRow = hideOciosidade ? [] : [
      { content: brl(d.custoMedioFTE),                    styles: { halign: 'right' } },
      { content: d.ociososidadeRS.toFixed(2),             styles: { halign: 'center' } },
      { content: d.ociososidadeFTE.toFixed(2),            styles: { halign: 'center' } },
    ];
    return [...baseRow, ...ocioRow];
  });

  const footBase = [
    { content: 'TOTAL',              styles: { halign: 'left',  fontStyle: 'bold' } },
    { content: brl(t.custo),         styles: { halign: 'right', fontStyle: 'bold' } },
    { content: '100,00%',            styles: { halign: 'center',fontStyle: 'bold' } },
    { content: String(t.colab),      styles: { halign: 'center',fontStyle: 'bold' } },
    { content: '',                   styles: { halign: 'center' } },
    { content: `${brl(t.debBH)}\n${hrs(t.hDebBH)}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(t.des)}\n${hrs(t.hDes)}`,     styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(t.fat)}\n${hrs(t.hFat)}`,     styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(t.ovh)}\n${hrs(t.hOvh)}`,     styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: `${brl(t.fer)}\n${hrs(t.hFer)}`,     styles: { halign: 'right', fontStyle: 'bold', fontSize: 5.5 } },
    { content: pct(pDesSF),          styles: { halign: 'center',fontStyle: 'bold' } },
    { content: pct(pDesCF),          styles: { halign: 'center',fontStyle: 'bold' } },
    { content: '',                   styles: { halign: 'center' } },
    { content: '',                   styles: { halign: 'center' } },
  ];
  const footOcio = hideOciosidade ? [] : [
    { content: brl(t.custo / Math.max(data.length, 1)), styles: { halign: 'right', fontStyle: 'bold' } },
    { content: t.ociRS.toFixed(2),   styles: { halign: 'center',fontStyle: 'bold' } },
    { content: t.ociFTE.toFixed(2),  styles: { halign: 'center',fontStyle: 'bold' } },
  ];

  // Larguras: somam ≤ 277mm
  const tw = hideOciosidade ? 19 : 18; // largura de cada coluna de tipo
  const colWidths: Record<number, object> = {
    0:  { cellWidth: 22, halign: 'left'   },
    1:  { cellWidth: 18, halign: 'right'  },
    2:  { cellWidth:  8, halign: 'center' },
    3:  { cellWidth:  8, halign: 'center' },
    4:  { cellWidth:  8, halign: 'center' },
    5:  { cellWidth: tw, halign: 'right'  },
    6:  { cellWidth: tw, halign: 'right'  },
    7:  { cellWidth: tw, halign: 'right'  },
    8:  { cellWidth: tw, halign: 'right'  },
    9:  { cellWidth: tw, halign: 'right'  },
    10: { cellWidth: 11, halign: 'center' },
    11: { cellWidth: 11, halign: 'center' },
    12: { cellWidth:  9, halign: 'center' },
    13: { cellWidth:  9, halign: 'center' },
  };
  if (!hideOciosidade) {
    colWidths[14] = { cellWidth: 14, halign: 'right'  };
    colWidths[15] = { cellWidth: 10, halign: 'center' };
    colWidths[16] = { cellWidth:  9, halign: 'center' };
  }

  autoTable(doc, {
    startY,
    head,
    body,
    foot: [[...footBase, ...footOcio]],
    margin: { left: ML, right: MR },
    tableWidth: CW,
    theme: 'grid',
    styles:           { fontSize: 6, cellPadding: 1.8, overflow: 'linebreak', valign: 'middle', lineColor: C.border, lineWidth: 0.2 },
    headStyles:       { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 6, halign: 'center', valign: 'middle' },
    footStyles:       { fillColor: C.totalBg, textColor: C.text,  fontStyle: 'bold', fontSize: 6 },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles:     colWidths,
    didParseCell:     (hookData: any) => {
      if (hookData.section === 'foot') {
        hookData.cell.styles.fillColor = C.totalBg;
      }
    },
  });
}

// ─── Tabela % Desalocação por Mês ─────────────────────────────────────────────
const MONTH_LABELS: Record<string, string> = {
  '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez',
};

function buildDesalocacaoMensalTable(doc: jsPDF, data: DesalocacaoMensalRow[], startY: number) {
  if (!data.length) return;

  const meses = [...new Set(data.flatMap(r => Object.keys(r.meses)))].sort();
  const mesW  = Math.max(14, (CW - 30) / Math.max(meses.length, 1));

  const head = [[
    { content: 'Área / Time', styles: { halign: 'left' } },
    ...meses.map(m => MONTH_LABELS[m] ?? m),
  ]];

  const body = data.map(row => [
    { content: row.area, styles: { halign: 'left' } },
    ...meses.map(m => {
      const val = row.meses[m] ?? 0;
      if (val === 0) return { content: '—', styles: { halign: 'center', textColor: C.muted } };
      const color = val <= 10 ? C.green : val <= 20 ? C.yellow : C.red;
      return { content: pct(val), styles: { halign: 'center', textColor: color, fontStyle: 'bold' } };
    }),
  ]);

  const colStyles: Record<number, object> = { 0: { cellWidth: 30, halign: 'left' } };
  meses.forEach((_, i) => { colStyles[i + 1] = { cellWidth: mesW, halign: 'center' }; });

  autoTable(doc, {
    startY,
    head,
    body,
    margin: { left: ML, right: MR },
    tableWidth: CW,
    theme: 'grid',
    styles:           { fontSize: 6, cellPadding: 1.8, overflow: 'linebreak', valign: 'middle', lineColor: C.border, lineWidth: 0.2 },
    headStyles:       { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 6, halign: 'center' },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles:     colStyles,
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

  // ── Página 1: Capa ──────────────────────────────────────────────────────
  drawCover(doc, mes, ano);

  // ── Página 2: Consolidação Mensal ───────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, `Consolidação Mensal — ${mes} / ${ano}`, `${mes} / ${ano}`);

  const tm = calcTotals(monthlyData);
  const pFatM = tm.custo ? (tm.fat / tm.custo) * 100 : 0;
  const pDesM = tm.custo ? ((tm.des + tm.fer) / tm.custo) * 100 : 0;

  let y = drawKpiBar(doc, [
    { label: 'Custo Total',       value: brl(tm.custo) },
    { label: 'Colaboradores',     value: String(tm.colab) },
    { label: 'Total Faturado',    value: brl(tm.fat) },
    { label: '% Faturado',        value: pct(pFatM) },
    { label: 'Total Desalocação', value: brl(tm.des) },
    { label: '% Des. c/ Férias',  value: pct(pDesM) },
    { label: 'Total Overhead',    value: brl(tm.ovh) },
    { label: 'Total Férias',      value: brl(tm.fer) },
  ], 16);

  buildConsolidationTable(doc, monthlyData, y, false);

  // ── Página 3: Consolidação Anual ────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, `Consolidação Anual — ${ano}`, ano);

  const ta = calcTotals(yearlyData);
  const pFatA = ta.custo ? (ta.fat / ta.custo) * 100 : 0;
  const pDesA = ta.custo ? ((ta.des + ta.fer) / ta.custo) * 100 : 0;
  const mesesComDados = new Set(rawData.filter(r => r.ano === ano).map(r => r.mes)).size;

  y = drawKpiBar(doc, [
    { label: 'Custo Total Anual',  value: brl(ta.custo) },
    { label: 'Meses c/ Dados',     value: String(mesesComDados) },
    { label: 'Total Faturado',     value: brl(ta.fat) },
    { label: '% Faturado',         value: pct(pFatA) },
    { label: 'Total Desalocação',  value: brl(ta.des) },
    { label: '% Des. c/ Férias',   value: pct(pDesA) },
    { label: 'Total Overhead',     value: brl(ta.ovh) },
    { label: 'Total Férias',       value: brl(ta.fer) },
  ], 16);

  buildConsolidationTable(doc, yearlyData, y, true);

  // % Desalocação por Mês — na mesma página se couber, senão nova página
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? y + 40;
  const spaceLeft = PH - finalY - 15;

  if (spaceLeft >= 35 && desalocacaoMensal.length > 0) {
    const secY = drawSectionTitle(doc, `% Desalocação (+Férias) por Mês — Ano ${ano}`, finalY + 5);
    buildDesalocacaoMensalTable(doc, desalocacaoMensal, secY);
  } else if (desalocacaoMensal.length > 0) {
    doc.addPage();
    drawPageHeader(doc, `% Desalocação por Mês — ${ano}`, ano);
    const secY = drawSectionTitle(doc, `% Desalocação (+Férias) por Mês — Ano ${ano}`, 16);
    buildDesalocacaoMensalTable(doc, desalocacaoMensal, secY);
  }

  doc.save(`Relatorio_Gestao_${mes}_${ano}.pdf`);
}
