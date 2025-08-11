import React, { useState } from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { Menus, PermisoRolMenu, Roles } from '~/types/roles-permisos';

import MenusTabComponent from './menus-tab-component';
import PermisosTabComponent from './permisos-tab-component';
import RolesTabComponent from './roles-tab-component';

interface RolesPermisosComponentProps {
  roles: Roles[];
  menus: Menus[];
  permisos: PermisoRolMenu[];
  error: Error | null;
  onDataChange?: () => void;
}

const RolesPermisosComponent: React.FC<RolesPermisosComponentProps> = ({
  roles,
  menus,
  permisos,
  error,
  onDataChange,
}) => {
  const [activeTab, setActiveTab] = useState('roles');

  if (error) {
    return (
      <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
        <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4'>
          <Card className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'>
            <CardContent className='p-6'>
              <div className='text-red-700 dark:text-red-400'>
                <h3 className='text-lg font-semibold mb-2'>
                  Error al cargar datos
                </h3>
                <p>{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b border-slate-200/60 dark:border-slate-700/60 space-y-2 sm:space-y-0'>
          <div className='text-center sm:text-left'>
            <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-slate-100'>
              Roles y Permisos
            </h1>
            <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1'>
              Gestiona los roles, menús y permisos del sistema
            </p>
          </div>
        </div>

        {/* Tabs para roles, menús y permisos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3 sm:w-auto sm:grid-cols-3'>
            <TabsTrigger value='roles' className='text-xs sm:text-sm'>
              Roles ({roles.length})
            </TabsTrigger>
            <TabsTrigger value='menus' className='text-xs sm:text-sm'>
              Menús ({menus.length})
            </TabsTrigger>
            <TabsTrigger value='permisos' className='text-xs sm:text-sm'>
              Permisos ({permisos.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab de Roles */}
          <TabsContent value='roles' className='space-y-4'>
            <RolesTabComponent roles={roles} onDataChange={onDataChange} />
          </TabsContent>

          {/* Tab de Menús */}
          <TabsContent value='menus' className='space-y-4'>
            <MenusTabComponent menus={menus} onDataChange={onDataChange} />
          </TabsContent>

          {/* Tab de Permisos */}
          <TabsContent value='permisos' className='space-y-4'>
            <PermisosTabComponent
              roles={roles}
              menus={menus}
              permisos={permisos}
              onDataChange={onDataChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RolesPermisosComponent;
