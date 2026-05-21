import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ExportButton } from './ExportButton';
import { type RawDataRow } from '../utils/dataParser';

interface AreaData {
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

interface DrillDown {
  area: string;
  column: string;
  rows: RawDataRow[];
}

interface ConsolidationTableProps {
  data: AreaData[];
  period: string;
  rawData: RawDataRow[];
}

const TIPO_FILTERS: Record<string, (tipo: string) => boolean> = {
  'Custo Total': () => true,
  'Débito BH': (t) => t.toLowerCase().includes('débito') || t.toLowerCase().includes('debito'),
  'Desalocação': (t) => t.toLowerCase().includes('desalocação') || t.toLowerCase().includes('desalocacao'),
  'Faturado': (t) => t.toLowerCase().includes('faturado'),
  'Overhead': (t) => t.toLowerCase().includes('overhead'),
  'Férias': (t) => t.toLowerCase().includes('férias') || t.toLowerCase().includes('ferias'),
};

export function ConsolidationTable({ data, period, rawData }: ConsolidationTableProps) {
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercent = (value: number) =>
    `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;

  const formatHours = (value: number) =>
    `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}h`;

  const formatNumber = (value: number, decimals = 2) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

  const openDrillDown = (area: string, column: string) => {
    const tipoFilter = TIPO_FILTERS[column];
    const rows = rawData.filter(
      (r) => (r.time || 'Sem Time') === area && tipoFilter(r.tipo)
    );
    setDrillDown({ area, column, rows });
  };

  const drillDownTotal = drillDown
    ? drillDown.rows.reduce((sum, r) => sum + r.custo_projeto, 0)
    : 0;

  const clickableCell =
    'cursor-pointer hover:bg-muted/60 transition-colors select-none';

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Consolidação - {period}</CardTitle>
          <ExportButton data={data} period={period} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Área</TableHead>
                  <TableHead className="min-w-[120px]">
                    <span title="Clique para ver os registros">Custo Total ↗</span>
                  </TableHead>
                  <TableHead className="min-w-[80px]">% Custo</TableHead>
                  <TableHead className="min-w-[100px]">Colaboradores</TableHead>
                  <TableHead className="min-w-[80px]">% Colab.</TableHead>
                  <TableHead className="min-w-[150px]">
                    <span title="Clique para ver os registros">Débito BH ↗</span>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <span title="Clique para ver os registros">Desalocação ↗</span>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <span title="Clique para ver os registros">Faturado ↗</span>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <span title="Clique para ver os registros">Overhead ↗</span>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <span title="Clique para ver os registros">Férias ↗</span>
                  </TableHead>
                  <TableHead className="min-w-[120px]">% Desaloc. (-Férias)</TableHead>
                  <TableHead className="min-w-[120px]">% Desaloc. (+Férias)</TableHead>
                  <TableHead className="min-w-[80px]">Meta</TableHead>
                  <TableHead className="min-w-[120px]">Variação Meta</TableHead>
                  <TableHead className="min-w-[120px]">Custo Médio FTE</TableHead>
                  <TableHead className="min-w-[120px]">Ociosidade R$</TableHead>
                  <TableHead className="min-w-[120px]">Ociosidade FTE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.area}>
                    <TableCell>{row.area}</TableCell>

                    {/* Custo Total — clicável */}
                    <TableCell
                      className={clickableCell}
                      onClick={() => openDrillDown(row.area, 'Custo Total')}
                    >
                      <span className="underline decoration-dotted">
                        {formatCurrency(row.custoTotal)}
                      </span>
                    </TableCell>

                    <TableCell>{formatPercent(row.percentualCustoTotal)}</TableCell>
                    <TableCell>{row.totalColaboradores}</TableCell>
                    <TableCell>{formatPercent(row.percentualColaboradores)}</TableCell>

                    {/* Débito BH — clicável */}
                    <TableCell
                      className={clickableCell}
                      onClick={() => openDrillDown(row.area, 'Débito BH')}
                    >
                      <div className="underline decoration-dotted">
                        {formatCurrency(row.debitoBH.custo)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercent(row.debitoBH.percentual)} • {formatHours(row.debitoBH.horas)}
                      </div>
                    </TableCell>

                    {/* Desalocação — clicável */}
                    <TableCell
                      className={clickableCell}
                      onClick={() => openDrillDown(row.area, 'Desalocação')}
                    >
                      <div className="underline decoration-dotted">
                        {formatCurrency(row.desalocacao.custo)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercent(row.desalocacao.percentual)} • {formatHours(row.desalocacao.horas)}
                      </div>
                    </TableCell>

                    {/* Faturado — clicável */}
                    <TableCell
                      className={clickableCell}
                      onClick={() => openDrillDown(row.area, 'Faturado')}
                    >
                      <div className="underline decoration-dotted">
                        {formatCurrency(row.faturado.custo)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercent(row.faturado.percentual)} • {formatHours(row.faturado.horas)}
                      </div>
                    </TableCell>

                    {/* Overhead — clicável */}
                    <TableCell
                      className={clickableCell}
                      onClick={() => openDrillDown(row.area, 'Overhead')}
                    >
                      <div className="underline decoration-dotted">
                        {formatCurrency(row.overhead.custo)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercent(row.overhead.percentual)} • {formatHours(row.overhead.horas)}
                      </div>
                    </TableCell>

                    {/* Férias — clicável */}
                    <TableCell
                      className={clickableCell}
                      onClick={() => openDrillDown(row.area, 'Férias')}
                    >
                      <div className="underline decoration-dotted">
                        {formatCurrency(row.ferias.custo)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercent(row.ferias.percentual)} • {formatHours(row.ferias.horas)}
                      </div>
                    </TableCell>

                    <TableCell>{formatPercent(row.percentualDesalocacaoSemFerias)}</TableCell>
                    <TableCell>{formatPercent(row.percentualDesalocacaoComFerias)}</TableCell>
                    <TableCell>{formatPercent(row.meta)}</TableCell>
                    <TableCell className={row.variacaoMeta > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatPercent(row.variacaoMeta)}
                    </TableCell>
                    <TableCell>{formatCurrency(row.custoMedioFTE)}</TableCell>
                    <TableCell>{formatCurrency(row.ociososidadeRS)}</TableCell>
                    <TableCell>{formatNumber(row.ociososidadeFTE)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Drill-Down */}
      <Dialog open={!!drillDown} onOpenChange={(open) => !open && setDrillDown(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {drillDown?.column} — {drillDown?.area}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                ({period})
              </span>
            </DialogTitle>
          </DialogHeader>

          {drillDown && (
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{drillDown.rows.length} registro(s)</span>
                <span>•</span>
                <span>
                  Total:{' '}
                  <strong className="text-foreground">
                    {formatCurrency(drillDownTotal)}
                  </strong>
                </span>
              </div>

              <div className="overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Valor/Hora</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drillDown.rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      drillDown.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.colaborador}</TableCell>
                          <TableCell>{r.cliente}</TableCell>
                          <TableCell>{r.projeto}</TableCell>
                          <TableCell>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {r.tipo}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(r.horas_apontadas, 1)}h
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(r.valor_hora)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(r.custo_projeto)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
