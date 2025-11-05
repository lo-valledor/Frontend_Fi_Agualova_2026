import React, { useState } from 'react';
import EditarMedidorComponent from '~/components/administracion/medidores/form/editar-medidor-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { ArrowLeft, CheckCircle2, Copy, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { administracionService } from '~/services';
import api from '~/lib/api';

export function meta() {
  return [
    { title: 'Enerlova | Medidor - Editar' },
    { name: 'description', content: 'Medidor - Editar' }
  ];
}

export async function clientLoader({ params }: { params: { codigo: string } }) {
  try {
    // Cargar datos básicos del medidor
    const result = await administracionService.getMedidoresByCodigo({
      codigo: params.codigo
    });

    if (result.error || !result.data) {
      return {
        medidor: null,
        marca: [],
        tipoMedidor: [],
        medidorDetalle: null,
        cantidadLecturas: 0
      };
    }

    // Cargar datos adicionales en paralelo
    const [detalleResponse, lecturasResponse] = await Promise.allSettled([
      api.get(`/medidor/${params.codigo}`),
      api.get(`/medidor/lecturas/${params.codigo}`)
    ]);

    let medidorDetalle = null;
    let cantidadLecturas = 0;

    // Procesar respuesta de detalle del medidor
    if (detalleResponse.status === 'fulfilled' && detalleResponse.value.data) {
      medidorDetalle = detalleResponse.value.data;
    }

    // Procesar respuesta de lecturas
    if (
      lecturasResponse.status === 'fulfilled' &&
      lecturasResponse.value.data
    ) {
      const lecturasData = lecturasResponse.value.data as {
        cantidadLecturas: string;
      };
      cantidadLecturas = Number(lecturasData.cantidadLecturas) || 0;
    }

    return {
      medidor: result.data.medidor,
      marca: result.data.marca,
      tipoMedidor: result.data.tipoMedidor,
      medidorDetalle,
      cantidadLecturas
    };
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return {
      medidor: null,
      marca: [],
      tipoMedidor: [],
      medidorDetalle: null,
      cantidadLecturas: 0
    };
  }
}

interface LoaderData {
  medidor: any;
  marca: any[];
  tipoMedidor: any[];
  medidorDetalle: any;
  cantidadLecturas: number;
}

export default function EditarMedidor({
  loaderData,
  params
}: Readonly<{ loaderData: LoaderData; params: { codigo: string } }>) {
  const navigate = useNavigate();
  const { medidor, marca, tipoMedidor, medidorDetalle, cantidadLecturas } =
    loaderData;
  const codigoMedidor = params.codigo;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];

  // Estados para el modal de éxito
  const [modalExito, setModalExito] = useState(false);
  const [medidorModificado, setMedidorModificado] = useState<{
    id: string | number | null;
    fecha: string;
  } | null>(null);
  const [isSubmitting] = useState(false);

  // Función para copiar código al portapapeles
  const copiarCodigoMedidor = async (codigo: string | number) => {
    try {
      await navigator.clipboard.writeText(codigo.toString());
      toast.success('ID del medidor copiado al portapapeles', {
        duration: 2000
      });
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('Error al copiar. Intente seleccionar manualmente el ID.');
    }
  };

  const handleSuccess = (medidorId: string | number) => {
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setMedidorModificado({
      id: medidorId,
      fecha: fechaActual
    });
    setModalExito(true);
  };

  const handleCancel = () => {
    navigate('/dashboard/administracion/medidores');
  };

  // Si no hay datos, mostrar mensaje de error o loading
  if (!medidor) {
    return (
      <div>
        <BreadcrumbSetter items={pageBreadcrumbs} />
        <div className='flex items-center justify-center p-8'>
          <p className='text-gray-500'>
            No se pudieron cargar los datos del medidor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <BreadcrumbSetter items={pageBreadcrumbs} />

      {/* Header */}
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <ModernHeader
            title='Editar Medidor'
            description={`Editando medidor ID: ${medidor.mM_ID}`}
            actions={
              <>
                <Button
                  variant='ghost'
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className='gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Volver
                </Button>
                <Button
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-6'>
        <EditarMedidorComponent
          medidor={medidor}
          marca={marca}
          tipoMedidor={tipoMedidor}
          medidorDetalle={medidorDetalle}
          cantidadLecturas={cantidadLecturas}
          codigoMedidor={codigoMedidor}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>

      {/* Modal de Éxito - Medidor Modificado */}
      <Dialog open={modalExito} onOpenChange={setModalExito}>
        <DialogContent className='w-[95vw] sm:max-w-[500px] lg:max-w-[600px] max-h-[85vh] overflow-y-auto'>
          <DialogHeader className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-full'>
                <CheckCircle2 className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
              <div className='text-left'>
                <DialogTitle className='text-xl font-bold text-green-900 dark:text-green-100'>
                  ¡Medidor Modificado Exitosamente!
                </DialogTitle>
                <DialogDescription className='text-sm text-green-700 dark:text-green-300 mt-1'>
                  Los cambios del medidor han sido guardados correctamente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-6 pt-4'>
            {/* Alert de información del medidor */}
            <Alert className='border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'>
              <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
              <AlertTitle className='text-green-900 dark:text-green-100'>
                Información del Medidor
              </AlertTitle>
              <AlertDescription className='text-green-800 dark:text-green-200 space-y-2'>
                {medidorModificado?.id && (
                  <div className='flex items-center justify-betweenbg-background p-3 rounded-xl border border-green-200 dark:border-green-700'>
                    <div>
                      <p className='font-medium'>ID del Medidor:</p>
                      <p className='font-mono text-lg font-bold text-green-700 dark:text-green-300'>
                        {medidorModificado.id}
                      </p>
                    </div>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => copiarCodigoMedidor(medidorModificado.id!)}
                      className='gap-2 border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/50'
                    >
                      <Copy className='h-4 w-4' />
                      Copiar
                    </Button>
                  </div>
                )}
                <div className='text-sm'>
                  <p>
                    <strong>Fecha de modificación:</strong>{' '}
                    {medidorModificado?.fecha}
                  </p>
                  <p className='mt-2 text-green-700 dark:text-green-300'>
                    ✅ <strong>Éxito:</strong> Todos los cambios han sido
                    aplicados correctamente al medidor.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Botones de acción */}
            <div className='flex flex-col sm:flex-row gap-3 pt-4 border-t'>
              <Button
                variant='outline'
                onClick={() => {
                  setModalExito(false);
                  setMedidorModificado(null);
                }}
                className='flex-1 gap-2'
              >
                <X className='h-4 w-4' />
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setModalExito(false);
                  setMedidorModificado(null);
                  navigate('/dashboard/administracion/medidores');
                }}
                className='flex-1 gap-2 bg-green-600 hover:bg-green-700'
              >
                <ArrowLeft className='h-4 w-4' />
                Volver a Medidores
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
