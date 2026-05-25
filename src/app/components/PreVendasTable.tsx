import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { type RawDataRow, consolidatePreVendas, type PreVendaRow } from '../utils/dataParser';

interface PreVendasTableProps {
  rawData: RawDataRow[];
}

interface DrillDown {
  cliente: string;
  proposta: string;
  rows: RawDataRow[];
}

export function PreVendasTable({ rawData }: PreVendasTableProps) {
  const [rows, setRows] = useState<PreVendaRow[]>([]);
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);

  useEffect(() => {
    setRows(consolidatePreVendas(rawData));
  }, [rawData]);

  const toggleVendido = (idx: number) => {
    setRows(prev =>
      prev.map((r, i) => (i === idx ? { ...r, projetoVendido: !r.projetoVendido } : r))
    );
  };

  const openDrillDown = (cliente: string, proposta: string) => {
    const drillRows = rawData.filter(
      r => r.cliente === cliente && r.projeto === proposta
    );
    setDrillDown({ cliente, proposta, rows: drillRows });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatHours = (value: number) =>
    `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}h`;

  const formatNumber = (value: number, decimals = 1) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

  const totalCusto = rows.reduce((s, r) => s + r.custoTotal, 0);
  const totalHoras = rows.reduce((s, r) => s + r.totalHoras, 0);
  const totalVendidas = rows.filter(r => r.projetoVendido).length;
  const custoVendidas = rows.filter(r => r.projetoVendido).reduce((s, r) => s + r.custoTotal, 0);

  const drillDownTotal = drillDown
    ? drillDown.rows.reduce((sum, r) => sum + r.custo_projeto, 0)
    : 0;

  const drillDownHoras = drillDown
    ? drillDown.rows.reduce((sum, r) => sum + r.qtdehoras, 0)
    : 0;

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pré-Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma pré-venda encontrada. Registros de pré-venda devem conter <strong>"PV -"</strong> na coluna <em>projeto</em>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total de Propostas</p>
              <p className="text-2xl font-semibold">{rows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Custo Total PV</p>
              <p className="text-2xl font-semibold">{formatCurrency(totalCusto)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total de Horas</p>
              <p className="text-2xl font-semibold">{formatHours(totalHoras)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Projetos Vendidos</p>
              <p className="text-2xl font-semibold">
                {totalVendidas}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({formatCurrency(custoVendidas)})
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Consolidação de Pré-Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Cliente</TableHead>
                    <TableHead className="min-w-[220px]">Proposta</TableHead>
                    <TableHead className="min-w-[160px]">
                      <span title="Clique para ver os lançamentos">Custo Total ↗</span>
                    </TableHead>
                    <TableHead className="min-w-[120px] text-right">Total Horas</TableHead>
                    <TableHead className="min-w-[140px] text-center">Projeto Vendido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow
                      key={`${row.cliente}-${row.proposta}`}
                      className={row.projetoVendido ? 'bg-green-50 dark:bg-green-950/20' : ''}
                    >
                      <TableCell className="font-medium">{row.cliente}</TableCell>
                      <TableCell>{row.proposta}</TableCell>

                      {/* Custo Total — clicável */}
                      <TableCell
                        className="cursor-pointer hover:bg-muted/60 transition-colors select-none"
                        onClick={() => openDrillDown(row.cliente, row.proposta)}
                      >
                        <span className="underline decoration-dotted tabular-nums">
                          {formatCurrency(row.custoTotal)}
                        </span>
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {formatHours(row.totalHoras)}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleVendido(idx)}
                          className="focus:outline-none"
                          title={row.projetoVendido ? 'Marcar como não vendido' : 'Marcar como vendido'}
                        >
                          <Badge
                            variant={row.projetoVendido ? 'default' : 'outline'}
                            className={
                              row.projetoVendido
                                ? 'cursor-pointer bg-green-600 hover:bg-green-700 select-none'
                                : 'cursor-pointer hover:bg-muted select-none'
                            }
                          >
                            {row.projetoVendido ? '✓ Vendido' : 'Pendente'}
                          </Badge>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                {/* Totals row */}
                <tfoot>
                  <tr className="border-t-2 bg-muted/40 font-semibold">
                    <td className="px-4 py-3 text-sm" colSpan={2}>
                      Total ({rows.length} propostas)
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums">
                      {formatCurrency(totalCusto)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums">
                      {formatHours(totalHoras)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                      {totalVendidas} vendido(s)
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Drill-Down */}
      <Dialog open={!!drillDown} onOpenChange={(open) => !open && setDrillDown(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Lançamentos — {drillDown?.proposta}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({drillDown?.cliente})
              </span>
            </DialogTitle>
          </DialogHeader>

          {drillDown && (
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{drillDown.rows.length} registro(s)</span>
                <span>•</span>
                <span>
                  Custo total:{' '}
                  <strong className="text-foreground">
                    {formatCurrency(drillDownTotal)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Total de horas:{' '}
                  <strong className="text-foreground">
                    {formatHours(drillDownHoras)}
                  </strong>
                </span>
              </div>

              <div className="overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Mês</TableHead>
                      <TableHead>Ano</TableHead>
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
                          <TableCell>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {r.tipo}
                            </span>
                          </TableCell>
                          <TableCell>{r.mes}</TableCell>
                          <TableCell>{r.ano}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(r.qtdehoras)}h
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(r.valor_hora)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
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
