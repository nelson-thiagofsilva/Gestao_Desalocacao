import { useState } from 'react';
import { Database, Trash2, RefreshCw, Clock, FileText, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import type { UploadRecord } from '../utils/db';

interface UploadHistoryProps {
  uploads: Omit<UploadRecord, 'rows'>[];
  activeUploadId: number | null;
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function UploadHistory({ uploads, activeUploadId, onLoad, onDelete }: UploadHistoryProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (uploads.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Banco de Dados
          </CardTitle>
          <CardDescription>Nenhum upload salvo ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Banco de Dados
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {uploads.length} upload{uploads.length !== 1 ? 's' : ''} salvo{uploads.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription>
          Histórico de arquivos carregados — clique em um para restaurar.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {uploads.map(upload => {
            const isActive = upload.id === activeUploadId;
            return (
              <div
                key={upload.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive ? 'bg-primary/5' : 'hover:bg-muted/40'
                }`}
              >
                {/* Ícone de status */}
                <div className="shrink-0">
                  {isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Info do upload */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : ''}`}>
                    {upload.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(upload.uploadedAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {upload.rowCount.toLocaleString('pt-BR')} registros
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLoad(upload.id!)}
                      className="h-7 px-2 text-xs gap-1"
                      title="Carregar este upload"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Carregar
                    </Button>
                  )}
                  {isActive && (
                    <Badge variant="outline" className="text-xs h-6 px-2 text-primary border-primary/30">
                      Ativo
                    </Badge>
                  )}

                  <AlertDialog open={deletingId === upload.id} onOpenChange={open => !open && setDeletingId(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Excluir upload"
                        onClick={() => setDeletingId(upload.id!)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir upload?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O arquivo <strong>{upload.fileName}</strong> ({upload.rowCount.toLocaleString('pt-BR')} registros)
                          será removido permanentemente do banco de dados local.
                          {isActive && (
                            <span className="block mt-2 text-orange-600 font-medium">
                              Atenção: este é o upload atualmente ativo.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => { onDelete(upload.id!); setDeletingId(null); }}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
