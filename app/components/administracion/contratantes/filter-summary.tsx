import { Filter, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

interface FilterSummaryProps {
  totalContratantes: number;
  filteredContratantes: number;
  activeFilters: number;
  isFiltered: boolean;
}

export function FilterSummary({
  totalContratantes,
  filteredContratantes,
  activeFilters,
  isFiltered
}: FilterSummaryProps) {
  if (!isFiltered) return null;

  const percentageShown =
    totalContratantes > 0 ? Math.round((filteredContratantes / totalContratantes) * 100) : 0;
  const isReduced = filteredContratantes < totalContratantes;

  return (
    <Card className='border-orange-200/50 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-900/10'>
      <CardContent className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md'>
              <Filter className='h-4 w-4 text-orange-600 dark:text-orange-400' />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-orange-800 dark:text-orange-200'>
                Mostrando {filteredContratantes} de {totalContratantes} contratantes
              </span>
              <Badge
                variant='outline'
                className='bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800'
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