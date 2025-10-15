import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useAdministracion } from '~/hooks/use-administracion';
import type { Usuarios } from '~/types/administracion';

import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { UserFormModal } from './user-form-modal';

export default function UsuariosComponent({
  usuarios: initialUsuarios
}: Readonly<{
  usuarios: Usuarios[];
}>) {
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
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto p-3'>
          <div className='flex items-center justify-center py-20'>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Usuarios'
          description='Gestiona los usuarios del sistema'
          actions={
            <div>
              <Button
                onClick={handleAddUser}
                className='bg-sky-600 hover:bg-sky-700'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Usuario
              </Button>
            </div>
          }
        />

        {/* Table */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditUser,
                onDelete: handleDeleteUser
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
    </div>
  );
}
