// Acometida
export type AcometidaRow = {
  idAcometida: number;
  codigo: string;
  ubicacion: string;
  contratoId: string;
  empalme: string;
  nicho: string;
  sector: string;
  limitePotencia: string;
  medidor: string;
};

export type AcometidaDetail = AcometidaRow & {
  idEmpalme?: number | string | null;
  idNicho?: number | string | null;
  idContrato?: string | null;
};

export type AcometidaProps = {
  codigo: string;
  ubicacion: string;
  idEmpalme: number;
  idNicho: number;
  idContrato: string;
  limitePotencia: string;
};

export type AcometidaFormValues = {
  codigo: string;
  ubicacion: string;
  idEmpalme: string;
  idNicho: string;
  idContrato: string;
  limitePotencia: string;
  idAcometida: number | null;
};

export type Sectores = {
  id: string;
  descripcion: string;
};

export type Nichos = {
  id: string;
  descripcion: string;
};

export type Empalmes = {
  id: string;
  descripcion: string;
};

export type BuscarContratosLibres = {
  idContrato: string;
  local: string;
  tipoContrato: string;
  tarifa: string;
  propietario: string;
  cliente: string;
  apellido: string;
  empresa: string;
};

// Cargo Facturable
export type CargoFacturableRow = {
  id: number;
  cuenta: string;
  descripcion: string;
  fijoVariable: string;
  periodicoEventual: string;
  concepto: string;
  tarifa: string;
  tipoMedidor: string;
  tipoCargo: string;
  codigoEnerlova: string;
};

export type CargoFacturableConceptos = {
  id: string;
  descripcion: string;
};

export type CargoFacturableTarifas = {
  id: string;
  descripcion: string;
};

export type CargoFacturableTiposMedidor = {
  id: string;
  descripcion: string;
};

export type CargoFacturableProps = {
  cuenta: string;
  descripcion: string;
  fijoVariable: string;
  periodicoEventual: string;
  idConcepto: number;
  idTarifa: number;
  idTipoMedidor: number;
  tipoCargo: number;
  codigoEnerlova: string;
  muestraValorCero: boolean;
};

export type CargoFacturableFormValues = {
  cuenta: string;
  descripcion: string;
  fijoVariable: string;
  periodicoEventual: string;
  idConcepto: number;
  idTarifa: number;
  idTipoMedidor: number;
  tipoCargo: number;
  codigoEnerlova: string;
  muestraValorCero: boolean;
  id: number;
};

// Cargo Tipo Contrato
export type CargoTipoContrato = {
  idTipoContrato: number;
  tipoContrato: string;
  cargoFacturable: string;
  condicionContrato: string;
  descripcion: string;
  estado: boolean;
};

export type TiposContrato = {
  id: string;
  descripcion: string;
};

export type Conceptos = {
  id: string;
  descripcion: string;
};

export type Condiciones = {
  id: string;
  descripcion: string;
};

export type CargosFacturables = {
  id: string;
  descripcion: string;
};

export type CondicionesGrilla = {
  idCargo: number;
  nombreCargo: string;
  idCondicion: number;
  nombreCondicion: string;
  descripcion: string;
};

export type CargoTipoContratoById = {
  idTipoContrato: number;
  condicionesGrilla: CondicionesGrilla[];
  cargosMonofasicos: number[];
  cargosTrifasicos: number[];
  cargosAmbos: number[];
};

export type GuardarConfiguracionPayload = {
  idTipoContrato: number;
  condiciones: {
    idCargo: number;
    idCondicion: number;
    descripcion: string;
  }[];
  idsCargosMonofasicos: number[];
  idsCargosTrifasicos: number[];
  idsCargosAmbos: number[];
};

//Clientes
export type ClientesRow = {
  rut: string;
  razonSocialNombre: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  email: string;
  codigoComuna: string;
};

export type Cliente = {
  nombreComuna: string;
  nombreGiro: string;
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  codigoComuna: string;
  contacto: string;
  telefono: string;
  email: string;
  codigoGiro: string;
};

export type ClienteFormValues = {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  codigoComuna: string;
  contacto: string;
  telefono: string;
  email: string;
  codigoGiro: string;
};

export type NombreRegion = string | { nombreRegion: string };

export type NombreComuna =
  | string
  | {
      codigo: string;
      nombre: string;
      provincia: string;
    };

export type NombreGiro =
  | string
  | {
      codigo: string;
      actividad: string;
      afectoIva: string;
      categoria: string;
    };

// Condiciones Contrato
export type CondicionesContratoRow = {
  id: number;
  descripcion: string;
  concepto: string;
  factorPorcentual: string;
  valorFijo: string;
  estado: boolean;
};

export type CondicionContrato = {
  id: number;
  descripcion: string;
  idConcepto: number;
  tipoCondicion: number;
  valor: number;
  estado: boolean;
};

export type CondicionContratoProps = {
  descripcion: string;
  idConcepto: number;
  tipoCondicion: number;
  valor: number;
  estado: boolean;
};

export type CondicionContratoFormValues = {
  descripcion: string;
  idConcepto: number;
  tipoCondicion: number;
  valor: number;
  estado: boolean;
  id: number;
};

export type CondicionContratoConcepto = {
  id: number;
  descripcion: string;
};

// Contratos
export type ContratosRow = {
  idContrato: number;
  subEmpalme: string;
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  nombreCliente: string;
  localEmpresa: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  comunaEnvio: string;
  direccionEnvio: string;
  limiteInvierno: number;
  ciclo: string;
  potencia: string;
  liberadoCorte: boolean;
};

export type GetContratoById = {
  idContrato: string;
  idTipoContrato: number;
  idTarifa: number;
  nombrePropietario: string;
  rutPropietario: string;
  nombreCliente: string;
  rutCliente: string;
  idLocal: string;
  lugarEntrega: string;
  fechaInicio: string;
  fechaTermino: string;
  activo: boolean;
  direccionEnvio: string;
  comunaEnvio: string;
  nombreComuna: string;
  limiteInvierno: number;
  idCiclo: number;
  potencia: string;
  esMadre: boolean;
  idContratoMadre: string;
  liberadoCorte: boolean;
};

export type ContratoProps = {
  idTipoContrato: number;
  idTarifa: number;
  rutPropietario: string;
  rutCliente: string;
  idLocal: string;
  fechaInicio: string;
  activo: boolean;
  direccion: string;
  codigoComuna: string;
  limiteInvierno: number;
  idCiclo: number;
  potencia: string;
  crearClienteDesdePropietario: boolean;
  esMadre: boolean;
  idContratoMadre: string;
  lugarEntrega: string;
  liberadoCorte: boolean;
};

export type ContratoFormValues = ContratoProps & {
  idContrato: string;
  fechaTermino: string;
};

export type GetContratoPorId = GetContratoById;

// Medidores
export type MedidoresRow = {
  idMedidor: number;
  marca: string;
  tipo: string;
  modelo: string;
  serie: string;
  fechaInicio: string;
  digitos: number;
  multiplicador: number;
  ubicacion: string;
  estado: string;
  codigoAcometida: string;
};

export type MedidorByCodigo = {
  idMedidor: number;
  codigoAcometida: string;
  nombreEstado: string;
  lecturaActual: string;
  cantidadLecturas: number;
  idMarca: string;
  idTipo: number;
  modelo: string;
  serie: string;
  idEstado: string;
  fechaInicio: string;
  digitos: number;
  multiplicador: number;
  primeraLectura: string | null;
  fechaLectura: string | null;
  horaLectura: string | null;
  minutoLectura: string | null;
  idSubEmpalme: string;
};

export type MedidorProps = {
  idMarca: string;
  idTipo: string;
  modelo: string;
  serie: string;
  idEstado: string;
  fechaInicio: string;
  digitos: number;
  multiplicador: number;
  primeraLectura: string;
  fechaLectura: string;
  horaLectura: string;
  minutoLectura: string;
  idSubEmpalme: string;
};

export type MedidorFormValues = {
  idMarca: string;
  idTipo: string;
  modelo: string;
  serie: string;
  idEstado: string;
  fechaInicio: string;
  digitos: number;
  multiplicador: number;
  primeraLectura: string;
  fechaLectura: string;
  horaLectura: string;
  minutoLectura: string;
  idSubEmpalme: string;
  codigoMedidor: string;
};

export type Marca = {
  id: number;
  descripcion: string;
};

export type Tipo = {
  id: number;
  descripcion: string;
};

export type Estado = {
  id: number;
  descripcion: string;
};

export type BuscarAcometidas = {
  id: number;
  codigo: string;
  ubicacion: string;
  contratoId: string;
  empalme: string;
  nicho: string;
};

export type PropietariosRow = {
  rut: string;
  nombre: string;
  direccion: string;
  comuna: string;
  telefono: string;
  celular: string;
  email: string;
};

// Usuarios
export type Usuarios = {
  nombre_Usuario: string;
  apellidos_Usuario: string;
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
};

export type PermisosUsuario = {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
};

export type GetUserById = {
  id: string;
  userName: string;
  email: string;
  nombre_Usuario: string;
  apellidos_Usuario: string;
  rol: string;
  permisos: PermisosUsuario[];
};

export type UpdateUsuario = {
  nombre: string;
  apellido: string;
};

export type RegistrarUsuario = {
  username: string;
  email: string;
  password: string;
  nombre: string;
};

export type ForgotPassword = {
  email: string;
};

export type ResetPassword = {
  email: string;
  token: string;
  newPassword: string;
};

export type UpdateRolUsuario = {
  nuevoRol: string;
};

export type Roles = {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: string | null;
};
export type Permisos = {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
};

export type UpdateRolePermissions = {
  roleId: string;
  permisos: Permisos[];
};

export type CreateRolUser = {
  email: string;
  rol: string;
};

/**
 * Contratantes
 */

export type GetContratante = {
  rut: string;
  nombre: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  telefono: string;
  email: string;
};

export type ContratanteFormValues = {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  codigoComuna: string;
  contacto: string;
  telefono: string;
  email: string;
};

export type ContratoErrorInfo = {
  message: string;
  isNetworkError: boolean;
};

export type ContratoModalState = {
  delete: { isOpen: boolean };
  details: { isOpen: boolean };
};

export type UsuarioErrorInfo = {
  message: string;
  isNetworkError: boolean;
};

export type UsuarioModalState = {
  userForm: {
    isOpen: boolean;
    mode: UsuarioModalMode;
  };
  deleteDialog: { isOpen: boolean };
  permissions: { isOpen: boolean };
  roles: { isOpen: boolean };
};

export type UsuarioModalMode = 'add' | 'edit' | 'view' | null;
