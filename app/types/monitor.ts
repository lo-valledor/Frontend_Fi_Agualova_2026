// Tipos centralizados para los componentes de monitor

// Tipos base de useMonitor
export interface Periodo {
  IdPeriodo: string;
  FechaInicio: string;
  FechaFin: string;
  FechaOrden: string;
  DescripcionPeriodo: string;
  EstadoPeriodo: number;
}

export interface Sector {
  sectorId: string;
  descripcion: string;
  infoAdicional: string;
  estado: number;
  color: number;
}

export interface Clave {
  IdClave: number;
  DescripcionClave: string;
  IdentificadorDeAgrupacion: string;
}

export interface Lectura {
  IdLectura: number;
  Sector: string;
  Periodo: string;
  FechaLectura: string;
  EstadoLectura: number;
}

// Tipos para MedidorNicho
export interface MedidorNicho {
  Nro: number;
  LM_Periodo: string;
  sector: string;
  nicho: string;
  ubicacion: string;
  tarifa: string;
  local: string;
  SE_ID: number;
  se_ordenlectura: number;
  ME_ID: number;
  SE_ID1: number;
  ME_NSerie: string;
  ME_Digitos: number;
  ME_ConstanteMultiplicar: number;
  LM_ID: number;
  LM_FechaLectura: string | null;
  LM_ValorUltimaLectura: number;
  LMC_ValorUltimaLectEnergiaReactiva: number;
  LM_ConsumoMesAnterior: string;
  LM_ConsumoAñoAnterior: string;
  LMC_EnergiaActiva: number;
  LMC_ConsumoEnergiaActiva: number;
  LMC_EnergiaReactiva: number;
  LMC_DemandaSuministrada: string;
  LMC_FechaDemandaSuminis: string;
  LMC_HoraDemandaSuminis: string;
  LMC_DemandaPunta: string;
  LMC_FechaDemandaPunta: string;
  LMC_HoraDemandaPunta: string;
  LMC_ConsumoEnergiaReactiva: number;
  LMC_ValorUltimaLectEnergiaActiva: string;
  LMC_ValorUltimaLectEnergiaReactiva1: string;
  LMC_ConsAñoAnteriorEnActiva: string;
  LMC_ConsAñoAnteriorEnReactiva: string;
  LMC_PorcentajeMultaMalFactorPotencia: string;
  Estado: number;
}

// Tipos para Nicho de MonitorNichos (alias de MedidorNicho por compatibilidad)
export type MedidorNichoItem = MedidorNicho;

// Tipos para DetallesMedidor
export interface EtapaUno {
  ME_NSerie: string;
  ME_ConstanteMultiplicar: number;
  TM_Descripcion: string;
  SE_Codigo: string;
  TF_Codigo: string;
}

export interface EtapaDos {
  LM_Periodo: string;
  LM_FechaLectura: string;
  LM_ValorLecturaActual: number;
  LM_ConsumoPeriodo: number;
  LM_Observaciones: string;
}

export interface EtapaTres {
  CLA_ID: number;
  CLA_Codigo: string;
  CLA_Descripcion: string;
  CLA_Tipo: number;
  CLL_Fecha: string;
}

export interface EtapaCuatro {
  LM_ID: number;
  LM_Periodo: string;
  LM_FechaLectura: string;
  LM_ValorLecturaActual: number;
  LM_ConsumoPeriodo: number;
  LM_Observaciones: string;
}

// Tipos para LecturaBT43
export interface LecturaBT43 {
  LM_ID: number;
  LMC_EnergiaActiva: number;
  LMC_EnergiaReactiva: number;
  LMC_DemandaSuministrada: number;
  LMC_FechaDemandaSuminis: string;
  LMC_HoraDemandaSuminis: string;
  LMC_DemandaPunta: number;
  LMC_FechaDemandaPunta: string;
  LMC_HoraDemandaPunta: string;
  LMC_ConsumoEnergiaActiva: number;
  LMC_ConsumoEnergiaReactiva: number;
  LMC_ValorUltimaLectEnergiaActiva: number;
  LMC_ValorUltimaLectEnergiaReactiva: number;
  LMC_ConsAñoAnteriorEnActiva: number;
  LMC_ConsAñoAnteriorEnReactiva: number;
  LMC_PorcentajeMultaMalFactorPotencia: number;
  LM_FechaLectura: string;
}

// Tipos actualizados para ResultadosBusqueda (nuevo formato JSON)
export interface Medidor {
  id: number;
  nSerie: string;
  claveHtml: string;
  estadoFactura: number;
  estadoClave: number;
  ultimaLectura: number;
  fechaLectura: string | null;
  consumo: number;
  clave: string | null;
}

export interface Fila {
  numero: number;
  medidores: Medidor[];
}

export interface NichoBusqueda {
  nombre: string;
  filas: Fila[];
}

export interface ResultadoBusqueda {
  filas: Fila[];
  nichos: NichoBusqueda[];
}

// Tipos para EditarMedidores
export interface FormDataBT1y2 {
  lmid: string;
  vactual: string;
  consumo: string;
  claid: string;
}

export interface FormDataBT43 {
  lmId: number;
  lecturaActiva: number;
  claveActivaId: string;
  lecturaReactiva: number;
  claveReactivaId: string;
  consumoActiva: number;
  consumoReactiva: number;
  dp: number;
  dpFecha: string;
  dpHora: string;
  ds: number;
  dsFecha: string;
  dsHora: string;
}

export interface MedidorCard {
  claveHtml(claveHtml: string): unknown;
  medidor: Medidor;
  onRefresh: () => void;
}

export interface CompararConsumoMedidor {
  tipoPeriodo: string;
  lM_Periodo: string;
  lM_FechaLectura: string;
  lM_ValorLecturaActual: number;
  lM_ConsumoPeriodo: number;
}
