import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '~/components/ui/badge';
import type { Roles } from '~/types/roles-permisos';

export const createRolesColumns = (): ColumnDef<Roles>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono text-xs">
        {row.original.id}
      </Badge>
    )
  },
  {
    accessorKey: 'name',
    header: 'Rol',
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
  },
  {
    accessorKey: 'normalizedName',
    header: 'Nombre Normalizado',
    cell: ({ row }) => (
      <div className="max-w-[320px] truncate text-sm text-muted-foreground">
        {row.original.normalizedName || 'Sin nombre normalizado'}
      </div>
    )
  },
  {
    accessorKey: 'concurrencyStamp',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge
        className={
          row.original.concurrencyStamp
            ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            : 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
        }
      >
        {row.original.concurrencyStamp ? 'Activo' : 'Sin sello'}
      </Badge>
    )
  }
];
