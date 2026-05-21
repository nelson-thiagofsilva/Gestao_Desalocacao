import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

interface SummaryCardsProps {
  data: Array<{
    custoTotal: number;
    totalColaboradores: number;
    desalocacao: { custo: number };
    percentualDesalocacaoComFerias: number;
  }>;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const totalCusto = data.reduce((sum, item) => sum + item.custoTotal, 0);
  const totalColaboradores = data.reduce((sum, item) => sum + item.totalColaboradores, 0);
  const totalDesalocacao = data.reduce((sum, item) => sum + item.desalocacao.custo, 0);
  const mediaDesalocacao = data.length > 0
    ? data.reduce((sum, item) => sum + item.percentualDesalocacaoComFerias, 0) / data.length
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cards = [
    {
      title: 'Custo Total',
      value: formatCurrency(totalCusto),
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      title: 'Total de Colaboradores',
      value: totalColaboradores.toString(),
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Custo de Desalocação',
      value: formatCurrency(totalDesalocacao),
      icon: TrendingDown,
      color: 'text-orange-600',
    },
    {
      title: 'Média % Desalocação',
      value: `${mediaDesalocacao.toFixed(2)}%`,
      icon: AlertCircle,
      color: mediaDesalocacao > 15 ? 'text-red-600' : 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{card.title}</CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
