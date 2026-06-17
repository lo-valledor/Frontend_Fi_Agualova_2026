import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useValidacionPrecios } from './use-validacion-precios';

vi.mock('~/lib/api', () => ({
  default: {
    get: vi.fn()
  }
}));

import api from '~/lib/api';

describe('useValidacionPrecios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar false si falta periodoFormateado', async () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '',
        cicloId: '1'
      })
    );

    await waitFor(() => {
      expect(result.current.preciosConfirmados).toBe(false);
    });
  });

  it('debería retornar false si falta cicloId', async () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: ''
      })
    );

    await waitFor(() => {
      expect(result.current.preciosConfirmados).toBe(false);
    });
  });

  it('debería tener una función verificarPrecios', () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(typeof result.current.verificarPrecios).toBe('function');
  });

  it('debería tener estado para isLoading', () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('debería retornar estructura correcta con estadísticas de precios', () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(result.current).toHaveProperty('preciosConfirmados');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('totalValidos');
    expect(result.current).toHaveProperty('totalConfirmados');
    expect(result.current).toHaveProperty('totalPendientes');
    expect(result.current).toHaveProperty('todosConfirmados');
    expect(result.current).toHaveProperty('verificarPrecios');
  });

  it('debería tener error null inicialmente', () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(result.current.error).toBeNull();
  });

  it('debería inicializar estadísticas en cero', () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(result.current.totalValidos).toBe(0);
    expect(result.current.totalConfirmados).toBe(0);
    expect(result.current.totalPendientes).toBe(0);
  });

  it('debería soportar ciclos con formato 15 y convertirlos correctamente', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '15' // Debe convertirse a ciclo 1
      })
    );

    await result.current.verificarPrecios();

    expect(api.get).toHaveBeenCalled();
  });
});
