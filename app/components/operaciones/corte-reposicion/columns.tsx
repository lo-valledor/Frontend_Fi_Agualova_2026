import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { ConsultarMantenedorRevisionCorte } from '~/types/operaciones';
import { CorteRegistradoDialog } from './corte-registrado-dialog';
import { MarcarLiberarDialog } from './marcar-liberar-dialog';
import { ReposicionSolicitadaDialog } from './reposicion-solicitada-dialog';

export const columns: ColumnDef<ConsultarMantenedorRevisionCorte>[] = [
  {
    accessorKey: 'ctId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: 'seCodigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
  },
  {
    accessorKey: 'meNSerie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Serie" />
    ),
  },
  {
    accessorKey: 'clRut',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RUT" />
    ),
  },
  {
    accessorKey: 'clRazonSocialCompleto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Razón Social" />
    ),
  },
  {
    accessorKey: 'niDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
  },
  {
    accessorKey: 'secDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sección" />
    ),
  },
  {
    accessorKey: 'reEstado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
  },
  {
    accessorKey: 'reCantDocumentos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad de Documentos" />
    ),
  },
  {
    accessorKey: 'reDeudaTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deuda Total" />
    ),
  },
  {
    header: 'Acciones',
    id: 'acciones',
    cell: ({ row, table }) => {
      const acometida = row.original.seCodigo;

      const handleSuccess = () => {
        (
          table.options.meta as { handleBuscar: () => void } | undefined
        )?.handleBuscar();
      };

      return (
        <div className="flex items-center justify-start gap-2">
          <ReposicionSolicitadaDialog
            acometida={acometida}
            onSuccess={handleSuccess}
          />
          <CorteRegistradoDialog
            acometida={acometida}
            onSuccess={handleSuccess}
          />
          <MarcarLiberarDialog
            acometida={acometida}
            onSuccess={handleSuccess}
          />
        </div>
      );
    },
  },
];
