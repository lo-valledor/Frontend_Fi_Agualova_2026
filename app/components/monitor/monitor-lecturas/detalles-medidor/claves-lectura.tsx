import { format } from 'date-fns';
import { AlertCircle, History, Key } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { EtapaTres } from '~/types/monitor';

interface ClavesLecturaProps {
  data: EtapaTres[];
  error?: string;
  onAceptarLectura: () => void;
}

export default function ClavesLectura({
  data,
  error,
  onAceptarLectura
}: Readonly<ClavesLecturaProps>) {
  // El botón se habilita solo si hay claves críticas
  // CLA_Tipo: 0 = OK/Normal (LEOK), 1-3 = Críticas/Alertas
  // Verificamos todo el array, no solo el primer elemento
  const hasClaveCritica =
    data.length > 0 &&
    data.some(
      item =>
        item.CLA_Tipo === 3 && // Tipo 3 indica clave crítica/alerta
        item.CLA_Codigo !== 'LEOK' // Excluir explícitamente LEOK por seguridad
    );

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
          <Key className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
          <span>Claves de Lectura</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0 space-y-3'>
        {error ? (
          // Mostrar diferentes estilos según el tipo de error
          error.includes('claves de lectura ingresadas aún') ? (
            <div className='p-6 sm:p-8 text-center'>
              <div className='flex flex-col items-center justify-center space-y-3'>
                <div className='text-4xl sm:text-5xl'>⏳</div>
                <div className='space-y-1'>
                  <p className='font-medium text-sm sm:text-base text-foreground'>
                    Lectura pendiente
                  </p>
                  <p className='text-xs sm:text-sm text-muted-foreground max-w-xs'>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800'>
              <AlertCircle className='h-3 w-3 mt-0.5 shrink-0' />
              <span>{error}</span>
            </div>
          )
        ) : data.length > 0 ? (
          <div className='space-y-2 sm:space-y-3'>
            {data.map((item, index) => (
              <div
                key={index}
                className='p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/20 hover:bg-muted/50 transition-colors'
              >
                <div className='flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4'>
                  {/* Código */}
                  <div className='flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1 sm:min-w-[80px]'>
                    <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide sm:order-1'>
                      Código
                    </span>
                    <span className='font-mono text-sm font-semibold text-foreground sm:order-2'>
                      {item.CLA_Codigo}
                    </span>
                  </div>

                  {/* Descripción */}
                  <div className='flex-1 space-y-1'>
                    <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide block sm:hidden'>
                      Descripción
                    </span>
                    <p className='text-sm text-foreground leading-relaxed wrap-break-word'>
                      {item.CLA_Descripcion}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div className='flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1 sm:min-w-[120px] text-right'>
                    <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide sm:order-1'>
                      Fecha
                    </span>
                    <div className='text-xs text-muted-foreground sm:order-2'>
                      <div className='font-mono'>
                        {format(new Date(item.CLL_Fecha), 'dd-MM-yyyy')}
                      </div>
                      <div className='font-mono text-muted-foreground/70'>
                        {format(new Date(item.CLL_Fecha), 'HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='p-6 sm:p-8 text-center'>
            <div className='flex flex-col items-center justify-center space-y-3'>
              <div className='text-4xl sm:text-5xl'>🔑</div>
              <div className='space-y-1'>
                <p className='font-medium text-sm sm:text-base text-foreground'>
                  No hay claves disponibles
                </p>
                <p className='text-xs sm:text-sm text-muted-foreground max-w-xs'>
                  No se encontraron registros de claves para esta lectura
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sección de acción solo cuando hay clave crítica */}
        {hasClaveCritica && (
          <div className='space-y-3 pt-2 border-t border-border/30'>
            <div className='flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800'>
              <History className='h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0' />
              <span className='text-sm text-orange-700 dark:text-orange-300 font-medium'>
                Resolver lectura con clave para lectura crítica
              </span>
            </div>

            <div className='flex justify-center sm:justify-end'>
              <Button
                variant='destructive'
                onClick={onAceptarLectura}
                className='w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 h-auto sm:h-10 text-sm font-medium bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-500 transition-all duration-200 shadow-sm hover:shadow-md'
              >
                <Key className='h-4 w-4 mr-2 shrink-0' />
                <span className='leading-tight text-center'>
                  <span className='block sm:inline'>Aceptar Lectura</span>
                  <span className='block sm:inline sm:ml-1'>
                    con Clave Crítica
                  </span>
                </span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
