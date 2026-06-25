import { Filter, LayoutList, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { VirtualDataTable } from '~/components/data-table/virtual-data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { administracionService } from '~/services/administracionService';
import type { CargoTipoContrato } from '~/types/administracion';

import { columns } from './columns';

export default function CargoTipoContratoComponent({
  cargoTipoContrato: initialData
}: Readonly<{
  cargoTipoContrato: CargoTipoContrato[];
}>) {
  const [data, setData] = useState<CargoTipoContrato[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [tipoContratoFilter, setTipoContratoFilter] = useState<string>('all');
  const router = useNavigate();

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const tiposContratoUnicos = useMemo(() => {
    const tipos = new Set(data.map(item => item.tipoContrato).filter(Boolean));
    return Array.from(tipos).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredData = useMemo(() => {
    if (tipoContratoFilter === 'all') {
      return data;
    }
    return data.filter(item => item.tipoContrato === tipoContratoFilter);
  }, [data, tipoContratoFilter]);

  const refetchData = async () => {
    setIsLoading(true);
    try {
      const result = await administracionService.getCargosTiposContrato();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al recargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    router('/dashboard/administracion/cargo-tipo-contrato/crear');
  };

  const handleEdit = (item: CargoTipoContrato) => {
    router(
      `/dashboard/administracion/cargo-tipo-contrato/edit/${item.idTipoContrato}`
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6 p-4 sm:p-6">
        <header>
          <ModernHeader
            title="Cargo Tipo Contrato"
            description="Gestiona las configuraciones por tipo de contrato."
            actions={
              <div className="flex gap-2">
                <Button onClick={refetchData} variant="outline" size="sm">
                  Recargar
                </Button>
                <Button onClick={handleAdd} variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Configuración
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-accent text-accent-foreground">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de configuraciones
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                    {filteredData.length} registro
                    {filteredData.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background">
                  <LoadingSpinner />
                </div>
              )}

              <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredData.length} de {data.length} registros
                </div>

                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <div className="flex flex-1 items-center gap-2 sm:flex-initial">
                    <Label htmlFor="tipo-contrato-filter" className="text-xs">
                      <Filter className="mr-1 inline h-3 w-3" />
                      Tipo de Contrato:
                    </Label>
                    <Select
                      value={tipoContratoFilter}
                      onValueChange={setTipoContratoFilter}
                    >
                      <SelectTrigger
                        id="tipo-contrato-filter"
                        className="h-8 w-[200px] text-sm"
                      >
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {tiposContratoUnicos.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {tipoContratoFilter !== 'all' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setTipoContratoFilter('all')}
                        title="Limpiar filtro"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <VirtualDataTable
                columns={columns({ onEdit: handleEdit })}
                data={filteredData}
                searchPlaceholder="Buscar configuración..."
                estimateRowHeight={60}
                maxHeight="600px"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
