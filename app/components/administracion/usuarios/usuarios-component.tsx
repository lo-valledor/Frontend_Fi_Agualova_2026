/**
 * Componente principal para Gestión de Usuarios
 *
 * Funcionalidades principales:
 * - Visualización de usuarios del sistema en tabla
 * - Creación de nuevos usuarios con validación de contraseña
 * - Edición de usuarios existentes
 * - Eliminación de usuarios con confirmación
 * - Asignación de perfiles y departamentos
 * - Gestión de estado activo/inactivo
 * - Validación de contraseñas seguras (ver password-validation.ts)
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de usuarios del sistema
 * 2. Acciones disponibles:
 *    - Crear nuevo usuario (modal con validación de contraseña)
 *    - Editar usuario existente (modal)
 *    - Eliminar usuario (con confirmación)
 * 3. Sistema valida:
 *    - Contraseña segura (8+ caracteres, mayúsculas, minúsculas, números, especiales)
 *    - Coincidencia de contraseñas
 *    - Datos requeridos
 * 4. Recarga automática de lista después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas: nombre, usuario, perfil, departamento, estado, acciones
 * - Modal UserFormModal con dos modos (add/edit)
 * - Hook useAdministracion para operaciones CRUD
 * - DeleteConfirmationDialog para eliminación segura
 * - Validación de contraseñas con password-validation utils
 * - API endpoints:
 *   * POST /crear (creación de usuario)
 *   * PUT /actualizar/:id (actualización)
 *   * DELETE /eliminar/:id (eliminación)
 *   * GET /listar (revalidación)
 *
 * Perfiles disponibles:
 * - Administrador
 * - Lectura
 * - Supervisor Operativo
 * - Administrativo Facturación
 * - Supervisor Facturación
 * - Usuario Consulta
 * - Autorizador Límite Invierno
 *
 * Departamentos:
 * - Gerencia
 * - Tecnología
 * - Recaudación
 * - Seguridad
 * - RR.HH
 * - Enerlova
 *
 * @param {Object} props - Props del componente
 * @param {Usuarios[]} props.usuarios - Lista de usuarios del sistema
 *
 * @example
 * ```tsx
 * export default function UsuariosRoute({ loaderData }) {
 *   return <UsuariosComponent usuarios={loaderData.usuarios} />;
 * }
 * ```
 */
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useState } from 'react';

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
import { useRevalidator } from 'react-router';

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
    const revalidator = useRevalidator();
  

  const { fetchUsuarios, deleteUsuario, loadingState } = useAdministracion();

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
        console.error('Error al eliminar usuario:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar el usuario';
        toast.error(errorMessage);
      }
    }
    setIsDeleteDialogOpen(false);
  }, []);

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
                variant='default'
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
