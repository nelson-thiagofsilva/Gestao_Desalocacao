import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { generatePdfReport } from '../utils/pdfReport';
import { type AreaData, type RawDataRow } from '../utils/dataParser';

interface PdfReportButtonProps {
  monthlyData: AreaData[];
  yearlyData: AreaData[];
  rawData: RawDataRow[];
  mes: string;
  ano: string;
}

export function PdfReportButton({
  monthlyData,
  yearlyData,
  rawData,
  mes,
  ano,
}: PdfReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Deixa o browser respirar antes de rodar o PDF
      await new Promise(r => setTimeout(r, 60));
      generatePdfReport({ monthlyData, yearlyData, rawData, mes, ano });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading || monthlyData.length === 0}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {loading ? 'Gerando PDF…' : 'Exportar PDF'}
    </Button>
  );
}
