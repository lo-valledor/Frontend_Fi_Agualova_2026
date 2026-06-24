/* Ciclos de Facturación */
// ciclos/buscar, ciclos/{id}, ciclos/crear, ciclos/editar
export type CicloFacturacion = {
  id: number;
  nombre: string;
  diaFacturacion: number;
  diaInicioLectura: number;
  diasVencimientoFactura: number;
  estado: boolean;
};

export type CicloFacturacionFormValues = {
  nombre: string;
  diaFacturacion: number;
  diaInicioLectura: number;
  diasVencimientoFactura: number;
  estado: boolean;
  id: number;
};


/* Claves */
// claves/buscar, claves/{id}, claves/crear, claves/editar
export type Clave = {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  estado: boolean;
};

export type ClaveFormValues = {
  codigo: string;
  nombre: string;
  tipo: string;
  estado: boolean;
  id: number;
};

export type ClaveProps = {
  codigo: string;
  nombre: string;
  tipo: string;
  estado: boolean;
};

/* Conceptos */
// conceptos/buscar, conceptos/{id}, conceptos/crear, conceptos/editar
export type Concepto = {
  id: number;
  denominacion: string;
  descripcion: string;
  unidad: string;
  fijoVariable: string;
  conceptoAsociado: string;
};

export type ConceptoFormValues = {
  denominacion: string;
  descripcion: string;
  unidad: string;
  fijoVariable: string;
  conceptoAsociado: string;
  id: number;
};

export type ConceptoProps = {
  denominacion: string;
  descripcion: string;
  unidad: string;
  fijoVariable: string;
  conceptoAsociado: string;
};

export type ConceptoAsociables = {
  id: number;
  descripcion: string;
};

/* Empalme */
// empalmes/buscar, empalmes/{id}, empalmes/crear, empalmes/editar
export type Empalme = {
  id: string;
  nombre: string;
  codigoCliente: string;
  nombreEmpresa: string;
  potenciaContratada: number;
  tarifa: string;
};

export type EmpalmeFormValues = {
  id?: string;
  nombre: string;
  codigoCliente: string;
  nombreEmpresa: string;
  potenciaContratada: number;
  tarifa: string;
};

/* Marca */
// marcas/buscar, marcas/{id}, marcas/crear, marcas/editar
export type Marca = {
  id: string;
  nombre: string;
};

export type MarcaFormValues = {
  nombre: string;
  id: string;
};

/* Nichos */
// nichos/buscar, nichos/{id}, nichos/crear, nichos/editar
export type Nicho = {
  id: number;
  sector: string;
  nombre: string;
  ubicacion: string;
  estado: boolean;
};

export type NichoFormValues = {
  id?: number;
  idSector: number;
  nombre: string;
  ubicacion: string;
  estado: boolean;
};

export type NichoSector = {
  id: number;
  descripcion: string;
};

/* Parámetro */
// parametros/buscar, parametros/{id}, parametros/crear, parametros/editar
export type Parametro = {
  id: number;
  nombre: string;
  valor: string;
  sigla: string;
  estado: boolean;
};

export type ParametroFormValues = {
  nombre: string;
  valor: string;
  sigla: string;
  estado: boolean;
  id: number;
};

export type ParametroProps = {
  nombre: string;
  valor: string;
  sigla: string;
  estado: boolean;
};

/* Sector */
// sectores/buscar, sectores/{id}, sectores/crear, sectores/editar
export type Sector = {
  id: number;
  nombre: string;
  zona: string;
  estado: boolean;
};

export type SectorFormValues = {
  id: number;
  nombre: string;
  idZona: number;
  estado: boolean;
};

export type SectorZona = {
  id: string;
  descripcion: string;
};

/* Tarifas */
// tarifas/buscar, tarifas/{id}, tarifas/crear, tarifas/editar
export type Tarifa = {
  id: number;
  codigo: string;
  nombre: string;
};

export type TarifaFormValues = {
  codigo: string;
  nombre: string;
  id: number;
};

export type TarifaProps = {
  codigo: string;
  nombre: string;
};

/* Tipos de Contrato */
// tipos-contrato/buscar, tipos-contrato/{id}, tipos-contrato/crear, tipos-contrato/editar
export type TipoContrato = {
  id: number;
  nombre: string;
  estado: boolean;
};

export type TipoContratoFormValues = {
  nombre: string;
  estado: boolean;
  id: number;
};

export type TipoContratoProps = {
  nombre: string;
  estado: boolean;
};

/* Zonas */
// zonas/buscar, zonas/{id}, zonas/crear, zonas/editar
export type Zona = {
  id: number;
  nombre: string;
  referencia: string;
  estado: boolean;
};

export type ZonaProps = {
  nombre: string;
  referencia: string;
  estado: boolean;
};

export type ZonaFormValues = {
  nombre: string;
  referencia: string;
  estado: boolean;
  id: number;
};
