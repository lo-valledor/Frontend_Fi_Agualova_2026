import type { PaginationState } from '@tanstack/react-table';
import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type {
  MedidorListItem,
  MedidorModalState
} from '~/components/administracion/medidores/medidores-types';
import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { useExportMedidores } from '~/hooks/administracion/use-export-medidores';
import { administracionService } from '~/services/administracionService';
import {
  createInitialMedidorModalState,
  extractMedidorErrorMessage,
  getMedidorEditUrl,
  isValidMedidorForOperation,
  MEDIDORES_CREAR_ROUTE
} from '~/utils/administracion';

import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';

interface MedidoresComponentProps {
  readonly medidores: MedidorListItem[];
}

export default function MedidoresComponent({
  medidores: initialMedidores
}: MedidoresComponentProps) {
  const [selectedMedidor, setSelectedMedidor] =
    useState<MedidorListItem | null>(null);
  const [modalsState, setModalsState] = useState<MedidorModalState>(
    createInitialMedidorModalState()
  );
  // ─── Estado de paginación/búsqueda server-side de la tabla ─────────
  const DEFAULT_PAGE_SIZE = 10;
  const [tableData, setTableData] =
    useState<MedidorListItem[]>(initialMedidores);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState('modelo');
  const [searchValue, setSearchValue] = useState('');
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  const searchFields = useMemo(
    () => [
      { value: 'modelo', label: 'Modelo' },
      { value: 'serie', label: 'Serie' }
    ],
    []
  );

  const { medidorColumns } = useExportMedidores();
  const navigate = useNavigate();

  const fetchMedidoresPage = useCallback(
    async ({
      pageIndex,
      pageSize,
      field,
      value
    }: {
      pageIndex: number;
      pageSize: number;
      field: string;
      value: string;
    }) => {
      const requestId = ++requestIdRef.current;
      setTableLoading(true);
      setTableError(null);
      const result = await administracionService.getMedidoresByLimitAndOffset({
        limit: pageSize,
        offset: pageIndex * pageSize,
        ...(value.trim() ? { [field]: value.trim() } : {})
      });

      if (requestId !== requestIdRef.current) return;

      if (result.error || !result.data) {
        setTableData([]);
        setHasMore(false);
        setTableError(result.error ?? 'Error desconocido');
      } else {
        setTableData(result.data);
        setHasMore(result.data.length >= pageSize);
      }
      setTableLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchMedidoresPage({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      field: searchField,
      value: ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTablePaginationChange = useCallback(
    (next: PaginationState) => {
      setTablePagination(next);
      fetchMedidoresPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        field: searchField,
        value: searchValue
      });
    },
    [fetchMedidoresPage, searchField, searchValue]
  );

  const handleTableSearchChange = useCallback(
    ({ field, value }: { field: string; value: string }) => {
      setSearchField(field);
      setSearchValue(value);
      const next: PaginationState = {
        pageIndex: 0,
        pageSize: tablePagination.pageSize
      };
      setTablePagination(next);
      fetchMedidoresPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        field,
        value
      });
    },
    [fetchMedidoresPage, tablePagination.pageSize]
  );

  const refetchMedidores = useCallback(async () => {
    await fetchMedidoresPage({
      pageIndex: tablePagination.pageIndex,
      pageSize: tablePagination.pageSize,
      field: searchField,
      value: searchValue
    });
  }, [
    fetchMedidoresPage,
    tablePagination.pageIndex,
    tablePagination.pageSize,
    searchField,
    searchValue
  ]);

  const handleAdd = useCallback(() => {
    navigate(MEDIDORES_CREAR_ROUTE);
  }, [navigate]);

  const handleEdit = useCallback(
    (medidor: MedidorListItem) => {
      navigate(getMedidorEditUrl(medidor.idMedidor));
    },
    [navigate]
  );

  const handleDeleteMedidor = useCallback((medidor: MedidorListItem) => {
    setSelectedMedidor(medidor);
    setModalsState(prev => ({
      ...prev,
      delete: { isOpen: true }
    }));
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!isValidMedidorForOperation(selectedMedidor)) {
      setModalsState(prev => ({
        ...prev,
        delete: { isOpen: false }
      }));
      return;
    }

    try {
      await fetch(`/MedidorEliminar/${selectedMedidor.idMedidor}`, {
        method: 'DELETE'
      });
      toast.success('Medidor eliminado exitosamente');
      await refetchMedidores();
      setSelectedMedidor(null);
    } catch (error) {
      const errorInfo = extractMedidorErrorMessage(
        error,
        'Error al eliminar el medidor'
      );
      toast.error(errorInfo.message);
    } finally {
      setModalsState(prev => ({
        ...prev,
        delete: { isOpen: false }
      }));
    }
  }, [selectedMedidor, refetchMedidores]);

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Medidores"
            description="Gestiona los medidores del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={tableData}
                  columns={medidorColumns}
                  filename="medidores"
                  size="sm"
                />
                <Button onClick={handleAdd} variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Medidor
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
                    Listado de Medidores
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {tableLoading
                      ? 'Cargando…'
                      : `${tableData.length} medidor${tableData.length !== 1 ? 'es' : ''} en esta página`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable
                  columns={columns({
                    onEdit: handleEdit,
                    onDelete: handleDeleteMedidor
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
                  onRetry={refetchMedidores}
                  emptyMessage={
                    searchValue.trim()
                      ? `Sin resultados para "${searchValue.trim()}"`
                      : 'No hay medidores registrados en el sistema'
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <DeleteConfirmationDialog
          isOpen={modalsState.delete.isOpen}
          onClose={() =>
            setModalsState(prev => ({
              ...prev,
              delete: { isOpen: false }
            }))
          }
          onConfirm={handleConfirmDelete}
          medidor={selectedMedidor}
        />
      </div>
    </div>
  );
}
