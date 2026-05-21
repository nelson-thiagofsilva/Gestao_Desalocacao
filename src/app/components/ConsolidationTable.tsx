import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExportButton } from './ExportButton';

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

interface ConsolidationTableProps {
  data: AreaData[];
  period: string;
}

export function ConsolidationTable({ data, period }: ConsolidationTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatHours = (value: number) => {
    return `${value.toFixed(0)}h`;
  };

  return (
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
                <TableHead className="min-w-[120px]">Custo Total</TableHead>
                <TableHead className="min-w-[80px]">% Custo</TableHead>
                <TableHead className="min-w-[100px]">Colaboradores</TableHead>
                <TableHead className="min-w-[80px]">% Colab.</TableHead>
                <TableHead className="min-w-[150px]">Débito BH</TableHead>
                <TableHead className="min-w-[150px]">Desalocação</TableHead>
                <TableHead className="min-w-[150px]">Faturado</TableHead>
                <TableHead className="min-w-[150px]">Overhead</TableHead>
                <TableHead className="min-w-[150px]">Férias</TableHead>
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
                  <TableCell>{formatCurrency(row.custoTotal)}</TableCell>
                  <TableCell>{formatPercent(row.percentualCustoTotal)}</TableCell>
                  <TableCell>{row.totalColaboradores}</TableCell>
                  <TableCell>{formatPercent(row.percentualColaboradores)}</TableCell>
                  <TableCell>
                    <div>{formatCurrency(row.debitoBH.custo)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(row.debitoBH.percentual)} • {formatHours(row.debitoBH.horas)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{formatCurrency(row.desalocacao.custo)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(row.desalocacao.percentual)} • {formatHours(row.desalocacao.horas)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{formatCurrency(row.faturado.custo)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(row.faturado.percentual)} • {formatHours(row.faturado.horas)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{formatCurrency(row.overhead.custo)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(row.overhead.percentual)} • {formatHours(row.overhead.horas)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{formatCurrency(row.ferias.custo)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(row.ferias.percentual)} • {formatHours(row.ferias.horas)}
                    </div>
                  </TableCell>
                  <TableCell>{formatPercent(row.percentualDesalocacaoSemFerias)}</TableCell>
                  <TableCell>{formatPercent(row.percentualDesalocacaoComFerias)}</TableCell>
                  <TableCell>{formatPercent(row.meta)}</TableCell>
                  <TableCell
                    className={row.variacaoMeta > 0 ? 'text-red-600' : 'text-green-600'}
                  >
                    {formatPercent(row.variacaoMeta)}
                  </TableCell>
                  <TableCell>{formatCurrency(row.custoMedioFTE)}</TableCell>
                  <TableCell>{formatCurrency(row.ociososidadeRS)}</TableCell>
                  <TableCell>{row.ociososidadeFTE.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
