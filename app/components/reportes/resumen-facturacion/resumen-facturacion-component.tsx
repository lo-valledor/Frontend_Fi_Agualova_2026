import React, { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { reportesService } from '~/services/reportesService';
import type {
  ComboEmpalmes,
  FacturacionPorCargo,
  PeriodosFacturacion,
} from '~/types/reportes';

import { columns } from './columns';

interface ResumenFacturacionComponentProps {
  comboEmpalmes: ComboEmpalmes[];
  periodosFacturacion: PeriodosFacturacion[];
  error: Error | null;
}

export default function ResumenFacturacionComponent({
  comboEmpalmes,
  periodosFacturacion,
  error: _error,
}: ResumenFacturacionComponentProps) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedEmpalme, setSelectedEmpalme] = useState<string>('');
  const [facturacionData, setFacturacionData] = useState<FacturacionPorCargo[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Columnas para exportación
  const exportColumns: ExportColumn[] = [
    { key: 'cargoDescripcion', header: 'Descripción' },
    { key: 'totalEnergiaPeriodoAnterior', header: 'Energía Período Anterior' },
    { key: 'totalFacturaPeriodoAnterior', header: 'Factura Período Anterior' },
    { key: 'cantidadCargosPeriodoAnterior', header: 'Cantidad Cargos Anterior' },
    { key: 'totalEnergiaPeriodoActual', header: 'Energía Período Actual' },
    { key: 'totalFacturaPeriodoActual', header: 'Factura Período Actual' },
    { key: 'cantidadCargosPeriodoActual', header: 'Cantidad Cargos Actual' },
    { key: 'diferenciaPeriodos', header: 'Diferencia Períodos' },
  ];

  const handleConsultar = async () => {
    if (!selectedPeriodo || !selectedEmpalme) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await reportesService.getFacturacionPorCargo(
        selectedPeriodo,
        parseInt(selectedEmpalme, 10)
      );

      if (response.error) {
        setFetchError(response.error);
        setFacturacionData([]);
      } else {
        setFacturacionData(response.data || []);
      }
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : 'Error desconocido'
      );
      setFacturacionData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b border-slate-200/60 dark:border-slate-700/60 space-y-2 sm:space-y-0'>
          <div className='text-center sm:text-left'>
            <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-slate-100'>
              Resumen de Facturación
            </h1>
            <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1'>
              Revisión de la Facturación Realizada por períodos y empalmes
            </p>
          </div>
          
          {facturacionData.length > 0 && (
            <div className='flex justify-center sm:justify-end'>
              <ExportButton
                data={facturacionData}
                columns={exportColumns}
                filename='resumen_facturacion'
                size='sm'
                className='text-xs sm:text-sm'
              />
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
          <CardContent className='p-3 sm:p-4 lg:p-6'>
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6'>
              <div className='flex-1 min-w-0'>
                <label className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block'>
                  Período de Facturación
                </label>
                <Select
                  value={selectedPeriodo}
                  onValueChange={setSelectedPeriodo}
                >
                  <SelectTrigger className='w-full h-9 sm:h-10'>
                    <SelectValue placeholder='Seleccionar período' />
                  </SelectTrigger>
                  <SelectContent>
                    {periodosFacturacion.map(periodo => (
                      <SelectItem key={periodo.pF_ID} value={periodo.pF_ID}>
                        {periodo.pF_Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex-1 min-w-0'>
                <label className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block'>
                  Empalme
                </label>
                <Select
                  value={selectedEmpalme}
                  onValueChange={setSelectedEmpalme}
                >
                  <SelectTrigger className='w-full h-9 sm:h-10'>
                    <SelectValue placeholder='Seleccionar empalme' />
                  </SelectTrigger>
                  <SelectContent>
                    {comboEmpalmes.map(empalme => (
                      <SelectItem
                        key={empalme.emId}
                        value={empalme.emId.toString()}
                      >
                        {empalme.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex sm:items-end'>
                <Button
                  onClick={handleConsultar}
                  disabled={!selectedPeriodo || !selectedEmpalme || isLoading}
                  className='w-full sm:w-auto px-4 sm:px-6 h-9 sm:h-10 bg-sky-600 hover:bg-sky-700 text-white text-sm'
                >
                  {isLoading ? 'Consultando...' : 'Consultar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
          <CardContent className='relative p-0 sm:p-4'>
            {fetchError && (
              <div className='m-3 sm:m-4 p-3 sm:p-4 text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-400 text-sm'>
                {fetchError}
              </div>
            )}
            <div className='overflow-x-auto'>
              <div className='min-w-full p-3 sm:p-0'>
                <DataTable columns={columns} data={facturacionData} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
