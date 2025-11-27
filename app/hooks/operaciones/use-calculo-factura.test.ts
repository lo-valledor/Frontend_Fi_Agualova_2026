import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculoFactura } from './use-calculo-factura';
import { toast } from 'sonner';

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
});
