import { Shield } from 'lucide-react';
import React from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { Roles } from '~/types/roles-permisos';

import { createRolesColumns } from './columns/roles-columns';

interface RolesTabComponentProps {
  roles: Roles[];
  onDataChange?: () => void;
}

const RolesTabComponent: React.FC<RolesTabComponentProps> = ({ roles }) => {
  const rolesColumns = createRolesColumns();

  return (
    <Card className="border-0 bg-background shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg">
            Roles del Sistema
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            <Shield className="mr-2 h-3.5 w-3.5" />
            {roles.length} rol{roles.length === 1 ? '' : 'es'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative p-0 sm:p-4">
        <div className="overflow-x-auto">
          <div className="min-w-full p-3 sm:p-0">
            <DataTable columns={rolesColumns} data={roles} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RolesTabComponent;
