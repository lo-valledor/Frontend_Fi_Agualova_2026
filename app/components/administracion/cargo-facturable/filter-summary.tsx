import { Filter, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

interface FilterSummaryProps {
  totalCargos: number;
  filteredCargos: number;
  activeFilters: number;
  isFiltered: boolean;
}

export function FilterSummary({
  totalCargos,
  filteredCargos,
  activeFilters,
  isFiltered
}: FilterSummaryProps) {
  if (!isFiltered) return null;

  const percentageShown =
    totalCargos > 0 ? Math.round((filteredCargos / totalCargos) * 100) : 0;
  const isReduced = filteredCargos < totalCargos;

  return (
    <Card className='border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10'>
      <CardContent className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md'>
              <Filter className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                Mostrando {filteredCargos} de {totalCargos} cargos
              </span>
              <Badge
                variant='outline'
                className='bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
