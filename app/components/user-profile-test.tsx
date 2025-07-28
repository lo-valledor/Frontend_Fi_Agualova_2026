import { AlertCircle, Database, RefreshCw, Trash2, User } from 'lucide-react';

import React from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useUserProfileSimple } from '~/hooks/use-user-profile-simple';

export const UserProfileTest: React.FC = () => {
  const { userData, isLoading, error, refreshProfile, clearCache } =
    useUserProfileSimple();

  return (
    <div className='space-y-6'>
      {/* Estado del Hook */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Estado del Hook de Perfil
          </CardTitle>
          <CardDescription>
            Información en tiempo real del estado del hook
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
              />
              <span className='text-sm font-medium'>
                Estado: {isLoading ? 'Cargando' : 'Listo'}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4 text-blue-500' />
              <span className='text-sm font-medium'>
                Datos: {userData ? 'Disponibles' : 'No disponibles'}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-red-500' />
              <span className='text-sm font-medium'>
                Error: {error ? 'Sí' : 'No'}
              </span>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button onClick={refreshProfile} variant='outline' size='sm'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Actualizar
            </Button>
            <Button onClick={clearCache} variant='outline' size='sm'>
              <Trash2 className='h-4 w-4 mr-2' />
              Limpiar Caché
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Datos del Usuario */}
      {userData && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del Usuario</CardTitle>
            <CardDescription>Información obtenida del perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>ID Usuario:</span>
                  <Badge variant='outline'>{userData.idUsuario}</Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>
                    Nombre de Usuario:
                  </span>
                  <span className='text-sm'>{userData.nombreDeUsuario}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>Nombres:</span>
                  <span className='text-sm'>{userData.nombres}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>Apellidos:</span>
                  <span className='text-sm'>{userData.apellidos}</span>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>Perfil ID:</span>
                  <Badge variant='outline'>{userData.perfilId}</Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>Departamento:</span>
                  <span className='text-sm'>{userData.departamento}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>Estado:</span>
                  <Badge variant={userData.activo ? 'default' : 'secondary'}>
                    {userData.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium'>Fecha Creación:</span>
                  <span className='text-sm'>
                    {new Date(userData.fechaCreacion).toLocaleDateString(
                      'es-ES'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>
            Detalles sobre cómo funciona el hook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4 text-blue-500' />
              <span>
                Usa el endpoint <code>/usuarios</code> para obtener todos los
                usuarios
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-green-500' />
              <span>Filtra por el ID del usuario del token JWT</span>
            </div>
            <div className='flex items-center gap-2'>
              <Trash2 className='h-4 w-4 text-purple-500' />
              <span>
                Implementa caché de 10 minutos para evitar llamadas repetidas
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-orange-500' />
              <span>
                Si no encuentra el usuario, crea datos simulados basados en el
                token
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <RefreshCw className='h-4 w-4 text-teal-500' />
              <span>Permite actualizar manualmente y limpiar el caché</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
