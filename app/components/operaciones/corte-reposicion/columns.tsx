import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '~/components/data-table/data-table-column-header';
import type { ConsultarMantenedorRevisionCorte } from '~/types/operaciones';
import {
  Hash,
  Code,
  Package,
  CreditCard,
  User,
  MapPin,
  Building,
  Activity,
  FileText,
  DollarSign,
} from 'lucide-react';

export const columns: ColumnDef<ConsultarMantenedorRevisionCorte>[] = [
  {
    accessorKey: 'ctId',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-slate-600" />
            <span>ID</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'seCodigo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5 text-blue-600" />
            <span>Código</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'meNSerie',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-purple-600" />
            <span>N° Serie</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'clRut',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-slate-600" />
            <span>RUT</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'clRazonSocialCompleto',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-indigo-600" />
            <span>Razón Social</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'niDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-orange-600" />
            <span>Descripción</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'secDescripcion',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-green-600" />
            <span>Sección</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'reEstado',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-rose-600" />
            <span>Estado</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'reCantDocumentos',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-teal-600" />
            <span>Cantidad de Documentos</span>
          </div>
        }
      />
    ),
  },
  {
    accessorKey: 'reDeudaTotal',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deuda Total</span>
          </div>
        }
      />
    ),
  },
  {
    header: 'Acciones',
    cell: () => {
      // const periodo = row.original;
      return (
        <div className="flex gap-2">
          {/* {periodo.epf_descripcion === "Abierto" ? (
            <CerrarPeriodo periodoId={periodo.pf_id} />
          ) : (
            <ConfirmarReapertura periodoId={periodo.pf_id} clave={30} />
          )} */}
        </div>
      );
    },
  },
];
