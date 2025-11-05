import {
  Building,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  Save,
  Shield,
  User,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';
import { PasswordStrengthIndicator } from '~/components/ui/password-strength-indicator';

import { type MetaFunction, useRouteError } from 'react-router';

import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { ProfileHydrateFallback } from '~/components/profile-hydrate-fallback';
import { ProfileLoadingState } from '~/components/profile-loading-state';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAuth } from '~/context/AuthContext';
import { useUserProfileSimple } from '~/hooks/use-user-profile-simple';
import type { ActualizarUsuarioProps } from '~/types/administracion';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export const meta: MetaFunction = () => {
  return [
    { title: 'Perfil de Usuario' },
    { name: 'description', content: 'Gestiona tu perfil de usuario' }
  ];
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { userData, isLoading, error, updateProfile } = useUserProfileSimple();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ActualizarUsuarioProps>({
    nombreDeUsuario: '',
    contrasena: '',
    nombres: '',
    apellidos: '',
    departamento: 0,
    activo: true,
    nuevaContrasena: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const pageBreadcrumbs = [{ label: 'Perfil de Usuario' }];

  // Actualizar formulario cuando se cargan los datos del usuario
  useEffect(() => {
    if (userData) {
      setFormData({
        nombreDeUsuario: userData.nombreDeUsuario,
        contrasena: '',
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        departamento: userData.departamento,
        activo: userData.activo,
        nuevaContrasena: ''
      });
    }
  }, [userData]);

  const handleInputChange = (
    field: keyof ActualizarUsuarioProps,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!userData) return;

    // Validar que se proporcione la contraseña actual solo si se quiere cambiar la contraseña
    if (formData.nuevaContrasena?.trim() && !formData.contrasena.trim()) {
      toast.error(
        'Debes ingresar tu contraseña actual para cambiar la contraseña'
      );
      return;
    }

    // Validar fortaleza de contraseña según OWASP
    if (formData.nuevaContrasena?.trim()) {
      const password = formData.nuevaContrasena;
      const hasMinLength = password.length >= 8;
      const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!hasMinLength || !hasUpperLower || !hasNumber || !hasSpecial) {
        toast.error(
          'La contraseña debe tener mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales'
        );
        return;
      }
    }

    try {
      // Preparar datos para enviar
      const dataToUpdate: ActualizarUsuarioProps = {
        nombreDeUsuario: formData.nombreDeUsuario,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        departamento: formData.departamento,
        activo: formData.activo,
        // Solo incluir contraseña si se proporcionó (para cambio de contraseña)
        contrasena: formData.contrasena || '',
        // Solo incluir nuevaContrasena si se proporcionó
        ...(formData.nuevaContrasena?.trim() && {
          nuevaContrasena: formData.nuevaContrasena
        })
      };

      await updateProfile(dataToUpdate);
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);

      // Limpiar contraseñas después de guardar
      setFormData(prev => ({
        ...prev,
        contrasena: '',
        nuevaContrasena: ''
      }));
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar el perfil';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        nombreDeUsuario: userData.nombreDeUsuario,
        contrasena: '',
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        departamento: userData.departamento,
        activo: userData.activo,
        nuevaContrasena: ''
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!user) {
    return <ProfileHydrateFallback />;
  }

  if (isLoading) {
    return <ProfileLoadingState message='Cargando datos del perfil...' />;
  }

  if (error || !userData) {
    return (
      <div className='container mx-auto p-6'>
        <BreadcrumbSetter items={pageBreadcrumbs} />
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center max-w-md'>
            <div className='p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full mx-auto mb-4 w-fit'>
              <User className='h-8 w-8 text-rose-600 dark:text-rose-400' />
            </div>
            <h3 className='font-medium text-rose-800 dark:text-rose-200 mb-2 text-lg'>
              Error al cargar el perfil
            </h3>
            <p className='text-sm text-rose-600 dark:text-rose-400 mb-4'>
              {error || 'No se pudieron cargar los datos del usuario'}
            </p>
            <Button
              onClick={() => globalThis.location.reload()}
              variant='outline'
              className='border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/20'
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-primary/10 rounded-xl shadow-sm'>
              <User className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-foreground'>
                Mi Perfil
              </h1>
              <p className='text-muted-foreground'>
                Gestiona tu información personal y configuración de cuenta
              </p>
            </div>
          </div>
        </div>
        <div className='flex gap-2'>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              <Edit className='mr-2 h-4 w-4' />
              Editar Perfil
            </Button>
          ) : (
            <div className='flex gap-2'>
              <Button onClick={handleCancel} variant='outline'>
                <X className='mr-2 h-4 w-4' />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                <Save className='mr-2 h-4 w-4' />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Información Principal */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Información Personal */}
          <Card className='border-border'>
            <CardHeader className='bg-muted/30 rounded-t-lg'>
              <div className='flex items-center gap-2'>
                <User className='h-5 w-5 text-primary' />
                <CardTitle className='text-lg text-foreground'>
                  Información Personal
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='pt-6 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='nombres' className='text-sm font-medium'>
                    Nombres
                  </Label>
                  {isEditing ? (
                    <Input
                      id='nombres'
                      value={formData.nombres}
                      onChange={e =>
                        handleInputChange('nombres', e.target.value)
                      }
                      placeholder='Ingresa tus nombres'
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground py-2'>
                      {userData.nombres || 'No especificado'}
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='apellidos' className='text-sm font-medium'>
                    Apellidos
                  </Label>
                  {isEditing ? (
                    <Input
                      id='apellidos'
                      value={formData.apellidos}
                      onChange={e =>
                        handleInputChange('apellidos', e.target.value)
                      }
                      placeholder='Ingresa tus apellidos'
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground py-2'>
                      {userData.apellidos || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='nombreDeUsuario'
                  className='text-sm font-medium'
                >
                  Nombre de Usuario
                </Label>
                {isEditing ? (
                  <Input
                    id='nombreDeUsuario'
                    value={formData.nombreDeUsuario}
                    onChange={e =>
                      handleInputChange('nombreDeUsuario', e.target.value)
                    }
                    placeholder='Nombre de usuario'
                  />
                ) : (
                  <p className='text-sm text-muted-foreground py-2'>
                    {userData.nombreDeUsuario}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de Seguridad */}
          <Card className='border-emerald-200/50 dark:border-emerald-800/50'>
            <CardHeader className='bg-muted/30 rounded-t-lg'>
              <div className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                <CardTitle className='text-lg text-emerald-800 dark:text-emerald-200'>
                  Seguridad
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='pt-6 space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='contrasena' className='text-sm font-medium'>
                  Contraseña Actual
                </Label>
                {isEditing ? (
                  <div className='space-y-2'>
                    <div className='relative'>
                      <Input
                        id='contrasena'
                        type={showPassword ? 'text' : 'password'}
                        value={formData.contrasena}
                        onChange={e =>
                          handleInputChange('contrasena', e.target.value)
                        }
                        placeholder='Solo requerida para cambiar contraseña'
                        autoComplete='current-password'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Solo necesaria si deseas cambiar tu contraseña
                    </p>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground py-2'>••••••••</p>
                )}
              </div>
              {isEditing && (
                <div className='space-y-2'>
                  <Label
                    htmlFor='nuevaContrasena'
                    className='text-sm font-medium'
                  >
                    Nueva Contraseña (opcional)
                  </Label>
                  <div className='space-y-2'>
                    <div className='relative'>
                      <Input
                        id='nuevaContrasena'
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.nuevaContrasena || ''}
                        onChange={e =>
                          handleInputChange('nuevaContrasena', e.target.value)
                        }
                        placeholder='Mínimo 8 caracteres'
                        autoComplete='new-password'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    {formData.nuevaContrasena && (
                      <PasswordStrengthIndicator
                        password={formData.nuevaContrasena}
                        showRules={true}
                        showWarnings={true}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con información adicional */}
        <div className='space-y-6'>
          {/* Información de la Cuenta */}
          <Card className='border-violet-200/50 dark:border-violet-800/50'>
            <CardHeader className='bg-muted/30 rounded-t-lg'>
              <div className='flex items-center gap-2'>
                <Building className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                <CardTitle className='text-lg text-violet-800 dark:text-violet-200'>
                  Información de la Cuenta
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='pt-6 space-y-4'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Departamento</Label>
                <Badge
                  variant='outline'
                  className='bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                >
                  {userData.departamento}
                </Badge>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Estado</Label>
                <Badge
                  variant={userData.activo ? 'default' : 'secondary'}
                  className={
                    userData.activo
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
                  }
                >
                  {userData.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información de Sesión */}
          <Card className='border-amber-200/50 dark:border-amber-800/50'>
            <CardHeader className='bg-muted/30 rounded-t-lg'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                <CardTitle className='text-lg text-amber-800 dark:text-amber-200'>
                  Información de Sesión
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='pt-6 space-y-4'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Fecha de Creación</Label>
                <p className='text-sm font-medium'>
                  {formatDate(userData.fechaCreacion)}
                </p>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Rol Actual</Label>
                <Badge
                  variant='outline'
                  className='bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                >
                  {user.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function hydrateFallback() {
  return <ProfileHydrateFallback />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorBoundaryComponent error={error} />;
}
