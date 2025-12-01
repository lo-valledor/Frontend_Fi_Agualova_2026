// oxlint-disable no-unused-vars
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { LoadingCard } from '~/components/ui/loading-card';
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

// Types for better structure
type EtapaNumber = 1 | 2 | 3 | 4;
type EtapaData = EtapaUno[] | EtapaDos[] | EtapaTres[] | EtapaCuatro[];
type EtapaSetters = {
  1: React.Dispatch<React.SetStateAction<EtapaUno[]>>;
  2: React.Dispatch<React.SetStateAction<EtapaDos[]>>;
  3: React.Dispatch<React.SetStateAction<EtapaTres[]>>;
  4: React.Dispatch<React.SetStateAction<EtapaCuatro[]>>;
};

// Error messages for each stage
const ETAPA_ERROR_MESSAGES: Record<EtapaNumber, string> = {
  1: 'No hay información del medidor disponible',
  2: 'No hay datos de lectura registrados',
  3: 'No hay claves de lectura ingresadas aún',
  4: 'No hay análisis de consumo disponible'
};

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

  // Helper function to set etapa data based on stage number
  const setEtapaData = (etapa: EtapaNumber, data: EtapaData): void => {
    const setters: EtapaSetters = {
      1: setEtapa1Data,
      2: setEtapa2Data,
      3: setEtapa3Data,
      4: setEtapa4Data
    };

    setters[etapa](data as never);
  };

  // Helper function to get error message for a stage
  const getEtapaErrorMessage = (
    etapa: EtapaNumber,
    errorResponse?: any
  ): string => {
    // Check for 404 status
    if (errorResponse?.response?.status === 404) {
      return (
        ETAPA_ERROR_MESSAGES[etapa] ||
        errorResponse.response.data ||
        `No hay datos disponibles para la etapa ${etapa}`
      );
    }

    return `Error al cargar datos de la etapa ${etapa}`;
  };

  const fetchAllEtapas = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setEtapaErrors({});

    try {
      // Fetch all stages concurrently
      const stageNumbers: EtapaNumber[] = [1, 2, 3, 4];
      const results = await Promise.allSettled(
        stageNumbers.map(etapa => {
          const params = new URLSearchParams({
            idLec: lecturaId.toString(),
            etapa: etapa.toString()
          });
          return api.get('/datos-basicos-medidor', { params });
        })
      );

      // Process results and collect errors
      const newEtapaErrors: Record<number, string> = {};

      results.forEach((result, index) => {
        const etapa = (index + 1) as EtapaNumber;

        if (result.status === 'fulfilled') {
          // Success - set the data with proper type assertion
          setEtapaData(etapa, result.value.data as EtapaData);
        } else {
          // Failure - collect error and set empty data
          newEtapaErrors[etapa] = getEtapaErrorMessage(etapa, result.reason);
          setEtapaData(etapa, []);
        }
      });

      setEtapaErrors(newEtapaErrors);

      // If all stages failed, set general error
      if (Object.keys(newEtapaErrors).length === stageNumbers.length) {
        setError('No se pudieron cargar los datos del medidor');
      }
    } catch (error) {
      console.error('Error al obtener los datos del medidor:', error);
      setError('Error al obtener los datos del medidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceptarLectura = async (): Promise<void> => {
    try {
      const response = await api.post('/aceptar-lectura-medidor', {
        idLectura: lecturaId
      });

      // Early return for unsuccessful response
      if (response.status !== 200) {
        toast.error('No se pudo aceptar la lectura con clave crítica');
        return;
      }

      toast.success('Lectura aceptada correctamente');
      await fetchAllEtapas();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (_error) {
      toast.error('No se pudo aceptar la lectura con clave crítica');
    }
  };

  useEffect(() => {
    if (lecturaId) {
      fetchAllEtapas();
    }
  }, [lecturaId]);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center p-8'>
        <LoadingCard
          message='Cargando información del medidor'
          stage='Obteniendo datos de las 4 etapas...'
        />
      </div>
    );
  }

  // Early return for error state
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
