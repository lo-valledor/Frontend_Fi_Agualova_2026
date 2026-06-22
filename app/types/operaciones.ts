// POST anular-factura/ejecutar
export type AnularFacturaEjecutarRequest = {
  numeroFactura: string;
  conTomaLectura: boolean;
};

// GET cambio-medidor/buscar-antiguo
export type CambioMedidorBuscarAntiguoRequest = {
  idMedidor: number;
  acometida: string;
  numeroSerie: string;
  tipo: string;
  constante: number;
  marca: string;
  modelo: string;
  ultimaLectura: number;
};

// GET cambio-medidor/buscar-nuevo
export type CambioMedidorBuscarNuevoRequest = {
  idMedidor: number;
  tipo: string;
  constante: number;
  marca: string;
  modelo: string;
  numeroSerie: string;
};

// POST cambio-medidor/ejecutar-cambio
export type CambioMedidorEjecutarCambioRequest = {
  idMedidorAntiguo: number;
  acometida: string;
  ultimaLecturaAntiguo: number;
  lecturaFinalAntiguo: number;
  fechaCambio: string;
  idMedidorNuevo: number;
  primeraLecturaNuevo: number;
  nuevoContratoId: number;
};

/**
 * Cerrar Lecturas
 */
//GET /cerrar-lecturas/filtros/ciclos
export type CerrarLecturasFiltrosCiclosResponse = {
  id: string;
  descripcion: string;
}[];

//GET cerrar-lecturas/filtros/periodos
export type CerrarLecturasFiltrosPeriodosResponse = {
  id: string;
  descripcion: string;
}[];

//Todo: GET /cerrar-lecturas/buscar-estadisticas

// POST cerrar-lecturas/cerrar
export type CerrarLecturasCerrarRequest = {
  idsNichos: number[];
  cicloId: number;
  periodoId: string;
};

/**
 * Corte y Reposicion
 */
// GET /corte-reposicion/resumen
export type CorteReposicionResumenResponse = {
  pendientes: number;
  liberados: number;
  cortados: number;
  reposicionSolicitada: number;
  total: number;
  procesoIniciado: boolean;
};

// GET /corte-reposicion/buscar
export type CorteReposicionBuscarRequest = {
  contratoId: number;
  acometida: string;
  numeroMedidor: string;
  rutCliente: string;
  nombreCliente: string;
  nicho: string;
  sector: string;
  estado: string;
  cantidadDocumentos: number;
  deudaTotal: number;
  fechaIngreso: string;
};

//Todo: GET /corte-reposicion/consultar-deuda

// POST /corte-reposicion/liberar
export type CorteReposicionLiberarRequest = {
  acometida: string;
  comentario: string;
};

// POST /corte-reposicion/registrar-corte
export type CorteReposicionRegistrarCorteRequest = {
  acometida: string;
  fecha: string;
  hora: string;
};

/**
 * Periodos
 */
// GET /periodos/anios-disponibles
export type PeriodosAniosDisponiblesResponse = {
  idAnio: number;
  anio: number;
};

export type Anio = PeriodosAniosDisponiblesResponse;

// GET /agualova/periodos/buscar
export type PeriodosBuscarRequest = {
  codigo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  puedeCerrar: boolean;
};

export type Periodos = PeriodosBuscarRequest;

// POST /agualova/periodos/crear
export type PeriodosCrearRequest = {
  mes: string;
  anio: string;
  nombreMes: string;
};

/**
 * Precios
 */
// GET /precios/consultar
export type PreciosConsultarRequest = {
  codigoInterno: number;
  codigoEnerlova: string;
  descripcion: string;
  valorMesAnterior: string;
  confirmacion: string;
  indice: number;
  valorActual: number;
};

// POST /precios/guardar-masivo
export type PreciosGuardarMasivoRequest = {
  mes: string;
  anio: string;
  codigoCargo: number;
  nuevoValor: number;
};

/**
 * Preparar Lecturas
 */
// GET /preparar-lecturas/filtros/ciclos
export type PrepararLecturasFiltrosCiclosResponse = {
  id: string;
  descripcion: string;
};

// GET /preparar-lecturas/filtros/periodos
export type PrepararLecturasFiltrosPeriodosResponse = {
  id: string;
  descripcion: string;
};

// POST /preparar-lecturas/buscar-nichos
export type PrepararLecturasBuscarNichosRequest = {
  idSector: number;
  nombreSector: string;
  idNicho: number;
  nombreNicho: string;
  cantidadMedidores: number;
};

// POST /preparar-lecturas/generar
export type PrepararLecturasGenerarRequest = {
  idsNichos: number[];
  cicloId: number;
  periodoId: string;
};

/**
 * Revisar Cálculos
 */
// GET /revisar-calculos/filtros/ciclos
export type RevisarCalculosFiltrosCiclosResponse = {
  id: string;
  descripcion: string;
}[];

// GET /revisar-calculos/filtros/periodos
export type RevisarCalculosFiltrosPeriodosResponse = {
  id: string;
  descripcion: string;
}[];

// POST /revisar-calculos/estado-proceso
export type RevisarCalculosEstadoProcesoRequest = {
  estado: string;
  procesoId: number;
};

// POST revisar-calculos/lanzar-calculo
export type RevisarCalculosLanzarCalculoRequest = {
  cicloId: number;
  periodoId: string;
  rut: string;
  nombre: string;
  sector: string;
  local: string;
  modo: number;
  procesoId: number;
};

//Todo: POST /revisar-calculos/buscar-prefacturas

/**
 * Revisión Precios
 */
// GET /revision-precios/buscar
export type RevisionPreciosBuscarRequest = {
  indice: number;
  codigoCargo: number;
  codigoEnerlova: string;
  descripcion: string;
  valorActual: string;
  estado: string;
  estaConfirmado: boolean;
};

// POST revision-precios/confirmar
export type RevisionPreciosConfirmarRequest = {
  codigosCargos: number[];
  passwordConfirmacion: string;
};

//Todo: GET /revision-precios/detalle-correccion

// POST /revision-precios/corregir
export type RevisionPreciosCorregirRequest = {
  codigoCargo: number;
  nuevoValor: number;
  motivo: string;
  passwordConfirmacion: string;
};

/**
 * SAP
 */
export type EmpresaSAP = {
  id: number;
  nombre: string;
};

export type NombreSugeridoSAP = {
  nombreEncabezado: string;
  nombreDetalle: string;
};

/**
 * Anular Factura
 */
export type AnularFacturaRequest = {
  numeroFactura: string;
  conTomaLectura: boolean;
};
