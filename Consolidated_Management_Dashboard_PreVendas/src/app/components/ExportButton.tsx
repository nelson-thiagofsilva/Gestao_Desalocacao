import { Download } from 'lucide-react';
import { Button } from './ui/button';

interface ExportButtonProps {
  data: Array<{
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
  }>;
  period: string;
}

export function ExportButton({ data, period }: ExportButtonProps) {
  const handleExport = () => {
    const headers = [
      'Área',
      'Custo Total',
      '% Custo',
      'Colaboradores',
      '% Colaboradores',
      'Débito BH - Custo',
      'Débito BH - %',
      'Débito BH - Horas',
      'Desalocação - Custo',
      'Desalocação - %',
      'Desalocação - Horas',
      'Faturado - Custo',
      'Faturado - %',
      'Faturado - Horas',
      'Overhead - Custo',
      'Overhead - %',
      'Overhead - Horas',
      'Férias - Custo',
      'Férias - %',
      'Férias - Horas',
      '% Desalocação (-Férias)',
      '% Desalocação (+Férias)',
      'Meta',
      'Variação Meta',
      'Custo Médio FTE',
      'Ociosidade R$',
      'Ociosidade FTE',
    ];

    const rows = data.map(row => [
      row.area,
      row.custoTotal.toFixed(2),
      row.percentualCustoTotal.toFixed(2),
      row.totalColaboradores,
      row.percentualColaboradores.toFixed(2),
      row.debitoBH.custo.toFixed(2),
      row.debitoBH.percentual.toFixed(2),
      row.debitoBH.horas.toFixed(0),
      row.desalocacao.custo.toFixed(2),
      row.desalocacao.percentual.toFixed(2),
      row.desalocacao.horas.toFixed(0),
      row.faturado.custo.toFixed(2),
      row.faturado.percentual.toFixed(2),
      row.faturado.horas.toFixed(0),
      row.overhead.custo.toFixed(2),
      row.overhead.percentual.toFixed(2),
      row.overhead.horas.toFixed(0),
      row.ferias.custo.toFixed(2),
      row.ferias.percentual.toFixed(2),
      row.ferias.horas.toFixed(0),
      row.percentualDesalocacaoSemFerias.toFixed(2),
      row.percentualDesalocacaoComFerias.toFixed(2),
      row.meta.toFixed(2),
      row.variacaoMeta.toFixed(2),
      row.custoMedioFTE.toFixed(2),
      row.ociososidadeRS.toFixed(2),
      row.ociososidadeFTE.toFixed(2),
    ]);

    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consolidacao-${period.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Exportar Dados
    </Button>
  );
}
