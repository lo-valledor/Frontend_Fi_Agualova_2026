import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { operacionesService } from '~/services/operacionesService';
import { useCalculoFactura } from './use-calculo-factura';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('~/services/operacionesService', () => ({
  operacionesService: {
    getRevisarCalculosBuscarPrefacturas: vi.fn()
  }
}));

describe('useCalculoFactura', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería inicializar con valores por defecto', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    expect(result.current.data).toEqual([]);
    expect(result.current.filteredData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.searchTerm).toBe('');
  });

  it('debería mostrar error si no hay periodoFormateado', async () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '', cicloId: '1' })
    );

    await result.current.handleRevisarCalculo();

    expect(toast.error).toHaveBeenCalledWith(
      'No hay un periodo abierto disponible'
    );
  });

  it('debería mostrar error si no hay cicloId', async () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '' })
    );

    await result.current.handleRevisarCalculo();

    expect(toast.error).toHaveBeenCalledWith(
      'Debe seleccionar un ciclo de facturación'
    );
  });

  it('debería retornar funciones de setter', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    expect(typeof result.current.setSearchTerm).toBe('function');
    expect(typeof result.current.setData).toBe('function');
  });

  it('debería retornar función handleRevisarCalculo', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    expect(typeof result.current.handleRevisarCalculo).toBe('function');
  });

  it('debería manejar respuesta exitosa del service', async () => {
    vi.mocked(operacionesService.getRevisarCalculosBuscarPrefacturas).mockResolvedValue(
      {
        data: [
          {
            contratoId: 1,
            rut: '12345678-9',
            nombre: 'Juan',
            totalFacturado: 1000,
            consumoPeriodo: 100
          }
        ],
        error: null
      }
    );

    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    await act(async () => {
      await result.current.handleRevisarCalculo();
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });
    expect(result.current.data[0].contratoId).toBe(1);
    expect(toast.success).toHaveBeenCalledWith('Se encontraron 1 registros');
  });

  it('debería mostrar info si no hay resultados', async () => {
    vi.mocked(operacionesService.getRevisarCalculosBuscarPrefacturas).mockResolvedValue(
      {
        data: [],
        error: null
      }
    );

    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    await result.current.handleRevisarCalculo();

    expect(toast.info).toHaveBeenCalledWith(
      'No se encontraron prefacturas para el ciclo y período elegidos'
    );
  });

  it('debería manejar error del service', async () => {
    vi.mocked(operacionesService.getRevisarCalculosBuscarPrefacturas).mockResolvedValue(
      {
        data: null,
        error: 'Error de red'
      }
    );

    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    await act(async () => {
      await result.current.handleRevisarCalculo();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Error de red');
    });
    expect(toast.error).toHaveBeenCalledWith('Error de red');
  });

  it('debería permitir establecer datos manualmente', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    const mockData = [{ contratoId: 1, cliente: 'Juan' }] as never;
    act(() => {
      result.current.setData(mockData);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('debería filtrar datos según searchTerm', async () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    const mockData = [
      { contratoId: 1, cliente: 'Juan Pérez' },
      { contratoId: 2, cliente: 'María López' }
    ] as never;
    act(() => {
      result.current.setData(mockData);
      result.current.setSearchTerm('Juan');
    });

    await waitFor(() => {
      expect(result.current.filteredData).toHaveLength(1);
    });
    expect(result.current.filteredData[0].contratoId).toBe(1);
  });
});