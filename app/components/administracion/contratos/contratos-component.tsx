import type { PaginationState } from '@tanstack/react-table';
import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { administracionService } from '~/services/administracionService';
import type { ContratoModalState, ContratosRow } from '~/types/administracion';
import {
  createInitialContratoModalState,
  getContratoCreateUrl,
  getContratoEditUrl,
  isValidContratoForOperation
} from '~/utils/administracion';
import { columns } from './columns';
import { ContractDetailsModal } from './contract-details-modal';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { ExportButtons } from './export-buttons';

export default function ContratosComponent({
  contratos
}: {
  readonly contratos: ContratosRow[];
}) {
  // Estado de datos
  const [contracts, setContracts] = useState<ContratosRow[]>(contratos);
  const [selectedContract, setSelectedContract] = useState<ContratosRow | null>(
    null
  );

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState<ContratoModalState>(
    createInitialContratoModalState()
  );
  // Estado de paginación/búsqueda server-side de la tabla
  const DEFAULT_PAGE_SIZE = 10;
  const [tableData, setTableData] = useState<ContratosRow[]>(contratos);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });
  // Campo de búsqueda actual + valor tipeado. El campo determina a qué
  // query param del backend se mapea el valor.
  const [searchField, setSearchField] = useState('nombreCliente');
  const [searchValue, setSearchValue] = useState('');
  // El backend no devuelve total, así que usamos heurística: si una página
  // trae menos filas que pageSize, sabemos que es la última. Si trae la
  // cantidad completa, asumimos que puede haber más (hasMore=true).
  const [hasMore, setHasMore] = useState(true);
  // Evita condiciones de carrera si el usuario pagina/ busca muy rápido
  const requestIdRef = useRef(0);

  const searchFields = useMemo(
    () => [
      { value: 'nombreCliente', label: 'Nombre del cliente' },
      { value: 'rutCliente', label: 'RUT del cliente' },
      { value: 'nombrePropietario', label: 'Nombre del propietario' },
      { value: 'rutPropietario', label: 'RUT del propietario' },
      { value: 'numeroLocal', label: 'Número de local' },
      { value: 'numeroContrato', label: 'Número de contrato' }
    ],
    []
  );

  // Dependencias
  const navigate = useNavigate();

  const fetchContratosPage = useCallback(
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
      const result = await administracionService.getContratosByLimitAndOffset({
        Limit: pageSize,
        Offset: pageIndex * pageSize,
        ...(value.trim() ? { [field]: value.trim() } : {})
      });

      // Si el usuario ya disparó otra request, descartar este resultado
      if (requestId !== requestIdRef.current) return;

      if (result.error || !result.data) {
        setTableData([]);
        setHasMore(false);
        setTableError(result.error ?? 'Error desconocido');
      } else {
        setTableData(result.data);
        // Heurística: si la respuesta trae menos filas que pageSize, es la
        // última página. Si trae la cantidad completa, asumimos que hay más.
        setHasMore(result.data.length >= pageSize);
      }
      setTableLoading(false);
    },
    []
  );

  // Carga inicial: reemplaza los datos del prop por la primera página del server
  useEffect(() => {
    fetchContratosPage({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      field: searchField,
      value: ''
    });
    // Sólo al montar — el efecto siguiente cubre los cambios de page/search
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTablePaginationChange = useCallback(
    (next: PaginationState) => {
      setTablePagination(next);
      fetchContratosPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        field: searchField,
        value: searchValue
      });
    },
    [fetchContratosPage, searchField, searchValue]
  );

  const handleTableSearchChange = useCallback(
    ({ field, value }: { field: string; value: string }) => {
      // Si cambia el campo pero el value es vacío, sólo actualizamos el
      // campo (no refetcheamos). Si hay valor, sí refetcheamos.
      setSearchField(field);
      setSearchValue(value);
      // Reset a la primera página al cambiar la búsqueda
      const next: PaginationState = {
        pageIndex: 0,
        pageSize: tablePagination.pageSize
      };
      setTablePagination(next);
      fetchContratosPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        field,
        value
      });
    },
    [fetchContratosPage, tablePagination.pageSize]
  );

  const handleAddContract = useCallback(() => {
    navigate(getContratoCreateUrl());
  }, [navigate]);

  const handleEditContract = useCallback(
    (contract: ContratosRow) => {
      navigate(getContratoEditUrl(contract.idContrato.toString()));
    },
    [navigate]
  );

  const handleDeleteContract = useCallback((contract: ContratosRow) => {
    setSelectedContract(contract);
    setModalsState(prev => ({
      ...prev,
      delete: { isOpen: true }
    }));
  }, []);

  const handleViewDetails = useCallback((contract: ContratosRow) => {
    setSelectedContract(contract);
    setModalsState(prev => ({
      ...prev,
      details: { isOpen: true }
    }));
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!isValidContratoForOperation(selectedContract)) {
      setModalsState(prev => ({
        ...prev,
        delete: { isOpen: false }
      }));
      return;
    }

    setContracts(prev =>
      prev.filter(
        contract => contract.idContrato !== selectedContract.idContrato
      )
    );
    setSelectedContract(null);

    setModalsState(prev => ({
      ...prev,
      delete: { isOpen: false }
    }));
  }, [selectedContract]);

  const columnsData = useMemo(
    () =>
      columns({
        onEdit: handleEditContract,
        onDelete: handleDeleteContract,
        onViewDetails: handleViewDetails
      }),
    [handleEditContract, handleDeleteContract, handleViewDetails]
  );

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Contratos"
            description="Gestiona los contratos del sistema"
            actions={
              <div className="flex items-center gap-2">
                <ExportButtons
                  allContratos={contracts}
                  filteredContratos={contracts}
                  isFiltered={false}
                />
                <Button onClick={handleAddContract} variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Contrato
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
                    Listado de Contratos
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {tableLoading
                      ? 'Cargando…'
                      : `${tableData.length} contrato${tableData.length !== 1 ? 's' : ''} en esta página`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-background backdrop-blur-sm shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <DataTable
                    columns={columnsData}
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
                      fetchContratosPage({
                        pageIndex: tablePagination.pageIndex,
                        pageSize: tablePagination.pageSize,
                        field: searchField,
                        value: searchValue
                      })
                    }
                    emptyMessage={
                      searchValue.trim()
                        ? `Sin resultados para "${searchValue.trim()}"`
                        : 'No hay contratos registrados en el sistema'
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diálogo de confirmación de eliminación */}
        <DeleteConfirmationDialog
          isOpen={modalsState.delete.isOpen}
          onClose={() =>
            setModalsState(prev => ({
              ...prev,
              delete: { isOpen: false }
            }))
          }
          onConfirm={handleConfirmDelete}
          contract={selectedContract}
        />

        {/* Modal de detalles del contrato */}
        <ContractDetailsModal
          isOpen={modalsState.details.isOpen}
          onClose={() =>
            setModalsState(prev => ({
              ...prev,
              details: { isOpen: false }
            }))
          }
          contract={selectedContract}
        />
      </div>
    </div>
  );
}
