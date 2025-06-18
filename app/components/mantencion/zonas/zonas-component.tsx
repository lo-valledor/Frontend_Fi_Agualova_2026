import React, { useState } from 'react';
import type { Zonas } from '~/types/mantencion';
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import { Button } from '~/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import ZonaFormModal from './zona-form-modal';
import api from '~/lib/api';
import { toast } from 'sonner';

export default function ZonasComponent({
  zonas: initialZonas,
}: {
  zonas: Zonas[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZona, setSelectedZona] = useState<Zonas | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [zonas, setZonas] = useState<Zonas[]>(initialZonas);

  const handleAddZona = () => {
    setSelectedZona(null);
    setModalMode('add');
    setIsModalOpen(true);
  };
  const handleEditZona = (zona: Zonas) => {
    setSelectedZona(zona);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  const handleDeleteZona = (zona: Zonas) => {
    setSelectedZona(zona);
    setIsDeleteDialogOpen(true);
  };

  const fetchZonas = async () => {
    try {
      const response = await api.get<Zonas[]>('/buscarZona');

      // Comprobar si la respuesta tiene el formato ApiResponse<T>
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        Array.isArray((response.data as any).data)
      ) {
        setZonas((response.data as { data: Zonas[] }).data);
      } else {
        // Asumir que la respuesta es T (Zonas[])
        setZonas(response.data as Zonas[]);
      }
      toast.success('Lista de zonas actualizada.');
    } catch (error) {
      console.error('Error al recargar zonas:', error);
      toast.error('Error al recargar la lista de zonas.');
    }
  };

  const handleZonaSuccess = () => {
    fetchZonas();
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Zonas
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddZona}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Zona
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Zonas</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las zonas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onEdit: handleEditZona,
              onDelete: handleDeleteZona,
            })}
            data={zonas}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <ZonaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleZonaSuccess}
        zona={selectedZona}
        mode={modalMode}
      />
    </div>
  );
}
