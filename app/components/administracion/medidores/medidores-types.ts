import type { Estado, Marca, MedidoresRow, Tipo } from '~/types/administracion';

export type MedidorListItem = MedidoresRow;
export type MedidorMarcaOption = Marca;
export type MedidorTipoOption = Tipo;
export type MedidorEstadoOption = Estado;

export interface MedidorModalState {
  delete: {
    isOpen: boolean;
  };
  asociarSubempalme: {
    isOpen: boolean;
  };
}

export interface MedidorErrorInfo {
  message: string;
  isNetworkError: boolean;
}

export interface SubempalmeOption {
  id: number;
  codigo: string;
  ubicacion: string;
  contratoId: string;
  descripcionEmpalme: string;
  descripcionNicho: string;
}

export interface MedidorFormState {
  idMarca: string;
  idTipo: string;
  modelo: string;
  serie: string;
  idEstado: string;
  fechaInicio: string;
  digitos: number;
  multiplicador: number;
  primeraLectura: string;
  fechaPrimeraLectura: string;
  horaPrimeraLectura: string;
  idSubEmpalme: string;
}
