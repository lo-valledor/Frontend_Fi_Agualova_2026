import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useAdministracion } from '~/hooks/use-administracion';
import type { Usuarios } from '~/types/administracion';

import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { UserFormModal } from './user-form-modal';

export default function UsuariosComponent({
  usuarios: initialUsuarios,
}: {
  usuarios: Usuarios[];
}) {
  const [usuarios, setUsuarios] = useState<Usuarios[]>(initialUsuarios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuarios | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const { fetchUsuarios, deleteUsuario, loadingState } = useAdministracion();

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: Usuarios) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: Usuarios) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSuccess = async () => {
    try {
      const updatedUsuarios = await fetchUsuarios();
      setUsuarios(updatedUsuarios as Usuarios[]);
    } catch (error) {
      console.error('Error al recargar usuarios:', error);
      toast.error('Error al recargar la lista de usuarios');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUsuario(selectedUser.idUsuario);
        toast.success('Usuario eliminado exitosamente');
        const updatedUsuarios = await fetchUsuarios();
        setUsuarios(updatedUsuarios as Usuarios[]);
        setSelectedUser(null);
      } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar el usuario';
        toast.error(errorMessage);
      }
    }
    setIsDeleteDialogOpen(false);
  };

  if (loadingState.fetchUsuarios.isLoading) {
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
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
              Usuarios
            </h1>
          </div>
        </div>
        <Button
          onClick={handleAddUser}
          className='bg-sky-600 hover:bg-sky-700 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          Agregar Usuario
        </Button>
      </div>

      {/* Table */}
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='relative'>
          <DataTable
            columns={columns({
              onEdit: handleEditUser,
              onDelete: handleDeleteUser,
            })}
            data={usuarios}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUserSuccess}
        user={selectedUser}
        mode={modalMode}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
      />
    </div>
  );
}
