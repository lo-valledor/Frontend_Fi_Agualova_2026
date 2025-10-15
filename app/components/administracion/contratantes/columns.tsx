import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'rut.js';

import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import type { GetContratante, GetComunas } from '~/types/administracion';

interface ContratantesColumnsProps {
  onDetails: (contratante: GetContratante) => void;
  detailingContratanteRut: string | null;
  comunas: GetComunas[];
}

export const columns = ({
  onDetails,
  detailingContratanteRut,
  comunas
}: ContratantesColumnsProps): ColumnDef<GetContratante>[] => [
  {
    accessorKey: 'rut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RUT' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium truncate text-xs sm:text-sm'
              title={row.original.rut}
            >
              {format(row.getValue('rut'))}
            </div>
          </div>
        </div>
      );
    },
    minSize: 150,
    maxSize: 220
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const nombreCompleto = row.original.esEmpresa
        ? row.original.nombre
        : `${row.original.nombre} ${row.original.apellido || ''}`.trim();

      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium truncate text-xs sm:text-sm'
              title={nombreCompleto}
            >
              {nombreCompleto}
            </div>
            <div className='flex items-center gap-1 mt-1'>
              <Badge
                variant={row.original.esEmpresa ? 'default' : 'secondary'}
                className='text-xs'
              >
                {row.original.esEmpresa ? 'Empresa' : 'Persona'}
              </Badge>
            </div>
          </div>
        </div>
      );
    },
    minSize: 200,
    maxSize: 280
  },
  {
    accessorKey: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      // Buscar el nombre de la comuna por su código
      const comunaNombre =
        comunas.find(c => c.codigo === row.original.comuna)?.nombre ||
        row.original.comuna;

      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium truncate text-xs sm:text-sm'
              title={row.original.direccion || 'No especificada'}
            >
              {row.original.direccion || 'No especificada'}
            </div>
            <div className='text-xs truncate'>{comunaNombre}</div>
          </div>
        </div>
      );
    },
    minSize: 200,
    maxSize: 250
  },
  {
    accessorKey: 'contacto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contacto' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium truncate text-xs sm:text-sm'
              title={row.original.contacto || 'No especificado'}
            >
              {row.original.contacto || 'No especificado'}
            </div>
            <div className='text-xs truncate'>
              {row.original.telefono || 'Sin teléfono'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 180,
    maxSize: 220
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='min-w-0 flex-1'>
            <div
              className='font-medium truncate text-xs sm:text-sm'
              title={row.original.email || 'No especificado'}
            >
              {row.original.email || 'No especificado'}
            </div>
          </div>
        </div>
      );
    },
    minSize: 200,
    maxSize: 250
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center justify-center'>
          <TableActions
            onView={onDetails}
            item={row.original}
            showView={true}
            showEdit={false}
            showDelete={false}
            loadingView={detailingContratanteRut === row.original.rut}
          />
        </div>
      );
    },
    minSize: 80,
    maxSize: 100,
    enableSorting: false
  }
];
