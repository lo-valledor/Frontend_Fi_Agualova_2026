import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import type { Sectores } from '~/types/mantencion';

export default function SectorComponent({sectores}: {sectores: Sectores[]}) {
  return (
    <div>
      <h1>Sectores</h1>
      <DataTable columns={columns} data={sectores} />
    </div>
  )
}
