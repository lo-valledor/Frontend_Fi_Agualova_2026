import { toast } from 'sonner';

import React from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { Menus, PermisoRolMenu, Roles } from '~/types/roles-permisos';

interface PermisosTabComponentProps {
  roles: Roles[];
  menus: Menus[];
  permisos: PermisoRolMenu[];
  onDataChange?: () => void;
}

const PermisosTabComponent: React.FC<PermisosTabComponentProps> = ({
  roles,
  menus,
  permisos,
  onDataChange,
}) => {
  // Función para obtener permisos de un rol y menú específico
  const getPermiso = (idRol: number, idMenu: number) => {
    return permisos.find(p => p.idRol === idRol && p.idMenu === idMenu);
  };

  // Función para actualizar permisos
  const handleUpdatePermiso = async (
    idRol: number,
    idMenu: number,
    tipoPermiso: string,
    valor: boolean
  ) => {
    try {
      const permisoActual = getPermiso(idRol, idMenu);
      const nuevoPermiso = {
        idRol,
        idMenu,
        puedeVer: permisoActual?.puedeVer || false,
        puedeCrear: permisoActual?.puedeCrear || false,
        puedeEditar: permisoActual?.puedeEditar || false,
        puedeEliminar: permisoActual?.puedeEliminar || false,
        [tipoPermiso]: valor,
        fechaAsignacion: new Date().toISOString(),
      };

      const result =
        await rolesPermisosService.asignarPermisoDirecto(nuevoPermiso);

      if (result.error) {
        toast.error(`Error al actualizar permiso: ${result.error}`);
      } else {
        toast.success('Permiso actualizado exitosamente');
        onDataChange?.();
      }
    } catch (_error) {
      toast.error('Error inesperado al actualizar el permiso');
    }
  };

  if (roles.length === 0 || menus.length === 0) {
    return (
      <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='p-6'>
          <div className='text-center text-slate-500 dark:text-slate-400'>
            <p>No hay roles o menús disponibles para configurar permisos.</p>
            <p className='text-sm mt-2'>
              Primero debe crear roles y menús en las pestañas correspondientes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
      <CardHeader className='pb-3'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
          <CardTitle className='text-base sm:text-lg'>
            Matriz de Permisos
          </CardTitle>
          <div className='text-sm text-slate-600 dark:text-slate-400'>
            Gestiona los permisos de cada rol por menú
          </div>
        </div>

        {/* Leyenda */}
        <div className='flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg'>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 bg-blue-500 rounded-sm'></div>
            <span>Ver</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 bg-green-500 rounded-sm'></div>
            <span>Crear</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 bg-yellow-500 rounded-sm'></div>
            <span>Editar</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 bg-red-500 rounded-sm'></div>
            <span>Eliminar</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative p-0 sm:p-4'>
        <div className='overflow-x-auto'>
          <div className='min-w-full p-3 sm:p-0'>
            <div className='border rounded-lg overflow-hidden bg-white dark:bg-slate-900'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-slate-50 dark:bg-slate-800'>
                    <th className='text-left p-3 border-b font-medium sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 min-w-[250px]'>
                      Menú
                    </th>
                    {roles.map(rol => (
                      <th
                        key={rol.idRol}
                        className='text-center p-3 border-b border-l font-medium min-w-[200px]'
                      >
                        <div className='space-y-2'>
                          <div className='flex items-center justify-center gap-2'>
                            <Badge
                              variant='secondary'
                              className='font-mono text-xs'
                            >
                              #{rol.idRol}
                            </Badge>
                            <div
                              className='font-semibold text-sm truncate max-w-[120px]'
                              title={rol.nombreRol}
                            >
                              {rol.nombreRol}
                            </div>
                          </div>
                          <div className='grid grid-cols-4 gap-1 text-xs text-slate-600 dark:text-slate-400'>
                            <div className='bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded text-center'>
                              Ver
                            </div>
                            <div className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded text-center'>
                              Crear
                            </div>
                            <div className='bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-1 rounded text-center'>
                              Editar
                            </div>
                            <div className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-1 rounded text-center'>
                              Eliminar
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {menus.map(menu => (
                    <tr
                      key={menu.idMenu}
                      className='hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    >
                      <td className='p-3 border-b font-medium sticky left-0 bg-white dark:bg-slate-900 z-10'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='font-mono text-xs'
                            >
                              #{menu.idMenu}
                            </Badge>
                            <div
                              className='font-medium truncate max-w-[180px]'
                              title={menu.nombreMenu}
                            >
                              {menu.nombreMenu}
                            </div>
                          </div>
                          {menu.ruta && (
                            <div
                              className='text-xs text-slate-500 font-mono truncate max-w-[200px]'
                              title={menu.ruta}
                            >
                              {menu.ruta}
                            </div>
                          )}
                        </div>
                      </td>
                      {roles.map(rol => {
                        const permiso = getPermiso(rol.idRol, menu.idMenu);
                        return (
                          <td
                            key={`${rol.idRol}-${menu.idMenu}`}
                            className='p-3 border-b border-l'
                          >
                            <div className='grid grid-cols-4 gap-2'>
                              {/* Ver */}
                              <div className='flex items-center justify-center'>
                                <Checkbox
                                  checked={permiso?.puedeVer || false}
                                  onCheckedChange={checked =>
                                    handleUpdatePermiso(
                                      rol.idRol,
                                      menu.idMenu,
                                      'puedeVer',
                                      !!checked
                                    )
                                  }
                                  className='h-4 w-4 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
                                />
                              </div>
                              {/* Crear */}
                              <div className='flex items-center justify-center'>
                                <Checkbox
                                  checked={permiso?.puedeCrear || false}
                                  onCheckedChange={checked =>
                                    handleUpdatePermiso(
                                      rol.idRol,
                                      menu.idMenu,
                                      'puedeCrear',
                                      !!checked
                                    )
                                  }
                                  className='h-4 w-4 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
                                />
                              </div>
                              {/* Editar */}
                              <div className='flex items-center justify-center'>
                                <Checkbox
                                  checked={permiso?.puedeEditar || false}
                                  onCheckedChange={checked =>
                                    handleUpdatePermiso(
                                      rol.idRol,
                                      menu.idMenu,
                                      'puedeEditar',
                                      !!checked
                                    )
                                  }
                                  className='h-4 w-4 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500'
                                />
                              </div>
                              {/* Eliminar */}
                              <div className='flex items-center justify-center'>
                                <Checkbox
                                  checked={permiso?.puedeEliminar || false}
                                  onCheckedChange={checked =>
                                    handleUpdatePermiso(
                                      rol.idRol,
                                      menu.idMenu,
                                      'puedeEliminar',
                                      !!checked
                                    )
                                  }
                                  className='h-4 w-4 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500'
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermisosTabComponent;
