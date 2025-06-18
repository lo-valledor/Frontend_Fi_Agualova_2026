import type { ColumnDef } from '@tanstack/react-table';
import type { CiclosFacturacion } from '~/types/mantencion';

export const columns: ColumnDef<CiclosFacturacion>[] = [
  {
    header: 'Descripción',
    accessorKey: 'descripcion',
  },
  {
    header: 'Día de facturación',
    accessorKey: 'diaFacturacion',
  },
  {
    header: 'Día de inicio de lectura',
    accessorKey: 'diaInicioLectura',
  },
  {
    header: 'Días de vencimiento de la factura',
    accessorKey: 'diasVencimientoFactura',
  },
  {
    header: 'Estado',
    accessorKey: 'estado',
  },
];
