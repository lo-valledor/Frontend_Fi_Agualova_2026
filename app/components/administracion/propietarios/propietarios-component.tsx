import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import React, { useMemo, useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { administracionService } from '~/services';
import type { GetContratante, GetPropietario } from '~/types/administracion';

import { columns } from './columns';
import { PropietarioDetailsModal } from './detalles-propietario';
import { FilterSummary } from './filter-summary';
import {
  PropietarioFiltersComponent,
  type PropietarioFilters
} from './propietario-filters';

interface PropietariosComponentProps {
  propietarios: GetPropietario[];
  contratantes: GetContratante[];
}

interface FilterOptions {
  comunas: string[];
}

export default function PropietariosComponent({
  propietarios,
  contratantes
}: Readonly<PropietariosComponentProps>) {
  const [propietariosList] = useState<GetPropietario[]>(propietarios);
  const [contratantesList] = useState<GetContratante[]>(contratantes);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedPropietario, setDetailedPropietario] =
    useState<GetPropietario | null>(null);
  const [detailingPropietarioRut, setDetailingPropietarioRut] = useState<
    string | null
  >(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState<PropietarioFilters>({
    comuna: 'all',
    tieneTelefono: 'all',
    tieneCelular: 'all',
    tieneEmail: 'all'
  });


  // Filter options from data
  const filterOptions = useMemo((): FilterOptions => {
    const comunas = [
      ...new Set(propietariosList.map(p => p.comuna).filter(Boolean))
    ].sort();

    return {
      comunas
    };
  }, [propietariosList]);

  // Filtered propietarios
  const filteredPropietarios = useMemo(() => {
    return propietariosList.filter(propietario => {
      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== 'all' &&
        propietario.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== 'all' &&
        ((filters.tieneTelefono === 'true' && !propietario.telefono) ||
          (filters.tieneTelefono === 'false' && propietario.telefono))
      ) {
        return false;
      }

      // Filtro por celular
      if (
        filters.tieneCelular &&
        filters.tieneCelular !== 'all' &&
        ((filters.tieneCelular === 'true' && !propietario.celular) ||
          (filters.tieneCelular === 'false' && propietario.celular))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== 'all' &&
        ((filters.tieneEmail === 'true' && !propietario.email) ||
          (filters.tieneEmail === 'false' && propietario.email))
      ) {
        return false;
      }

      return true;
    });
  }, [propietariosList, filters]);

  // Filter stats
  const filterStats = useMemo(() => {
    const total = propietariosList.length;
    const filtered = filteredPropietarios.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [propietariosList.length, filteredPropietarios.length, filters]);

  // Export columns
  const propietarioColumns = [
    { header: 'RUT', key: 'rut' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Comuna', key: 'comuna' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Celular', key: 'celular' },
    { header: 'Email', key: 'email' }
  ];


  const handleDetailsPropietario = (propietario: GetPropietario) => {
    setDetailedPropietario(propietario);
    setIsDetailsOpen(true);
  };

  const handleSyncPropietarios = async () => {
    setIsSyncing(true);
    try {
      const result = await administracionService.sincronizarPropietarios();
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        toast.success(
          `${result.data.mensaje} (${result.data.registrosAfectados} registros afectados)`
        );
        // Optionally reload the page or refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al sincronizar propietarios:', error);
      toast.error('Error al sincronizar propietarios');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFiltersChange = (newFilters: PropietarioFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      comuna: 'all',
      tieneTelefono: 'all',
      tieneCelular: 'all',
      tieneEmail: 'all'
    });
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Propietarios'
          description='Gestiona los propietarios del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredPropietarios}
                columns={propietarioColumns}
                filename='propietarios'
                variant='outline'
                size='sm'
                className=''
              />
              <Button
                onClick={handleSyncPropietarios}
                className='bg-emerald-600 hover:bg-emerald-700 text-white'
                size='sm'
                disabled={isSyncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar con Locales'}
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <PropietarioFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalPropietarios={propietariosList.length}
          filteredPropietarios={filteredPropietarios.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='p-4'>
            <div className='overflow-x-auto'>
              <DataTable
                columns={columns({
                  onDetails: handleDetailsPropietario,
                  detailingPropietarioRut
                })}
                data={filteredPropietarios}
                searchPlaceholder='Buscar por RUT, nombre o email...'
                defaultPageSize={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalles */}
        <PropietarioDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          propietario={detailedPropietario}
        />
      </div>
    </div>
  );
}
