import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CustoChartProps {
  data: Array<{
    area: string;
    custoTotal: number;
  }>;
}

// Paleta derivada do brand #782170 — suficiente para até 12 áreas
const BRAND_PALETTE = [
  '#782170', // brand principal
  '#a0639a', // roxo médio
  '#c29bbe', // roxo claro
  '#a02148', // rosa escuro
  '#4e1548', // roxo escuro
  '#be4b96', // magenta
  '#601a59', // ameixa
  '#d490c8', // lavanda pink
  '#340d32', // quase preto roxo
  '#8c3585', // roxo saturado
  '#e8b8e2', // lilás suave
  '#6b1260', // vinho roxo
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: { percent } } = payload[0];
  return (
    <div className="rounded-lg border bg-card p-3 shadow-md text-sm space-y-1">
      <p className="font-medium text-card-foreground">{name}</p>
      <p style={{ color: payload[0].fill }}>{formatCurrency(value)}</p>
      <p className="text-muted-foreground">{formatPercent((percent ?? 0) * 100)}</p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.04) return null; // oculta fatias muito pequenas
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
      {formatPercent(percent * 100)}
    </text>
  );
};

export function CustoChart({ data }: CustoChartProps) {
  const chartData = data.map(item => ({
    name: item.area,
    value: item.custoTotal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Custos por Área</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={130}
              dataKey="value"
              strokeWidth={2}
              stroke="#ffffff"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BRAND_PALETTE[index % BRAND_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: 12, color: '#8a5f86' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
