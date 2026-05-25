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
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type RawDataRow, consolidatePreVendas, type PreVendaRow } from '../utils/dataParser';

interface PreVendasTableProps {
  rawData: RawDataRow[];
}

interface DrillDown {
  cliente: string;
  proposta: string;
  rows: RawDataRow[];
}

interface ClienteGroup {
  cliente: string;
  propostas: PreVendaRow[];
  custoTotal: number;
  totalHoras: number;
  qtdVendido: number;
  pctVendido: number;
}

function buildGroups(rows: PreVendaRow[]): ClienteGroup[] {
  const map = new Map<string, PreVendaRow[]>();
  rows.forEach(r => {
    if (!map.has(r.cliente)) map.set(r.cliente, []);
    map.get(r.cliente)!.push(r);
  });
  const groups: ClienteGroup[] = [];
  map.forEach((propostas, cliente) => {
    const custoTotal = propostas.reduce((s, p) => s + p.custoTotal, 0);
    const totalHoras = propostas.reduce((s, p) => s + p.totalHoras, 0);
    const qtdVendido = propostas.filter(p => p.projetoVendido).length;
    const pctVendido = propostas.length > 0 ? (qtdVendido / propostas.length) * 100 : 0;
    groups.push({ cliente, propostas, custoTotal, totalHoras, qtdVendido, pctVendido });
  });
  return groups.sort((a, b) => a.cliente.localeCompare(b.cliente));
}

export function PreVendasTable({ rawData }: PreVendasTableProps) {
  const [rows, setRows] = useState<PreVendaRow[]>([]);
  const [expandedClientes, setExpandedClientes] = useState<Set<string>>(new Set());
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);

  useEffect(() => {
    setRows(consolidatePreVendas(rawData));
  }, [rawData]);

  const groups = buildGroups(rows);

  const toggleCliente = (cliente: string) => {
    setExpandedClientes(prev => {
      const next = new Set(prev);
      next.has(cliente) ? next.delete(cliente) : next.add(cliente);
      return next;
    });
  };

  const toggleVendido = (cliente: string, proposta: string) => {
    setRows(prev =>
      prev.map(r =>
        r.cliente === cliente && r.proposta === proposta
          ? { ...r, projetoVendido: !r.projetoVendido }
          : r
      )
    );
  };

  const openDrillDown = (cliente: string, proposta: string) => {
    const drillRows = rawData.filter(r => r.cliente === cliente && r.projeto === proposta);
    setDrillDown({ cliente, proposta, rows: drillRows });
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtH = (v: number) =>
    `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v)}h`;
  const fmtPct = (v: number) =>
    `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v)}%`;
  const fmtN = (v: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);

  const totalCusto = rows.reduce((s, r) => s + r.custoTotal, 0);
  const totalHoras = rows.reduce((s, r) => s + r.totalHoras, 0);
  const totalVendidas = rows.filter(r => r.projetoVendido).length;
  const custoVendidas = rows.filter(r => r.projetoVendido).reduce((s, r) => s + r.custoTotal, 0);

  const drillDownTotal = drillDown ? drillDown.rows.reduce((s, r) => s + r.custo_projeto, 0) : 0;
  const drillDownHoras = drillDown ? drillDown.rows.reduce((s, r) => s + r.qtdehoras, 0) : 0;

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Pré-Vendas</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma pré-venda encontrada. Registros devem conter <strong>"PV -"</strong> na coluna <em>projeto</em>.
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
              <p className="text-2xl font-semibold">{fmt(totalCusto)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total de Horas</p>
              <p className="text-2xl font-semibold">{fmtH(totalHoras)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Projetos Vendidos</p>
              <p className="text-2xl font-semibold">
                {totalVendidas}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({fmt(custoVendidas)})
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grouped table */}
        <Card>
          <CardHeader>
            <CardTitle>Consolidação por Cliente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="min-w-[180px]">Cliente / Proposta</TableHead>
                    <TableHead className="min-w-[110px] text-center">Qtd. PVs</TableHead>
                    <TableHead className="min-w-[140px] text-right">Total Horas</TableHead>
                    <TableHead className="min-w-[160px]">
                      <span title="Clique no valor para ver os lançamentos">Custo Total ↗</span>
                    </TableHead>
                    <TableHead className="min-w-[140px] text-center">% Vendido</TableHead>
                    <TableHead className="min-w-[140px] text-center">Projeto Vendido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map(group => {
                    const expanded = expandedClientes.has(group.cliente);
                    return (
                      <>
                        {/* ── Cliente group row ── */}
                        <TableRow
                          key={`group-${group.cliente}`}
                          className="bg-muted/50 hover:bg-muted cursor-pointer font-semibold"
                          onClick={() => toggleCliente(group.cliente)}
                        >
                          <TableCell className="pl-3 pr-0">
                            {expanded
                              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </TableCell>
                          <TableCell>{group.cliente}</TableCell>
                          <TableCell className="text-center">{group.propostas.length}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtH(group.totalHoras)}</TableCell>
                          <TableCell className="tabular-nums">{fmt(group.custoTotal)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${group.pctVendido}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums">{fmtPct(group.pctVendido)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {group.qtdVendido}/{group.propostas.length}
                          </TableCell>
                        </TableRow>

                        {/* ── Proposal detail rows ── */}
                        {expanded && group.propostas.map(row => (
                          <TableRow
                            key={`${row.cliente}-${row.proposta}`}
                            className={row.projetoVendido ? 'bg-green-50 dark:bg-green-950/20' : 'bg-background'}
                          >
                            <TableCell />
                            <TableCell className="pl-7 text-sm text-muted-foreground">
                              ↳ {row.proposta}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm">—</TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {fmtH(row.totalHoras)}
                            </TableCell>
                            {/* Custo — clicável drill-down */}
                            <TableCell
                              className="cursor-pointer hover:bg-muted/60 transition-colors select-none text-sm"
                              onClick={() => openDrillDown(row.cliente, row.proposta)}
                            >
                              <span className="underline decoration-dotted tabular-nums">
                                {fmt(row.custoTotal)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm">—</TableCell>
                            <TableCell className="text-center">
                              <button
                                onClick={() => toggleVendido(row.cliente, row.proposta)}
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
                      </>
                    );
                  })}
                </TableBody>

                {/* Grand total */}
                <tfoot>
                  <tr className="border-t-2 bg-muted/40 font-semibold text-sm">
                    <td />
                    <td className="px-4 py-3">Total ({groups.length} cliente(s) · {rows.length} propostas)</td>
                    <td className="px-4 py-3 text-center">{rows.length}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtH(totalHoras)}</td>
                    <td className="px-4 py-3 tabular-nums">{fmt(totalCusto)}</td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {fmtPct(rows.length > 0 ? (totalVendidas / rows.length) * 100 : 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="tabular-nums">{totalVendidas}/{rows.length}</span>
                      <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                        ({fmtPct(rows.length > 0 ? (totalVendidas / rows.length) * 100 : 0)})
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Drill-Down */}
      <Dialog open={!!drillDown} onOpenChange={open => !open && setDrillDown(null)}>
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
                <span>Custo total: <strong className="text-foreground">{fmt(drillDownTotal)}</strong></span>
                <span>•</span>
                <span>Total de horas: <strong className="text-foreground">{fmtH(drillDownHoras)}</strong></span>
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
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.tipo}</span>
                          </TableCell>
                          <TableCell>{r.mes}</TableCell>
                          <TableCell>{r.ano}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtN(r.qtdehoras)}h</TableCell>
                          <TableCell className="text-right tabular-nums">{fmt(r.valor_hora)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{fmt(r.custo_projeto)}</TableCell>
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
