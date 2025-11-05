import { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Play,
  RefreshCw,
  Eye,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ModernHeader } from '~/components/shared/modern-header';
import { ResultadoProcesamientoModal } from './resultado-procesamiento-modal';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import type {
  EstadoProcesamiento,
  ProcesamientoResult,
  RegistrosPendientes,
  ValidacionLecturasPendientes
} from '~/types/monitor';

// Interfaces para los nuevos endpoints

export default function ImportarLecturasComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);
  const [showColumnInfo, setShowColumnInfo] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  // Estados para los nuevos endpoints
  const [estadoProcesamiento, setEstadoProcesamiento] =
    useState<EstadoProcesamiento | null>(null);
  const [registrosPendientes, setRegistrosPendientes] =
    useState<RegistrosPendientes | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [processingBT, setProcessingBT] = useState(false);
  const [procesamientoResult, setProcesamientoResult] =
    useState<ProcesamientoResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [validacionLecturas, setValidacionLecturas] =
    useState<ValidacionLecturasPendientes | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);
  const [showDetallesPendientes, setShowDetallesPendientes] = useState(false);

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
          const periodoColumnIndex = headers.findIndex(
            h => String(h).trim() === 'Periodo'
          );

          if (periodoColumnIndex !== -1) {
            const periodsInFile = new Set();
            const periodValidationErrors = [];

            for (let i = 0; i < Math.min(dataRows.length, 10); i++) {
              // Validar solo las primeras 10 filas para rendimiento
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
      console.error('Error al validar el archivo Excel:', err);
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
      toast.error(error.message || 'Error al procesar BT1-BT2');
    } finally {
      setProcessingBT(false);
    }
  };

  // Función para validar lecturas pendientes
  const fetchValidacionLecturasPendientes = async () => {
    setLoadingValidacion(true);
    try {
      const token = localStorage.getItem('token');
      const VITE_API_URL = import.meta.env.VITE_API_URL;
      const baseUrl = VITE_API_URL || 'http://192.168.1.139:8081/Enerlova';

      // Usar período actual si está disponible; de lo contrario, fallback a 102025
      const periodoActual = estadoProcesamiento?.periodoActivo || '102025';
      const cicloFacturable = 1; // hardcodeado por ahora

      const url = `${baseUrl}/consultar-asignacion-sectores?cicloFacturable=${cicloFacturable}&periodo=${periodoActual}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.mensaje || 'Error al validar lecturas pendientes'
        );
      }

      const esArray = Array.isArray(data);
      const sinPendientes = esArray && data.length === 0;
      const totalPendientes = esArray ? data.length : 0;

      setValidacionLecturas({
        sinPendientes,
        mensaje: sinPendientes
          ? 'No hay asignaciones pendientes por preparar'
          : 'Hay asignaciones pendientes por preparar',
        periodo: periodoActual,
        totalPendientes,
        detalles: [] // Detalles opcionales; podemos mapear si se requieren más adelante
      });

      if (!sinPendientes) {
        toast.warning(
          `Hay ${totalPendientes} asignaciones pendientes por preparar`
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al validar lecturas pendientes');
    } finally {
      setLoadingValidacion(false);
    }
  };

  // Cargar estado inicial
  useEffect(() => {
    fetchEstadoProcesamiento();
    fetchValidacionLecturasPendientes();
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-6 space-y-6'>
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title='Importar Lecturas'
          description='Carga un archivo Excel con las lecturas de medidores para importarlas al sistema'
        />

        {/* Panel de Control Principal */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Estado del Sistema */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Estado del Sistema</CardTitle>
                  <CardDescription>
                    Información del período activo y registros pendientes
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchEstadoProcesamiento}
                  disabled={loadingEstado}
                  variant='outline'
                  size='icon'
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingEstado ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEstado ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='animate-spin  h-8 w-8 border-2 border-border border-t-border' />
                </div>
              ) : estadoProcesamiento ? (
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center p-4 rounded-radius border border-border'>
                    <div className='text-2xl font-bold mb-1'>
                      {estadoProcesamiento.periodoActivo}
                    </div>
                    <div className='text-xs font-medium text-muted-foreground'>
                      Período Activo
                    </div>
                  </div>

                  <div
                    className={`text-center p-4 rounded-radius border ${
                      estadoProcesamiento.registrosPendientes > 0
                        ? 'bg-muted/50 border-border'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50'
                    }`}
                  >
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        estadoProcesamiento.registrosPendientes > 0
                          ? 'text-foreground'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {estadoProcesamiento.registrosPendientes}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        estadoProcesamiento.registrosPendientes > 0
                          ? 'text-muted-foreground'
                          : 'text-emerald-600 dark:text-emerald-500'
                      }`}
                    >
                      Pendientes
                    </div>
                  </div>

                  <div className='text-center p-4 rounded-radius bg-muted/30 border border-border'>
                    <Badge variant='secondary' className='mb-1'>
                      {estadoProcesamiento.estado}
                    </Badge>
                    <div className='text-[10px] text-muted-foreground'>
                      Estado
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-12 text-muted-foreground'>
                  No se pudo cargar el estado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Consultas y procesamiento</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                onClick={fetchRegistrosPendientes}
                disabled={loadingRegistros}
                variant='default'
                className='w-full gap-2'
              >
                {loadingRegistros ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-border border-t-transparent' />
                ) : (
                  <Info className='h-4 w-4' />
                )}
                <span>Consultar Pendientes</span>
              </Button>

              <Button
                onClick={procesarBT1BT2}
                disabled={
                  processingBT || estadoProcesamiento?.registrosPendientes === 0
                }
                variant='destructive'
                className='w-full gap-2'
              >
                {processingBT ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-border border-t-transparent' />
                ) : (
                  <Play className='h-4 w-4' />
                )}
                <span>Procesar BT1-BT2</span>
              </Button>
              {estadoProcesamiento?.registrosPendientes === 0 && (
                <p className='text-xs text-center text-muted-foreground'>
                  No hay lecturas pendientes
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notificaciones y Alertas - Minimalistas */}
        <div className='space-y-3'>
          {/* Resultado de registros pendientes */}
          {registrosPendientes && (
            <Alert>
              <Info className='h-4 w-4' />
              <AlertTitle>Registros Pendientes</AlertTitle>
              <AlertDescription>{registrosPendientes.mensaje}</AlertDescription>
            </Alert>
          )}

          {/* Resultado del procesamiento */}
          {procesamientoResult && (
            <Card className='border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full'>
                      <CheckCircle2 className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <div>
                      <CardTitle className='text-emerald-900 dark:text-emerald-100'>
                        Procesamiento Completado
                      </CardTitle>
                      <CardDescription className='text-emerald-700 dark:text-emerald-300'>
                        {procesamientoResult.mensaje}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => setProcesamientoResult(null)}
                    variant='ghost'
                    size='icon'
                    className='text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Resumen en grid */}
                <div className='grid grid-cols-3 gap-3'>
                  <div className='p-3 bg-white dark:bg-background rounded-lg border border-emerald-200 dark:border-emerald-800'>
                    <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                      {procesamientoResult.registrosActualizados}
                    </div>
                    <div className='text-xs text-emerald-600 dark:text-emerald-500 mt-0.5'>
                      Registros Actualizados
                    </div>
                  </div>
                  <div className='p-3 bg-white dark:bg-background rounded-lg border border-emerald-200 dark:border-emerald-800'>
                    <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                      {procesamientoResult.periodo}
                    </div>
                    <div className='text-xs text-emerald-600 dark:text-emerald-500 mt-0.5'>
                      Período
                    </div>
                  </div>
                  <div className='p-3 bg-white dark:bg-background rounded-lg border border-emerald-200 dark:border-emerald-800'>
                    <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                      {procesamientoResult.detalles?.length || 0}
                    </div>
                    <div className='text-xs text-emerald-600 dark:text-emerald-500 mt-0.5'>
                      Detalles Procesados
                    </div>
                  </div>
                </div>

                {/* Botón de ver detalles */}
                <Button
                  onClick={() => setShowResultModal(true)}
                  variant='outline'
                  size='sm'
                  className='w-full gap-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                >
                  <Eye className='h-4 w-4' />
                  Ver Detalles Completos
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Error de validación */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error de Validación</AlertTitle>
              <AlertDescription className='space-y-2'>
                <p>{error}</p>
                {error.includes('período') && estadoProcesamiento && (
                  <div className='mt-3 p-3 bg-destructive/10 rounded-radius border border-destructive/20'>
                    <p className='text-sm font-medium mb-2'>💡 Solución</p>
                    <p className='text-xs'>
                      Asegúrate de que la columna "Periodo" contenga:{' '}
                      <code className='px-2 py-0.5 bg-muted rounded font-mono'>
                        {estadoProcesamiento.periodoActivo}
                      </code>
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Alerta de sectores pendientes de preparación */}
          {validacionLecturas && !validacionLecturas.sinPendientes && (
            <Card className='border-red-200 dark:border-red-800 bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 shadow-lg'>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  {/* Header con icono y título */}
                  <div className='flex items-start gap-4'>
                    <div className='relative shrink-0'>
                      <div className='absolute inset-0 bg-red-500 dark:bg-red-600 rounded-full blur-xl opacity-30 animate-pulse' />
                      <div className='relative p-3 bg-red-100 dark:bg-red-900/50 rounded-full'>
                        <AlertCircle className='h-7 w-7 text-red-600 dark:text-red-400' />
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-bold text-red-900 dark:text-red-100 mb-1 flex items-center gap-2'>
                        🚫 Restricción Activa
                      </h3>
                      <p className='text-sm font-medium text-red-800 dark:text-red-200'>
                        {validacionLecturas.mensaje}
                      </p>
                    </div>
                    <Button
                      onClick={fetchValidacionLecturasPendientes}
                      disabled={loadingValidacion}
                      variant='outline'
                      size='sm'
                      className='shrink-0 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 mr-1.5 ${loadingValidacion ? 'animate-spin' : ''}`}
                      />
                      Actualizar
                    </Button>
                  </div>

                  {/* Stats Cards */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='p-4 bg-white dark:bg-background/50 rounded-lg border border-red-200 dark:border-red-800 shadow-sm'>
                      <div className='flex items-center gap-2 mb-1'>
                        <div className='h-2 w-2 rounded-full bg-orange-500 animate-pulse' />
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                          Período
                        </span>
                      </div>
                      <p className='text-2xl font-bold text-foreground'>
                        {validacionLecturas.periodo}
                      </p>
                    </div>
                    <div className='p-4 bg-white dark:bg-background/50 rounded-lg border border-red-200 dark:border-red-800 shadow-sm'>
                      <div className='flex items-center gap-2 mb-1'>
                        <div className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                          Pendientes
                        </span>
                      </div>
                      <p className='text-2xl font-bold text-red-600 dark:text-red-400'>
                        {validacionLecturas.totalPendientes}
                        <span className='text-sm font-normal text-muted-foreground ml-2'>
                          medidores
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Collapsible Detalles */}
                  <Collapsible
                    open={showDetallesPendientes}
                    onOpenChange={setShowDetallesPendientes}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full justify-between border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                      >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                          <FileSpreadsheet className='h-4 w-4' />
                          Detalles por Sector y Nicho
                          <Badge variant='secondary' className='ml-1'>
                            {validacionLecturas.detalles.length}
                          </Badge>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${showDetallesPendientes ? 'rotate-180' : ''}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className='mt-3 p-3 bg-white/80 dark:bg-background/30 rounded-lg border border-red-200 dark:border-red-800 max-h-64 overflow-y-auto'>
                        <div className='space-y-2'>
                          {validacionLecturas.detalles.map((detalle, idx) => (
                            <div
                              key={idx}
                              className='group p-3 bg-linear-to-r from-white to-red-50/50 dark:from-background dark:to-red-950/20 rounded-lg border border-red-100 dark:border-red-900 hover:shadow-md transition-all duration-200'
                            >
                              <div className='flex items-center justify-between gap-3'>
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div className='h-1.5 w-1.5 rounded-full bg-red-500' />
                                    <p className='font-semibold text-foreground text-sm truncate'>
                                      {detalle.sector}
                                    </p>
                                  </div>
                                  <p className='text-xs text-muted-foreground pl-3.5 flex items-center gap-1.5'>
                                    <span className='opacity-50'>📍</span>
                                    Nicho: {detalle.nicho}
                                  </p>
                                </div>
                                <Badge
                                  variant='destructive'
                                  className='shrink-0 shadow-sm'
                                >
                                  <span className='font-bold'>
                                    {detalle.cantidad}
                                  </span>
                                  <span className='ml-1 opacity-90 text-[10px]'>
                                    {detalle.cantidad === 1
                                      ? 'pendiente'
                                      : 'pendientes'}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Warning Box */}
                  <div className='relative overflow-hidden p-4 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700 shadow-sm'>
                    <div className='absolute top-0 right-0 w-32 h-32 bg-amber-300/10 dark:bg-amber-700/10 rounded-full -mr-16 -mt-16' />
                    <div className='relative flex gap-3'>
                      <div className='shrink-0'>
                        <div className='p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg'>
                          <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-bold text-amber-900 dark:text-amber-100 mb-1'>
                          ⚠️ Acción Requerida
                        </p>
                        <p className='text-xs text-amber-800 dark:text-amber-200 leading-relaxed'>
                          No podrás cargar archivos Excel ni procesar lecturas
                          hasta que todos los medidores estén asignados para el
                          registro de lectura. Por favor, completa la
                          preparación de todos los sectores.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de resultado del procesamiento */}
        <ResultadoProcesamientoModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          resultado={procesamientoResult}
        />

        {/* Zona de Carga de Archivos */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary/10 rounded-radius'>
                  <FileSpreadsheet className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <CardTitle>Cargar Archivo Excel</CardTitle>
                  <CardDescription>
                    Arrastra o selecciona un archivo .xlsx / .xls
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Collapsible
              open={showRequirements}
              onOpenChange={setShowRequirements}
            >
              <CollapsibleTrigger asChild>
                <Button variant='ghost' className='w-full justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <Info className='h-4 w-4' />
                    <span>Requisitos del archivo</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showRequirements ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='p-4 bg-muted/30 rounded-radius border border-border mb-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-xs'>
                    <div className='flex items-center gap-2'>
                      <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                      <span className='text-muted-foreground'>
                        Formato: .xlsx o .xls
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                      <span className='text-muted-foreground'>
                        Tamaño máximo: 10 MB
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                      <span className='text-muted-foreground'>
                        {REQUIRED_COLUMNS.length} columnas requeridas
                      </span>
                    </div>
                  </div>
                  <Collapsible
                    open={showColumnInfo}
                    onOpenChange={setShowColumnInfo}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant='link'
                        size='sm'
                        className='mt-2 p-0 h-auto'
                      >
                        {showColumnInfo ? 'Ocultar' : 'Ver'} lista de columnas
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className='mt-3 p-3 bg-card rounded-radius border border-border max-h-40 overflow-y-auto'>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                          {REQUIRED_COLUMNS.map((col, idx) => (
                            <div
                              key={idx}
                              className='text-xs text-muted-foreground'
                            >
                              • {col}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Zona de Drop/Upload */}
            {!file ? (
              <div
                onDragOver={
                  validacionLecturas?.sinPendientes !== false
                    ? handleDragOver
                    : undefined
                }
                onDragLeave={
                  validacionLecturas?.sinPendientes !== false
                    ? handleDragLeave
                    : undefined
                }
                onDrop={
                  validacionLecturas?.sinPendientes !== false
                    ? handleDrop
                    : undefined
                }
                className={`relative border-2 border-dashed rounded-radius p-12 transition-all duration-300 ${
                  validacionLecturas?.sinPendientes === false
                    ? 'border-muted bg-muted/20 opacity-60 cursor-not-allowed'
                    : isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-border hover:border-primary hover:bg-accent/50'
                }`}
              >
                <div className='flex flex-col items-center gap-6 text-center'>
                  <div
                    className={`relative transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}
                  >
                    <div
                      className={`absolute inset-0 rounded-full blur-xl opacity-30 ${
                        isDragging ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                    <div
                      className={`relative p-5  ${
                        isDragging ? 'bg-primary/10' : 'bg-muted'
                      }`}
                    >
                      <Upload
                        className={`h-10 w-10 ${
                          isDragging ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <p className='text-lg font-semibold text-background-900 dark:text-background-100 mb-2'>
                      {validacionLecturas?.sinPendientes === false
                        ? 'Carga de archivos bloqueada'
                        : isDragging
                          ? '¡Suelta el archivo aquí!'
                          : 'Arrastra tu archivo Excel'}
                    </p>
                    <p className='text-sm text-background-600 dark:text-background-400'>
                      {validacionLecturas?.sinPendientes === false
                        ? 'Completa la preparación de sectores para habilitar'
                        : 'o haz clic en el botón para seleccionar'}
                    </p>
                  </div>

                  <input
                    type='file'
                    accept='.xlsx,.xls'
                    onChange={handleFileInput}
                    className='hidden'
                    id='file-upload'
                    disabled={validacionLecturas?.sinPendientes === false}
                  />

                  <Button
                    asChild={validacionLecturas?.sinPendientes !== false}
                    disabled={validacionLecturas?.sinPendientes === false}
                  >
                    {validacionLecturas?.sinPendientes !== false ? (
                      <label
                        htmlFor='file-upload'
                        className='cursor-pointer gap-2'
                      >
                        <FileSpreadsheet className='h-4 w-4' />
                        Seleccionar Archivo
                      </label>
                    ) : (
                      <>
                        <FileSpreadsheet className='h-4 w-4' />
                        Seleccionar Archivo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Archivo cargado */}
                <Alert className='bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'>
                  <FileSpreadsheet className='h-5 w-5 text-emerald-500' />
                  <div className='flex items-center justify-between flex-1'>
                    <div className='flex-1 min-w-0'>
                      <AlertTitle className='flex items-center gap-2 text-emerald-900 dark:text-emerald-100'>
                        <span className='truncate'>{file.name}</span>
                        {isValidFile && (
                          <Badge
                            variant='secondary'
                            className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          >
                            <CheckCircle2 className='h-3 w-3 mr-1' />
                            Validado
                          </Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription className='text-emerald-700 dark:text-emerald-300'>
                        {(file.size / 1024).toFixed(2)} KB
                      </AlertDescription>
                    </div>
                    <Button
                      onClick={handleRemoveFile}
                      variant='ghost'
                      size='icon'
                      className='text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                    >
                      <X className='h-5 w-5' />
                    </Button>
                  </div>
                </Alert>

                {/* Botón de importar */}
                {isValidFile && !isValidating && (
                  <Button
                    onClick={handleImportar}
                    disabled={
                      isImporting || validacionLecturas?.sinPendientes === false
                    }
                    variant='default'
                    size='lg'
                    className='w-full gap-2'
                  >
                    {isImporting ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent' />
                        <span>Cargando archivo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className='h-5 w-5' />
                        <span>
                          {validacionLecturas?.sinPendientes === false
                            ? 'Importación Bloqueada'
                            : 'Importar Lecturas'}
                        </span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Estado de validación */}
            {isValidating && (
              <div className='flex flex-col items-center justify-center py-8 space-y-4'>
                <div className='animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary' />
                <div className='text-center'>
                  <p className='font-semibold mb-1'>Validando archivo...</p>
                  <p className='text-sm text-muted-foreground'>
                    Verificando estructura y columnas requeridas
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
