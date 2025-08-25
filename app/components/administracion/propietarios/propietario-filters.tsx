import { Filter, RotateCcw, X } from 'lucide-react';

import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
interface FilterOptions {
  comunas: string[];
}

export interface PropietarioFilters {
  comuna: string;
  tieneTelefono: string;
  tieneCelular: string;
  tieneEmail: string;
}

interface PropietarioFiltersProps {
  filters: PropietarioFilters;
  onFiltersChange: (filters: PropietarioFilters) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
}

export function PropietarioFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions
}: PropietarioFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PropietarioFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className='border-blue-200/50 dark:border-blue-800/50'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className='cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                  <Filter className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <CardTitle className='text-lg text-blue-800 dark:text-blue-200'>
                    Filtros Avanzados
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Filtra propietarios por ubicación y contacto
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                  >
                    {activeFiltersCount} filtro
                    {activeFiltersCount !== 1 ? 's' : ''} activo
                    {activeFiltersCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-blue-600 dark:text-blue-400'
                >
                  {isOpen ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='pt-0 space-y-6'>
            <Separator />

            {/* Filtros principales */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {/* Comuna */}
              <div className='space-y-2'>
                <Label
                  htmlFor='comuna'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Comuna
                </Label>
                <Select
                  value={filters.comuna}
                  onValueChange={value => handleFilterChange('comuna', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todas las comunas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas las comunas</SelectItem>
                    {filterOptions.comunas.map(comuna => (
                      <SelectItem key={comuna} value={comuna}>
                        {comuna}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Teléfono */}
              <div className='space-y-2'>
                <Label
                  htmlFor='tieneTelefono'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Tiene Teléfono
                </Label>
                <Select
                  value={filters.tieneTelefono}
                  onValueChange={value =>
                    handleFilterChange('tieneTelefono', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos</SelectItem>
                    <SelectItem value='true'>Con Teléfono</SelectItem>
                    <SelectItem value='false'>Sin Teléfono</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Celular */}
              <div className='space-y-2'>
                <Label
                  htmlFor='tieneCelular'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Tiene Celular
                </Label>
                <Select
                  value={filters.tieneCelular}
                  onValueChange={value =>
                    handleFilterChange('tieneCelular', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos</SelectItem>
                    <SelectItem value='true'>Con Celular</SelectItem>
                    <SelectItem value='false'>Sin Celular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Email */}
              <div className='space-y-2'>
                <Label
                  htmlFor='tieneEmail'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Tiene Email
                </Label>
                <Select
                  value={filters.tieneEmail}
                  onValueChange={value =>
                    handleFilterChange('tieneEmail', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos</SelectItem>
                    <SelectItem value='true'>Con Email</SelectItem>
                    <SelectItem value='false'>Sin Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros activos y acciones */}
            {activeFiltersCount > 0 && (
              <div className='space-y-3'>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Filtros activos:
                    </span>
                    <div className='flex flex-wrap gap-2'>
                      {filters.comuna && filters.comuna !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
                        >
                          Comuna: {filters.comuna}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('comuna', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.tieneTelefono &&
                        filters.tieneTelefono !== 'all' && (
                          <Badge
                            variant='outline'
                            className='bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                          >
                            Teléfono:{' '}
                            {filters.tieneTelefono === 'true' ? 'Con' : 'Sin'}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-1 hover:bg-transparent'
                              onClick={() =>
                                handleFilterChange('tieneTelefono', '')
                              }
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )}
                      {filters.tieneCelular &&
                        filters.tieneCelular !== 'all' && (
                          <Badge
                            variant='outline'
                            className='bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                          >
                            Celular:{' '}
                            {filters.tieneCelular === 'true' ? 'Con' : 'Sin'}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-1 hover:bg-transparent'
                              onClick={() =>
                                handleFilterChange('tieneCelular', '')
                              }
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )}
                      {filters.tieneEmail && filters.tieneEmail !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 text-xs sm:text-sm'
                        >
                          Email: {filters.tieneEmail === 'true' ? 'Con' : 'Sin'}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('tieneEmail', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={onClearFilters}
                    className='text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                  >
                    <RotateCcw className='h-4 w-4 mr-1' />
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}