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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-sky-50/30 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900'>
      <div className='container mx-auto p-6 space-y-6'>
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title='Importar Lecturas'
          description='Carga un archivo Excel con las lecturas de medidores para importarlas al sistema'
        />

        {/* Panel de Control Principal */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Estado del Sistema - Minimalista */}
          <div className='lg:col-span-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                  Estado del Sistema
                </h3>
                <button
                  onClick={fetchEstadoProcesamiento}
                  disabled={loadingEstado}
                  className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50'
                >
                  <RefreshCw
                    className={`h-4 w-4 text-slate-600 dark:text-slate-400 ${loadingEstado ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              {loadingEstado ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-sky-500' />
                </div>
              ) : estadoProcesamiento ? (
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-xl border border-sky-200/50 dark:border-sky-800/50'>
                    <div className='text-2xl font-bold text-sky-700 dark:text-sky-400 mb-1'>
                      {estadoProcesamiento.periodoActivo}
                    </div>
                    <div className='text-xs text-sky-600 dark:text-sky-500 font-medium'>
                      Período Activo
                    </div>
                  </div>

                  <div
                    className={`text-center p-4 rounded-xl border ${
                      estadoProcesamiento.registrosPendientes > 0
                        ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50 dark:border-orange-800/50'
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50'
                    }`}
                  >
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        estadoProcesamiento.registrosPendientes > 0
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-green-700 dark:text-green-400'
                      }`}
                    >
                      {estadoProcesamiento.registrosPendientes}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        estadoProcesamiento.registrosPendientes > 0
                          ? 'text-orange-600 dark:text-orange-500'
                          : 'text-green-600 dark:text-green-500'
                      }`}
                    >
                      Pendientes
                    </div>
                  </div>

                  <div className='text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50'>
                    <div className='text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide'>
                      {estadoProcesamiento.estado}
                    </div>
                    <div className='text-[10px] text-slate-500 dark:text-slate-500'>
                      Estado
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-12 text-slate-500 dark:text-slate-400'>
                  No se pudo cargar el estado
                </div>
              )}
            </div>
          </div>

          {/* Panel de Acciones - Minimalista */}
          <div className='bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow'>
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6'>
                Acciones
              </h3>
              <div className='space-y-3'>
                <button
                  onClick={fetchRegistrosPendientes}
                  disabled={loadingRegistros}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loadingRegistros ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent' />
                  ) : (
                    <Info className='h-4 w-4' />
                  )}
                  <span>Consultar Pendientes</span>
                </button>

                <button
                  onClick={procesarBT1BT2}
                  disabled={processingBT}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {processingBT ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                  ) : (
                    <Play className='h-4 w-4' />
                  )}
                  <span>Procesar BT1-BT2</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones y Alertas - Minimalistas */}
        <div className='space-y-3'>
          {/* Resultado de registros pendientes */}
          {registrosPendientes && (
            <div className='bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-4 shadow-sm'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                  <Info className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h4 className='font-semibold text-blue-900 dark:text-blue-100 mb-1'>
                    Registros Pendientes
                  </h4>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    {registrosPendientes.mensaje}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultado del procesamiento */}
          {procesamientoResult && (
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50 p-4 shadow-sm'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                  <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <div className='flex-1'>
                  <h4 className='font-semibold text-green-900 dark:text-green-100 mb-1'>
                    Procesamiento Completado
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300 mb-2'>
                    {procesamientoResult.mensaje}
                  </p>
                  <div className='flex items-center gap-4 text-xs text-green-600 dark:text-green-400'>
                    <span className='font-medium'>
                      {procesamientoResult.registrosActualizados} registros
                    </span>
                    <span>•</span>
                    <span>Período {procesamientoResult.periodo}</span>
                    {procesamientoResult.detalles &&
                      procesamientoResult.detalles.length > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {procesamientoResult.detalles.length} detalles
                          </span>
                        </>
                      )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setShowResultModal(true)}
                    className='px-3 py-2 bg-white dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-slate-700 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm'
                  >
                    <Eye className='h-4 w-4' />
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => setProcesamientoResult(null)}
                    className='p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors'
                  >
                    <X className='h-4 w-4 text-green-600 dark:text-green-400' />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error de validación */}
          {error && (
            <div className='bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-2xl border border-red-200/50 dark:border-red-800/50 p-4 shadow-sm'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-red-100 dark:bg-red-900/30 rounded-lg'>
                  <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                </div>
                <div className='flex-1'>
                  <h4 className='font-semibold text-red-900 dark:text-red-100 mb-1'>
                    Error de Validación
                  </h4>
                  <p className='text-sm text-red-700 dark:text-red-300 mb-2'>
                    {error}
                  </p>
                  {error.includes('período') && estadoProcesamiento && (
                    <div className='mt-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                      <p className='text-sm font-medium text-red-800 dark:text-red-200 mb-2'>
                        💡 Solución
                      </p>
                      <p className='text-xs text-red-700 dark:text-red-300'>
                        Asegúrate de que la columna "Periodo" contenga:{' '}
                        <code className='px-2 py-0.5 bg-red-200 dark:bg-red-900/50 rounded font-mono'>
                          {estadoProcesamiento.periodoActivo}
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de resultado del procesamiento */}
        <ResultadoProcesamientoModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          resultado={procesamientoResult}
        />

        {/* Zona de Carga de Archivos - Minimalista y Moderno */}
        <div className='bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
          {/* Header con información de requisitos */}
          <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl'>
                  <FileSpreadsheet className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                    Cargar Archivo Excel
                  </h3>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Arrastra o selecciona un archivo .xlsx / .xls
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRequirements(!showRequirements)}
                className='flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
              >
                <Info className='h-4 w-4' />
                <span>Requisitos</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showRequirements ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Panel de requisitos colapsable */}
            {showRequirements && (
              <div className='mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-xs'>
                  <div className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-sky-500' />
                    <span className='text-slate-700 dark:text-slate-300'>
                      Formato: .xlsx o .xls
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-sky-500' />
                    <span className='text-slate-700 dark:text-slate-300'>
                      Tamaño máximo: 10 MB
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-sky-500' />
                    <span className='text-slate-700 dark:text-slate-300'>
                      {REQUIRED_COLUMNS.length} columnas requeridas
                    </span>
                  </div>
                </div>
                {showColumnInfo && (
                  <div className='mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto'>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                      {REQUIRED_COLUMNS.map((col, idx) => (
                        <div
                          key={idx}
                          className='text-xs text-slate-600 dark:text-slate-400'
                        >
                          • {col}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowColumnInfo(!showColumnInfo)}
                  className='mt-2 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium'
                >
                  {showColumnInfo ? 'Ocultar' : 'Ver'} lista de columnas
                </button>
              </div>
            )}
          </div>

          {/* Zona de Drop/Upload */}
          <div className='p-6'>
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                  isDragging
                    ? 'border-sky-400 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 scale-[1.02]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                }`}
              >
                <div className='flex flex-col items-center gap-6 text-center'>
                  <div
                    className={`relative transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}
                  >
                    <div
                      className={`absolute inset-0 rounded-full blur-xl opacity-30 ${
                        isDragging ? 'bg-sky-400' : 'bg-slate-400'
                      }`}
                    />
                    <div
                      className={`relative p-5 rounded-2xl ${
                        isDragging
                          ? 'bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50'
                          : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
                      }`}
                    >
                      <Upload
                        className={`h-10 w-10 ${
                          isDragging
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <p className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2'>
                      {isDragging
                        ? '¡Suelta el archivo aquí!'
                        : 'Arrastra tu archivo Excel'}
                    </p>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>
                      o haz clic en el botón para seleccionar
                    </p>
                  </div>

                  <input
                    type='file'
                    accept='.xlsx,.xls'
                    onChange={handleFileInput}
                    className='hidden'
                    id='file-upload'
                  />

                  <label
                    htmlFor='file-upload'
                    className='cursor-pointer px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2'
                  >
                    <FileSpreadsheet className='h-4 w-4' />
                    Seleccionar Archivo
                  </label>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Archivo cargado */}
                <div className='relative bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-2xl border-2 border-green-200/50 dark:border-green-800/50 p-4 overflow-hidden'>
                  <div className='absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 dark:from-green-400/5 dark:to-emerald-400/5' />

                  <div className='relative flex items-center gap-4'>
                    <div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-xl'>
                      <FileSpreadsheet className='h-6 w-6 text-green-600 dark:text-green-400' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-semibold text-slate-900 dark:text-slate-100 truncate'>
                          {file.name}
                        </p>
                        {isValidFile && (
                          <div className='px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1'>
                            <CheckCircle2 className='h-3 w-3' />
                            Validado
                          </div>
                        )}
                      </div>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>

                    <button
                      onClick={handleRemoveFile}
                      className='p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-colors'
                    >
                      <X className='h-5 w-5' />
                    </button>
                  </div>
                </div>

                {/* Botón de importar */}
                {isValidFile && !isValidating && (
                  <button
                    onClick={handleImportar}
                    disabled={isImporting}
                    className='w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {isImporting ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent' />
                        <span>Cargando archivo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className='h-5 w-5' />
                        <span>Importar Lecturas</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Estado de validación */}
            {isValidating && (
              <div className='mt-4 flex flex-col items-center justify-center py-8 space-y-4'>
                <div className='relative'>
                  <div className='animate-spin rounded-full h-12 w-12 border-3 border-slate-200 dark:border-slate-700 border-t-sky-500' />
                  <div className='absolute inset-0 rounded-full bg-sky-400/20 blur-xl' />
                </div>
                <div className='text-center'>
                  <p className='font-semibold text-slate-900 dark:text-slate-100 mb-1'>
                    Validando archivo...
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Verificando estructura y columnas requeridas
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
