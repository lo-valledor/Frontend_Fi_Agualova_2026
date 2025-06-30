import api from '~/lib/api';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { toast } from 'sonner';
import { ScrollArea } from '~/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  EtapaUno,
  EtapaDos,
  EtapaTres,
  EtapaCuatro,
} from '~/types/monitor';

// Componentes de presentación
import InformacionMedidor from './detalles-medidor/informacion-medidor';
import ClavesLectura from './detalles-medidor/claves-lectura';
import AnalisisConsumo from './detalles-medidor/analisis-consumo';

export default function DetallesMedidor({
  lecturaId,
  onSuccess,
}: {
  lecturaId: number;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etapaErrors, setEtapaErrors] = useState<Record<number, string>>({});
  const [etapa1Data, setEtapa1Data] = useState<EtapaUno[]>([]);
  const [, setEtapa2Data] = useState<EtapaDos[]>([]);
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
        etapas.map((etapa) => {
          const params = new URLSearchParams({
            idLec: lecturaId.toString(),
            etapa: etapa.toString(),
          });
          return api.get('/datos-basicos-medidor', { params });
        }),
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
            newEtapaErrors[etapa] =
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
        toast.error('No se pudieron cargar los datos del medidor');
        setError('No se pudieron cargar los datos del medidor');
      }
    } catch (error) {
      console.error('Error general al obtener datos:', error);
      toast.error('Error al obtener los datos del medidor');
      setError('Error al obtener los datos del medidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceptarLectura = async () => {
    try {
      const response = await api.post('/aceptar-lectura-medidor', {
        idLectura: lecturaId,
      });
      if (response.status === 200) {
        toast.success('Lectura aceptada correctamente');
        fetchAllEtapas();
        // Llamar al callback onSuccess si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Error al aceptar la lectura');
      }
    } catch (_error) {
      //console.error('Error al aceptar la lectura:', error); // eslint-disable-line no-console
      toast.error('Error al aceptar la lectura');
    }
  };

  useEffect(() => {
    if (lecturaId) {
      fetchAllEtapas();
    }
  }, [lecturaId]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Cargando datos del medidor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="overflow-y-auto">
      <div className="">
        <InformacionMedidor
          data={etapa1Data}
          error={etapaErrors[1]}
          lecturaId={lecturaId}
        />

        <AnalisisConsumo data={etapa4Data} error={etapaErrors[4]} />

        <ClavesLectura
          data={etapa3Data}
          error={etapaErrors[3]}
          onAceptarLectura={handleAceptarLectura}
        />
      </div>
    </ScrollArea>
  );
}
