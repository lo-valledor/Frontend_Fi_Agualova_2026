import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  Acometida,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles
} from '~/types/administracion';
import AcometidaComponent from './acometida-component';

// Mock del contexto de autenticación
vi.mock('~/context/AuthContext', () => ({
  useAuth: () => ({
    canCreate: vi.fn(() => true),
    canEdit: vi.fn(() => true)
  })
}));

// Mock de react-router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useRevalidator: () => ({
      revalidate: vi.fn()
    })
  };
});

// Mock de sonner (toast notifications)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de la API
vi.mock('~/lib/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn()
  }
}));

// Mock de hooks personalizados
vi.mock('~/hooks/administracion/use-acometida-filters', () => ({
  useAcometidaFilters: (acometidas: Acometida[]) => ({
    filteredAcometidas: acometidas,
    filterStats: {
      total: acometidas.length,
      filtered: acometidas.length,
      activeFilters: 0,
      isFiltered: false
    },
    filterOptions: {
      empalmes: [],
      nichos: [],
      sectores: []
    }
  })
}));

vi.mock('~/hooks/administracion/use-export-acometidas', () => ({
  useExportAcometidas: () => ({
    acometidaColumns: []
  })
}));

describe('AcometidaComponent', () => {
  // Datos de prueba
  const mockAcometidas: Acometida[] = [
    {
      acometidaId: 1,
      codigo: '5A-003',
      ubicacion: 'Local 5A-003',
      contratoId: '1001',
      empalmeDescripcion: '317517-K',
      nichoDescripcion: 'PLACA7',
      sectorDescripcion: 'CFLV S.A.',
      limitePotencia: null,
      numeroMedidor: '98340738'
    },
    {
      acometidaId: 1,
      codigo: '5A-003',
      ubicacion: 'Local 5A-003',
      contratoId: '1001',
      empalmeDescripcion: '317517-K',
      nichoDescripcion: 'PLACA7',
      sectorDescripcion: 'CFLV S.A.',
      limitePotencia: null,
      numeroMedidor: '98340738'
    }
  ];

  const mockComboEmpalmes: ComboEmpalmes[] = [{ id: '1', nombre: 'Empalme 1' }];

  const mockComboNichos: ComboNichos[] = [{ id: '1', nombre: 'Nicho 1' }];

  const mockComboSectores: ComboSectores[] = [{ id: '1', nombre: 'Sector A' }];

  const mockContratosDisponibles: ContratosDisponibles[] = [
    {
      contratoId: '100',
      local: 'Local 100',
      tipoContrato: 'Tipo 1',
      tarifa: 'Tarifa 1',
      propietario: 'Propietario 1',
      clienteNombre: 'Cliente 1',
      clienteApellidos: 'Apellidos 1',
      empresa: 'Empresa 1',
      fechaInicio: '2023-01-01',
      fechaFin: '2023-12-31',
      direccionEnvio: 'Dirección 1',
      limiteInventario: 1000,
      cicloFacturacion: 'Mensual',
      estadoActivo: true
    }
  ];

  const defaultProps = {
    acometidas: mockAcometidas,
    comboEmpalmes: mockComboEmpalmes,
    comboNichos: mockComboNichos,
    comboSectores: mockComboSectores,
    contratosDisponibles: mockContratosDisponibles
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el componente correctamente', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      // Verificar que el título está presente
      expect(screen.getByText('Acometidas')).toBeInTheDocument();
      expect(
        screen.getByText('Gestiona las acometidas eléctricas del sistema')
      ).toBeInTheDocument();
    });

    it('debería mostrar el botón de agregar acometida', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      const addButton = screen.getByRole('button', {
        name: /agregar acometida/i
      });
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
    });

    it('debería mostrar el número correcto de registros', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      expect(screen.getByText('2 acometidas')).toBeInTheDocument();
    });
  });

  describe('Búsqueda global', () => {
    it('debería renderizar el campo de búsqueda', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText(
        /buscar por código, ubicación o contrato/i
      );
      expect(searchInput).toBeInTheDocument();
    });

    it('debería actualizar el valor del campo de búsqueda al escribir', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText(
        /buscar por código, ubicación o contrato/i
      );

      await user.type(searchInput, 'ACO-001');

      expect(searchInput).toHaveValue('ACO-001');
    });
  });

  describe('Permisos', () => {
    it('debería mostrar el botón de agregar cuando hay permisos de creación', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      const addButton = screen.getByRole('button', {
        name: /agregar acometida/i
      });
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
    });
  });

  describe('Modal de formulario', () => {
    it('debería abrir el modal al hacer clic en agregar acometida', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      const addButton = screen.getByRole('button', {
        name: /agregar acometida/i
      });

      await user.click(addButton);

      // El modal debería abrirse (verificar que se renderiza el formulario)
      await waitFor(() => {
        // Aquí verificarías elementos específicos del formulario
        // Depende de cómo esté implementado el AcometidaForm
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Manejo de datos vacíos', () => {
    it('debería mostrar mensaje cuando no hay acometidas', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} acometidas={[]} />
        </MemoryRouter>
      );

      expect(
        screen.getByText('No se encontraron resultados.')
      ).toBeInTheDocument();
      expect(screen.getByText('0 acometidas')).toBeInTheDocument();
    });
  });

  describe('Integración con filtros', () => {
    it('debería renderizar el componente de filtros', () => {
      render(
        <MemoryRouter>
          <AcometidaComponent {...defaultProps} />
        </MemoryRouter>
      );

      // Verificar que el panel de filtros y el listado están presentes
      expect(screen.getByText('Listado de Acometidas')).toBeInTheDocument();
    });
  });
});
