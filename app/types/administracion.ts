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

export type CondicionContratoFormValues = {
  descripcion: string;
  idConcepto: number;
  tipoCondicion: number;
  valor: number;
  estado: boolean;
  id: number;
};

export type Concepto = {
  id: number;
  descripcion: string;
};

// Contratos
export type ContratosRow = {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;
};

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

export type UpdateUsuario = {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  newPassword?: string;
};

export type UpdateRolUsuario = {
  nuevoRol: string;
};

export type Permisos = {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
};

export type CrearUsuario = {
  email: string;
  rol: string;
};
