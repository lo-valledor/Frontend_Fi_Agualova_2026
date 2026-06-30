import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Eraser,
  Filter,
  Hash,
  Loader2,
  MapPin,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ScrollArea } from '~/components/ui/scroll-area';
import { monitorService } from '~/services/monitorService';
import type { Nicho, Sector } from '~/types/mantencion';
import type { MonitorPeriodos } from '~/types/monitor';
import type { PeriodosDisponibles } from '~/types/reportes';

interface ExportarLecturasComponentProps {
  periodos: PeriodosDisponibles[];
  sectores: Sector[];
  nichos: Nicho[];
  periodoActivo: MonitorPeriodos[];
  error: Error | string | null;
}

export default function ExportarLecturasComponent({
  periodos,
  sectores,
  nichos,
  periodoActivo,
  error
}: ExportarLecturasComponentProps) {
  const [selectedPeriodos, setSelectedPeriodos] = useState<
    PeriodosDisponibles[]
  >([]);
  const [selectedSectores, setSelectedSectores] = useState<string[]>([]);
  const [selectedNichos, setSelectedNichos] = useState<string[]>([]);
  const [selectedMedidores, setSelectedMedidores] = useState<string[]>([]);
  const [medidorInput, setMedidorInput] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const pageBreadcrumbs = [
    { label: 'Monitor' },
    { label: 'Exportar Lecturas' }
  ];

  const activePeriodoValue = periodoActivo[0]?.value ?? null;

  const sectorsById = useMemo(
    () => new Map(sectores.map(sector => [String(sector.id), sector])),
    [sectores]
  );

  const visibleNichos = useMemo(() => {
    if (selectedSectores.length === 0) {
      return nichos;
    }

    return nichos.filter(nicho => selectedSectores.includes(nicho.sector));
  }, [nichos, selectedSectores]);

  useEffect(() => {
    if (periodos.length === 0 || selectedPeriodos.length > 0) {
      return;
    }

    const defaultPeriodo =
      periodos.find(periodo => periodo.id === activePeriodoValue) ??
      periodos[0];

    if (defaultPeriodo) {
      setSelectedPeriodos([defaultPeriodo]);
    }
  }, [activePeriodoValue, periodos, selectedPeriodos.length]);

  const handlePeriodoChange = (
    periodo: PeriodosDisponibles,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedPeriodos(prev =>
        prev.some(item => item.id === periodo.id) ? prev : [...prev, periodo]
      );
      return;
    }

    setSelectedPeriodos(prev => prev.filter(item => item.id !== periodo.id));
  };

  const handleSectorChange = (sectorId: string, checked: boolean) => {
    const sector = sectorsById.get(sectorId);

    if (checked) {
      setSelectedSectores(prev =>
        prev.includes(sectorId) ? prev : [...prev, sectorId]
      );
      return;
    }

    setSelectedSectores(prev => prev.filter(id => id !== sectorId));

    if (!sector) {
      return;
    }

    setSelectedNichos(prev =>
      prev.filter(nichoId => {
        const nicho = nichos.find(item => String(item.id) === nichoId);
        return nicho?.sector !== String(sector.id);
      })
    );
  };

  const handleNichoChange = (nichoId: string, checked: boolean) => {
    const nicho = nichos.find(item => String(item.id) === nichoId);

    if (checked) {
      setSelectedNichos(prev =>
        prev.includes(nichoId) ? prev : [...prev, nichoId]
      );

      if (nicho) {
        const relatedSectorId = sectores.find(
          sector => String(sector.id) === nicho.sector
        )?.id;

        if (relatedSectorId !== undefined) {
          setSelectedSectores(prev =>
            prev.includes(String(relatedSectorId))
              ? prev
              : [...prev, String(relatedSectorId)]
          );
        }
      }
      return;
    }

    setSelectedNichos(prev => prev.filter(id => id !== nichoId));

    if (!nicho) {
      return;
    }

    const relatedSectorId = sectores.find(
      sector => String(sector.id) === nicho.sector
    )?.id;

    if (relatedSectorId === undefined) {
      return;
    }

    const hasOtherNichosInSameSector = selectedNichos.some(selectedId => {
      if (selectedId === nichoId) {
        return false;
      }

      const selectedNicho = nichos.find(item => String(item.id) === selectedId);
      return selectedNicho?.sector === nicho.sector;
    });

    if (!hasOtherNichosInSameSector) {
      setSelectedSectores(prev =>
        prev.filter(id => id !== String(relatedSectorId))
      );
    }
  };

  const handleAddMedidor = () => {
    const medidor = medidorInput.trim();

    if (!medidor) {
      return;
    }

    setSelectedMedidores(prev =>
      prev.includes(medidor) ? prev : [...prev, medidor]
    );
    setMedidorInput('');
  };

  const handleRemoveMedidor = (medidor: string) => {
    setSelectedMedidores(prev => prev.filter(item => item !== medidor));
  };

  const handleLimpiarFiltros = () => {
    setSelectedSectores([]);
    setSelectedNichos([]);
    setSelectedMedidores([]);
    setMedidorInput('');
  };

  const handleExportar = async () => {
    if (selectedPeriodos.length === 0) {
      toast.error('Debe seleccionar al menos un período');
      return;
    }

    try {
      setIsExporting(true);

      const result = await monitorService.getExportarExcel(
        selectedPeriodos.map(periodo => periodo.id).join(','),
        selectedSectores.length > 0 ? selectedSectores.join(',') : undefined,
        selectedNichos.length > 0 ? selectedNichos.join(',') : undefined,
        selectedMedidores.length > 0 ? selectedMedidores.join(',') : undefined
      );

      if (result.error || !result.data) {
        toast.error(result.error ?? 'Error al exportar lecturas');
        return;
      }

      const url = globalThis.URL.createObjectURL(
        new Blob([result.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
      );

      const link = document.createElement('a');
      const periodosDescripcion = selectedPeriodos
        .map(periodo => periodo.descripcion)
        .join('-');
      const filename = `Lecturas_${periodosDescripcion}_${new Date().toLocaleDateString(
        'es-ES',
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
      )}.xlsx`;

      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      toast.success('Archivo exportado correctamente');
    } catch (exportError) {
      console.error('Error al exportar lecturas:', exportError);
      toast.error('Error al exportar lecturas');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar datos:{' '}
            {error instanceof Error ? error.message : error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasFilters =
    selectedSectores.length > 0 ||
    selectedNichos.length > 0 ||
    selectedMedidores.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <BreadcrumbSetter items={pageBreadcrumbs} />

        <ModernHeader
          title="Exportar Lecturas"
          description="Exporta lecturas de medidores en formato Excel con filtros personalizados"
        />

        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Períodos de Exportación</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona uno o más períodos para generar el reporte
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Requerido
                </Badge>
              </div>

              <ScrollArea className="h-32 rounded-xl border-border bg-background p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {periodos.map(periodo => (
                    <div key={periodo.id} className="flex items-center gap-2">
                      <Checkbox
                        id={periodo.id}
                        checked={selectedPeriodos.some(
                          item => item.id === periodo.id
                        )}
                        onCheckedChange={checked =>
                          handlePeriodoChange(periodo, checked as boolean)
                        }
                        className="text-primary"
                      />
                      <Label
                        htmlFor={periodo.id}
                        className="cursor-pointer text-xs font-medium"
                      >
                        {periodo.descripcion}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedPeriodos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Períodos seleccionados ({selectedPeriodos.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPeriodos.map(periodo => (
                      <Badge
                        key={periodo.id}
                        variant="default"
                        className="bg-primary"
                      >
                        {periodo.descripcion}
                        <Button
                          className="ml-2"
                          onClick={() => handlePeriodoChange(periodo, false)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="text-muted-foreground"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros Opcionales
                  {isFiltersOpen ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>

                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLimpiarFiltros}
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>

              <Button
                onClick={handleExportar}
                disabled={selectedPeriodos.length === 0 || isExporting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a Excel
                  </>
                )}
              </Button>
            </div>

            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent>
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Sectores</h4>
                        <p className="text-sm text-muted-foreground">
                          Filtra por sectores específicos
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-28 rounded-xl border border-border bg-background p-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {sectores.map(sector => (
                          <div
                            key={sector.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={String(sector.id)}
                              checked={selectedSectores.includes(
                                String(sector.id)
                              )}
                              onCheckedChange={checked =>
                                handleSectorChange(
                                  String(sector.id),
                                  checked as boolean
                                )
                              }
                              className="text-primary"
                            />
                            <Label
                              htmlFor={String(sector.id)}
                              className="cursor-pointer text-xs font-medium"
                            >
                              {sector.nombre}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {selectedSectores.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSectores.map(sectorId => {
                          const sector = sectorsById.get(sectorId);

                          return (
                            <Badge
                              key={sectorId}
                              variant="outline"
                              className="bg-accent border-border"
                            >
                              {sector?.nombre || sectorId}
                              <Button
                                className="ml-2"
                                onClick={() =>
                                  handleSectorChange(sectorId, false)
                                }
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Nichos</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedSectores.length > 0
                            ? 'Se muestran los nichos de los sectores seleccionados'
                            : 'Filtra por nichos específicos'}
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-28 rounded-xl border border-border bg-background p-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {visibleNichos.map(nicho => (
                          <div
                            key={nicho.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={String(nicho.id)}
                              checked={selectedNichos.includes(
                                String(nicho.id)
                              )}
                              onCheckedChange={checked =>
                                handleNichoChange(
                                  String(nicho.id),
                                  checked as boolean
                                )
                              }
                              className="text-primary"
                            />
                            <Label
                              htmlFor={String(nicho.id)}
                              className="cursor-pointer text-xs font-medium"
                            >
                              {nicho.nombre}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {selectedNichos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedNichos.map(nichoId => {
                          const nicho = nichos.find(
                            item => String(item.id) === nichoId
                          );

                          return (
                            <Badge
                              key={nichoId}
                              variant="outline"
                              className="bg-accent border-border"
                            >
                              {nicho?.nombre || nichoId}
                              <Button
                                className="ml-2"
                                onClick={() =>
                                  handleNichoChange(nichoId, false)
                                }
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                        <Hash className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Medidores Específicos</h4>
                        <p className="text-sm text-muted-foreground">
                          Agrega números de serie específicos
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Número de serie del medidor..."
                        value={medidorInput}
                        onChange={e => setMedidorInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMedidor();
                          }
                        }}
                        className="flex-1 border-border"
                      />
                      <Button
                        type="button"
                        onClick={handleAddMedidor}
                        disabled={!medidorInput.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Agregar
                      </Button>
                    </div>

                    {selectedMedidores.length > 0 && (
                      <div className="mt-4 rounded-xl border border-border bg-background p-4">
                        <h5 className="mb-3 font-medium">
                          Medidores agregados ({selectedMedidores.length}):
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedidores.map(medidor => (
                            <div
                              key={medidor}
                              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                            >
                              <span className="text-sm font-mono">
                                {medidor}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMedidor(medidor)}
                                className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
