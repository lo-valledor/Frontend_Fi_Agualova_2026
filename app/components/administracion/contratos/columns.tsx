import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { TableActions } from '~/components/data-table/table-helpers';
import { Badge } from '~/components/ui/badge';
import { type ContratosRow } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (contract: ContratosRow) => void;
  onDelete: (contract: ContratosRow) => void;
  onViewDetails: (contract: ContratosRow) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onViewDetails
}: TableColumnsProps): ColumnDef<ContratosRow>[] => [
  {
    accessorKey: 'idContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-xs sm:text-sm">
          {row.original.idContrato}
        </span>
      );
    },
    size: 120
  },
  {
    accessorKey: 'subEmpalme',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sub Empalme" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.subEmpalme}</span>
      );
    }
  },
  {
    accessorKey: 'tipoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo Contrato" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.tipoContrato}</span>
      );
    }
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => {
      return <span className="text-xs sm:text-sm">{row.original.tarifa}</span>;
    }
  },
  {
    accessorKey: 'nombrePropietario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Propietario" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">
          {row.original.nombrePropietario}
        </span>
      );
    }
  },
  {
    accessorKey: 'nombreCliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.nombreCliente}</span>
      );
    }
  },
  {
    accessorKey: 'localEmpresa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local Empresa" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.localEmpresa}</span>
      );
    }
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inicio" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">
          {new Date(row.original.fechaInicio).toLocaleDateString()}
        </span>
      );
    }
  },
  {
    accessorKey: 'fechaTermino',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Término" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">
          {row.original.fechaTermino
            ? new Date(row.original.fechaTermino).toLocaleDateString()
            : 'N/A'}
        </span>
      );
    }
  },
  {
    accessorKey: 'comunaEnvio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comuna Envío" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.comunaEnvio}</span>
      );
    }
  },
  {
    accessorKey: 'direccionEnvio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección Envío" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">
          {row.original.direccionEnvio}
        </span>
      );
    }
  },
  {
    accessorKey: 'limiteInvierno',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Límite Invierno" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">
          {row.original.limiteInvierno}
        </span>
      );
    }
  },
  {
    accessorKey: 'ciclo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclo" />
    ),
    cell: ({ row }) => {
      return <span className="text-xs sm:text-sm">{row.original.ciclo}</span>;
    }
  },
  {
    accessorKey: 'potencia',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Potencia" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.potencia}</span>
      );
    }
  },
  {
    accessorKey: 'liberadoCorte',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Liberado Corte" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm">{row.original.liberadoCorte}</span>
      );
    }
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="text-xs">
          {row.original.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
    size: 120
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <TableActions
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            onView={() => onViewDetails(row.original)}
            item={row.original}
            showView={true}
          />
        </div>
      );
    },
    size: 90
  }
];
