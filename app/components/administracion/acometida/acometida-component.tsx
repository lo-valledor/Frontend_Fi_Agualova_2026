import { Download, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import type {
  Acometida,
  ComboSectores,
  ComboNichos,
  ComboEmpalmes,
  ContratosDisponibles,
  CrearAcometidaProps,
  ActualizarAcometidaProps,
} from '~/types/administracion';
import { columns } from './columns';
import { AcometidaForm } from './acometida-form';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import api from '~/lib/api';

interface AcometidaComponentProps {
  acometidas: Acometida[];
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  comboSectores: ComboSectores[];
  contratosDisponibles: ContratosDisponibles[];
}

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles,
}: AcometidaComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcometida, setSelectedAcometida] = useState<Acometida | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAcometidaId, setEditingAcometidaId] = useState<number | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);

  const revalidator = useRevalidator();

  const handleAddAcometida = () => {
    setSelectedAcometida(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditAcometida = async (acometida: Acometida) => {
    setEditingAcometidaId(acometida.acometidaId);
    setSelectedAcometida(acometida);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedAcometida(null);
    setModalMode('add');
    setEditingAcometidaId(null);
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Acometida creada exitosamente'
        : 'Acometida actualizada exitosamente',
    );
  };

  const handleExportExcel = async () => {
    if (isExporting) return; // Prevenir múltiples clicks

    setIsExporting(true);
    try {
      toast.info('Generando archivo Excel...');

      const response = await api.get('exportar-excel', {
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
      const fileName = `acometidas_${timestamp}.xlsx`;

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
      console.error('Error al exportar Excel:', error);

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

  const handleSubmitForm = async (
    data: CrearAcometidaProps | ActualizarAcometidaProps,
  ) => {
    try {
      if (modalMode === 'add') {
        await api.post('/crear-Nueva-Acometida', data as CrearAcometidaProps);
      } else {
        await api.put(`/modificar-Acometida-Existen`, {
          acometidaId: selectedAcometida?.acometidaId,
          ...data,
        });
      }
      handleSuccess();
    } catch (error) {
      console.error('Error al guardar acometida:', error);
      toast.error('Ha ocurrido un error al guardar la acometida');
    }
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Acometidas
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra las acometidas del sistema de manera eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download
              className={`h-3.5 w-3.5 ${isExporting ? 'animate-spin' : ''}`}
            />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
          <Button
            onClick={handleAddAcometida}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Acometida
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Acometidas</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las acometidas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onEdit: handleEditAcometida,
              editingAcometidaId,
            })}
            data={acometidas}
          />
        </CardContent>
      </Card>

      {/* Modal Form */}
      <AcometidaForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAcometidaId(null);
        }}
        onSubmit={handleSubmitForm}
        acometida={selectedAcometida}
        isLoading={false}
        comboEmpalmes={comboEmpalmes}
        comboNichos={comboNichos}
        contratosDisponibles={contratosDisponibles}
        comboSectores={comboSectores}
      />
    </div>
  );
}
