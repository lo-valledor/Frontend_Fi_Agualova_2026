import type { ColumnDef } from '@tanstack/react-table';
import type { GetCargoTipoContrato } from '~/types/administracion';
import { TableActions, EstadoBadge } from '~/components/data-table/table-helpers';

interface ColumnsProps {
  onEdit: (data: GetCargoTipoContrato) => void;
  onDelete: (data: GetCargoTipoContrato) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<GetCargoTipoContrato>[] => [
  {
    accessorKey: 'tipoContratoDescripcion',
    header: 'Tipo de Contrato',
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {data.tipoContratoDescripcion}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {data.cargoFacturableDescripcion}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'condicionContratoDescripcion',
    header: 'Condición',
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
<<<<<<< HEAD
    cell: ({ row }) => <EstadoBadge estado={row.getValue('estado')} />,
=======
    cell: ({ row }) => {
      const estado = row.getValue('estado') as boolean;
      return (
        <Badge
          variant={estado ? 'default' : 'destructive'}
          className={
            estado
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : ''
          }
        >
          {estado ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
>>>>>>> 9486bdcd9fa00e16cea7cde82d07cbeeaffaa316
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <TableActions
        onEdit={() => onEdit(row.original)}
        onDelete={() => onDelete(row.original)}
        showView={false}
        item={row.original}
      />
    ),
  },
];
