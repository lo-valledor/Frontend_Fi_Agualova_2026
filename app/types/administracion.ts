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
