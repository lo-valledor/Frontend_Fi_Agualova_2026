/* eslint-disable unused-imports/no-unused-vars */
import { Edit, Eye } from 'lucide-react';

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
  loadingDelete = false
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
    <div className='flex gap-1'>
      {showView && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onView?.(item)}
          title='Ver'
          disabled={loadingView}
          className='h-8 w-8 p-0'
        >
          <Eye className='h-4 w-4' />
        </Button>
      )}
      {showEdit && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onEdit?.(item)}
          title='Editar'
          disabled={loadingEdit}
          className='h-8 w-8 p-0'
        >
          <Edit className='h-4 w-4' />
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
      className={isActive ? 'bg-emerald-500 text-white' : ''}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}

// Formateo de fecha estandarizado
export function FechaCell({ fecha }: { fecha: string | Date }) {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return (
    <div className='text-sm text-muted-foreground'>
      {isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-ES')}
    </div>
  );
}
