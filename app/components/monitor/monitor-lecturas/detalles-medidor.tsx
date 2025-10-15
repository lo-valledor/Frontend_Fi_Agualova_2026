// oxlint-disable no-unused-vars
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { ScrollArea } from '~/components/ui/scroll-area';
import api from '~/lib/api';
import type {
  EtapaCuatro,
  EtapaDos,
  EtapaTres,
  EtapaUno
} from '~/types/monitor';

import AnalisisConsumo from './detalles-medidor/analisis-consumo';
import ClavesLectura from './detalles-medidor/claves-lectura';
import InformacionLectura from './detalles-medidor/informacion-lectura';
// Componentes de presentación
import InformacionMedidor from './detalles-medidor/informacion-medidor';

export default function DetallesMedidor({
  lecturaId,
  onSuccess
}: Readonly<{
  lecturaId: number;
  onSuccess?: () => void;
}>) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etapaErrors, setEtapaErrors] = useState<Record<number, string>>({});
  const [etapa1Data, setEtapa1Data] = useState<EtapaUno[]>([]);
  const [etapa2Data, setEtapa2Data] = useState<EtapaDos[]>([]);
  const [etapa3Data, setEtapa3Data] = useState<EtapaTres[]>([]);
  const [etapa4Data, setEtapa4Data] = useState<EtapaCuatro[]>([]);

  const fetchAllEtapas = async () => {
    setIsLoading(true);
    setError(null);
    setEtapaErrors({});

    try {
      // Crear un array de promesas para todas las etapas
      const etapas = [1, 2, 3, 4];
      const results = await Promise.allSettled(
        etapas.map(etapa => {
          const params = new URLSearchParams({
            idLec: lecturaId.toString(),
            etapa: etapa.toString()
          });
          return api.get('/datos-basicos-medidor', { params });
        })
      );

      // Procesar los resultados de cada etapa
      const newEtapaErrors: Record<number, string> = {};

      results.forEach((result, index) => {
        const etapa = index + 1;

        if (result.status === 'fulfilled') {
          // La etapa se completó correctamente
          switch (etapa) {
            case 1:
              setEtapa1Data(result.value.data as EtapaUno[]);
              break;
            case 2:
              setEtapa2Data(result.value.data as EtapaDos[]);
              break;
            case 3:
              setEtapa3Data(result.value.data as EtapaTres[]);
              break;
            case 4:
              setEtapa4Data(result.value.data as EtapaCuatro[]);
              break;
          }
        } else {
          // La etapa falló
          //console.warn(`Error en etapa ${etapa}:`, result.reason);

          // Si es un error 404, establecer un mensaje específico
          if (result.reason?.response?.status === 404) {
            // Mensajes específicos para cada etapa
            const etapaMessages = {
              1: 'No hay información del medidor disponible',
              2: 'No hay datos de lectura registrados',
              3: 'No hay claves de lectura ingresadas aún',
              4: 'No hay análisis de consumo disponible'
            };

            newEtapaErrors[etapa] =
              etapaMessages[etapa as keyof typeof etapaMessages] ||
              result.reason.response.data ||
              `No hay datos disponibles para la etapa ${etapa}`;
          } else {
            newEtapaErrors[etapa] =
              `Error al cargar datos de la etapa ${etapa}`;
          }

          // Inicializar con array vacío para evitar errores
          switch (etapa) {
            case 1:
              setEtapa1Data([]);
              break;
            case 2:
              setEtapa2Data([]);
              break;
            case 3:
              setEtapa3Data([]);
              break;
            case 4:
              setEtapa4Data([]);
              break;
          }
        }
      });

      setEtapaErrors(newEtapaErrors);

      // Si todas las etapas fallaron, establecer un error general
      if (Object.keys(newEtapaErrors).length === 4) {
        // Error silencioso - el UI ya muestra el estado de error apropiadamente
        setError('No se pudieron cargar los datos del medidor');
      }
    } catch (error) {
      console.error('Error general al obtener datos:', error);
      // Error silencioso - el estado de error se muestra en la UI
      setError('Error al obtener los datos del medidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceptarLectura = async () => {
    try {
      const response = await api.post('/aceptar-lectura-medidor', {
        idLectura: lecturaId
      });
      if (response.status === 200) {
        toast.success('Lectura aceptada correctamente');
        fetchAllEtapas();
        // Llamar al callback onSuccess si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('No se pudo aceptar la lectura con clave crítica');
      }
    } catch (_error) {
      //console.error('Error al aceptar la lectura:', error); // eslint-disable-line no-console
      toast.error('No se pudo aceptar la lectura con clave crítica');
    }
  };

  useEffect(() => {
    if (lecturaId) {
      fetchAllEtapas();
    }
  }, [lecturaId]);

  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center p-8'>
        <div className='text-center space-y-3'>
          <div className='w-8 h-8 border-2 border-blue-200 dark:border-blue-800  rounded-full animate-spin mx-auto'></div>
          <p className='text-sm font-medium'>Cargando datos del medidor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive' className='my-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className='overflow-y-auto'>
      <div className='space-y-4 p-1'>
        <InformacionMedidor
          data={etapa1Data}
          error={etapaErrors[1]}
          lecturaId={lecturaId}
        />

        <InformacionLectura data={etapa2Data} error={etapaErrors[2]} />

        <AnalisisConsumo
          dataEtapaUno={etapa1Data}
          dataEtapaDos={etapa2Data}
          dataEtapaCuatro={etapa4Data}
          error={etapaErrors[4]}
        />

        <ClavesLectura
          data={etapa3Data}
          error={etapaErrors[3]}
          onAceptarLectura={handleAceptarLectura}
        />
      </div>
    </ScrollArea>
  );
}
