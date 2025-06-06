import type { Zonas } from '~/types/mantencion';
import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';

export default function ZonasComponent({zonas}: {zonas: Zonas[]}) {
  return (
    <div>
      <h1>Zonas</h1>
      <DataTable columns={columns} data={zonas} />
    </div>
  )
}
