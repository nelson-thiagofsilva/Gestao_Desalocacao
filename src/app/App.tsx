import { useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { DataUploader } from './components/DataUploader';
import { FilterBar } from './components/FilterBar';
import { ConsolidationTable } from './components/ConsolidationTable';
import { SettingsMenu } from './components/SettingsMenu';
import { SummaryCards } from './components/SummaryCards';
import { EmptyState } from './components/EmptyState';
import { NoDataMessage } from './components/NoDataMessage';
import { DesalocacaoChart } from './components/DesalocacaoChart';
import { CustoChart } from './components/CustoChart';
import { DebugInfo } from './components/DebugInfo';
import { DataValidation } from './components/DataValidation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import {
  parseTxtData,
  consolidateByArea,
  consolidateByYear,
  getAvailableMonths,
  getAvailableYears,
  getAreas,
  type RawDataRow,
} from './utils/dataParser';

export default function App() {
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [metas, setMetas] = useState<Record<string, number>>({});
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const handleDataLoad = (content: string) => {
    try {
      console.log('Iniciando parsing do arquivo...');
      const data = parseTxtData(content);

      if (data.length === 0) {
        toast.error('Nenhum dado válido encontrado no arquivo. Verifique o console para mais detalhes.');
        return;
      }

      setRawData(data);

      const months = getAvailableMonths(data);
      const years = getAvailableYears(data);
      const areas = getAreas(data);

      console.log('Dados processados:', {
        totalRegistros: data.length,
        meses: months,
        anos: years,
        areas: areas,
      });

      if (months.length > 0) setSelectedMonth(months[0]);
      if (years.length > 0) setSelectedYear(years[0]);

      const initialMetas: Record<string, number> = {};
      areas.forEach(area => {
        initialMetas[area] = 0;
      });
      setMetas(initialMetas);

      // Seleciona todas as áreas por padrão
      setSelectedAreas(areas);

      toast.success(
        `Dados carregados! ${data.length} registros, ${areas.length} áreas, ${months.length} meses, ${years.length} anos.`
      );
    } catch (error) {
      toast.error('Erro ao processar o arquivo. Verifique o console (F12) para detalhes.');
      console.error('Erro ao carregar dados:', error);
    }
  };

  const months = rawData.length > 0 ? getAvailableMonths(rawData) : [];
  const years = rawData.length > 0 ? getAvailableYears(rawData) : [];
  const areas = rawData.length > 0 ? getAreas(rawData) : [];

  // Filtra os dados brutos para incluir apenas as áreas selecionadas
  const filteredRawData = rawData.filter(row =>
    selectedAreas.includes(row.time || 'Sem Time')
  );

  const monthlyData = filteredRawData.length > 0 && selectedMonth && selectedYear
    ? consolidateByArea(filteredRawData, selectedMonth, selectedYear, metas)
    : [];

  const yearlyData = filteredRawData.length > 0 && selectedYear
    ? consolidateByYear(filteredRawData, selectedYear, metas)
    : [];

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl">Consolidação de Dados de Gestão</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Análise de custos e desalocação por área
              {rawData.length > 0 && selectedAreas.length < areas.length && (
                <span className="ml-2 text-orange-600">
                  • {selectedAreas.length} de {areas.length} áreas visíveis
                </span>
              )}
            </p>
          </div>
          {rawData.length > 0 && (
            <SettingsMenu
              areas={areas}
              metas={metas}
              selectedAreas={selectedAreas}
              onMetasChange={setMetas}
              onSelectedAreasChange={setSelectedAreas}
            />
          )}
        </div>

        <DataUploader onDataLoad={handleDataLoad} />

        {rawData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DebugInfo rawData={rawData} />

            <FilterBar
              months={months}
              years={years}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />

            <Tabs defaultValue="monthly" className="w-full">
              <TabsList>
                <TabsTrigger value="monthly">Consolidação Mensal</TabsTrigger>
                <TabsTrigger value="yearly">Consolidação Anual</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="mt-6 space-y-6">
                {monthlyData.length > 0 ? (
                  <>
                    <DataValidation
                      rawData={filteredRawData}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                    />
                    <SummaryCards data={monthlyData} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DesalocacaoChart data={monthlyData} />
                      <CustoChart data={monthlyData} />
                    </div>
                    <ConsolidationTable
                      data={monthlyData}
                      period={`${selectedMonth}/${selectedYear}`}
                    />
                  </>
                ) : (
                  <NoDataMessage period={`${selectedMonth}/${selectedYear}`} />
                )}
              </TabsContent>
              <TabsContent value="yearly" className="mt-6 space-y-6">
                {yearlyData.length > 0 ? (
                  <>
                    <SummaryCards data={yearlyData} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DesalocacaoChart data={yearlyData} />
                      <CustoChart data={yearlyData} />
                    </div>
                    <ConsolidationTable
                      data={yearlyData}
                      period={`Ano ${selectedYear}`}
                    />
                  </>
                ) : (
                  <NoDataMessage period={`Ano ${selectedYear}`} />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
        </div>
      </div>
    </>
  );
}