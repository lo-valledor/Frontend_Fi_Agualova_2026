import { FileText, Plus } from 'lucide-react';

import { useState } from 'react';

import { useNavigate } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useContractFilters } from '~/hooks/administracion/use-contract-filters';
import type { GetContratos } from '~/types/administracion';

import { columns } from './columns';
import { ContractDetailsModal } from './contract-details-modal';
import {
  type ContractFilters,
  ContractFiltersComponent,
} from './contract-filters';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { ExportButtons } from './export-buttons';
import { FilterSummary } from './filter-summary';

export default function ContratosComponent({
  contratos,
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
    activo: 'all',
  });

  const { filteredContracts, filterStats, filterOptions } = useContractFilters(
    contracts,
    filters
  );

  const handleFiltersChange = (newFilters: ContractFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      tipoContrato: 'all',
      cicloFacturacion: 'all',
      tarifa: 'all',
      comuna: 'all',
      liberadoCorte: 'all',
      fechaTerminoDesde: '',
      fechaTerminoHasta: '',
      activo: 'all',
    });
  };

  const router = useNavigate();

  const handleEditContract = (contract: GetContratos) => {
    router(`/dashboard/administracion/contratos/${contract.codigoContrato}`);
  };

  const handleDeleteContract = (contract: GetContratos) => {
    setSelectedContract(contract);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (contract: GetContratos) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmDelete = () => {
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
  };

  const columnsData = columns({
    onEdit: handleEditContract,
    onDelete: handleDeleteContract,
    onViewDetails: handleViewDetails,
  });

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
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
                className='bg-sky-600 hover:bg-sky-700 text-white'
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
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='relative p-2 sm:p-4 lg:p-6'>
            {filteredContracts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 sm:py-12 text-slate-500 dark:text-slate-400'>
                <div className='flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4'>
                  <FileText className='h-6 w-6 sm:h-8 sm:w-8 text-slate-400 dark:text-slate-500' />
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
                <div className='rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <DataTable
                      columns={columnsData}
                      data={filteredContracts}
                      searchPlaceholder='Buscar por código, propietario o local...'
                      defaultPageSize={10}
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
