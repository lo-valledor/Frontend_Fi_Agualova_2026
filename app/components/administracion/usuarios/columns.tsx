import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import type { Usuarios } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (user: Usuarios) => void;
  onDelete: (user: Usuarios) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<Usuarios>[] => [
  {
    accessorKey: 'nombres',
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {user.nombres} {user.apellidos}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{user.nombreDeUsuario}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'departamento',
    header: 'Departamento',
    cell: ({ row }) => {
      const departamento = row.getValue('departamento') as number;
      const departamentos = {
        1: 'Recursos Humanos',
        2: 'Tecnología',
        3: 'Ventas',
        4: 'Marketing',
        5: 'Finanzas',
        6: 'Operaciones',
      };
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {departamentos[departamento as keyof typeof departamentos] ||
            `Departamento ${departamento}`}
        </div>
      );
    },
  },
  {
    accessorKey: 'perfilId',
    header: 'Perfil',
    cell: ({ row }) => {
      const perfilId = row.getValue('perfilId') as number;
      const perfiles = {
        1: {
          name: 'Administrador',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
        2: {
          name: 'Moderador',
          color:
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        },
        3: {
          name: 'Usuario',
          color:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        },
        4: {
          name: 'Visualizador',
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        },
      };

      const perfil = perfiles[perfilId as keyof typeof perfiles] || perfiles[3];

      return <Badge className={perfil.color}>{perfil.name}</Badge>;
    },
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.getValue('activo') as boolean;
      return (
        <Badge
          variant={activo ? 'default' : 'destructive'}
          className={
            activo
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : ''
          }
        >
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'fechaCreacion',
    header: 'Fecha de Creación',
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('fechaCreacion'));
      return (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {fecha.toLocaleDateString('es-ES')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(user)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(user)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
