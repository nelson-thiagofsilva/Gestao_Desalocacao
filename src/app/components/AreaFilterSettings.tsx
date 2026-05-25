import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface AreaFilterSettingsProps {
  areas: string[];
  selectedAreas: string[];
  onSelectedAreasChange: (areas: string[]) => void;
}

export function AreaFilterSettings({
  areas,
  selectedAreas,
  onSelectedAreasChange,
}: AreaFilterSettingsProps) {
  const [localSelectedAreas, setLocalSelectedAreas] = useState<string[]>(selectedAreas);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = areas.filter(area =>
    area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleArea = (area: string) => {
    setLocalSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSelectAll = () => {
    setLocalSelectedAreas([...areas]);
  };

  const handleDeselectAll = () => {
    setLocalSelectedAreas([]);
  };

  const handleSave = () => {
    if (localSelectedAreas.length === 0) {
      toast.error('Selecione pelo menos uma área para exibir no relatório');
      return;
    }
    onSelectedAreasChange(localSelectedAreas);
    toast.success(`${localSelectedAreas.length} área(s) selecionada(s) para exibição`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtro de Áreas</CardTitle>
        <CardDescription>
          Selecione quais áreas serão exibidas nos relatórios e terão seus dados consolidados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Selecionar Todas
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Desmarcar Todas
            </Button>
          </div>

          <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {filteredAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma área encontrada
                </p>
              ) : (
                filteredAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={localSelectedAreas.includes(area)}
                      onCheckedChange={() => handleToggleArea(area)}
                    />
                    <Label
                      htmlFor={`area-${area}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {area}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {localSelectedAreas.length} de {areas.length} área(s) selecionada(s)
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button onClick={handleSave}>Aplicar Filtro</Button>
        </div>
      </CardContent>
    </Card>
  );
}
