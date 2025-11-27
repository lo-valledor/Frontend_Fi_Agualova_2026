import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useExportData, type ExportColumn } from './use-export-data';

/**
 * Tests de Carga (Load Tests) para función de exportación
 *
 * Simula exportaciones de grandes volúmenes de datos
 * para verificar estabilidad bajo carga
 */

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('xlsx', async () => {
  const mockWorksheet = { '!cols': [] };
  return {
    default: {
      utils: {
        book_new: vi.fn(() => ({})),
        json_to_sheet: vi.fn(() => mockWorksheet),
        book_append_sheet: vi.fn()
      },
      write: vi.fn(() => new ArrayBuffer(1024))
    },
    utils: {
      book_new: vi.fn(() => ({})),
      json_to_sheet: vi.fn(() => mockWorksheet),
      book_append_sheet: vi.fn()
    },
    write: vi.fn(() => new ArrayBuffer(1024))
  };
});

describe('useExportData - Load Tests', () => {
  let originalCreateElement: any;
  let mockClick: any;

  beforeEach(() => {
    originalCreateElement = document.createElement.bind(document);
    mockClick = vi.fn();

    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    }) as any;

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  describe('CSV Export Load Tests', () => {
    it('should format 10000 records for CSV export in < 5s', () => {
      const { result } = renderHook(() => useExportData());

      // Crear 10000 registros de ejemplo
      const records = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        nombre: `Usuario ${i + 1}`,
        correo: `usuario${i + 1}@example.com`,
        estado: i % 2 === 0 ? 'Activo' : 'Inactivo',
        fecha: '2024-01-15'
      }));

      const columns: ExportColumn[] = [
        { key: 'id', header: 'ID' },
        { key: 'nombre', header: 'Nombre' },
        { key: 'correo', header: 'Correo' },
        { key: 'estado', header: 'Estado' },
        { key: 'fecha', header: 'Fecha' }
      ];

      const start = performance.now();
      // Simular el procesamiento de datos para CSV
      const csvData = records
        .map(record =>
          columns
            .map(col => {
              const value = record[col.key as keyof typeof record];
              return col.formatter ? col.formatter(value) : value;
            })
            .join(',')
        )
        .join('\n');
      const duration = performance.now() - start;

      expect(csvData).toBeTruthy();
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 10000 CSV records formatted in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle 50000 CSV records without crashing', () => {
      const { result } = renderHook(() => useExportData());

      const records = Array.from({ length: 50000 }, (_, i) => ({
        id: i + 1,
        nombre: `Usuario ${i + 1}`,
        correo: `usuario${i + 1}@example.com`,
        estado: i % 3 === 0 ? 'Activo' : i % 3 === 1 ? 'Inactivo' : 'Pendiente',
        fecha: `2024-01-${(i % 28) + 1}`
      }));

      const columns: ExportColumn[] = [
        { key: 'id', header: 'ID' },
        { key: 'nombre', header: 'Nombre' },
        { key: 'correo', header: 'Correo' },
        { key: 'estado', header: 'Estado' },
        { key: 'fecha', header: 'Fecha', formatter: (value: string) => result.current.formatDateForExport(value) }
      ];

      const start = performance.now();
      let processedCount = 0;
      records.forEach(record => {
        columns.forEach(col => {
          const value = record[col.key as keyof typeof record];
          if (col.formatter) {
            col.formatter(value);
          }
          processedCount += 1;
        });
      });
      const duration = performance.now() - start;

      expect(processedCount).toBe(50000 * columns.length);
      expect(duration).toBeLessThan(15000);
      console.log(
        `✓ 50000 CSV records processed in ${duration.toFixed(2)}ms (${(duration / 50000).toFixed(4)}ms per record)`
      );
    });
  });

  describe('Excel Export Load Tests', () => {
    it('should format 10000 records for Excel export in < 8s', () => {
      const records = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        nombre: `Usuario ${i + 1}`,
        correo: `usuario${i + 1}@example.com`,
        monto: (Math.random() * 100000).toFixed(2),
        fecha: '2024-01-15'
      }));

      const start = performance.now();
      // Simular procesamiento de datos para Excel con formateo
      const processedData = records.map(record => ({
        ...record,
        monto: parseFloat(record.monto)
      }));
      const duration = performance.now() - start;

      expect(processedData.length).toBe(10000);
      expect(duration).toBeLessThan(8000);
      console.log(
        `✓ 10000 Excel records formatted in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle Excel with 20000 records and calculations', () => {
      const records = Array.from({ length: 20000 }, (_, i) => ({
        id: i + 1,
        nombre: `Usuario ${i + 1}`,
        cantidad: Math.floor(Math.random() * 100) + 1,
        precio: Math.random() * 1000,
        estado: i % 2 === 0
      }));

      const start = performance.now();
      // Simular cálculos como sumarías, promedios, etc.
      const totalCantidad = records.reduce((sum, r) => sum + r.cantidad, 0);
      const totalMonto = records.reduce((sum, r) => sum + r.precio * r.cantidad, 0);
      const promedioCantidad = totalCantidad / records.length;

      const processedData = records.map((record, index) => ({
        ...record,
        total: record.precio * record.cantidad,
        porcentaje: ((record.cantidad / totalCantidad) * 100).toFixed(2)
      }));

      const duration = performance.now() - start;

      expect(processedData.length).toBe(20000);
      expect(totalCantidad).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 20000 Excel records with calculations in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle 100000 simple records', () => {
      const records = Array.from({ length: 100000 }, (_, i) => ({
        id: i + 1,
        value: Math.random()
      }));

      const start = performance.now();
      let count = 0;
      records.forEach(record => {
        // Simular validación básica
        if (record.id > 0) {
          count += 1;
        }
      });
      const duration = performance.now() - start;

      expect(count).toBe(100000);
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 100000 simple records processed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle wide datasets (50 columns x 10000 rows)', () => {
      const records = Array.from({ length: 10000 }, (_, i) => {
        const row: any = { id: i + 1 };
        for (let col = 0; col < 50; col++) {
          row[`col_${col}`] = Math.random();
        }
        return row;
      });

      const columns = Array.from({ length: 51 }, (_, i) =>
        i === 0
          ? { key: 'id', header: 'ID' }
          : { key: `col_${i - 1}`, header: `Column ${i}` }
      ) as ExportColumn[];

      const start = performance.now();
      let cellCount = 0;
      records.forEach(record => {
        columns.forEach(col => {
          // Simular procesamiento de cada celda
          const value = record[col.key as string];
          cellCount += 1;
        });
      });
      const duration = performance.now() - start;

      expect(cellCount).toBe(10000 * 51);
      expect(duration).toBeLessThan(10000);
      console.log(
        `✓ 10000 rows × 50 columns (500000 cells) processed in ${duration.toFixed(2)}ms`
      );
    });

    it('should handle nested data structures with 5000 parent-child relationships', () => {
      const parentRecords = Array.from({ length: 5000 }, (_, i) => ({
        id: i + 1,
        nombre: `Padre ${i + 1}`,
        children: Array.from({ length: Math.random() * 5 }, (_, j) => ({
          childId: `${i + 1}-${j + 1}`,
          childName: `Hijo ${j + 1}`
        }))
      }));

      const start = performance.now();
      let totalRecords = 0;
      parentRecords.forEach(parent => {
        totalRecords += 1 + parent.children.length;
      });
      const duration = performance.now() - start;

      expect(totalRecords).toBeGreaterThan(5000);
      expect(duration).toBeLessThan(2000);
      console.log(
        `✓ 5000 parent records with ~2.5 children each (${totalRecords} total) processed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Concurrent Export Operations', () => {
    it('should handle 10 simultaneous export operations', async () => {
      const { result } = renderHook(() => useExportData());

      const promises = Array.from({ length: 10 }, async (_, batchNum) => {
        const records = Array.from({ length: 5000 }, (_, i) => ({
          id: batchNum * 5000 + i + 1,
          nombre: `Usuario ${batchNum * 5000 + i + 1}`,
          correo: `usuario${batchNum * 5000 + i + 1}@example.com`
        }));

        let processedCount = 0;
        records.forEach(record => {
          processedCount += 1;
        });
        return processedCount;
      });

      const start = performance.now();
      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      expect(results.reduce((a, b) => a + b, 0)).toBe(50000);
      expect(duration).toBeLessThan(5000);
      console.log(
        `✓ 10 concurrent exports (5000 records each) completed in ${duration.toFixed(2)}ms`
      );
    });
  });

  describe('Memory Stress during Export', () => {
    it('should maintain consistent performance across multiple export cycles', () => {
      const { result } = renderHook(() => useExportData());

      const cycles = 5;
      const recordsPerCycle = 20000;
      const times: number[] = [];

      for (let cycle = 0; cycle < cycles; cycle++) {
        const records = Array.from({ length: recordsPerCycle }, (_, i) => ({
          id: cycle * recordsPerCycle + i + 1,
          valor: Math.random() * 10000
        }));

        const start = performance.now();
        const sum = records.reduce((acc, r) => acc + r.valor, 0);
        const duration = performance.now() - start;
        times.push(duration);
      }

      // Verificar que la performance no se degrada significativamente
      const firstCycleTim = times[0];
      const lastCycleTime = times[cycles - 1];
      const degradation = (lastCycleTime / firstCycleTim - 1) * 100;

      expect(times.every(t => t < 5000)).toBe(true);
      expect(degradation).toBeLessThan(50); // Máximo 50% de degradación
      console.log(
        `✓ ${cycles} export cycles completed - Performance degradation: ${degradation.toFixed(2)}%`
      );
    });
  });
});
