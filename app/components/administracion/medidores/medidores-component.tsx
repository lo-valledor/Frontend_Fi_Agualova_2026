import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useEffect, useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import api from '~/lib/api';
import type {
  ActualizarMedidorProps,
  CrearMedidorProps,
  GetMedidores,
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';

import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirm-dialog';
import { MedidorFormModal } from './medidor-form';

export default function MedidoresComponent({
  medidores: initialMedidores,
  marcas,
}: {
  medidores: GetMedidores[];
  marcas: Marca[];
}) {
  const [medidores, setMedidores] = useState<GetMedidores[]>(initialMedidores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedidor, setSelectedMedidor] = useState<GetMedidores | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Tipos de medidores hardcodeados como placeholder
  const [tipos] = useState([
    { id: 1, nombre: 'Monofásico' },
    { id: 2, nombre: 'Trifásico' },
  ]);

  useEffect(() => {
    setMedidores(initialMedidores);
  }, [initialMedidores]);

  const refetchMedidores = async () => {
    setIsFetching(true);
    try {
      const response = await api.get('buscarMedidor');
      const data = response.data as GetMedidores[];
      setMedidores(data);
    } catch (_error) {
      toast.error('Error al recargar los medidores.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = () => {
    setSelectedMedidor(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (medidor: GetMedidores) => {
    setSelectedMedidor(medidor);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit'
  ) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/MedidorCrear', data);
        toast.success('Medidor creado exitosamente');
      } else {
        await api.put(`/MedidorModificar`, data);
        toast.success('Medidor actualizado exitosamente');
      }
      await refetchMedidores();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el medidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedidor) return;
    setIsLoading(true);
    try {
      await api.delete(`/eliminarMedidor/${selectedMedidor.codigo}`);
      toast.success('Medidor eliminado exitosamente');
      await refetchMedidores();
    } catch (_error) {
      toast.error('Error al eliminar el medidor.');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedMedidor(null);
    }
  };

  const handleExportExcel = async () => {
    if (isExporting) return; // Prevenir múltiples clicks

    setIsExporting(true);
    try {
      toast.info('Generando archivo Excel...');

      const response = await api.get('exportar-medidores', {
        responseType: 'blob', // Esto es crucial para archivos binarios
        timeout: 30000, // 30 segundos timeout
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      // Verificar que la respuesta es válida
      if (!response.data || (response.data as Blob).size === 0) {
        throw new Error('El archivo exportado está vacío');
      }

      const blob = new Blob([response.data as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Crear nombre de archivo con timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `medidores_${timestamp}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none'; // Asegurar que no sea visible

      // Agregar al DOM, hacer click y remover
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Archivo exportado: ${fileName}`);
    } catch (error: any) {
      // Manejo más específico de errores
      if (error.code === 'ECONNABORTED') {
        toast.error('La exportación tardó demasiado. Intente nuevamente.');
      } else if (error.response?.status === 404) {
        toast.error('Endpoint de exportación no encontrado');
      } else if (error.response?.status === 500) {
        toast.error('Error interno del servidor al generar el archivo');
      } else if (error.message.includes('Network Error')) {
        toast.error('Error de conexión. Verifique su internet.');
      } else {
        toast.error('Error al exportar Excel. Intente nuevamente.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (isFetching && medidores.length === 0) {
    return (
      <div className='container mx-auto p-3 md:p-6'>
        <div className='flex items-center justify-center py-20'>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-3 md:p-6 space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
            Medidores
          </h1>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='default'
            onClick={handleExportExcel}
            disabled={isExporting}
            className='gap-1.5 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Download
              className={`h-3.5 w-3.5 ${isExporting ? 'animate-spin' : ''}`}
            />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
          <Button
            onClick={handleAdd}
            className='bg-sky-600 hover:bg-sky-700 text-white'
          >
            <Plus className='mr-2 h-4 w-4 text-white' />
            Agregar Medidor
          </Button>
        </div>
      </div>
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          {isFetching && (
            <div className='absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg z-10'>
              <LoadingSpinner />
            </div>
          )}
          <DataTable
            columns={columns({ onEdit: handleEdit })}
            data={medidores}
          />
        </CardContent>
      </Card>

      {isModalOpen && (
        <MedidorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          medidor={selectedMedidor}
          mode={modalMode}
          isLoading={isLoading}
          marcas={marcas}
          tipos={tipos}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          medidor={selectedMedidor}
        />
      )}
    </div>
  );
}
