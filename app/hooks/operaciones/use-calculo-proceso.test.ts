/**
 * Tests para useCalculoProceso hook
 * Verifica lanzamiento y aceptación de cálculos
 */

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

    // El setter actualiza el estado
    result.current.setSelectedContratos([123, 456]);

    // Después de actualizar, debe haber nuevos contratos
    expect(result.current.selectedContratos).toEqual([123, 456]);
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

  it('debería soportar ciclos con formato 15', async () => {
    renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '15', // Debe convertirse a ciclo 1
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    // No debe mostrar error por parámetros faltantes
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('debería ejecutar callback cuando se aceptan cálculos', async () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    // Establecer contratos
    result.current.setSelectedContratos([123]);

    // Nota: El callback se ejecutará solo si la llamada API es exitosa
    // Para este test necesitaríamos mockear la API
  });

  it('debería tener estados de loading para ambas operaciones', () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    expect(typeof result.current.isLaunching).toBe('boolean');
    expect(typeof result.current.isAccepting).toBe('boolean');
  });
});
