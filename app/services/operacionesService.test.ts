import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '~/lib/api';
import { operacionesService } from './operacionesService';
import type {
  PeriodoAbierto,
  Ciclo,
  RevisarPrecioUno,
  RevisarPrecioDos
} from '~/types/operaciones';

// Mock api
vi.mock('~/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('OperacionesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============ getPeriodoAbierto Tests ============
  describe('getPeriodoAbierto', () => {
    it('debería retornar período abierto exitosamente', async () => {
      const mockData: PeriodoAbierto[] = [
        { mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.getPeriodoAbierto();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith('/ConsultarPeriodoAbierto');
    });

    it('debería retornar error cuando la API falla', async () => {
      const errorMessage = 'Network error';
      vi.mocked(api.get).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      const result = await operacionesService.getPeriodoAbierto();

      expect(result.data).toBeNull();
      expect(result.error).toBe(errorMessage);
    });

    it('debería retornar arreglo vacío cuando no hay período abierto', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

      const result = await operacionesService.getPeriodoAbierto();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('debería manejar errores no-Error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce('Unknown error');

      const result = await operacionesService.getPeriodoAbierto();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Error desconocido');
    });
  });

  // ============ getCiclosFacturacion Tests ============
  describe('getCiclosFacturacion', () => {
    it('debería retornar ciclos de facturación exitosamente', async () => {
      const mockData: Ciclo[] = [
        {
          id: 1,
          nombre: 'Ciclo día 15',
          descripcion: 'Facturación día 15',
          diaFacturacion: '15'
        }
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.getCiclosFacturacion();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith('/ciclos-facturacion-activos');
    });

    it('debería retornar error cuando la API falla', async () => {
      const errorMessage = 'API Error';
      vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

      const result = await operacionesService.getCiclosFacturacion();

      expect(result.data).toBeNull();
      expect(result.error).toBe(errorMessage);
    });
  });

  // ============ getPrepararLecturasData Tests ============
  describe('getPrepararLecturasData', () => {
    it('debería retornar todos los datos para preparar lecturas', async () => {
      const mockPeriodo: PeriodoAbierto[] = [
        { mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }
      ];
      const mockLecturas = { pendientes: 5 };
      const mockSectores = [{ id: 1, nombre: 'Sector A' }];
      const mockOpciones = [{ id: 1, valor: 'Opción 1' }];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockPeriodo })
        .mockResolvedValueOnce({ data: mockLecturas })
        .mockResolvedValueOnce({ data: mockSectores })
        .mockResolvedValueOnce({ data: mockOpciones });

      const result = await operacionesService.getPrepararLecturasData();

      expect(result.data?.periodoAbierto).toEqual(mockPeriodo);
      expect(result.data?.lecturasPendientes).toEqual(mockLecturas);
      expect(result.data?.sectores).toEqual(mockSectores);
      expect(result.data?.opcionesPreparar).toEqual(mockOpciones);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando una de las llamadas API falla', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getPrepararLecturasData();

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });

    it('debería hacer 4 llamadas paralelas a la API', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      await operacionesService.getPrepararLecturasData();

      expect(api.get).toHaveBeenCalledTimes(4);
    });
  });

  // ============ getAsignacionSectores Tests ============
  describe('getAsignacionSectores', () => {
    it('debería retornar asignación de sectores con parámetros', async () => {
      const mockData = [{ ciclo: '1', sector: 'A' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.getAsignacionSectores(
        '1',
        '202401'
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith(
        '/consultar-asignacion-sectores',
        expect.objectContaining({ params: expect.any(Object) })
      );
    });

    it('debería retornar error cuando los parámetros son inválidos', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Invalid params'));

      const result = await operacionesService.getAsignacionSectores('', '');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Invalid params');
    });
  });

  // ============ getPreciosCargoData Tests ============
  describe('getPreciosCargoData', () => {
    it('debería retornar datos de precios ENEL y Enerlova', async () => {
      const mockEnelData = [{ id: 1, precio: 100 }];
      const mockEnerlova = [{ id: 1, precio: 110 }];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockEnelData })
        .mockResolvedValueOnce({ data: mockEnerlova });

      const result = await operacionesService.getPreciosCargoData('01', '2024');

      expect(result.data?.tablaEnel).toEqual(mockEnelData);
      expect(result.data?.tablaEnerlova).toEqual(mockEnerlova);
      expect(result.error).toBeNull();
    });

    it('debería hacer llamadas con parámetros correctos', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      await operacionesService.getPreciosCargoData('01', '2024');

      expect(api.get).toHaveBeenCalledWith(
        '/consulta-precio-pago?mes=01&año=2024'
      );
      expect(api.get).toHaveBeenCalledWith('/consulta-precio-pago-tabla');
    });

    it('debería retornar error cuando una llamada falla', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getPreciosCargoData('01', '2024');

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ getRevisarPrecioData Tests ============
  describe('getRevisarPrecioData', () => {
    it('debería retornar datos de revisión de precios exitosamente', async () => {
      const mockPeriodo: PeriodoAbierto[] = [
        { mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }
      ];
      const mockCiclos = [
        { diaFacturacion: '15', descripcion: 'Ciclo día 15' }
      ];
      const mockPreciosUno: RevisarPrecioUno[] = [];
      const mockPreciosDos: RevisarPrecioDos[] = [];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockPeriodo })
        .mockResolvedValueOnce({ data: mockCiclos })
        .mockResolvedValueOnce({ data: mockPreciosUno })
        .mockResolvedValueOnce({ data: mockPreciosDos });

      const result = await operacionesService.getRevisarPrecioData('15');

      expect(result.data?.dataPeriodoAbierto).toEqual(mockPeriodo);
      expect(result.data?.ciclosFacturacion).toEqual(mockCiclos);
      expect(result.data?.dataConsultarPreciosUno).toEqual(mockPreciosUno);
      expect(result.data?.dataConsultarPreciosDos).toEqual(mockPreciosDos);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando no hay período abierto', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      const result = await operacionesService.getRevisarPrecioData('15');

      expect(result.data?.dataPeriodoAbierto).toEqual([]);
      expect(result.error).toBe('No hay periodo abierto');
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.clearAllMocks();
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getRevisarPrecioData('15');

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ getCorteReposicionData Tests ============
  describe('getCorteReposicionData', () => {
    it('debería retornar estructura correcta', async () => {
      const mockTotales = [{ id: 1, estado: 'pendiente' }];
      const mockCorte = [{ id: 1, descripcion: 'Corte 1' }];

      vi.clearAllMocks();
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockTotales })
        .mockResolvedValueOnce({ data: mockCorte });

      const result = await operacionesService.getCorteReposicionData();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando una llamada falla', async () => {
      vi.clearAllMocks();
      vi.mocked(api.get)
        .mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getCorteReposicionData();

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ getCerrarLecturasData Tests ============
  describe('getCerrarLecturasData', () => {
    it('debería retornar período y ciclos de facturación', async () => {
      const mockPeriodo: PeriodoAbierto[] = [
        { mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }
      ];
      const mockCiclos: Ciclo[] = [
        {
          id: 1,
          nombre: 'Ciclo día 15',
          descripcion: 'Facturación día 15',
          diaFacturacion: '15'
        }
      ];

      vi.clearAllMocks();
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockPeriodo })
        .mockResolvedValueOnce({ data: mockCiclos });

      const result = await operacionesService.getCerrarLecturasData();

      expect(result.data?.periodoAbierto).toEqual(mockPeriodo);
      expect(result.data?.ciclosFacturacion).toEqual(mockCiclos);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.clearAllMocks();
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getCerrarLecturasData();

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ getPeriodoFacturacionData Tests ============
  describe('getPeriodoFacturacionData', () => {
    it('debería retornar años y períodos de facturación', async () => {
      const mockYears = [{ id: 2024, year: 2024 }];
      const mockPeriodos = [{ id: 1, mes: 1, estado: 'abierto' }];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockYears })
        .mockResolvedValueOnce({ data: mockPeriodos });

      const result = await operacionesService.getPeriodoFacturacionData();

      expect(result.data?.years).toEqual(mockYears);
      expect(result.data?.periodos).toEqual(mockPeriodos);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando una llamada falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getPeriodoFacturacionData();

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ getPreciosPorCiclo Tests ============
  describe('getPreciosPorCiclo', () => {
    it('debería retornar precios por ciclo específico', async () => {
      const mockPreciosUno: RevisarPrecioUno[] = [];
      const mockPreciosDos: RevisarPrecioDos[] = [];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockPreciosUno })
        .mockResolvedValueOnce({ data: mockPreciosDos });

      const result = await operacionesService.getPreciosPorCiclo(
        1,
        2024,
        '15'
      );

      expect(result.data?.preciosUno).toEqual(mockPreciosUno);
      expect(result.data?.preciosDos).toEqual(mockPreciosDos);
      expect(result.error).toBeNull();
    });

    it('debería usar parámetros correctamente', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      await operacionesService.getPreciosPorCiclo(1, 2024, '15');

      expect(api.get).toHaveBeenCalledWith(
        '/ConsultarPreciosUno?mes=1&año=2024'
      );
      expect(api.get).toHaveBeenCalledWith(
        '/ConsultarPreciosDos?mes=1&año=2024&dia=15'
      );
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.getPreciosPorCiclo(
        1,
        2024,
        '15'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ lanzarCalculoFacturacion Tests ============
  describe('lanzarCalculoFacturacion', () => {
    it('debería lanzar cálculo de facturación exitosamente', async () => {
      const mockResponse = { procesoId: '123', estado: 'iniciado' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await operacionesService.lanzarCalculoFacturacion(1, '202401');

      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
      expect(api.post).toHaveBeenCalledWith(
        '/lanzar-calculo-facturacion',
        { cicloFacturacion: 1, periodoFacturable: '202401' }
      );
    });

    it('debería retornar error cuando el POST falla', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.lanzarCalculoFacturacion(1, '202401');

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ obtenerIdentificadorProceso Tests ============
  describe('obtenerIdentificadorProceso', () => {
    it('debería obtener identificador de proceso', async () => {
      const mockData = [{ id: '123', cicloId: '1', periodoId: '202401' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.obtenerIdentificadorProceso(
        '1',
        '202401'
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith(
        '/identificador-proceso',
        expect.objectContaining({ params: expect.objectContaining({
          cicloId: '1',
          periodoId: '202401',
          modo: 1
        }) })
      );
    });

    it('debería usar modo por defecto', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

      await operacionesService.obtenerIdentificadorProceso('1', '202401');

      expect(api.get).toHaveBeenCalledWith(
        '/identificador-proceso',
        expect.objectContaining({ params: expect.objectContaining({ modo: 1 }) })
      );
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.obtenerIdentificadorProceso(
        '1',
        '202401'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ verificarEstadoProceso Tests ============
  describe('verificarEstadoProceso', () => {
    it('debería verificar estado del proceso', async () => {
      const mockData = [{ procesoId: '123', estado: 'completado' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.verificarEstadoProceso('123');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith(
        '/estado-proceso',
        expect.objectContaining({ params: { procesoId: '123' } })
      );
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.verificarEstadoProceso('123');

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ consultarEncabezadoPrefactura Tests ============
  describe('consultarEncabezadoPrefactura', () => {
    it('debería consultar encabezado de prefactura', async () => {
      const mockData = [{ id: '1', total: 1000 }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.consultarEncabezadoPrefactura(
        '1',
        '202401'
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.consultarEncabezadoPrefactura(
        '1',
        '202401'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ consultarCargosPrefactura Tests ============
  describe('consultarCargosPrefactura', () => {
    it('debería consultar cargos de prefactura', async () => {
      const mockData = [{ id: '1', cargo: 'Cargo A', monto: 100 }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.consultarCargosPrefactura(
        '1',
        '202401'
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.consultarCargosPrefactura(
        '1',
        '202401'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ generarDetalleFactura Tests ============
  describe('generarDetalleFactura', () => {
    it('debería generar detalle de factura', async () => {
      const mockData = { facturaId: '123', estado: 'generada' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.generarDetalleFactura(1, '202401');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(api.post).toHaveBeenCalledWith(
        '/generar-detalle-factura',
        { lecturaId: 1, periodoId: '202401' }
      );
    });

    it('debería retornar error cuando el POST falla', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.generarDetalleFactura(1, '202401');

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ verificarEstadoCierreLecturas Tests ============
  describe('verificarEstadoCierreLecturas', () => {
    it('debería verificar estado de cierre de lecturas', async () => {
      const mockData = [{ estado: 'cerrado' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.verificarEstadoCierreLecturas(
        '1',
        '202401'
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.verificarEstadoCierreLecturas(
        '1',
        '202401'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ obtenerIdentificadorProcesoActual Tests ============
  describe('obtenerIdentificadorProcesoActual', () => {
    it('debería obtener identificador de proceso actual', async () => {
      const mockData = { id: '123', estado: 'activo' };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const result = await operacionesService.obtenerIdentificadorProcesoActual(
        '1',
        '202401'
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('debería usar modo por defecto', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

      await operacionesService.obtenerIdentificadorProcesoActual('1', '202401');

      expect(api.get).toHaveBeenCalledWith(
        '/identificador-proceso',
        expect.objectContaining({ params: expect.objectContaining({ modo: 1 }) })
      );
    });

    it('debería retornar error cuando la API falla', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('API Error'));

      const result = await operacionesService.obtenerIdentificadorProcesoActual(
        '1',
        '202401'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error');
    });
  });

  // ============ Integration Tests ============
  describe('Integration Tests', () => {
    it('debería manejar múltiples llamadas en secuencia', async () => {
      const periodoData = [
        { mes: 1, anio: 2024, estado: 'abierto', descripcion: 'Enero 2024' }
      ];
      vi.mocked(api.get).mockResolvedValue({ data: periodoData });

      const result1 = await operacionesService.getPeriodoAbierto();
      const result2 = await operacionesService.getPeriodoAbierto();

      expect(result1.data).toEqual(result2.data);
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    it('debería manejar errores en paralelas correctamente', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockRejectedValueOnce(new Error('Parallel Error'))
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      const result = await operacionesService.getPrepararLecturasData();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Parallel Error');
    });
  });
});
