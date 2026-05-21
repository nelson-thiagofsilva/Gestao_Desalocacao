export interface RawDataRow {
  cliente: string;
  projeto: string;
  colaborador: string;
  empresa: string;
  email: string;
  time: string; // área/time
  qtdehoras: number;
  mes: string;
  ano: string;
  horas_apontadas: number;
  valor_final_empresa: number;
  valor_hora: number;
  custo_projeto: number;
  tipo: string; // Débito BH, Desalocação, Faturado, Overhead, Férias
  prevenda: string;
}

export interface AreaData {
  area: string;
  custoTotal: number;
  percentualCustoTotal: number;
  totalColaboradores: number;
  percentualColaboradores: number;
  debitoBH: { custo: number; percentual: number; horas: number };
  desalocacao: { custo: number; percentual: number; horas: number };
  faturado: { custo: number; percentual: number; horas: number };
  overhead: { custo: number; percentual: number; horas: number };
  ferias: { custo: number; percentual: number; horas: number };
  percentualDesalocacaoSemFerias: number;
  percentualDesalocacaoComFerias: number;
  meta: number;
  variacaoMeta: number;
  custoMedioFTE: number;
  ociososidadeRS: number;
  ociososidadeFTE: number;
}

function parseNumber(value: string): number {
  if (!value || value === '') return 0;

  // Formato fixo BR: ponto como separador de milhar, vírgula como decimal
  // Ex: 1.234.567,89 → 1234567.89
  const cleanValue = value
    .trim()
    .replace(/\./g, '')   // remove separadores de milhar (pontos)
    .replace(',', '.');   // substitui vírgula decimal por ponto

  const parsed = parseFloat(cleanValue);

  if (isNaN(parsed)) {
    console.warn(`Não foi possível converter "${value}" para número`);
    return 0;
  }

  return parsed;
}

export function parseTxtData(content: string): RawDataRow[] {
  const lines = content.trim().split('\n');
  const data: RawDataRow[] = [];

  if (lines.length < 2) {
    console.error('Arquivo vazio ou sem dados');
    return [];
  }

  // Detecta o separador: verifica se a primeira linha tem mais vírgulas, ponto e vírgula ou tabs
  const firstLine = lines[0];
  const hasCommas = (firstLine.match(/,/g) || []).length;
  const hasSemicolons = (firstLine.match(/;/g) || []).length;
  const hasTabs = (firstLine.match(/\t/g) || []).length;

  let separator = '\t';
  let separatorName = 'tab';

  if (hasSemicolons > hasCommas && hasSemicolons > hasTabs) {
    separator = ';';
    separatorName = 'ponto e vírgula';
  } else if (hasCommas > hasTabs) {
    separator = ',';
    separatorName = 'vírgula';
  }

  console.log('Detecção de separador:', {
    hasCommas,
    hasSemicolons,
    hasTabs,
    separator: separatorName,
    firstLine,
  });

  // Processa as linhas (pula o cabeçalho)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(separator).map(part => part.trim());

    if (parts.length < 15) {
      console.warn(`Linha ${i + 1} ignorada: ${parts.length} colunas encontradas (esperado: 15)`);
      console.warn('Conteúdo:', parts);
      continue;
    }

    const row: RawDataRow = {
      cliente: parts[0],
      projeto: parts[1],
      colaborador: parts[2],
      empresa: parts[3],
      email: parts[4],
      time: parts[5],
      qtdehoras: parseNumber(parts[6]),
      mes: parts[7],
      ano: parts[8],
      horas_apontadas: parseNumber(parts[9]),
      valor_final_empresa: parseNumber(parts[10]),
      valor_hora: parseNumber(parts[11]),
      custo_projeto: parseNumber(parts[12]),
      tipo: parts[13],
      prevenda: parts[14] || '',
    };

    data.push(row);
  }

  console.log(`Total de registros processados: ${data.length}`);
  if (data.length > 0) {
    console.log('Primeiro registro:', data[0]);
    console.log('Tipos encontrados:', [...new Set(data.map(d => d.tipo))]);
  }

  return data;
}

function aggregateByTipo(rows: RawDataRow[], tipo: string): { custo: number; horas: number } {
  const filtered = rows.filter(row => row.tipo.toLowerCase().includes(tipo.toLowerCase()));
  return {
    custo: filtered.reduce((sum, row) => sum + row.custo_projeto, 0),
    horas: filtered.reduce((sum, row) => sum + row.horas_apontadas, 0),
  };
}

export function consolidateByArea(
  rawData: RawDataRow[],
  mes: string,
  ano: string,
  metas: Record<string, number>
): AreaData[] {
  const filtered = rawData.filter(row => row.mes === mes && row.ano === ano);

  const areaMap = new Map<string, RawDataRow[]>();
  filtered.forEach(row => {
    const area = row.time || 'Sem Time';
    if (!areaMap.has(area)) {
      areaMap.set(area, []);
    }
    areaMap.get(area)!.push(row);
  });

  const totalCusto = filtered.reduce((sum, row) => sum + row.custo_projeto, 0);
  const totalColaboradores = new Set(filtered.map(row => row.colaborador)).size;

  // Calcula totais por tipo
  const totals = {
    debitoBH: filtered.filter(r => r.tipo.toLowerCase().includes('débito') || r.tipo.toLowerCase().includes('debito')).reduce((sum, row) => sum + row.custo_projeto, 0),
    desalocacao: filtered.filter(r => r.tipo.toLowerCase().includes('desalocação') || r.tipo.toLowerCase().includes('desalocacao')).reduce((sum, row) => sum + row.custo_projeto, 0),
    faturado: filtered.filter(r => r.tipo.toLowerCase().includes('faturado')).reduce((sum, row) => sum + row.custo_projeto, 0),
    overhead: filtered.filter(r => r.tipo.toLowerCase().includes('overhead')).reduce((sum, row) => sum + row.custo_projeto, 0),
    ferias: filtered.filter(r => r.tipo.toLowerCase().includes('férias') || r.tipo.toLowerCase().includes('ferias')).reduce((sum, row) => sum + row.custo_projeto, 0),
  };

  console.log(`Consolidação Mensal: ${mes}/${ano}`, {
    totalRegistros: filtered.length,
    totalCustoGeral: totalCusto,
    areasEncontradas: Array.from(areaMap.keys()),
  });

  const result: AreaData[] = [];

  areaMap.forEach((rows, area) => {
    // Soma TODOS os valores de custo_projeto para esta área
    const custoTotal = rows.reduce((sum, row) => sum + row.custo_projeto, 0);
    const colaboradoresUnicos = new Set(rows.map(row => row.colaborador)).size;

    console.log(`Área: ${area} (Mensal)`, {
      totalRegistros: rows.length,
      custoTotal: custoTotal,
      custosPorRegistro: rows.map(r => ({
        colaborador: r.colaborador,
        projeto: r.projeto,
        custo: r.custo_projeto,
        tipo: r.tipo
      })),
    });

    // Agrega por tipo
    const debitoBH = aggregateByTipo(rows, 'débito');
    const desalocacao = aggregateByTipo(rows, 'desalocação');
    const faturado = aggregateByTipo(rows, 'faturado');
    const overhead = aggregateByTipo(rows, 'overhead');
    const ferias = aggregateByTipo(rows, 'férias');

    const horasTotais = debitoBH.horas + desalocacao.horas + faturado.horas + overhead.horas + ferias.horas;

    const percentualDesalocacaoSemFerias = horasTotais > 0
      ? (desalocacao.horas / horasTotais) * 100
      : 0;

    const percentualDesalocacaoComFerias = horasTotais > 0
      ? ((desalocacao.horas + ferias.horas) / horasTotais) * 100
      : 0;

    const meta = metas[area] || 0;
    const variacaoMeta = percentualDesalocacaoComFerias - meta;

    const custoMedioFTE = colaboradoresUnicos > 0 ? custoTotal / colaboradoresUnicos : 0;
    const ociososidadeRS = desalocacao.custo;
    const ociososidadeFTE = custoMedioFTE > 0 ? desalocacao.custo / custoMedioFTE : 0;

    result.push({
      area,
      custoTotal,
      percentualCustoTotal: totalCusto > 0 ? (custoTotal / totalCusto) * 100 : 0,
      totalColaboradores: colaboradoresUnicos,
      percentualColaboradores: totalColaboradores > 0 ? (colaboradoresUnicos / totalColaboradores) * 100 : 0,
      debitoBH: {
        custo: debitoBH.custo,
        percentual: totals.debitoBH > 0 ? (debitoBH.custo / totals.debitoBH) * 100 : 0,
        horas: debitoBH.horas,
      },
      desalocacao: {
        custo: desalocacao.custo,
        percentual: totals.desalocacao > 0 ? (desalocacao.custo / totals.desalocacao) * 100 : 0,
        horas: desalocacao.horas,
      },
      faturado: {
        custo: faturado.custo,
        percentual: totals.faturado > 0 ? (faturado.custo / totals.faturado) * 100 : 0,
        horas: faturado.horas,
      },
      overhead: {
        custo: overhead.custo,
        percentual: totals.overhead > 0 ? (overhead.custo / totals.overhead) * 100 : 0,
        horas: overhead.horas,
      },
      ferias: {
        custo: ferias.custo,
        percentual: totals.ferias > 0 ? (ferias.custo / totals.ferias) * 100 : 0,
        horas: ferias.horas,
      },
      percentualDesalocacaoSemFerias,
      percentualDesalocacaoComFerias,
      meta,
      variacaoMeta,
      custoMedioFTE,
      ociososidadeRS,
      ociososidadeFTE,
    });
  });

  return result.sort((a, b) => a.area.localeCompare(b.area));
}

export function consolidateByYear(
  rawData: RawDataRow[],
  ano: string,
  metas: Record<string, number>
): AreaData[] {
  const filtered = rawData.filter(row => row.ano === ano);

  const areaMap = new Map<string, RawDataRow[]>();
  filtered.forEach(row => {
    const area = row.time || 'Sem Time';
    if (!areaMap.has(area)) {
      areaMap.set(area, []);
    }
    areaMap.get(area)!.push(row);
  });

  const totalCusto = filtered.reduce((sum, row) => sum + row.custo_projeto, 0);
  const totalColaboradores = new Set(filtered.map(row => row.colaborador)).size;

  // Calcula totais por tipo
  const totals = {
    debitoBH: filtered.filter(r => r.tipo.toLowerCase().includes('débito') || r.tipo.toLowerCase().includes('debito')).reduce((sum, row) => sum + row.custo_projeto, 0),
    desalocacao: filtered.filter(r => r.tipo.toLowerCase().includes('desalocação') || r.tipo.toLowerCase().includes('desalocacao')).reduce((sum, row) => sum + row.custo_projeto, 0),
    faturado: filtered.filter(r => r.tipo.toLowerCase().includes('faturado')).reduce((sum, row) => sum + row.custo_projeto, 0),
    overhead: filtered.filter(r => r.tipo.toLowerCase().includes('overhead')).reduce((sum, row) => sum + row.custo_projeto, 0),
    ferias: filtered.filter(r => r.tipo.toLowerCase().includes('férias') || r.tipo.toLowerCase().includes('ferias')).reduce((sum, row) => sum + row.custo_projeto, 0),
  };

  console.log(`Consolidação Anual: ${ano}`, {
    totalRegistros: filtered.length,
    totalCustoGeral: totalCusto,
    areasEncontradas: Array.from(areaMap.keys()),
  });

  const result: AreaData[] = [];

  areaMap.forEach((rows, area) => {
    // Soma TODOS os valores de custo_projeto para esta área
    const custoTotal = rows.reduce((sum, row) => sum + row.custo_projeto, 0);
    const colaboradoresUnicos = new Set(rows.map(row => row.colaborador)).size;

    console.log(`Área: ${area} (Anual)`, {
      totalRegistros: rows.length,
      custoTotal: custoTotal,
    });

    // Agrega por tipo
    const debitoBH = aggregateByTipo(rows, 'débito');
    const desalocacao = aggregateByTipo(rows, 'desalocação');
    const faturado = aggregateByTipo(rows, 'faturado');
    const overhead = aggregateByTipo(rows, 'overhead');
    const ferias = aggregateByTipo(rows, 'férias');

    const horasTotais = debitoBH.horas + desalocacao.horas + faturado.horas + overhead.horas + ferias.horas;

    const percentualDesalocacaoSemFerias = horasTotais > 0
      ? (desalocacao.horas / horasTotais) * 100
      : 0;

    const percentualDesalocacaoComFerias = horasTotais > 0
      ? ((desalocacao.horas + ferias.horas) / horasTotais) * 100
      : 0;

    const meta = metas[area] || 0;
    const variacaoMeta = percentualDesalocacaoComFerias - meta;

    const custoMedioFTE = colaboradoresUnicos > 0 ? custoTotal / colaboradoresUnicos : 0;
    const ociososidadeRS = desalocacao.custo;
    const ociososidadeFTE = custoMedioFTE > 0 ? desalocacao.custo / custoMedioFTE : 0;

    result.push({
      area,
      custoTotal,
      percentualCustoTotal: totalCusto > 0 ? (custoTotal / totalCusto) * 100 : 0,
      totalColaboradores: colaboradoresUnicos,
      percentualColaboradores: totalColaboradores > 0 ? (colaboradoresUnicos / totalColaboradores) * 100 : 0,
      debitoBH: {
        custo: debitoBH.custo,
        percentual: totals.debitoBH > 0 ? (debitoBH.custo / totals.debitoBH) * 100 : 0,
        horas: debitoBH.horas,
      },
      desalocacao: {
        custo: desalocacao.custo,
        percentual: totals.desalocacao > 0 ? (desalocacao.custo / totals.desalocacao) * 100 : 0,
        horas: desalocacao.horas,
      },
      faturado: {
        custo: faturado.custo,
        percentual: totals.faturado > 0 ? (faturado.custo / totals.faturado) * 100 : 0,
        horas: faturado.horas,
      },
      overhead: {
        custo: overhead.custo,
        percentual: totals.overhead > 0 ? (overhead.custo / totals.overhead) * 100 : 0,
        horas: overhead.horas,
      },
      ferias: {
        custo: ferias.custo,
        percentual: totals.ferias > 0 ? (ferias.custo / totals.ferias) * 100 : 0,
        horas: ferias.horas,
      },
      percentualDesalocacaoSemFerias,
      percentualDesalocacaoComFerias,
      meta,
      variacaoMeta,
      custoMedioFTE,
      ociososidadeRS,
      ociososidadeFTE,
    });
  });

  return result.sort((a, b) => a.area.localeCompare(b.area));
}

export function getAvailableMonths(data: RawDataRow[]): string[] {
  const months = new Set(data.map(row => row.mes));
  return Array.from(months).sort();
}

export function getAvailableYears(data: RawDataRow[]): string[] {
  const years = new Set(data.map(row => row.ano));
  return Array.from(years).sort();
}

export function getAreas(data: RawDataRow[]): string[] {
  const areas = new Set(data.map(row => row.time || 'Sem Time'));
  return Array.from(areas).sort();
}
