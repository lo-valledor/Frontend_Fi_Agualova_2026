/* Ciclos de Facturación */
// buscarCiclo, obtenerCiclo{id}, crearCiclo, modificarCiclo
export type CiclosFacturacion = {
  id: number;
  descripcion: string;
  diaFacturacion: number;
  diaInicioLectura: number;
  diasVencimientoFactura: number;
  estado: boolean;
};

/* Claves */
// buscarClaves, obtenerClave{id}, crearClave, modificarClave
export type Claves = {
  id: number;
  descripcion: string;
  estado: boolean;
  tipo: string;
  codigo: string;
};

/* Conceptos */
// buscarConceptos, obtenerConcepto{id}, crearConcepto, modificarConcepto
export type Conceptos = {
  id: number;
  denominacion: string;
  descripcion: string;
  unidad: string;
  fijoVariable: string;
  asociadoId?: number;
  asociadoDescripcion?: string | null;
};

export type ComboAsociadoConceptos = {
  id: number;
  descripcion: string;
};

/* Empalme */
// buscarEmpalmes, obtenerEmpalme{id}, crearEmpalmes, modificarEmpalmes{id}
export type Empalme = {
  codigo: string;
  nombre: string;
  codigoCliente: string;
  potenciaContratada: number;
  tarifa: string;
};

/* Marca */
// buscarMarca, obtenerMarca{id}, crearMarcaM, modificarMarca
export type Marca = {
  id?: number;
  codigo: string;
  nombre: string;
};

/* Nichos */
// buscarNichos, obtenerNicho{id}, crearNicho, modificarNicho
export type Nicho = {
  id: number;
  codigo?: string;
  sectorNombre: string;
  nombre: string;
  ubicacion: string;
  estado: boolean;
};

export type CreateNichoRequest = {
  sectorId: number;
  nombre: string;
  ubicacion: string;
  estado: boolean;
};

export type UpdateNichoRequest = {
  sectorId: number;
  nombre: string;
  ubicacion: string;
  estado: boolean;
};

/* Parámetro */
// buscarParametros, obtenerParametro{id}, crearParametro, modificarParametro
export type Parametro = {
  id: number;
  descripcion: string;
  valor: string;
  sigla: string;
  estado: boolean;
};

/* Sector */
// buscarSectores, obtenerSector{id}, crearSector, modificarSector
export type Sectores = {
  id: number;
  nombre: string;
  zona: string;
  estado: boolean;
};

/* Tipo Medidor */
// buscarTipoMedidor, obtenerTipoMedidor{id}, crearTipoMedidor, modificarTipoMedidor
export type Tarifas = {
  id: number;
  codigo: string;
  nombre: string;
};

/* Tipos de Contrato */
// buscarTiposContrato, obtenerTipoContrato{id}, crearTipoContrato, modificarTipoContrato
export type TiposContrato = {
  id: number;
  nombre: string;
  estado: boolean | string; // Puede ser boolean o string "Activo"/"Inactivo"
};

/* Zonas */
// buscarZonas, obtenerZona{id}, crearZona, modificarZona
export type Zonas = {
  id: number;
  nombre: string;
  referencia: string;
  estado: boolean;
};
