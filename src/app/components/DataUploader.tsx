import { Upload, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DataUploaderProps {
  onDataLoad: (content: string, fileName: string) => void;
  /** Nome do arquivo atualmente carregado (para feedback visual) */
  activeFileName?: string | null;
}

export function DataUploader({ onDataLoad, activeFileName }: DataUploaderProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onDataLoad(content, file.name);
      };
      reader.readAsText(file);
      // Limpa o input para permitir reupload do mesmo arquivo
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carregar Dados</CardTitle>
        <CardDescription>
          Faça upload do arquivo TXT ou CSV com os dados de gestão — o arquivo será salvo automaticamente no banco local.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Selecionar Arquivo TXT/CSV
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          {activeFileName && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="truncate max-w-[260px]">{activeFileName}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
