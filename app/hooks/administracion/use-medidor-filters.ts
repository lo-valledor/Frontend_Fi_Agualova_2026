import { useMemo } from 'react';

import type { MedidorFilters } from '~/components/administracion/medidores/medidor-filters';
import type { GetMedidores } from '~/types/administracion';

export interface FilterOptions {
  marcas: string[];
  tipos: string[];
  modelos: string[];
  estados: string[];
}

export function useMedidorFilters(
  medidores: GetMedidores[],
  filters: MedidorFilters
) {
  // Extraer opciones únicas de los medidores
  const filterOptions = useMemo((): FilterOptions => {
    const marcas = [
      ...new Set(medidores.map(m => m.marca).filter(Boolean))
    ].sort();
    const tipos = [
      ...new Set(medidores.map(m => m.tipo).filter(Boolean))
    ].sort();
    const modelos = [
      ...new Set(medidores.map(m => m.modelo).filter(Boolean))
    ].sort();
    const estados = [
      ...new Set(medidores.map(m => m.estado).filter(Boolean))
    ].sort();

    return {
      marcas,
      tipos,
      modelos,
      estados
    };
  }, [medidores]);

  const filteredMedidores = useMemo(() => {
    return medidores.filter(medidor => {
      // Filtro por marca
      if (
        filters.marca &&
        filters.marca !== 'all' &&
        medidor.marca !== filters.marca
      ) {
        return false;
      }

      // Filtro por tipo
      if (
        filters.tipo &&
        filters.tipo !== 'all' &&
        medidor.tipo !== filters.tipo
      ) {
        return false;
      }

      // Filtro por modelo
      if (
        filters.modelo &&
        filters.modelo !== 'all' &&
        medidor.modelo !== filters.modelo
      ) {
        return false;
      }

      // Filtro por estado
      if (
        filters.estado &&
        filters.estado !== 'all' &&
        medidor.estado !== filters.estado
      ) {
        return false;
      }

      // Filtro por rango de dígitos
      if (filters.digitosMin || filters.digitosMax) {
        const digitos = medidor.digitos;

        if (
          filters.digitosMin &&
          digitos < Number.parseInt(filters.digitosMin)
        ) {
          return false;
        }

        if (
          filters.digitosMax &&
          digitos > Number.parseInt(filters.digitosMax)
        ) {
          return false;
        }
      }

      // Filtro por rango de multiplicador
      if (filters.multiplicarMin || filters.multiplicarMax) {
        const multiplicar = medidor.multiplicar;

        if (
          filters.multiplicarMin &&
          multiplicar < parseFloat(filters.multiplicarMin)
        ) {
          return false;
        }

        if (
          filters.multiplicarMax &&
          multiplicar > parseFloat(filters.multiplicarMax)
        ) {
          return false;
        }
      }

      // Filtro por tiene ubicación
      if (filters.tieneUbicacion && filters.tieneUbicacion !== 'all') {
        const tieneUbicacion = Boolean(
          medidor.ubicacion && medidor.ubicacion.trim() !== ''
        );
        if (filters.tieneUbicacion === 'true' && !tieneUbicacion) {
          return false;
        }
        if (filters.tieneUbicacion === 'false' && tieneUbicacion) {
          return false;
        }
      }

      // Filtro por tiene acometida
      if (filters.tieneAcometida && filters.tieneAcometida !== 'all') {
        const tieneAcometida = Boolean(
          medidor.codigoAcometida && medidor.codigoAcometida.trim() !== ''
        );
        if (filters.tieneAcometida === 'true' && !tieneAcometida) {
          return false;
        }
        if (filters.tieneAcometida === 'false' && tieneAcometida) {
          return false;
        }
      }

      // Filtro por rango de fecha de inicio
      if (filters.fechaInicioDesde || filters.fechaInicioHasta) {
        const fechaInicio = medidor.fechaInicio
          ? new Date(medidor.fechaInicio)
          : null;

        // Si no hay fecha de inicio y se est� filtrando por fechas, excluir
        if (
          !fechaInicio &&
          (filters.fechaInicioDesde || filters.fechaInicioHasta)
        ) {
          return false;
        }

        if (fechaInicio) {
          if (filters.fechaInicioDesde) {
            const fechaDesde = new Date(filters.fechaInicioDesde);
            if (fechaInicio < fechaDesde) {
              return false;
            }
          }

          if (filters.fechaInicioHasta) {
            const fechaHasta = new Date(filters.fechaInicioHasta);
            // Agregar un día para incluir la fecha hasta completa
            fechaHasta.setDate(fechaHasta.getDate() + 1);
            if (fechaInicio >= fechaHasta) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }, [medidores, filters]);

  const filterStats = useMemo(() => {
    const total = medidores.length;
    const filtered = filteredMedidores.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [medidores.length, filteredMedidores.length, filters]);

  return {
    filteredMedidores,
    filterStats,
    filterOptions
  };
}
