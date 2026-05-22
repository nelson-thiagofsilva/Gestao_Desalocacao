import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from './ui/table';
import { type DesalocacaoMensalRow } from '../utils/dataParser';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

interface Props {
  data: DesalocacaoMensalRow[];
  ano: string;
}

const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;

function percentColor(value: number): string {
  if (value === 0) return '';
  if (value <= 10) return 'text-green-600 font-medium';
  if (value <= 20) return 'text-yellow-600 font-medium';
  return 'text-red-600 font-medium';
}

export function DesalocacaoMensalTable({ data, ano }: Props) {
  if (!data.length) return null;

  // Meses que aparecem em qualquer área
  const meses = Array.from(
    new Set(data.flatMap(r => Object.keys(r.meses)))
  ).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>% Desalocação (+Férias) por Mês — Ano {ano}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px] sticky left-0 bg-card z-10">
                  Área
                </TableHead>
                {meses.map(m => (
                  <TableHead key={m} className="text-center min-w-[80px]">
                    {MONTH_LABELS[m] ?? m}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.area}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">
                    {row.area}
                  </TableCell>
                  {meses.map(m => {
                    const val = row.meses[m] ?? 0;
                    return (
                      <TableCell
                        key={m}
                        className={`text-center ${percentColor(val)}`}
                      >
                        {val > 0 ? formatPercent(val) : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
