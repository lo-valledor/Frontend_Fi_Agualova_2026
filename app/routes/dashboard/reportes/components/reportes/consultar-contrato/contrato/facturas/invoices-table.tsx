import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import type { DetalleFacturas } from '~/types/reportes';

import { calcularEstadoFactura, formatCurrency } from './billing-dashboard';

interface InvoicesTableProps {
  facturas: Array<
    DetalleFacturas & { consumoPeriodo: number; costoPorKwh: number }
  >;
}

type SortField =
  | 'periodo'
  | 'valorTotal'
  | 'consumoPeriodo'
  | 'costoPorKwh'
  | 'fechaVencimiento';
type SortDirection = 'asc' | 'desc';

// Extraer mes y año
const extraerAnoMes = (periodo: string) => {
  const mes = periodo.substring(0, 2);
  const ano = periodo.substring(2, 6);
  return { mes, ano };
};

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
  return meses[parseInt(mes, 10) - 1] || mes;
};

const InvoicesTable = memo(function InvoicesTable({
  facturas
}: InvoicesTableProps) {
  const [sortField, setSortField] = useState<SortField>('periodo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Ordenar y paginar
  const { sortedData, totalPages } = useMemo(() => {
    const sorted = [...facturas].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'periodo':
          comparison = a.periodo.localeCompare(b.periodo);
          break;
        case 'valorTotal':
          comparison = (a.valorTotal || 0) - (b.valorTotal || 0);
          break;
        case 'consumoPeriodo':
          comparison = a.consumoPeriodo - b.consumoPeriodo;
          break;
        case 'costoPorKwh':
          comparison = a.costoPorKwh - b.costoPorKwh;
          break;
        case 'fechaVencimiento':
          comparison =
            new Date(a.fechaVencimiento).getTime() -
            new Date(b.fechaVencimiento).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

    return { sortedData: paginatedData, totalPages };
  }, [facturas, sortField, sortDirection, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCopyFactura = (nroFactura: string) => {
    navigator.clipboard.writeText(nroFactura);
    toast.success('Número de factura copiado');
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
        <CardTitle className="text-base">Tabla Detallada de Facturas</CardTitle>
        <CardDescription>
          Historial completo ({facturas.length} facturas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="periodo">Periodo</SortButton>
                  </TableHead>
                  <TableHead>Nro Factura</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead>
                    <SortButton field="fechaVencimiento">
                      Vencimiento
                    </SortButton>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="consumoPeriodo">Consumo</SortButton>
                  </TableHead>
                  <TableHead className="text-right">Valor Neto</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">
                    <SortButton field="valorTotal">Total</SortButton>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="costoPorKwh">$/kWh</SortButton>
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((factura, index) => {
                  const { mes, ano } = extraerAnoMes(factura.periodo);
                  const estado = calcularEstadoFactura(
                    factura.fechaVencimiento
                  );

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {getNombreMes(mes)} {ano}
                          </span>
                          <span className="text-xs text-slate-500">
                            {factura.periodo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleCopyFactura(factura.nroFactura)}
                          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                          title="Click para copiar"
                        >
                          {factura.nroFactura}
                          <Copy className="h-3 w-3" />
                        </button>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(factura.fechaEmision).toLocaleDateString(
                          'es-CL'
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(factura.fechaVencimiento).toLocaleDateString(
                          'es-CL'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {factura.consumoPeriodo.toLocaleString('es-CL')}
                        <span className="text-xs text-slate-500 ml-1">kWh</span>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(factura.valorNeto!)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-emerald-600">
                        {formatCurrency(factura.iva!)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(factura.valorTotal!)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ${factura.costoPorKwh.toFixed(0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            estado.estado === 'vencida'
                              ? 'destructive'
                              : 'default'
                          }
                          className="text-xs"
                        >
                          {estado.estado === 'vencida'
                            ? 'Vencida'
                            : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        </div>
      </CardContent>
    </Card>
  );
});

export default InvoicesTable;
