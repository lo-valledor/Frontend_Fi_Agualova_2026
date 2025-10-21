import { Eye, Search, Smartphone, Table } from 'lucide-react';
import { toast } from 'sonner';

import React, { useCallback, useMemo, useState } from 'react';

import { useDebounce } from '~/hooks/shared/use-debounce';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
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
  onDataChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'mobile'>('table');
  const [compactView, setCompactView] = useState(false);

  // Función para obtener permisos de un rol y menú específico
  const getPermiso = useCallback(
    (idRol: number, idMenu: number) => {
      return permisos.find(p => p.idRol === idRol && p.idMenu === idMenu);
    },
    [permisos]
  );

  // Filtrar menús por búsqueda
  const filteredMenus = useMemo(
    () =>
      menus.filter(
        menu =>
          menu.nombreMenu.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          menu.ruta?.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [menus, debouncedSearch]
  );

  // Filtrar roles seleccionados
  const visibleRoles = useMemo(
    () =>
      selectedRoles.length > 0
        ? roles.filter(role => selectedRoles.includes(role.idRol))
        : roles,
    [roles, selectedRoles]
  );

  // Función para actualizar permisos
  const handleUpdatePermiso = useCallback(
    async (
      idRol: number,
      idMenu: number,
      tipoPermiso: string,
      valor: boolean
    ) => {
      try {
        const permisoActual = getPermiso(idRol, idMenu);

        // Formato de fecha sin milisegundos: YYYY-MM-DDTHH:mm:ss
        const fechaActual = new Date().toISOString().split('.')[0];

        const nuevoPermiso = {
          idRol,
          idMenu,
          puedeVer: permisoActual?.puedeVer || false,
          puedeCrear: permisoActual?.puedeCrear || false,
          puedeEditar: permisoActual?.puedeEditar || false,
          puedeEliminar: permisoActual?.puedeEliminar || false,
          [tipoPermiso]: valor,
          fechaAsignacion: fechaActual
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
    },
    [getPermiso, onDataChange]
  );

  // Componente para vista móvil
  const MobileView = () => (
    <div className='space-y-4'>
      {filteredMenus.map(menu => (
        <Card key={menu.idMenu} className='border-border'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='font-mono text-xs'>
                    #{menu.idMenu}
                  </Badge>
                  <span className='font-medium text-sm'>{menu.nombreMenu}</span>
                </div>
                {menu.ruta && (
                  <div className='text-xs text-slate-500 font-mono'>
                    {menu.ruta}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-3'>
              {visibleRoles.map(rol => {
                const permiso = getPermiso(rol.idRol, menu.idMenu);
                return (
                  <div
                    key={rol.idRol}
                    className='border border-slate-100 dark:border-slate-700 rounded-xl p-3'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='secondary'
                          className='font-mono text-xs'
                        >
                          #{rol.idRol}
                        </Badge>
                        <span className='font-medium text-sm'>
                          {rol.nombreRol}
                        </span>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
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
                          <span className='text-sm text-blue-700 dark:text-blue-300'>
                            Ver
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
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
                          <span className='text-sm text-green-700 dark:text-green-300'>
                            Crear
                          </span>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
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
                          <span className='text-sm text-yellow-700 dark:text-yellow-300'>
                            Editar
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
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
                          <span className='text-sm text-red-700 dark:text-red-300'>
                            Eliminar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (roles.length === 0 || menus.length === 0) {
    return (
      <Card className='border-0 shadow-lg bg-background backdrop-blur-sm'>
        <CardContent className='p-6'>
          <div className='text-center'>
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
    <TooltipProvider>
      <Card className='border-0 shadow-lg bg-background backdrop-blur-sm'>
        <CardHeader className='pb-4'>
          <div className='flex flex-col space-y-4'>
            {/* Header principal */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
              <CardTitle className='text-base sm:text-lg'>
                Matriz de Permisos
              </CardTitle>
              <div className='flex items-center gap-2'>
                {/* Toggle de vista */}
                <div className='flex items-center border-border rounded-xl p-1'>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('table')}
                    className='hidden sm:flex items-center gap-2 h-8 px-3'
                  >
                    <Table className='h-4 w-4' />
                    Tabla
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('mobile')}
                    className='flex items-center gap-2 h-8 px-3'
                  >
                    <Smartphone className='h-4 w-4' />
                    Cards
                  </Button>
                </div>

                {/* Toggle vista compacta */}
                {viewMode === 'table' && (
                  <Button
                    variant={compactView ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCompactView(!compactView)}
                    className='hidden md:flex items-center gap-2 h-8 px-3'
                  >
                    <Eye className='h-4 w-4' />
                    Compacta
                  </Button>
                )}
              </div>
            </div>

            {/* Controles de filtrado */}
            <div className='flex flex-col sm:flex-row gap-3'>
              {/* Búsqueda de menús */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4' />
                <Input
                  placeholder='Buscar menús por nombre o ruta...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Selector de roles */}
              <div className='flex flex-wrap gap-1 items-center'>
                <span className='text-sm mr-2'>Roles:</span>
                {roles.slice(0, 3).map(role => (
                  <Button
                    key={role.idRol}
                    variant={
                      selectedRoles.includes(role.idRol) ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => {
                      setSelectedRoles(prev =>
                        prev.includes(role.idRol)
                          ? prev.filter(id => id !== role.idRol)
                          : [...prev, role.idRol]
                      );
                    }}
                    className='h-7 px-2 text-xs'
                  >
                    {role.nombreRol}
                  </Button>
                ))}
                {roles.length > 3 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setSelectedRoles(
                        selectedRoles.length === roles.length
                          ? []
                          : roles.map(r => r.idRol)
                      );
                    }}
                    className='h-7 px-2 text-xs'
                  >
                    {selectedRoles.length === roles.length
                      ? 'Ninguno'
                      : `+${roles.length - 3} más`}
                  </Button>
                )}
              </div>
            </div>

            {/* Leyenda */}
            <div className='flex flex-wrap gap-4 text-xs bg-background p-3 rounded-xl'>
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

            {/* Información de filtros activos */}
            {(searchTerm || selectedRoles.length > 0) && (
              <div className='text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl'>
                Mostrando {filteredMenus.length} menús
                {selectedRoles.length > 0 &&
                  ` para ${visibleRoles.length} roles seleccionados`}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          {viewMode === 'mobile' ? (
            <MobileView />
          ) : (
            <div className='relative'>
              {/* Indicador de scroll */}
              <div className='absolute top-0 right-0 z-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent w-8 h-full pointer-events-none opacity-50' />
              <div className='absolute top-0 left-64 z-20 bg-gradient-to-r from-white dark:from-slate-900 to-transparent w-8 h-full pointer-events-none opacity-50' />

              <div className='overflow-auto border rounded-xl bg-background max-h-[80vh]'>
                <table className='w-full border-collapse relative'>
                  <thead className='sticky top-0 bg-background z-10'>
                    <tr>
                      <th className='text-left p-3 border-b font-medium sticky left-0 bg-background z-20 min-w-[280px] shadow-r'>
                        <div className='flex items-center gap-2'>
                          <span>Menú</span>
                          <Badge variant='outline' className='text-xs'>
                            {filteredMenus.length}
                          </Badge>
                        </div>
                      </th>
                      {visibleRoles.map(rol => (
                        <th
                          key={rol.idRol}
                          className={`text-center border-b border-l font-medium ${
                            compactView
                              ? 'p-2 min-w-[160px]'
                              : 'p-3 min-w-[200px]'
                          }`}
                        >
                          <div className={`space-y-${compactView ? '1' : '2'}`}>
                            <div className='flex items-center justify-center gap-2'>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant='secondary'
                                    className='font-mono text-xs'
                                  >
                                    #{rol.idRol}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>ID del Rol: {rol.idRol}</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    className={`font-semibold text-sm truncate ${
                                      compactView
                                        ? 'max-w-[100px]'
                                        : 'max-w-[120px]'
                                    }`}
                                  >
                                    {rol.nombreRol}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{rol.nombreRol}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {!compactView && (
                              <div className='grid grid-cols-4 gap-1 text-xs'>
                                <div className='bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded text-center'>
                                  V
                                </div>
                                <div className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded text-center'>
                                  C
                                </div>
                                <div className='bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-1 rounded text-center'>
                                  E
                                </div>
                                <div className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-1 rounded text-center'>
                                  D
                                </div>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenus.map((menu, index) => (
                      <tr
                        key={menu.idMenu}
                        className={`hover:muted ${
                          index % 2 === 0 ? 'bg-background' : 'bg-background'
                        }`}
                      >
                        <td
                          className={`border-b font-medium sticky left-0 bg-inherit z-10 shadow-r ${
                            compactView ? 'p-2' : 'p-3'
                          }`}
                        >
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs'
                              >
                                #{menu.idMenu}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    className={`font-medium truncate ${
                                      compactView
                                        ? 'max-w-[160px]'
                                        : 'max-w-[180px]'
                                    }`}
                                  >
                                    {menu.nombreMenu}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{menu.nombreMenu}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {menu.ruta && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    className={`text-xs text-slate-500 font-mono truncate ${
                                      compactView
                                        ? 'max-w-[180px]'
                                        : 'max-w-[200px]'
                                    }`}
                                  >
                                    {menu.ruta}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{menu.ruta}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        {visibleRoles.map(rol => {
                          const permiso = getPermiso(rol.idRol, menu.idMenu);
                          return (
                            <td
                              key={`${rol.idRol}-${menu.idMenu}`}
                              className={`border-b border-l ${compactView ? 'p-1' : 'p-3'}`}
                            >
                              <div className='grid grid-cols-4 gap-1'>
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
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PermisosTabComponent;
