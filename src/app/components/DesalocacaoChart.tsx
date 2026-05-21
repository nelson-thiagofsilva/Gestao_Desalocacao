import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DesalocacaoChartProps {
  data: Array<{
    area: string;
    percentualDesalocacaoComFerias: number;
    meta: number;
  }>;
}

export function DesalocacaoChart({ data }: DesalocacaoChartProps) {
  const chartData = data.map(item => ({
    area: item.area,
    'Desalocação (%)': parseFloat(item.percentualDesalocacaoComFerias.toFixed(2)),
    'Meta (%)': parseFloat(item.meta.toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desalocação vs Meta por Área</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="area"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Desalocação (%)" fill="hsl(var(--chart-1))" />
            <Bar dataKey="Meta (%)" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
