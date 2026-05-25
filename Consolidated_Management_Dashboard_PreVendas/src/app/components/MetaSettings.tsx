import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface MetaSettingsProps {
  areas: string[];
  metas: Record<string, number>;
  onMetasChange: (metas: Record<string, number>) => void;
}

export function MetaSettings({ areas, metas, onMetasChange }: MetaSettingsProps) {
  const [localMetas, setLocalMetas] = useState(metas);

  const handleSave = () => {
    onMetasChange(localMetas);
    toast.success('Metas atualizadas com sucesso!');
  };

  const handleMetaChange = (area: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalMetas(prev => ({ ...prev, [area]: numValue }));
  };

  const handleReset = () => {
    const resetMetas: Record<string, number> = {};
    areas.forEach(area => {
      resetMetas[area] = 0;
    });
    setLocalMetas(resetMetas);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas de Desalocação por Área</CardTitle>
        <CardDescription>
          Defina a meta (%) de desalocação para cada área. A variação será calculada automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
          {areas.map((area) => (
            <div key={area} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`meta-${area}`} className="col-span-2 font-medium">
                {area}
              </Label>
              <div className="col-span-2 flex gap-2 items-center">
                <Input
                  id={`meta-${area}`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={localMetas[area] || 0}
                  onChange={(e) => handleMetaChange(area, e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Resetar Todas
          </Button>
          <Button onClick={handleSave}>Salvar Metas</Button>
        </div>
      </CardContent>
    </Card>
  );
}
