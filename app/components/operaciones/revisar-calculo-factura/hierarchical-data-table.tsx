import {
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  type CalculoPrefacturaCompleto,
  type CalculoPrefacturaCargo,
} from "~/types/operaciones";

interface HierarchicalDataTableProps {
  columns: ColumnDef<CalculoPrefacturaCompleto>[];
  data: CalculoPrefacturaCompleto[];
  onSelectionChange?: (selectedContratos: CalculoPrefacturaCompleto[]) => void;
}

export function HierarchicalDataTable({
  columns,
  data,
  onSelectionChange,
}: HierarchicalDataTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      rowSelection,
    },
    onExpandedChange: setExpanded,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      // Notificar los contratos seleccionados al componente padre
      if (onSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => data[parseInt(key)])
          .filter(Boolean);
        onSelectionChange(selectedRows);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => (row.cargos ? [] : undefined), // Los cargos no tienen sub-filas
  });
  const renderCargoRow = (
    cargo: CalculoPrefacturaCargo,
    contratoIndex: number,
    cargoIndex: number
  ) => (
    <TableRow
      key={`${contratoIndex}-cargo-${cargoIndex}`}
      className="bg-sky-50/30 dark:bg-sky-900/10 border-l-4 border-l-sky-300 dark:border-l-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 transition-colors"
    >
      <TableCell></TableCell>

      {/* Sector - vacío para cargos */}
      <TableCell></TableCell>

      {/* Nombre cliente - vacío para cargos */}
      <TableCell></TableCell>

      {/* Local - vacío para cargos */}
      <TableCell></TableCell>

      {/* Dirección - vacío para cargos */}
      <TableCell></TableCell>

      {/* Comuna - vacío para cargos */}
      <TableCell></TableCell>

      {/* N° Serie - vacío para cargos */}
      <TableCell></TableCell>

      {/* Fecha Lectura - vacío para cargos */}
      <TableCell></TableCell>

      {/* Columnas vacías para alineación - expander y checkbox */}
      <TableCell className="pl-8">
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
            {cargoIndex === 0 ? "└─" : "├─"}
          </span>
          <div className="w-2 h-2 rounded-full bg-sky-400 dark:bg-sky-500" />
        </div>
      </TableCell>

      {/* Código del cargo */}
      <TableCell className="font-mono text-sm font-medium text-sky-700 dark:text-sky-300">
        {cargo.codigoEnerlova}
      </TableCell>

      {/* Descripción del cargo - ocupa las columnas de tarifa y rut */}
      <TableCell
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
        colSpan={2}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-600 dark:text-sky-400">•</span>
          <span>{cargo.descripcion}</span>
        </div>
      </TableCell>

      {/* Cantidad - alineada con la columna de consumo */}
      <TableCell className="text-sm text-right font-medium">
        <span className="text-slate-700 dark:text-slate-300">
          {cargo.cantidad?.toLocaleString("es-CL")}
        </span>
      </TableCell>

      {/* Unidad - alineada con la columna de lectura ID */}
      <TableCell className="text-sm text-center">
        <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          ud
        </span>
      </TableCell>

      {/* Precio Unitario - alineada con Total Facturado */}
      <TableCell className="text-sm text-right font-medium text-emerald-700 dark:text-emerald-300">
        {new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(cargo.precioUnitario || 0)}
      </TableCell>

      {/* Subtotal - alineada con Total a Pagar */}
      <TableCell className="text-sm text-right font-semibold text-sky-700 dark:text-sky-300">
        {new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(cargo.subtotal || 0)}
      </TableCell>
    </TableRow>
  );
  return (
    <div className="w-fit max-w-full mx-auto rounded-lg border border-border/60 shadow-sm overflow-x-auto">
      <Table className="w-auto min-w-full table-auto">
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-border/60"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-slate-700 dark:text-slate-300 py-3 px-3 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-border/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>{" "}
                {row.getIsExpanded() && row.original.cargos && (
                  <>
                    {/* Encabezado de cargos */}
                    <TableRow className="bg-sky-100/50 dark:bg-sky-900/20 border-l-4 border-l-sky-500 dark:border-l-sky-400">
                      <TableCell></TableCell>
                      {/* Sector - vacío */}
                      <TableCell></TableCell>
                      {/* Columnas vacías hasta llegar a las de datos numéricos */}
                      <TableCell></TableCell> {/* Nombre cliente */}
                      <TableCell></TableCell> {/* Local */}
                      <TableCell></TableCell> {/* Dirección */}
                      <TableCell></TableCell> {/* Comuna */}
                      <TableCell></TableCell> {/* N° Serie */}
                      <TableCell></TableCell> {/* Fecha Lectura */}
                      {/* Columnas vacías para alineación - expander y checkbox */}
                      <TableCell className="pl-8 font-semibold text-xs py-2">
                        <span className="text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                          DETALLE DE CARGOS
                        </span>
                      </TableCell>
                      {/* Código */}
                      <TableCell className="font-semibold text-xs text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                        Código
                      </TableCell>
                      {/* Descripción - ocupa tarifa y rut */}
                      <TableCell
                        className="font-semibold text-xs text-sky-700 dark:text-sky-300 uppercase tracking-wide"
                        colSpan={2}
                      >
                        Descripción del Cargo
                      </TableCell>
                      {/* Cantidad - alineada con consumo */}
                      <TableCell className="font-semibold text-xs text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide">
                        Cantidad
                      </TableCell>
                      {/* Unidad - alineada con lectura ID */}
                      <TableCell className="font-semibold text-xs text-sky-700 dark:text-sky-300 text-center uppercase tracking-wide">
                        Unidad
                      </TableCell>
                      {/* Precio Unit. - alineada con Total Facturado */}
                      <TableCell className="font-semibold text-xs text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide">
                        Precio Unit.
                      </TableCell>
                      {/* Subtotal - alineada con Total a Pagar */}
                      <TableCell className="font-semibold text-xs text-sky-700 dark:text-sky-300 text-right uppercase tracking-wide">
                        Subtotal
                      </TableCell>
                    </TableRow>
                    {/* Filas de cargos */}
                    {row.original.cargos.map((cargo, cargoIndex) =>
                      renderCargoRow(cargo, index, cargoIndex)
                    )}
                    {/* Separador después de los cargos */}
                    <TableRow className="h-2">
                      <TableCell
                        colSpan={columns.length}
                        className="p-0 bg-slate-50/30 dark:bg-slate-900/30 border-b-2 border-border/60"
                      ></TableCell>
                    </TableRow>
                  </>
                )}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="font-medium">No se encontraron resultados</p>
                  <p className="text-sm">
                    Ajusta los filtros de búsqueda para ver datos
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
