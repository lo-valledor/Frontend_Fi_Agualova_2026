import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';

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
import { useAcometidaFilters } from '~/hooks/administracion/use-acometida-filters';
import { useExportAcometidas } from '~/hooks/administracion/use-export-acometidas';
import api from '~/lib/api';
import type {
  AcometidaProps,
  AcometidaRow,
  BuscarContratosLibres,
  Empalmes,
  Nichos,
  Sectores
} from '~/types/administracion';

import {
  type AcometidaFilters,
  AcometidaFiltersComponent
} from './acometida-filters';
import { AcometidaForm } from './acometida-form';
import { columns } from './columns';
import { FilterSummary } from './filter-summary';

interface AcometidaComponentProps {
  acometidas: AcometidaRow[];
  comboEmpalmes: Empalmes[];
  comboNichos: Nichos[];
  comboSectores: Sectores[];
  contratosDisponibles: BuscarContratosLibres[];
}

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles
}: Readonly<AcometidaComponentProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcometida, setSelectedAcometida] =
    useState<AcometidaRow | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [, setEditingAcometidaId] = useState<number | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<AcometidaFilters>({
    empalmeDescripcion: '',
    nichoDescripcion: '',
    sectorDescripcion: '',
    limitePotenciaMin: '',
    limitePotenciaMax: '',
    tieneUbicacion: '',
    tieneMedidor: '',
    tieneLimitePotencia: ''
  });

  const revalidator = useRevalidator();

  const { acometidaColumns } = useExportAcometidas();
  const { filteredAcometidas, filterStats, filterOptions } =
    useAcometidaFilters(acometidas, filters);

  const handleFiltersChange = (newFilters: AcometidaFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      empalmeDescripcion: '',
      nichoDescripcion: '',
      sectorDescripcion: '',
      limitePotenciaMin: '',
      limitePotenciaMax: '',
      tieneUbicacion: '',
      tieneMedidor: '',
      tieneLimitePotencia: ''
    });
  };

  const handleAddAcometida = () => {
    setSelectedAcometida(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditAcometida = async (acometida: AcometidaRow) => {
    setEditingAcometidaId(acometida.idAcometida);
    setSelectedAcometida(acometida);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedAcometida(null);
    setModalMode('add');
    setEditingAcometidaId(null);
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Acometida creada exitosamente'
        : 'Acometida actualizada exitosamente'
    );
  };

  const handleSubmitForm = async (data: AcometidaProps | AcometidaProps) => {
    try {
      if (modalMode === 'add') {
        await api.post('/acometidas/crear', data as AcometidaProps);
      } else {
        await api.put('/acometidas/editar', {
          idAcometida: selectedAcometida?.idAcometida,
          ...data
        });
      }
      handleSuccess();
    } catch {
      toast.error('Ha ocurrido un error al guardar la acometida');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Acometidas"
            description="Gestiona las acometidas eléctricas del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={filteredAcometidas}
                  columns={acometidaColumns}
                  filename="acometidas"
                  size="sm"
                />
                <Button
                  onClick={handleAddAcometida}
                  variant="default"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Acometida
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <AcometidaFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        <FilterSummary
          totalAcometidas={filterStats.total}
          filteredAcometidas={filterStats.filtered}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Acometidas
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {filteredAcometidas.length} acometida
                    {filteredAcometidas.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <VirtualDataTable
                  columns={columns({
                    onEdit: handleEditAcometida
                  })}
                  data={filteredAcometidas}
                  searchPlaceholder="Buscar por código, ubicación o contrato..."
                  estimateRowHeight={60}
                  maxHeight="600px"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal Form */}
        <AcometidaForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAcometidaId(null);
          }}
          onSubmit={handleSubmitForm}
          acometida={selectedAcometida}
          isLoading={false}
          comboEmpalmes={comboEmpalmes}
          comboNichos={comboNichos}
          contratosDisponibles={contratosDisponibles}
          comboSectores={comboSectores}
        />
      </div>
    </div>
  );
}
