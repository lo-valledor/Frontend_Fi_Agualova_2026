import { Filter, RotateCcw, X } from 'lucide-react';

import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import type {
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
} from '~/types/administracion';

export interface CargoFilters {
  tipo: string;
  fijoVariable: string;
  periodicoEventual: string;
  concepto: string;
  tarifa: string;
  tipoMedidor: string;
}

interface CargoFiltersProps {
  filters: CargoFilters;
  onFiltersChange: (filters: CargoFilters) => void;
  onClearFilters: () => void;
  conceptos: GeCombosConceptos[];
  tarifas: GetCombosTarifas[];
  tiposMedidor: GetCombosTiposMedidor[];
}

export function CargoFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  conceptos,
  tarifas,
  tiposMedidor,
}: CargoFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof CargoFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Opciones para los filtros
  const tipoOptions = [
    { value: 'Base CH', label: 'Base CH' },
    { value: 'Cargo Fact', label: 'Cargo Fact' },
    { value: 'Condición', label: 'Condición' },
    { value: 'Cargo Fijo mensual', label: 'Cargo Fijo mensual' },
  ];

  const fijoVariableOptions = [
    { value: 'Fijo', label: 'Fijo' },
    { value: 'Variable', label: 'Variable' },
  ];

  const periodicoEventualOptions = [
    { value: 'Periódico', label: 'Periódico' },
    { value: 'Eventual', label: 'Eventual' },
  ];

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
                    Filtra cargos por tipo, modalidad, concepto y configuración
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
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              {/* Tipo */}
              <div className='space-y-2'>
                <Label
                  htmlFor='tipo'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
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
                    {tipoOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fijo/Variable */}
              <div className='space-y-2'>
                <Label
                  htmlFor='fijoVariable'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Modalidad
                </Label>
                <Select
                  value={filters.fijoVariable}
                  onValueChange={value =>
                    handleFilterChange('fijoVariable', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todas las modalidades' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas las modalidades</SelectItem>
                    {fijoVariableOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Periódico/Eventual */}
              <div className='space-y-2'>
                <Label
                  htmlFor='periodicoEventual'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Frecuencia
                </Label>
                <Select
                  value={filters.periodicoEventual}
                  onValueChange={value =>
                    handleFilterChange('periodicoEventual', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todas las frecuencias' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas las frecuencias</SelectItem>
                    {periodicoEventualOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Segunda fila de filtros */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              {/* Concepto */}
              <div className='space-y-2'>
                <Label
                  htmlFor='concepto'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Concepto
                </Label>
                <Select
                  value={filters.concepto}
                  onValueChange={value => handleFilterChange('concepto', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos los conceptos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos los conceptos</SelectItem>
                    {conceptos.map(concepto => (
                      <SelectItem key={concepto.id} value={concepto.nombre}>
                        {concepto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tarifa */}
              <div className='space-y-2'>
                <Label
                  htmlFor='tarifa'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Tarifa
                </Label>
                <Select
                  value={filters.tarifa}
                  onValueChange={value => handleFilterChange('tarifa', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todas las tarifas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas las tarifas</SelectItem>
                    {tarifas.map(tarifa => (
                      <SelectItem key={tarifa.id} value={tarifa.nombre}>
                        {tarifa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo Medidor */}
              <div className='space-y-2'>
                <Label
                  htmlFor='tipoMedidor'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Tipo Medidor
                </Label>
                <Select
                  value={filters.tipoMedidor}
                  onValueChange={value =>
                    handleFilterChange('tipoMedidor', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Todos los tipos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos los tipos</SelectItem>
                    {tiposMedidor.map(tipo => (
                      <SelectItem key={tipo.id} value={tipo.nombre}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros activos y acciones */}
            {activeFiltersCount > 0 && (
              <div className='space-y-3'>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                    <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Filtros activos:
                    </span>
                    <div className='flex flex-wrap gap-1 sm:gap-2'>
                      {filters.tipo && filters.tipo !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs'
                        >
                          <span className='hidden sm:inline'>Tipo: </span>
                          {filters.tipo}
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
                      {filters.fijoVariable &&
                        filters.fijoVariable !== 'all' && (
                          <Badge
                            variant='outline'
                            className='bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 text-xs'
                          >
                            <span className='hidden sm:inline'>
                              Modalidad:{' '}
                            </span>
                            {filters.fijoVariable}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-1 hover:bg-transparent'
                              onClick={() =>
                                handleFilterChange('fijoVariable', '')
                              }
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )}
                      {filters.periodicoEventual &&
                        filters.periodicoEventual !== 'all' && (
                          <Badge
                            variant='outline'
                            className='bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs'
                          >
                            <span className='hidden sm:inline'>
                              Frecuencia:{' '}
                            </span>
                            {filters.periodicoEventual}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-1 hover:bg-transparent'
                              onClick={() =>
                                handleFilterChange('periodicoEventual', '')
                              }
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )}
                      {filters.concepto && filters.concepto !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs'
                        >
                          <span className='hidden sm:inline'>Concepto: </span>
                          <span
                            className='truncate max-w-[100px] sm:max-w-none'
                            title={filters.concepto}
                          >
                            {filters.concepto}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('concepto', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.tarifa && filters.tarifa !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs'
                        >
                          <span className='hidden sm:inline'>Tarifa: </span>
                          <span
                            className='truncate max-w-[100px] sm:max-w-none'
                            title={filters.tarifa}
                          >
                            {filters.tarifa}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() => handleFilterChange('tarifa', '')}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </Badge>
                      )}
                      {filters.tipoMedidor && filters.tipoMedidor !== 'all' && (
                        <Badge
                          variant='outline'
                          className='bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 text-xs'
                        >
                          <span className='hidden sm:inline'>
                            Tipo Medidor:{' '}
                          </span>
                          <span
                            className='truncate max-w-[100px] sm:max-w-none'
                            title={filters.tipoMedidor}
                          >
                            {filters.tipoMedidor}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 ml-1 hover:bg-transparent'
                            onClick={() =>
                              handleFilterChange('tipoMedidor', '')
                            }
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
                    className='text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 w-full sm:w-auto mt-2 sm:mt-0'
                  >
                    <RotateCcw className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                    <span className='text-xs sm:text-sm'>Limpiar Filtros</span>
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
