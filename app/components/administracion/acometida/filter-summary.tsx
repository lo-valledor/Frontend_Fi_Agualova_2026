import { Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

interface FilterSummaryProps {
  totalAcometidas: number;
  filteredAcometidas: number;
  activeFilters: number;
  isFiltered: boolean;
}

export function FilterSummary({
  totalAcometidas,
  filteredAcometidas,
  activeFilters,
  isFiltered
}: Readonly<FilterSummaryProps>) {
  if (!isFiltered) return null;

  const percentageShown =
    totalAcometidas > 0
      ? Math.round((filteredAcometidas / totalAcometidas) * 100)
      : 0;
  const isReduced = filteredAcometidas < totalAcometidas;

  return (
    <Card className='border-violet-200/50 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-900/10'>
      <CardContent className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md'>
              <Filter className='h-4 w-4 text-violet-600 dark:text-violet-400' />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-violet-800 dark:text-violet-200'>
                Mostrando {filteredAcometidas} de {totalAcometidas} acometidas
              </span>
              <Badge
                variant='outline'
                className='bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-800'
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
              {activeFilters} filtro{activeFilters === 1 ? '' : 's'} aplicado
              {activeFilters === 1 ? '' : 's'}
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
