import type { ColumnDef } from '@tanstack/react-table';
import type { GetCargoTipoContrato } from '~/types/administracion';
import {
  TableActions,
  EstadoBadge,
} from '~/components/data-table/table-helpers';

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
    cell: ({ row }) => <EstadoBadge estado={row.getValue('estado')} />,
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
