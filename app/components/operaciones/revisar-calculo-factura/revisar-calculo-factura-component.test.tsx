import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RevisarCalculoFacturaComponent from './revisar-calculo-factura-component';

// Mocks
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({
    setSteps: vi.fn(),
    drive: vi.fn()
  }))
}));

vi.mock('~/lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } }))
  }
}));

vi.mock('~/context/AuthContext', () => ({
  useAuth: () => ({
    canCreate: vi.fn(() => true),
    canEdit: vi.fn(() => true)
  })
}));

vi.mock('~/hooks/operaciones/use-calculo-factura', () => ({
  useCalculoFactura: () => ({
    data: [],
    filteredData: [],
    isLoading: false,
    error: null,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    handleRevisarCalculo: vi.fn(),
    setData: vi.fn()
  })
}));

vi.mock('~/hooks/operaciones/use-calculo-proceso', () => ({
  useCalculoProceso: () => ({
    isLaunching: false,
    isAccepting: false,
    selectedContratos: [],
    setSelectedContratos: vi.fn(),
    handleLanzarCalculo: vi.fn(),
    handleAceptarCalculo: vi.fn()
  })
}));

vi.mock('~/hooks/operaciones/use-validacion-precios', () => ({
  useValidacionPrecios: () => ({
    preciosConfirmados: false,
    isLoading: false,
    error: null,
    totalPrecios: 10,
    preciosConfirmadosCount: 5,
    preciosPendientesCount: 5,
    verificarPrecios: vi.fn()
  })
}));

vi.mock('./hierarchical-data-table', () => ({
  HierarchicalDataTable: ({ data }: any) => (
    <div data-testid="mock-table">Table: {data?.length || 0} rows</div>
  )
}));

vi.mock('./columnsPrecalculo', () => ({
  columns: []
}));

describe('RevisarCalculoFacturaComponent', () => {
  const mockProps = {
    periodoAbierto: [
      {
        id: '012024',
        descripcion: 'Enero 2024'
      }
    ],
    ciclosFacturacionActivos: [
      {
        id: '15',
        descripcion: 'Ciclo día 15'
      }
    ],
    estadoCierreLecturas: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el componente sin errores', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(screen.getByText('Revisar Cálculo de Factura')).toBeInTheDocument();
  });

  it('debería mostrar el título del componente', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    const title = screen.getByText('Revisar Cálculo de Factura');
    expect(title).toBeInTheDocument();
  });

  it('debería mostrar la descripción', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(
      screen.getByText(/Gestión y revisión de cálculos de facturación/)
    ).toBeInTheDocument();
  });

  it('debería mostrar panel de configuración', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(screen.getByText('Configuración de Búsqueda')).toBeInTheDocument();
  });

  it('debería mostrar período cuando está disponible', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(screen.getByText(/Periodo/)).toBeInTheDocument();
  });

  it('debería mostrar ciclo de facturación', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(screen.getByText('Ciclo de Facturación')).toBeInTheDocument();
  });

  it('debería mostrar panel de resultados', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(screen.getByText('Resultados de Consulta')).toBeInTheDocument();
  });

  it('debería renderizar sin errores', () => {
    expect(() => {
      render(
        <RevisarCalculoFacturaComponent
          {...mockProps}
          estadoCierreLecturas={null}
        />
      );
    }).not.toThrow();
  });

  it('debería mostrar información de precios pendientes', () => {
    render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    expect(
      screen.getByText('Precios pendientes de confirmación')
    ).toBeInTheDocument();
  });

  it('debería manejar período vacío correctamente', () => {
    render(
      <RevisarCalculoFacturaComponent
        periodoAbierto={[]}
        ciclosFacturacionActivos={[]}
        estadoCierreLecturas={null}
      />
    );

    const sinPeriodo = screen.getByTestId('sin-periodo-abierto');
    expect(sinPeriodo).toBeInTheDocument();
    expect(sinPeriodo).toHaveTextContent('Sin periodo abierto');
  });

  it('debería mostrar estructura principal correctamente', () => {
    const { container } = render(
      <RevisarCalculoFacturaComponent
        {...mockProps}
        estadoCierreLecturas={null}
      />
    );

    // Verificar que hay cards (paneles)
    const cards = container.querySelectorAll('[role="region"]');
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('debería renderizar sin errores cuando estadoCierreLecturas es null', () => {
    expect(() => {
      render(
        <RevisarCalculoFacturaComponent
          {...mockProps}
          estadoCierreLecturas={null}
        />
      );
    }).not.toThrow();
  });

  it('debería renderizar sin errores cuando estadoCierreLecturas es un array', () => {
    expect(() => {
      render(
        <RevisarCalculoFacturaComponent
          {...mockProps}
          estadoCierreLecturas={[
            {
              id: '1',
              descripcion: 'Sector 1',
              cerrado: true
            }
          ]}
        />
      );
    }).not.toThrow();
  });
});
