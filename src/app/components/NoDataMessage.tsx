import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface NoDataMessageProps {
  period: string;
}

export function NoDataMessage({ period }: NoDataMessageProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum dado encontrado</AlertTitle>
          <AlertDescription>
            Não há dados disponíveis para o período: <strong>{period}</strong>
            <br />
            Selecione outro mês/ano ou verifique se o arquivo contém dados para este período.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
