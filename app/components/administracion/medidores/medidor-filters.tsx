import { Calendar, Filter, RotateCcw, X } from 'lucide-react';

import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import type { FilterOptions } from '~/hooks/administracion/use-medidor-filters';

export interface MedidorFilters {
  marca: string;
  tipo: string;
  modelo: string;
  estado: string;
  digitosMin: string;
  digitosMax: string;
  multiplicarMin: string;
  multiplicarMax: string;
  fechaInicioDesde: string;
  fechaInicioHasta: string;
  tieneUbicacion: string;
  tieneAcometida: string;
}

interface MedidorFiltersProps {
  filters: MedidorFilters;
  onFiltersChange: (filters: MedidorFilters) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
}

export function MedidorFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions
}: Readonly<MedidorFiltersProps>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof MedidorFilters, value: string) => {
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
    <Card className='border-emerald-200/50 dark:border-emerald-800/50'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className='cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl'>
                  <Filter className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                </div>
                <div>
                  <CardTitle className='text-lg text-emerald-800 dark:text-emerald-200'>
                    Filtros Avanzados
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Filtra medidores por marca, tipo, estado y fechas
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                  >
                    {activeFiltersCount} filtro
                    {activeFiltersCount !== 1 ? 's' : ''} activo
                    {activeFiltersCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-emerald-600 dark:text-emerald-400'
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
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              {/* Marca */}
              <div className='space-y-2'>
                <Label htmlFor='marca' className='text-sm font-medium'>
                  Marca
                </Label>
                <Select
                  value={filters.marca}
                  onValueChange={value => handleFilterChange('marca', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todas las marcas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas las marcas</SelectItem>
                    {filterOptions.marcas.map(marca => (
                      <SelectItem key={marca} value={marca}>
                        {marca}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo */}
              <div className='space-y-2'>
                <Label htmlFor='tipo' className='text-sm font-medium'>
                  Tipo
                </Label>
                <Select
                  value={filters.tipo}
                  onValueChange={value => handleFilterChange('tipo', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos los tipos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos los tipos</SelectItem>
                    {filterOptions.tipos.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modelo */}
              <div className='space-y-2'>
                <Label htmlFor='modelo' className='text-sm font-medium'>
                  Modelo
                </Label>
                <Select
                  value={filters.modelo}
                  onValueChange={value => handleFilterChange('modelo', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos los modelos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos los modelos</SelectItem>
                    {filterOptions.modelos.map(modelo => (
                      <SelectItem key={modelo} value={modelo}>
                        {modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className='space-y-2'>
                <Label htmlFor='estado' className='text-sm font-medium'>
                  Estado
                </Label>
                <Select
                  value={filters.estado}
                  onValueChange={value => handleFilterChange('estado', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos los estados' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos los estados</SelectItem>
                    {filterOptions.estados.map(estado => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Segunda fila de filtros - Rangos num�ricos */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              {/* Rango de D�gitos */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Dígitos (Min)</Label>
                <Input
                  type='number'
                  value={filters.digitosMin}
                  onChange={e =>
                    handleFilterChange('digitosMin', e.target.value)
                  }
                  placeholder='Desde'
                  className='border-border focus:border-border dark:focus:border-emerald-600'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Dígitos (Max)</Label>
                <Input
                  type='number'
                  value={filters.digitosMax}
                  onChange={e =>
                    handleFilterChange('digitosMax', e.target.value)
                  }
                  placeholder='Hasta'
                  className='border-border focus:border-border dark:focus:border-emerald-600'
                />
              </div>

              {/* Rango de Multiplicador */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Multiplicador (Min)
                </Label>
                <Input
                  type='number'
                  step='0.01'
                  value={filters.multiplicarMin}
                  onChange={e =>
                    handleFilterChange('multiplicarMin', e.target.value)
                  }
                  placeholder='Desde'
                  className='border-border focus:border-border dark:focus:border-emerald-600'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Multiplicador (Max)
                </Label>
                <Input
                  type='number'
                  step='0.01'
                  value={filters.multiplicarMax}
                  onChange={e =>
                    handleFilterChange('multiplicarMax', e.target.value)
                  }
                  placeholder='Hasta'
                  className='border-border focus:border-border dark:focus:border-emerald-600'
                />
              </div>
            </div>

            {/* Tercera fila de filtros - Filtros de contenido */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              {/* Tiene Ubicaci�n */}
              <div className='space-y-2'>
                <Label htmlFor='tieneUbicacion' className='text-sm font-medium'>
                  Tiene Ubicaci�n
                </Label>
                <Select
                  value={filters.tieneUbicacion}
                  onValueChange={value =>
                    handleFilterChange('tieneUbicacion', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos</SelectItem>
                    <SelectItem value='true'>Con Ubicaci�n</SelectItem>
                    <SelectItem value='false'>Sin Ubicaci�n</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Acometida */}
              <div className='space-y-2'>
                <Label htmlFor='tieneAcometida' className='text-sm font-medium'>
                  Tiene Acometida
                </Label>
                <Select
                  value={filters.tieneAcometida}
                  onValueChange={value =>
                    handleFilterChange('tieneAcometida', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos</SelectItem>
                    <SelectItem value='true'>Con Acometida</SelectItem>
                    <SelectItem value='false'>Sin Acometida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros de fecha */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                <Label className='text-sm font-medium text-amber-700 dark:text-amber-300'>
                  Rango de Fecha de Inicio
                </Label>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fechaInicioDesde' className='text-sm'>
                    Desde
                  </Label>
                  <Input
                    id='fechaInicioDesde'
                    type='date'
                    value={filters.fechaInicioDesde}
                    onChange={e =>
                      handleFilterChange('fechaInicioDesde', e.target.value)
                    }
                    className='border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='fechaInicioHasta' className='text-sm'>
                    Hasta
                  </Label>
                  <Input
                    id='fechaInicioHasta'
                    type='date'
                    value={filters.fechaInicioHasta}
                    onChange={e =>
                      handleFilterChange('fechaInicioHasta', e.target.value)
                    }
                    className='border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600'
                  />
                </div>
              </div>
            </div>

            {/* Filtros activos y acciones */}
            {activeFiltersCount > 0 && (
              <div className='space-y-3'>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>
                      Filtros activos:
                    </span>
                    <div className='flex flex-wrap gap-1 sm:gap-2'>
                      {filters.marca && filters.marca !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs sm:text-sm'
                        >
                          Marca: {filters.marca}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('marca', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.tipo && filters.tipo !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs sm:text-sm'
                        >
                          Tipo: {filters.tipo}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('tipo', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.modelo && filters.modelo !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs sm:text-sm'
                        >
                          Modelo: {filters.modelo}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('modelo', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.estado && filters.estado !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs sm:text-sm'
                        >
                          Estado: {filters.estado}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('estado', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {(filters.digitosMin || filters.digitosMax) && (
                        <Badge
                          variant='outline'
                          className='bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 text-xs sm:text-sm'
                        >
                          D�gitos: {filters.digitosMin || '...'} -{' '}
                          {filters.digitosMax || '...'}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => {
                              handleFilterChange('digitosMin', '');
                              handleFilterChange('digitosMax', '');
                            }}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {(filters.multiplicarMin || filters.multiplicarMax) && (
                        <Badge
                          variant='outline'
                          className='bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 text-xs sm:text-sm'
                        >
                          Mult: {filters.multiplicarMin || '...'} -{' '}
                          {filters.multiplicarMax || '...'}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => {
                              handleFilterChange('multiplicarMin', '');
                              handleFilterChange('multiplicarMax', '');
                            }}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.tieneUbicacion &&
                        filters.tieneUbicacion !== 'all' && (
                          <Badge
                            variant='outline'
                            className='bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800 text-xs sm:text-sm'
                          >
                            Ubicaci�n:{' '}
                            {filters.tieneUbicacion === 'true' ? 'Con' : 'Sin'}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-1 hover:bg-transparent'
                              onClick={() =>
                                handleFilterChange('tieneUbicacion', '')
                              }
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )}
                      {filters.tieneAcometida &&
                        filters.tieneAcometida !== 'all' && (
                          <Badge
                            variant='outline'
                            className='bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800 text-xs sm:text-sm'
                          >
                            Acometida:{' '}
                            {filters.tieneAcometida === 'true' ? 'Con' : 'Sin'}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-1 hover:bg-transparent'
                              onClick={() =>
                                handleFilterChange('tieneAcometida', '')
                              }
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )}
                      {(filters.fechaInicioDesde ||
                        filters.fechaInicioHasta) && (
                        <Badge
                          variant='outline'
                          className='bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 text-xs sm:text-sm'
                        >
                          Fechas: {filters.fechaInicioDesde || '...'} -{' '}
                          {filters.fechaInicioHasta || '...'}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => {
                              handleFilterChange('fechaInicioDesde', '');
                              handleFilterChange('fechaInicioHasta', '');
                            }}
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
                    className='hover:text-red-600 dark:hover:text-red-400'
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
