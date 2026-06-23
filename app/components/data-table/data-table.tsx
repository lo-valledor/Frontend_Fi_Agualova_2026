import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { AlertCircle, Loader2, Search, X } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";

export interface SearchFieldOption {
  /** Key que se envía al backend (ej: "nombreCliente") */
  value: string;
  /** Etiqueta visible para el usuario (ej: "Nombre del cliente") */
  label: string;
}

export interface SearchChangePayload {
  field: string;
  value: string;
}

interface DataTableAdvancedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // ─── Search ───────────────────────────────────────────────────────────
  searchPlaceholder?: string;
  showSearch?: boolean;
  manualFiltering?: boolean;
  searchDebounceMs?: number;
  /**
   * Si se provee, se muestra un `<Select>` junto al input para que el
   * usuario elija por qué campo buscar. Cuando no se provee, el search
   * es de campo único (el padre recibe `field: ""`).
   */
  searchFields?: SearchFieldOption[];
  onSearchChange?: (payload: SearchChangePayload) => void;

  // ─── Pagination ───────────────────────────────────────────────────────
  manualPagination?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  defaultPageSize?: number;
  pageSizeOptions?: number[];

  // ─── States (server-side mode) ────────────────────────────────────────
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  totalRows?: number;

  // ─── Misc ─────────────────────────────────────────────────────────────
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  rowIdKey?: keyof TData;
  initialSorting?: SortingState;
  meta?: any;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,

  searchPlaceholder = "Buscar...",
  showSearch = true,
  manualFiltering = false,
  searchDebounceMs = 300,
  searchFields,
  onSearchChange,

  manualPagination = false,
  pageCount,
  onPaginationChange,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],

  isLoading = false,
  error = null,
  onRetry,
  hasMore = true,
  totalRows,

  onRowSelectionChange,
  rowIdKey,
  initialSorting = [],
  meta,
  emptyMessage = "No se encontraron resultados.",
}: DataTableAdvancedProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [searchField, setSearchField] = useState<string>(
    searchFields?.[0]?.value ?? "",
  );

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFieldLabel = useMemo(
    () => searchFields?.find(f => f.value === searchField)?.label,
    [searchFields, searchField],
  );

  const resolvedPlaceholder = currentFieldLabel
    ? `Buscar por ${currentFieldLabel.toLowerCase()}...`
    : searchPlaceholder;

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const next =
      typeof updater === "function" ? updater(pagination) : updater;
    setPagination(next);
    onPaginationChange?.(next);
  };

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);

    if (!manualFiltering) return;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      onSearchChange?.({ field: searchField, value });
    }, searchDebounceMs);
  };

  const clearSearch = () => {
    setGlobalFilter("");
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    if (manualFiltering) {
      onSearchChange?.({ field: searchField, value: "" });
    }
  };

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const table = useReactTable({
    data,
    columns,
    meta,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    manualPagination,
    manualFiltering,
    pageCount: manualPagination ? pageCount : undefined,
    enableRowSelection: true,
    getRowId: rowIdKey ? (row) => String(row[rowIdKey]) : undefined,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onRowSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => {
            if (rowIdKey) {
              return data.find((row) => String(row[rowIdKey]) === key) as TData;
            }
            return data[parseInt(key)] as TData;
          })
          .filter(Boolean);
        onRowSelectionChange(selectedRows);
      }
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const resolvedTotalRows =
    totalRows ??
    (manualPagination && pageCount !== undefined
      ? pageCount * pagination.pageSize
      : manualPagination
        ? undefined
        : table.getFilteredRowModel().rows.length);

  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;
  const hasActiveSearch = globalFilter.trim().length > 0;

  // ─── Render del cuerpo de la tabla según estado ─────────────────────
  const renderBody = () => {
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-32 text-center">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm font-medium">{error}</p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Reintentar
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (isLoading && !hasRows) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-32 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Cargando resultados…</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!hasRows) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-32 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <p className="text-sm">{emptyMessage}</p>
              {hasActiveSearch && (
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  <X className="mr-1 h-3 w-3" />
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row) => (
      <TableRow
        key={row.id}
        className="border-b hover:bg-muted"
        data-state={row.getIsSelected() && "selected"}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="h-10 px-3 py-1 text-sm">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/30 px-3 py-2.5 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={resolvedPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) =>
                handleGlobalFilterChange(event.target.value)
              }
              className="h-9 pl-9 pr-9 text-sm bg-white dark:bg-slate-950"
            />
            {hasActiveSearch && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isLoading && (
              <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {searchFields && searchFields.length > 0 && (
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="h-9 w-full text-sm sm:w-56">
                <SelectValue placeholder="Buscar en…" />
              </SelectTrigger>
              <SelectContent>
                {searchFields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto max-h-150">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-3 text-xs font-medium bg-background"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{renderBody()}</TableBody>
          </table>
        </div>
      </div>

      <DataTablePagination
        table={table}
        totalRows={resolvedTotalRows}
        hasMore={hasMore}
        isLoading={isLoading}
      />
    </div>
  );
}
