import { Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

interface FilterSummaryProps {
  totalContracts: number;
  filteredContracts: number;
  activeFilters: number;
  isFiltered: boolean;
}

export function FilterSummary({
  totalContracts,
  filteredContracts,
  activeFilters,
  isFiltered
}: Readonly<FilterSummaryProps>) {
  if (!isFiltered) return null;

  const percentageShown =
    totalContracts > 0
      ? Math.round((filteredContracts / totalContracts) * 100)
      : 0;
  const isReduced = filteredContracts < totalContracts;

  return (
    <Card className='border-sky-200/50 dark:border-sky-800/50 bg-sky-50/50 dark:bg-sky-900/10'>
      <CardContent className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md'>
              <Filter className='h-4 w-4' />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-sky-800 dark:text-sky-200'>
                Mostrando {filteredContracts} de {totalContracts} contratos
              </span>
              <Badge
                variant='outline'
                className='bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-800'
              >
                {percentageShown}%
              </Badge>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {isReduced ? (
              <TrendingDown className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            ) : (
              <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            )}
            <Badge variant='secondary' className='text-xs'>
              {activeFilters} filtro{activeFilters !== 1 ? 's' : ''} aplicado
              {activeFilters !== 1 ? 's' : ''}
            </Badge>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Download className='h-3 w-3' />
              <span>Exportables</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
