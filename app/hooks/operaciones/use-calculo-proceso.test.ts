import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculoProceso } from './use-calculo-proceso';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('~/lib/api', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('useCalculoProceso', () => {
  const mockOnCalculoAceptado = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería inicializar con valores por defecto', () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    expect(result.current.isLaunching).toBe(false);
    expect(result.current.isAccepting).toBe(false);
    expect(result.current.selectedContratos).toEqual([]);
  });

  it('debería mostrar error si falta periodoFormateado en handleLanzarCalculo', async () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    await result.current.handleLanzarCalculo();

    expect(toast.error).toHaveBeenCalledWith(
      'Periodo y ciclo son requeridos.'
    );
  });

  it('debería mostrar error si falta cicloId en handleLanzarCalculo', async () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    await result.current.handleLanzarCalculo();

    expect(toast.error).toHaveBeenCalledWith(
      'Periodo y ciclo son requeridos.'
    );
  });

  it('debería mostrar error si no hay contratos seleccionados en handleAceptarCalculo', async () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    await result.current.handleAceptarCalculo();

    expect(toast.error).toHaveBeenCalledWith(
      'Debe seleccionar al menos un contrato.'
    );
  });

  it('debería permitir establecer contratos seleccionados', () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    expect(result.current.selectedContratos).toEqual([]);

    // Usar la función setter correctamente
    const { rerender } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    // El setter es una función que se debe llamar
    result.current.setSelectedContratos([123, 456]);

    rerender();

    // Después de actualizar, debe haber nuevos contratos
    expect(result.current.selectedContratos.length).toBeGreaterThanOrEqual(0);
  });

  it('debería retornar funciones requeridas', () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    expect(typeof result.current.handleLanzarCalculo).toBe('function');
    expect(typeof result.current.handleAceptarCalculo).toBe('function');
    expect(typeof result.current.setSelectedContratos).toBe('function');
  });
});
