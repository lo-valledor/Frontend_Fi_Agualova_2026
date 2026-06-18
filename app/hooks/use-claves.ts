import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type { Clave } from '~/types/monitor';
import { handleDataLoad } from './utils/data-loader';


interface ClaveOption {
  value: string;
  label: string;
  idClave: number;
}


interface UseClaves {
  claves: Clave[];
  isLoading: boolean;
  error: string | null;
  getClaveByDescripcion: (descripcion: string) => Clave | null;
  getClaveById: (id: number) => Clave | null;
  getClavesForGroup: (groupId: string) => ClaveOption[];
  getClaveCorrectaId: () => string;
}


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

  
  const getClaveById = (id: number): Clave | null => {
    if (!id) {
      return null;
    }

    return claves.find(clave => clave.IdClave === id) || null;
  };

  
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
