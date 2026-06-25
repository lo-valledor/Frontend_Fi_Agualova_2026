// Tipos Sistema de Agualova - Módulo de Monitor
export type MonitorPeriodos = {
  value: string;
  text: string;
  fechaInicio: string | null;
  fechaFin: string | null;
};

export type MonitorClaves = {
  value: string;
  text: string;
  grupo: string;
};

export type MonitorSectores = {
  secId: number;
  descripcion: string;
  estado: number;
  color: number;
};

export type MonitorGrillaProps = {
  periodo: string;
  sector: string;
  medidor: string;
  fechaIni: string;
  fechaFin: string;
  clave: string;
  criterio: string;
};

export type MonitorMedidores = {
  id: number;
  nSerie: string;
  claveHtml: string;
  ultimaLectura: number;
  fechaLectura: string;
  consumo: number;
  clave: string;
};

export type MonitorFilas = {
  numero: number;
  medidores: MonitorMedidores[];
};

export type MonitorNichosGet = {
  nombre: string;
  filas: MonitorFilas[];
};

// historial-lectura
export type MonitorCabecera = {
  nroMedidor: string;
  constante: string;
  tipo: string;
  subempalme: string;
  tarifa: string;
};

export type MonitorMedidorClaves = {
  codigo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
};

export type MonitorLecturasAnteriores = {
  periodo: string;
  fechaLectura: string;
  ultimaLectura: string;
  lecturaActual: string;
  consumoPeriodo: string;
  consumoAdicional: string;
  observacion: string;
};

export type MonitorHistorialLectura = {
  estadoFacturar: number;
  permiteAceptar: boolean;
  permiteIngresar: boolean;
  cabecera: MonitorCabecera;
  claves: MonitorMedidorClaves[];
  lecturasAnteriores: MonitorLecturasAnteriores[];
  complementoBT43: string | null;
};

export type MonitorDetalleRegistro = {
  lmId: number;
  ultimaLectura: number;
  serieMedidor: string;
  digitos: number;
  constante: number;
  codigoSubempalme: string;
  ubicacion: string;
  modelo: number;
  tieneAdicional: boolean;
  serieAdicional: null | string;
  digitosAdicional: number;
  constanteAdicional: number;
  tipoMedidorAdicional: number;
  subempalmeAdicional: null | string;
  ultimaLecturaAdicional: number;
};

export type MonitorProps = {
  idLectura: number;
  fecha: string;
  lecturaActual: number;
  lecturaAnterior: number;
  existeAdicional: boolean;
  tipoAdicional: number;
  lecturaActualAd: number;
  lecturaAnteriorAd: number;
};

export type MonitorReabrirPeriodoProps = {
  periodoId: string;
  claveId: number;
  descripcion: string;
};

export type MonitorHabilitarEdicionProps = {
  lecturaId: number;
  claveId: number;
  descripcion: string;
};

export type MonitorAceptarMasivoLecturas = {
  lecturasIds: number[];
};

// ============================================
// Enhanced Types for Refactored Components
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  value?: unknown;
}

export interface StatsData {
  total: number;
  critical: number;
  warning: number;
  info: number;
  normal: number;
  sinlec: number;
  imported: number;
}

export type MeterStatusType =
  | 'SINLEC' // Sin Lectura
  | 'SINCLA' // Lectura Normal
  | 'CLAINF' // Clave Informativa
  | 'CLAREL' // Clave Relevante
  | 'CLACRI' // Clave Crítica
  | 'LECCER' // Lectura Cerrada
  | 'LECIMP' // En Facturación
  | 'IMPORT'; // Lecturas Importadas

export interface MeterStatusInfo {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
  icon: unknown; // Will be React.ReactElement at runtime
  severity: 0 | 1 | 2 | 3 | 4;
}

export interface SearchParams {
  sector: string;
  periodo: string;
  startDate: string;
  endDate: string;
  keyType?: string;
  meterSerial?: string;
  claveId?: string;
}
