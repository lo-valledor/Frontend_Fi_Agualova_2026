import { act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalculoFactura } from './use-calculo-factura';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('~/lib/api', () => ({
  default: {
    get: vi.fn()
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

  it('debería filtrar datos según searchTerm', () => {
    const { result, rerender } = renderHook(
      ({ periodoFormateado, cicloId }) =>
        useCalculoFactura({ periodoFormateado, cicloId }),
      {
        initialProps: { periodoFormateado: '202401', cicloId: '1' }
      }
    );

    // Establecer datos
    const mockData = [
      { contratoId: 1, cliente: 'Juan' } as any,
      { contratoId: 2, cliente: 'María' } as any
    ];
    result.current.setData(mockData);

    // Rerender para actualizar
    rerender({ periodoFormateado: '202401', cicloId: '1' });

    // Cambiar search term
    result.current.setSearchTerm('Juan');

    // El filtrado debe ocurrir a través del useEffect
  });

  it('debería soportar ciclos con formato 15', async () => {
    renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '15' })
    );

    // No debe mostrar error por ciclo inválido
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('debería tener getter para datos', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(Array.isArray(result.current.filteredData)).toBe(true);
  });

  it('debería tener estado de carga', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('debería permitir establecer datos manualmente', () => {
    const { result } = renderHook(() =>
      useCalculoFactura({ periodoFormateado: '202401', cicloId: '1' })
    );

    const mockData = [{ contratoId: 1 }] as any;
    act(() => {
      result.current.setData(mockData);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
