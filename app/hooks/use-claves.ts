/**
 * Monitor Claves (Reading Keys) Hook
 *
 * Provides a hook for managing claves de lectura (reading keys) used in monitor operations.
 * Includes utilities for finding claves by description, ID, group, and getting specific keys.
 *
 * This hook is specific to the monitor module and provides additional utility functions
 * beyond simple data loading.
 */

import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type { Clave } from '~/types/monitor';
import { handleDataLoad } from './utils/data-loader';

/**
 * Clave option for select dropdowns
 */
interface ClaveOption {
  value: string;
  label: string;
  idClave: number;
}

/**
 * Return type for useClaves hook
 */
interface UseClaves {
  claves: Clave[];
  isLoading: boolean;
  error: string | null;
  getClaveByDescripcion: (descripcion: string) => Clave | null;
  getClaveById: (id: number) => Clave | null;
  getClavesForGroup: (groupId: string) => ClaveOption[];
  getClaveCorrectaId: () => string;
}

/**
 * Hook for managing claves de lectura (reading keys)
 *
 * Provides complete functionality for working with reading keys including:
 * - Loading all claves
 * - Finding claves by description (case-insensitive)
 * - Finding claves by ID
 * - Getting claves for a specific group
 * - Getting the correct reading key ID (LEOK - LECTURA CORRECTA)
 *
 * @returns {UseClaves} Hook state and utility functions
 *
 * @example
 * ```tsx
 * const {
 *   claves,
 *   isLoading,
 *   error,
 *   getClaveByDescripcion,
 *   getClavesForGroup
 * } = useClaves();
 *
 * // Find a specific clave
 * const claveCorrecta = getClaveByDescripcion('LECTURA CORRECTA');
 *
 * // Get claves for a group
 * const grupoClaves = getClavesForGroup('GRUPO_1');
 *
 * // Use in a select component
 * <Select options={getClavesForGroup('GRUPO_1')} />
 * ```
 */
export function useClaves(): UseClaves {
  const [claves, setClaves] = useState<Clave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaves = async (): Promise<{
      data?: Clave[] | null;
      error?: string | null;
    }> => {
      try {
        const response = await api.get('/Claves');
        return { data: response.data as Clave[] };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar las claves de lectura';
        console.error('Error al cargar las claves de lectura:', err);
        return { error: errorMessage };
      }
    };

    handleDataLoad(
      fetchClaves,
      (result) => setClaves(result || []),
      setError,
      setIsLoading
    );
  }, []);

  /**
   * Finds a clave by description (case-insensitive partial match)
   *
   * @param descripcion - Description to search for
   * @returns Matching clave or null if not found
   *
   * @example
   * ```tsx
   * const clave = getClaveByDescripcion('correcta');
   * if (clave) {
   *   console.log('Found:', clave.DescripcionClave);
   * }
   * ```
   */
  const getClaveByDescripcion = (descripcion: string): Clave | null => {
    if (!descripcion) {
      return null;
    }

    const normalizedSearch = descripcion.toLowerCase();
    return (
      claves.find(clave =>
        clave.DescripcionClave.toLowerCase().includes(normalizedSearch)
      ) || null
    );
  };

  /**
   * Finds a clave by exact ID match
   *
   * @param id - Clave ID to search for
   * @returns Matching clave or null if not found
   *
   * @example
   * ```tsx
   * const clave = getClaveById(22);
   * if (clave) {
   *   console.log('Found:', clave.DescripcionClave);
   * }
   * ```
   */
  const getClaveById = (id: number): Clave | null => {
    if (!id) {
      return null;
    }

    return claves.find(clave => clave.IdClave === id) || null;
  };

  /**
   * Gets all claves for a specific group as select options
   *
   * Returns an array of options suitable for use in select components,
   * including a default "Seleccione" option.
   *
   * @param groupId - Group identifier to filter by
   * @returns Array of ClaveOption objects for select component
   *
   * @example
   * ```tsx
   * const options = getClavesForGroup('GRUPO_LECTURAS');
   * <Select options={options} />
   * ```
   */
  const getClavesForGroup = (groupId: string): ClaveOption[] => {
    if (!groupId) {
      return [{ value: '0', label: 'Seleccione', idClave: 0 }];
    }

    const clavesGrupo = claves.filter(
      clave => clave.IdentificadorDeAgrupacion === groupId
    );

    return [
      { value: '0', label: 'Seleccione', idClave: 0 },
      ...clavesGrupo.map(clave => ({
        value: clave.IdClave.toString(),
        label: clave.DescripcionClave,
        idClave: clave.IdClave
      }))
    ];
  };

  /**
   * Gets the ID of the "LECTURA CORRECTA" clave
   *
   * This is a specific clave used to mark readings as correct.
   * Returns '22' as fallback if not found.
   *
   * @returns String ID of the correct reading clave
   *
   * @example
   * ```tsx
   * const claveCorrectaId = getClaveCorrectaId();
   * // Use in form submission or validation
   * ```
   */
  const getClaveCorrectaId = (): string => {
    const claveCorrecta = claves.find(clave =>
      clave.DescripcionClave.includes('LEOK - LECTURA CORRECTA')
    );
    return claveCorrecta ? claveCorrecta.IdClave.toString() : '22';
  };

  return {
    claves,
    isLoading,
    error,
    getClaveByDescripcion,
    getClaveById,
    getClavesForGroup,
    getClaveCorrectaId
  };
}
