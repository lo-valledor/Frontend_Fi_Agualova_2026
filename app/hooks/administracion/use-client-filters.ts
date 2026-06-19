import { useMemo } from 'react';

import type { GetClientes } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByBoolean,
  filterByPresence,
  filterByString
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

export interface ClientFilters {
  esEmpresa: string;
  comuna: string;
  codigoComuna: string;
  tieneContacto: string;
  tieneTelefono: string;
  tieneEmail: string;
}

export interface ClientFilterOptions {
  tiposCliente: string[];
  comunas: string[];
  codigosComuna: string[];
}

export type FilterOptions = ClientFilterOptions;

export function useClientFilters(
  clients: GetClientes[],
  filters: ClientFilters
) {
  const filterOptions = useMemo((): ClientFilterOptions => {
    return {
      tiposCliente: ['Persona', 'Empresa'],
      comunas: extractUniqueOptions(clients, c => c.comuna),
      codigosComuna: extractUniqueOptions(clients, c => c.codigoComuna)
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filtro booleano: tipo de cliente
      if (!filterByBoolean(client.esEmpresa, filters.esEmpresa)) {
        return false;
      }

      // Filtros de string: comuna, código
      if (!filterByString(client.comuna, filters.comuna)) {
        return false;
      }

      if (!filterByString(client.codigoComuna, filters.codigoComuna)) {
        return false;
      }

      // Filtros de presencia: contacto, teléfono, email
      if (!filterByPresence(Boolean(client.contacto), filters.tieneContacto)) {
        return false;
      }

      if (!filterByPresence(Boolean(client.telefono), filters.tieneTelefono)) {
        return false;
      }

      if (!filterByPresence(Boolean(client.email), filters.tieneEmail)) {
        return false;
      }

      return true;
    });
  }, [clients, filters]);

  const filterStats = useMemo(
    () => calculateFilterStats(clients, filteredClients, filters),
    [clients.length, filteredClients.length, filters]
  );

  return {
    filteredClients,
    filterStats,
    filterOptions
  };
}
