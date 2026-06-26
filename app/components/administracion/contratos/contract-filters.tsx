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
import type { FilterOptions } from '~/hooks/administracion/use-contract-filters';

export interface ContractFilters {
  tipoContrato: string;
  cicloFacturacion: string;
  tarifa: string;
  comuna: string;
  liberadoCorte: string;
  fechaTerminoDesde: string;
  fechaTerminoHasta: string;
  activo: string;
}

interface ContractFiltersProps {
  filters: ContractFilters;
  onFiltersChange: (filters: ContractFilters) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
}

export function ContractFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions
}: ContractFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ContractFilters, value: string) => {
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
    <Card className="border-sky-200/50 dark:border-sky-800/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg text-sky-800 dark:text-sky-200">
                    Filtros Avanzados
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Filtra contratos por tipo, ciclo, estado y fechas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200"
                  >
                    {activeFiltersCount} filtro
                    {activeFiltersCount !== 1 ? 's' : ''} activo
                    {activeFiltersCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sky-600 dark:text-sky-400"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Tipo de Contrato */}
              <div className="space-y-2">
                <Label htmlFor="tipoContrato" className="text-sm font-medium">
                  Tipo de Contrato
                </Label>
                <Select
                  value={filters.tipoContrato}
                  onValueChange={value =>
                    handleFilterChange('tipoContrato', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {filterOptions.tiposContrato.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ciclo de Facturación */}
              <div className="space-y-2">
                <Label
                  htmlFor="cicloFacturacion"
                  className="text-sm font-medium"
                >
                  Ciclo de Facturación
                </Label>
                <Select
                  value={filters.cicloFacturacion}
                  onValueChange={value =>
                    handleFilterChange('cicloFacturacion', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los ciclos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los ciclos</SelectItem>
                    {filterOptions.ciclosFacturacion.map(ciclo => (
                      <SelectItem key={ciclo} value={ciclo}>
                        {ciclo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tarifa */}
              <div className="space-y-2">
                <Label htmlFor="tarifa" className="text-sm font-medium">
                  Tarifa
                </Label>
                <Select
                  value={filters.tarifa}
                  onValueChange={value => handleFilterChange('tarifa', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas las tarifas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tarifas</SelectItem>
                    {filterOptions.tarifas.map(tarifa => (
                      <SelectItem key={tarifa} value={tarifa}>
                        {tarifa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comuna */}
              <div className="space-y-2">
                <Label htmlFor="comuna" className="text-sm font-medium">
                  Comuna
                </Label>
                <Select
                  value={filters.comuna}
                  onValueChange={value => handleFilterChange('comuna', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas las comunas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las comunas</SelectItem>
                    {filterOptions.comunas.map(comuna => (
                      <SelectItem key={comuna} value={comuna}>
                        {comuna}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Segunda fila de filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Estado Activo */}
              <div className="space-y-2">
                <Label htmlFor="activo" className="text-sm font-medium">
                  Estado
                </Label>
                <Select
                  value={filters.activo}
                  onValueChange={value => handleFilterChange('activo', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Liberado de Corte */}
              <div className="space-y-2">
                <Label htmlFor="liberadoCorte" className="text-sm font-medium">
                  Liberado de Corte
                </Label>
                <Select
                  value={filters.liberadoCorte}
                  onValueChange={value =>
                    handleFilterChange('liberadoCorte', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Liberado</SelectItem>
                    <SelectItem value="false">No Liberado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros de fecha */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <Label className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Rango de Fecha de Término
                </Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaTerminoDesde" className="text-sm">
                    Desde
                  </Label>
                  <Input
                    id="fechaTerminoDesde"
                    type="date"
                    value={filters.fechaTerminoDesde}
                    onChange={e =>
                      handleFilterChange('fechaTerminoDesde', e.target.value)
                    }
                    className="border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaTerminoHasta" className="text-sm">
                    Hasta
                  </Label>
                  <Input
                    id="fechaTerminoHasta"
                    type="date"
                    value={filters.fechaTerminoHasta}
                    onChange={e =>
                      handleFilterChange('fechaTerminoHasta', e.target.value)
                    }
                    className="border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600"
                  />
                </div>
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
                      {filters.tipoContrato &&
                        filters.tipoContrato !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs sm:text-sm"
                          >
                            Tipo: {filters.tipoContrato}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('tipoContrato', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {filters.cicloFacturacion &&
                        filters.cicloFacturacion !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs sm:text-sm"
                          >
                            Ciclo: {filters.cicloFacturacion}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('cicloFacturacion', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {filters.tarifa && filters.tarifa !== 'all' && (
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 text-xs sm:text-sm"
                        >
                          Tarifa: {filters.tarifa}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleFilterChange('tarifa', '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {filters.comuna && filters.comuna !== 'all' && (
                        <Badge
                          variant="outline"
                          className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 text-xs sm:text-sm"
                        >
                          Comuna: {filters.comuna}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleFilterChange('comuna', '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {filters.activo && filters.activo !== 'all' && (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs sm:text-sm"
                        >
                          Estado:{' '}
                          {filters.activo === 'true' ? 'Activo' : 'Inactivo'}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleFilterChange('activo', '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {filters.liberadoCorte &&
                        filters.liberadoCorte !== 'all' && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 text-xs sm:text-sm"
                          >
                            Liberado:{' '}
                            {filters.liberadoCorte === 'true' ? 'Sí' : 'No'}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() =>
                                handleFilterChange('liberadoCorte', '')
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      {(filters.fechaTerminoDesde ||
                        filters.fechaTerminoHasta) && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 text-xs sm:text-sm"
                        >
                          Fechas: {filters.fechaTerminoDesde || '...'} -{' '}
                          {filters.fechaTerminoHasta || '...'}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => {
                              handleFilterChange('fechaTerminoDesde', '');
                              handleFilterChange('fechaTerminoHasta', '');
                            }}
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
