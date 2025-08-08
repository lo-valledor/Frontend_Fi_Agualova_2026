import type { ColumnDef } from '@tanstack/react-table';

import { useNavigate } from 'react-router';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { BuscarContratos } from '~/types/reportes';

// Componente para hacer clickeable el ID del contrato
function ContratoIdCell({ id }: { id: number }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/reportes/consultar-contrato/contrato/${id}`);
  };

  return (
    <div
      className='max-w-[200px] truncate font-medium text-sky-600 hover:text-sky-800 cursor-pointer underline decoration-dotted hover:decoration-solid transition-colors'
      onClick={handleClick}
      title={`Ver detalle del contrato ${id}`}
    >
      {id}
    </div>
  );
}

export const columns: ColumnDef<BuscarContratos>[] = [
  {
    accessorKey: 'cT_ID',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('cT_ID') as number;
      return <ContratoIdCell id={id} />;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'lC_ID',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Local' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('lC_ID') as string;
      return <div className='max-w-[200px] truncate font-medium'>{id}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'cL_RUT',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RUT Cliente' />
    ),
    cell: ({ row }) => {
      const rut = row.getValue('cL_RUT') as string;
      return <div className='max-w-[200px] truncate font-medium'>{rut}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nombreCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Cliente' />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombreCliente') as string;
      return <div className='max-w-[200px] truncate font-medium'>{nombre}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'pR_RUT',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RUT Propietario' />
    ),
    cell: ({ row }) => {
      const rut = row.getValue('pR_RUT') as string;
      return <div className='max-w-[200px] truncate font-medium'>{rut}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nombrePropietario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Propietario' />
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombrePropietario') as string;
      return <div className='max-w-[200px] truncate font-medium'>{nombre}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'mE_NSerie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='N° Serie' />
    ),
    cell: ({ row }) => {
      const nSerie = row.getValue('mE_NSerie') as string;
      return <div className='max-w-[200px] truncate font-medium'>{nSerie}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'cT_ID_Madre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID Contrato Madre' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('cT_ID_Madre') as number;
      return <div className='max-w-[200px] truncate font-medium'>{id}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'cT_esMadre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Es Madre' />
    ),
    cell: ({ row }) => {
      const esMadre = row.getValue('cT_esMadre') as boolean;
      return (
        <div className='max-w-[200px] truncate font-medium'>
          {esMadre ? 'Sí' : 'No'}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'se_codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código Servicio' />
    ),
    cell: ({ row }) => {
      const codigo = row.getValue('se_codigo') as string;
      return <div className='max-w-[200px] truncate font-medium'>{codigo}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
];
