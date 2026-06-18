import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { GetPropietario, GetContratante } from '~/types/administracion';

// ============================================================================
// TIPOS - PROPIETARIOS
// ============================================================================


export interface CreatePropietarioRequest {
  rut: string;
  nombre: string;
  comuna: string;
  telefono: string;
  celular: string;
  email: string;
}


export interface UpdatePropietarioRequest {
  id: string | number;
  rut?: string;
  nombre?: string;
  comuna?: string;
  telefono?: string;
  celular?: string;
  email?: string;
}

export type PropietarioOperationResponse = {
  propietario: GetPropietario;
  message: string;
};

// ============================================================================
// TIPOS - CONTRATANTES
// ============================================================================


export interface CreateContratanteRequest {
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


export interface UpdateContratanteRequest {
  id: string | number;
  rut?: string;
  nombre?: string;
  apellido?: string;
  esEmpresa?: boolean;
  direccion?: string;
  comuna?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}

export type ContratanteOperationResponse = {
  contratante: GetContratante;
  message: string;
};

// ============================================================================
// SERVICIO - PROPIETARIOS
// ============================================================================


class PropietariosService extends BaseApiService {
  
  constructor(httpClient = api) {
    super(httpClient);
  }

  
  async getAll(): Promise<ServiceResponse<GetPropietario[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('propietario/buscar');
      return this.processResponseArray<GetPropietario>(response);
    }, 'Error al obtener propietarios');
  }

  
  async getById(
    id: string | number
  ): Promise<ServiceResponse<GetPropietario | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del propietario es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`propietario/${id}`);
      return this.processResponseSingle<GetPropietario>(response);
    }, `Error al obtener propietario ${id}`);
  }

  
  async create(
    data: CreatePropietarioRequest
  ): Promise<ServiceResponse<GetPropietario | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el propietario'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('propietario', data);
      return this.processResponseSingle<GetPropietario>(response);
    }, 'Error al crear propietario');
  }

  
  async update(
    data: UpdatePropietarioRequest
  ): Promise<ServiceResponse<GetPropietario | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del propietario es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(
        `propietario/${id}`,
        updateData
      );
      return this.processResponseSingle<GetPropietario>(response);
    }, `Error al actualizar propietario ${data.id}`);
  }

  
  async delete(id: string | number): Promise<ServiceResponse<string>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del propietario es requerido para eliminar'
      );
    }

    return this.executeOperation<string>(async () => {
      await this.httpClient.delete(`propietario/${id}`);
    }, `Propietario ${id} eliminado exitosamente`);
  }

  
  async getByCliente(
    clienteId: string | number
  ): Promise<ServiceResponse<GetPropietario[]>> {
    if (!clienteId) {
      return this.handleError(
        new Error('ID de cliente inválido'),
        'Se requiere el ID del cliente'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `propietario/cliente/${clienteId}`
      );
      return this.processResponseArray<GetPropietario>(response);
    }, `Error al obtener propietarios del cliente ${clienteId}`);
  }
}

// ============================================================================
// SERVICIO - CONTRATANTES
// ============================================================================


class ContratantesService extends BaseApiService {
  
  constructor(httpClient = api) {
    super(httpClient);
  }

  
  async getAll(): Promise<ServiceResponse<GetContratante[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('contratante/buscar');
      return this.processResponseArray<GetContratante>(response);
    }, 'Error al obtener contratantes');
  }

  
  async getById(
    id: string | number
  ): Promise<ServiceResponse<GetContratante | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del contratante es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`contratante/${id}`);
      return this.processResponseSingle<GetContratante>(response);
    }, `Error al obtener contratante ${id}`);
  }

  
  async create(
    data: CreateContratanteRequest
  ): Promise<ServiceResponse<GetContratante | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el contratante'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('contratante', data);
      return this.processResponseSingle<GetContratante>(response);
    }, 'Error al crear contratante');
  }

  
  async update(
    data: UpdateContratanteRequest
  ): Promise<ServiceResponse<GetContratante | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del contratante es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(
        `contratante/${id}`,
        updateData
      );
      return this.processResponseSingle<GetContratante>(response);
    }, `Error al actualizar contratante ${data.id}`);
  }

  
  async delete(id: string | number): Promise<ServiceResponse<string>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del contratante es requerido para eliminar'
      );
    }

    return this.executeOperation<string>(async () => {
      await this.httpClient.delete(`contratante/${id}`);
    }, `Contratante ${id} eliminado exitosamente`);
  }

  
  async getByCliente(
    clienteId: string | number
  ): Promise<ServiceResponse<GetContratante[]>> {
    if (!clienteId) {
      return this.handleError(
        new Error('ID de cliente inválido'),
        'Se requiere el ID del cliente'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `contratante/cliente/${clienteId}`
      );
      return this.processResponseArray<GetContratante>(response);
    }, `Error al obtener contratantes del cliente ${clienteId}`);
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const propietariosService = new PropietariosService();
export const contratantesService = new ContratantesService();

export default {
  propietariosService,
  contratantesService
};
