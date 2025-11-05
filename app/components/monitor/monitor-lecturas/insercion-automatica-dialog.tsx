/**
 * Componente de diálogo para inserción automática de lecturas
 * Muestra resumen de validación y procesa inserciones en lote
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import {
  analizarMedidoresParaInsercion,
  procesarInsercionAutomatica,
  type LecturaParaInsertar,
  type ResultadoInsercion
} from '~/services/insercionAutomaticaService';
import type { MedidorNichoItem } from '~/types/monitor';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Progress } from '~/components/ui/progress';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

interface InsercionAutomaticaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medidores: MedidorNichoItem[];
  periodo: string;
  onSuccess?: () => void;
}

export function InsercionAutomaticaDialog({
  open,
  onOpenChange,
  medidores,
  periodo,
  onSuccess
}: InsercionAutomaticaDialogProps) {
  const [fase, setFase] = useState<
    'analisis' | 'confirmacion' | 'procesando' | 'resultados'
  >('analisis');
  const [autoInsertables, setAutoInsertables] = useState<LecturaParaInsertar[]>(
    []
  );
  const [requierenRevision, setRequierenRevision] = useState<
    LecturaParaInsertar[]
  >([]);
  const [resultado, setResultado] = useState<ResultadoInsercion | null>(null);
  const [progreso, setProgreso] = useState(0);

  // Analizar medidores cuando se abre el diálogo
  const handleAnalizar = () => {
    const analisis = analizarMedidoresParaInsercion(medidores);
    setAutoInsertables(analisis.autoInsertables);
    setRequierenRevision(analisis.requierenRevision);
    setFase('confirmacion');
  };

  // Procesar inserción automática
  const handleProcesar = async () => {
    if (autoInsertables.length === 0) {
      toast.warning('No hay lecturas para insertar automáticamente');
      return;
    }

    setFase('procesando');
    setProgreso(0);

    try {
      // Simular progreso durante el procesamiento
      const intervalo = setInterval(() => {
        setProgreso(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await procesarInsercionAutomatica(autoInsertables, periodo);

      clearInterval(intervalo);
      setProgreso(100);
      setResultado(res);
      setFase('resultados');

      // Mostrar notificación de resumen
      if (res.exitosas > 0) {
        toast.success(`${res.exitosas} lecturas insertadas correctamente`);
      }
      if (res.fallidas > 0) {
        toast.error(`${res.fallidas} lecturas fallaron`);
      }

      // Notificar al componente padre
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al procesar inserción automática:', error);
      toast.error('Error al procesar inserción automática');
      setFase('confirmacion');
    }
  };

  // Reiniciar diálogo
  const handleCerrar = () => {
    setFase('analisis');
    setAutoInsertables([]);
    setRequierenRevision([]);
    setResultado(null);
    setProgreso(0);
    onOpenChange(false);
  };

  // Ejecutar análisis automáticamente cuando se abre
  if (open && fase === 'analisis') {
    handleAnalizar();
  }

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className='min-w-[800px] max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-foreground'>
            <Zap className='h-5 w-5 text-primary' />
            Validación Automática de Lecturas
          </DialogTitle>
          <DialogDescription>
            {fase === 'confirmacion' &&
              'Revise el análisis y confirme la inserción automática'}
            {fase === 'procesando' && 'Procesando lecturas...'}
            {fase === 'resultados' && 'Proceso completado'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-auto'>
          <AnimatePresence mode='wait'>
            {/* Fase: Confirmación */}
            {fase === 'confirmacion' && (
              <motion.div
                key='confirmacion'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='space-y-4'
              >
                {/* Resumen general */}
                <div className='grid grid-cols-3 gap-4'>
                  <div className='bg-background rounded-xl p-4 border'>
                    <div className='text-sm text-muted-foreground mb-1'>
                      Total de Medidores
                    </div>
                    <div className='text-2xl font-bold'>{medidores.length}</div>
                  </div>
                  <div className='bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-border'>
                    <div className='text-sm text-emerald-700 dark:text-emerald-300 mb-1'>
                      Auto-Validables
                    </div>
                    <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-300'>
                      {autoInsertables.length}
                    </div>
                  </div>
                  <div className='bg-muted/50 rounded-xl p-4 border border-border'>
                    <div className='text-sm text-muted-foreground mb-1'>
                      Requieren Revisión
                    </div>
                    <div className='text-2xl font-bold text-foreground'>
                      {requierenRevision.length}
                    </div>
                  </div>
                </div>

                {/* Alertas informativas */}
                {autoInsertables.length === 0 && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>
                      No hay lecturas para inserción automática
                    </AlertTitle>
                    <AlertDescription>
                      Todas las lecturas requieren revisión manual. Revise la
                      tabla de razones para más detalles.
                    </AlertDescription>
                  </Alert>
                )}

                {autoInsertables.length > 0 && (
                  <Alert className='border-border bg-emerald-50 dark:bg-emerald-950/30'>
                    <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                    <AlertTitle className='text-emerald-800 dark:text-emerald-200'>
                      Listo para inserción automática
                    </AlertTitle>
                    <AlertDescription className='text-emerald-700 dark:text-emerald-300'>
                      {autoInsertables.length} lecturas han pasado todas las
                      validaciones y están listas para ser insertadas
                      automáticamente.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tabla de lecturas auto-insertables */}
                {autoInsertables.length > 0 && (
                  <div className='space-y-2'>
                    <h3 className='font-semibold text-sm text-emerald-700 dark:text-emerald-300'>
                      Lecturas que se insertarán automáticamente:
                    </h3>
                    <ScrollArea className='h-[200px] border rounded-xl'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>N° Serie</TableHead>
                            <TableHead>Tarifa</TableHead>
                            <TableHead className='text-right'>
                              Lectura Anterior
                            </TableHead>
                            <TableHead className='text-right'>
                              Lectura Nueva
                            </TableHead>
                            <TableHead className='text-right'>
                              Consumo
                            </TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {autoInsertables.map(lectura => (
                            <TableRow key={lectura.medidor.LM_ID}>
                              <TableCell className='font-mono text-sm'>
                                {lectura.medidor.ME_NSerie}
                              </TableCell>
                              <TableCell>
                                <Badge variant='outline'>
                                  {lectura.medidor.tarifa}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-right font-mono'>
                                {lectura.lecturaAnterior.toLocaleString()}
                              </TableCell>
                              <TableCell className='text-right font-mono'>
                                {lectura.lecturaActual.toLocaleString()}
                              </TableCell>
                              <TableCell className='text-right font-mono font-semibold'>
                                {lectura.consumoCalculado.toLocaleString()} kWh
                              </TableCell>
                              <TableCell>
                                <Badge className='bg-green-500'>
                                  <CheckCircle2 className='h-3 w-3 mr-1' />
                                  Válido
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}

                {/* Tabla de lecturas que requieren revisión */}
                {requierenRevision.length > 0 && (
                  <div className='space-y-2'>
                    <h3 className='font-semibold text-sm text-muted-foreground'>
                      Lecturas que requieren revisión manual:
                    </h3>
                    <ScrollArea className='h-[200px] border rounded-xl'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>N° Serie</TableHead>
                            <TableHead>Tarifa</TableHead>
                            <TableHead>Razones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requierenRevision.map(lectura => (
                            <TableRow key={lectura.medidor.LM_ID}>
                              <TableCell className='font-mono text-sm'>
                                {lectura.medidor.ME_NSerie}
                              </TableCell>
                              <TableCell>
                                <Badge variant='outline'>
                                  {lectura.medidor.tarifa}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className='space-y-1'>
                                  {lectura.validacion.razones.map(
                                    (razon, idx) => (
                                      <div
                                        key={idx}
                                        className='text-xs text-muted-foreground flex items-start gap-1'
                                      >
                                        <AlertCircle className='h-3 w-3 text-muted-foreground shrink-0 mt-0.5' />
                                        <span>{razon}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </motion.div>
            )}

            {/* Fase: Procesando */}
            {fase === 'procesando' && (
              <motion.div
                key='procesando'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col items-center justify-center py-12 space-y-4'
              >
                <Loader2 className='h-12 w-12 animate-spin text-primary' />
                <div className='text-center space-y-2'>
                  <p className='text-lg font-semibold'>
                    Insertando lecturas automáticamente...
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Procesando {autoInsertables.length} lecturas
                  </p>
                </div>
                <div className='w-full max-w-md space-y-2'>
                  <Progress value={progreso} className='h-2' />
                  <p className='text-xs text-center text-muted-foreground'>
                    {progreso}% completado
                  </p>
                </div>
              </motion.div>
            )}

            {/* Fase: Resultados */}
            {fase === 'resultados' && resultado && (
              <motion.div
                key='resultados'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-4'
              >
                {/* Resumen de resultados */}
                <div className='grid grid-cols-3 gap-4'>
                  <div className='bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-border'>
                    <div className='text-sm text-emerald-700 dark:text-emerald-300 mb-1'>
                      Exitosos
                    </div>
                    <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-300'>
                      {resultado.exitosas}
                    </div>
                  </div>
                  <div className='bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-800'>
                    <div className='text-sm text-red-700 dark:text-red-300 mb-1'>
                      Fallidas
                    </div>
                    <div className='text-2xl font-bold text-red-700 dark:text-red-300'>
                      {resultado.fallidas}
                    </div>
                  </div>
                  <div className='bg-background rounded-xl p-4 border'>
                    <div className='text-sm text-muted-foreground mb-1'>
                      Omitidas
                    </div>
                    <div className='text-2xl font-bold'>
                      {resultado.omitidas}
                    </div>
                  </div>
                </div>

                {/* Detalles de resultados */}
                <div className='space-y-2'>
                  <h3 className='font-semibold text-sm'>
                    Detalle de resultados:
                  </h3>
                  <ScrollArea className='h-[300px] border rounded-xl'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Serie</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Mensaje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.detalles.map((detalle, idx) => (
                          <TableRow key={idx}>
                            <TableCell className='font-mono text-sm'>
                              {detalle.nSerie}
                            </TableCell>
                            <TableCell>
                              {detalle.estado === 'exitosa' && (
                                <Badge className='bg-green-500'>
                                  <CheckCircle2 className='h-3 w-3 mr-1' />
                                  Exitosa
                                </Badge>
                              )}
                              {detalle.estado === 'fallida' && (
                                <Badge variant='destructive'>
                                  <AlertCircle className='h-3 w-3 mr-1' />
                                  Fallida
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {detalle.mensaje}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        <DialogFooter>
          {fase === 'confirmacion' && (
            <>
              <Button variant='outline' onClick={handleCerrar}>
                Cancelar
              </Button>
              <Button
                onClick={handleProcesar}
                disabled={autoInsertables.length === 0}
                className='bg-primary hover:bg-primary/90'
              >
                <Zap className='h-4 w-4 mr-2' />
                Validar {autoInsertables.length} Lecturas
              </Button>
            </>
          )}
          {fase === 'resultados' && (
            <Button onClick={handleCerrar}>Cerrar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
