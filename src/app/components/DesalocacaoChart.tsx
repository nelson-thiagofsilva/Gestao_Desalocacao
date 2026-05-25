import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

interface DesalocacaoChartProps {
  data: Array<{
    area: string;
    percentualDesalocacaoComFerias: number;
    percentualDesalocacaoSemFerias: number;
    meta: number;
  }>;
}

const BRAND = {
  primary:   '#782170',
  light:     '#a0639a',
  lighter:   '#c29bbe',
  rose:      '#a02148',
  dark:      '#4e1548',
  metaLine:  '#e4d2e2',
};

const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;

export function DesalocacaoChart({ data }: DesalocacaoChartProps) {
  const chartData = data.map(item => ({
    area: item.area,
    'Desalocação c/ Férias (%)': parseFloat(item.percentualDesalocacaoComFerias.toFixed(2)),
    'Desalocação s/ Férias (%)': parseFloat(item.percentualDesalocacaoSemFerias.toFixed(2)),
    'Meta (%)': parseFloat(item.meta.toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md text-sm space-y-1">
        <p className="font-medium text-card-foreground">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatPercent(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desalocação vs Meta por Área</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,33,112,0.1)" />
            <XAxis
              dataKey="area"
              angle={-40}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12, fill: '#8a5f86' }}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: '#8a5f86' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar dataKey="Desalocação c/ Férias (%)" fill={BRAND.primary} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Desalocação s/ Férias (%)" fill={BRAND.light}   radius={[3, 3, 0, 0]} />
            <Bar dataKey="Meta (%)"                  fill={BRAND.lighter} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
