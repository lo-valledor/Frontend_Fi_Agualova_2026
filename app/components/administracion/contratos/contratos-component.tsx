import React, { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import type {
  ContratoFormData,
  GetContratos,
  GetContratosClientes,
  GetFechaActual,
  GetLimiteInvierno,
  GetRegiones,
} from '~/types/administracion';
import { columns } from './columns';
import { Button } from '~/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { ContractFormModal } from './contract-form-modal';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { ContractDetailsModal } from './contract-details-modal';
import {
  ContractFiltersComponent,
  type ContractFilters,
} from './contract-filters';
import { useContractFilters } from '~/hooks/administracion/use-contract-filters';
import { FilterSummary } from './filter-summary';

export default function ContratosComponent({
  contratos,
  regiones,
  contratosClientes,
  limiteInvierno,
  fechaActual,
}: {
  contratos: GetContratos[];
  regiones: GetRegiones[];
  contratosClientes: GetContratosClientes[];
  limiteInvierno: GetLimiteInvierno[];
  fechaActual: GetFechaActual[];
}) {
  const [contracts, setContracts] = useState<GetContratos[]>(contratos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<GetContratos | null>(
    null,
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
    filters,
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
      setContracts((prev) => [...prev, newContract]);
    } else if (selectedContract) {
      setContracts((prev) =>
        prev.map((contract) =>
          contract.codigoContrato === selectedContract.codigoContrato
            ? {
                ...contract,
                ...formData,
                fechaInicio: new Date(formData.fechaInicio).toISOString(),
                fechaTermino: formData.fechaTermino
                  ? new Date(formData.fechaTermino).toISOString()
                  : '',
              }
            : contract,
        ),
      );
    }
  };

  const handleConfirmDelete = () => {
    if (selectedContract) {
      setContracts((prev) =>
        prev.filter(
          (contract) =>
            contract.codigoContrato !== selectedContract.codigoContrato,
        ),
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
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Contratos
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los contratos del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddContract}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Contrato
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contratos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterStats.isFiltered
                ? filteredContracts.length
                : contracts.length}
            </div>
            {filterStats.isFiltered && (
              <p className="text-xs text-muted-foreground">
                de {contracts.length} total
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Activos
            </CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredContracts.filter((c) => c.activo === true).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residenciales</CardTitle>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredContracts.filter(
                  (c) => c.tipoContrato === 'Residencial',
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liberados de Corte
            </CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredContracts.filter((c) => c.liberadoCorte === true).length}
            </div>
          </CardContent>
        </Card>
      </div>

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
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los contratos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columnsData} data={filteredContracts} />
        </CardContent>
      </Card>

      {/* Modals */}
      <ContractFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitContract}
        contract={selectedContract}
        mode={modalMode}
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
