/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import PreciosCargoComponent from '~/components/operaciones/precios-cargo/precios-cargo-component';
import React, { useState } from 'react';
import type { Route } from './+types/precios-cargo';
import api from '~/lib/api';
import type {
  PreciosCargoEnel,
  PreciosCargoEnerlova,
} from '~/types/operaciones';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  SearchIcon,
  Eraser,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { SelectContent, SelectItem } from '~/components/ui/select';
import { Select, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Precios de Cargo' },
    { name: 'description', content: 'Precios de Cargo' },
  ];
}

const currentDate = new Date();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const currentYear = currentDate.getFullYear().toString();

const months = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const url = new URL(request.url);
    const mes = url.searchParams.get('mes') || currentMonth;
    const anio = url.searchParams.get('anio') || currentYear;

    // Carga paralela de datos
    const [resTablaEnel, resTablaEnerlova] = await Promise.all([
      api.get(`/consulta-precio-pago?mes=${mes}&año=${anio}`),
      api.get(`/consulta-precio-pago-tabla`),
    ]);

    return {
      tablaEnel: resTablaEnel.data as PreciosCargoEnel[],
      tablaEnerlova: resTablaEnerlova.data as PreciosCargoEnerlova[],
      mes,
      anio,
      error: null,
    };
  } catch (_error) {
    return {
      tablaEnel: [],
      tablaEnerlova: [],
      mes: currentMonth,
      anio: currentYear,
      error: 'Error al cargar los datos',
    };
  }
}

export default function PreciosCargo({ loaderData }: Route.ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mes, setMes] = useState(loaderData.mes);
  const [anio, setAnio] = useState(loaderData.anio);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [dataEnel, setDataEnel] = useState(loaderData.tablaEnel);
  const [dataEnerlova] = useState(loaderData.tablaEnerlova);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Precios de Cargo' },
  ];

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        mes,
        año: anio,
      });
      const response = await api.get('/consulta-precio-pago', { params });
      setDataEnel(response.data as PreciosCargoEnel[]);
      toast.success('Búsqueda completada');
    } catch (_error) {
      toast.error('Error al buscar precios de cargo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setMes(currentMonth);
    setAnio(currentYear);
    handleSearch();
    toast.success('Filtros reiniciados');
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      {/* Filtros */}
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Precios de Cargo
        </h1>
        <p className="text-muted-foreground">
          Gestión de precios de cargo desde compañías de electricidad
        </p>
      </div>
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border shadow-sm">
                  <SearchIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Filtros de búsqueda
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Selecciona el periodo para consultar los precios de cargo de
                    Enel
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFiltersOpen(!isFiltersOpen);
                }}
              >
                {isFiltersOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="sr-only">Abrir/Cerrar filtros</span>
              </Button>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 md:p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
                {/* Mes */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="mes"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" /> Mes
                  </Label>
                  <Select value={mes} onValueChange={setMes}>
                    <SelectTrigger
                      id="mes"
                      className="w-full bg-background border-border/70"
                    >
                      <SelectValue placeholder="Selecciona un mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Año */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="anio"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" /> Año
                  </Label>
                  <Select value={anio} onValueChange={setAnio}>
                    <SelectTrigger
                      id="anio"
                      className="w-full bg-background border-border/70"
                    >
                      <SelectValue placeholder="Selecciona un año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar filtros
                </Button>
                <Button
                  variant="default"
                  onClick={handleSearch}
                  disabled={isLoading}
                  size="sm"
                  className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  <SearchIcon className="h-4 w-4" />
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      <PreciosCargoComponent
        tablaEnel={dataEnel}
        tablaEnerlova={dataEnerlova}
        mes={mes}
        anio={anio}
        onSearch={handleSearch}
      />
    </div>
  );
}
