import { useMemo } from "react"
import type { GetContratos } from "~/types/administracion"
import type { ContractFilters } from "~/components/administracion/contratos/contract-filters"

export interface FilterOptions {
  tiposContrato: string[];
  ciclosFacturacion: string[];
  tarifas: string[];
  comunas: string[];
}

export function useContractFilters(contracts: GetContratos[], filters: ContractFilters) {
  // Extraer opciones únicas de los contratos
  const filterOptions = useMemo((): FilterOptions => {
    const tiposContrato = [...new Set(contracts.map(c => c.tipoContrato).filter(Boolean))].sort();
    const ciclosFacturacion = [...new Set(contracts.map(c => c.cicloFacturacion).filter(Boolean))].sort();
    const tarifas = [...new Set(contracts.map(c => c.tarifa).filter(Boolean))].sort();
    const comunas = [...new Set(contracts.map(c => c.comunaEnvio).filter(Boolean))].sort();

    return {
      tiposContrato,
      ciclosFacturacion,
      tarifas,
      comunas,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // Filtro por tipo de contrato
      if (filters.tipoContrato && filters.tipoContrato !== 'all' && contract.tipoContrato !== filters.tipoContrato) {
        return false
      }

      // Filtro por ciclo de facturación
      if (filters.cicloFacturacion && filters.cicloFacturacion !== 'all' && contract.cicloFacturacion !== filters.cicloFacturacion) {
        return false
      }

      // Filtro por tarifa
      if (filters.tarifa && filters.tarifa !== 'all' && contract.tarifa !== filters.tarifa) {
        return false
      }

      // Filtro por comuna
      if (filters.comuna && filters.comuna !== 'all' && contract.comunaEnvio !== filters.comuna) {
        return false
      }

      // Filtro por estado activo
      if (filters.activo && filters.activo !== 'all' && contract.activo.toString() !== filters.activo) {
        return false
      }

      // Filtro por liberado de corte
      if (filters.liberadoCorte && filters.liberadoCorte !== 'all' && contract.liberadoCorte.toString() !== filters.liberadoCorte) {
        return false
      }

      // Filtro por rango de fecha de término
      if (filters.fechaTerminoDesde || filters.fechaTerminoHasta) {
        const fechaTermino = contract.fechaTermino ? new Date(contract.fechaTermino) : null

        // Si no hay fecha de término y se está filtrando por fechas, excluir
        if (!fechaTermino && (filters.fechaTerminoDesde || filters.fechaTerminoHasta)) {
          return false
        }

        if (fechaTermino) {
          if (filters.fechaTerminoDesde) {
            const fechaDesde = new Date(filters.fechaTerminoDesde)
            if (fechaTermino < fechaDesde) {
              return false
            }
          }

          if (filters.fechaTerminoHasta) {
            const fechaHasta = new Date(filters.fechaTerminoHasta)
            // Agregar un día para incluir la fecha hasta completa
            fechaHasta.setDate(fechaHasta.getDate() + 1)
            if (fechaTermino >= fechaHasta) {
              return false
            }
          }
        }
      }

      return true
    })
  }, [contracts, filters])

  const filterStats = useMemo(() => {
    const total = contracts.length
    const filtered = filteredContracts.length
    const activeFilters = Object.values(filters).filter((value) => value !== "" && value !== "all").length

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0,
    }
  }, [contracts.length, filteredContracts.length, filters])

  return {
    filteredContracts,
    filterStats,
    filterOptions,
  }
}
