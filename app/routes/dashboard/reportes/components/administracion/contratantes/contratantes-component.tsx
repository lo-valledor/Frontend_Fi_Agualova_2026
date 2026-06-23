import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';

import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import type {
  GetContratante,
  NombreComuna,
  NombreGiro
} from '~/types/administracion';

import { columns } from './columns';
import {
  type ContratanteFilters,
  ContratanteFiltersComponent
} from './contratante-filters';
import { ContratanteDetailsModal } from './detalles-contratante';
import { FilterSummary } from './filter-summary';

interface ContratantesComponentProps {
  contratantes: GetContratante[];
  comunas: NombreComuna[];
  giros: NombreGiro[];
}

interface FilterOptions {
  comunas: string[];
}

export default function ContratantesComponent({
  contratantes,
  comunas
}: Readonly<ContratantesComponentProps>) {
  const [contratantesList] = useState<GetContratante[]>(contratantes);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedContratante, setDetailedContratante] =
    useState<GetContratante | null>(null);
  const [detailingContratanteRut] = useState<string | null>(null);
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
    ].sort((a, b) => a.localeCompare(b));

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

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Contratantes"
            description="Gestiona los contratantes del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={filteredContratantes}
                  columns={contratanteColumns}
                  filename="contratantes"
                  size="sm"
                />
                <Button
                  onClick={handleAddContratante}
                  variant="default"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Contratante
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <ContratanteFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        <FilterSummary
          totalContratantes={contratantesList.length}
          filteredContratantes={filteredContratantes.length}
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
                    Listado de Contratantes
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {filteredContratantes.length} contratante
                    {filteredContratantes.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <VirtualDataTable
                  columns={columns({
                    onDetails: handleDetailsContratante,
                    detailingContratanteRut,
                    comunas
                  })}
                  data={filteredContratantes}
                  searchPlaceholder="Buscar por RUT, nombre o email..."
                  estimateRowHeight={60}
                  maxHeight="600px"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de Detalles */}
        <ContratanteDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          contratante={detailedContratante}
          comunas={comunas}
        />
      </div>
    </div>
  );
}
