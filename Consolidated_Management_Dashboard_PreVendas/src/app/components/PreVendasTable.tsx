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
import { type RawDataRow, consolidatePreVendas, type PreVendaRow } from '../utils/dataParser';

interface PreVendasTableProps {
  rawData: RawDataRow[];
}

export function PreVendasTable({ rawData }: PreVendasTableProps) {
  const [rows, setRows] = useState<PreVendaRow[]>([]);

  useEffect(() => {
    setRows(consolidatePreVendas(rawData));
  }, [rawData]);

  const toggleVendido = (idx: number) => {
    setRows(prev =>
      prev.map((r, i) => (i === idx ? { ...r, projetoVendido: !r.projetoVendido } : r))
    );
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatHours = (value: number) =>
    `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}h`;

  const totalCusto = rows.reduce((s, r) => s + r.custoTotal, 0);
  const totalHoras = rows.reduce((s, r) => s + r.totalHoras, 0);
  const totalVendidas = rows.filter(r => r.projetoVendido).length;
  const custoVendidas = rows.filter(r => r.projetoVendido).reduce((s, r) => s + r.custoTotal, 0);

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
                  <TableHead className="min-w-[140px] text-right">Custo Total</TableHead>
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
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.custoTotal)}
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
                  <td className="px-4 py-3 text-sm text-right tabular-nums">
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
  );
}
