import { Plus } from 'lucide-react';
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

  const handleSubmitForm = async (
    data: CrearAcometidaProps | ActualizarAcometidaProps,
  ) => {
    try {
      if (modalMode === 'add') {
        await api.post('/crearAcometida', data as CrearAcometidaProps);
      } else {
        await api.put(
          `/modificarAcometida/${selectedAcometida?.acometidaId}`,
          data as ActualizarAcometidaProps,
        );
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
        <Button
          onClick={handleAddAcometida}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Acometida
        </Button>
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
      />
    </div>
  );
}
