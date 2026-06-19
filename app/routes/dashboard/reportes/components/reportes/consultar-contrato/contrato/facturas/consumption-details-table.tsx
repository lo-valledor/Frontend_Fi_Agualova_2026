import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import type { DetalleLecturas } from '~/types/reportes';

interface ConsumptionDetailsTableProps {
  detalleLecturas: DetalleLecturas[];
}

type SortField = 'periodo' | 'fechaLectura' | 'consumoPeriodo' | 'sobreconsumo';
type SortDirection = 'asc' | 'desc';

// Función para extraer año y mes del período MMAAAA
const extraerAnoMes = (periodo: string) => {
  const mes = periodo.substring(0, 2);
  const ano = periodo.substring(2, 6);
  return { mes, ano };
};

// Función para obtener nombre del mes
const getNombreMes = (mes: string) => {
  const meses = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ];
  const mesNum = Number.parseInt(mes, 10);
  return meses[mesNum - 1] || mes;
};

const ConsumptionDetailsTable = memo(function ConsumptionDetailsTable({
  detalleLecturas
}: ConsumptionDetailsTableProps) {
  const [sortField, setSortField] = useState<SortField>('periodo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ordenar y paginar datos
  const { sortedData, totalPages } = useMemo(() => {
    // Ordenar
    const sorted = [...detalleLecturas].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'periodo':
          comparison = a.periodo.localeCompare(b.periodo);
          break;
        case 'fechaLectura':
          comparison =
            new Date(a.fechaLectura).getTime() -
            new Date(b.fechaLectura).getTime();
          break;
        case 'consumoPeriodo':
          comparison = (a.consumoPeriodo || 0) - (b.consumoPeriodo || 0);
          break;
        case 'sobreconsumo':
          comparison = (a.sobreconsumo || 0) - (b.sobreconsumo || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Paginar
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sorted.slice(startIndex, endIndex);

    return { sortedData: paginatedData, totalPages };
  }, [detalleLecturas, sortField, sortDirection, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton = ({
    field,
    children
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </Button>
  );

  return (
    <Card className="border bg-background">
      <CardHeader>
        <CardTitle className="text-base">Detalle de Lecturas</CardTitle>
        <CardDescription>
          Tabla completa con todas las lecturas registradas (
          {detalleLecturas.length} registros)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    <SortButton field="periodo">Periodo</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="fechaLectura">Fecha Lectura</SortButton>
                  </TableHead>
                  <TableHead className="text-right">Lectura Anterior</TableHead>
                  <TableHead className="text-right">Lectura Actual</TableHead>
                  <TableHead className="text-right">
                    <SortButton field="consumoPeriodo">Consumo</SortButton>
                  </TableHead>
                  <TableHead className="text-right">Energía Base</TableHead>
                  <TableHead className="text-right">
                    <SortButton field="sobreconsumo">Sobreconsumo</SortButton>
                  </TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400">
                        No hay datos disponibles
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((lectura, index) => {
                    const { mes, ano } = extraerAnoMes(lectura.periodo);
                    const tieneSobreconsumo =
                      lectura.sobreconsumo && lectura.sobreconsumo > 0;

                    return (
                      <TableRow
                        key={`${lectura.periodo}-${index}`}
                        className={
                          tieneSobreconsumo
                            ? 'bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30'
                            : ''
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {getNombreMes(mes)} {ano}
                            </span>
                            <span className="text-xs text-slate-500">
                              {lectura.periodo}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(lectura.fechaLectura).toLocaleDateString(
                            'es-CL'
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {lectura.lecturaAnterior?.toLocaleString('es-CL') ||
                            '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {lectura.lecturaActual?.toLocaleString('es-CL') ||
                            '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {lectura.consumoPeriodo?.toLocaleString('es-CL') ||
                            '-'}{' '}
                          {lectura.consumoPeriodo && (
                            <span className="text-xs text-slate-500">kWh</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-emerald-600 dark:text-emerald-400">
                          {lectura.energiaBase?.toLocaleString('es-CL') || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {tieneSobreconsumo ? (
                            <span className="text-rose-600">
                              {lectura.sobreconsumo?.toLocaleString('es-CL')}{' '}
                              <span className="text-xs">kWh</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {tieneSobreconsumo ? (
                            <Badge
                              variant="destructive"
                              className="text-xs font-medium"
                            >
                              Alerta
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="text-xs font-medium"
                            >
                              Normal
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Resumen de tabla */}
          <div className="pt-4 border-t text-xs text-slate-600 dark:text-slate-400">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="font-medium">Total registros:</span>{' '}
                {detalleLecturas.length}
              </div>
              <div>
                <span className="font-medium">Con sobreconsumo:</span>{' '}
                {
                  detalleLecturas.filter(
                    l => l.sobreconsumo && l.sobreconsumo > 0
                  ).length
                }
              </div>
              <div>
                <span className="font-medium">Normales:</span>{' '}
                {
                  detalleLecturas.filter(
                    l => !l.sobreconsumo || l.sobreconsumo === 0
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default ConsumptionDetailsTable;
