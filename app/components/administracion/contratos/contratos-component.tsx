import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useContractFilters } from '~/hooks/administracion/use-contract-filters';
import { administracionService } from '~/services/administracionService';
import type {
  ContratanteProps,
  ContratoFormData,
  CrearContratoProps,
  GetComunas,
  GetContratos,
  GetContratosClientes,
  GetFechaActual,
  GetLimiteInvierno,
  GetLocal,
  GetMadres,
  GetPropietario,
  GetRegiones,
  ModificarContratoProps,
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
import { ExportButtons } from './export-buttons';
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

  const handleSubmitContract = async (formData: ContratoFormData) => {
    // Validar que fechaInicio no esté vacío
    if (!formData.fechaInicio) {
      toast.error('La fecha de inicio es obligatoria');
      return;
    }

    // Función para convertir fecha de forma segura
    // Función para formatear fecha a yyyy-MM-dd (formato requerido por el backend)
    const formatDateToBackend = (dateString: string): string => {
      if (!dateString) return '';

      try {
        console.log('Procesando fecha para formato yyyy-MM-dd:', dateString);

        // Regex para detectar formatos de fecha
        const dateRegexYMD = /^\d{4}-\d{2}-\d{2}$/; // yyyy-MM-dd
        const dateRegexDMY = /^\d{2}-\d{2}-\d{4}$/; // dd-MM-yyyy

        let normalizedDate: string;

        if (dateRegexYMD.test(dateString)) {
          // Ya está en formato yyyy-MM-dd
          normalizedDate = dateString;
          console.log('Fecha ya en formato yyyy-MM-dd:', normalizedDate);
        } else if (dateRegexDMY.test(dateString)) {
          // Formato dd-MM-yyyy - convertir a yyyy-MM-dd
          const [day, month, year] = dateString.split('-');
          normalizedDate = `${year}-${month}-${day}`;
          console.log(
            'Fecha convertida de dd-MM-yyyy a yyyy-MM-dd:',
            normalizedDate
          );
        } else {
          console.error('Formato de fecha inválido:', dateString);
          return '';
        }

        console.log('Fecha final formateada:', normalizedDate);
        return normalizedDate;
      } catch (error) {
        console.error('Error al convertir fecha:', error);
        return '';
      }
    };

    try {
      // Preparar los datos según el modo (crear o editar)
      const submitData = {
        // Campos base requeridos por la API
        tipoContrato: parseInt(formData.tipoContrato) || 0,
        tarifa: parseInt(formData.tarifa) || 0,
        propietario: formData.nombrePropietario,
        cliente: formData.nombreCliente,
        localId: formData.local,
        fechaInicio: formatDateToBackend(formData.fechaInicio), // Formatear a yyyy-MM-dd
        activo: formData.activo,
        direccion: formData.direccionEnvio,
        comuna: formData.comunaEnvio,
        limite: formData.limiteInvierno,
        ciclo: 1, // Valor fijo para "Ciclo Día 15"
        potencia: formData.potenciaContratada,
        madre: formData.madre,
        lugar: formData.local,
        sinCorte: formData.liberadoCorte ? 1 : 0,

        // Campos específicos para crear
        ...(modalMode === 'add' && {
          guardaCliente: formData.nombreCliente,
          esMadre: formData.madre ? 'S' : 'N',
        }),

        // Campos específicos para editar
        ...(modalMode === 'edit' && {
          codigo: selectedContract?.codigoContrato || '',
          fechaTermino: formatDateToBackend(formData.fechaTermino),
        }),
      };

      // Console.log para debug
      console.log('=== DATOS ENVIADOS AL SERVIDOR ===');
      console.log('Modo:', modalMode);
      console.log(
        'Endpoint:',
        modalMode === 'add' ? 'POST /contrato/crear' : 'PUT /contrato/modificar'
      );
      console.log('Datos originales del formulario:', formData);
      console.log(
        'JSON transformado enviado:',
        JSON.stringify(submitData, null, 2)
      );
      console.log('================================');

      // Llamar al servicio correspondiente
      let response;
      if (modalMode === 'add') {
        response = await administracionService.crearContrato(
          submitData as CrearContratoProps
        );
      } else {
        response = await administracionService.modificarContrato(
          submitData as ModificarContratoProps
        );
      }

      // Manejar la respuesta
      if (response.error) {
        toast.error(`Error: ${response.error}`);
        console.error('Error en la respuesta del servidor:', response.error);
        return;
      }

      // Éxito
      toast.success(
        modalMode === 'add'
          ? 'Contrato creado exitosamente'
          : 'Contrato modificado exitosamente'
      );

      // Actualizar la lista local (opcional, ya que se puede recargar desde el servidor)
      if (modalMode === 'add' && response.data) {
        const newContract: GetContratos = {
          codigoContrato:
            response.data.codigoContrato ||
            `CTR-2024-${String(contracts.length + 1).padStart(3, '0')}`,
          acometida:
            response.data.acometida ||
            `ACO-${String(contracts.length + 1).padStart(3, '0')}`,
          ...formData,
          fechaInicio: formData.fechaInicio,
          fechaTermino: formData.fechaTermino || '',
        };
        setContracts(prev => [...prev, newContract]);
      } else if (modalMode === 'edit' && selectedContract) {
        setContracts(prev =>
          prev.map(contract =>
            contract.codigoContrato === selectedContract.codigoContrato
              ? {
                  ...contract,
                  ...formData,
                  fechaInicio: formData.fechaInicio,
                  fechaTermino: formData.fechaTermino || '',
                }
              : contract
          )
        );
      }

      // Cerrar el modal
      setIsModalOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error al procesar el contrato:', error);
      toast.error(
        'Error al procesar el contrato. Verifica los datos e intenta nuevamente.'
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
    <div className='container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Contratos
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-muted-foreground max-w-2xl'>
            Gestiona los contratos del sistema y exporta los datos según tus
            necesidades
          </p>
        </div>
        <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 lg:flex-row'>
          <div className='order-2 sm:order-1'>
            <ExportButtons
              allContratos={contracts}
              filteredContratos={filteredContracts}
              isFiltered={filterStats.isFiltered}
            />
          </div>
          <Button
            onClick={handleAddContract}
            className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto order-1 sm:order-2'
            size='sm'
          >
            <Plus className='mr-2 h-4 w-4' />
            <span className='sm:inline'>Agregar Contrato</span>
          </Button>
        </div>
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
