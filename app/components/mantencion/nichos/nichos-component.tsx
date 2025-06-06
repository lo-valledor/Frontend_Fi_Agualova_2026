import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import type { Nichos } from '~/types/mantencion';

export default function NichosComponent({nichos}: {nichos: Nichos[]}) {
  return (
    <div>
      <h1>Nichos</h1>
      <DataTable columns={columns} data={nichos} />
    </div>
  )
}
