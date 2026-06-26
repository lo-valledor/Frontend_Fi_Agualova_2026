import React, { useState } from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { Permisos, Roles } from '~/types/roles-permisos';

import PermisosTabComponent from './permisos-tab-component';
import RolesTabComponent from './roles-tab-component';

interface RolePermissionsEntry {
  roleId: string;
  permisos: Permisos[];
}

interface RolesPermisosComponentProps {
  roles: Roles[];
  allPermissions: Permisos[];
  rolePermissions: RolePermissionsEntry[];
  error: Error | null;
  onDataChange?: () => void;
}

const RolesPermisosComponent: React.FC<RolesPermisosComponentProps> = ({
  roles,
  allPermissions,
  rolePermissions,
  error,
  onDataChange
}) => {
  const [activeTab, setActiveTab] = useState('roles');

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 py-4 sm:px-4 lg:px-6">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <CardContent className="p-6">
              <div className="text-red-700 dark:text-red-400">
                <h3 className="mb-2 text-lg font-semibold">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-4 px-3 py-4 sm:px-4 sm:space-y-6 lg:px-6">
        <div className="flex flex-col space-y-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-lg font-semibold sm:text-xl lg:text-2xl">
              Roles y Permisos
            </h1>
            <p className="mt-1 text-xs sm:text-sm">
              Gestion de roles y permisos del sistema
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="roles" className="text-xs sm:text-sm">
              Roles ({roles.length})
            </TabsTrigger>
            <TabsTrigger value="permisos" className="text-xs sm:text-sm">
              Permisos ({allPermissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <RolesTabComponent roles={roles} onDataChange={onDataChange} />
          </TabsContent>

          <TabsContent value="permisos" className="space-y-4">
            <PermisosTabComponent
              roles={roles}
              allPermissions={allPermissions}
              rolePermissions={rolePermissions}
              onDataChange={onDataChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RolesPermisosComponent;
