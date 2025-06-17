export interface Usuarios {
  idUsuario: number;
  nombreDeUsuario: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface CrearUsuarioProps {
  nombreDeUsuario: string;
  contrasena: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
}

export interface ActualizarUsuarioProps {
  nombreDeUsuario: string;
  contrasena: string;
  nuevaContrasena?: string;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
}

//Contratos

export interface GetContratos {
  codigoContrato: string;
  acometida: string;
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  nombreCliente: string;
  local: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  comunaEnvio: string;
  direccionEnvio: string;
  limiteInvierno: number;
  promedioAnual: string;
  cicloFacturacion: string;
  potenciaContratada: string;
  liberadoCorte: boolean;
}

export interface ContratosDisponibles {
  contratoId: string;
  local: string;
  tipoContrato: string;
  tarifa: string;
  propietario: string;
  clienteNombre: string;
  clienteApellidos: string;
  empresa: string;
  fechaInicio: string;
  fechaFin: string;
  direccionEnvio: string;
  limiteInventario: number;
  cicloFacturacion: string;
  estadoActivo: boolean;
}

export interface ContratosDisponiblesPorId {
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  rutPropietario: string;
  nombreCliente: string;
  rutCliente: string;
  localId: string;
  codigoLocal: string;
  fechaInicio: string;
  activoTexto: string;
  fechaTermino: string;
  direccion: string;
  codigoComuna: string;
  limiteInvierno: number;
  cicloFacturacion: string;
  potenciaContratada: string;
  comunaNombre: string;
  esMadreTexto: string;
  codigoContratoMadre: string;
  lugarEntrega: string;
  liberadoCorteTexto: string;
}

export interface CrearContratoProps {
  tipoContrato: number;
  tarifa: number;
  propietario: string;
  cliente: string;
  localId: string;
  fechaInicio: string;
  activo: boolean;
  direccion: string;
  comuna: string;
  limite: number;
  ciclo: number;
  potencia: string;
  guardaCliente: string;
  esMadre: string;
  madre: string;
  lugar: string;
  sinCorte: number;
}

export interface ModificarContratoProps {
  codigo: string;
  tipoContrato: number;
  tarifa: number;
  propietario: string;
  cliente: string;
  localId: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  direccion: string;
  comuna: string;
  limite: number;
  ciclo: number;
  potencia: string;
  madre: string;
  lugar: string;
  sinCorte: number;
}

export interface ContratoFormData {
  tipoContrato: string
  tarifa: string
  nombrePropietario: string
  nombreCliente: string
  local: string
  fechaInicio: string
  activo: boolean
  fechaTermino: string
  comunaEnvio: string
  direccionEnvio: string
  limiteInvierno: number
  promedioAnual: string
  cicloFacturacion: string
  potenciaContratada: string
  liberadoCorte: boolean
}

export interface GetRegiones {
  region: string;
  codigo: string;
  totalComunas: number;
}

export interface GetComunas {
  nombre: string;
  region: string;
  codigo: string;
}

export interface GetContratosClientes {
  codigoContrato: string;
  acometida: string;
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  nombreCliente: string;
  local: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  comunaEnvio: string;
  direccionEnvio: string;
  limiteInvierno: number;
  promedioAnual: string;
  cicloFacturacion: string;
  potenciaContratada: string;
  liberadoCorte: boolean;
}

export interface GetLimiteInvierno {
  valor: string;
}

export interface GetFechaActual {
  fecha: string;
}

// Acometidas

export interface Acometida {
  acometidaId: number;
  codigo: string;
  ubicacion: string;
  contratoId: string;
  empalmeDescripcion: string;
  nichoDescripcion: string;
  sectorDescripcion: string;
  limitePotencia: number | null;
  numeroMedidor: string;
}

export interface AcometidaPorId {
  acometidaId: number;
  ubicacion: string;
  contratoId: string;
  empalmeId: number;
  nichoId: number;
  codigo: string;
  limitePotencia: number | null;
}

export interface CrearAcometidaProps {
  ubicacion: string;
  empalmeId: number;
  nichoId: number;
  contratoId: string;
  codigo: number;
  limitePotencia: number;
}

export interface ActualizarAcometidaProps {
  acometidaId: number;
  ubicacion: string;
  empalmeId: number;
  nichoId: number;
  contratoId: string;
  limitePotencia: number;
}

export interface AcometidaPorContratos {
  contratoId: string;
  local: string;
  tipoContrato: string;
  tarifa: string;
  propietario: string;
  clienteNombre: string;
  clienteApellidos: string;
  empresa: string;
  fechaInicio: string;
  fechaFin: string;
  direccionEnvio: string;
  limiteInventario: number;
  cicloFacturacion: string;
  estadoActivo: boolean;
}

export interface ComboEmpalmes {
  id: string;
  nombre: string;
}

export interface ComboNichos {
  id: string;
  nombre: string;
}

export interface ComboSectores {
  id: string;
  nombre: string;
}

// Cargo Tipo Facturable

export interface BuscarCargoFacturable {
  id: number;
  cuenta: string;
  descripcion: string;
  fijoVariable: string;
  periodicoEventual: string;
  concepto: string;
  tarifa: string;
  tipoMedidor: string;
  tipo: string;
  codigoEnerlova: string;
}

export interface CrearCargoFacturableProps {
  cuenta: string;
  descripcion: string;
  fijoVariable: string;
  periodicoEventual: string;
  conceptoId: number;
  tarifaId: number;
  tipoMedidorId: number;
  tipo: number;
  codigoEnerlova: string;
  mostrarValorCero: boolean;
}

export interface ActualizarCargoFacturableProps {
  cuenta: string;
  descripcion: string;
  fijoVariable: string;
  periodicoEventual: string;
  conceptoId: number;
  tarifaId: number;
  tipoMedidorId: number;
  tipo: number;
  codigoEnerlova: string;
  mostrarValorCero: boolean;
  id: number;
}

// Medidores

export interface BuscarMedidores {
  codigo: number;
  marca: string;
  tipo: string;
  modelo: string;
  serie: string;
  fechaInicio: string;
  digitos: number;
  multiplicar: number;
  ubicacion: string;
  estado: string;
  codigoAcometida: string;
}

export interface CrearMedidorProps {
  marcaId: number;
  tipoId: number;
  modelo: string;
  serie: string;
  estadoId: number;
  fechaInicio: string;
  digitos: number;
  multiplicar: number;
  primeraLectura: string;
  fechaPrimeraLectura: string;
}

export interface ActualizarMedidorProps {
  codigoMedidor: number;
  marcaId: number;
  modelo: string;
  serie: string;
  estadoId: number;
  fechaInicio: string;
  digitos: number;
  multiplicar: number;
  tipoId: number;
  subempalmeCodigo: string;
  primeraLectura: string;
  fechaPrimeraLectura: string;
}

export interface ModificarSubempalmeProps {
  codigoMedidor: number;
  subempalmeId: number;
}

// Clientes

export interface GetClientes {
  rut: string;
  nombreCompleto: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  email: string;
  codigoComuna: string;
}

export interface GetGiros {
  codigo: string;
  actividadEconomica: string;
  afectoIVA: string;
  categoriaTributaria: string;
}

export interface GetClientesByRut {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  codComuna: string;
  contacto: string;
  telefono: string;
  correo: string;
  codigoGiro: string;
  giro: string;
}

export interface ClientesFormData {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  codComuna: string;
  contacto: string;
  telefono: string;
  correo: string;
  codigoGiro: string;
}

// Cargo Tipo Contrato

export interface GetCargoTipoContrato {
  tipoContratoId: number;
  tipoContratoDescripcion: string;
  cargoFacturableDescripcion: string;
  condicionContratoDescripcion: string;
  estado: boolean;
  descripcion: string;
}

// Condiciones Contrato

export interface GetCondicionesContrato {
  id: number;
  descripcion: string;
  concepto: string;
  factorPorcentual: string;
  valorFijo: number | null;
  estado: boolean;
}