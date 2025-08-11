import { Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

interface FilterSummaryProps {
  totalMedidores: number;
  filteredMedidores: number;
  activeFilters: number;
  isFiltered: boolean;
}

export function FilterSummary({
  totalMedidores,
  filteredMedidores,
  activeFilters,
  isFiltered,
}: FilterSummaryProps) {
  if (!isFiltered) return null;

  const percentageShown =
    totalMedidores > 0
      ? Math.round((filteredMedidores / totalMedidores) * 100)
      : 0;
  const isReduced = filteredMedidores < totalMedidores;

  return (
    <Card className='border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10'>
      <CardContent className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md'>
              <Filter className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-emerald-800 dark:text-emerald-200'>
                Mostrando {filteredMedidores} de {totalMedidores} medidores
              </span>
              <Badge
                variant='outline'
                className='bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800'
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