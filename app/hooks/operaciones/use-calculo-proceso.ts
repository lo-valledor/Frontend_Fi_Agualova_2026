import { toast } from 'sonner';

import { useCallback, useEffect, useState, useRef } from 'react';

import api from '~/lib/api';

interface UseCalculoProcesoProps {
  periodoFormateado: string;
  cicloId: string;
  onCalculoAceptado: () => void;
}

export function useCalculoProceso({
  periodoFormateado,
  cicloId,
  onCalculoAceptado
}: UseCalculoProcesoProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedContratos, setSelectedContratos] = useState<number[]>([]);
  const [isCalculoPreparado, setIsCalculoPreparado] = useState(false);
  const [isProcesando, setIsProcesando] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [intentosPolling, setIntentosPolling] = useState(0);
  const [isCheckingInitialData, setIsCheckingInitialData] = useState(true);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tiempoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef<string | number | null>(null);
  const registrosInicialesRef = useRef<number>(0);
  const delayInicialRef = useRef<NodeJS.Timeout | null>(null);
  const tiempoTranscurridoRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const obtenerCicloParaAPI = (ciclo: string): string => {
    if (ciclo === '1' || ciclo === '2') return ciclo;
    if (ciclo.includes('15')) return '1';
    return ciclo;
  };

  // Limpiar todos los intervalos y timers
  const limpiarIntervalos = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (tiempoIntervalRef.current) {
      clearInterval(tiempoIntervalRef.current);
      tiempoIntervalRef.current = null;
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    if (delayInicialRef.current) {
      clearTimeout(delayInicialRef.current);
      delayInicialRef.current = null;
    }
  }, []);

  // Obtener número de registros actuales
  const obtenerNumeroRegistros = useCallback(async (): Promise<number> => {
    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const requestParams = {
        cicloId: cicloParaAPI,
        periodo: periodoFormateado
      };

      const response = await api.get('/calculo-prefactura-encabezado', {
        params: requestParams
      });

      return Array.isArray(response.data) ? response.data.length : 0;
    } catch (error: any) {
      // Si es un 404, es normal que no haya datos aún, no es un error crítico
      if (error.response?.status === 404) {
        return 0;
      }
      // Solo loguear otros errores que no sean 404
      console.error('Error obteniendo número de registros:', error);
      return 0;
    }
  }, [cicloId, periodoFormateado]);

  // Verificar si hay datos disponibles y si cambiaron desde el inicio
  const verificarDatosDisponibles = useCallback(async (intentoActual: number): Promise<{ datosListos: boolean; detenerPolling: boolean }> => {
    try {
      const registrosActuales = await obtenerNumeroRegistros();
      const registrosIniciales = registrosInicialesRef.current;
      
      // Caso 1: Hubo cambio (nuevas lecturas procesadas)
      const hayCambio = registrosActuales > registrosIniciales;
      if (registrosActuales > 0 && hayCambio) {
        return { datosListos: true, detenerPolling: true };
      }
      
      // Caso 2: Sin datos después del primer intento -> detener inmediatamente
      if (intentoActual === 1 && registrosActuales === 0) {
        return { datosListos: false, detenerPolling: true };
      }
      
      // Caso 3: Sin cambios pero hay datos existentes después de 3 intentos
      const SIN_CAMBIOS_THRESHOLD = 3; // ~12 segundos después del delay inicial
      if (
        registrosActuales > 0 && 
        registrosActuales === registrosIniciales && 
        intentoActual >= SIN_CAMBIOS_THRESHOLD
      ) {
        return { datosListos: true, detenerPolling: true }; // Datos ya disponibles de antes
      }
      
      return { datosListos: false, detenerPolling: false };
    } catch (error) {
      console.error('Error verificando datos disponibles:', error);
      // En caso de error, detener el polling
      return { datosListos: false, detenerPolling: true };
    }
  }, [obtenerNumeroRegistros]);

  // Iniciar polling para verificar cuando los datos estén listos
  const iniciarPolling = useCallback(async () => {
    setIsProcesando(true);
    setTiempoTranscurrido(0);
    setIntentosPolling(0);
    tiempoTranscurridoRef.current = 0;

    // Guardar número de registros inicial
    const registrosIniciales = await obtenerNumeroRegistros();
    registrosInicialesRef.current = registrosIniciales;

    // Mostrar toast de procesamiento
    toastIdRef.current = toast.loading('Iniciando procesamiento...', {
      description: `El sistema está generando las prefacturas${registrosIniciales > 0 ? ` (${registrosIniciales} registros previos detectados)` : ''}. Esto puede tomar varios minutos. Nota: Los cargos BT4-3 pueden demorar un poco más.`,
      duration: Infinity
    });

    // Contador de tiempo transcurrido
    tiempoIntervalRef.current = setInterval(() => {
      tiempoTranscurridoRef.current += 1;
      setTiempoTranscurrido(tiempoTranscurridoRef.current);
    }, 1000);

    // Delay inicial antes de empezar a verificar
    // Si hay registros previos: delay corto (solo verificar si cambiaron)
    // Si no hay registros: delay normal (dar tiempo al backend)
    const DELAY_INICIAL = registrosIniciales > 0 ? 8000 : 12000; // 8 o 12 segundos
    
    const mensajeDelay = registrosIniciales > 0
      ? `Verificando si hay nuevos cálculos. Se revisará en ${DELAY_INICIAL / 1000} segundos... (Nota: BT4-3 puede demorar más)`
      : `Esperando que el backend inicie el procesamiento. Los datos se verificarán en ${DELAY_INICIAL / 1000} segundos... (Nota: BT4-3 puede demorar más)`;
    
    toast.loading('Procesando cálculos...', {
      id: toastIdRef.current,
      description: mensajeDelay,
      duration: Infinity
    });

    delayInicialRef.current = setTimeout(() => {
      // Polling cada 4 segundos después del delay inicial
      let intentos = 0;
      const MAX_INTENTOS = 150; // 10 minutos máximo (150 * 4 seg = 600 seg)
      const registrosInicialesCapturados = registrosIniciales; // Capturar para usar en el closure

      pollingIntervalRef.current = setInterval(async () => {
        intentos++;
        setIntentosPolling(intentos);

        const resultado = await verificarDatosDisponibles(intentos);

        // Si debemos detener el polling
        if (resultado.detenerPolling) {
          limpiarIntervalos();
          setIsProcesando(false);
          
          if (resultado.datosListos) {
            // ¡Datos listos!
            const registrosActuales = await obtenerNumeroRegistros();
            const nuevosRegistros = registrosActuales - registrosInicialesCapturados;
            setIsCalculoPreparado(true);
            
            const tiempoFinal = tiempoTranscurridoRef.current;
            
            // Mensaje diferente según si hubo cambios o no
            if (nuevosRegistros > 0) {
              toast.success('¡Cálculos completados!', {
                description: `Proceso finalizado en ${Math.floor(tiempoFinal / 60)}:${(tiempoFinal % 60).toString().padStart(2, '0')} minutos. Se procesaron ${nuevosRegistros} nuevas lecturas. Haz clic en "Ver Cálculo Facturas".`,
                duration: 6000
              });
            } else {
              toast.success('Datos disponibles', {
                description: `Se encontraron ${registrosActuales} cálculos ya procesados. Haz clic en "Ver Cálculo Facturas" para revisarlos.`,
                duration: 5000
              });
            }
          } else {
            // No hay datos disponibles
            setIsCalculoPreparado(false);
            toast.info('No hay datos procesados', {
              description: 'No se encontraron cálculos de facturación para este periodo y ciclo. Verifica que haya lecturas cerradas y que el proceso de cálculo se haya completado correctamente.',
              duration: 6000
            });
          }
        } else if (intentos >= MAX_INTENTOS) {
          // Timeout (no debería llegar aquí con la nueva lógica, pero lo dejamos por seguridad)
          limpiarIntervalos();
          setIsProcesando(false);
          
          toast.error('Tiempo de espera excedido', {
            description: 'El proceso está tardando más de lo esperado. Por favor, verifica el estado manualmente o contacta al administrador.',
            duration: 8000
          });
        } else {
          // Actualizar toast con progreso (solo si seguimos esperando)
          if (toastIdRef.current) {
            const tiempoActual = tiempoTranscurridoRef.current;
            const minutos = Math.floor(tiempoActual / 60);
            const segundos = tiempoActual % 60;
            
            const registrosActualesAhora = await obtenerNumeroRegistros();
            const tieneRegistrosPrevios = registrosInicialesCapturados > 0;
            
            let descripcion = `Tiempo: ${minutos}:${segundos.toString().padStart(2, '0')}. `;
            
            if (tieneRegistrosPrevios) {
              descripcion += `${registrosActualesAhora} registros encontrados (verificando cambios). `;
            } else {
              descripcion += `Buscando nuevos datos... `;
            }
            
            descripcion += `(intento ${intentos}/${MAX_INTENTOS})`;
            
            toast.loading('Procesando cálculos...', {
              id: toastIdRef.current,
              description: descripcion,
              duration: Infinity
            });
          }
        }
      }, 4000); // Verificar cada 4 segundos
    }, DELAY_INICIAL);
  }, [verificarDatosDisponibles, limpiarIntervalos, obtenerNumeroRegistros]);

  const handleLanzarCalculo = async () => {
    if (!periodoFormateado || !cicloId) {
      toast.error('Periodo y ciclo son requeridos.');
      return;
    }
    setIsLaunching(true);
    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const requestBody = {
        cicloFacturacion: parseInt(cicloParaAPI),
        periodoFacturable: periodoFormateado
      };

      await api.post('lanzar-calculo-facturacion', requestBody);
      
      toast.info('Proceso iniciado', {
        description: 'El sistema está procesando los cálculos. Se le notificará cuando esté listo.',
        duration: 4000
      });

      // Iniciar polling en lugar de marcar inmediatamente como preparado
      await iniciarPolling();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.mensaje ||
        err.message ||
        'Error al lanzar el cálculo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleAceptarCalculo = async () => {
    if (selectedContratos.length === 0) {
      toast.error('Debe seleccionar al menos un contrato.');
      return;
    }
    setIsAccepting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const lecturaId of selectedContratos) {
      try {
        const requestBody = {
          lecturaId,
          periodoId: periodoFormateado
        };

        await api.post('generar-detalle-factura', requestBody);
        successCount++;
      } catch (error: any) {
        console.error(`Error al generar detalle de factura para lectura ${lecturaId}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} cálculos aceptados correctamente.`);
      onCalculoAceptado();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} cálculos fallaron.`);
    }

    setSelectedContratos([]);
    setIsAccepting(false);
  };

  // Verificar si hay datos disponibles al cargar/cambiar periodo o ciclo
  const verificarDatosIniciales = useCallback(async () => {
    // Prevenir múltiples llamadas simultáneas
    if (isCheckingRef.current) {
      return;
    }
    
    if (!periodoFormateado || !cicloId) {
      setIsCheckingInitialData(false);
      return;
    }

    try {
      isCheckingRef.current = true;
      setIsCheckingInitialData(true);
      const numRegistros = await obtenerNumeroRegistros();
      
      // Si hay registros, habilitar el botón Ver automáticamente
      if (numRegistros > 0) {
        setIsCalculoPreparado(true);
      } else {
        setIsCalculoPreparado(false);
      }
    } catch (error) {
      console.error('Error verificando datos iniciales:', error);
      setIsCalculoPreparado(false);
    } finally {
      setIsCheckingInitialData(false);
      isCheckingRef.current = false;
    }
  }, [periodoFormateado, cicloId, obtenerNumeroRegistros]);

  // Reset state when cicloId or periodo changes
  useEffect(() => {
    setIsProcesando(false);
    limpiarIntervalos();
    verificarDatosIniciales();
  }, [cicloId, periodoFormateado, limpiarIntervalos, verificarDatosIniciales]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      limpiarIntervalos();
    };
  }, [limpiarIntervalos]);

  return {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    isCalculoPreparado,
    isProcesando,
    tiempoTranscurrido,
    intentosPolling,
    isCheckingInitialData,
    handleLanzarCalculo,
    handleAceptarCalculo,
    setIsCalculoPreparado
  };
}
