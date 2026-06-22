import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
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
import api from '~/lib/api';
import { administracionService } from '~/services/administracionService';
import type { Estado, Marca, MedidoresRow, Tipo } from '~/types/administracion';

export function meta() {
  return [
    { title: 'Agualova | Medidor - Editar' },
    { name: 'description', content: 'Medidor - Editar' }
  ];
}

export async function clientLoader({ params }: { params: { codigo: string } }) {
  try {
    const result = await administracionService.getMedidoresByCodigo({
      codigo: params.codigo
    });

    if (result.error || !result.data || !result.data.medidor) {
      return {
        medidor: null,
        marcas: [] as Marca[],
        tipos: [] as Tipo[],
        estados: [] as Estado[],
        cantidadLecturas: 0
      };
    }

    const lecturasResponse = await api.get(
      `/medidor/lecturas/${params.codigo}`
    );
    const lecturasData = lecturasResponse.data as { cantidadLecturas?: string };

    return {
      medidor: result.data.medidor,
      marcas: result.data.marca,
      tipos: result.data.tipoMedidor,
      estados: result.data.estados,
      cantidadLecturas: Number(lecturasData?.cantidadLecturas) || 0
    };
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return {
      medidor: null,
      marcas: [] as Marca[],
      tipos: [] as Tipo[],
      estados: [] as Estado[],
      cantidadLecturas: 0
    };
  }
}

interface LoaderData {
  medidor: MedidoresRow | null;
  marcas: Marca[];
  tipos: Tipo[];
  estados: Estado[];
  cantidadLecturas: number;
}

export default function EditarMedidor({
  loaderData,
  params
}: Readonly<{ loaderData: LoaderData; params: { codigo: string } }>) {
  const navigate = useNavigate();
  const { medidor, marcas, tipos, estados, cantidadLecturas } = loaderData;
  const codigoMedidor = params.codigo;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];
  const [modalExito, setModalExito] = useState(false);
  const [_medidorModificado, setMedidorModificado] = useState<{
    id: string | number | null;
    fecha: string;
  } | null>(null);
  const [isSubmitting] = useState(false);

  const handleSuccess = (medidorId: string | number) => {
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setMedidorModificado({ id: medidorId, fecha: fechaActual });
    setModalExito(true);
  };

  const handleCancel = () => {
    navigate('/dashboard/administracion/medidores');
  };

  if (!medidor) {
    return (
      <div>
        <BreadcrumbSetter items={pageBreadcrumbs} />
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-500">
            No se pudieron cargar los datos del medidor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSetter items={pageBreadcrumbs} />

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <ModernHeader
            title="Editar Medidor"
            description={`Editando medidor ID: ${medidor.idMedidor}`}
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
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

      <div className="container mx-auto px-4 py-6">
        <EditarMedidorComponent
          medidor={medidor}
          marcas={marcas}
          tipos={tipos}
          estados={estados}
          cantidadLecturas={cantidadLecturas}
          codigoMedidor={codigoMedidor}
          onSuccess={handleSuccess}
        />
      </div>

      <Dialog open={modalExito} onOpenChange={setModalExito}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] lg:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold text-green-900 dark:text-green-100">
                  ¡Medidor Modificado Exitosamente!
                </DialogTitle>
                <DialogDescription className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Los cambios del medidor han sido guardados correctamente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setModalExito(false);
                  setMedidorModificado(null);
                }}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setModalExito(false);
                  setMedidorModificado(null);
                  navigate('/dashboard/administracion/medidores');
                }}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Medidores
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
