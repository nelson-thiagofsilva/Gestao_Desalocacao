import { FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg mb-2">Nenhum dado carregado</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Faça upload de um arquivo TXT com os dados de gestão para visualizar a consolidação.
          Consulte o arquivo INSTRUCOES.md para mais informações sobre o formato.
        </p>
      </CardContent>
    </Card>
  );
}
