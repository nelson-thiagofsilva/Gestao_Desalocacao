import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';

interface FilterBarProps {
  months: string[];
  years: string[];
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

export function FilterBar({
  months,
  years,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: FilterBarProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <Label htmlFor="month-select">Mês</Label>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="year-select">Ano</Label>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
