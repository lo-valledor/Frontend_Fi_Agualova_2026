import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AcometidaRow,
  BuscarContratosLibres,
  Empalmes,
  Nichos,
  Sectores
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

const administracionServiceMock = vi.hoisted(() => ({
  getAcometidaByLimitAndOffset: vi.fn(),
  createAcometida: vi.fn(),
  updateAcometida: vi.fn()
}));

vi.mock('~/services/administracionService', () => ({
  administracionService: {
    getAcometidaByLimitAndOffset:
      administracionServiceMock.getAcometidaByLimitAndOffset,
    createAcometida: administracionServiceMock.createAcometida,
    updateAcometida: administracionServiceMock.updateAcometida
  }
}));

vi.mock('~/hooks/administracion/use-export-acometidas', () => ({
  useExportAcometidas: () => ({
    acometidaColumns: []
  })
}));

describe('AcometidaComponent', () => {
  // Datos de prueba
  const mockAcometidas: AcometidaRow[] = [
    {
      idAcometida: 1,
      codigo: '5A-003',
      ubicacion: 'Local 5A-003',
      contratoId: '1001',
      empalme: '317517-K',
      nicho: 'PLACA7',
      sector: 'CFLV S.A.',
      limitePotencia: '0',
      medidor: '98340738'
    },
    {
      idAcometida: 2,
      codigo: '5A-004',
      ubicacion: 'Local 5A-004',
      contratoId: '1002',
      empalme: '317518-K',
      nicho: 'PLACA8',
      sector: 'CFLV S.A.',
      limitePotencia: '0',
      medidor: '98340739'
    }
  ];

  const mockComboEmpalmes: Empalmes[] = [{ id: '1', descripcion: 'Empalme 1' }];

  const mockComboNichos: Nichos[] = [{ id: '1', descripcion: 'Nicho 1' }];

  const mockComboSectores: Sectores[] = [{ id: '1', descripcion: 'Sector A' }];

  const mockContratosDisponibles: BuscarContratosLibres[] = [
    {
      idContrato: '100',
      local: 'Local 100',
      tipoContrato: 'Tipo 1',
      tarifa: 'Tarifa 1',
      propietario: 'Propietario 1',
      cliente: 'Cliente 1',
      apellido: 'Apellidos 1',
      empresa: 'Empresa 1'
    }
  ];

  const defaultProps = {
    acometidas: mockAcometidas,
    comboEmpalmes: mockComboEmpalmes,
    comboNichos: mockComboNichos,
    comboSectores: mockComboSectores,
    contratosDisponibles: mockContratosDisponibles
  };

  const renderAcometidaComponent = async (
    props: Partial<typeof defaultProps> = {}
  ) => {
    render(
      <MemoryRouter>
        <AcometidaComponent {...defaultProps} {...props} />
      </MemoryRouter>
    );

    await screen.findByText(/acometidas en esta página/i);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    administracionServiceMock.getAcometidaByLimitAndOffset.mockResolvedValue({
      data: mockAcometidas,
      error: null
    });
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el componente correctamente', async () => {
      await renderAcometidaComponent();

      // Verificar que el título está presente
      expect(screen.getByText('Acometidas')).toBeInTheDocument();
      expect(
        screen.getByText('Gestiona las acometidas eléctricas del sistema')
      ).toBeInTheDocument();
    });

    it('debería mostrar el botón de agregar acometida', async () => {
      await renderAcometidaComponent();

      const addButton = screen.getByRole('button', {
        name: /agregar acometida/i
      });
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
    });

    it('debería mostrar el número correcto de registros', async () => {
      await renderAcometidaComponent();

      expect(
        await screen.findByText('2 acometidas en esta página')
      ).toBeInTheDocument();
    });
  });

  describe('Búsqueda global', () => {
    it('debería renderizar el campo de búsqueda', async () => {
      await renderAcometidaComponent();

      const searchInput = screen.getByPlaceholderText(/buscar por ubicación/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('debería actualizar el valor del campo de búsqueda al escribir', async () => {
      const user = userEvent.setup();

      await renderAcometidaComponent();

      const searchInput = screen.getByPlaceholderText(/buscar por ubicación/i);

      await user.type(searchInput, 'ACO-001');

      expect(searchInput).toHaveValue('ACO-001');
    });
  });

  describe('Permisos', () => {
    it('debería mostrar el botón de agregar cuando hay permisos de creación', async () => {
      await renderAcometidaComponent();

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

      await renderAcometidaComponent();

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
    it('debería mostrar mensaje cuando no hay acometidas', async () => {
      administracionServiceMock.getAcometidaByLimitAndOffset.mockResolvedValue({
        data: [],
        error: null
      });

      await renderAcometidaComponent({ acometidas: [] });

      expect(
        await screen.findByText('No hay acometidas registradas en el sistema')
      ).toBeInTheDocument();
      expect(
        screen.getByText('0 acometidas en esta página')
      ).toBeInTheDocument();
    });
  });

  describe('Integración con filtros', () => {
    it('debería renderizar el componente de filtros', async () => {
      await renderAcometidaComponent();

      // Verificar que el panel de filtros y el listado están presentes
      expect(screen.getByText('Listado de Acometidas')).toBeInTheDocument();
    });
  });
});
