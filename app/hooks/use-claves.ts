import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type { Clave } from '~/types/monitor';

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
    const fetchClaves = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/Claves');
        setClaves(response.data as Clave[]);
      } catch (err) {
        setError('Error al cargar las claves de lectura');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaves();
  }, []);

  const getClaveByDescripcion = (descripcion: string): Clave | null => {
    return (
      claves.find(clave =>
        clave.DescripcionClave.toLowerCase().includes(descripcion.toLowerCase())
      ) || null
    );
  };

  const getClaveById = (id: number): Clave | null => {
    return claves.find(clave => clave.IdClave === id) || null;
  };

  const getClavesForGroup = (groupId: string): ClaveOption[] => {
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

  // Función específica para obtener el ID de "LECTURA CORRECTA"
  const getClaveCorrectaId = (): string => {
    const claveCorrecta = claves.find(clave =>
      clave.DescripcionClave.includes('LEOK - LECTURA CORRECTA')
    );
    return claveCorrecta ? claveCorrecta.IdClave.toString() : '22'; // fallback al ID anterior
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
