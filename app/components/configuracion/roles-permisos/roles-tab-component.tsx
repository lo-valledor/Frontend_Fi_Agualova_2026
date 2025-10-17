import { Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { Roles } from '~/types/roles-permisos';

import { createRolesColumns } from './columns/roles-columns';

interface RolesTabComponentProps {
  roles: Roles[];
  onDataChange?: () => void;
}

interface RolFormData {
  nombre: string;
  descripcion: string;
  estado: boolean;
}

const RolesTabComponent: React.FC<RolesTabComponentProps> = ({
  roles,
  onDataChange
}) => {
  const [editingRol, setEditingRol] = useState<Roles | null>(null);
  const [deletingRol, setDeletingRol] = useState<Roles | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<RolFormData>({
    nombre: '',
    descripcion: '',
    estado: true
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      estado: true
    });
  };

  const handleEdit = (rol: Roles) => {
    setEditingRol(rol);
    setFormData({
      nombre: rol.nombreRol,
      descripcion: rol.descripcion || '',
      estado: rol.estadoRol
    });
  };

  const handleDelete = (rol: Roles) => {
    setDeletingRol(rol);
  };

  const handleViewPermissions = (rol: Roles) => {
    toast.info(`Ver permisos para: ${rol.nombreRol}`);
    // Implementar navegación al tab de permisos filtrado por rol
  };

  const handleCreateRol = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const result = await rolesPermisosService.crearRol({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined
      });

      if (result.error) {
        toast.error(`Error al crear rol: ${result.error}`);
      } else {
        toast.success('Rol creado exitosamente');
        setShowCreateDialog(false);
        resetForm();
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al crear el rol');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRol = async () => {
    if (!editingRol || !formData.nombre.trim()) {
      toast.error('Datos inválidos para actualizar el rol');
      return;
    }

    setIsLoading(true);
    try {
      const result = await rolesPermisosService.actualizarRol({
        id: editingRol.idRol,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined
      });

      if (result.error) {
        toast.error(`Error al actualizar rol: ${result.error}`);
      } else {
        toast.success('Rol actualizado exitosamente');
        setEditingRol(null);
        resetForm();
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al actualizar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRol) return;

    setIsLoading(true);
    try {
      const result = await rolesPermisosService.eliminarRol(deletingRol.idRol);

      if (result.error) {
        toast.error(`Error al eliminar rol: ${result.error}`);
      } else {
        toast.success('Rol eliminado exitosamente');
        setDeletingRol(null);
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al eliminar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  const rolesColumns = createRolesColumns(
    handleEdit,
    handleDelete,
    handleViewPermissions
  );

  return (
    <>
      <Card className='border-0 shadow-lg bg-background backdrop-blur-sm'>
        <CardHeader className='pb-3'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
            <CardTitle className='text-base sm:text-lg'>
              Gestión de Roles
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className='w-full sm:w-auto' variant='default'>
                  <Plus className='h-4 w-4 mr-2' />
                  Crear Nuevo Rol
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Rol</DialogTitle>
                  <DialogDescription>
                    Complete la información para crear un nuevo rol en el
                    sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='nombre'>Nombre del rol *</Label>
                    <Input
                      id='nombre'
                      value={formData.nombre}
                      onChange={e =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      placeholder='Ej: Administrador, Usuario, etc.'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='descripcion'>Descripción</Label>
                    <Textarea
                      id='descripcion'
                      value={formData.descripcion}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          descripcion: e.target.value
                        })
                      }
                      placeholder='Descripción del rol...'
                      rows={3}
                    />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='estado'
                      checked={formData.estado}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, estado: checked })
                      }
                    />
                    <Label htmlFor='estado'>Rol activo</Label>
                  </div>
                  <div className='flex gap-2 pt-4'>
                    <Button
                      onClick={handleCreateRol}
                      disabled={isLoading}
                      className='flex-1'
                    >
                      <Save className='h-4 w-4 mr-2' />
                      {isLoading ? 'Guardando...' : 'Crear Rol'}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setShowCreateDialog(false);
                        resetForm();
                      }}
                      disabled={isLoading}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className='relative p-0 sm:p-4'>
          <div className='overflow-x-auto'>
            <div className='min-w-full p-3 sm:p-0'>
              <DataTable columns={rolesColumns} data={roles} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog
        open={!!editingRol}
        onOpenChange={open => !open && setEditingRol(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifique la información del rol seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-nombre'>Nombre del rol *</Label>
              <Input
                id='edit-nombre'
                value={formData.nombre}
                onChange={e =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder='Ej: Administrador, Usuario, etc.'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-descripcion'>Descripción</Label>
              <Textarea
                id='edit-descripcion'
                value={formData.descripcion}
                onChange={e =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder='Descripción del rol...'
                rows={3}
              />
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='edit-estado'
                checked={formData.estado}
                onCheckedChange={checked =>
                  setFormData({ ...formData, estado: checked })
                }
              />
              <Label htmlFor='edit-estado'>Rol activo</Label>
            </div>
            <div className='flex gap-2 pt-4'>
              <Button
                onClick={handleUpdateRol}
                disabled={isLoading}
                className='flex-1'
              >
                <Save className='h-4 w-4 mr-2' />
                {isLoading ? 'Guardando...' : 'Actualizar'}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setEditingRol(null);
                  resetForm();
                }}
                disabled={isLoading}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog
        open={!!deletingRol}
        onOpenChange={open => !open && setDeletingRol(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el rol "
              {deletingRol?.nombreRol}" y todos los permisos asociados. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className='bg-red-600 hover:bg-red-700'
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RolesTabComponent;
