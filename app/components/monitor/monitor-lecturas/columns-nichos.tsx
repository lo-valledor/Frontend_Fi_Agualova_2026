import type { ColumnDef } from '@tanstack/react-table';
import type { MedidorNichoItem } from '~/types/monitor';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import { PencilIcon, RotateCcw, Check, CreditCard } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogTrigger } from '~/components/ui/dialog';

// Tipo para las props que se pasan a la función de columnas
interface ColumnsProps {
  handleOpenDialog: (id: number, isOpen: boolean) => void;
  openDialogs: Record<number, boolean>;
  lastEditedId: number | null;
  handleSuccess: (id: number) => void;
}

export const columnsNichos = ({
  handleOpenDialog,
  openDialogs,
  lastEditedId,
  handleSuccess,
}: ColumnsProps): ColumnDef<MedidorNichoItem>[] => [
  {
    id: 'numero',
    accessorKey: 'Nro',
    header: '#',
    cell: ({ row }) => (
      <div className="font-semibold text-xs text-slate-700 dark:text-slate-300">
        {row.getValue('numero')}
      </div>
    ),
    meta: {
      className:
        'sticky left-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm min-w-[50px]',
    },
  },
  {
    id: 'local',
    accessorKey: 'local',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Local" />
    ),
    cell: ({ row }) => (
      <div
        className="font-medium text-xs text-left text-slate-600 dark:text-slate-400 truncate max-w-[100px]"
        title={row.getValue('local')}
      >
        {row.getValue('local')}
      </div>
    ),
    meta: {
      className: 'bg-zinc-50/70 dark:bg-zinc-900/40 min-w-[100px]',
    },
  },
  {
    id: 'tarifa',
    accessorKey: 'tarifa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarifa" />
    ),
    cell: ({ row }) => (
      <div className="text-left text-xs">
        <Badge variant="outline" className="font-medium py-0 px-1.5 h-5">
          {row.getValue('tarifa')}
        </Badge>
      </div>
    ),
    meta: {
      className: 'bg-zinc-50/70 dark:bg-zinc-900/40 min-w-[70px]',
    },
  },
  {
    id: 'numero_serie',
    accessorKey: 'ME_NSerie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-xs text-left text-slate-700 dark:text-slate-300">
        {row.getValue('numero_serie')}
      </div>
    ),
    meta: {
      className: 'bg-zinc-50/70 dark:bg-zinc-900/40 min-w-[85px]',
    },
  },
  {
    id: 'constante',
    accessorKey: 'ME_ConstanteMultiplicar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Const" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-xs text-left">
        {row.getValue('constante')}
      </div>
    ),
    meta: {
      className: 'bg-zinc-50/70 dark:bg-zinc-900/40 min-w-[60px]',
    },
  },
  {
    id: 'anio_anterior',
    accessorKey: 'LM_ConsumoAñoAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Año" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('anio_anterior') as number;
      return (
        <div className="font-medium text-xs text-left">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-slate-50/70 dark:bg-slate-900/40 min-w-[70px]',
    },
  },
  {
    id: 'mes_anterior',
    accessorKey: 'LM_ConsumoMesAnterior',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mes" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('mes_anterior') as number;
      return (
        <div className="font-medium text-xs text-left">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-slate-50/70 dark:bg-slate-900/40 min-w-[70px]',
    },
  },
  {
    id: 'energia_activa_anterior',
    accessorKey: 'LM_ValorUltimaLectura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ant" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('energia_activa_anterior') as number;
      return (
        <div className="font-medium text-xs text-left text-red-700 dark:text-red-400">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-red-50/70 dark:bg-red-900/20 min-w-[75px]',
    },
  },
  {
    id: 'energia_activa',
    accessorKey: 'LMC_EnergiaActiva',
    header: ({ column }) => <DataTableColumnHeader column={column} title="8" />,
    cell: ({ row }) => {
      const value = row.getValue('energia_activa') as number;
      return (
        <div className="font-semibold text-xs text-left text-red-800 dark:text-red-300">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-red-50/70 dark:bg-red-900/20 min-w-[75px]',
    },
  },
  {
    id: 'consumo_energia_activa',
    accessorKey: 'LMC_ConsumoEnergiaActiva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="C8" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('consumo_energia_activa') as number;
      return (
        <div className="font-bold text-xs text-left text-red-900 dark:text-red-200 bg-red-100/60 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-red-50/70 dark:bg-red-900/20 min-w-[75px]',
    },
  },
  {
    id: 'energia_reactiva_anterior',
    accessorKey: 'LMC_ValorUltimaLectEnergiaReactiva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ant" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('energia_reactiva_anterior') as number;
      return (
        <div className="font-medium text-xs text-left text-green-700 dark:text-green-400">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-green-50/70 dark:bg-green-900/20 min-w-[75px]',
    },
  },
  {
    id: 'energia_reactiva',
    accessorKey: 'LMC_EnergiaReactiva',
    header: ({ column }) => <DataTableColumnHeader column={column} title="9" />,
    cell: ({ row }) => {
      const value = row.getValue('energia_reactiva') as number;
      return (
        <div className="font-semibold text-xs text-left text-green-800 dark:text-green-300">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-green-50/70 dark:bg-green-900/20 min-w-[75px]',
    },
  },
  {
    id: 'consumo_energia_reactiva',
    accessorKey: 'LMC_ConsumoEnergiaReactiva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="C9" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('consumo_energia_reactiva') as number;
      return (
        <div className="font-bold text-xs text-left text-green-900 dark:text-green-200 bg-green-100/60 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-green-50/70 dark:bg-green-900/20 min-w-[75px]',
    },
  },
  {
    id: 'demanda_punta',
    accessorKey: 'LMC_DemandaPunta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DP" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('demanda_punta') as number;
      return (
        <div className="font-bold text-xs text-left text-orange-900 dark:text-orange-200 bg-orange-100/60 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-orange-50/70 dark:bg-orange-900/20 min-w-[65px]',
    },
  },
  {
    id: 'fecha_demanda_punta',
    accessorKey: 'LMC_FechaDemandaPunta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('fecha_demanda_punta') as string;
      return (
        <div
          className="text-xs text-left text-orange-700 dark:text-orange-400"
          title={value}
        >
          {value ? value.split(' ')[0] : 'N/A'}
        </div>
      );
    },
    meta: {
      className: 'bg-orange-50/70 dark:bg-orange-900/20 min-w-[75px]',
    },
  },
  {
    id: 'hora_demanda_punta',
    accessorKey: 'LMC_HoraDemandaPunta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('hora_demanda_punta') as string;
      return (
        <div className="text-xs text-left text-orange-700 dark:text-orange-400 font-mono">
          {value || 'N/A'}
        </div>
      );
    },
    meta: {
      className: 'bg-orange-50/70 dark:bg-orange-900/20 min-w-[65px]',
    },
  },
  {
    id: 'demanda_suministrada',
    accessorKey: 'LMC_DemandaSuministrada',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DS" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('demanda_suministrada') as number;
      return (
        <div className="font-bold text-xs text-left text-blue-900 dark:text-blue-200 bg-blue-100/60 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
          {value?.toLocaleString() || '0'}
        </div>
      );
    },
    meta: {
      className: 'bg-blue-50/70 dark:bg-blue-900/20 min-w-[65px]',
    },
  },
  {
    id: 'fecha_demanda_suministrada',
    accessorKey: 'LMC_FechaDemandaSuminis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('fecha_demanda_suministrada') as string;
      return (
        <div
          className="text-xs text-left text-blue-700 dark:text-blue-400"
          title={value}
        >
          {value ? value.split(' ')[0] : 'N/A'}
        </div>
      );
    },
    meta: {
      className: 'bg-blue-50/70 dark:bg-blue-900/20 min-w-[75px]',
    },
  },
  {
    id: 'hora_demanda_suministrada',
    accessorKey: 'LMC_HoraDemandaSuminis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('hora_demanda_suministrada') as string;
      return (
        <div className="text-xs text-left text-blue-700 dark:text-blue-400 font-mono">
          {value || 'N/A'}
        </div>
      );
    },
    meta: {
      className: 'bg-blue-50/70 dark:bg-blue-900/20 min-w-[65px]',
    },
  },
  {
    id: 'acciones',
    cell: ({ row }) => {
      const result = row.original;
      return (
        <div className="sticky right-0 z-10 flex justify-center items-center min-w-[120px]">
          {result.Estado === 5 ? (
            <Badge className="bg-purple-100/90 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 font-medium text-xs py-0 px-2 h-6">
              <CreditCard className="mr-1 h-3 w-3" />
              Facturación
            </Badge>
          ) : lastEditedId === result.LM_ID ? (
            <Badge className="bg-green-100/90 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 animate-pulse font-medium text-xs py-0 px-2 h-6">
              <Check className="mr-1 h-3 w-3" />
              Actualizado
            </Badge>
          ) : result.Estado === 4 ? (
            <Dialog
              open={openDialogs[result.LM_ID]}
              onOpenChange={(isOpen) => handleOpenDialog(result.LM_ID, isOpen)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 h-6 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reabrir
                </Button>
              </DialogTrigger>
            </Dialog>
          ) : (
            <Dialog
              open={openDialogs[result.LM_ID]}
              onOpenChange={(isOpen) => handleOpenDialog(result.LM_ID, isOpen)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all duration-200 p-0"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Editar medidor</span>
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      );
    },
    header: 'Acción',
    meta: {
      className:
        'sticky right-0 z-20 bg-purple-50/90 dark:bg-purple-900/30 backdrop-blur-sm min-w-[120px]',
    },
  },
];

// Grupos de columnas para el encabezado agrupado con mejores estilos
export const columnGroups = [
  {
    id: 'medidor',
    title: 'Medidor',
    columns: ['numero', 'local', 'tarifa', 'numero_serie', 'constante'],
    className:
      'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white font-semibold shadow-sm',
  },
  {
    id: 'consumo_anterior',
    title: 'Consumo Anterior',
    columns: ['anio_anterior', 'mes_anterior'],
    className:
      'bg-gradient-to-r from-sky-700 to-sky-600 text-white font-semibold shadow-sm',
  },
  {
    id: 'energia_activa',
    title: 'Energía Activa (kWh)',
    columns: [
      'energia_activa_anterior',
      'energia_activa',
      'consumo_energia_activa',
    ],
    className:
      'bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold shadow-sm',
  },
  {
    id: 'energia_reactiva',
    title: 'Energía Reactiva (kVArh)',
    columns: [
      'energia_reactiva_anterior',
      'energia_reactiva',
      'consumo_energia_reactiva',
    ],
    className:
      'bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold shadow-sm',
  },
  {
    id: 'demanda_punta',
    title: 'Demanda Punta 6.1 (kW)',
    columns: ['demanda_punta', 'fecha_demanda_punta', 'hora_demanda_punta'],
    className:
      'bg-gradient-to-r from-orange-700 to-orange-600 text-white font-semibold shadow-sm',
  },
  {
    id: 'demanda_suministrada',
    title: 'Demanda Suministrada 6.2 (kW)',
    columns: [
      'demanda_suministrada',
      'fecha_demanda_suministrada',
      'hora_demanda_suministrada',
    ],
    className:
      'bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold shadow-sm',
  },
  {
    id: 'acciones',
    title: 'Acción',
    columns: ['acciones'],
    className:
      'bg-gradient-to-r from-purple-700 to-purple-600 text-white font-semibold shadow-sm sticky right-0 z-20',
  },
];
