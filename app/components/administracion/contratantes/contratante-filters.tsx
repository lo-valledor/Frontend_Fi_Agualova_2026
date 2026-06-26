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

export interface ContratanteFilters {
  esEmpresa: string;
  comuna: string;
  tieneContacto: string;
  tieneTelefono: string;
  tieneEmail: string;
}

interface ContratanteFiltersProps {
  filters: ContratanteFilters;
  onFiltersChange: (filters: ContratanteFilters) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
}

export function ContratanteFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions
}: ContratanteFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ContratanteFilters, value: string) => {
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
    <Card className="border-orange-200/50 dark:border-orange-800/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Filter className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
                    Filtros Avanzados
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Filtra contratantes por tipo, ubicación y contacto
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                  >
                    {activeFiltersCount} filtro
                    {activeFiltersCount !== 1 ? 's' : ''} activo
                    {activeFiltersCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 dark:text-orange-400"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Tipo de Contratante */}
              <div className="space-y-2">
                <Label htmlFor="esEmpresa" className="text-sm font-medium">
                  Tipo de Contratante
                </Label>
                <Select
                  value={filters.esEmpresa}
                  onValueChange={value =>
                    handleFilterChange('esEmpresa', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="false">Persona Natural</SelectItem>
                    <SelectItem value="true">Empresa</SelectItem>
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

              {/* Tiene Contacto */}
              <div className="space-y-2">
                <Label htmlFor="tieneContacto" className="text-sm font-medium">
                  Tiene Contacto
                </Label>
                <Select
                  value={filters.tieneContacto}
                  onValueChange={value =>
                    handleFilterChange('tieneContacto', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Con Contacto</SelectItem>
                    <SelectItem value="false">Sin Contacto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="tieneTelefono" className="text-sm font-medium">
                  Tiene Teléfono
                </Label>
                <Select
                  value={filters.tieneTelefono}
                  onValueChange={value =>
                    handleFilterChange('tieneTelefono', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Con Teléfono</SelectItem>
                    <SelectItem value="false">Sin Teléfono</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tiene Email */}
              <div className="space-y-2">
                <Label htmlFor="tieneEmail" className="text-sm font-medium">
                  Tiene Email
                </Label>
                <Select
                  value={filters.tieneEmail}
                  onValueChange={value =>
                    handleFilterChange('tieneEmail', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Con Email</SelectItem>
                    <SelectItem value="false">Sin Email</SelectItem>
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
                    <div className="flex flex-wrap gap-2">
                      {filters.esEmpresa && filters.esEmpresa !== 'all' && (
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                        >
                          Tipo:{' '}
                          {filters.esEmpresa === 'true' ? 'Empresa' : 'Persona'}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleFilterChange('esEmpresa', '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {filters.comuna && filters.comuna !== 'all' && (
                        <Badge
                          variant="outline"
                          className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800"
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
                      {/* Resto de badges similares... */}
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
