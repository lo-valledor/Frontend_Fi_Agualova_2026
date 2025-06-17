'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Building,
  User,
  MapPin,
  Calendar,
  Shield,
  Zap,
} from 'lucide-react';
import type { GetContratos } from '~/types/administracion';

interface TableColumnsProps {
  onEdit: (contract: GetContratos) => void;
  onDelete: (contract: GetContratos) => void;
  onViewDetails: (contract: GetContratos) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onViewDetails,
}: TableColumnsProps): ColumnDef<GetContratos>[] => [
  {
    accessorKey: 'codigoContrato',
    header: 'Código Contrato',
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="font-mono text-sm font-medium text-sky-800 dark:text-sky-200">
              {contract.codigoContrato}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {contract.acometida}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'tipoContrato',
    header: 'Tipo',
    cell: ({ row }) => {
      const tipoContrato = row.getValue('tipoContrato') as string;
      const tipoColors = {
        Residencial:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        Comercial:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        Industrial:
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        Público:
          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      };

      return (
        <Badge
          className={
            tipoColors[tipoContrato as keyof typeof tipoColors] ||
            tipoColors.Residencial
          }
        >
          <Building className="w-3 h-3 mr-1" />
          {tipoContrato}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'tarifa',
    header: 'Tarifa',
    cell: ({ row }) => {
      const tarifa = row.getValue('tarifa') as string;
      const tarifaColors = {
        'BT-1':
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        'BT-2': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'BT-3':
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'AT-2':
          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        'AT-3': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      };

      return (
        <Badge
          className={
            tarifaColors[tarifa as keyof typeof tarifaColors] ||
            'bg-gray-100 text-gray-800'
          }
        >
          <Zap className="w-3 h-3 mr-1" />
          {tarifa}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'nombrePropietario',
    header: 'Propietario',
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
            <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="max-w-[150px]">
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {contract.nombrePropietario}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {contract.nombreCliente}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'local',
    header: 'Local',
    cell: ({ row }) => {
      const local = row.getValue('local') as string;
      return (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-md">
            <Building className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
            {local}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'fechaInicio',
    header: 'Fecha Inicio',
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('fechaInicio'));
      return (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
            <Calendar className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {fecha.toLocaleDateString('es-ES')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.getValue('activo') as boolean;
      return (
        <Badge variant={activo ? 'default' : 'secondary'}>
          <div
            className={`w-2 h-2 rounded-full mr-1.5 ${activo ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'comunaEnvio',
    header: 'Comuna',
    cell: ({ row }) => {
      const comuna = row.getValue('comunaEnvio') as string;
      return (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
            <MapPin className="h-3 w-3 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[100px] truncate">
            {comuna}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'liberadoCorte',
    header: 'Liberado Corte',
    cell: ({ row }) => {
      const liberado = row.getValue('liberadoCorte') as boolean;
      return (
        <Badge variant={liberado ? 'default' : 'secondary'}>
          <Shield className="w-3 h-3 mr-1" />
          {liberado ? 'Liberado' : 'No Liberado'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const contract = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(contract)}>
              <FileText className="mr-2 h-4 w-4" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(contract)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(contract)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
