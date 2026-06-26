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
import type { FilterOptions } from '~/hooks/administracion/use-acometida-filters';

export interface AcometidaFilters {
  empalmeDescripcion: string;
  nichoDescripcion: string;
  sectorDescripcion: string;
  limitePotenciaMin: string;
  limitePotenciaMax: string;
  tieneUbicacion: string;
  tieneMedidor: string;
  tieneLimitePotencia: string;
}

interface AcometidaFiltersProps {
  filters: AcometidaFilters;
  onFiltersChange: (filters: AcometidaFilters) => void;
  onClearFilters: () => void;
  filterOptions?: FilterOptions;
}

export function AcometidaFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions
}: Readonly<AcometidaFiltersProps>) {
  const safeOptions = filterOptions ?? {
    empalmes: [],
    nichos: [],
    sectores: []
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof AcometidaFilters, value: string) => {
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
    <Card className="border-violet-200/50 dark:border-violet-800/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Filter className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-violet-800 dark:text-violet-200">
                    Filtros Avanzados
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Filtra acometidas por empalme, nicho, sector y potencia
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200"
                  >
                    {activeFiltersCount} filtro
                    {activeFiltersCount === 1 ? '' : 's'} activo
                    {activeFiltersCount === 1 ? '' : 's'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-violet-600 dark:text-violet-400"
                >
                  {isOpen ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            <Separator />

            {/* Filtros principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Empalme */}
              <div className="space-y-2">
                <Label
                  htmlFor="empalmeDescripcion"
                  className="text-sm font-medium"
                >
                  Empalme
                </Label>
                <Select
                  value={filters.empalmeDescripcion}
                  onValueChange={value =>
                    handleFilterChange('empalmeDescripcion', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los empalmes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los empalmes</SelectItem>
                    {safeOptions.empalmes.map(empalme => (
                      <SelectItem key={empalme} value={empalme}>
                        {empalme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nicho */}
              <div className="space-y-2">
                <Label
                  htmlFor="nichoDescripcion"
                  className="text-sm font-medium"
                >
                  Nicho
                </Label>
                <Select
                  value={filters.nichoDescripcion}
                  onValueChange={value =>
                    handleFilterChange('nichoDescripcion', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los nichos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los nichos</SelectItem>
                    {safeOptions.nichos.map(nicho => (
                      <SelectItem key={nicho} value={nicho}>
                        {nicho}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label
                  htmlFor="sectorDescripcion"
                  className="text-sm font-medium"
                >
                  Sector
                </Label>
                <Select
                  value={filters.sectorDescripcion}
                  onValueChange={value =>
                    handleFilterChange('sectorDescripcion', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los sectores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los sectores</SelectItem>
                    {safeOptions.sectores.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Segunda fila de filtros - Rangos numéricos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Rango de Límite de Potencia */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Límite Potencia (Min)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={filters.limitePotenciaMin}
                  onChange={e =>
                    handleFilterChange('limitePotenciaMin', e.target.value)
                  }
                  placeholder="Desde"
                  className="border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Límite Potencia (Max)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={filters.limitePotenciaMax}
                  onChange={e =>
                    handleFilterChange('limitePotenciaMax', e.target.value)
                  }
                  placeholder="Hasta"
                  className="border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600"
                />
              </div>
            </div>

            {/* Tercera fila de filtros - Filtros de contenido */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Tiene Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="tieneUbicacion" className="text-sm font-medium">
                  Tiene Ubicación
                </Label>
                <Select
                  value={filters.tieneUbicacion}
                  onValueChange={value =>
                    handleFilterChange('tieneUbicacion', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Con Ubicación</SelectItem>
                    <SelectItem value="false">Sin Ubicación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Medidor */}
              <div className="space-y-2">
                <Label htmlFor="tieneMedidor" className="text-sm font-medium">
                  Tiene Medidor
                </Label>
                <Select
                  value={filters.tieneMedidor}
                  onValueChange={value =>
                    handleFilterChange('tieneMedidor', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Con Medidor</SelectItem>
                    <SelectItem value="false">Sin Medidor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Límite de Potencia */}
              <div className="space-y-2">
                <Label
                  htmlFor="tieneLimitePotencia"
                  className="text-sm font-medium"
                >
                  Tiene Límite Potencia
                </Label>
                <Select
                  value={filters.tieneLimitePotencia}
                  onValueChange={value =>
                    handleFilterChange('tieneLimitePotencia', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Con Límite</SelectItem>
                    <SelectItem value="false">Sin Límite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros activos y acciones */}
            {activeFiltersCount > 0 && (
              <div className="space-y-3">
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Filtros activos:
                    </span>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {filters.empalmeDescripcion &&
                        filters.empalmeDescripcion !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs sm:text-sm"
                          >
                            Empalme: {filters.empalmeDescripcion}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('empalmeDescripcion', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {filters.nichoDescripcion &&
                        filters.nichoDescripcion !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs sm:text-sm"
                          >
                            Nicho: {filters.nichoDescripcion}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('nichoDescripcion', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {filters.sectorDescripcion &&
                        filters.sectorDescripcion !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs sm:text-sm"
                          >
                            Sector: {filters.sectorDescripcion}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('sectorDescripcion', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {(filters.limitePotenciaMin ||
                        filters.limitePotenciaMax) && (
                        <Badge
                          variant="outline"
                          className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 text-xs sm:text-sm"
                        >
                          Potencia: {filters.limitePotenciaMin || '...'} -{' '}
                          {filters.limitePotenciaMax || '...'}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => {
                              handleFilterChange('limitePotenciaMin', '');
                              handleFilterChange('limitePotenciaMax', '');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {filters.tieneUbicacion &&
                        filters.tieneUbicacion !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs sm:text-sm"
                          >
                            Ubicación:{' '}
                            {filters.tieneUbicacion === 'true' ? 'Con' : 'Sin'}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('tieneUbicacion', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {filters.tieneMedidor &&
                        filters.tieneMedidor !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 text-xs sm:text-sm"
                          >
                            Medidor:{' '}
                            {filters.tieneMedidor === 'true' ? 'Con' : 'Sin'}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('tieneMedidor', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {filters.tieneLimitePotencia &&
                        filters.tieneLimitePotencia !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800 text-xs sm:text-sm"
                          >
                            Límite:{' '}
                            {filters.tieneLimitePotencia === 'true'
                              ? 'Con'
                              : 'Sin'}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('tieneLimitePotencia', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
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
