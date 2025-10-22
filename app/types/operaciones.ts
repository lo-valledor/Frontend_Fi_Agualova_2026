//Abrir Facturacion
export interface Periodos {
  pf_id: string;
  pf_descripcion: string;
  Column1: string;
  Column2: string;
  epf_descripcion: string;
}

export interface Anio {
  idaño: number;
  año: number;
}

//Precios Cargo
export interface PreciosCargoEnel {
  codigo: number;
  codigoener: string;
  descripcion: string;
  valor: string;
  valor2: string;
  valor3: string;
  confirmacion: string;
  indice: number;
  valoractual: string;
  valoractual2: string;
  valoractual3: string;
}

export interface PreciosCargoEnerlova {
  CD_ID: number;
  CD_Descripcion: string;
  valor: string;
  dias: number;
  pc_confirmacion: number;
  pc_id: number;
  cd_codigoenerlova: string;
}

export interface DetallepreciosCargoEnerlova {
  codigo: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor: string;
  ultimo: string;
  id: string;
}

export interface DialogAgregarPreciosProps {
  valor1: number;
  valor2: number;
  valor3: number;
  codigo: number;
  mes: string;
  anio: string;
  onSuccess?: () => void;
}

//Revisar Precio
export interface Ciclo {
  descripcion: string;
  diaFacturacion: string;
}

export interface PeriodoAbierto {
  descripcion: string;
  mes: number;
  anio: number;
}

export interface ValidacionUsuarioResponse {
  mensaje: string;
  nombreCompleto: string;
  fechaIngreso: string;
  idPerfil: number;
}

export interface RevisarPrecioUno {
  codigo: string;
  codigoEner: string;
  descripcion: string;
  valor: string;
  confirmacion: string;
  indice: string;
}

export interface TablaValoresEnelProps {
  data: RevisarPrecioUno[];
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface RevisarPrecioDos {
  codigo: string;
  codigoEner: string;
  descripcion: string;
  valor: string;
  confirmacion: string;
  indice: string;
}

export interface TablaValoresEnerlovaProps {
  data: RevisarPrecioDos[];
  isLoading: boolean;
  isAuthorized: boolean;
}

//Preparar Lecturas
export interface ConsultarAsignacionSectores {
  sectorId: number;
  descripcionSector: string;
  nichoId: number;
  descripcionNicho: string;
  cantidadMedidores: number;
}

export interface TablaAsignacionSectoresProps {
  data: ConsultarAsignacionSectores[];
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface OpcionesPrepararLecturas {
  id: number;
  descripcion: string;
}

export interface ConsultarSectores {
  secId: number;
  secDescripcion: string;
  zoDescripcion: string;
  secEstado: boolean;
}

export interface TablaConsultarSectoresProps {
  data: ConsultarSectores[];
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface ValidarSectoresPendientes {
  mensaje: string;
  sinPendientes: boolean;
  periodo: string;
  totalPendientes: number;
  detalles: [
    {
      sector: string;
      nicho: string;
      estado: number;
      cantidad: number;
    }
  ];
}

export interface TablaValidarSectoresPendientesProps {
  data: ValidarSectoresPendientes[];
  isLoading: boolean;
  isAuthorized: boolean;
}

//Cerrar Lecturas
export interface EstadoCierreLecturas {
  sectorId: number;
  nichoDescripcion: string;
  cantidadSinLectura: number;
  cantidadLecturasOK: number;
  cantidadClaveRoja: number;
  cantidadClaveNaranja: number;
  cantidadCorregidas: number;
  cantidadTotal: number;
  nichoId: number;
}

export interface TablaEstadoCierreLecturasProps {
  data: EstadoCierreLecturas[];
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface AlertCerrarLecturasProps {
  nichoId: number;
  cantLecturas: number;
  cicloFact: number;
  periodo: string;
}

export interface TablaAlertCerrarLecturasProps {
  data: AlertCerrarLecturasProps[];
  isLoading: boolean;
  isAuthorized: boolean;
}

// Revisar Cálculo Factura
export interface CalculoPrefacturaEncabezado {
  modo: number;
  resultados: CalculoPrefacturaDetalle[];
}

export interface CalculoPrefacturaDetalle {
  sector: string;
  contratoId: number;
  codigoTarifa: string;
  rutCliente: string;
  nombreCliente: string;
  localId: string;
  direccion: string;
  comuna: string;
  numeroSerie: string;
  fechaLectura: string;
  consumoPeriodo: number;
  lecturaId: number;
}

// Tipos para los cargos de prefactura
export interface CalculoPrefacturaCargo {
  codigoEnerlova: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CalculoPrefacturaCargoResponse {
  contratoId: number;
  cargos: CalculoPrefacturaCargo[];
}

// Tipo combinado para mostrar en la tabla
export interface CalculoPrefacturaCompleto extends CalculoPrefacturaDetalle {
  cargos: CalculoPrefacturaCargo[];
  totalFacturado: number;
}

export interface EstadoProceso {
  codigoEstado: number;
  mensaje: string;
}

export interface TablaEstadoProcesoProps {
  data: EstadoProceso[];
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface IdentificadorProceso {
  cicloId: number;
  periodoId: string;
  procesoId: number;
  modo: number;
  fechaConsulta: string;
}

export interface TablaIdentificadorProcesoProps {
  data: IdentificadorProceso[];
  isLoading: boolean;
  isAuthorized: boolean;
}

// Cambio de Medidor

export interface ConsultaMedidorAntiguoResponse {
  codigo_acometida: string;
  numero_serie: string;
  tipo_medidor: string;
  constante_multiplicar: number;
  marca: string;
  modelo: string;
  lectura_actual: number | null;
  ultima_lectura: number;
  medidor_id: number;
}

export interface ConsultaMedidorNuevoResponse {
  medidor_id: number;
  tipo_medidor: string;
  constante_multiplicar: number;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado_medidor: number;
}

// Tipos para Cambio de Medidor
export interface MedidorAntiguo {
  acometida: string;
  numeroSerie: string;
}

export interface DetalleMedidorAntiguo {
  acometidaDetalle: string;
  constante: string;
  marca: string;
  ultimaLectura: string;
  numeroMedidor: string;
  tipo: string;
  modelo: string;
  lecturaActual: string;
  medidorId: number;
}

export interface MedidorNuevo {
  numeroSerie: string;
}

export interface DetalleMedidorNuevo {
  medidor_id: number;
  tipo_medidor: string;
  constante_multiplicar: number;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado_medidor: number;
}

// Props para los componentes de Cambio de Medidor
export interface AntiguoMedidorFormProps {
  medidorAntiguo: MedidorAntiguo;
  isLoading: boolean;
  onMedidorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBuscar: () => Promise<void>;
  onLimpiar: () => void;
}

export interface NuevoMedidorFormProps {
  medidorNuevo: MedidorNuevo;
  isLoading: boolean;
  onMedidorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBuscar: () => Promise<void>;
}

export interface DetalleMedidorAntiguoProps {
  detalleMedidorAntiguo: DetalleMedidorAntiguo;
  onUltimaLecturaChange?: (value: string) => void;
  onLecturaActualChange?: (value: string) => void;
}

export interface DetalleMedidorNuevoProps {
  detalleMedidorNuevo: DetalleMedidorNuevo;
  onDetalleMedidorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface NuevoContratoFormProps {
  codigoContrato: string;
  onCodigoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isFormValid: boolean;
  onCambioMedidor: () => Promise<void>;
}

export interface CambioMedidorProps {
  medidorAntiguoID: number;
  medidorNuevoID: number;
  valorUltimo: number;
  valorLecturaActual: number;
  valorPrimeraLectura: number;
  acometidaCodigo: string;
  usuario: string;
  fechaCierre: string;
  codigoContrato: number;
}

//Corte y Reposición
export interface TotalesCorteReposicion {
  codigo: string;
  cantidad: number;
}

export interface ConsultaRegistrosRevision {
  codigo: string;
  cantidad: number;
}

export interface ModificarRevision {
  success: boolean;
}

export interface IngresarRevision {
  success: boolean;
}

export interface ConsultaMantenedorRevision {
  ctId: string;
  seCodigo: string;
  meNSerie: string;
  clRut: string;
  clRazonSocialCompleto: string;
  niDescripcion: string;
  secDescripcion: string;
  reEstado: string;
  reCantDocumentos: number;
  reDeudaTotal: number;
  reFechaIngreso: string;
}

export interface ConsultarMantenedorRevisionCorte {
  ctId: string;
  seCodigo: string;
  meNSerie: string;
  clRut: string;
  clRazonSocialCompleto: string;
  niDescripcion: string;
  secDescripcion: string;
  reEstado: string;
  reCantDocumentos: number;
  reDeudaTotal: number;
}

export interface ReposicionESolicitadaProps {
  acometida: string;
}

export interface CorteRegistradoProps {
  acometida: string;
  fecha: string;
  hora: string;
  periodo: string;
}

export interface MarcarLiberarProps {
  acometida: string;
  comentario: string;
}

// Factura Anticipada

export interface ConsultaPeriodosFacturacion {
  descripcion: string;
  id: string;
}

export interface ConsultaPeriodoFacturacion {
  nombre: string;
  codigo: string;
}

export interface GenerarLecturaAnticipada {
  success: boolean;
}
