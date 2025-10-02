import { Plus } from 'lucide-react';

import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import type {
  GetContratante,
  GetComunas,
  GetGiros
} from '~/types/administracion';

import { columns } from './columns';
import { ContratanteDetailsModal } from './detalles-contratante';
import { FilterSummary } from './filter-summary';
import {
  ContratanteFiltersComponent,
  type ContratanteFilters
} from './contratante-filters';

interface ContratantesComponentProps {
  contratantes: GetContratante[];
  comunas: GetComunas[];
  giros: GetGiros[];
}

interface FilterOptions {
  comunas: string[];
}

export default function ContratantesComponent({
  contratantes,
  comunas,
  giros
}: Readonly<ContratantesComponentProps>) {
  const [contratantesList] = useState<GetContratante[]>(contratantes);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedContratante, setDetailedContratante] =
    useState<GetContratante | null>(null);
  const [detailingContratanteRut, setDetailingContratanteRut] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<ContratanteFilters>({
    esEmpresa: 'all',
    comuna: 'all',
    tieneContacto: 'all',
    tieneTelefono: 'all',
    tieneEmail: 'all'
  });

  const router = useNavigate();

  // Filter options from data
  const filterOptions = useMemo((): FilterOptions => {
    const comunasNombres = [
      ...new Set(contratantesList.map(c => c.comuna).filter(Boolean))
    ].sort();

    return {
      comunas: comunasNombres
    };
  }, [contratantesList]);

  // Filtered contratantes
  const filteredContratantes = useMemo(() => {
    return contratantesList.filter(contratante => {
      // Filtro por tipo de contratante
      if (
        filters.esEmpresa &&
        filters.esEmpresa !== 'all' &&
        contratante.esEmpresa.toString() !== filters.esEmpresa
      ) {
        return false;
      }

      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== 'all' &&
        contratante.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por contacto
      if (
        filters.tieneContacto &&
        filters.tieneContacto !== 'all' &&
        ((filters.tieneContacto === 'true' && !contratante.contacto) ||
          (filters.tieneContacto === 'false' && contratante.contacto))
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== 'all' &&
        ((filters.tieneTelefono === 'true' && !contratante.telefono) ||
          (filters.tieneTelefono === 'false' && contratante.telefono))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== 'all' &&
        ((filters.tieneEmail === 'true' && !contratante.email) ||
          (filters.tieneEmail === 'false' && contratante.email))
      ) {
        return false;
      }

      return true;
    });
  }, [contratantesList, filters]);

  // Filter stats
  const filterStats = useMemo(() => {
    const total = contratantesList.length;
    const filtered = filteredContratantes.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [contratantesList.length, filteredContratantes.length, filters]);

  // Export columns
  const contratanteColumns = [
    { header: 'RUT', key: 'rut' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Apellido', key: 'apellido' },
    { header: 'Es Empresa', key: 'esEmpresa' },
    { header: 'Dirección', key: 'direccion' },
    { header: 'Comuna', key: 'comuna' },
    { header: 'Contacto', key: 'contacto' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Email', key: 'email' }
  ];

  const handleAddContratante = () => {
    router('/dashboard/administracion/contratantes/crear');
  };

  const handleDetailsContratante = (contratante: GetContratante) => {
    setDetailedContratante(contratante);
    setIsDetailsOpen(true);
  };

  const handleFiltersChange = (newFilters: ContratanteFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      esEmpresa: 'all',
      comuna: 'all',
      tieneContacto: 'all',
      tieneTelefono: 'all',
      tieneEmail: 'all'
    });
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Contratantes'
          description='Gestiona los contratantes del sistema'
          actions={
            <div className='flex gap-2'>
              <ExportButton
                data={filteredContratantes}
                columns={contratanteColumns}
                filename='contratantes'
                variant='outline'
                size='sm'
                className=''
              />
              <Button
                onClick={handleAddContratante}
                className='bg-orange-600 hover:bg-orange-700 text-white'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Contratante
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <ContratanteFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        {/* Filter Summary */}
        <FilterSummary
          totalContratantes={contratantesList.length}
          filteredContratantes={filteredContratantes.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        {/* Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='p-4'>
            <div className='overflow-x-auto'>
              <DataTable
                columns={columns({
                  onDetails: handleDetailsContratante,
                  detailingContratanteRut
                })}
                data={filteredContratantes}
                searchPlaceholder='Buscar por RUT, nombre o email...'
                defaultPageSize={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalles */}
        <ContratanteDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          contratante={detailedContratante}
        />
      </div>
    </div>
  );
}
