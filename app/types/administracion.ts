export interface Usuarios {
  idUsuario: number;
  nombreDeUsuario: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
  fechaCreacion: string;
  email: string | null;
  roles: any[];
}

export interface PermisoUsuario {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export interface CrearUsuarioProps {
  nombreDeUsuario: string;
  contrasena: string;
  email: string;
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

export interface ContratanteProps {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  email: string;
}

export interface GetClienteContrato {
  rut: string;
  nombre: string;
  esEmpresa: boolean;
  direccion: string;
  comunaCodigo: string;
  contacto: string;
  telefono: string;
  email: string;
  comunaDescripcion: string;
}

export interface GetLocal {
  numeroLocal: string;
  empresa: string;
  estadoHabilitado: string;
  propietario: string;
  sector: string;
}

export interface GetPropietario {
  rut: string;
  nombre: string;
  comuna: string;
  telefono: string;
  celular: string;
  email: string;
}

export interface GetContratante {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  email: string;
}

export interface GetMadres {
  codigoContrato: string;
  subEmpalme: string;
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  nombreCliente: string;
  numeroLocal: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  comunaEnvio: string;
  direccionEnvio: string;
  limiteInvierno: number;
  cicloFacturacion: string;
  potenciaContratada: string;
}

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
  madre?: string; // Campo opcional para contrato madre
}

export interface GetContratoPorId {
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

export interface ContratoMadresBuscar {
  nombrePropietario: string;
  rutPropietario: string;
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
  madre: string;
}

export interface ActualizarPropietariosLocal {
  registrosAfectados: 0;
  mensaje: 'Propietarios sincronizados correctamente.';
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
  codigo: string;
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
  mostrarValorCero: boolean;
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

export interface GeCombosConceptos {
  id: number;
  nombre: string;
}

export interface GetCombosTarifas {
  id: number;
  nombre: string;
}

export interface GetCombosTiposMedidor {
  id: number;
  nombre: string;
}

// Medidores

export interface GetMedidores {
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

export interface GetMedidorByCodigo {
  mM_ID: string;
  tM_ID: number;
  modelo: string;
  numeroSerie: string;
  estadoId: number;
  fechaInicio: string;
  digitos: number;
  constanteMultiplicar: number;
  subEmpalmeId: number;
  codigoSubEmpalme: string;
  estadoNombre: string;
}

export interface GetMedidorLecturas {
  cantidadLecturas: string;
}

export interface CrearMedidorProps {
  marcaId: string; // Cambiado de number a string según el backend
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
  marcaId: string; // Cambiado de number a string según el backend
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

export interface GetMedidoresSubempalmes {
  id: number;
  codigo: string;
  ubicacion: string;
  contratoId: number;
  descripcionEmpalme: string;
  descripcionNicho: string;
}

export interface SubempalmeOption {
  id: number;
  codigo: string;
  ubicacion: string;
  contratoId: number;
  descripcionEmpalme: string;
  descripcionNicho: string;
}

export interface MedidorSubempalmeProps {
  ubicacion: string;
  codigoAcometida: string;
}

export interface GetMedidorByLecturas {
  cantidadLecturas: string;
}

export interface GetExportarMedidoresByNombreYSerie {
  nombre: string;
  serie: string;
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

export interface GetClienteById {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  codComuna: string;
  contacto: string;
  telefono: string;
  email: string;
  codigoGiro: string;
  giro: string;
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

export interface CargoTipoContratoEditor {
  grilla: CargoTipoDetalle[];
  cargoMonofasico: CargoTipoListbox[];
  cargoTrifasico: CargoTipoListbox[];
  cargoAmbos: CargoTipoListbox[];
}

export interface CargoTipoDetalle {
  cargoId: number;
  cargoDescripcion: string;
  condicionId: number;
  condicionDescripcion: string;
  descripcion: string;
}

export interface CargoTipoListbox {
  tipoMedidor: number;
  cargoId: number;
  cargoDescripcion: string;
}

export interface GuardarCargoTipoContratoConfiguracion {
  tipoContratoId: number;
  configuraciones: ConfiguracionCargo[];
  cargoMonofasicoIds: number[];
  cargoTrifasicoIds: number[];
  cargoAmbosIds: number[];
}

export interface ConfiguracionCargo {
  cargoId: number;
  tipoContratoId: number;
  condicionId: number;
  descripcion: string;
}

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
  nombre: string;
  concepto: string;
  factorPorcentual: string;
  valorFijo: number | null;
  estado: boolean;
}

export interface GetCondicionesContratoPorId {
  id: number;
  descripcion: string;
  conceptoId: number;
  usaPorcentaje: boolean;
  valor: number;
  estado: boolean;
  factorPorcentual: number;
  valorFijo: number | null;
  tipo: number;
}

export interface CrearCondicionContratoProps {
  nombre: string;
  conceptoId: number;
  usaPorcentaje: boolean;
  valor: number;
  estado: boolean;
}

export interface ActualizarCondicionContratoProps {
  codigo: number;
  nombre: string;
  conceptoId: number;
  usaPorcentaje: boolean;
  valor: number;
  estado: boolean;
}

export interface MedidorFormData {
  marca: string;
  tipo: string;
  modelo: string;
  serie: string;
  estado: string;
  fechaInicio: string;
  digitos: number;
  multiplicar: number;
  primeraLectura: string;
  fechaPrimeraLectura: string;
}
