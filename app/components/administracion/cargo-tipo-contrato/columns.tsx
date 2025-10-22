import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import {
  EstadoBadge,
  TableActions
} from '~/components/data-table/table-helpers';
import type { GetCargoTipoContrato } from '~/types/administracion';

interface ColumnsProps {
  onEdit: (data: GetCargoTipoContrato) => void;
  onDelete: (data: GetCargoTipoContrato) => void;
  canEdit?: boolean;
}

export const columns = ({
  onEdit,
  onDelete,
  canEdit = true
}: ColumnsProps): ColumnDef<GetCargoTipoContrato>[] => [
  {
    accessorKey: 'tipoContratoDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo de Contrato' />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className='flex items-center space-x-3 min-w-0'>
          <div className='min-w-0'>
            <div
              className='font-medium text-xs sm:text-sm  truncate'
              title={data.tipoContratoDescripcion}
            >
              {data.tipoContratoDescripcion}
            </div>
            <div
              className='text-xs  truncate'
              title={data.cargoFacturableDescripcion}
            >
              {data.cargoFacturableDescripcion}
            </div>
          </div>
        </div>
      );
    },
    minSize: 180,
    maxSize: 250
  },
  {
    accessorKey: 'condicionContratoDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Condición' />
    ),
    cell: ({ row }) => {
      const condicion = row.getValue('condicionContratoDescripcion') as string;
      return (
        <div
          className='font-medium text-xs sm:text-sm truncate'
          title={condicion}
        >
          {condicion}
        </div>
      );
    },
    minSize: 140,
    maxSize: 180
  },
  {
    accessorKey: 'descripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const descripcion = row.getValue('descripcion') as string;
      return (
        <div className='text-xs sm:text-sm truncate' title={descripcion}>
          {descripcion}
        </div>
      );
    },
    minSize: 170,
    maxSize: 220
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => <EstadoBadge estado={row.getValue('estado')} />,
    minSize: 100,
    maxSize: 120
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acciones' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <TableActions
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
          showView={false}
          item={row.original}
          disableEdit={!canEdit}
        />
      </div>
    ),
    minSize: 100,
    maxSize: 120
  }
];
