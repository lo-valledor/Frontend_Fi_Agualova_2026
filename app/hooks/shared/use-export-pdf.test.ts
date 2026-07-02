import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type PDFExportOptions,
  type PDFSection,
  useExportPDF
} from './use-export-pdf';

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock simplificado de jsPDF
const mockSave = vi.fn();
const mockAutoTable = vi.fn();
const mockAddPage = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetDrawColor = vi.fn();
const mockSetFillColor = vi.fn();
const mockLine = vi.fn();
const mockRect = vi.fn();
const mockSplitTextToSize = vi.fn((text: string) => [text]);
const mockSetPage = vi.fn();

const mockJsPDFInstance = {
  save: mockSave,
  addPage: mockAddPage,
  text: mockText,
  setFontSize: mockSetFontSize,
  setTextColor: mockSetTextColor,
  setDrawColor: mockSetDrawColor,
  setFillColor: mockSetFillColor,
  line: mockLine,
  rect: mockRect,
  splitTextToSize: mockSplitTextToSize,
  setPage: mockSetPage,
  autoTable: mockAutoTable,
  internal: {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297
    },
    getNumberOfPages: () => 1
  },
  lastAutoTable: {
    finalY: 100
  }
};

const mockJsPDFConstructor = vi.fn(function MockJsPDF() {
  return mockJsPDFInstance;
});

// Mock para imports dinámicos
vi.mock('jspdf', () => ({
  default: mockJsPDFConstructor
}));

vi.mock('jspdf-autotable', () => ({
  default: {}
}));

describe('useExportPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('estado e interfaz', () => {
    it('debería inicializar con isExporting en false', () => {
      const { result } = renderHook(() => useExportPDF());
      expect(result.current.isExporting).toBe(false);
    });

    it('debería exponer función exportToPDF', () => {
      const { result } = renderHook(() => useExportPDF());
      expect(result.current.exportToPDF).toBeDefined();
      expect(typeof result.current.exportToPDF).toBe('function');
    });
  });

  describe('exportación básica', () => {
    it('debería exportar PDF y llamar a save', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        { type: 'text', text: 'Contenido de prueba' }
      ];

      await act(async () => {
        await result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'PDF generado exitosamente',
        expect.objectContaining({
          description: expect.stringMatching(/reporte_\d{4}-\d{2}-\d{2}\.pdf/),
          duration: 4000
        })
      );
    });

    it('debería usar filename personalizado', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [{ type: 'text', text: 'Test' }];
      const options: PDFExportOptions = {
        filename: 'mi-reporte-custom'
      };

      await act(async () => {
        await result.current.exportToPDF(sections, options);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringMatching(/mi-reporte-custom_\d{4}-\d{2}-\d{2}\.pdf/)
      );
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar secciones vacías sin errores', async () => {
      const { result } = renderHook(() => useExportPDF());

      act(() => {
        result.current.exportToPDF([]);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'No hay secciones para exportar'
      );
    });
  });

  describe('diferentes tipos de secciones', () => {
    it('debería manejar sección de tipo tabla', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'table',
          title: 'Tabla de Usuarios',
          columns: [
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Nombre' }
          ],
          data: [
            { id: 1, name: 'Juan' },
            { id: 2, name: 'María' }
          ]
        }
      ];

      act(() => {
        result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar sección de tipo KPIs', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'kpis',
          title: 'Indicadores',
          kpis: [
            { label: 'Total', value: 150 },
            { label: 'Activos', value: 120 }
          ]
        }
      ];

      await act(async () => {
        await result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar sección de tipo chart', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'chart',
          title: 'Gráfico de Ventas'
        }
      ];

      await result.current.exportToPDF(sections);

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar múltiples secciones', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'kpis',
          kpis: [{ label: 'Total', value: 100 }]
        },
        {
          type: 'table',
          columns: [{ key: 'name', header: 'Nombre' }],
          data: [{ name: 'Test' }]
        },
        {
          type: 'text',
          text: 'Conclusión'
        }
      ];

      act(() => {
        result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('opciones de configuración', () => {
    it('debería aceptar orientación landscape', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [{ type: 'text', text: 'Test' }];
      const options: PDFExportOptions = {
        orientation: 'landscape'
      };

      await act(async () => {
        await result.current.exportToPDF(sections, options);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería incluir información de la empresa', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [{ type: 'text', text: 'Test' }];
      const options: PDFExportOptions = {
        companyInfo: {
          name: 'Agualova S.A.',
          address: 'Av. Principal 123',
          phone: '+56 2 1234 5678'
        }
      };

      await act(async () => {
        await result.current.exportToPDF(sections, options);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('estado isExporting', () => {
    it('debería resetear isExporting después de completar la exportación', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [{ type: 'text', text: 'Test' }];

      expect(result.current.isExporting).toBe(false);

      await act(async () => {
        await result.current.exportToPDF(sections);
      });

      // Después de completar debe volver a false
      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería restablecer isExporting después de error', async () => {
      const { result } = renderHook(() => useExportPDF());

      // Forzar error
      mockSave.mockImplementationOnce(() => {
        throw new Error('Error de prueba');
      });

      const sections: PDFSection[] = [{ type: 'text', text: 'Test' }];

      act(() => {
        result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Error al generar el PDF',
        expect.objectContaining({
          description: 'Error de prueba'
        })
      );
    });
  });

  describe('formatters en columnas', () => {
    it('debería aplicar formatter a valores de columnas', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'table',
          columns: [
            { key: 'id', header: 'ID', formatter: val => `#${val}` },
            { key: 'amount', header: 'Monto', formatter: val => `$${val}` }
          ],
          data: [
            { id: 1, amount: 1000 },
            { id: 2, amount: 2000 }
          ]
        }
      ];

      act(() => {
        result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('casos edge', () => {
    it('debería manejar tabla sin datos', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'table',
          columns: [{ key: 'name', header: 'Nombre' }],
          data: []
        }
      ];

      await act(async () => {
        await result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar KPIs vacíos', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'kpis',
          kpis: []
        }
      ];

      await act(async () => {
        await result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar texto vacío', async () => {
      const { result } = renderHook(() => useExportPDF());

      const sections: PDFSection[] = [
        {
          type: 'text',
          text: ''
        }
      ];

      await act(async () => {
        await result.current.exportToPDF(sections);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(mockSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
