import { type CalculoPrefacturaCompleto } from '~/types/operaciones';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  FileText,
  Tag,
  User,
  CreditCard,
  Hash,
  MapPinned,
  Building,
  Package,
  Calendar,
  Gauge,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { Checkbox } from '~/components/ui/checkbox';

export const columns: ColumnDef<CalculoPrefacturaCompleto>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => row.toggleExpanded()}
          className="p-0 h-8 w-8 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          )}
        </Button>
      );
    },
    size: 50,
  },
  {
    id: 'facturar',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
          className="border-purple-300 data-[state=checked]:bg-purple-600"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="border-purple-300 data-[state=checked]:bg-purple-600"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center justify-center gap-2 font-semibold">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span>Sector</span>
      </div>
    ),
    accessorKey: 'sector',
    cell: ({ row }) => {
      const sector = row.getValue('sector') as string;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-mono"
          >
            {sector}
          </Badge>
        </div>
      );
    },
    size: 80,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <FileText className="w-4 h-4 text-purple-500" />
        <span>Contrato</span>
      </div>
    ),
    accessorKey: 'contratoId',
    cell: ({ row }) => {
      const contrato = row.getValue('contratoId') as string;
      return (
        <span className="font-mono text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded border border-purple-200 dark:border-purple-800">
          {contrato}
        </span>
      );
    },
    size: 100,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Tag className="w-4 h-4 text-emerald-500" />
        <span>Tarifa</span>
      </div>
    ),
    accessorKey: 'codigoTarifa',
    cell: ({ row }) => {
      const tarifa = row.getValue('codigoTarifa') as string;
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        >
          <Tag className="w-3 h-3 mr-1" />
          {tarifa}
        </Badge>
      );
    },
    size: 80,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <CreditCard className="w-4 h-4 text-slate-500" />
        <span>RUT Cliente</span>
      </div>
    ),
    accessorKey: 'rutCliente',
    cell: ({ row }) => {
      const rut = row.getValue('rutCliente') as string;
      return <span className="font-mono text-sm">{rut}</span>;
    },
    size: 120,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <User className="w-4 h-4 text-indigo-500" />
        <span>Nombre Cliente</span>
      </div>
    ),
    accessorKey: 'nombreCliente',
    cell: ({ row }) => {
      const nombre = row.getValue('nombreCliente') as string;
      return (
        <span
          className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-48"
          title={nombre}
        >
          {nombre}
        </span>
      );
    },
    size: 200,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Hash className="w-4 h-4 text-blue-500" />
        <span>Local</span>
      </div>
    ),
    accessorKey: 'localId',
    cell: ({ row }) => {
      const local = row.getValue('localId') as string;
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          {local}
        </Badge>
      );
    },
    size: 80,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <MapPinned className="w-4 h-4 text-orange-500" />
        <span>Dirección</span>
      </div>
    ),
    accessorKey: 'direccion',
    cell: ({ row }) => {
      const direccion = row.getValue('direccion') as string;
      return (
        <span
          className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-48"
          title={direccion}
        >
          {direccion}
        </span>
      );
    },
    size: 200,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Building className="w-4 h-4 text-green-500" />
        <span>Comuna</span>
      </div>
    ),
    accessorKey: 'comuna',
    cell: ({ row }) => {
      const comuna = row.getValue('comuna') as string;
      return (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {comuna}
        </span>
      );
    },
    size: 120,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Package className="w-4 h-4 text-gray-500" />
        <span>N° Serie</span>
      </div>
    ),
    accessorKey: 'numeroSerie',
    cell: ({ row }) => {
      const serie = row.getValue('numeroSerie') as string;
      return (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border">
          {serie}
        </span>
      );
    },
    size: 100,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Calendar className="w-4 h-4 text-amber-500" />
        <span>Fecha Lectura</span>
      </div>
    ),
    accessorKey: 'fechaLectura',
    cell: ({ row }) => {
      const fecha = row.getValue('fechaLectura') as string;
      return fecha ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {new Date(fecha).toLocaleDateString('es-CL')}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Sin fecha</span>
      );
    },
    size: 120,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Gauge className="w-4 h-4 text-teal-500" />
        <span>Consumo</span>
      </div>
    ),
    accessorKey: 'consumoPeriodo',
    cell: ({ row }) => {
      const consumo = row.getValue('consumoPeriodo') as number;
      return (
        <div className="text-right">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {consumo?.toLocaleString('es-CL') || '0'}
          </span>
          <span className="text-xs text-muted-foreground ml-1">m³</span>
        </div>
      );
    },
    size: 100,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Hash className="w-4 h-4 text-slate-500" />
        <span>Lectura ID</span>
      </div>
    ),
    accessorKey: 'lecturaId',
    cell: ({ row }) => {
      const lectura = row.getValue('lecturaId') as string;
      return (
        <span className="font-mono text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {lectura}
        </span>
      );
    },
    size: 90,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Receipt className="w-4 h-4 text-emerald-500" />
        <span>Total Facturado</span>
      </div>
    ),
    accessorKey: 'totalFacturado',
    cell: ({ row }) => {
      const total = row.getValue('totalFacturado') as number;
      return (
        <div className="text-right">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(total || 0)}
          </span>
        </div>
      );
    },
    size: 130,
  },
  {
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <DollarSign className="w-4 h-4 text-indigo-500" />
        <span>Total a Pagar</span>
      </div>
    ),
    accessorKey: 'totalAPagar',
    cell: ({ row }) => {
      const total = row.getValue('totalAPagar') as number;
      const totalFacturado = row.getValue('totalFacturado') as number;

      return (
        <div className="text-right">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(totalFacturado || 0)}
          </span>
        </div>
      );
    },
    size: 130,
  },
];
