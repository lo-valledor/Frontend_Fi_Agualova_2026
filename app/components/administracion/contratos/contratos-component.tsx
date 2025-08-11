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
  GetLocal,
  GetMadres,
  GetPropietario,
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
  readonly contratos: GetContratos[];
  readonly tipoContrato: TiposContrato[];
  readonly tarifas: Tarifas[];
  readonly contratante: ContratanteProps[];
  readonly propietario: GetPropietario[];
  readonly local: GetLocal[];
  readonly madres: GetMadres[];
  readonly comuna: GetComunas[];
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
      // Usar type assertion para acceder a las propiedades reales del formulario
      const formDataAny = formData as any;

      let submitData: any;

      if (modalMode === 'add') {
        // Datos para crear contrato
        submitData = {
          tipoContrato:
            parseInt(formData.tipoContrato || formDataAny.tipoContrato) || 0,
          tarifa: parseInt(formData.tarifa || formDataAny.tarifa) || 0,
          propietario:
            formDataAny.propietario || formData.nombrePropietario || '',
          cliente: formDataAny.cliente || formData.nombreCliente || '',
          localId: formDataAny.localId || formData.local || '',
          fechaInicio: formatDateToBackend(formData.fechaInicio),
          activo: formData.activo,
          direccion: formDataAny.direccion || formData.direccionEnvio || '',
          comuna: formDataAny.comuna || formData.comunaEnvio || '',
          limite: formDataAny.limite || formData.limiteInvierno || 0,
          ciclo: parseInt(formDataAny.ciclo || formData.cicloFacturacion) || 1,
          potencia: formDataAny.potencia || formData.potenciaContratada || '',
          guardaCliente: formDataAny.cliente || formData.nombreCliente || '',
          esMadre: formData.madre ? 'S' : 'N',
          madre: formData.madre || '',
          lugar: formDataAny.localId || formData.local || '',
          sinCorte: formDataAny.sinCorte || (formData.liberadoCorte ? 1 : 0),
        };
      } else {
        // Datos para editar contrato
        submitData = {
          codigo: selectedContract?.codigoContrato || '',
          tipoContrato:
            parseInt(formData.tipoContrato || formDataAny.tipoContrato) || 0,
          tarifa: parseInt(formData.tarifa || formDataAny.tarifa) || 0,
          propietario:
            formDataAny.propietario || formData.nombrePropietario || '',
          cliente: formDataAny.cliente || formData.nombreCliente || '',
          localId: formDataAny.localId || formData.local || '',
          fechaInicio: formatDateToBackend(formData.fechaInicio),
          activo: formData.activo,
          fechaTermino: formData.fechaTermino
            ? formatDateToBackend(formData.fechaTermino)
            : null,
          direccion: formDataAny.direccion || formData.direccionEnvio || '',
          comuna: formDataAny.comuna || formData.comunaEnvio || '',
          limite: formDataAny.limite || formData.limiteInvierno || 0,
          ciclo: parseInt(formDataAny.ciclo || formData.cicloFacturacion) || 0,
          potencia: formDataAny.potencia || formData.potenciaContratada || '',
          madre: formData.madre || null,
          lugar: formDataAny.localId || formData.local || '',
          sinCorte: formDataAny.sinCorte || (formData.liberadoCorte ? 1 : 0),
        };
      }

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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Contratos
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestiona los contratos del sistema
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <ExportButtons
              allContratos={contracts}
              filteredContratos={filteredContracts}
              isFiltered={filterStats.isFiltered}
            />
            <Button
              onClick={handleAddContract}
              className='bg-sky-600 hover:bg-sky-700 text-white'
              size='sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              Agregar Contrato
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
    </div>
  );
}
