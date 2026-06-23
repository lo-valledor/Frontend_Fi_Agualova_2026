import { FileText, LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';

import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { useContractFilters } from '~/hooks/administracion/use-contract-filters';
import type { ContratoModalState, ContratosRow } from '~/types/administracion';
import {
  createInitialContratoModalState,
  getContratoCreateUrl,
  getContratoEditUrl,
  isValidContratoForOperation
} from '~/utils/administracion';

import { columns } from './columns';
import { ContractDetailsModal } from './contract-details-modal';
import {
  type ContractFilters,
  ContractFiltersComponent
} from './contract-filters';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { ExportButtons } from './export-buttons';
import { FilterSummary } from './filter-summary';

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

  // Estado de filtros
  const [filters, setFilters] = useState<ContractFilters>({
    tipoContrato: 'all',
    cicloFacturacion: 'all',
    tarifa: 'all',
    comuna: 'all',
    liberadoCorte: 'all',
    fechaTerminoDesde: '',
    fechaTerminoHasta: '',
    activo: 'all'
  });

  // Dependencias
  const navigate = useNavigate();

  const { filteredContracts, filterStats, filterOptions } = useContractFilters(
    contracts,
    filters
  );

  const handleFiltersChange = useCallback((newFilters: ContractFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      tipoContrato: 'all',
      cicloFacturacion: 'all',
      tarifa: 'all',
      comuna: 'all',
      liberadoCorte: 'all',
      fechaTerminoDesde: '',
      fechaTerminoHasta: '',
      activo: 'all'
    });
  }, []);

  const handleAddContract = useCallback(() => {
    navigate(getContratoCreateUrl());
  }, [navigate]);

  const handleEditContract = useCallback(
    (contract: ContratosRow) => {
      navigate(getContratoEditUrl(contract.codigoContrato));
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
    // Early return: validar que exista contrato seleccionado
    if (!isValidContratoForOperation(selectedContract)) {
      setModalsState(prev => ({
        ...prev,
        delete: { isOpen: false }
      }));
      return;
    }

    // Eliminar contrato de la lista
    setContracts(prev =>
      prev.filter(
        contract => contract.codigoContrato !== selectedContract.codigoContrato
      )
    );
    setSelectedContract(null);

    // Cerrar diálogo
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
                  filteredContratos={filteredContracts}
                  isFiltered={filterStats.isFiltered}
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

        <ContractFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        <FilterSummary
          totalContracts={contracts.length}
          filteredContracts={filteredContracts.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

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
                    {filteredContracts.length} contrato
                    {filteredContracts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              {filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-linear-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <p className="text-base sm:text-lg font-medium text-center">
                    No se encontraron contratos
                  </p>
                  <p className="text-xs sm:text-sm text-center max-w-md px-4">
                    {filterStats.isFiltered
                      ? 'No hay contratos que coincidan con los filtros aplicados'
                      : 'No hay contratos registrados en el sistema'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tabla moderna con scroll horizontal para móvil */}
                  <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-background backdrop-blur-sm shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <VirtualDataTable
                        columns={columnsData}
                        data={filteredContracts}
                        searchPlaceholder="Buscar por código, propietario o local..."
                        estimateRowHeight={60}
                        maxHeight="700px"
                      />
                    </div>
                  </div>
                </div>
              )}
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
