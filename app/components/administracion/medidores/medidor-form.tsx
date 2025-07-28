import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Gauge,
  Hash,
  Power,
  Search,
  Tag,
  Type,
} from 'lucide-react';
import { z } from 'zod';

import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import Select, { type StylesConfig } from 'react-select';

import { useTheme } from '~/components/theme-provider';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import api from '~/lib/api';
import type {
  ActualizarMedidorProps,
  CrearMedidorProps,
  GetMedidores,
  SubempalmeOption,
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';

// Estilos para react-select con tema claro y oscuro
const selectStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'hsl(var(--card))',
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--ring))' : 'none',
    minHeight: '44px',
    '&:hover': {
      borderColor: 'hsl(var(--ring))',
    },
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
    color: 'hsl(var(--foreground))',
    '&:hover': {
      backgroundColor: 'hsl(var(--accent))',
    },
  }),
  singleValue: provided => ({
    ...provided,
    color: 'hsl(var(--foreground))',
  }),
  input: provided => ({
    ...provided,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: provided => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
  }),
  menuList: provided => ({
    ...provided,
    backgroundColor: 'hsl(var(--card))',
  }),
};

// Zod schema for form validation
const medidorSchema = z.object({
  marcaCodigo: z.string().min(1, 'La marca es requerida'),
  tipoId: z.coerce.number().min(1, 'El tipo es requerido'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  serie: z.string().min(1, 'El número de serie es requerido'),
  estadoId: z.coerce.number().min(1, 'El estado es requerido'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  digitos: z.coerce.number().min(1, 'Los dígitos son requeridos'),
  multiplicar: z.coerce.number().min(1, 'El multiplicador es requerido'),
  primeraLectura: z.string().optional(),
  fechaPrimeraLectura: z.string().optional(),
  horaPrimeraLectura: z.string().optional(),
  subempalmeId: z.coerce.number().optional(),
  subempalmeCodigo: z.string().optional(),
});

const getEstadoIdFromString = (estado: string): number => {
  switch (estado.toLowerCase()) {
    case 'activo':
      return 1;
    case 'en bodega':
      return 2;
    case 'en reparación':
      return 3;
    case 'inactivo':
      return 4;
    default:
      return 1; // Default to 'Activo'
  }
};

type MedidorFormData = z.infer<typeof medidorSchema>;

// Tipo local para los tipos de medidores, ya que no existe en los tipos globales.
interface TiposMedidores {
  id: number;
  nombre: string;
}

interface MedidorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit'
  ) => Promise<void>;
  medidor?: GetMedidores | null;
  mode: 'add' | 'edit';
  isLoading?: boolean;
  marcas: Marca[];
  tipos: TiposMedidores[];
}

export function MedidorFormModal({
  isOpen,
  onClose,
  onSubmit,
  medidor,
  mode,
  isLoading,
  marcas,
  tipos,
}: MedidorFormModalProps) {
  const { theme } = useTheme();
  const [medidorDetalle, setMedidorDetalle] = useState<any>(null);
  const [cantidadLecturas, setCantidadLecturas] = useState<number>(0);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);

  // Función para determinar si los campos de lectura están habilitados
  const isEstadoActivo = (estadoId: number) => {
    // Estado "Activo" tiene ID 1 (asumiendo que es el primer estado)
    return estadoId === 1;
  };

  // Estados para el modal de subempalmes
  const [modalSubempalmes, setModalSubempalmes] = useState(false);
  const [busquedaSubempalme, setBusquedaSubempalme] = useState('');
  const [subempalmes, setSubempalmes] = useState<SubempalmeOption[]>([]);

  const [isLoadingSubempalmes, setIsLoadingSubempalmes] = useState(false);

  const form = useForm<MedidorFormData>({
    resolver: zodResolver(medidorSchema),
    defaultValues: {
      marcaCodigo: '',
      tipoId: 0,
      modelo: '',
      serie: '',
      estadoId: 1, // Activo por defecto
      fechaInicio: '',
      digitos: 0,
      multiplicar: 1,
      primeraLectura: '',
      fechaPrimeraLectura: '',
      horaPrimeraLectura: '',
      subempalmeId: 0,
      subempalmeCodigo: '',
    },
  });

  // Función para cargar subempalmes
  const cargarSubempalmes = async () => {
    setIsLoadingSubempalmes(true);
    try {
      const response = await api.get('/MedidorSubempalmes');
      if (response.data) {
        setSubempalmes(response.data as SubempalmeOption[]);
      }
    } catch (error) {
      console.error('Error al cargar subempalmes:', error);
    } finally {
      setIsLoadingSubempalmes(false);
    }
  };

  // Función para seleccionar subempalme
  const handleSelectSubempalme = (subempalme: SubempalmeOption) => {
    console.log('Subempalme seleccionado:', subempalme);
    form.setValue('subempalmeId', subempalme.id);
    form.setValue('subempalmeCodigo', subempalme.codigo);
    setModalSubempalmes(false);
    setBusquedaSubempalme('');

    // Debug para verificar que se establecieron correctamente
    setTimeout(() => {
      const currentValues = form.getValues();
      console.log('Valores del formulario después de seleccionar subempalme:', {
        subempalmeId: currentValues.subempalmeId,
        subempalmeCodigo: currentValues.subempalmeCodigo,
      });
    }, 100);
  };

  // Filtrar subempalmes
  const subempalmesFiltrados = subempalmes.filter(subempalme => {
    const texto =
      `${subempalme.codigo} ${subempalme.ubicacion} ${subempalme.descripcionEmpalme} ${subempalme.descripcionNicho}`.toLowerCase();
    return texto.includes(busquedaSubempalme.toLowerCase());
  });

  // Cargar datos detallados del medidor cuando se edita
  useEffect(() => {
    const cargarDetalleMedidor = async () => {
      if (mode === 'edit' && medidor && isOpen) {
        setIsLoadingDetalle(true);
        try {
          // Cargar datos detallados del medidor usando la API correcta
          const response = await api.get(`/medidor/${medidor.codigo}`);
          if (response.data) {
            setMedidorDetalle(response.data);
          }

          // Cargar cantidad de lecturas
          const lecturasResponse = await api.get(
            `/medidor/lecturas/${medidor.codigo}`
          );
          if (lecturasResponse.data) {
            const lecturasData = lecturasResponse.data as {
              cantidadLecturas: string;
            };
            setCantidadLecturas(Number(lecturasData.cantidadLecturas) || 0);
          }
        } catch (error) {
          console.error('Error al cargar detalles del medidor:', error);
        } finally {
          setIsLoadingDetalle(false);
        }
      }
    };

    cargarDetalleMedidor();
  }, [mode, medidor, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && medidor) {
        const marcaSeleccionada = marcas.find(m => m.nombre === medidor.marca);

        // Búsqueda más flexible del tipo
        const tipoSeleccionado = tipos.find(t => {
          const tipoMedidor = medidor.tipo
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const tipoDisponible = t.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

          return (
            tipoDisponible === tipoMedidor ||
            tipoDisponible.includes(tipoMedidor) ||
            tipoMedidor.includes(tipoDisponible) ||
            // Mapeo específico para casos comunes
            (tipoMedidor === 'monofasico' &&
              tipoDisponible.includes('monofasico')) ||
            (tipoMedidor === 'trifasico' &&
              tipoDisponible.includes('trifasico'))
          );
        });

        // Debug para entender el problema del tipo
        console.log('Debug tipo medidor:', {
          medidorTipo: medidor.tipo,
          tiposDisponibles: tipos,
          tipoEncontrado: tipoSeleccionado,
          tipoId: tipoSeleccionado?.id ?? 0,
        });

        // Debug adicional para ver los tipos disponibles
        console.log(
          'Tipos disponibles:',
          tipos.map(t => ({ id: t.id, nombre: t.nombre }))
        );

        // Reset del formulario con un pequeño delay para asegurar que los datos estén cargados
        setTimeout(() => {
          form.reset({
            marcaCodigo: marcaSeleccionada?.codigo ?? '',
            tipoId: tipoSeleccionado?.id ?? 0,
            modelo: medidor.modelo,
            serie: medidor.serie,
            fechaInicio: new Date(medidor.fechaInicio)
              .toISOString()
              .split('T')[0],
            digitos: medidor.digitos,
            multiplicar: medidor.multiplicar,
            subempalmeId: medidorDetalle?.subEmpalmeId ?? 0,
            subempalmeCodigo: medidorDetalle?.subempalmeCodigo ?? '',
          });
        }, 100);
      } else {
        form.reset({
          marcaCodigo: '',
          tipoId: 0,
          modelo: '',
          serie: '',
          fechaInicio: '',
          digitos: 0,
          multiplicar: 1,
          subempalmeId: 0,
          subempalmeCodigo: '',
        });
      }
    }
  }, [isOpen, medidor, mode, form, marcas, tipos, medidorDetalle]);

  const handleFormSubmit = (data: MedidorFormData) => {
    // Validaciones de campos requeridos
    if (!data.marcaCodigo) {
      alert('La marca es obligatoria');
      return;
    }

    if (!data.tipoId) {
      alert('El tipo es obligatorio');
      return;
    }

    if (!data.modelo) {
      alert('El modelo es obligatorio');
      return;
    }

    if (!data.serie) {
      alert('El número de serie es obligatorio');
      return;
    }

    if (!data.fechaInicio) {
      alert('La fecha de inicio es obligatoria');
      return;
    }

    if (!data.digitos || data.digitos <= 0) {
      alert('Los dígitos deben ser mayor a 0');
      return;
    }

    if (!data.multiplicar || data.multiplicar <= 0) {
      alert('El multiplicador debe ser mayor a 0');
      return;
    }

    if (mode === 'edit' && medidor) {
      // Intentar diferentes campos para encontrar la marca
      const marcaEncontrada = marcas.find(
        m => m.codigo === data.marcaCodigo || m.nombre === data.marcaCodigo
      );
      // El backend espera el código de la marca, no el ID
      const marcaId = marcaEncontrada?.codigo ?? data.marcaCodigo;
      console.log('Debug marcaId:', {
        marcaCodigo: data.marcaCodigo,
        marcaEncontrada: marcaEncontrada,
        marcaIdEnviado: marcaId,
        codigoMarca: marcaEncontrada?.codigo,
      });

      // Debug adicional para ver la estructura de las marcas
      console.log('Primeras 3 marcas del array:', marcas.slice(0, 3));
      console.log('Buscando marca con codigo:', data.marcaCodigo);
      console.log(
        'Todas las marcas que contienen "E246":',
        marcas.filter(
          m => m.codigo?.includes('E246') || m.nombre?.includes('E246')
        )
      );
      const estadoId = getEstadoIdFromString(medidor.estado);

      // Convertir fecha de yyyy-MM-dd a dd-MM-yyyy
      const fechaInicio = data.fechaInicio
        ? new Date(data.fechaInicio + 'T00:00:00')
            .toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
            .split('/')
            .join('-')
        : '';

      const payload = {
        ...data,
        marcaId,
        estadoId,
        fechaInicio,
        primeraLectura: '',
        fechaPrimeraLectura: '',
      };
      delete (payload as any).marcaCodigo;

      // Intentar con payload simplificado primero
      const submitData = {
        codigoMedidor: medidor.codigo,
        marcaId: String(payload.marcaId),
        modelo: data.modelo,
        serie: data.serie,
        estadoId: payload.estadoId,
        fechaInicio: payload.fechaInicio,
        digitos: data.digitos,
        multiplicar: data.multiplicar,
        tipoId: data.tipoId,
        subempalmeCodigo: data.subempalmeCodigo || '',
        primeraLectura: payload.primeraLectura,
        fechaPrimeraLectura: payload.fechaPrimeraLectura,
      };

      // El subempalmeCodigo se maneja por separado con el endpoint modificar-subempalme
      // No lo incluimos en el payload principal
      delete (submitData as any).subempalmeCodigo;
      console.log(
        'ℹ️ SubempalmeCodigo removido del payload principal - se maneja por separado'
      );

      // Asegurar que los campos numéricos sean realmente números
      submitData.codigoMedidor = Number(submitData.codigoMedidor);
      submitData.estadoId = Number(submitData.estadoId);
      submitData.digitos = Number(submitData.digitos);
      submitData.multiplicar = Number(submitData.multiplicar);
      submitData.tipoId = Number(submitData.tipoId);

      // Probar con valores por defecto para campos vacíos
      if (
        !submitData.primeraLectura ||
        submitData.primeraLectura.trim() === ''
      ) {
        submitData.primeraLectura = '0';
        console.log('⚠️ PrimeraLectura vacía - enviando "0"');
      }

      if (
        !submitData.fechaPrimeraLectura ||
        submitData.fechaPrimeraLectura.trim() === ''
      ) {
        // Formato requerido: dd-MM-yyyy HH:mm
        const fechaActual = new Date();
        const hora = fechaActual.getHours().toString().padStart(2, '0');
        const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
        submitData.fechaPrimeraLectura = `${submitData.fechaInicio} ${hora}:${minutos}`;
        console.log(
          '⚠️ FechaPrimeraLectura vacía - usando fechaInicio con hora actual'
        );
      } else {
        // Si ya tiene fecha, asegurar que tenga el formato correcto con hora
        if (!submitData.fechaPrimeraLectura.includes(':')) {
          submitData.fechaPrimeraLectura = `${submitData.fechaPrimeraLectura} 00:00`;
          console.log('⚠️ FechaPrimeraLectura sin hora - agregando 00:00');
        }
      }

      console.log('⚠️ Campos numéricos convertidos a Number()');

      // Opción para probar sin subempalmeCodigo (descomentar si es necesario)
      // console.log('⚠️ PRUEBA: Enviando sin subempalmeCodigo');
      // delete (submitData as any).subempalmeCodigo;

      // Console.log para debug
      console.log('=== DATOS ENVIADOS AL SERVIDOR ===');
      console.log('Modo:', mode);
      console.log('Endpoint: PUT /medidor/modificar');
      console.log('Payload esperado por el backend:', {
        codigoMedidor: 'number',
        marcaId: 'string',
        modelo: 'string',
        serie: 'string',
        estadoId: 'number',
        fechaInicio: 'string',
        digitos: 'number',
        multiplicar: 'number',
        tipoId: 'number',
        subempalmeCodigo: 'string',
        primeraLectura: 'string',
        fechaPrimeraLectura: 'string',
      });
      console.log('Datos originales del formulario:', data);
      console.log('Subempalme Código que se enviará:', data.subempalmeCodigo);

      // Debug detallado de cada campo
      console.log('=== DEBUG DETALLADO DE CAMPOS ===');
      console.log(
        'codigoMedidor:',
        typeof submitData.codigoMedidor,
        submitData.codigoMedidor
      );
      console.log('marcaId:', typeof submitData.marcaId, submitData.marcaId);
      console.log('modelo:', typeof submitData.modelo, submitData.modelo);
      console.log('serie:', typeof submitData.serie, submitData.serie);
      console.log('estadoId:', typeof submitData.estadoId, submitData.estadoId);
      console.log(
        'fechaInicio:',
        typeof submitData.fechaInicio,
        submitData.fechaInicio
      );
      console.log('digitos:', typeof submitData.digitos, submitData.digitos);
      console.log(
        'multiplicar:',
        typeof submitData.multiplicar,
        submitData.multiplicar
      );
      console.log('tipoId:', typeof submitData.tipoId, submitData.tipoId);
      console.log(
        'subempalmeCodigo:',
        typeof submitData.subempalmeCodigo,
        submitData.subempalmeCodigo
      );
      console.log(
        'primeraLectura:',
        typeof submitData.primeraLectura,
        submitData.primeraLectura
      );
      console.log(
        'fechaPrimeraLectura:',
        typeof submitData.fechaPrimeraLectura,
        submitData.fechaPrimeraLectura
      );
      console.log('================================================');

      console.log(
        'JSON transformado enviado:',
        JSON.stringify(submitData, null, 2)
      );
      console.log('================================================');

      onSubmit(submitData, 'edit');
    } else {
      // Intentar diferentes campos para encontrar la marca
      const marcaEncontrada = marcas.find(
        m => m.codigo === data.marcaCodigo || m.nombre === data.marcaCodigo
      );
      // El backend espera el código de la marca, no el ID
      const marcaId = marcaEncontrada?.codigo ?? data.marcaCodigo;
      console.log('Debug marcaId (crear):', {
        marcaCodigo: data.marcaCodigo,
        marcaEncontrada: marcaEncontrada,
        marcaIdEnviado: marcaId,
        codigoMarca: marcaEncontrada?.codigo,
      });

      // Debug adicional para ver la estructura de las marcas
      console.log('Primeras 3 marcas del array:', marcas.slice(0, 3));
      console.log('Buscando marca con codigo:', data.marcaCodigo);
      console.log(
        'Todas las marcas que contienen "E246":',
        marcas.filter(
          m => m.codigo?.includes('E246') || m.nombre?.includes('E246')
        )
      );

      // Convertir fecha de yyyy-MM-dd a dd-MM-yyyy
      const fechaInicio = data.fechaInicio
        ? new Date(data.fechaInicio + 'T00:00:00')
            .toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
            .split('/')
            .join('-')
        : '';

      const submitData = {
        marcaId: String(marcaId),
        tipoId: data.tipoId,
        modelo: data.modelo,
        serie: data.serie,
        estadoId: data.estadoId,
        fechaInicio: fechaInicio,
        digitos: data.digitos,
        multiplicar: data.multiplicar,
        primeraLectura: data.primeraLectura || '',
        fechaPrimeraLectura: data.fechaPrimeraLectura || '',
        horaPrimeraLectura: data.horaPrimeraLectura || '',
      };
      delete (submitData as any).marcaCodigo;

      const submitDataFinal = submitData as unknown as CrearMedidorProps;

      // Console.log para debug
      console.log('=== DATOS ENVIADOS AL SERVIDOR ===');
      console.log('Modo:', mode);
      console.log(
        'Endpoint:',
        mode === 'add' ? 'POST /medidor/crear' : 'PUT /medidor/modificar'
      );
      console.log('Datos originales del formulario:', data);
      console.log('Subempalme Código que se enviará:', data.subempalmeCodigo);

      // Debug detallado de cada campo
      console.log('=== DEBUG DETALLADO DE CAMPOS ===');
      console.log(
        'marcaId:',
        typeof submitDataFinal.marcaId,
        submitDataFinal.marcaId
      );
      console.log(
        'modelo:',
        typeof submitDataFinal.modelo,
        submitDataFinal.modelo
      );
      console.log(
        'serie:',
        typeof submitDataFinal.serie,
        submitDataFinal.serie
      );
      console.log(
        'estadoId:',
        typeof submitDataFinal.estadoId,
        submitDataFinal.estadoId
      );
      console.log(
        'fechaInicio:',
        typeof submitDataFinal.fechaInicio,
        submitDataFinal.fechaInicio
      );
      console.log(
        'digitos:',
        typeof submitDataFinal.digitos,
        submitDataFinal.digitos
      );
      console.log(
        'multiplicar:',
        typeof submitDataFinal.multiplicar,
        submitDataFinal.multiplicar
      );
      console.log(
        'tipoId:',
        typeof submitDataFinal.tipoId,
        submitDataFinal.tipoId
      );

      console.log(
        'primeraLectura:',
        typeof submitDataFinal.primeraLectura,
        submitDataFinal.primeraLectura
      );
      console.log(
        'fechaPrimeraLectura:',
        typeof submitDataFinal.fechaPrimeraLectura,
        submitDataFinal.fechaPrimeraLectura
      );
      console.log('================================================');

      console.log(
        'JSON transformado enviado:',
        JSON.stringify(submitDataFinal, null, 2)
      );
      console.log('================================================');

      onSubmit(submitDataFinal, 'add');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='space-y-3'>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg'>
                <Gauge className='h-6 w-6 text-sky-600 dark:text-sky-400' />
              </div>
              {mode === 'add' ? 'Crear Nuevo Medidor' : 'Editar Medidor'}
            </DialogTitle>
            <DialogDescription className='text-base text-muted-foreground'>
              {mode === 'add'
                ? 'Complete la información para registrar un nuevo medidor.'
                : 'Modifique la información del medidor.'}
            </DialogDescription>

            {/* Información adicional para edición */}
            {mode === 'edit' && medidor && (
              <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
                <div className='flex items-center gap-2 mb-2'>
                  <Gauge className='h-4 w-4 text-blue-600' />
                  <span className='font-medium text-blue-900 dark:text-blue-100'>
                    Información del Medidor
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-blue-700 dark:text-blue-300'>
                      Código:
                    </span>
                    <span className='ml-2 font-mono text-blue-900 dark:text-blue-100'>
                      {medidor.codigo}
                    </span>
                  </div>
                  <div>
                    <span className='text-blue-700 dark:text-blue-300'>
                      Ubicación:
                    </span>
                    <span className='ml-2 text-blue-900 dark:text-blue-100'>
                      {medidor.ubicacion}
                    </span>
                  </div>
                  <div>
                    <span className='text-blue-700 dark:text-blue-300'>
                      Estado:
                    </span>
                    <span className='ml-2 text-blue-900 dark:text-blue-100'>
                      {medidor.estado}
                    </span>
                  </div>
                  <div>
                    <span className='text-blue-700 dark:text-blue-300'>
                      Lecturas:
                    </span>
                    <span className='ml-2 text-blue-900 dark:text-blue-100'>
                      {isLoadingDetalle ? 'Cargando...' : cantidadLecturas}
                    </span>
                  </div>
                  {medidorDetalle && (
                    <>
                      <div>
                        <span className='text-blue-700 dark:text-blue-300'>
                          Subempalme ID:
                        </span>
                        <span className='ml-2 font-mono text-blue-900 dark:text-blue-100'>
                          {medidorDetalle.subEmpalmeId || 'No asignado'}
                        </span>
                      </div>
                      <div>
                        <span className='text-blue-700 dark:text-blue-300'>
                          Código Subempalme:
                        </span>
                        <span className='ml-2 font-mono text-blue-900 dark:text-blue-100'>
                          {medidorDetalle.subempalmeCodigo || 'No asignado'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className='space-y-8 pt-4'
            >
              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <Gauge className='h-5 w-5 text-sky-600' />
                  <h3 className='text-lg font-medium'>Detalles del Medidor</h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='serie'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Hash className='h-4 w-4' />
                          N° Serie
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Número de serie'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='modelo'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Type className='h-4 w-4' />
                          Modelo
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Modelo del medidor'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name='marcaCodigo'
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <Tag className='h-4 w-4' />
                            Marca
                          </FormLabel>
                          <Select
                            {...field}
                            instanceId='marca-select'
                            options={marcas.map(m => ({
                              value: m.codigo,
                              label: m.nombre,
                            }))}
                            value={marcas
                              .map(m => ({ value: m.codigo, label: m.nombre }))
                              .find(m => m.value === field.value)}
                            onChange={option =>
                              field.onChange(
                                option ? (option as any).value : ''
                              )
                            }
                            placeholder='Seleccione una marca'
                            styles={selectStyles}
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name='tipoId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Type className='h-4 w-4' />
                          Tipo de Medidor
                        </FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            value={
                              tipos
                                .map(t => ({ value: t.id, label: t.nombre }))
                                .find(t => t.value === field.value) || null
                            }
                            onChange={(option: any) => {
                              field.onChange(option?.value || 0);
                            }}
                            options={tipos.map(t => ({
                              value: t.id,
                              label: t.nombre,
                            }))}
                            placeholder='Selecciona el tipo'
                            isClearable={false}
                            isSearchable={false}
                            styles={selectStyles}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='estadoId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Power className='h-4 w-4' />
                          Estado
                        </FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            value={
                              [
                                { value: 1, label: 'Activo' },
                                { value: 2, label: 'En reparación' },
                                { value: 3, label: 'En Bodega' },
                                { value: 4, label: 'Inactivo' },
                              ].find(t => t.value === field.value) || null
                            }
                            onChange={(option: any) => {
                              field.onChange(option?.value || 1);
                            }}
                            options={[
                              { value: 1, label: 'Activo' },
                              { value: 2, label: 'En reparación' },
                              { value: 3, label: 'En Bodega' },
                              { value: 4, label: 'Inactivo' },
                            ]}
                            placeholder='Selecciona el estado'
                            isClearable={false}
                            isSearchable={false}
                            styles={selectStyles}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <Power className='h-5 w-5 text-green-600' />
                  <h3 className='text-lg font-medium'>Configuración</h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='digitos'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Hash className='h-4 w-4' />
                          Dígitos
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Cantidad de dígitos'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='multiplicar'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Power className='h-4 w-4' />
                          Multiplicador
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Factor multiplicador'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='fechaInicio'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4' />
                          Fecha de Inicio
                        </FormLabel>
                        <FormControl>
                          <Input type='date' {...field} className='h-11' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campos de primera lectura - solo visibles cuando el estado es "Activo" */}
                  {isEstadoActivo(form.watch('estadoId')) && (
                    <>
                      <FormField
                        control={form.control}
                        name='primeraLectura'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Power className='h-4 w-4' />
                              Primera Lectura
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Valor de la primera lectura'
                                {...field}
                                className='h-11'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='fechaPrimeraLectura'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4' />
                              Fecha de Primera Lectura
                            </FormLabel>
                            <FormControl>
                              <Input type='date' {...field} className='h-11' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='horaPrimeraLectura'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Clock className='h-4 w-4' />
                              Hora de Primera Lectura
                            </FormLabel>
                            <FormControl>
                              <Input type='time' {...field} className='h-11' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Campos de subempalme solo para edición */}
                  {mode === 'edit' && (
                    <>
                      <FormField
                        control={form.control}
                        name='subempalmeId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Hash className='h-4 w-4' />
                              Subempalme ID (Solo para selección)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='ID del subempalme'
                                {...field}
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                                className='h-11'
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='subempalmeCodigo'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center justify-between'>
                              <span className='flex items-center gap-2'>
                                <Tag className='h-4 w-4' />
                                Código Subempalme
                              </span>
                              <div className='flex gap-1'>
                                <Button
                                  type='button'
                                  size='sm'
                                  variant='outline'
                                  onClick={() => {
                                    cargarSubempalmes();
                                    setModalSubempalmes(true);
                                  }}
                                  className='h-6 gap-1 text-xs'
                                >
                                  <Search className='h-3 w-3' />
                                  Buscar
                                </Button>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Código del subempalme'
                                {...field}
                                className='h-11'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

              <DialogFooter className='pt-6 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  className='h-11 px-6'
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  className='h-11 px-6 flex items-center gap-2'
                  disabled={isLoading}
                >
                  <CheckCircle2 className='h-4 w-4' />
                  {isLoading
                    ? 'Guardando...'
                    : mode === 'add'
                      ? 'Crear'
                      : 'Actualizar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Subempalmes */}
      <Dialog open={modalSubempalmes} onOpenChange={setModalSubempalmes}>
        <DialogContent className='min-w-6xl max-h-[80vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                <Gauge className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  Seleccionar Subempalme
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el subempalme que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Barra de búsqueda */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por código, ubicación, empalme o nicho...'
                value={busquedaSubempalme}
                onChange={e => setBusquedaSubempalme(e.target.value)}
                className='h-11 pl-10'
              />
            </div>

            {/* Tabla de subempalmes */}
            <div className='border rounded-lg overflow-hidden'>
              <ScrollArea className='h-[50vh]'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Contrato ID</TableHead>
                      <TableHead>Empalme</TableHead>
                      <TableHead>Nicho</TableHead>
                      <TableHead className='text-center'>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingSubempalmes && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <div className='h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent' />
                            <p>Cargando subempalmes...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoadingSubempalmes &&
                      subempalmesFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className='text-center py-8 text-muted-foreground'
                          >
                            <div className='flex flex-col items-center gap-2'>
                              <Search className='h-8 w-8 opacity-50' />
                              <p>
                                No se encontraron subempalmes con los criterios
                                de búsqueda.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    {subempalmesFiltrados.map(subempalme => (
                      <TableRow
                        key={subempalme.id}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {subempalme.id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary' className='font-mono'>
                            {subempalme.codigo}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <Gauge className='h-4 w-4 text-muted-foreground' />
                            {subempalme.ubicacion}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {subempalme.contratoId}
                          </Badge>
                        </TableCell>
                        <TableCell>{subempalme.descripcionEmpalme}</TableCell>
                        <TableCell>{subempalme.descripcionNicho}</TableCell>
                        <TableCell className='text-center'>
                          <Button
                            size='sm'
                            onClick={() => handleSelectSubempalme(subempalme)}
                            className='bg-purple-600 hover:bg-purple-700 text-white'
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
