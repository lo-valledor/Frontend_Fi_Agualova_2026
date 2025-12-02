import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';
import { useRevalidator } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useAdministracion } from '~/hooks/use-administracion';
import type { Usuarios, UsuarioModalState } from '~/types/administracion';
import {
  createInitialModalState,
  extractErrorMessage,
  getSuccessMessage,
  getUserPermissions,
  isValidUserForOperation,
  USUARIOS_ROUTE
} from '~/utils/administracion';

import { columns } from './columns';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { UserFormModal } from './user-form-modal';
import { UserPermissionsModal } from './user-permissions-modal';
import { UserRolesModal } from './user-roles-modal';

interface UsuariosComponentProps {
  readonly usuarios: Usuarios[];
}

export default function UsuariosComponent({
  usuarios: initialUsuarios
}: UsuariosComponentProps) {
  // Estado de datos
  const [usuarios, setUsuarios] = useState<Usuarios[]>(initialUsuarios);
  const [selectedUser, setSelectedUser] = useState<Usuarios | null>(null);

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState<UsuarioModalState>(
    createInitialModalState()
  );

  // Dependencias
  const revalidator = useRevalidator();
  const { deleteUsuario } = useAdministracion();
  const { canCreate, canEdit } = useAuth();

  // Permisos del usuario actual
  const permissions = getUserPermissions(canCreate, canEdit, USUARIOS_ROUTE);

  /**
   * Sincronizar usuarios cuando los datos del loader cambian
   * Mantiene el estado local en sincronía con el servidor
   */
  useEffect(() => {
    setUsuarios(initialUsuarios);
  }, [initialUsuarios]);

  /**
   * Abre el modal de formulario en modo agregar
   * Early return no necesario - operación simple
   */
  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setModalsState((prev) => ({
      ...prev,
      userForm: { isOpen: true, mode: 'add' }
    }));
  }, []);

  /**
   * Abre el modal de formulario en modo editar
   */
  const handleEditUser = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState((prev) => ({
      ...prev,
      userForm: { isOpen: true, mode: 'edit' }
    }));
  }, []);

  /**
   * Abre el diálogo de confirmación de eliminación
   */
  const handleDeleteUser = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState((prev) => ({
      ...prev,
      deleteDialog: { isOpen: true }
    }));
  }, []);

  /**
   * Abre el modal de permisos del usuario
   */
  const handleViewPermissions = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState((prev) => ({
      ...prev,
      permissions: { isOpen: true }
    }));
  }, []);

  /**
   * Abre el modal de gestión de roles
   */
  const handleManageRoles = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState((prev) => ({
      ...prev,
      roles: { isOpen: true }
    }));
  }, []);

  /**
   * Maneja el éxito de la creación/edición de usuario
   * Cierra el modal, recarga datos y muestra notificación
   */
  const handleUserSuccess = useCallback(() => {
    const successMessage = getSuccessMessage(modalsState.userForm.mode);

    revalidator.revalidate();
    setModalsState((prev) => ({
      ...prev,
      userForm: { isOpen: false, mode: 'add' }
    }));
    toast.success(successMessage);
  }, [modalsState.userForm.mode, revalidator]);

  /**
   * Maneja la eliminación de usuario
   * Con early return para validar existencia de usuario
   * y manejo centralizado de errores
   */
  const handleConfirmDelete = useCallback(async () => {
    // Early return: validar que exista usuario seleccionado
    if (!isValidUserForOperation(selectedUser)) {
      setModalsState((prev) => ({
        ...prev,
        deleteDialog: { isOpen: false }
      }));
      return;
    }

    try {
      await deleteUsuario(selectedUser.idUsuario);
      toast.success('Usuario eliminado exitosamente');
      revalidator.revalidate();
      setSelectedUser(null);
    } catch (error) {
      const errorInfo = extractErrorMessage(
        error,
        'Error al eliminar el usuario'
      );
      toast.error(errorInfo.message);
    } finally {
      // Cerrar diálogo sin importar el resultado
      setModalsState((prev) => ({
        ...prev,
        deleteDialog: { isOpen: false }
      }));
    }
  }, [selectedUser, deleteUsuario, revalidator]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header con acción de crear */}
        <ModernHeader
          title='Usuarios'
          description='Gestiona los usuarios del sistema'
          actions={
            <div className='flex gap-2'>
              <Button
                onClick={handleAddUser}
                variant='default'
                size='sm'
                disabled={!permissions.hasCreatePermission}
                title={
                  !permissions.hasCreatePermission
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

        {/* Tabla de usuarios */}
        <Card className='border border-border shadow-sm'>
          <CardContent className='relative'>
            <DataTable
              columns={columns({
                onEdit: handleEditUser,
                onDelete: handleDeleteUser,
                onViewPermissions: handleViewPermissions,
                onManageRoles: handleManageRoles,
                canEdit: permissions.hasEditPermission
              })}
              data={usuarios}
            />
          </CardContent>
        </Card>

        {/* Modales y diálogos */}
        <UserFormModal
          isOpen={modalsState.userForm.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              userForm: { isOpen: false, mode: 'add' }
            }))
          }
          onSuccess={handleUserSuccess}
          user={selectedUser}
          mode={modalsState.userForm.mode}
        />
        <UserPermissionsModal
          isOpen={modalsState.permissions.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              permissions: { isOpen: false }
            }))
          }
          user={selectedUser}
        />
        <UserRolesModal
          isOpen={modalsState.roles.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              roles: { isOpen: false }
            }))
          }
          onSuccess={() => revalidator.revalidate()}
          user={selectedUser}
        />
        <DeleteConfirmationDialog
          isOpen={modalsState.deleteDialog.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              deleteDialog: { isOpen: false }
            }))
          }
          onConfirm={handleConfirmDelete}
          user={selectedUser}
        />
      </div>
    </div>
  );
}
