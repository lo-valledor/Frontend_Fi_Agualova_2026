import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  usePrepararLecturasData,
  useAsignacionSectores,
  usePreciosCargo,
  useRevisarPrecio,
  useCorteReposicion,
  useCerrarLecturas,
  usePeriodoFacturacion,
  usePeriodoAbierto
} from './use-operaciones';
import { operacionesService } from '~/services/operacionesService';

// Mock operacionesService
vi.mock('~/services/operacionesService', () => ({
  operacionesService: {
    getPrepararLecturasData: vi.fn(),
    getAsignacionSectores: vi.fn(),
    getPreciosCargoData: vi.fn(),
    getRevisarPrecioData: vi.fn(),
    getCorteReposicionData: vi.fn(),
    getCerrarLecturasData: vi.fn(),
    getPeriodoFacturacionData: vi.fn(),
    getPeriodoAbierto: vi.fn()
  }
}));

describe('Operaciones Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============ usePrepararLecturasData Tests ============
  describe('usePrepararLecturasData', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getPrepararLecturasData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => usePrepararLecturasData());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debería cargar datos exitosamente', async () => {
      const mockData = {
        periodoAbierto: [{ mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }],
        lecturasPendientes: { pendientes: 5 },
        sectores: [{ id: 1, nombre: 'Sector A' }],
        opcionesPreparar: [{ id: 1, valor: 'Opción 1' }]
      };

      vi.mocked(operacionesService.getPrepararLecturasData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => usePrepararLecturasData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Error al cargar datos';
      vi.mocked(operacionesService.getPrepararLecturasData).mockResolvedValueOnce({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => usePrepararLecturasData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });

    it('debería proporcionar función refreshData', async () => {
      const mockData = {
        periodoAbierto: [],
        lecturasPendientes: {},
        sectores: [],
        opcionesPreparar: []
      };

      vi.mocked(operacionesService.getPrepararLecturasData).mockResolvedValue({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => usePrepararLecturasData());

      await waitFor(() => {
        expect(typeof result.current.refreshData).toBe('function');
      });

      expect(vi.mocked(operacionesService.getPrepararLecturasData)).toHaveBeenCalled();
    });
  });

  // ============ useAsignacionSectores Tests ============
  describe('useAsignacionSectores', () => {
    it('debería inicializar con valores por defecto', () => {
      const { result } = renderHook(() => useAsignacionSectores());

      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debería proporcionar función loadAsignacionSectores', () => {
      const { result } = renderHook(() => useAsignacionSectores());

      expect(typeof result.current.loadAsignacionSectores).toBe('function');
    });

    it('debería permitir ejecutar loadAsignacionSectores', async () => {
      vi.mocked(operacionesService.getAsignacionSectores).mockResolvedValueOnce({
        data: [{ ciclo: '1', sector: 'A' }],
        error: null
      });

      const { result } = renderHook(() => useAsignacionSectores());

      result.current.loadAsignacionSectores('1', '202401');

      await waitFor(() => {
        expect(vi.mocked(operacionesService.getAsignacionSectores)).toHaveBeenCalled();
      });
    });

    it('debería actualizar loading durante la llamada', async () => {
      vi.mocked(operacionesService.getAsignacionSectores).mockResolvedValueOnce({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useAsignacionSectores());

      result.current.loadAsignacionSectores('1', '202401');

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  // ============ usePreciosCargo Tests ============
  describe('usePreciosCargo', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getPreciosCargoData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => usePreciosCargo('01', '2024'));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debería cargar precios exitosamente', async () => {
      const mockData = {
        tablaEnel: [{ id: 1, precio: 100 }],
        tablaEnerlova: [{ id: 1, precio: 110 }]
      };

      vi.mocked(operacionesService.getPreciosCargoData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => usePreciosCargo('01', '2024'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería recargar datos cuando cambian los parámetros', async () => {
      vi.mocked(operacionesService.getPreciosCargoData).mockResolvedValueOnce({
        data: { tablaEnel: [], tablaEnerlova: [] },
        error: null
      });

      const { rerender } = renderHook(
        ({ mes, anio }) => usePreciosCargo(mes, anio),
        { initialProps: { mes: '01', anio: '2024' } }
      );

      await waitFor(() => {
        expect(vi.mocked(operacionesService.getPreciosCargoData)).toHaveBeenCalledWith(
          '01',
          '2024'
        );
      });

      vi.clearAllMocks();
      vi.mocked(operacionesService.getPreciosCargoData).mockResolvedValueOnce({
        data: { tablaEnel: [], tablaEnerlova: [] },
        error: null
      });

      rerender({ mes: '02', anio: '2024' });

      await waitFor(() => {
        expect(vi.mocked(operacionesService.getPreciosCargoData)).toHaveBeenCalledWith(
          '02',
          '2024'
        );
      });
    });

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Error al cargar precios';
      vi.mocked(operacionesService.getPreciosCargoData).mockResolvedValueOnce({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => usePreciosCargo('01', '2024'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  // ============ useRevisarPrecio Tests ============
  describe('useRevisarPrecio', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getRevisarPrecioData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => useRevisarPrecio());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debería cargar datos de revisión de precios', async () => {
      const mockData = {
        dataPeriodoAbierto: [{ mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }],
        dataConsultarPreciosUno: [],
        dataConsultarPreciosDos: [],
        ciclosFacturacion: [{ diaFacturacion: '15', descripcion: 'Ciclo día 15' }]
      };

      vi.mocked(operacionesService.getRevisarPrecioData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => useRevisarPrecio());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('debería usar parámetro dia por defecto', async () => {
      vi.mocked(operacionesService.getRevisarPrecioData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      renderHook(() => useRevisarPrecio());

      await waitFor(() => {
        expect(vi.mocked(operacionesService.getRevisarPrecioData)).toHaveBeenCalledWith('15');
      });
    });

    it('debería proporcionar función refreshPrecios', async () => {
      const mockData = {
        dataPeriodoAbierto: [{ mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }],
        dataConsultarPreciosUno: [],
        dataConsultarPreciosDos: [],
        ciclosFacturacion: []
      };

      vi.mocked(operacionesService.getRevisarPrecioData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => useRevisarPrecio());

      await waitFor(() => {
        expect(typeof result.current.refreshPrecios).toBe('function');
      });
    });
  });

  // ============ useCorteReposicion Tests ============
  describe('useCorteReposicion', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getCorteReposicionData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => useCorteReposicion());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debería cargar datos de corte y reposición', async () => {
      const mockData = {
        totalesData: [{ id: 1, estado: 'pendiente' }],
        mantenedorCorteData: [{ id: 1, descripcion: 'Corte 1' }]
      };

      vi.mocked(operacionesService.getCorteReposicionData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => useCorteReposicion());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Error al cargar datos';
      vi.mocked(operacionesService.getCorteReposicionData).mockResolvedValueOnce({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => useCorteReposicion());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  // ============ useCerrarLecturas Tests ============
  describe('useCerrarLecturas', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getCerrarLecturasData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => useCerrarLecturas());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debería cargar período y ciclos', async () => {
      const mockData = {
        periodoAbierto: [{ mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }],
        ciclosFacturacion: [
          { id: 1, nombre: 'Ciclo día 15', descripcion: 'Facturación día 15', diaFacturacion: '15' }
        ]
      };

      vi.mocked(operacionesService.getCerrarLecturasData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => useCerrarLecturas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  // ============ usePeriodoFacturacion Tests ============
  describe('usePeriodoFacturacion', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getPeriodoFacturacionData).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => usePeriodoFacturacion());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debería cargar años y períodos', async () => {
      const mockData = {
        years: [{ id: 2024, year: 2024 }],
        periodos: [{ id: 1, mes: 1, estado: 'abierto' }]
      };

      vi.mocked(operacionesService.getPeriodoFacturacionData).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => usePeriodoFacturacion());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Error al cargar períodos';
      vi.mocked(operacionesService.getPeriodoFacturacionData).mockResolvedValueOnce({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => usePeriodoFacturacion());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  // ============ usePeriodoAbierto Tests ============
  describe('usePeriodoAbierto', () => {
    it('debería inicializar con estado de carga', () => {
      vi.mocked(operacionesService.getPeriodoAbierto).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { result } = renderHook(() => usePeriodoAbierto());

      expect(result.current.loading).toBe(true);
      expect(result.current.periodoAbierto).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('debería cargar período abierto exitosamente', async () => {
      const mockData = [{ mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }];

      vi.mocked(operacionesService.getPeriodoAbierto).mockResolvedValueOnce({
        data: mockData,
        error: null
      });

      const { result } = renderHook(() => usePeriodoAbierto());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.periodoAbierto).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería retornar arreglo vacío cuando no hay período', async () => {
      vi.mocked(operacionesService.getPeriodoAbierto).mockResolvedValueOnce({
        data: [],
        error: null
      });

      const { result } = renderHook(() => usePeriodoAbierto());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.periodoAbierto).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Error al cargar período';
      vi.mocked(operacionesService.getPeriodoAbierto).mockResolvedValueOnce({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => usePeriodoAbierto());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.periodoAbierto).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });
  });
});
