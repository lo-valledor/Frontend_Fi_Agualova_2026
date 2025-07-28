import { FileText, Plus } from 'lucide-react';

import { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useContractFilters } from '~/hooks/administracion/use-contract-filters';
import type {
  ContratanteProps,
  ContratoFormData,
  GetComunas,
  GetContratos,
  GetContratosClientes,
  GetFechaActual,
  GetLimiteInvierno,
  GetLocal,
  GetMadres,
  GetPropietario,
  GetRegiones,
} from '~/types/administracion';
import type { Tarifas, TiposContrato } from '~/types/mantencion';

import { columns } from './columns';
import { ContractDetailsModal } from './contract-details-modal';
import {
  type ContractFilters,
  ContractFiltersComponent,
} from './contract-filters';
import { ContractFormModal } from './contract-form-modal';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { FilterSummary } from './filter-summary';

export default function ContratosComponent({
  contratos,
  tipoContrato,
  tarifas,
  contratante,
  propietario,
  local,
  madres,
  comuna,
}: {
  contratos: GetContratos[];
  regiones: GetRegiones[];
  contratosClientes: GetContratosClientes[];
  limiteInvierno: GetLimiteInvierno[];
  fechaActual: GetFechaActual[];
  tipoContrato: TiposContrato[];
  tarifas: Tarifas[];
  contratante: ContratanteProps[];
  propietario: GetPropietario[];
  local: GetLocal[];
  madres: GetMadres[];
  comuna: GetComunas[];
}) {
  const [contracts, setContracts] = useState<GetContratos[]>(contratos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<GetContratos | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
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

  const handleAddContract = () => {
    setSelectedContract(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditContract = (contract: GetContratos) => {
    setSelectedContract(contract);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteContract = (contract: GetContratos) => {
    setSelectedContract(contract);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (contract: GetContratos) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitContract = (formData: ContratoFormData) => {
    // Validar que fechaInicio no esté vacío
    if (!formData.fechaInicio) {
      console.error('Fecha de inicio es obligatoria');
      return;
    }

    try {
      if (modalMode === 'add') {
        const newContract: GetContratos = {
          codigoContrato: `CTR-2024-${String(contracts.length + 1).padStart(3, '0')}`,
          acometida: `ACO-${String(contracts.length + 1).padStart(3, '0')}`,
          ...formData,
          fechaInicio: new Date(formData.fechaInicio).toISOString(),
          fechaTermino: formData.fechaTermino
            ? new Date(formData.fechaTermino).toISOString()
            : '',
        };
        setContracts(prev => [...prev, newContract]);
      } else if (selectedContract) {
        setContracts(prev =>
          prev.map(contract =>
            contract.codigoContrato === selectedContract.codigoContrato
              ? {
                  ...contract,
                  ...formData,
                  fechaInicio: new Date(formData.fechaInicio).toISOString(),
                  fechaTermino: formData.fechaTermino
                    ? new Date(formData.fechaTermino).toISOString()
                    : '',
                }
              : contract
          )
        );
      }
    } catch (error) {
      console.error('Error al procesar las fechas:', error);
      alert(
        'Error al procesar las fechas. Verifica que las fechas sean válidas.'
      );
    }
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
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Contratos
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAddContract}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Contrato
        </Button>
      </div>

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
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          {filteredContracts.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4'>
                <FileText className='h-8 w-8 text-slate-400 dark:text-slate-500' />
              </div>
              <p className='text-lg font-medium'>No se encontraron contratos</p>
              <p className='text-sm'>
                {filterStats.isFiltered
                  ? 'No hay contratos que coincidan con los filtros aplicados'
                  : 'No hay contratos registrados en el sistema'}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Tabla moderna */}
              <div className='rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden'>
                <DataTable
                  columns={columnsData}
                  data={filteredContracts}
                  searchPlaceholder='Buscar por código, propietario o local...'
                  defaultPageSize={15}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ContractFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitContract}
        contract={selectedContract}
        mode={modalMode}
        tipoContrato={tipoContrato}
        tarifas={tarifas}
        contratante={contratante}
        propietario={propietario}
        local={local}
        madres={madres}
        comuna={comuna}
      />

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
  );
}
