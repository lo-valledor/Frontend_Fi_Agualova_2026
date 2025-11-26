import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useAdministracion } from '~/hooks/use-administracion';
import type { Usuarios } from '~/types/administracion';

import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { UserFormModal } from './user-form-modal';
import { UserPermissionsModal } from './user-permissions-modal';
import { UserRolesModal } from './user-roles-modal';
import { useRevalidator } from 'react-router';

export default function UsuariosComponent({
  usuarios: initialUsuarios
}: Readonly<{
  usuarios: Usuarios[];
}>) {
  const [usuarios, setUsuarios] = useState<Usuarios[]>(initialUsuarios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuarios | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const revalidator = useRevalidator();

  const { deleteUsuario } = useAdministracion();

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/administracion/usuarios';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  // Sincronizar estado local cuando los datos del loader cambian (después de revalidate)
  useEffect(() => {
    setUsuarios(initialUsuarios);
  }, [initialUsuarios]);

  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setModalMode('add');
    setIsModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewPermissions = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  }, []);

  const handleManageRoles = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setIsRolesModalOpen(true);
  }, []);

  const handleUserSuccess = useCallback(() => {
    revalidator.revalidate();
    setIsModalOpen(false);
    toast.success(
      modalMode === 'add'
        ? 'Usuario creado exitosamente'
        : 'Usuario actualizado exitosamente'
    );
  }, [modalMode, revalidator]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedUser) {
      try {
        await deleteUsuario(selectedUser.idUsuario);
        toast.success('Usuario eliminado exitosamente');
        revalidator.revalidate();
        setSelectedUser(null);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar el usuario';
        toast.error(errorMessage);
      }
    }
    setIsDeleteDialogOpen(false);
  }, [selectedUser, deleteUsuario, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Usuarios'
          description='Gestiona los usuarios del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddUser}
                variant='default'
                size='sm'
                disabled={!hasCreatePermission}
                title={
                  !hasCreatePermission
                    ? 'No tiene permisos para crear usuarios'
                    : ''
                }
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
                onDelete: handleDeleteUser,
                onViewPermissions: handleViewPermissions,
                onManageRoles: handleManageRoles,
                canEdit: hasEditPermission
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
        <UserPermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          user={selectedUser}
        />
        <UserRolesModal
          isOpen={isRolesModalOpen}
          onClose={() => setIsRolesModalOpen(false)}
          onSuccess={() => revalidator.revalidate()}
          user={selectedUser}
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
