import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '~/components/ui/badge';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { cn } from '~/lib/utils';

import {
  Building,
  User,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Hash,
  FileText,
} from 'lucide-react';
import type { GetContratos } from '~/types/administracion';
import { TableActions, EstadoBadge } from '~/components/data-table/table-helpers';

interface TableColumnsProps {
  onEdit: (contract: GetContratos) => void;
  onDelete: (contract: GetContratos) => void;
  onViewDetails: (contract: GetContratos) => void;
}

// Función robusta para formatear fechas en formato español
const formatDateToSpanish = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'N/A';

  let date: Date;

  // Si es un string, intentar parsearlo
  if (typeof dateValue === 'string') {
    // Intentar diferentes formatos de fecha
    const dateFormats = [
      // Formato ISO (2023-12-31)
      /^\d{4}-\d{2}-\d{2}/,
      // Formato DD/MM/YYYY
      /^\d{2}\/\d{2}\/\d{4}/,
      // Formato MM/DD/YYYY (formato gringo)
      /^\d{1,2}\/\d{1,2}\/\d{4}/,
      // Formato DD-MM-YYYY
      /^\d{2}-\d{2}-\d{4}/,
      // Formato MM-DD-YYYY
      /^\d{1,2}-\d{1,2}-\d{4}/,
    ];

    // Verificar si la fecha tiene un formato reconocible
    const isValidFormat = dateFormats.some(format => format.test(dateValue));

    if (!isValidFormat) {
      return 'Fecha inválida';
    }

    // Intentar crear la fecha
    date = new Date(dateValue);
  } else {
    date = dateValue;
  }

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  // Formatear en español
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para generar colores dinámicos basados en el tipo de contrato
const getTipoContratoColor = (tipoContrato: string) => {
  // Colores predefinidos para tipos comunes
  const colorMap: Record<string, string> = {
    // Tipos específicos del sistema
    'Administracion CALV': 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
    'Arrendatario Comunidad': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    'Clientes BT-2 con medidor en Arriendo': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'Clientes BT-4.3 con medidor propio': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'Locatarios S.A.': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    'Prodecol sin Recargo mal Factor de P.': 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
    'Propietario Comunidad': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
  };

  // Si existe un color predefinido, usarlo
  if (colorMap[tipoContrato]) {
    return colorMap[tipoContrato];
  }

  // Para tipos no predefinidos, generar un color basado en el hash del string
  const colors = [
    'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
    'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-800',
    'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800',
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
  ];

  // Generar un índice basado en el hash del string
  const hash = tipoContrato.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// Función para generar colores dinámicos basados en la tarifa
const getTarifaColor = (tarifa: string) => {
  // Colores predefinidos para tarifas comunes
  const colorMap: Record<string, string> = {
    // Tarifas específicas del sistema
    'BT-1': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'BT-2': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    'BT-3': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    'BT-4.3': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    'BT-*': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800',
  };

  // Si existe un color predefinido, usarlo
  if (colorMap[tarifa]) {
    return colorMap[tarifa];
  }

  // Para tarifas no predefinidas, generar un color basado en el hash del string
  const colors = [
    'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
    'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-800',
    'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800',
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
  ];

  // Generar un índice basado en el hash del string
  const hash = tarifa.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export const columns = ({
  onEdit,
  onDelete,
  onViewDetails,
}: TableColumnsProps): ColumnDef<GetContratos>[] => [
  {
    accessorKey: 'codigoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código Contrato" />
    ),
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-md">
            <FileText className="h-3 w-3 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <div className="font-mono text-sm font-medium text-sky-800 dark:text-sky-200">
              {contract.codigoContrato}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {contract.acometida}
            </div>
          </div>
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: 'tipoContrato',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipoContrato = row.getValue('tipoContrato') as string;
      const colorClass = getTipoContratoColor(tipoContrato);

      return (
        <div className="flex items-center gap-2">
          <Building className="h-3 w-3 text-slate-400" />
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", colorClass)}
          >
            {tipoContrato}
          </Badge>
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => {
      const tarifa = row.getValue('tarifa') as string;
      const colorClass = getTarifaColor(tarifa);

      return (
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-slate-400" />
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", colorClass)}
          >
            {tarifa}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'nombrePropietario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Propietario" />
    ),
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
            <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="max-w-[150px]">
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
              {contract.nombrePropietario}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {contract.nombreCliente}
            </div>
          </div>
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: 'local',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    cell: ({ row }) => {
      const local = row.getValue('local') as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-md">
            <Building className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
            {local}
          </span>
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Inicio" />
    ),
    cell: ({ row }) => {
      const fechaFormateada = formatDateToSpanish(row.getValue('fechaInicio'));
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
            <Calendar className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {fechaFormateada}
          </span>
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Hash className="h-3 w-3 text-slate-400" />
          <EstadoBadge estado={row.getValue('activo')} />
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'comunaEnvio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comuna" />
    ),
    cell: ({ row }) => {
      const comuna = row.getValue('comunaEnvio') as string;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
            <MapPin className="h-3 w-3 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300 max-w-[100px] truncate">
            {comuna}
          </span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'liberadoCorte',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Liberado Corte" />
    ),
    cell: ({ row }) => {
      const liberado = row.getValue('liberadoCorte') as boolean;
      return (
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-slate-400" />
          <Badge
            variant={liberado ? 'default' : 'secondary'}
            className={cn(
              "text-xs font-medium",
              liberado
                ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800"
            )}
          >
            {liberado ? 'Liberado' : 'No Liberado'}
          </Badge>
        </div>
      );
    },
    size: 140,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <TableActions
            onView={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            item={row.original}
            showView={true}
          />
        </div>
      );
    },
    size: 120,
    enableSorting: false,
  },
];
