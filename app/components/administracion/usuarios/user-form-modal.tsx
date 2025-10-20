import { AlertCircle, CheckCircle2, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';

import type React from 'react';
import { useEffect, useState } from 'react';

import { PasswordStrengthIndicator } from '~/components/ui/password-strength-indicator';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { useAdministracion } from '~/hooks/use-administracion';
import type {
  ActualizarUsuarioProps,
  CrearUsuarioProps,
  Usuarios
} from '~/types/administracion';
import { isPasswordSecure, passwordsMatch } from '~/utils/password-validation';

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
  mode
}: UserFormModalProps) {
  const { createUsuario, updateUsuario, loadingState } = useAdministracion();
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>('');

  const [formData, setFormData] = useState<CrearUsuarioProps>({
    nombreDeUsuario: '',
    contrasena: '',
    perfilId: 1,
    nombres: '',
    apellidos: '',
    departamento: 1,
    activo: true
  });

  const [updateData, setUpdateData] = useState<ActualizarUsuarioProps>({
    nombreDeUsuario: '',
    contrasena: '',
    nombres: '',
    apellidos: '',
    departamento: 1,
    activo: true
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setUpdateData({
        nombreDeUsuario: user.nombreDeUsuario,
        contrasena: '',
        nombres: user.nombres,
        apellidos: user.apellidos,
        departamento: user.departamento,
        activo: user.activo
      });
      setFormData({
        nombreDeUsuario: user.nombreDeUsuario,
        contrasena: '',
        perfilId: user.perfilId,
        nombres: user.nombres,
        apellidos: user.apellidos,
        departamento: user.departamento,
        activo: user.activo
      });
    } else {
      setFormData({
        nombreDeUsuario: '',
        contrasena: '',
        perfilId: 1,
        nombres: '',
        apellidos: '',
        departamento: 1,
        activo: true
      });
      setUpdateData({
        nombreDeUsuario: '',
        contrasena: '',
        nombres: '',
        apellidos: '',
        departamento: 1,
        activo: true
      });
    }
    // Resetear estados de contraseña
    setCurrentPassword('');
    setConfirmPassword('');
    setPasswordError('');
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    try {
      // Validaciones de contraseña
      if (mode === 'add') {
        // Modo crear: contraseña es obligatoria
        if (!formData.contrasena.trim()) {
          setPasswordError('La contraseña es requerida para crear un usuario');
          toast.error('La contraseña es requerida');
          return;
        }

        // Validar que la contraseña sea segura
        const passwordCheck = isPasswordSecure(formData.contrasena);
        if (!passwordCheck.isSecure) {
          setPasswordError(
            passwordCheck.reason ||
              'La contraseña no cumple con los requisitos de seguridad'
          );
          toast.error('La contraseña no es suficientemente segura');
          return;
        }

        // Validar que las contraseñas coincidan
        if (!passwordsMatch(formData.contrasena, confirmPassword)) {
          setPasswordError('Las contraseñas no coinciden');
          toast.error('Las contraseñas no coinciden');
          return;
        }

        await createUsuario(formData);
        toast.success('Usuario creado exitosamente');
      } else if (mode === 'edit' && user) {
        // Modo editar: requiere contraseña actual para cualquier actualización
        if (!currentPassword.trim()) {
          setPasswordError(
            'Debe ingresar su contraseña actual para realizar cambios'
          );
          toast.error('Contraseña actual requerida');
          return;
        }

        const { contrasena: _contrasena, ...restOfUpdateData } = updateData;

        const updatePayload: ActualizarUsuarioProps = {
          ...restOfUpdateData,
          contrasena: currentPassword // Contraseña actual para validación
        };

        // Si se proporciona una nueva contraseña, validarla
        if (formData.contrasena.trim()) {
          // Validar que la nueva contraseña sea segura
          const passwordCheck = isPasswordSecure(formData.contrasena);
          if (!passwordCheck.isSecure) {
            setPasswordError(
              passwordCheck.reason ||
                'La contraseña no cumple con los requisitos de seguridad'
            );
            toast.error('La nueva contraseña no es suficientemente segura');
            return;
          }

          // Validar que las contraseñas coincidan
          if (!passwordsMatch(formData.contrasena, confirmPassword)) {
            setPasswordError('Las contraseñas no coinciden');
            toast.error('Las contraseñas no coinciden');
            return;
          }

          // Validar que la nueva contraseña sea diferente de la actual
          if (formData.contrasena === currentPassword) {
            setPasswordError(
              'La nueva contraseña debe ser diferente de la actual'
            );
            toast.error('La nueva contraseña debe ser diferente de la actual');
            return;
          }

          updatePayload.nuevaContrasena = formData.contrasena;
        }

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
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // También actualizar updateData para modo edición
    if (mode === 'edit' && field !== 'perfilId') {
      setUpdateData(prev => ({ ...prev, [field]: value }));
    }
  };

  const isLoading =
    loadingState.createUsuario.isLoading ||
    loadingState.updateUsuario.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-2xl font-bold flex items-center gap-3 text-sky-900 dark:text-sky-100'>
            <div className='p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl'>
              <User className='h-6 w-6' />
            </div>
            {mode === 'add' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogDescription className='text-base text-muted-foreground'>
            {mode === 'add'
              ? 'Complete toda la información requerida para crear un nuevo usuario en el sistema.'
              : 'Modifique los campos que desee actualizar. Los campos vacíos mantendrán su valor actual.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='nombres'>Nombres</Label>
              <Input
                id='nombres'
                value={formData.nombres}
                onChange={e => handleInputChange('nombres', e.target.value)}
                placeholder='Ingresa los nombres'
                required
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='apellidos'>Apellidos</Label>
              <Input
                id='apellidos'
                value={formData.apellidos}
                onChange={e => handleInputChange('apellidos', e.target.value)}
                placeholder='Ingresa los apellidos'
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='nombreDeUsuario'>Nombre de Usuario</Label>
            <Input
              id='nombreDeUsuario'
              value={formData.nombreDeUsuario}
              onChange={e =>
                handleInputChange('nombreDeUsuario', e.target.value)
              }
              placeholder='Ingresa el nombre de usuario'
              required
              disabled={isLoading}
            />
          </div>

          {/* Contraseña Actual (solo en modo edición) */}
          {mode === 'edit' && (
            <div className='space-y-2'>
              <Label
                htmlFor='currentPassword'
                className='flex items-center gap-2'
              >
                Contraseña Actual
                <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <Input
                  id='currentPassword'
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => {
                    setCurrentPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder='Ingrese su contraseña actual'
                  required
                  disabled={isLoading}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              <p className='text-xs text-muted-foreground'>
                Por seguridad, debe ingresar su contraseña actual para realizar
                cualquier cambio
              </p>
            </div>
          )}

          {/* Contraseña / Nueva Contraseña */}
          <div className='space-y-2'>
            <Label htmlFor='contrasena'>
              {mode === 'add' ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
            </Label>
            <div className='relative'>
              <Input
                id='contrasena'
                type={showPassword ? 'text' : 'password'}
                value={formData.contrasena}
                onChange={e => {
                  handleInputChange('contrasena', e.target.value);
                  setPasswordError('');
                }}
                placeholder={
                  mode === 'add'
                    ? 'Ingresa una contraseña segura'
                    : 'Dejar vacío para mantener la actual'
                }
                required={mode === 'add'}
                disabled={isLoading}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>

            {/* Indicador de fortaleza */}
            {formData.contrasena && (
              <PasswordStrengthIndicator
                password={formData.contrasena}
                showRules={true}
                showWarnings={true}
              />
            )}
          </div>

          {/* Confirmar Contraseña */}
          {(mode === 'add' || formData.contrasena.trim()) && (
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirmar Contraseña</Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder='Confirma tu contraseña'
                  required={
                    mode === 'add' || formData.contrasena.trim().length > 0
                  }
                  disabled={isLoading}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>

              {/* Validación de coincidencia */}
              {confirmPassword && formData.contrasena && (
                <div className='flex items-center gap-2 text-xs'>
                  {passwordsMatch(formData.contrasena, confirmPassword) ? (
                    <>
                      <CheckCircle2 className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
                      <span className='text-green-700 dark:text-green-400 font-medium'>
                        Las contraseñas coinciden
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className='h-3.5 w-3.5 text-red-600 dark:text-red-400' />
                      <span className='text-red-700 dark:text-red-400'>
                        Las contraseñas no coinciden
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error de contraseña */}
          {passwordError && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='departamento'>Departamento</Label>
            <Select
              value={formData.departamento.toString()}
              onValueChange={value =>
                handleInputChange('departamento', Number.parseInt(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Selecciona un departamento' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1'>Gerencia</SelectItem>
                <SelectItem value='2'>Tecnología</SelectItem>
                <SelectItem value='3'>Recaudación</SelectItem>
                <SelectItem value='4'>Seguridad</SelectItem>
                <SelectItem value='5'>RR.HH</SelectItem>
                <SelectItem value='6'>Enerlova</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            {mode === 'add' && (
              <div className='space-y-2'>
                <Label htmlFor='perfilId'>Perfil</Label>
                <Select
                  value={formData.perfilId.toString()}
                  onValueChange={value =>
                    handleInputChange('perfilId', Number.parseInt(value))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecciona un perfil' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>Administrador</SelectItem>
                    <SelectItem value='2'>Lectura</SelectItem>
                    <SelectItem value='3'>Supervisor Operativo</SelectItem>
                    <SelectItem value='4'>
                      Administrativo Facturación
                    </SelectItem>
                    <SelectItem value='7'>Supervisor Facturación</SelectItem>
                    <SelectItem value='8'>Usuario Consulta</SelectItem>
                    <SelectItem value='10'>
                      Autorizador Límite Invierno
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='activo'>Estado</Label>
              <Select
                value={formData.activo.toString()}
                onValueChange={value =>
                  handleInputChange('activo', value === 'true')
                }
                disabled={isLoading}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Activo</SelectItem>
                  <SelectItem value='false'>Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant="default"
              disabled={isLoading}
            >
              {isLoading
                ? mode === 'add'
                  ? 'Creando...'
                  : 'Guardando...'
                : mode === 'add'
                  ? 'Crear'
                  : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
