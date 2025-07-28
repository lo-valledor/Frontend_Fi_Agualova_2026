import { Edit, Eye, Trash2 } from 'lucide-react';

import React from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

// Botones de acción estandarizados
export function TableActions({
  onView,
  onEdit,
  onDelete,
  item,
  showView = false,
  showEdit = true,
  showDelete = true,
  loadingEdit = false,
  loadingView = false,
  loadingDelete = false,
}: {
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  item: any;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  loadingEdit?: boolean;
  loadingView?: boolean;
  loadingDelete?: boolean;
}) {
  return (
    <div className='flex gap-2'>
      {showView && (
        <Button
          variant='outline'
          size='icon'
          onClick={() => onView?.(item)}
          title='Ver Detalles'
          disabled={loadingView}
        >
          <Eye className={`h-4 w-4${loadingView ? ' animate-spin' : ''}`} />
        </Button>
      )}
      {showEdit && (
        <Button
          variant='outline'
          size='icon'
          onClick={() => onEdit?.(item)}
          title='Editar'
          disabled={loadingEdit}
        >
          <Edit className={`h-4 w-4${loadingEdit ? ' animate-spin' : ''}`} />
        </Button>
      )}
      {showDelete && (
        <Button
          variant='destructive'
          size='icon'
          onClick={() => onDelete?.(item)}
          title='Eliminar'
          disabled={loadingDelete}
        >
          <Trash2
            className={`h-4 w-4${loadingDelete ? ' animate-spin' : ''}`}
          />
        </Button>
      )}
    </div>
  );
}

// Badge de estado estandarizado
export function EstadoBadge({ estado }: { estado: boolean | string }) {
  const isActive =
    typeof estado === 'string'
      ? estado.toLowerCase() === 'activo'
      : Boolean(estado);
  return (
    <Badge
      variant={isActive ? 'default' : 'destructive'}
      className={
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : ''
      }
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}

// Formateo de fecha estandarizado
export function FechaCell({ fecha }: { fecha: string | Date }) {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return (
    <div className='text-sm text-gray-600 dark:text-gray-300'>
      {isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-ES')}
    </div>
  );
}
