import { LayoutList, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { useAdministracion } from '~/hooks/use-administracion';
import type { UsuarioModalState, Usuarios } from '~/types/administracion';
import {
  createInitialModalState,
  extractErrorMessage,
  getSuccessMessage,
  isValidUserForOperation
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

  useEffect(() => {
    setUsuarios(initialUsuarios);
  }, [initialUsuarios]);

  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setModalsState(prev => ({
      ...prev,
      userForm: { isOpen: true, mode: 'add' }
    }));
  }, []);

  const handleEditUser = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState(prev => ({
      ...prev,
      userForm: { isOpen: true, mode: 'edit' }
    }));
  }, []);

  const handleDeleteUser = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState(prev => ({
      ...prev,
      deleteDialog: { isOpen: true }
    }));
  }, []);

  const handleViewPermissions = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState(prev => ({
      ...prev,
      permissions: { isOpen: true }
    }));
  }, []);

  const handleManageRoles = useCallback((user: Usuarios) => {
    setSelectedUser(user);
    setModalsState(prev => ({
      ...prev,
      roles: { isOpen: true }
    }));
  }, []);

  const handleUserSuccess = useCallback(() => {
    const successMessage = getSuccessMessage(modalsState.userForm.mode);

    revalidator.revalidate();
    setModalsState(prev => ({
      ...prev,
      userForm: { isOpen: false, mode: 'add' }
    }));
    toast.success(successMessage);
  }, [modalsState.userForm.mode, revalidator]);

  const handleConfirmDelete = useCallback(async () => {
    // Early return: validar que exista usuario seleccionado
    if (!isValidUserForOperation(selectedUser)) {
      setModalsState(prev => ({
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
      setModalsState(prev => ({
        ...prev,
        deleteDialog: { isOpen: false }
      }));
    }
  }, [selectedUser, deleteUsuario, revalidator]);

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Usuarios"
            description="Gestiona los usuarios del sistema"
            actions={
              <Button onClick={handleAddUser} variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Button>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Usuarios
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable
                  columns={columns({
                    onEdit: handleEditUser,
                    onDelete: handleDeleteUser,
                    onViewPermissions: handleViewPermissions,
                    onManageRoles: handleManageRoles
                  })}
                  data={usuarios}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modales y diálogos */}
        <UserFormModal
          isOpen={modalsState.userForm.isOpen}
          onClose={() =>
            setModalsState(prev => ({
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
            setModalsState(prev => ({
              ...prev,
              permissions: { isOpen: false }
            }))
          }
          user={selectedUser}
        />
        <UserRolesModal
          isOpen={modalsState.roles.isOpen}
          onClose={() =>
            setModalsState(prev => ({
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
            setModalsState(prev => ({
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
