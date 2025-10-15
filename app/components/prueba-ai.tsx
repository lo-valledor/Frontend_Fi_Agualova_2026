import React, { useState } from 'react';
import { aiService } from '~/services/aiService';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Brain, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

type PruebaAIProps = unknown;

export const PruebaAI: React.FC<PruebaAIProps> = () => {
  const [contratoId, setContratoId] = useState<number>(1001);
  const [mesesProyeccion, setMesesProyeccion] = useState<6 | 12 | 24>(6);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [servicioDisponible, setServicioDisponible] = useState<boolean | null>(
    null
  );

  const verificarServicio = async () => {
    try {
      setLoading(true);
      const disponible = await aiService.isAvailable();
      setServicioDisponible(disponible);

      if (disponible) {
        const health = await aiService.checkHealth();
        console.log('Estado del servicio:', health);
      }
    } catch (err) {
      setError('Error verificando servicio de IA');
      setServicioDisponible(false);
    } finally {
      setLoading(false);
    }
  };

  const generarProyecciones = async () => {
    try {
      setLoading(true);
      setError(null);
      setResultado(null);

      const request = {
        contratoId: contratoId,
        periodoMeses: mesesProyeccion
      };

      console.log('Enviando request:', request);

      const response = await aiService.obtenerProyeccionesIA(request);

      if (response) {
        setResultado(response);
        console.log('Respuesta recibida:', response);
      } else {
        setError('No se pudieron generar las proyecciones');
      }
    } catch (err: any) {
      setError(err.message || 'Error generando proyecciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    verificarServicio();
  }, []);

  return (
    <div className='p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='h-5 w-5' />
            Prueba del Servicio de IA
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Estado del Servicio */}
          <div className='flex items-center gap-2'>
            <Button
              onClick={verificarServicio}
              disabled={loading}
              variant='outline'
              size='sm'
            >
              {loading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Verificar Servicio'
              )}
            </Button>

            {servicioDisponible !== null && (
              <div className='flex items-center gap-2'>
                {servicioDisponible ? (
                  <>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span className='text-sm text-green-600'>
                      Servicio disponible
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className='h-4 w-4 text-red-500' />
                    <span className='text-sm text-red-600'>
                      Servicio no disponible
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Formulario de Prueba */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='contrato'>ID del Contrato</Label>
              <Input
                id='contrato'
                type='number'
                value={contratoId}
                onChange={e => setContratoId(Number(e.target.value))}
                placeholder='Ej: 1001'
              />
            </div>
            <div>
              <Label htmlFor='meses'>Meses de Proyección</Label>
              <select
                id='meses'
                value={mesesProyeccion}
                onChange={e =>
                  setMesesProyeccion(Number(e.target.value) as 6 | 12 | 24)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generarProyecciones}
            disabled={loading || servicioDisponible === false}
            className='w-full'
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Generando Proyecciones...
              </>
            ) : (
              'Generar Proyecciones'
            )}
          </Button>

          {/* Mostrar Error */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Mostrar Resultado */}
          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Resultado de Proyección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {/* Metadata */}
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <strong>Modelo:</strong>{' '}
                      {resultado.metadata?.modeloUsado || 'N/A'}
                    </div>
                    <div>
                      <strong>Muestras:</strong>{' '}
                      {resultado.metadata?.muestrasEntrenamiento || 'N/A'}
                    </div>
                    <div>
                      <strong>Confianza:</strong>{' '}
                      {resultado.metadata?.confianzaGeneral || 'N/A'}
                    </div>
                    <div>
                      <strong>Total Proyectado:</strong>{' '}
                      {resultado.metadata?.totalConsumoProyectado?.toFixed(2) ||
                        'N/A'}{' '}
                      kWh
                    </div>
                  </div>

                  {/* Proyecciones */}
                  {resultado.proyecciones &&
                    resultado.proyecciones.length > 0 && (
                      <div>
                        <h4 className='font-medium mb-2'>
                          Proyecciones Mensuales:
                        </h4>
                        <div className='max-h-60 overflow-y-auto'>
                          <table className='w-full text-sm'>
                            <thead>
                              <tr className='border-b'>
                                <th className='text-left p-2'>Mes</th>
                                <th className='text-right p-2'>
                                  Consumo (kWh)
                                </th>
                                <th className='text-right p-2'>Confianza</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resultado.proyecciones.map(
                                (proj: any, index: number) => (
                                  <tr key={index} className='border-b'>
                                    <td className='p-2'>
                                      {proj.mes} {proj.año}
                                    </td>
                                    <td className='p-2 text-right'>
                                      {proj.consumoProyectado?.toFixed(2) ||
                                        'N/A'}
                                    </td>
                                    <td className='p-2 text-right'>
                                      <span
                                        className={`px-2 py-1 rounded text-xs ${
                                          proj.confianza === 'Alta'
                                            ? 'bg-green-100 text-green-800'
                                            : proj.confianza === 'Media'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {proj.confianza}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Raw Data para Debug */}
                  <details className='mt-4'>
                    <summary className='cursor-pointer text-sm text-gray-600'>
                      Ver datos completos (Debug)
                    </summary>
                    <pre className='mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40'>
                      {JSON.stringify(resultado, null, 2)}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
