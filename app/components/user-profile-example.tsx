import { Building, Calendar, RefreshCw, User } from 'lucide-react';

import React from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
// Puedes usar cualquiera de estos hooks:
// import { useUserProfile } from '~/hooks/use-user-profile';
// import { useUserProfileEnhanced } from '~/hooks/use-user-profile-enhanced';
import { useUserProfileSimple } from '~/hooks/use-user-profile-simple';

export const UserProfileExample: React.FC = () => {
  const { userData, isLoading, error, refreshProfile, clearCache } =
    useUserProfileSimple();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>Cargando información del usuario...</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-[200px]' />
              <Skeleton className='h-4 w-[150px]' />
            </div>
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>Error al cargar el perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className='mt-4 space-x-2'>
            <Button onClick={refreshProfile} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Reintentar
            </Button>
            <Button onClick={clearCache} variant='outline'>
              Limpiar Caché
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No se pudieron cargar los datos del usuario.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>
              Información detallada del usuario actual
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Button onClick={refreshProfile} variant='outline' size='sm'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Actualizar
            </Button>
            <Button onClick={clearCache} variant='outline' size='sm'>
              Limpiar Caché
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Información básica */}
        <div className='flex items-center space-x-4'>
          <div className='w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xl'>
            {userData.nombres.charAt(0)}
            {userData.apellidos.charAt(0)}
          </div>
          <div>
            <h3 className='text-lg font-semibold'>
              {userData.nombres} {userData.apellidos}
            </h3>
            <p className='text-muted-foreground'>@{userData.nombreDeUsuario}</p>
            <div className='flex items-center gap-2 mt-1'>
              <Badge variant={userData.activo ? 'default' : 'secondary'}>
                {userData.activo ? 'Activo' : 'Inactivo'}
              </Badge>
              <Badge variant='outline'>ID: {userData.idUsuario}</Badge>
            </div>
          </div>
        </div>

        {/* Detalles del usuario */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Nombre de Usuario:</span>
              <span className='text-sm'>{userData.nombreDeUsuario}</span>
            </div>

            <div className='flex items-center gap-2'>
              <Building className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Departamento:</span>
              <span className='text-sm'>{userData.departamento}</span>
            </div>

            <div className='flex items-center gap-2'>
              <Badge className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Perfil ID:</span>
              <span className='text-sm'>{userData.perfilId}</span>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Fecha de Creación:</span>
              <span className='text-sm'>
                {new Date(userData.fechaCreacion).toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Estado:</span>
              <Badge variant={userData.activo ? 'default' : 'secondary'}>
                {userData.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className='pt-4 border-t'>
          <h4 className='font-medium mb-2'>Información del Sistema</h4>
          <div className='text-sm text-muted-foreground space-y-1'>
            <p>• Los datos se obtienen del endpoint de usuarios</p>
            <p>• Si no se encuentra el usuario, se crean datos simulados</p>
            <p>• El caché se mantiene por 10 minutos</p>
            <p>• Puedes actualizar manualmente o limpiar el caché</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
