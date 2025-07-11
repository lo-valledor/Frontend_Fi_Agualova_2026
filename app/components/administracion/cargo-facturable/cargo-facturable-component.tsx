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
  ActualizarCargoFacturableProps,
  BuscarCargoFacturable,
  CrearCargoFacturableProps,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
} from '~/types/administracion';
import { columns } from './columns';
import CargoFacturableModalForm from './cargo-facturable-modal-form';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import api from '~/lib/api';

interface CargoFacturableComponentProps {
  cargos: BuscarCargoFacturable[];
  conceptos: GeCombosConceptos[];
  tarifas: GetCombosTarifas[];
  tiposMedidor: GetCombosTiposMedidor[];
}

export default function CargoFacturableComponent({
  cargos,
  conceptos,
  tarifas,
  tiposMedidor,
}: CargoFacturableComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<
    BuscarCargoFacturable | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingCargoId, setEditingCargoId] = useState<number | null>(null);

  const revalidator = useRevalidator();

  const handleAddCargo = () => {
    setSelectedCargo(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditCargo = async (cargo: BuscarCargoFacturable) => {
    setEditingCargoId(cargo.id);
    setSelectedCargo(cargo);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    data: CrearCargoFacturableProps | ActualizarCargoFacturableProps,
  ) => {
    console.log('Enviando datos:', data);
    try {
      if (modalMode === 'add') {
        await api.post('cargoFacturable/crearCargoFacturableNuevo', data);
      } else {
        await api.put('cargoFacturable/modificarCargoFacturable', data);
      }
      handleSuccess();
    } catch (error) {
      console.error('Error al guardar el cargo facturable:', error);
      toast.error('Error al guardar el cargo facturable.');
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedCargo(undefined);
    setModalMode('add');
    setEditingCargoId(null);
    revalidator.revalidate();
    toast.success(
      modalMode === 'add'
        ? 'Cargo facturable creado exitosamente'
        : 'Cargo facturable actualizado exitosamente',
    );
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Gestión de Cargos Facturables
            </h1>
          </div>
          <p className="text-muted-foreground">
            Administra los cargos facturables del sistema de manera eficiente
          </p>
        </div>
        <Button
          onClick={handleAddCargo}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Cargo Facturable
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cargos Facturables</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los cargos facturables registrados en el
            sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({
              onEdit: handleEditCargo,
              editingCargoId,
            })}
            data={cargos}
          />
        </CardContent>
      </Card>

      {/* Modal Form */}
      <CargoFacturableModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCargoId(null);
        }}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        cargo={selectedCargo}
        mode={modalMode}
        conceptos={conceptos}
        tarifas={tarifas}
        tiposMedidor={tiposMedidor}
      />
    </div>
  );
}
