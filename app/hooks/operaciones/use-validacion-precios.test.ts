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
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(typeof result.current.verificarPrecios).toBe('function');
  });

  it('debería tener estado para isLoading', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('debería retornar estructura correcta de resultado', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(result.current).toHaveProperty('preciosConfirmados');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('totalPrecios');
    expect(result.current).toHaveProperty('preciosConfirmadosCount');
    expect(result.current).toHaveProperty('preciosPendientesCount');
    expect(result.current).toHaveProperty('verificarPrecios');
  });

  it('debería tener error null inicialmente', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: '202401',
        cicloId: '1'
      })
    );

    expect(result.current.error).toBeNull();
  });
});
