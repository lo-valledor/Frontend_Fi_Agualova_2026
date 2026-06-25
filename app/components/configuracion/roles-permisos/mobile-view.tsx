import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import type { Menus, PermisoRolMenu, Roles } from '~/types/roles-permisos';

import { PermisoCheckboxGroup } from './permiso-checkbox-group';

interface MobileViewProps {
  filteredMenus: Menus[];
  visibleRoles: Roles[];
  getPermiso: (idRol: number, idMenu: number) => PermisoRolMenu | undefined;
  onTogglePermiso: (
    idRol: number,
    idMenu: number,
    tipoPermiso: string,
    valor: boolean
  ) => void;
}

export function MobileView({
  filteredMenus,
  visibleRoles,
  getPermiso,
  onTogglePermiso
}: MobileViewProps) {
  return (
    <div className="space-y-4">
      {filteredMenus.map(menu => (
        <Card key={menu.idMenu} className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{menu.idMenu}
                  </Badge>
                  <span className="font-medium text-sm">{menu.nombreMenu}</span>
                </div>
                {menu.ruta && (
                  <div className="text-xs text-slate-500 font-mono">
                    {menu.ruta}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {visibleRoles.map(rol => {
                const permiso = getPermiso(rol.idRol, menu.idMenu);
                return (
                  <div
                    key={rol.idRol}
                    className="border border-slate-100 dark:border-slate-700 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          #{rol.idRol}
                        </Badge>
                        <span className="font-medium text-sm">
                          {rol.nombreRol}
                        </span>
                      </div>
                    </div>
                    <PermisoCheckboxGroup
                      permiso={permiso}
                      rolId={rol.idRol}
                      menuId={menu.idMenu}
                      onTogglePermiso={onTogglePermiso}
                      layout="mobile"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
MobileView.displayName = 'MobileView';
