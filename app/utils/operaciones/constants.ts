// Meses del año
export const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
] as const;


export function getYearsRange() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return years.map(year => ({
    value: year.toString(),
    label: year.toString()
  }));
}


export function getCurrentMonth(): string {
  return (new Date().getMonth() + 1).toString().padStart(2, '0');
}


export function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}


export function getMonthLabel(monthValue: string): string {
  const month = MONTHS.find(m => m.value === monthValue);
  return month?.label ?? monthValue;
}
