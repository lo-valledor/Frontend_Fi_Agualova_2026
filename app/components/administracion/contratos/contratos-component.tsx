/**
 * Componente principal para Gestión de Contratos
 *
 * Funcionalidades principales:
 * - Visualización de contratos en tabla con columnas personalizadas
 * - Creación de nuevos contratos (navegación a /crear)
 * - Edición de contratos existentes (navegación a /:codigoContrato)
 * - Eliminación de contratos con confirmación
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por tipo, ciclo, tarifa, comuna, estado
 * - Exportación a Excel (2 formatos: simple y completo)
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de contratos
 * 2. Puede aplicar múltiples filtros combinados
 * 3. Acciones disponibles por contrato:
 *    - Ver detalles (modal con información completa)
 *    - Editar (navegación a formulario)
 *    - Eliminar (con diálogo de confirmación)
 * 4. Exportación en formato simple o completo
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Hook useContractFilters para filtrado avanzado
 * - Modal ContractDetailsModal para visualización
 * - Navegación a rutas para crear/editar
 * - DeleteConfirmationDialog para eliminación segura
 * - ExportButtons con opciones múltiples
 * - FilterSummary con estadísticas en tiempo real
 *
 * Filtros disponibles:
 * - Tipo de contrato (select)
 * - Ciclo de facturación (select)
 * - Tarifa (select)
 * - Comuna (select)
 * - Liberado de corte (sí/no/todos)
 * - Fecha término (rango desde-hasta)
 * - Activo (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetContratos[]} props.contratos - Lista de contratos
 *
 * @example
 * ```tsx
 * export default function ContratosRoute({ loaderData }) {
 *   return <ContratosComponent contratos={loaderData.contratos} />;
 * }
 * ```
 */
import { FileText, Plus } from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useContractFilters } from '~/hooks/administracion/use-contract-filters';
import type { GetContratos } from '~/types/administracion';

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
  readonly contratos: GetContratos[];
}) {
  const [contracts, setContracts] = useState<GetContratos[]>(contratos);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<GetContratos | null>(
    null
  );
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

  const router = useNavigate();

  const handleEditContract = useCallback(
    (contract: GetContratos) => {
      router(`/dashboard/administracion/contratos/${contract.codigoContrato}`);
    },
    [router]
  );

  const handleDeleteContract = useCallback((contract: GetContratos) => {
    setSelectedContract(contract);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((contract: GetContratos) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedContract) {
      setContracts(prev =>
        prev.filter(
          contract =>
            contract.codigoContrato !== selectedContract.codigoContrato
        )
      );
      setSelectedContract(null);
    }
    setIsDeleteDialogOpen(false);
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

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Contratos'
          description='Gestiona los contratos del sistema'
          actions={
            <div className='flex items-center gap-2'>
              <ExportButtons
                allContratos={contracts}
                filteredContratos={filteredContracts}
                isFiltered={filterStats.isFiltered}
              />
              <Button
                onClick={() =>
                  router('/dashboard/administracion/contratos/crear')
                }
                variant="default"
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Contrato
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}

        {/* Filters */}
        <ContractFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalContracts={contracts.length}
          filteredContracts={filteredContracts.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative p-2 sm:p-4 lg:p-6'>
            {filteredContracts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 sm:py-12'>
                <div className='flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4'>
                  <FileText className='h-6 w-6 sm:h-8 sm:w-8' />
                </div>
                <p className='text-base sm:text-lg font-medium text-center'>
                  No se encontraron contratos
                </p>
                <p className='text-xs sm:text-sm text-center max-w-md px-4'>
                  {filterStats.isFiltered
                    ? 'No hay contratos que coincidan con los filtros aplicados'
                    : 'No hay contratos registrados en el sistema'}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Tabla moderna con scroll horizontal para móvil */}
                <div className='rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-background backdrop-blur-sm shadow-lg overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <VirtualDataTable
                      columns={columnsData}
                      data={filteredContracts}
                      searchPlaceholder='Buscar por código, propietario o local...'
                      estimateRowHeight={60}
                      maxHeight='700px'
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          contract={selectedContract}
        />

        <ContractDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          contract={selectedContract}
        />
      </div>
    </div>
  );
}
