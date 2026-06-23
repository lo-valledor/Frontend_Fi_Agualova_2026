import type { ColumnDef } from '@tanstack/react-table';

import { useNavigate } from 'react-router';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { BuscarContrato } from '~/types/reportes';

// Componente para hacer clickeable el ID del contrato
function ContratoIdCell({ id }: { id: number }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/reportes/consultar-contrato/contrato/${id}`);
  };

  return (
    <div
      className="max-w-[200px] truncate font-medium text-sky-600 hover:text-sky-800 cursor-pointer underline decoration-dotted hover:decoration-solid transition-colors"
      onClick={handleClick}
      title={`Ver detalle del contrato ${id}`}
    >
      {id}
    </div>
  );
}

export const columns: ColumnDef<BuscarContrato>[] = [
  {
    accessorKey: 'idContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue('idContrato') as number;
      return <ContratoIdCell id={id} />;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'nroLocal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    cell: ({ row }) => {
      const id = row.getValue('nroLocal') as string;
      return <div className="max-w-[200px] truncate font-medium">{id}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'rutCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RUT Cliente" />
    ),
    cell: ({ row }) => {
      const rut = row.getValue('rutCliente') as string;
      return <div className="max-w-[200px] truncate font-medium">{rut}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'nombreCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre Cliente" />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombreCliente') as string;
      return <div className="max-w-[200px] truncate font-medium">{nombre}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'rutPropietario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RUT Propietario" />
    ),
    cell: ({ row }) => {
      const rut = row.getValue('rutPropietario') as string;
      return <div className="max-w-[200px] truncate font-medium">{rut}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'nombrePropietario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre Propietario" />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombrePropietario') as string;
      return <div className="max-w-[200px] truncate font-medium">{nombre}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'nroMedidor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Serie" />
    ),
    cell: ({ row }) => {
      const nSerie = row.getValue('nroMedidor') as string;
      return <div className="max-w-[200px] truncate font-medium">{nSerie}</div>;
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'acometida',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acometida" />
    ),
    cell: ({ row }) => {
      const acometida = row.getValue('acometida') as string;
      return <div className="max-w-[200px] truncate font-medium">{acometida}</div>;
    },
    enableSorting: true,
    enableHiding: false
  }
];
