'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  IdCard,
  UserCheck,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import type { GetClientes } from '~/types/administracion';

interface TableColumnsProps {
  onViewDetails: (client: GetClientes) => void;
  onEdit: (client: GetClientes) => void;
  onDelete: (client: GetClientes) => void;
}

export const columns = ({
  onViewDetails,
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnDef<GetClientes>[] => [
  {
    accessorKey: 'rut',
    header: 'Cliente',
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              {cliente.esEmpresa ? (
                <Building className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {cliente.nombreCompleto}
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <IdCard className="w-3 h-3" />
              <span className="font-mono">{cliente.rut}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'esEmpresa',
    header: 'Tipo',
    cell: ({ row }) => {
      const esEmpresa = row.getValue('esEmpresa') as boolean;
      return (
        <Badge
          className={
            esEmpresa
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }
        >
          {esEmpresa ? (
            <>
              <Building className="w-3 h-3 mr-1" />
              Empresa
            </>
          ) : (
            <>
              <User className="w-3 h-3 mr-1" />
              Persona Natural
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'direccion',
    header: 'Dirección',
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <div className="flex items-start space-x-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md mt-0.5">
            <MapPin className="h-3 w-3 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="max-w-[200px]">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {cliente.direccion}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {cliente.comuna}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'contacto',
    header: 'Contacto',
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <div className="space-y-1">
          {cliente.contacto && (
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <UserCheck className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                {cliente.contacto}
              </span>
            </div>
          )}
          {cliente.telefono && (
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-teal-100 dark:bg-teal-900/30 rounded">
                <Phone className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {cliente.telefono}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      if (!email) {
        return (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
            No disponible
          </span>
        );
      }
      return (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
            <Mail className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
            {email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'codigoComuna',
    header: 'Código Comuna',
    cell: ({ row }) => {
      const codigoComuna = row.getValue('codigoComuna') as string;
      return (
        <div className="flex items-center justify-center">
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-mono text-xs"
          >
            {codigoComuna}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const client = row.original;

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
            <DropdownMenuItem onClick={() => onViewDetails(client)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(client)}
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
