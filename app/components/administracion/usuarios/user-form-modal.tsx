import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useAdministracion } from '~/hooks/use-administracion';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import type {
  Usuarios,
  CrearUsuarioProps,
  ActualizarUsuarioProps,
} from '~/types/administracion';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user?: Usuarios | null;
  mode: 'add' | 'edit';
}

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  mode,
}: UserFormModalProps) {
  const { createUsuario, updateUsuario, loadingState } = useAdministracion();

  const [formData, setFormData] = useState<CrearUsuarioProps>({
    nombreDeUsuario: '',
    contrasena: '',
    perfilId: 1,
    nombres: '',
    apellidos: '',
    departamento: 1,
    activo: true,
  });

  const [updateData, setUpdateData] = useState<ActualizarUsuarioProps>({
    nombreDeUsuario: '',
    contrasena: '',
    nombres: '',
    apellidos: '',
    departamento: 1,
    activo: true,
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setUpdateData({
        nombreDeUsuario: user.nombreDeUsuario,
        contrasena: '',
        nombres: user.nombres,
        apellidos: user.apellidos,
        departamento: user.departamento,
        activo: user.activo,
      });
      setFormData({
        nombreDeUsuario: user.nombreDeUsuario,
        contrasena: '',
        perfilId: user.perfilId,
        nombres: user.nombres,
        apellidos: user.apellidos,
        departamento: user.departamento,
        activo: user.activo,
      });
    } else {
      setFormData({
        nombreDeUsuario: '',
        contrasena: '',
        perfilId: 1,
        nombres: '',
        apellidos: '',
        departamento: 1,
        activo: true,
      });
      setUpdateData({
        nombreDeUsuario: '',
        contrasena: '',
        nombres: '',
        apellidos: '',
        departamento: 1,
        activo: true,
      });
    }
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'add') {
        // Validar que la contraseña esté presente para crear usuario
        if (!formData.contrasena.trim()) {
          toast.error('La contraseña es requerida para crear un usuario');
          return;
        }

        await createUsuario(formData);
        toast.success('Usuario creado exitosamente');
      } else if (mode === 'edit' && user) {
        // Para actualizar, si hay nueva contraseña, incluirla en el campo nuevaContrasena
        const updatePayload: ActualizarUsuarioProps = {
          ...updateData,
          nuevaContrasena: formData.contrasena.trim()
            ? formData.contrasena
            : undefined,
        };

        await updateUsuario(user.idUsuario, updatePayload);
        toast.success('Usuario actualizado exitosamente');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error al procesar usuario:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al procesar la solicitud';
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (
    field: keyof CrearUsuarioProps,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // También actualizar updateData para modo edición
    if (mode === 'edit' && field !== 'perfilId') {
      setUpdateData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const isLoading =
    loadingState.createUsuario.isLoading ||
    loadingState.updateUsuario.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-sky-900 dark:text-sky-100">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <User className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            {mode === 'add' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {mode === 'add'
              ? 'Complete toda la información requerida para crear un nuevo usuario en el sistema.'
              : 'Modifique los campos que desee actualizar. Los campos vacíos mantendrán su valor actual.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input
                id="nombres"
                value={formData.nombres}
                onChange={(e) => handleInputChange('nombres', e.target.value)}
                placeholder="Ingresa los nombres"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                value={formData.apellidos}
                onChange={(e) => handleInputChange('apellidos', e.target.value)}
                placeholder="Ingresa los apellidos"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreDeUsuario">Nombre de Usuario</Label>
            <Input
              id="nombreDeUsuario"
              value={formData.nombreDeUsuario}
              onChange={(e) =>
                handleInputChange('nombreDeUsuario', e.target.value)
              }
              placeholder="Ingresa el nombre de usuario"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">
              {mode === 'add' ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
            </Label>
            <Input
              id="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={(e) => handleInputChange('contrasena', e.target.value)}
              placeholder={
                mode === 'add'
                  ? 'Ingresa la contraseña'
                  : 'Dejar vacío para mantener la actual'
              }
              required={mode === 'add'}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departamento">Departamento</Label>
            <Select
              value={formData.departamento.toString()}
              onValueChange={(value) =>
                handleInputChange('departamento', Number.parseInt(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Recursos Humanos</SelectItem>
                <SelectItem value="2">Tecnología</SelectItem>
                <SelectItem value="3">Ventas</SelectItem>
                <SelectItem value="4">Marketing</SelectItem>
                <SelectItem value="5">Finanzas</SelectItem>
                <SelectItem value="6">Operaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mode === 'add' && (
              <div className="space-y-2">
                <Label htmlFor="perfilId">Perfil</Label>
                <Select
                  value={formData.perfilId.toString()}
                  onValueChange={(value) =>
                    handleInputChange('perfilId', Number.parseInt(value))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administrador</SelectItem>
                    <SelectItem value="2">Lectura</SelectItem>
                    <SelectItem value="3">Supervisor Operativo</SelectItem>
                    <SelectItem value="4">
                      Administrativo Facturación
                    </SelectItem>
                    <SelectItem value="7">Supervisor Facturación</SelectItem>
                    <SelectItem value="8">Usuario Consulta</SelectItem>
                    <SelectItem value="10">
                      Autorizador Límite Invierno
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="activo">Estado</Label>
              <Select
                value={formData.activo.toString()}
                onValueChange={(value) =>
                  handleInputChange('activo', value === 'true')
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700"
              disabled={isLoading}
            >
              {isLoading
                ? mode === 'add'
                  ? 'Creando...'
                  : 'Guardando...'
                : mode === 'add'
                  ? 'Crear Usuario'
                  : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
