import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { DataUploader } from './components/DataUploader';
import { FilterBar } from './components/FilterBar';
import { ConsolidationTable } from './components/ConsolidationTable';
import { SettingsMenu } from './components/SettingsMenu';
import { SummaryCards } from './components/SummaryCards';
import { EmptyState } from './components/EmptyState';
import { NoDataMessage } from './components/NoDataMessage';
import { DesalocacaoMensalTable } from './components/DesalocacaoMensalTable';
import { PreVendasTable } from './components/PreVendasTable';
import { PdfReportButton } from './components/PdfReportButton';
import { DesalocacaoChart } from './components/DesalocacaoChart';
import { CustoChart } from './components/CustoChart';
import { DebugInfo } from './components/DebugInfo';
import { DataValidation } from './components/DataValidation';
import { UploadHistory } from './components/UploadHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { useState } from 'react';
import {
  parseTxtData,
  consolidateByArea,
  consolidateDesalocacaoMensal,
  consolidateByYear,
  getAvailableMonths,
  getAvailableYears,
  getAreas,
} from './utils/dataParser';
import { useAppDB } from './hooks/useAppDB';

export default function App() {
  const db = useAppDB();

  // Estados de filtro — locais (não precisam persistir no banco)
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Quando rawData muda (carregado do banco ou novo upload), atualiza filtros
  useEffect(() => {
    if (db.rawData.length === 0) return;
    const months = getAvailableMonths(db.rawData);
    const years  = getAvailableYears(db.rawData);
    if (months.length > 0) setSelectedMonth(months[0]);
    if (years.length > 0)  setSelectedYear(years[0]);
  }, [db.rawData]);

  // Quando rawData muda e não há áreas selecionadas, inicializa-as
  useEffect(() => {
    if (db.rawData.length === 0) return;
    const areas = getAreas(db.rawData);
    if (db.selectedAreas.length === 0) {
      const initialMetas: Record<string, number> = {};
      areas.forEach(a => { initialMetas[a] = 0; });
      db.setMetas({ ...initialMetas, ...db.metas });
      db.setSelectedAreas(areas);
    }
  }, [db.rawData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDataLoad = async (content: string, fileName: string) => {
    try {
      const data = parseTxtData(content);
      if (data.length === 0) {
        toast.error('Nenhum dado válido encontrado. Verifique o console para detalhes.');
        return;
      }

      const areas = getAreas(data);
      const months = getAvailableMonths(data);
      const years  = getAvailableYears(data);

      // Inicializa metas para áreas novas
      const newMetas = { ...db.metas };
      areas.forEach(a => { if (!(a in newMetas)) newMetas[a] = 0; });
      db.setMetas(newMetas);
      db.setSelectedAreas(areas);

      // Salva no banco e atualiza rawData
      await db.saveUpload(fileName, data);

      toast.success(
        `Arquivo salvo! ${data.length} registros · ${areas.length} áreas · ${months.length} meses · ${years.length} anos.`
      );
    } catch (err) {
      toast.error('Erro ao processar o arquivo. Verifique o console (F12) para detalhes.');
      console.error(err);
    }
  };

  const handleLoadUpload = async (id: number) => {
    await db.loadUpload(id);
    toast.success('Upload restaurado com sucesso.');
  };

  const handleDeleteUpload = async (id: number) => {
    await db.deleteUpload(id);
    toast.success('Upload removido do banco de dados.');
  };

  // ── Dados derivados ────────────────────────────────────────────────────────
  const rawData = db.rawData;
  const months  = rawData.length > 0 ? getAvailableMonths(rawData) : [];
  const years   = rawData.length > 0 ? getAvailableYears(rawData)  : [];
  const areas   = rawData.length > 0 ? getAreas(rawData)           : [];

  const filteredRawData = rawData.filter(row =>
    db.selectedAreas.includes(row.time || 'Sem Time')
  );

  const monthlyData = filteredRawData.length > 0 && selectedMonth && selectedYear
    ? consolidateByArea(filteredRawData, selectedMonth, selectedYear, db.metas)
    : [];

  const yearlyData = filteredRawData.length > 0 && selectedYear
    ? consolidateByYear(filteredRawData, selectedYear, db.metas)
    : [];

  const desalocacaoMensalData = selectedYear
    ? consolidateDesalocacaoMensal(filteredRawData, selectedYear, db.selectedAreas)
    : [];

  const monthlyRawData = filteredRawData.filter(
    r => r.mes === selectedMonth && r.ano === selectedYear
  );
  const yearlyRawData = filteredRawData.filter(r => r.ano === selectedYear);

  // Nome do arquivo ativo
  const activeUpload = db.uploads.find(u => u.id === db.activeUploadId);

  if (db.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm animate-pulse">Carregando banco de dados...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl">Consolidação de Dados de Gestão</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Análise de custos e desalocação por área
                {rawData.length > 0 && db.selectedAreas.length < areas.length && (
                  <span className="ml-2 text-orange-600">
                    • {db.selectedAreas.length} de {areas.length} áreas visíveis
                  </span>
                )}
              </p>
            </div>
            {rawData.length > 0 && (
              <SettingsMenu
                areas={areas}
                metas={db.metas}
                selectedAreas={db.selectedAreas}
                onMetasChange={db.setMetas}
                onSelectedAreasChange={db.setSelectedAreas}
              />
            )}
          </div>

          {/* Upload + Histórico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <DataUploader
                onDataLoad={handleDataLoad}
                activeFileName={activeUpload?.fileName ?? null}
              />
            </div>
            <div className="lg:col-span-2">
              <UploadHistory
                uploads={db.uploads}
                activeUploadId={db.activeUploadId}
                onLoad={handleLoadUpload}
                onDelete={handleDeleteUpload}
              />
            </div>
          </div>

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
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <TabsList>
                    <TabsTrigger value="monthly">Consolidação Mensal</TabsTrigger>
                    <TabsTrigger value="yearly">Consolidação Anual</TabsTrigger>
                    <TabsTrigger value="prevendas">Pré-Vendas</TabsTrigger>
                  </TabsList>
                  <PdfReportButton
                    monthlyData={monthlyData}
                    yearlyData={yearlyData}
                    rawData={filteredRawData}
                    desalocacaoMensal={desalocacaoMensalData}
                    mes={selectedMonth}
                    ano={selectedYear}
                  />
                </div>

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
                        rawData={monthlyRawData}
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
                        rawData={yearlyRawData}
                        hideOciosidade
                      />
                      <DesalocacaoMensalTable
                        data={desalocacaoMensalData}
                        ano={selectedYear}
                      />
                    </>
                  ) : (
                    <NoDataMessage period={`Ano ${selectedYear}`} />
                  )}
                </TabsContent>

                <TabsContent value="prevendas" className="mt-6">
                  {/* Pré-Vendas ignora filtro de área — usa todos os registros */}
                  <PreVendasTable
                    rawData={rawData}
                    soldProposals={db.soldProposals}
                    onSoldProposalsChange={db.setSoldProposals}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
}
