export type BuscarContrato = {
  idContrato: number;
  nroLocal: string;
  rutCliente: string;
  nombreCliente: string;
  rutPropietario: string;
  nombrePropietario: string;
  nroMedidor: string;
  acometida: string;
};

export type ExportarExcelProps = {
  nroLocal: string;
  rutCliente: string;
  nombreCliente: string;
  rutPropietario: string;
  nombrePropietario: string;
  nroMedidor: string;
  codigoContrato: number;
  acometida: string;
};

// ============================================
// Consultar Contrato
// ============================================
export type Propietario = {
  rut: string;
  nombre: string;
  direccion: string;
  comuna: string;
  telefono: string;
  email: string;
  contacto: string;
};

export type Cliente = {
  rut: string;
  nombre: string;
  direccion: string;
  comuna: string;
  telefono: string;
  email: string;
  contacto: string;
};

export type Lugar = {
  nroLocal: string;
  otroLugar: string;
};

export type Contrato = {
  nroContrato: string;
  tipoContrato: string;
  codigoTarifa: string;
  cicloFacturacion: string;
  limiteInvVigente: string;
  fechaInicio: string;
  potenciaContratada: string;
  contratoMadre: string;
  estado: string;
};

export type Medidor = {
  nroMedidor: string;
  tipoMedidor: string;
  constanteMultiplicar: string;
  digitos: string;
};

export type Empalme = {
  acometida: string;
  zona: string;
  sector: string;
  empalmePrimario: string;
  nicho: string;
};

export type Lecturas = {
  periodo: string;
  fechaLectura: string;
  ultimaLectura: string;
  lecturaActual: string;
  consumo: string;
  energiaBase: string;
  sobreconsumo: string;
};

export type Facturas = {
  periodo: string;
  nroFactura: string;
  tarifa: string;
  fechaEmision: string;
  fechaVencimiento: string;
  neto: string;
  iva: string;
  total: string;
  consumo: string;
};

export type ConsolidadoConsultaContrato = {
  propietario: Propietario;
  cliente: Cliente;
  lugar: Lugar;
  contrato: Contrato;
  medidor: Medidor;
  empalme: Empalme;
  lecturas: Lecturas[];
  facturas: Facturas[];
};

/**
 * Nota de Cobro
 */

export type PeriodosDisponibles = {
  id: string;
  descripcion: string;
};

export type EmpalmesDisponibles = {
  id: string;
  descripcion: string;
};

export type DetalleNotadeCobro = {
  cargoDescripcion: string;
  cantidadM3PeriodoAnterior: string;
  cantNotaCobroPeriodoAnterior: string;
  totalCargosPeriodoAnterior: string;
  cantidadM3PeriodoActual: string;
  cantNotaCobroPeriodoActual: string;
  totalCargosPeriodoActual: string;
  diferenciaRecuperacion: string;
};

export type ResumenNotadeCobro = {
  totalNotasCobroEmitidas: string;
  detalle: DetalleNotadeCobro[];
};

/**
 * Ver Facturas
 */
export type VerFacturasProps = {
  tipo: number;
  rutCliente: string;
  local: string;
  facturaInicial: string;
  facturaFinal: string;
  periodo: string;
  acometida: string;
};
