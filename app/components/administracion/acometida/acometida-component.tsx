import type { PaginationState } from '@tanstack/react-table';
import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';

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
import { useExportAcometidas } from '~/hooks/administracion/use-export-acometidas';
import { administracionService } from '~/services/administracionService';
import type {
  AcometidaFormValues,
  AcometidaProps,
  AcometidaRow,
  BuscarContratosLibres,
  Empalmes,
  Nichos,
  Sectores
} from '~/types/administracion';
import { AcometidaForm } from './acometida-form';
import { columns } from './columns';

interface AcometidaComponentProps {
  acometidas: AcometidaRow[];
  comboEmpalmes: Empalmes[];
  comboNichos: Nichos[];
  comboSectores: Sectores[];
  contratosDisponibles: BuscarContratosLibres[];
}

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles
}: Readonly<AcometidaComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcometida, setSelectedAcometida] =
    useState<AcometidaRow | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [, setEditingAcometidaId] = useState<number | null>(null);

  // ─── Estado de paginación/búsqueda server-side de la tabla ─────────
  const DEFAULT_PAGE_SIZE = 10;
  const [tableData, setTableData] = useState<AcometidaRow[]>(acometidas);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  const searchFields = useMemo(
    () => [{ value: 'ubicacion', label: 'Ubicación' }],
    []
  );

  const revalidator = useRevalidator();
  const { acometidaColumns } = useExportAcometidas();

  const fetchAcometidasPage = useCallback(
    async ({
      pageIndex,
      pageSize,
      value
    }: {
      pageIndex: number;
      pageSize: number;
      value: string;
    }) => {
      const requestId = ++requestIdRef.current;
      setTableLoading(true);
      setTableError(null);
      const result = await administracionService.getAcometidaByLimitAndOffset(
        value.trim() || undefined,
        undefined,
        undefined,
        pageSize,
        pageIndex * pageSize
      );

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
    fetchAcometidasPage({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      value: ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTablePaginationChange = useCallback(
    (next: PaginationState) => {
      setTablePagination(next);
      fetchAcometidasPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        value: searchValue
      });
    },
    [fetchAcometidasPage, searchValue]
  );

  const handleTableSearchChange = useCallback(
    ({ value }: { value: string }) => {
      setSearchValue(value);
      const next: PaginationState = {
        pageIndex: 0,
        pageSize: tablePagination.pageSize
      };
      setTablePagination(next);
      fetchAcometidasPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        value
      });
    },
    [fetchAcometidasPage, tablePagination.pageSize]
  );

  const handleAddAcometida = () => {
    setSelectedAcometida(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditAcometida = async (acometida: AcometidaRow) => {
    setEditingAcometidaId(acometida.idAcometida);
    setSelectedAcometida(acometida);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedAcometida(null);
    setModalMode('add');
    setEditingAcometidaId(null);
    revalidator.revalidate();
    // Refetchear la página actual de la tabla server-side para reflejar
    // el cambio inmediatamente (crear/actualizar).
    fetchAcometidasPage({
      pageIndex: tablePagination.pageIndex,
      pageSize: tablePagination.pageSize,
      value: searchValue
    });
    toast.success(
      modalMode === 'add'
        ? 'Acometida creada exitosamente'
        : 'Acometida actualizada exitosamente'
    );
  };

  const handleSubmitForm = async (
    data: AcometidaProps | AcometidaFormValues
  ) => {
    try {
      if (modalMode === 'add') {
        await administracionService.createAcometida(data as AcometidaProps);
      } else {
        // En edición, el form ya envía el payload con idAcometida incluido
        // y los ids como string (AcometidaFormValues). No sobrescribimos campos.
        await administracionService.updateAcometida(
          data as AcometidaFormValues
        );
      }
      handleSuccess();
    } catch {
      toast.error('Ha ocurrido un error al guardar la acometida');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Acometidas"
            description="Gestiona las acometidas eléctricas del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={tableData}
                  columns={acometidaColumns}
                  filename="acometidas"
                  size="sm"
                />
                <Button
                  onClick={handleAddAcometida}
                  variant="default"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Acometida
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Acometidas
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {tableLoading
                      ? 'Cargando…'
                      : `${tableData.length} acometida${tableData.length !== 1 ? 's' : ''} en esta página`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable
                  columns={columns({
                    onEdit: handleEditAcometida
                  })}
                  data={tableData}
                  defaultPageSize={DEFAULT_PAGE_SIZE}
                  searchFields={searchFields}
                  manualPagination
                  manualFiltering
                  pageCount={-1}
                  onPaginationChange={handleTablePaginationChange}
                  onSearchChange={({ field: _field, value }) =>
                    handleTableSearchChange({ value })
                  }
                  isLoading={tableLoading}
                  hasMore={hasMore}
                  error={tableError}
                  onRetry={() =>
                    fetchAcometidasPage({
                      pageIndex: tablePagination.pageIndex,
                      pageSize: tablePagination.pageSize,
                      value: searchValue
                    })
                  }
                  emptyMessage={
                    searchValue.trim()
                      ? `Sin resultados para "${searchValue.trim()}"`
                      : 'No hay acometidas registradas en el sistema'
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal Form */}
        <AcometidaForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAcometidaId(null);
          }}
          onSubmit={handleSubmitForm}
          acometida={selectedAcometida}
          isLoading={false}
          comboEmpalmes={comboEmpalmes}
          comboNichos={comboNichos}
          contratosDisponibles={contratosDisponibles}
          comboSectores={comboSectores}
        />
      </div>
    </div>
  );
}
