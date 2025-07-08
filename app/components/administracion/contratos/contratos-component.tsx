import { useState } from 'react';
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
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                Lista de Contratos
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                Visualiza y gestiona todos los contratos registrados en el sistema ({filteredContracts.length} contratos)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4">
                <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-lg font-medium">
                No se encontraron contratos
              </p>
              <p className="text-sm">
                {filterStats.isFiltered
                  ? 'No hay contratos que coincidan con los filtros aplicados'
                  : 'No hay contratos registrados en el sistema'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-3 border border-emerald-200/40 dark:border-emerald-800/40">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {filteredContracts.filter((c) => c.activo === true).length}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Contratos Activos
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg p-3 border border-blue-200/40 dark:border-blue-800/40">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {filteredContracts.filter((c) => c.tipoContrato === 'Residencial').length}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Residenciales
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200/40 dark:border-green-800/40">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {filteredContracts.filter((c) => c.liberadoCorte === true).length}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Liberados de Corte
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-3 border border-purple-200/40 dark:border-purple-800/40">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {filteredContracts.filter((c) => c.tipoContrato === 'Comercial').length}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Comerciales
                  </div>
                </div>
              </div>

              {/* Tabla moderna */}
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <DataTable
                  columns={columnsData}
                  data={filteredContracts}
                  searchPlaceholder="Buscar por código, propietario o local..."
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
