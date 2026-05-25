import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DataValidationProps {
  rawData: Array<{
    mes: string;
    ano: string;
    time: string;
    custo_projeto: number;
  }>;
  selectedMonth: string;
  selectedYear: string;
}

export function DataValidation({ rawData, selectedMonth, selectedYear }: DataValidationProps) {
  const filteredData = rawData.filter(
    row => row.mes === selectedMonth && row.ano === selectedYear
  );

  const totalGeral = filteredData.reduce((sum, row) => sum + row.custo_projeto, 0);
  const registrosComCustoZero = filteredData.filter(row => row.custo_projeto === 0).length;

  const areasTotais = new Map<string, number>();
  filteredData.forEach(row => {
    const area = row.time || 'Sem Time';
    areasTotais.set(area, (areasTotais.get(area) || 0) + row.custo_projeto);
  });

  const hasIssues = registrosComCustoZero > 0;

  if (!hasIssues) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Avisos de Validação</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {registrosComCustoZero > 0 && (
            <li>
              {registrosComCustoZero} registro(s) com custo_projeto = 0 ou inválido
            </li>
          )}
        </ul>
        <div className="mt-3 text-xs">
          <strong>Custo Total Geral:</strong> R$ {totalGeral.toFixed(2)}
          <br />
          <strong>Registros processados:</strong> {filteredData.length}
        </div>
      </AlertDescription>
    </Alert>
  );
}
