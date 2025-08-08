import React from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { Card, CardContent } from '~/components/ui/card';
import type { BuscarContratos } from '~/types/reportes';

import { columns } from './columns';

interface ConsultarContratoComponentProps {
  buscarContratos: BuscarContratos[];
  error: Error | null;
}

export default function ConsultarContratoComponent({
  buscarContratos,
  error: error,
}: ConsultarContratoComponentProps) {
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b border-slate-200/60 dark:border-slate-700/60 space-y-2 sm:space-y-0'>
          <div className='text-center sm:text-left'>
            <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-slate-100'>
              Consultar Contratos
            </h1>
            <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1'>
              Busca y consulta información detallada de los contratos
            </p>
          </div>
        </div>

        {/* Table */}
        <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
          <CardContent className='relative p-0 sm:p-4'>
            <div className='overflow-x-auto'>
              <div className='min-w-full p-3 sm:p-0'>
                <DataTable columns={columns} data={buscarContratos} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
