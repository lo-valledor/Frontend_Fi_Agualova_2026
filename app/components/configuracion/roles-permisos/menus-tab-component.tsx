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
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { Menus } from '~/types/roles-permisos';

import { createMenusColumns } from './columns/menus-columns';

interface MenusTabComponentProps {
  menus: Menus[];
  onDataChange?: () => void;
}

interface MenuFormData {
  nombre: string;
  ruta: string;
  orden: number;
  icono: string;
  visible: boolean;
}

const MenusTabComponent: React.FC<MenusTabComponentProps> = ({
  menus,
  onDataChange
}) => {
  const [editingMenu, setEditingMenu] = useState<Menus | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menus | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<MenuFormData>({
    nombre: '',
    ruta: '',
    orden: 1,
    icono: '',
    visible: true
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      ruta: '',
      orden: 1,
      icono: '',
      visible: true
    });
  };

  const handleEdit = (menu: Menus) => {
    setEditingMenu(menu);
    setFormData({
      nombre: menu.nombreMenu,
      ruta: menu.ruta || '',
      orden: menu.orden || 1,
      icono: menu.icono || '',
      visible: menu.esVisible
    });
  };

  const handleDelete = (menu: Menus) => {
    setDeletingMenu(menu);
  };

  const handleCreateMenu = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre del menú es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const result = await rolesPermisosService.crearMenu({
        nombre: formData.nombre.trim(),
        url: formData.ruta.trim() || undefined,
        orden: formData.orden,
        icono: formData.icono.trim() || undefined
      });

      if (result.error) {
        toast.error(`Error al crear menú: ${result.error}`);
      } else {
        toast.success('Menú creado exitosamente');
        setShowCreateDialog(false);
        resetForm();
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al crear el menú');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu || !formData.nombre.trim()) {
      toast.error('Datos inválidos para actualizar el menú');
      return;
    }

    setIsLoading(true);
    try {
      const result = await rolesPermisosService.actualizarMenu({
        idMenu: editingMenu.idMenu,
        nombre: formData.nombre.trim(),
        url: formData.ruta.trim() || undefined,
        orden: formData.orden,
        icono: formData.icono.trim() || undefined
      });

      if (result.error) {
        toast.error(`Error al actualizar menú: ${result.error}`);
      } else {
        toast.success('Menú actualizado exitosamente');
        setEditingMenu(null);
        resetForm();
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al actualizar el menú');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMenu) return;

    setIsLoading(true);
    try {
      const result = await rolesPermisosService.eliminarMenu(
        deletingMenu.idMenu
      );

      if (result.error) {
        toast.error(`Error al eliminar menú: ${result.error}`);
      } else {
        toast.success('Menú eliminado exitosamente');
        setDeletingMenu(null);
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al eliminar el menú');
    } finally {
      setIsLoading(false);
    }
  };

  const menusColumns = createMenusColumns(handleEdit, handleDelete);

  return (
    <>
      <Card className='border-0 shadow-lg bg-background backdrop-blur-sm'>
        <CardHeader className='pb-3'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
            <CardTitle className='text-base sm:text-lg'>
              Gestión de Menús
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className='w-full sm:w-auto bg-sky-600 hover:bg-sky-700'>
                  <Plus className='h-4 w-4 mr-2' />
                  Crear Nuevo Menú
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Menú</DialogTitle>
                  <DialogDescription>
                    Complete la información para crear un nuevo menú en el
                    sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='nombre'>Nombre del menú *</Label>
                    <Input
                      id='nombre'
                      value={formData.nombre}
                      onChange={e =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      placeholder='Ej: Dashboard, Reportes, etc.'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='ruta'>Ruta</Label>
                    <Input
                      id='ruta'
                      value={formData.ruta}
                      onChange={e =>
                        setFormData({ ...formData, ruta: e.target.value })
                      }
                      placeholder='/dashboard/ejemplo'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='orden'>Orden</Label>
                      <Input
                        id='orden'
                        type='number'
                        value={formData.orden}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            orden: parseInt(e.target.value) || 1
                          })
                        }
                        min={1}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='icono'>Icono</Label>
                      <Input
                        id='icono'
                        value={formData.icono}
                        onChange={e =>
                          setFormData({ ...formData, icono: e.target.value })
                        }
                        placeholder='menu-icon'
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='visible'
                      checked={formData.visible}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, visible: checked })
                      }
                    />
                    <Label htmlFor='visible'>Menú visible</Label>
                  </div>
                  <div className='flex gap-2 pt-4'>
                    <Button
                      onClick={handleCreateMenu}
                      disabled={isLoading}
                      className='flex-1'
                    >
                      <Save className='h-4 w-4 mr-2' />
                      {isLoading ? 'Guardando...' : 'Crear Menú'}
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
              <DataTable columns={menusColumns} data={menus} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog
        open={!!editingMenu}
        onOpenChange={open => !open && setEditingMenu(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Editar Menú</DialogTitle>
            <DialogDescription>
              Modifique la información del menú seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-nombre'>Nombre del menú *</Label>
              <Input
                id='edit-nombre'
                value={formData.nombre}
                onChange={e =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder='Ej: Dashboard, Reportes, etc.'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-ruta'>Ruta</Label>
              <Input
                id='edit-ruta'
                value={formData.ruta}
                onChange={e =>
                  setFormData({ ...formData, ruta: e.target.value })
                }
                placeholder='/dashboard/ejemplo'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-orden'>Orden</Label>
                <Input
                  id='edit-orden'
                  type='number'
                  value={formData.orden}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      orden: parseInt(e.target.value) || 1
                    })
                  }
                  min={1}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-icono'>Icono</Label>
                <Input
                  id='edit-icono'
                  value={formData.icono}
                  onChange={e =>
                    setFormData({ ...formData, icono: e.target.value })
                  }
                  placeholder='menu-icon'
                />
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='edit-visible'
                checked={formData.visible}
                onCheckedChange={checked =>
                  setFormData({ ...formData, visible: checked })
                }
              />
              <Label htmlFor='edit-visible'>Menú visible</Label>
            </div>
            <div className='flex gap-2 pt-4'>
              <Button
                onClick={handleUpdateMenu}
                disabled={isLoading}
                className='flex-1'
              >
                <Save className='h-4 w-4 mr-2' />
                {isLoading ? 'Guardando...' : 'Actualizar'}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setEditingMenu(null);
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
        open={!!deletingMenu}
        onOpenChange={open => !open && setDeletingMenu(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el menú "
              {deletingMenu?.nombreMenu}" y todos los permisos asociados. Esta
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

export default MenusTabComponent;
