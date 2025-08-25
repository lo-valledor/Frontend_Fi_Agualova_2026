import {
  AlertCircle,
  Calendar,
  CheckSquare,
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
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ScrollArea } from '~/components/ui/scroll-area';
import api from '~/lib/api';
import { type Periodo, type Sector } from '~/types/monitor';

import { ModernHeader } from '../shared/modern-header';

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
  error
}: ExportarLecturasComponentProps) {
  const [selectedPeriodos, setSelectedPeriodos] = useState<Periodo[]>([]);
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
    { label: 'Exportar Lecturas' }
  ];

  // Efecto para establecer el período activo por defecto
  useEffect(() => {
    if (periodos && periodos.length > 0 && selectedPeriodos.length === 0) {
      const periodoActivo =
        periodos.find(p => Number(p.IdPeriodo) === Number(activePeriodoId)) ||
        periodos[0];

      if (periodoActivo) {
        setSelectedPeriodos([periodoActivo]);
      }
    }
  }, [periodos, activePeriodoId, selectedPeriodos.length]);

  // Función para manejar la selección de períodos
  const handlePeriodoChange = (periodo: Periodo, checked: boolean) => {
    if (checked) {
      setSelectedPeriodos([...selectedPeriodos, periodo]);
    } else {
      setSelectedPeriodos(
        selectedPeriodos.filter(p => p.IdPeriodo !== periodo.IdPeriodo)
      );
    }
  };

  // Función para manejar la selección de sectores
  const handleSectorChange = (sectorId: string, checked: boolean) => {
    if (checked) {
      setSelectedSectores([...selectedSectores, sectorId]);
    } else {
      setSelectedSectores(selectedSectores.filter(id => id !== sectorId));
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
      setSelectedEstados(selectedEstados.filter(e => e !== estado));
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
    setSelectedMedidores(selectedMedidores.filter(m => m !== medidor));
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
    if (selectedPeriodos.length === 0) {
      toast.error('Debe seleccionar al menos un período');
      return;
    }

    try {
      setIsExporting(true);

      // Construir los parámetros de la consulta
      const params = new URLSearchParams();

      // Períodos (obligatorio) - separados por comas
      const periodosIds = selectedPeriodos.map(p => p.IdPeriodo).join(',');
      params.append('periodo', periodosIds);

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
        responseType: 'blob' // Importante para descargar archivos
      });

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart])
      );
      const link = document.createElement('a');
      link.href = url;

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      const periodosDescripcion = selectedPeriodos
        .map(p => p.DescripcionPeriodo)
        .join('-');
      let filename = `Lecturas_${
        periodosDescripcion
      }_${selectedSectores.join(',')}_${selectedNichos.join(
        ','
      )}_${selectedEstados.join(',')}_${selectedMedidores.join(
        ','
      )}_${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
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
    } catch (error) {
      console.error('Error exporting readings:', error);
      toast.error('Error al exportar lecturas');
    } finally {
      setIsExporting(false);
    }
  };

  // Manejo de errores
  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title='Exportar Lecturas'
          description='Exporta lecturas de medidores en formato Excel con filtros
              personalizados'
        />

        {/* Main Control Panel */}
        <Card className='border-slate-200/60 dark:border-slate-700/60'>
          <CardContent className='p-4 space-y-4'>
            {/* Períodos Selection - Required */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center'>
                  <Calendar className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                    Períodos de Exportación
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Selecciona uno o más períodos para generar el reporte
                  </p>
                </div>
                <Badge variant='destructive' className='text-xs'>
                  Requerido
                </Badge>
              </div>

              <ScrollArea className='h-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {periodos?.map(periodo => (
                    <div
                      key={periodo.IdPeriodo}
                      className='flex items-center gap-2'
                    >
                      <Checkbox
                        id={periodo.IdPeriodo}
                        checked={selectedPeriodos.some(
                          p => p.IdPeriodo === periodo.IdPeriodo
                        )}
                        onCheckedChange={checked =>
                          handlePeriodoChange(periodo, checked as boolean)
                        }
                        className='text-sky-600'
                      />
                      <Label
                        htmlFor={periodo.IdPeriodo}
                        className='cursor-pointer text-xs font-medium'
                      >
                        {periodo.DescripcionPeriodo}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedPeriodos.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Períodos seleccionados ({selectedPeriodos.length}):
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {selectedPeriodos.map(periodo => (
                      <Badge
                        key={periodo.IdPeriodo}
                        variant='outline'
                        className='bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-700'
                      >
                        {periodo.DescripcionPeriodo}
                        <button
                          className='ml-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300'
                          onClick={() => handlePeriodoChange(periodo, false)}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export Action */}
            <div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700'>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <Filter className='w-4 h-4 mr-2' />
                  Filtros Opcionales
                  {isFiltersOpen ? (
                    <ChevronUp className='w-4 h-4 ml-2' />
                  ) : (
                    <ChevronDown className='w-4 h-4 ml-2' />
                  )}
                </Button>

                {hasFilters && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleLimpiarFiltros}
                    className='text-slate-600 hover:text-slate-700'
                  >
                    <Eraser className='w-4 h-4 mr-2' />
                    Limpiar Filtros
                  </Button>
                )}
              </div>

              <Button
                onClick={handleExportar}
                disabled={selectedPeriodos.length === 0 || isExporting}
                className='bg-sky-600 hover:bg-sky-700 text-white'
              >
                {isExporting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className='w-4 h-4 mr-2' />
                    Exportar a Excel
                  </>
                )}
              </Button>
            </div>

            {/* Optional Filters - Collapsible */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent>
                <div className='border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4'>
                  {/* Sectores Filter */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center'>
                        <MapPin className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      </div>
                      <div>
                        <h4 className='font-medium text-slate-900 dark:text-slate-100'>
                          Sectores
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          Filtra por sectores específicos
                        </p>
                      </div>
                    </div>

                    <ScrollArea className='h-28 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        {sectores?.map(sector => (
                          <div
                            key={sector.sectorId}
                            className='flex items-center gap-2'
                          >
                            <Checkbox
                              id={sector.sectorId}
                              checked={selectedSectores.includes(
                                sector.descripcion
                              )}
                              onCheckedChange={checked =>
                                handleSectorChange(
                                  sector.descripcion,
                                  checked as boolean
                                )
                              }
                              className='text-blue-600'
                            />
                            <Label
                              htmlFor={sector.sectorId}
                              className='cursor-pointer text-xs font-medium'
                            >
                              {sector.descripcion}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {selectedSectores.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {selectedSectores.map(sectorId => {
                          const sector = sectores?.find(
                            s => s.sectorId === sectorId
                          );
                          return (
                            <Badge
                              key={sectorId}
                              variant='outline'
                              className='bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                            >
                              {sector?.descripcion || sectorId}
                              <button
                                className='ml-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300'
                                onClick={() =>
                                  handleSectorChange(sectorId, false)
                                }
                              >
                                <X className='w-3 h-3' />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Estados Filter */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center'>
                        <CheckSquare className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      </div>
                      <div>
                        <h4 className='font-medium text-slate-900 dark:text-slate-100'>
                          Estados de Lectura
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          Filtra por estado de procesamiento
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700'>
                      <div className='flex items-center space-x-3'>
                        <Checkbox
                          id='estado-normal'
                          checked={estadoNormal}
                          onCheckedChange={checked =>
                            handleEstadoChange(2, checked as boolean)
                          }
                          className='text-sky-600'
                        />
                        <Label
                          htmlFor='estado-normal'
                          className='cursor-pointer font-medium text-sm'
                        >
                          Lectura Normal
                        </Label>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <Checkbox
                          id='estado-facturado'
                          checked={estadoFacturado}
                          onCheckedChange={checked =>
                            handleEstadoChange(5, checked as boolean)
                          }
                          className='text-sky-600'
                        />
                        <Label
                          htmlFor='estado-facturado'
                          className='cursor-pointer font-medium text-sm'
                        >
                          Facturado
                        </Label>
                      </div>
                    </div>

                    {selectedEstados.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {selectedEstados.map(estado => (
                          <Badge
                            key={estado}
                            variant='outline'
                            className='bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-xs'
                          >
                            {estado === 2 ? 'Lectura Normal' : 'Facturado'}
                            <button
                              className='ml-2 text-purple-500 hover:text-purple-700 dark:hover:text-purple-300'
                              onClick={() => handleEstadoChange(estado, false)}
                            >
                              <X className='w-3 h-3' />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Medidores Filter */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center'>
                        <Hash className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      </div>
                      <div>
                        <h4 className='font-medium text-slate-900 dark:text-slate-100'>
                          Medidores Específicos
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          Agrega números de serie específicos
                        </p>
                      </div>
                    </div>

                    <div className='flex gap-3'>
                      <Input
                        type='text'
                        placeholder='Número de serie del medidor...'
                        value={medidorInput}
                        onChange={e => setMedidorInput(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            handleAddMedidor();
                          }
                        }}
                        className='flex-1 border-slate-200 dark:border-slate-700'
                      />
                      <Button
                        type='button'
                        onClick={handleAddMedidor}
                        disabled={!medidorInput.trim()}
                        className='bg-sky-600 hover:bg-sky-700 text-white'
                      >
                        Agregar
                      </Button>
                    </div>

                    {selectedMedidores.length > 0 && (
                      <div className='mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700'>
                        <h5 className='font-medium text-slate-900 dark:text-slate-100 mb-3'>
                          Medidores agregados ({selectedMedidores.length}):
                        </h5>
                        <div className='flex flex-wrap gap-2'>
                          {selectedMedidores.map((medidor, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2'
                            >
                              <span className='text-sm font-mono text-slate-700 dark:text-slate-300'>
                                {medidor}
                              </span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRemoveMedidor(medidor)}
                                className='h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                              >
                                <X className='h-3 w-3' />
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
