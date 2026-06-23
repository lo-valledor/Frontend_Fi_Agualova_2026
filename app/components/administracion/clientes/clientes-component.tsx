import { LayoutList, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { DataTable } from "~/components/data-table/data-table";
import { ExportButton } from "~/components/shared/export-button";
import { ModernHeader } from "~/components/shared/modern-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useExportClientes } from "~/hooks/administracion/use-export-clientes";
import { useClientes } from "~/hooks/use-administracion";
import { administracionService } from "~/services/administracionService";
import type {
  Cliente,
  ClientesRow,
  NombreComuna,
  NombreGiro,
} from "~/types/administracion";
import {
  CLIENTES_CREAR_ROUTE,
  createInitialClienteModalState,
  createInitialLoadingState,
  extractClienteErrorMessage,
  getClienteEditUrl,
  isValidDetailedCliente,
  normalizeClienteDetallado,
} from "~/utils/administracion";
import { columns } from "./columns";
import { ClienteDetailsModal } from "./detalles-cliente";

interface ClientesComponentProps {
  readonly clientes: ClientesRow[];
  readonly giros: NombreGiro[];
  readonly comunas: NombreComuna[];
}

export default function ClientesComponent({
  clientes,
}: ClientesComponentProps) {
  // Estado de datos
  const [detailedCliente, setDetailedCliente] = useState<Cliente | null>(null);

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState(
    createInitialClienteModalState(),
  );

  // Estado de carga (para modales, no la tabla)
  const [_loadingState, setLoadingState] = useState(
    createInitialLoadingState(),
  );

  // ─── Estado de paginación/búsqueda server-side de la tabla ─────────
  const DEFAULT_PAGE_SIZE = 10;
  const [tableData, setTableData] = useState<ClientesRow[]>(clientes);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("nombreCliente");
  const [searchValue, setSearchValue] = useState("");
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  const searchFields = useMemo(
    () => [{ value: "nombreCliente", label: "Nombre del cliente" }],
    [],
  );

  // Dependencias
  const navigate = useNavigate();
  const { getClienteByRut } = useClientes();

  const { clientColumns } = useExportClientes();

  const fetchClientesPage = useCallback(
    async ({
      pageIndex,
      pageSize,
      field,
      value,
    }: {
      pageIndex: number;
      pageSize: number;
      field: string;
      value: string;
    }) => {
      const requestId = ++requestIdRef.current;
      setTableLoading(true);
      setTableError(null);
      const result = await administracionService.getClientesByLimitAndOffset({
        limit: pageSize,
        offset: pageIndex * pageSize,
        ...(value.trim() ? { [field]: value.trim() } : {}),
      });

      if (requestId !== requestIdRef.current) return;

      if (result.error || !result.data) {
        setTableData([]);
        setHasMore(false);
        setTableError(result.error ?? "Error desconocido");
      } else {
        setTableData(result.data);
        setHasMore(result.data.length >= pageSize);
      }
      setTableLoading(false);
    },
    [],
  );

  useEffect(() => {
    fetchClientesPage({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      field: searchField,
      value: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTablePaginationChange = useCallback(
    (next: PaginationState) => {
      setTablePagination(next);
      fetchClientesPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        field: searchField,
        value: searchValue,
      });
    },
    [fetchClientesPage, searchField, searchValue],
  );

  const handleTableSearchChange = useCallback(
    ({ field, value }: { field: string; value: string }) => {
      setSearchField(field);
      setSearchValue(value);
      const next: PaginationState = {
        pageIndex: 0,
        pageSize: tablePagination.pageSize,
      };
      setTablePagination(next);
      fetchClientesPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        field,
        value,
      });
    },
    [fetchClientesPage, tablePagination.pageSize],
  );

  const handleAddCliente = useCallback(() => {
    navigate(CLIENTES_CREAR_ROUTE);
  }, [navigate]);

  const handleEditCliente = useCallback(
    (cliente: ClientesRow) => {
      navigate(getClienteEditUrl(cliente.rut));
    },
    [navigate],
  );

  const handleDetailsCliente = useCallback(
    async (cliente: ClientesRow) => {
      // Early return: validar cliente
      if (!cliente?.rut) {
        toast.error("Cliente inválido");
        return;
      }

      setLoadingState((prev) => ({ ...prev, isLoading: true }));

      try {
        const clienteDetallado = await getClienteByRut(cliente.rut);
        if (!isValidDetailedCliente(clienteDetallado)) {
          toast.error("Los detalles del cliente no son válidos");
          return;
        }

        const clienteNormalizado = normalizeClienteDetallado(clienteDetallado);
        setDetailedCliente(clienteNormalizado);
        setModalsState((prev) => ({
          ...prev,
          details: { isOpen: true },
        }));
      } catch (error) {
        const errorInfo = extractClienteErrorMessage(
          error,
          "Error al cargar los detalles del cliente",
        );
        toast.error(errorInfo.message);
      } finally {
        setLoadingState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [getClienteByRut],
  );

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Clientes"
            description="Gestiona los clientes del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={tableData}
                  columns={clientColumns}
                  filename="clientes"
                  size="sm"
                />
                <Button onClick={handleAddCliente} variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Cliente
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Clientes
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {tableLoading
                      ? "Cargando…"
                      : `${tableData.length} cliente${tableData.length !== 1 ? "s" : ""} en esta página`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable
                  columns={columns({
                    onEdit: handleEditCliente,
                    onDetails: handleDetailsCliente,
                    editingClienteRut: null,
                    detailingClienteRut: null,
                  })}
                  data={tableData}
                  defaultPageSize={DEFAULT_PAGE_SIZE}
                  searchFields={searchFields}
                  manualPagination
                  manualFiltering
                  pageCount={-1}
                  onPaginationChange={handleTablePaginationChange}
                  onSearchChange={handleTableSearchChange}
                  isLoading={tableLoading}
                  hasMore={hasMore}
                  error={tableError}
                  onRetry={() =>
                    fetchClientesPage({
                      pageIndex: tablePagination.pageIndex,
                      pageSize: tablePagination.pageSize,
                      field: searchField,
                      value: searchValue,
                    })
                  }
                  emptyMessage={
                    searchValue.trim()
                      ? `Sin resultados para "${searchValue.trim()}"`
                      : "No hay clientes registrados en el sistema"
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de detalles de cliente */}
        <ClienteDetailsModal
          isOpen={modalsState.details.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              details: { isOpen: false },
            }))
          }
          cliente={detailedCliente}
        />
      </div>
    </div>
  );
}
