import type { ColumnDef } from '@tanstack/react-table';
import type { MonitorLecturasAnteriores } from '~/types/monitor';

export const columnsLeturasAnteriores: ColumnDef<MonitorLecturasAnteriores>[] =
  [
    {
      accessorKey: 'periodo',
      header: 'Periodo'
    },
    {
      accessorKey: 'fechaLectura',
      header: 'Fecha Lectura'
    },
    {
      accessorKey: 'ultimaLectura',
      header: 'Ultima Lectura'
    },
    {
      accessorKey: 'lecturaActual',
      header: 'Lectura Actual'
    },
    {
      accessorKey: 'consumoPeriodo',
      header: 'Consumo Periodo'
    },
    {
      accessorKey: 'consumoAdicional',
      header: 'Consumo Adicional'
    }
  ];
