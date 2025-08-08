export interface BuscarContratos {
  cT_ID: number;
  lC_ID: string;
  cL_RUT: string;
  nombreCliente: string;
  pR_RUT: string;
  nombrePropietario: string;
  mE_NSerie: string;
  cT_ID_Madre: number;
  cT_esMadre: boolean;
  se_codigo: string;
}

export interface DetallePropietario {
  rut: string;
  nombre: string;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  email: string;
}

export interface DetalleCliente {
  rut: string;
  nombre: string;
  direccion: string;
  comuna: string;
  telefono: string;
  email: string;
  contacto: string;
}

export interface DetalleLocal {
  localId: string;
  empresa: string;
  lugarEntregaServicio: string;
}

export interface DetalleContrato {
  contratoId: number;
  tipoContrato: string;
  codigoTarifa: string;
  limiteInversionVigente: number;
  potenciaContratada: number;
  cicloFacturacion: string;
  fechaInicio: string;
  estadoContrato: string;
  contratoMadreId: number;
}

export interface DetalleMedidores {
  nroSerie: string;
  tipoMedidor: string;
  constanteMultiplicadora: number;
  digitos: number;
}

export interface DetalleUbicacion {
  codigoSubempalme: string;
  nicho: string;
  sector: string;
  empalme: string;
  zona: string;
}

export interface DetalleLecturas {
  periodo: string;
  fechaLectura: string;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoPeriodo: number;
  energiaBase: number;
  sobreconsumo: number;
}

export interface DetalleFacturas {
  periodo: string;
  nroFactura: string;
  tarifa: string;
  fechaEmision: string;
  fechaVencimiento: string;
  valorNeto: number;
  iva: number;
  valorTotal: number;
  consumoPeriodo: number;
}

// Resumen Facturación

export interface FacturacionPorCargo {
  cargoDescripcion: string;
  totalEnergiaPeriodoAnterior: string;
  totalFacturaPeriodoAnterior: string;
  cantidadCargosPeriodoAnterior: string;
  totalEnergiaPeriodoActual: string;
  totalFacturaPeriodoActual: string;
  cantidadCargosPeriodoActual: string;
  diferenciaPeriodos: string;
}

export interface TotalFacturasPeriodo {
  totalContratosFacturados: number;
}

export interface ComboEmpalmes {
  emId: number;
  descripcion: string;
}

export interface PeriodosFacturacion {
  pF_ID: string;
  pF_Descripcion: string;
}
