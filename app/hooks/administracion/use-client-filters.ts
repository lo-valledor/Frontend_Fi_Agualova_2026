import { useMemo } from 'react';

import type { GetClientes } from '~/types/administracion';

export interface ClientFilters {
  esEmpresa: string;
  comuna: string;
  codigoComuna: string;
  tieneContacto: string;
  tieneTelefono: string;
  tieneEmail: string;
}

export interface FilterOptions {
  tiposCliente: string[];
  comunas: string[];
  codigosComuna: string[];
}

export function useClientFilters(
  clients: GetClientes[],
  filters: ClientFilters
) {
  // Extraer opciones únicas de los clientes
  const filterOptions = useMemo((): FilterOptions => {
    const tiposCliente = ['Persona', 'Empresa'];
    const comunas = [
      ...new Set(clients.map(c => c.comuna).filter(Boolean))
    ].sort();
    const codigosComuna = [
      ...new Set(clients.map(c => c.codigoComuna).filter(Boolean))
    ].sort();

    return {
      tiposCliente,
      comunas,
      codigosComuna
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filtro por tipo de cliente (Persona/Empresa)
      if (
        filters.esEmpresa &&
        filters.esEmpresa !== 'all' &&
        client.esEmpresa.toString() !== filters.esEmpresa
      ) {
        return false;
      }

      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== 'all' &&
        client.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por código de comuna
      if (
        filters.codigoComuna &&
        filters.codigoComuna !== 'all' &&
        client.codigoComuna !== filters.codigoComuna
      ) {
        return false;
      }

      // Filtro por contacto
      if (
        filters.tieneContacto &&
        filters.tieneContacto !== 'all' &&
        ((filters.tieneContacto === 'true' && !client.contacto) ||
          (filters.tieneContacto === 'false' && client.contacto))
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== 'all' &&
        ((filters.tieneTelefono === 'true' && !client.telefono) ||
          (filters.tieneTelefono === 'false' && client.telefono))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== 'all' &&
        ((filters.tieneEmail === 'true' && !client.email) ||
          (filters.tieneEmail === 'false' && client.email))
      ) {
        return false;
      }

      return true;
    });
  }, [clients, filters]);

  const filterStats = useMemo(() => {
    const total = clients.length;
    const filtered = filteredClients.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [clients.length, filteredClients.length, filters]);

  return {
    filteredClients,
    filterStats,
    filterOptions
  };
}
