import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { operacionesService } from '~/services/operacionesService';
import { useCalculoProceso } from './use-calculo-proceso';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('~/services/operacionesService', () => ({
  operacionesService: {
    postRevisarCalculosLanzarCalculo: vi.fn(),
    postRevisarCalculosAceptar: vi.fn()
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

  it('debería permitir establecer contratos seleccionados', async () => {
    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    act(() => {
      result.current.setSelectedContratos([123, 456]);
    });

    await waitFor(() => {
      expect(result.current.selectedContratos).toEqual([123, 456]);
    });
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

  it('debería ejecutar lanzar correctamente', async () => {
    vi.mocked(operacionesService.postRevisarCalculosLanzarCalculo).mockResolvedValue(
      { data: { procesoId: 1 }, error: null }
    );

    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    await result.current.handleLanzarCalculo();

    expect(
      operacionesService.postRevisarCalculosLanzarCalculo
    ).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('debería ejecutar aceptar correctamente', async () => {
    vi.mocked(operacionesService.postRevisarCalculosAceptar).mockResolvedValue(
      { data: null, error: null }
    );

    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    act(() => {
      result.current.setSelectedContratos([123]);
    });

    await act(async () => {
      await result.current.handleAceptarCalculo();
    });

    expect(operacionesService.postRevisarCalculosAceptar).toHaveBeenCalledWith(
      '202401'
    );
    expect(mockOnCalculoAceptado).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('debería manejar error del service al lanzar', async () => {
    vi.mocked(operacionesService.postRevisarCalculosLanzarCalculo).mockResolvedValue(
      { data: null, error: 'Error del servidor' }
    );

    const { result } = renderHook(() =>
      useCalculoProceso({
        periodoFormateado: '202401',
        cicloId: '1',
        onCalculoAceptado: mockOnCalculoAceptado
      })
    );

    await result.current.handleLanzarCalculo();

    expect(toast.error).toHaveBeenCalledWith('Error: Error del servidor');
  });
});