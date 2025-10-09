import { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Play,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';

// Interfaces para los nuevos endpoints
interface EstadoProcesamiento {
  periodoActivo: string;
  registrosPendientes: number;
  fechaConsulta: string;
  estado: string;
}

interface RegistrosPendientes {
  registrosPendientes: number;
  mensaje: string;
}

interface DetalleProcesamientoItem {
  numeroSerie: string;
  tarifa: string;
  lecturaAnteriorKwh: number;
  consumoEnergiaKwh: number;
  usuarioCarga: string;
  estado: string;
  mensaje: string;
}

interface ProcesamientoResult {
  exitoso: boolean;
  mensaje: string;
  registrosActualizados: number;
  fechaProcesamiento: string;
  periodo: string;
  detalles: DetalleProcesamientoItem[];
}

export default function ImportarLecturasComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);
  const [showColumnInfo, setShowColumnInfo] = useState(false);
  
  // Estados para los nuevos endpoints
  const [estadoProcesamiento, setEstadoProcesamiento] = useState<EstadoProcesamiento | null>(null);
  const [registrosPendientes, setRegistrosPendientes] = useState<RegistrosPendientes | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [processingBT, setProcessingBT] = useState(false);
  const [procesamientoResult, setProcesamientoResult] = useState<ProcesamientoResult | null>(null);

  const pageBreadcrumbs = [
    { label: 'Monitor' },
    { label: 'Importar Lecturas' }
  ];

  // Columnas requeridas del Excel
  const REQUIRED_COLUMNS = [
    'Activo',
    'Medidor',
    'Periodo',
    'Fecha de Emisión',
    'Tarifa',
    'Fecha Última Lectura',
    'Última Lectura (kWh)',
    'Fecha Lectura Anterior',
    'Lectura Anterior (kWh)',
    'Consumo Energía (kWh)',
    'Demanda Máx. Suministrada (kW)',
    'Demanda Máx. Hora Punta (kW)',
    'Demanda Máx. Potencia Leída Punta (kW)',
    'Cargo Fijo',
    'Servicio Público Base',
    'Tramo Fondo Estabilización',
    'Recargo Fondo Estabilización',
    'Servicio Público FET',
    'Adm. del Servicio',
    'Cobro por Transporte de Electricidad',
    'Cobro por Energía',
    'Cobro Compras de Potencia',
    'Tramo de Equidad Residencial',
    'Cobro por Potencia Base',
    'Cobro por Electricidad Consumida',
    'Límite de Invierno',
    'Cobro Potencia Adicional',
    'Cobro Potencia Adicional de Invierno',
    'Cobro por Electricidad Consumida Sobre Límite',
    'Promedio D.M. Suministrada (kW)',
    'Cobro D.M. Suministrada',
    'Demanda en Horas de Punta',
    'Cobro Demanda en Horas de Punta',
    'Cobro por Demanda Máxima de Potencia',
    'Presencia en Punta',
    'Potencia Contratada (kW)',
    'Cobro Potencia Contratada',
    'Prom. D.M. Pot. Leída en Punta (kW)',
    'Cobro D.M. Pot. Leída en Punta',
    'Factor de Potencia Medio',
    'Multa Factor de Potencia',
    'Total Monto Neto',
    'Total I.V.A.',
    'Monto Exento',
    'Total a Pagar'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      const errorMsg = 'El archivo debe ser un Excel (.xlsx o .xls)';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'El archivo no debe superar los 10MB';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    return true;
  };

  const validateColumns = (
    headers: any[]
  ): { valid: boolean; missing: string[] } => {
    const headerStrings = headers.map(h => String(h).trim());
    const missing = REQUIRED_COLUMNS.filter(
      col => !headerStrings.includes(col)
    );
    return {
      valid: missing.length === 0,
      missing
    };
  };

  const validateExcelStructure = async (file: File) => {
    setIsValidating(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Obtener la primera hoja
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Los encabezados están en la fila 3 (índice 2)
      const headers = jsonData[2] as any[];

      // Validar que el archivo contenga las columnas requeridas
      const validation = validateColumns(headers);

      if (!validation.valid) {
        const errorMsg = `El archivo no contiene todas las columnas requeridas. Faltan: ${validation.missing.slice(0, 5).join(', ')}${validation.missing.length > 5 ? ` y ${validation.missing.length - 5} más` : ''}`;
        setError(errorMsg);
        toast.error(errorMsg);
        setIsValidFile(false);
        setFile(null);
      } else {
        // Validar períodos si hay datos y estado disponible
        if (estadoProcesamiento && jsonData.length > 3) {
          const dataRows = jsonData.slice(3); // Datos desde la fila 4
          const periodoColumnIndex = headers.findIndex(h => String(h).trim() === 'Periodo');
          
          if (periodoColumnIndex !== -1) {
            const periodsInFile = new Set();
            const periodValidationErrors = [];
            
            for (let i = 0; i < Math.min(dataRows.length, 10); i++) { // Validar solo las primeras 10 filas para rendimiento
              const row = dataRows[i] as any[];
              if (row[periodoColumnIndex]) {
                const filePeriod = String(row[periodoColumnIndex]).trim();
                periodsInFile.add(filePeriod);
                
                // Normalizar período del archivo para comparación
                const normalizedFilePeriod = filePeriod.replace('-', '');
                const expectedPeriod = estadoProcesamiento.periodoActivo;
                
                if (normalizedFilePeriod !== expectedPeriod) {
                  periodValidationErrors.push({
                    row: i + 4, // +4 porque empezamos desde la fila 4 del Excel
                    found: filePeriod,
                    expected: expectedPeriod
                  });
                }
              }
            }
            
            if (periodValidationErrors.length > 0) {
              const errorMsg = `Error de período detectado: Se encontró "${periodValidationErrors[0].found}" pero se esperaba "${periodValidationErrors[0].expected}". Verifica que el período en el Excel coincida con el período activo del sistema.`;
              setError(errorMsg);
              toast.error(errorMsg);
              setIsValidFile(false);
              setFile(null);
              return;
            }
          }
        }
        
        setIsValidFile(true);
        toast.success('Archivo válido - listo para cargar');
      }
    } catch (err) {
      console.error('Error al validar archivo:', err);
      const errorMsg =
        'Error al validar el archivo Excel. Verifica que el formato sea correcto.';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsValidFile(false);
      setFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      validateExcelStructure(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];

    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      validateExcelStructure(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setIsValidFile(false);
  };

  const handleImportar = async () => {
    if (!file) {
      toast.error('No hay archivo seleccionado');
      return;
    }

    try {
      setIsImporting(true);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const ENERLINK_API_URL = import.meta.env.VITE_API_URL;
      const baseUrl = ENERLINK_API_URL || 'http://192.168.1.139:8081/api';
      const url = `${baseUrl}/upload`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.mensaje || 'Error al cargar el archivo';
        toast.error(errorMessage);
        return;
      }

      const mensaje = data?.mensaje || 'Archivo cargado correctamente';
      toast.success(mensaje);
      handleRemoveFile();
    } catch (error: any) {
      console.error('Error al cargar archivo:', error);
      const errorMessage = error.message || 'Error al cargar el archivo';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  // Función para obtener estado de procesamiento
  const fetchEstadoProcesamiento = async () => {
    setLoadingEstado(true);
    try {
      const token = localStorage.getItem('token');
      const VITE_API_URL = import.meta.env.VITE_API_URL;
      const baseUrl = VITE_API_URL || 'http://192.168.1.139:8081/api';
      const url = `${baseUrl}/estado-procesamiento`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.mensaje || 'Error al obtener estado');
      }

      setEstadoProcesamiento(data);
    } catch (error: any) {
      console.error('Error al obtener estado:', error);
      toast.error(error.message || 'Error al obtener estado de procesamiento');
    } finally {
      setLoadingEstado(false);
    }
  };

  // Función para obtener registros pendientes
  const fetchRegistrosPendientes = async () => {
    setLoadingRegistros(true);
    try {
      const token = localStorage.getItem('token');
      const VITE_API_URL = import.meta.env.VITE_API_URL;
      const baseUrl = VITE_API_URL || 'http://192.168.1.139:8081/api';
      const url = `${baseUrl}/registros-pendientes`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.mensaje || 'Error al obtener registros');
      }

      setRegistrosPendientes(data);
      toast.success(data.mensaje || 'Registros obtenidos correctamente');
    } catch (error: any) {
      console.error('Error al obtener registros:', error);
      toast.error(error.message || 'Error al obtener registros pendientes');
    } finally {
      setLoadingRegistros(false);
    }
  };

  // Función para procesar BT1-BT2
  const procesarBT1BT2 = async () => {
    setProcessingBT(true);
    try {
      const token = localStorage.getItem('token');
      const ENERLINK_API_URL = import.meta.env.VITE_API_URL;
      const baseUrl = ENERLINK_API_URL || 'http://192.168.1.139:8081/Enerlova';
      const url = `${baseUrl}/procesar-bt1-bt2`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.mensaje || 'Error al procesar');
      }

      setProcesamientoResult(data);
      toast.success(data.mensaje || 'Procesamiento completado exitosamente');
      
      // Refrescar estado después del procesamiento
      fetchEstadoProcesamiento();
    } catch (error: any) {
      console.error('Error al procesar:', error);
      toast.error(error.message || 'Error al procesar BT1-BT2');
    } finally {
      setProcessingBT(false);
    }
  };

  // Cargar estado inicial
  useEffect(() => {
    fetchEstadoProcesamiento();
  }, []);

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title='Importar Lecturas'
          description='Carga un archivo Excel con las lecturas de medidores para importarlas al sistema'
        />

        {/* Estado de Procesamiento */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='border-slate-200/60 dark:border-slate-700/60'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base font-medium text-slate-900 dark:text-slate-100'>
                  Estado de Procesamiento
                </CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={fetchEstadoProcesamiento}
                  disabled={loadingEstado}
                >
                  <RefreshCw className={`h-4 w-4 ${loadingEstado ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {loadingEstado ? (
                <div className='flex items-center justify-center py-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-sky-600' />
                </div>
              ) : estadoProcesamiento ? (
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Período Activo:</span>
                    <Badge variant='outline' className='font-mono'>
                      {estadoProcesamiento.periodoActivo}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Registros Pendientes:</span>
                    <Badge 
                      variant={estadoProcesamiento.registrosPendientes > 0 ? 'destructive' : 'default'}
                      className='font-mono'
                    >
                      {estadoProcesamiento.registrosPendientes}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Estado:</span>
                    <Badge 
                      variant={estadoProcesamiento.registrosPendientes > 0 ? 'secondary' : 'default'}
                      className='text-xs'
                    >
                      {estadoProcesamiento.estado}
                    </Badge>
                  </div>
                  <div className='text-xs text-muted-foreground pt-2 border-t'>
                    Última consulta: {new Date(estadoProcesamiento.fechaConsulta).toLocaleString()}
                  </div>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No se pudo cargar el estado</p>
              )}
            </CardContent>
          </Card>

          <Card className='border-slate-200/60 dark:border-slate-700/60'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base font-medium text-slate-900 dark:text-slate-100'>
                Acciones de Procesamiento
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                onClick={fetchRegistrosPendientes}
                disabled={loadingRegistros}
                variant='outline'
                className='w-full'
              >
                {loadingRegistros ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-sky-600 mr-2' />
                ) : (
                  <Info className='h-4 w-4 mr-2' />
                )}
                Consultar Registros Pendientes
              </Button>
              
              <Button
                onClick={procesarBT1BT2}
                //disabled={processingBT || (estadoProcesamiento?.registrosPendientes === 0)}
                className='w-full bg-orange-600 hover:bg-orange-700 text-white'
              >
                {processingBT ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
                ) : (
                  <Play className='h-4 w-4 mr-2' />
                )}
                Procesar BT1-BT2
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mostrar resultado de registros pendientes */}
        {registrosPendientes && (
          <Alert className='border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'>
            <Info className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            <AlertTitle className='text-blue-900 dark:text-blue-100'>
              Registros Pendientes
            </AlertTitle>
            <AlertDescription className='text-blue-800 dark:text-blue-200'>
              {registrosPendientes.mensaje}
            </AlertDescription>
          </Alert>
        )}

        {/* Mostrar resultado del procesamiento */}
        {procesamientoResult && (
          <Card className='border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'>
            <CardHeader>
              <CardTitle className='text-green-900 dark:text-green-100 flex items-center gap-2'>
                <CheckCircle2 className='h-5 w-5' />
                Resultado del Procesamiento
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-700 dark:text-green-300'>
                    {procesamientoResult.registrosActualizados}
                  </div>
                  <div className='text-xs text-muted-foreground'>Registros Actualizados</div>
                </div>
                <div className='text-center'>
                  <div className='text-sm font-medium text-green-700 dark:text-green-300'>
                    {procesamientoResult.periodo}
                  </div>
                  <div className='text-xs text-muted-foreground'>Período</div>
                </div>
                <div className='text-center'>
                  <Badge variant={procesamientoResult.exitoso ? 'default' : 'destructive'}>
                    {procesamientoResult.exitoso ? 'Exitoso' : 'Falló'}
                  </Badge>
                  <div className='text-xs text-muted-foreground'>Estado</div>
                </div>
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(procesamientoResult.fechaProcesamiento).toLocaleString()}
                  </div>
                  <div className='text-xs text-muted-foreground'>Fecha</div>
                </div>
              </div>
              
              <div className='text-sm text-green-800 dark:text-green-200'>
                {procesamientoResult.mensaje}
              </div>
              
              {procesamientoResult.detalles && procesamientoResult.detalles.length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-sm font-medium mb-2'>Detalles del procesamiento:</h4>
                  <ScrollArea className='h-32 rounded border'>
                    <div className='p-2 space-y-2'>
                      {procesamientoResult.detalles.map((detalle, idx) => (
                        <div key={idx} className='text-xs bg-white dark:bg-slate-900 p-2 rounded border'>
                          <div className='grid grid-cols-2 gap-2'>
                            <span><strong>Serie:</strong> {detalle.numeroSerie}</span>
                            <span><strong>Tarifa:</strong> {detalle.tarifa}</span>
                            <span><strong>Lectura Ant.:</strong> {detalle.lecturaAnteriorKwh} kWh</span>
                            <span><strong>Consumo:</strong> {detalle.consumoEnergiaKwh} kWh</span>
                            <span><strong>Usuario:</strong> {detalle.usuarioCarga}</span>
                            <span><strong>Estado:</strong> {detalle.estado}</span>
                          </div>
                          {detalle.mensaje && (
                            <div className='mt-1 text-muted-foreground'>{detalle.mensaje}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setProcesamientoResult(null)}
                className='w-full mt-2'
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Información de columnas requeridas */}
        <Alert className='border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20'>
          <Info className='h-4 w-4 text-sky-600 dark:text-sky-400' />
          <AlertTitle className='text-sky-900 dark:text-sky-100'>
            Formato del archivo Excel
          </AlertTitle>
          <AlertDescription className='text-sky-800 dark:text-sky-200'>
            <div className='space-y-2'>
              <p>
                El archivo debe contener las columnas en la <strong>fila 3</strong>{' '}
                y los datos desde la <strong>fila 4</strong>.
              </p>
              {estadoProcesamiento && (
                <div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-2'>
                  <p className='text-sm font-medium text-amber-800 dark:text-amber-200 mb-1'>
                    ⚠️ Formato de Período Importante:
                  </p>
                  <p className='text-xs text-amber-700 dark:text-amber-300'>
                    El período en el Excel debe coincidir exactamente con: <strong>{estadoProcesamiento.periodoActivo}</strong>
                  </p>
                  <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
                    Formatos aceptados: {estadoProcesamiento.periodoActivo}, {estadoProcesamiento.periodoActivo.slice(0,2)}-{estadoProcesamiento.periodoActivo.slice(2)}
                  </p>
                </div>
              )}
              <Collapsible open={showColumnInfo} onOpenChange={setShowColumnInfo}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='p-0 h-auto text-sky-700 dark:text-sky-300 hover:bg-transparent'
                  >
                    {showColumnInfo ? 'Ocultar' : 'Ver'} columnas requeridas (
                    {REQUIRED_COLUMNS.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='mt-2'>
                  <ScrollArea className='h-32 rounded border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 p-2'>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-1 text-xs'>
                      {REQUIRED_COLUMNS.map((col, idx) => (
                        <div key={idx} className='text-slate-700 dark:text-slate-300'>
                          • {col}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant='destructive' className='border-red-200 dark:border-red-800'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error de Validación</AlertTitle>
            <AlertDescription className='space-y-2'>
              <div>{error}</div>
              {error.includes('período') && estadoProcesamiento && (
                <div className='mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800'>
                  <p className='text-sm font-medium text-red-800 dark:text-red-200'>
                    💡 Solución:
                  </p>
                  <p className='text-xs text-red-700 dark:text-red-300 mt-1'>
                    Asegúrate de que la columna "Periodo" en tu Excel contenga exactamente: <strong>{estadoProcesamiento.periodoActivo}</strong>
                  </p>
                  <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                    Si tu archivo tiene formato "MM-YYYY", cámbialo a "MMYYYY" (sin guión).
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className='border-slate-200/60 dark:border-slate-700/60'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center'>
                <Upload className='w-4 h-4 text-sky-600 dark:text-sky-400' />
              </div>
              <div className='flex-1'>
                <CardTitle className='text-slate-900 dark:text-slate-100'>
                  Cargar Archivo
                </CardTitle>
                <p className='text-sm text-muted-foreground mt-1'>
                  Sube un archivo Excel (.xlsx, .xls) con las lecturas
                </p>
              </div>
              {file && (
                <Badge
                  variant='outline'
                  className='bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700'
                >
                  <CheckCircle2 className='w-3 h-3 mr-1' />
                  Archivo cargado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
                  ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 scale-[1.02]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600'
                  }
                `}
              >
                <div className='flex flex-col items-center gap-4'>
                  <div
                    className={`rounded-full p-4 transition-colors ${
                      isDragging
                        ? 'bg-sky-100 dark:bg-sky-900/50'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <Upload
                      className={`h-8 w-8 ${
                        isDragging
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <p className='text-lg font-medium text-slate-900 dark:text-slate-100'>
                      Arrastra tu archivo Excel aquí
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <input
                    type='file'
                    accept='.xlsx,.xls'
                    onChange={handleFileInput}
                    className='hidden'
                    id='file-upload'
                  />
                  <Button
                    asChild
                    variant='outline'
                    className='border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30'
                  >
                    <label htmlFor='file-upload' className='cursor-pointer'>
                      <FileSpreadsheet className='w-4 h-4 mr-2' />
                      Seleccionar archivo
                    </label>
                  </Button>
                  <p className='text-xs text-muted-foreground'>
                    Formatos aceptados: .xlsx, .xls • Tamaño máximo: 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-4 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800'>
                <div className='w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center'>
                  <FileSpreadsheet className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-slate-900 dark:text-slate-100'>
                    {file.name}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleRemoveFile}
                  className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isValidating && (
          <Card className='border-slate-200/60 dark:border-slate-700/60'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-center py-12'>
                <div className='text-center space-y-4'>
                  <div className='relative'>
                    <div className='animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-sky-600 dark:border-t-sky-400 mx-auto' />
                  </div>
                  <div>
                    <p className='font-medium text-slate-900 dark:text-slate-100'>
                      Validando archivo...
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Verificando estructura y columnas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {file && isValidFile && !isValidating && (
          <div className='flex justify-end'>
            <Button
              onClick={handleImportar}
              disabled={isImporting}
              className='bg-sky-600 hover:bg-sky-700 text-white'
            >
              {isImporting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
                  Cargando...
                </>
              ) : (
                <>
                  <CheckCircle2 className='w-4 h-4 mr-2' />
                  Cargar Archivo
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
