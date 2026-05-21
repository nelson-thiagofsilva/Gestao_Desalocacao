import { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MetaSettings } from './MetaSettings';
import { AreaFilterSettings } from './AreaFilterSettings';

interface SettingsMenuProps {
  areas: string[];
  metas: Record<string, number>;
  selectedAreas: string[];
  onMetasChange: (metas: Record<string, number>) => void;
  onSelectedAreasChange: (areas: string[]) => void;
}

export function SettingsMenu({
  areas,
  metas,
  selectedAreas,
  onMetasChange,
  onSelectedAreasChange,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Sistema</DialogTitle>
          <DialogDescription>
            Gerencie as configurações de metas e filtros de áreas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="areas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="areas">Áreas Visíveis</TabsTrigger>
            <TabsTrigger value="metas">Metas por Área</TabsTrigger>
          </TabsList>

          <TabsContent value="areas" className="mt-4">
            <AreaFilterSettings
              areas={areas}
              selectedAreas={selectedAreas}
              onSelectedAreasChange={onSelectedAreasChange}
            />
          </TabsContent>

          <TabsContent value="metas" className="mt-4">
            <MetaSettings
              areas={areas}
              metas={metas}
              onMetasChange={onMetasChange}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
