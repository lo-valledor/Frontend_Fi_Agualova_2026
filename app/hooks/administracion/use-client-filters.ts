import { useMemo } from 'react';

import type { GetClientes } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByBoolean,
  filterByString,
  filterByPresence
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

/**
 * Filtros para clientes
 */
export interface ClientFilters {
  esEmpresa: string;
  comuna: string;
  codigoComuna: string;
  tieneContacto: string;
  tieneTelefono: string;
  tieneEmail: string;
}

/**
 * Opciones disponibles para filtros de clientes
 */
export interface ClientFilterOptions {
  tiposCliente: string[];
  comunas: string[];
  codigosComuna: string[];
}

/**
 * Alias para mantener compatibilidad con componentes existentes
 */
export type FilterOptions = ClientFilterOptions;

/**
 * Hook para filtrar clientes
 * Aplica SOLID: SRP (cada criterio es independiente)
 *
 * @param clients - Array de clientes a filtrar
 * @param filters - Filtros a aplicar
 * @returns Clientes filtrados, estadísticas y opciones
 *
 * @example
 * const { filteredClients, filterStats, filterOptions } = useClientFilters(
 *   clients,
 *   { esEmpresa: 'true', comuna: 'Santiago' }
 * );
 */
export function useClientFilters(
  clients: GetClientes[],
  filters: ClientFilters
) {
  /**
   * Extrae opciones únicas de los clientes
   * Tipos de cliente son estáticos
   */
  const filterOptions = useMemo((): ClientFilterOptions => {
    return {
      tiposCliente: ['Persona', 'Empresa'],
      comunas: extractUniqueOptions(clients, c => c.comuna),
      codigosComuna: extractUniqueOptions(clients, c => c.codigoComuna)
    };
  }, [clients]);

  /**
   * Aplica filtros con early returns
   * Cada filtro es una responsabilidad separada
   */
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

  /**
   * Calcula estadísticas de filtros
   */
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
