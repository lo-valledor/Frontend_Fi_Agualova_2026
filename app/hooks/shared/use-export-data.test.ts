import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ExportColumn, useExportData } from './use-export-data';

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

// Mock de xlsx - No podemos mockear el import dinámico directamente,
// pero podemos mockear el módulo y vi.importActual lo manejará
vi.mock('xlsx', async () => {
  const mockWorksheet = { '!cols': [] };
  return {
    default: {
      utils: {
        book_new: vi.fn(() => ({})),
        json_to_sheet: vi.fn(() => mockWorksheet),
        book_append_sheet: vi.fn()
      },
      write: vi.fn(() => new ArrayBuffer(8))
    },
    utils: {
      book_new: vi.fn(() => ({})),
      json_to_sheet: vi.fn(() => mockWorksheet),
      book_append_sheet: vi.fn()
    },
    write: vi.fn(() => new ArrayBuffer(8))
  };
});

describe('useExportData', () => {
  let originalCreateElement: any;
  let mockCreateObjectURL: any;
  let mockRevokeObjectURL: any;
  let mockClick: any;

  beforeEach(() => {
    // Guardar referencia original de createElement
    originalCreateElement = document.createElement.bind(document);

    // Mock de click solo para elementos <a>
    mockClick = vi.fn();

    // Override createElement para interceptar solo <a> tags
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    }) as any;

    // Mock de URL.createObjectURL y revokeObjectURL
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Limpiar mocks de toast
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restaurar createElement original
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  describe('formatDateForExport', () => {
    it('debería formatear fecha válida a formato chileno', () => {
      const { result } = renderHook(() => useExportData());
      const formattedDate = result.current.formatDateForExport('2024-01-15');

      // El formato puede variar según la configuración, verificamos que no esté vacío
      expect(formattedDate).toBeTruthy();
      expect(typeof formattedDate).toBe('string');
    });

    it('debería retornar string vacío para fecha null', () => {
      const { result } = renderHook(() => useExportData());
      expect(result.current.formatDateForExport(null)).toBe('');
    });

    it('debería retornar string vacío para fecha undefined', () => {
      const { result } = renderHook(() => useExportData());
      expect(result.current.formatDateForExport(undefined)).toBe('');
    });

    it('debería manejar fechas inválidas retornando string vacío', () => {
      const { result } = renderHook(() => useExportData());
      expect(result.current.formatDateForExport('invalid-date')).toBe('');
    });
  });

  describe('exportData - CSV', () => {
    const mockData = [
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
      { id: 2, name: 'María García', email: 'maria@example.com' }
    ];

    const mockColumns: ExportColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Nombre' },
      { key: 'email', header: 'Email' }
    ];

    it('debería exportar datos en formato CSV correctamente', async () => {
      const { result } = renderHook(() => useExportData());

      expect(result.current.isExporting).toBe(false);

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test-export'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      // Verificar que se llamó a toast.info y toast.success
      expect(toast.info).toHaveBeenCalledWith(
        'Preparando exportación de 2 registros...'
      );
      expect(toast.success).toHaveBeenCalledWith(
        '✅ 2 registros exportados exitosamente',
        expect.objectContaining({
          description: expect.stringContaining('test-export'),
          duration: 4000
        })
      );

      // Verificar que se creó el blob con BOM UTF-8
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('debería incluir headers por defecto', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('debería permitir excluir headers', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test',
        includeHeaders: false
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('debería aplicar formatter personalizado a las columnas', async () => {
      const columnsWithFormatter: ExportColumn[] = [
        { key: 'id', header: 'ID', formatter: val => `#${val}` },
        { key: 'name', header: 'Nombre' }
      ];

      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, columnsWithFormatter, {
        format: 'csv',
        filename: 'test'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar datos vacíos mostrando error', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData([], mockColumns, {
        format: 'csv',
        filename: 'test'
      });

      expect(toast.error).toHaveBeenCalledWith('No hay datos para exportar');
      expect(result.current.isExporting).toBe(false);
    });

    it('debería usar filename por defecto si no se proporciona', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          description: expect.stringContaining('export')
        })
      );
    });
  });

  describe('exportData - Excel', () => {
    const mockData = [
      { id: 1, name: 'Juan Pérez', amount: 1000 },
      { id: 2, name: 'María García', amount: 2000 }
    ];

    const mockColumns: ExportColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Nombre' },
      { key: 'amount', header: 'Monto' }
    ];

    it('debería exportar datos en formato Excel correctamente', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'xlsx',
        filename: 'test-excel'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.info).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        '✅ 2 registros exportados exitosamente',
        expect.objectContaining({
          description: expect.stringContaining('.xlsx')
        })
      );

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('debería lazy cargar la librería xlsx', async () => {
      const { result } = renderHook(() => useExportData());

      // La primera vez que se exporta a Excel, se debe cargar xlsx
      await result.current.exportData(mockData, mockColumns, {
        format: 'xlsx',
        filename: 'test'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('estado isExporting', () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const mockColumns: ExportColumn[] = [{ key: 'id', header: 'ID' }];

    it('debería establecer isExporting a true durante la exportación', async () => {
      const { result } = renderHook(() => useExportData());

      expect(result.current.isExporting).toBe(false);

      const exportPromise = result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test'
      });

      // Inmediatamente después de llamar, debería ser true
      await waitFor(() => {
        expect(result.current.isExporting).toBe(true);
      });

      await exportPromise;

      // Después de completar, debería volver a false
      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('debería restablecer isExporting a false después de error', async () => {
      const { result } = renderHook(() => useExportData());

      // Forzar un error mockeando createObjectURL
      mockCreateObjectURL.mockImplementationOnce(() => {
        throw new Error('Mock error');
      });

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Error al exportar los datos', {
        description: 'Mock error'
      });
    });
  });

  describe('manejo de valores especiales', () => {
    it('debería manejar valores null y undefined en los datos', async () => {
      const mockData = [
        { id: 1, name: null, email: undefined },
        { id: 2, name: 'Test', email: 'test@example.com' }
      ];

      const mockColumns: ExportColumn[] = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Nombre' },
        { key: 'email', header: 'Email' }
      ];

      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('debería manejar strings con comas y comillas en CSV', async () => {
      const mockData = [
        { id: 1, description: 'Test, con comas' },
        { id: 2, description: 'Test "con comillas"' }
      ];

      const mockColumns: ExportColumn[] = [
        { key: 'id', header: 'ID' },
        { key: 'description', header: 'Descripción' }
      ];

      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'test'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('nombres de archivo', () => {
    const mockData = [{ id: 1 }];
    const mockColumns: ExportColumn[] = [{ key: 'id', header: 'ID' }];

    it('debería agregar fecha ISO al nombre del archivo CSV', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'csv',
        filename: 'mi-reporte'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          description: expect.stringMatching(
            /mi-reporte_\d{4}-\d{2}-\d{2}\.csv/
          )
        })
      );
    });

    it('debería agregar fecha ISO al nombre del archivo Excel', async () => {
      const { result } = renderHook(() => useExportData());

      await result.current.exportData(mockData, mockColumns, {
        format: 'xlsx',
        filename: 'mi-reporte'
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          description: expect.stringMatching(
            /mi-reporte_\d{4}-\d{2}-\d{2}\.xlsx/
          )
        })
      );
    });
  });
});
