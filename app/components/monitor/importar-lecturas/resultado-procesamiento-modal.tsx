import { Download, FileSpreadsheet, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

interface DetalleProcesamientoItem {
  numeroSerie: string;
  tarifa: string;
  lecturaAnteriorKwh: number;
  consumoEnergiaKwh: number;
  usuarioCarga: string;
  estado: string;
  mensaje: string;
}

interface ProcesamientoResult {
  exitoso: boolean;
  mensaje: string;
  registrosActualizados: number;
  fechaProcesamiento: string;
  periodo: string;
  detalles: DetalleProcesamientoItem[];
}

interface ResultadoProcesamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultado: ProcesamientoResult | null;
}

export function ResultadoProcesamientoModal({
  isOpen,
  onClose,
  resultado
}: Readonly<ResultadoProcesamientoModalProps>) {
  if (!resultado) return null;

  // Función para convertir fecha UTC a zona horaria local
  const formatearFechaLocal = (fechaString: string): string => {
    try {
      // Si la fecha no tiene 'Z' al final, asumimos que es UTC y la agregamos
      const fechaUTC = fechaString.endsWith('Z')
        ? fechaString
        : `${fechaString}Z`;

      const fecha = new Date(fechaUTC);

      // Verificar si la fecha es válida
      if (Number.isNaN(fecha.getTime())) {
        return fechaString; // Si no se puede parsear, retornar el original
      }

      // Formatear a zona horaria local con formato legible
      return fecha.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return fechaString;
    }
  };

  const exportarAExcel = () => {
    try {
      // Preparar datos del resumen
      const resumenData = [
        ['RESULTADO DEL PROCESAMIENTO'],
        [''],
        ['Estado:', resultado.exitoso ? 'Exitoso' : 'Falló'],
        ['Mensaje:', resultado.mensaje],
        ['Registros Actualizados:', resultado.registrosActualizados],
        ['Período:', resultado.periodo],
        [
          'Fecha de Procesamiento:',
          formatearFechaLocal(resultado.fechaProcesamiento)
        ],
        [''],
        ['DETALLES DEL PROCESAMIENTO']
      ];

      // Preparar encabezados de detalles
      const encabezadosDetalles = [
        'Número de Serie',
        'Tarifa',
        'Lectura Anterior (kWh)',
        'Consumo Energía (kWh)',
        'Usuario Carga',
        'Estado',
        'Mensaje'
      ];

      const datosDetalles = resultado.detalles.map(detalle => [
        detalle.numeroSerie,
        detalle.tarifa,
        detalle.lecturaAnteriorKwh,
        detalle.consumoEnergiaKwh,
        detalle.usuarioCarga,
        detalle.estado,
        detalle.mensaje || '-'
      ]);

      const datosCompletos = [
        ...resumenData,
        encabezadosDetalles,
        ...datosDetalles
      ];

      // Crear hoja de cálculo
      const ws = XLSX.utils.aoa_to_sheet(datosCompletos);

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 20 }, // Número de Serie
        { wch: 15 }, // Tarifa
        { wch: 25 }, // Lectura Anterior
        { wch: 25 }, // Consumo Energía
        { wch: 20 }, // Usuario Carga
        { wch: 15 }, // Estado
        { wch: 40 } // Mensaje
      ];
      ws['!cols'] = columnWidths;

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Resultado Procesamiento');

      // Generar nombre de archivo con fecha y período
      const fechaArchivo = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Resultado_Procesamiento_${resultado.periodo}_${fechaArchivo}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      toast.success('Archivo Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar el archivo Excel');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[95vw] w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between p-2">
            <div>
              <DialogTitle className="text-xl">
                Resultado del Procesamiento
              </DialogTitle>
              <DialogDescription>
                Detalles completos del procesamiento de lecturas BT1-BT2
              </DialogDescription>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={exportarAExcel}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              <Download className="h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Resumen del procesamiento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background rounded-xl border">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {resultado.registrosActualizados}
              </div>
              <div className="text-xs text-muted-foreground">
                Registros Actualizados
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{resultado.periodo}</div>
              <div className="text-xs text-muted-foreground">Período</div>
            </div>
            <div className="text-center">
              <Badge variant={resultado.exitoso ? 'default' : 'destructive'}>
                {resultado.exitoso ? 'Exitoso' : 'Falló'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Estado</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-mono">
                {formatearFechaLocal(resultado.fechaProcesamiento)}
              </div>
              <div className="text-xs text-muted-foreground">Fecha</div>
            </div>
          </div>

          {/* Mensaje del resultado */}
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-sm text-green-800 dark:text-green-200">
              {resultado.mensaje}
            </p>
          </div>

          {/* Tabla de detalles */}
          {resultado.detalles && resultado.detalles.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">
                  Detalles del procesamiento ({resultado.detalles.length}{' '}
                  registros)
                </h4>
                <Badge variant="outline">
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {resultado.detalles.length} filas
                </Badge>
              </div>

              <div className="flex-1 border rounded-xl overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="min-w-35">
                        Número de Serie
                      </TableHead>
                      <TableHead className="min-w-20">Tarifa</TableHead>
                      <TableHead className="text-right min-w-37.5">
                        Lectura Ant. (kWh)
                      </TableHead>
                      <TableHead className="text-right min-w-35">
                        Consumo (kWh)
                      </TableHead>
                      <TableHead className="min-w-30">Usuario</TableHead>
                      <TableHead className="min-w-30">Estado</TableHead>
                      <TableHead className="min-w-62.5">Mensaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.detalles.map(detalle => (
                      <TableRow key={detalle.numeroSerie}>
                        <TableCell className="font-mono text-xs">
                          {detalle.numeroSerie}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{detalle.tarifa}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {detalle.lecturaAnteriorKwh.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {detalle.consumoEnergiaKwh.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {detalle.usuarioCarga}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              detalle.estado === 'Actualizado'
                                ? 'default'
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {detalle.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {detalle.mensaje || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
