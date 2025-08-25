import React from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Card, CardContent } from '~/components/ui/card';
import type { BuscarContratos } from '~/types/reportes';

import { columns } from './columns';

interface ConsultarContratoComponentProps {
  buscarContratos: BuscarContratos[];
  error: Error | null;
}

export default function ConsultarContratoComponent({
  buscarContratos,
  error
}: Readonly<ConsultarContratoComponentProps>) {
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6'>
        {/* Header */}
        <ModernHeader
          title='Consultar Contratos'
          description='Busca y consulta información detallada de los contratos'
        />

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
