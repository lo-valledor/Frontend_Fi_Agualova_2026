import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  User
} from 'lucide-react';
import { toast } from 'sonner';

import type React from 'react';
import { useEffect, useState } from 'react';

import { PasswordStrengthIndicator } from '~/components/ui/password-strength-indicator';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { useAuth } from '~/context/AuthContext';
import { useAdministracion } from '~/hooks/use-administracion';
import type { ActualizarUsuarioProps, Usuarios } from '~/types/administracion';
import { isPasswordSecure, passwordsMatch } from '~/utils/password-validation';

export default function ProfileComponent() {
  const { user } = useAuth();
  const { updateUsuario, loadingState, getUsuarioById } = useAdministracion();
  const [currentUserData, setCurrentUserData] = useState<Usuarios | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ActualizarUsuarioProps>({
    nombreDeUsuario: '',
    contrasena: '',
    nombres: '',
    apellidos: '',
    departamento: 1,
    activo: true
  });

  // Cargar datos completos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setLoadingUserData(false);
        return;
      }

      try {
        setLoadingUserData(true);
        const userData: Usuarios = await getUsuarioById(
          Number.parseInt(user.id)
        );
        setCurrentUserData(userData);

        // Inicializar formData con los datos del usuario
        setFormData({
          nombreDeUsuario: userData.nombreDeUsuario,
          contrasena: '',
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          departamento: userData.departamento,
          activo: userData.activo
        });
      } catch (error) {
        toast.error('Error al cargar los datos del perfil', error as any);
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentUserData) {
      toast.error('No se encontró información del usuario');
      return;
    }

    try {
      // Validar que se haya ingresado la contraseña actual
      if (!currentPassword.trim()) {
        setPasswordError(
          'Debe ingresar su contraseña actual para realizar cambios'
        );
        toast.error('Contraseña actual requerida');
        return;
      }

      const { contrasena: _contrasena, ...restOfFormData } = formData;

      const updatePayload: ActualizarUsuarioProps = {
        ...restOfFormData,
        contrasena: currentPassword // Contraseña actual para validación
      };

      // Si se proporciona una nueva contraseña, validarla
      if (newPassword.trim()) {
        // Validar que la nueva contraseña sea segura
        const passwordCheck = isPasswordSecure(newPassword);
        if (!passwordCheck.isSecure) {
          setPasswordError(
            passwordCheck.reason ||
              'La contraseña no cumple con los requisitos de seguridad'
          );
          toast.error('La nueva contraseña no es suficientemente segura');
          return;
        }

        // Validar que las contraseñas coincidan
        if (!passwordsMatch(newPassword, confirmPassword)) {
          setPasswordError('Las contraseñas no coinciden');
          toast.error('Las contraseñas no coinciden');
          return;
        }

        // Validar que la nueva contraseña sea diferente de la actual
        if (newPassword === currentPassword) {
          setPasswordError(
            'La nueva contraseña debe ser diferente de la actual'
          );
          toast.error('La nueva contraseña debe ser diferente de la actual');
          return;
        }

        updatePayload.nuevaContrasena = newPassword;
      }

      setIsSaving(true);
      await updateUsuario(currentUserData.idUsuario, updatePayload);
      toast.success('Perfil actualizado exitosamente');

      // Limpiar campos de contraseña después de actualizar
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al actualizar el perfil';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof ActualizarUsuarioProps,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = loadingState.updateUsuario.isLoading || isSaving;

  if (loadingUserData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        <p className='ml-3 text-muted-foreground'>
          Cargando datos del perfil...
        </p>
      </div>
    );
  }

  if (!currentUserData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            No se pudo cargar la información del usuario
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div className='flex items-center gap-4 mb-6'>
        <div className='p-3 bg-primary/10 rounded-xl'>
          <User className='h-8 w-8 text-primary' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Mi Perfil</h1>
          <p className='text-muted-foreground'>
            Actualiza tu información personal y contraseña
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tus datos personales y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='nombres'>Nombres</Label>
                <Input
                  id='nombres'
                  value={formData.nombres}
                  onChange={e => handleInputChange('nombres', e.target.value)}
                  placeholder='Ingresa tus nombres'
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
                  placeholder='Ingresa tus apellidos'
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
                placeholder='Ingresa tu nombre de usuario'
                required
                disabled={isLoading}
              />
            </div>

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
          </CardContent>
        </Card>

        {/* Seguridad - Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>
              Cambia tu contraseña para mantener tu cuenta segura
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Contraseña Actual */}
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
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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

            {/* Nueva Contraseña */}
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>Nueva Contraseña (opcional)</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder='Dejar vacío para mantener la actual'
                  disabled={isLoading}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
              {newPassword && (
                <PasswordStrengthIndicator
                  password={newPassword}
                  showRules={true}
                  showWarnings={true}
                />
              )}
            </div>

            {/* Confirmar Contraseña */}
            {newPassword.trim() && (
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>
                  Confirmar Nueva Contraseña
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder='Confirma tu nueva contraseña'
                    required={newPassword.trim().length > 0}
                    disabled={isLoading}
                    className='pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
                {confirmPassword && newPassword && (
                  <div className='flex items-center gap-2 text-xs'>
                    {passwordsMatch(newPassword, confirmPassword) ? (
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
          </CardContent>
        </Card>

        {/* Botón Guardar */}
        <div className='flex justify-end gap-4'>
          <Button
            type='submit'
            size='lg'
            disabled={isLoading}
            className='gap-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Guardando...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
