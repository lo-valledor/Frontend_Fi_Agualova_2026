import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { operacionesService } from "~/services/operacionesService";
import { useValidacionPrecios } from "./use-validacion-precios";

vi.mock("~/services/operacionesService", () => ({
  operacionesService: {
    getRevisarPreciosData: vi.fn(),
  },
}));

describe("useValidacionPrecios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(operacionesService.getRevisarPreciosData).mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it("debería retornar false si falta periodoFormateado", async () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "",
        cicloId: "1",
      }),
    );

    await waitFor(() => {
      expect(result.current.preciosConfirmados).toBe(false);
    });
  });

  it("debería retornar false si falta cicloId", async () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "202401",
        cicloId: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.preciosConfirmados).toBe(false);
    });
  });

  it("debería llamar al servicio con mes y año extraídos del periodo", async () => {
    renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "012026",
        cicloId: "1",
      }),
    );

    await waitFor(() => {
      expect(operacionesService.getRevisarPreciosData).toHaveBeenCalledWith(
        "01",
        "2026",
      );
    });
  });

  it("debería tener una función verificarPrecios", () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "202401",
        cicloId: "1",
      }),
    );

    expect(typeof result.current.verificarPrecios).toBe("function");
  });

  it("debería tener estado para isLoading", () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "202401",
        cicloId: "1",
      }),
    );

    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("debería retornar estructura correcta con estadísticas de precios", () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "202401",
        cicloId: "1",
      }),
    );

    expect(result.current).toHaveProperty("preciosConfirmados");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("totalValidos");
    expect(result.current).toHaveProperty("totalConfirmados");
    expect(result.current).toHaveProperty("totalPendientes");
    expect(result.current).toHaveProperty("todosConfirmados");
    expect(result.current).toHaveProperty("verificarPrecios");
  });

  it("debería tener error null inicialmente", () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "202401",
        cicloId: "1",
      }),
    );

    expect(result.current.error).toBeNull();
  });

  it("debería inicializar estadísticas en cero", () => {
    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "202401",
        cicloId: "1",
      }),
    );

    expect(result.current.totalValidos).toBe(0);
    expect(result.current.totalConfirmados).toBe(0);
    expect(result.current.totalPendientes).toBe(0);
  });

  it("debería confirmar precios cuando todos están confirmados", async () => {
    vi.mocked(operacionesService.getRevisarPreciosData).mockResolvedValue({
      data: [
        {
          indice: 1,
          codigoCargo: 100,
          codigoEnerlova: "E001",
          descripcion: "Cargo A",
          valorActual: "100",
          estado: "OK",
          estaConfirmado: true,
        },
        {
          indice: 2,
          codigoCargo: 101,
          codigoEnerlova: "E002",
          descripcion: "Cargo B",
          valorActual: "200",
          estado: "OK",
          estaConfirmado: true,
        },
      ],
      error: null,
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "012026",
        cicloId: "1",
      }),
    );

    await waitFor(() => {
      expect(result.current.preciosConfirmados).toBe(true);
      expect(result.current.totalPrecios).toBe(2);
      expect(result.current.preciosConfirmadosCount).toBe(2);
      expect(result.current.preciosPendientesCount).toBe(0);
    });
  });

  it("debería marcar pendiente cuando hay precios sin confirmar", async () => {
    vi.mocked(operacionesService.getRevisarPreciosData).mockResolvedValue({
      data: [
        {
          indice: 1,
          codigoCargo: 100,
          codigoEnerlova: "E001",
          descripcion: "Cargo A",
          valorActual: "100",
          estado: "OK",
          estaConfirmado: true,
        },
        {
          indice: 2,
          codigoCargo: 101,
          codigoEnerlova: "E002",
          descripcion: "Cargo B",
          valorActual: "200",
          estado: "OK",
          estaConfirmado: false,
        },
      ],
      error: null,
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "012026",
        cicloId: "1",
      }),
    );

    await waitFor(() => {
      expect(result.current.preciosConfirmados).toBe(false);
      expect(result.current.preciosConfirmadosCount).toBe(1);
      expect(result.current.preciosPendientesCount).toBe(1);
    });
  });

  it("debería ignorar precios con indice 0", async () => {
    vi.mocked(operacionesService.getRevisarPreciosData).mockResolvedValue({
      data: [
        {
          indice: 0,
          codigoCargo: 100,
          codigoEnerlova: "E001",
          descripcion: "Sin valor",
          valorActual: "0",
          estado: "OK",
          estaConfirmado: false,
        },
        {
          indice: 1,
          codigoCargo: 101,
          codigoEnerlova: "E002",
          descripcion: "Cargo B",
          valorActual: "200",
          estado: "OK",
          estaConfirmado: true,
        },
      ],
      error: null,
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "012026",
        cicloId: "1",
      }),
    );

    await waitFor(() => {
      expect(result.current.totalPrecios).toBe(1);
      expect(result.current.preciosConfirmados).toBe(true);
    });
  });

  it("debería manejar error del servicio", async () => {
    vi.mocked(operacionesService.getRevisarPreciosData).mockResolvedValue({
      data: null,
      error: "Error de red",
    });

    const { result } = renderHook(() =>
      useValidacionPrecios({
        periodoFormateado: "012026",
        cicloId: "1",
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Error de red");
      expect(result.current.preciosConfirmados).toBe(false);
    });
  });
});
