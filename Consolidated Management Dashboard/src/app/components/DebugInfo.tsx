import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface DebugInfoProps {
  rawData: Array<{
    mes: string;
    ano: string;
    time: string;
    colaborador: string;
    custo_projeto: number;
  }>;
}

export function DebugInfo({ rawData }: DebugInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (rawData.length === 0) return null;

  const meses = new Set(rawData.map(r => r.mes));
  const anos = new Set(rawData.map(r => r.ano));
  const areas = new Set(rawData.map(r => r.time || 'Sem Time'));
  const colaboradores = new Set(rawData.map(r => r.colaborador));

  const custoTotalGeral = rawData.reduce((sum, r) => sum + r.custo_projeto, 0);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm">Informações de Debug</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="text-sm space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Total de registros:</span> {rawData.length}
            </div>
            <div>
              <span className="font-medium">Colaboradores únicos:</span> {colaboradores.size}
            </div>
            <div>
              <span className="font-medium">Áreas:</span> {areas.size} ({Array.from(areas).join(', ')})
            </div>
            <div>
              <span className="font-medium">Anos:</span> {anos.size} ({Array.from(anos).join(', ')})
            </div>
            <div className="col-span-2">
              <span className="font-medium">Meses:</span> {meses.size} ({Array.from(meses).join(', ')})
            </div>
            <div className="col-span-2">
              <span className="font-medium">Custo Total Geral (todos os dados):</span>{' '}
              <span className="text-blue-600 font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(custoTotalGeral)}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="font-medium mb-2">Primeiros 3 registros:</div>
            <div className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <pre>{JSON.stringify(rawData.slice(0, 3), null, 2)}</pre>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="font-medium text-blue-900 mb-1">💡 Dica de Debug</div>
            <div className="text-xs text-blue-800">
              Abra o console do navegador (F12) para ver os cálculos detalhados por área.
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
