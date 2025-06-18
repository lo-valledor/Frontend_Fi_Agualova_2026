import type { ColumnDef } from '@tanstack/react-table';
import type { Claves } from '~/types/mantencion';

export const columns: ColumnDef<Claves>[] = [
  {
    header: 'Descripción',
    accessorKey: 'descripcion',
  },
  {
    header: 'Estado',
    accessorKey: 'estado',
  },
  {
    header: 'Tipo',
    accessorKey: 'tipo',
  },
  {
    header: 'Código',
    accessorKey: 'codigo',
  },
];

/**
 * id: number;
  descripcion: string;
  estado: boolean;
  tipo: string;
  codigo: string;
 */
