import type { ColumnDef } from '@tanstack/react-table';
import type { GetCargoTipoContrato } from '~/types/administracion';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

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
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(item)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(item)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
