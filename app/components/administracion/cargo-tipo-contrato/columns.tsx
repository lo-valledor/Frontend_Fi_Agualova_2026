import type { ColumnDef } from '@tanstack/react-table';
import type { GetCargoTipoContrato } from '~/types/administracion';

export const columns: ColumnDef<GetCargoTipoContrato>[] = [
  {
    accessorKey: 'tipoContratoDescripcion',
    header: 'Tipo de Contrato',
  },
  {
    accessorKey: 'cargoFacturableDescripcion',
    header: 'Cargo Facturable',
  },
  {
    accessorKey: 'condicionContratoDescripcion',
    header: 'Condición del Contrato',
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
  },
];
