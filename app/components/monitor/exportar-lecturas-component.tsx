import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { Card, CardContent } from '~/components/ui/card';
import React, { useEffect, useState } from 'react';
import {
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { Select } from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import {
  Download,
  Loader2,
  Filter,
  X,
  Calendar,
  MapPin,
  Hash,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Eraser,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import api from '~/lib/api';
import { type Periodo, type Sector } from '~/types/monitor';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';

interface ExportarLecturasComponentProps {
  periodos: Periodo[];
  sectores: Sector[];
  activePeriodoId: number | null;
  error: Error | null;
}

export default function ExportarLecturasComponent({
  periodos,
  sectores,
  activePeriodoId,
  error,
}: ExportarLecturasComponentProps) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSectores, setSelectedSectores] = useState<string[]>([]);
  const [selectedNichos, _setSelectedNichos] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<number[]>([]);
  const [selectedMedidores, setSelectedMedidores] = useState<string[]>([]);
  const [medidorInput, setMedidorInput] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [estadoNormal, setEstadoNormal] = useState<boolean>(false);
  const [estadoFacturado, setEstadoFacturado] = useState<boolean>(false);

  const pageBreadcrumbs = [
    { label: 'Monitor' },
    { label: 'Exportar Lecturas' },
  ];

  // Efecto para establecer el período activo por defecto
  useEffect(() => {
    if (periodos && periodos.length > 0 && !selectedPeriodo) {
      const periodoActivo =
        periodos.find((p) => Number(p.IdPeriodo) === Number(activePeriodoId)) ||
        periodos[0];

      if (periodoActivo) {
        setSelectedPeriodo(periodoActivo);
      }
    }
  }, [periodos, activePeriodoId, selectedPeriodo]);

  // Función para manejar la selección de sectores
  const handleSectorChange = (sectorId: string, checked: boolean) => {
    if (checked) {
      setSelectedSectores([...selectedSectores, sectorId]);
    } else {
      setSelectedSectores(selectedSectores.filter((id) => id !== sectorId));
    }
  };

  // Función para manejar la selección de estados
  const handleEstadoChange = (estado: number, checked: boolean) => {
    if (estado === 2) {
      setEstadoNormal(checked);
    } else if (estado === 5) {
      setEstadoFacturado(checked);
    }

    // Actualizar la lista de estados seleccionados
    if (checked) {
      setSelectedEstados([...selectedEstados, estado]);
    } else {
      setSelectedEstados(selectedEstados.filter((e) => e !== estado));
    }
  };

  // Función para agregar un medidor a la lista
  const handleAddMedidor = () => {
    if (medidorInput.trim()) {
      setSelectedMedidores([...selectedMedidores, medidorInput.trim()]);
      setMedidorInput('');
    }
  };

  // Función para eliminar un medidor de la lista
  const handleRemoveMedidor = (medidor: string) => {
    setSelectedMedidores(selectedMedidores.filter((m) => m !== medidor));
  };

  // Función para limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setSelectedSectores([]);
    setSelectedEstados([]);
    setSelectedMedidores([]);
    setEstadoNormal(false);
    setEstadoFacturado(false);
    setMedidorInput('');
  };

  // Función para exportar las lecturas
  const handleExportar = async () => {
    if (!selectedPeriodo) {
      toast.error('Debe seleccionar un período');
      return;
    }

    try {
      setIsExporting(true);

      // Construir los parámetros de la consulta
      const params = new URLSearchParams();

      // Período (obligatorio)
      params.append('periodo', selectedPeriodo.IdPeriodo);

      // Sectores (opcional)
      if (selectedSectores.length > 0) {
        // Usar la descripción del sector directamente, sin codificación adicional
        params.append('sectores', selectedSectores.join(','));
      }

      // Nichos (opcional)
      if (selectedNichos.length > 0) {
        params.append('nichos', selectedNichos.join(','));
      }

      // Estados (opcional)
      if (selectedEstados.length > 0) {
        params.append('estados', selectedEstados.join(','));
      }

      // Medidores (opcional)
      if (selectedMedidores.length > 0) {
        params.append('medidores', selectedMedidores.join(','));
      }

      // Realizar la petición
      const response = await api.get('/exportar-lecturas-excel', {
        params,
        responseType: 'blob', // Importante para descargar archivos
      });

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart]),
      );
      const link = document.createElement('a');
      link.href = url;

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Lecturas_${
        selectedPeriodo.DescripcionPeriodo
      }_${selectedSectores.join(',')}_${selectedNichos.join(
        ',',
      )}_${selectedEstados.join(',')}_${selectedMedidores.join(
        ',',
      )}_${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Archivo exportado correctamente');
    } catch (_error) {
      toast.error('Error al exportar lecturas');
    } finally {
      setIsExporting(false);
    }
  };

  // Manejo de errores
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar datos: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasFilters =
    selectedSectores.length > 0 ||
    selectedEstados.length > 0 ||
    selectedMedidores.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950/30">
      <div className="container mx-auto p-4 space-y-6">
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Modern Header */}
        <div className="flex items-center gap-4 py-6 border-b border-slate-200 dark:border-slate-700">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-100 dark:to-green-100 bg-clip-text text-transparent">
              Exportar Lecturas
            </h1>
            <p className="text-lg text-muted-foreground">
              Configura tus filtros y exporta las lecturas de medidores en
              formato Excel para análisis detallado
            </p>
          </div>
        </div>

        {/* Main Control Panel */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            {/* Período Selection - Required */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                    Período de Exportación
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el período para generar el reporte
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Requerido
                </Badge>
              </div>

              <div className="max-w-md">
                <Select
                  value={selectedPeriodo?.IdPeriodo || ''}
                  onValueChange={(value) => {
                    const periodo = periodos.find((p) => p.IdPeriodo === value);
                    setSelectedPeriodo(periodo || null);
                  }}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Seleccionar Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos?.map((periodo) => (
                      <SelectItem
                        key={periodo.IdPeriodo}
                        value={periodo.IdPeriodo}
                        className="truncate"
                      >
                        {periodo.DescripcionPeriodo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Action */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros Opcionales
                  {isFiltersOpen ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>

                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLimpiarFiltros}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>

              <Button
                onClick={handleExportar}
                disabled={!selectedPeriodo || isExporting}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar a Excel
                  </>
                )}
              </Button>
            </div>

            {/* Optional Filters - Collapsible */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent>
                <div className="border-t pt-6 space-y-6">
                  {/* Sectores Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          Sectores
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Filtra por sectores específicos
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-32 rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sectores?.map((sector) => (
                          <div
                            key={sector.sectorId}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={sector.sectorId}
                              checked={selectedSectores.includes(
                                sector.descripcion,
                              )}
                              onCheckedChange={(checked) =>
                                handleSectorChange(
                                  sector.descripcion,
                                  checked as boolean,
                                )
                              }
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor={sector.sectorId}
                              className="cursor-pointer text-sm font-medium"
                            >
                              {sector.descripcion}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {selectedSectores.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSectores.map((sectorId) => {
                          const sector = sectores?.find(
                            (s) => s.sectorId === sectorId,
                          );
                          return (
                            <Badge
                              key={sectorId}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                            >
                              {sector?.descripcion || sectorId}
                              <button
                                className="ml-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                                onClick={() =>
                                  handleSectorChange(sectorId, false)
                                }
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Estados Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          Estados de Lectura
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Filtra por estado de procesamiento
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="estado-normal"
                          checked={estadoNormal}
                          onCheckedChange={(checked) =>
                            handleEstadoChange(2, checked as boolean)
                          }
                          className="text-purple-600"
                        />
                        <Label
                          htmlFor="estado-normal"
                          className="cursor-pointer font-medium"
                        >
                          Lectura Normal
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="estado-facturado"
                          checked={estadoFacturado}
                          onCheckedChange={(checked) =>
                            handleEstadoChange(5, checked as boolean)
                          }
                          className="text-purple-600"
                        />
                        <Label
                          htmlFor="estado-facturado"
                          className="cursor-pointer font-medium"
                        >
                          Facturado
                        </Label>
                      </div>
                    </div>

                    {selectedEstados.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedEstados.map((estado) => (
                          <Badge
                            key={estado}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                          >
                            {estado === 2 ? 'Lectura Normal' : 'Facturado'}
                            <button
                              className="ml-2 text-purple-500 hover:text-purple-700 dark:hover:text-purple-300"
                              onClick={() => handleEstadoChange(estado, false)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Medidores Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          Medidores Específicos
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Agrega números de serie específicos
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Ingrese número de serie del medidor"
                        value={medidorInput}
                        onChange={(e) => setMedidorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMedidor();
                          }
                        }}
                        className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                      <Button
                        onClick={handleAddMedidor}
                        disabled={!medidorInput.trim()}
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
                      >
                        Agregar
                      </Button>
                    </div>

                    {selectedMedidores.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedMedidores.map((medidor, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700 font-mono"
                          >
                            {medidor}
                            <button
                              className="ml-2 text-green-500 hover:text-green-700 dark:hover:text-green-300"
                              onClick={() => handleRemoveMedidor(medidor)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
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
