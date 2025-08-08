import React from 'react';

import { Card, CardContent } from '~/components/ui/card';
import type { Menus, PermisoRolMenu, Roles } from '~/types/roles-permisos';

interface EstadisticasComponentProps {
  roles: Roles[];
  menus: Menus[];
  permisos: PermisoRolMenu[];
}

const EstadisticasComponent: React.FC<EstadisticasComponentProps> = ({
  roles,
  menus,
  permisos,
}) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      <Card className='border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-sky-600'>
              {roles.length}
            </div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              Total Roles
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-emerald-600'>
              {menus.length}
            </div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              Total Menús
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {permisos.length}
            </div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              Permisos Asignados
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>
              {roles.length * menus.length}
            </div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              Total Combinaciones
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstadisticasComponent;
