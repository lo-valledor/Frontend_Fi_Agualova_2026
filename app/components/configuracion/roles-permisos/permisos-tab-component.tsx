import { Save, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type {
  Permisos,
  Roles,
  UpdateRolePermissions
} from '~/types/roles-permisos';

interface RolePermissionsEntry {
  roleId: string;
  permisos: Permisos[];
}

interface PermisosTabComponentProps {
  roles: Roles[];
  allPermissions: Permisos[];
  rolePermissions: RolePermissionsEntry[];
  onDataChange?: () => void;
}

const PermisosTabComponent: React.FC<PermisosTabComponentProps> = ({
  roles,
  allPermissions,
  rolePermissions,
  onDataChange
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    roles[0]?.id ?? ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingRolePermissions, setPendingRolePermissions] = useState<
    Record<string, Permisos[]>
  >({});

  const currentPermissions = useMemo(() => {
    const pending = pendingRolePermissions[selectedRoleId];

    if (pending) {
      return pending;
    }

    return (
      rolePermissions.find(entry => entry.roleId === selectedRoleId)
        ?.permisos ?? []
    );
  }, [pendingRolePermissions, rolePermissions, selectedRoleId]);

  const filteredPermissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return allPermissions;
    }

    return allPermissions.filter(permission => {
      return (
        permission.nombre.toLowerCase().includes(term) ||
        permission.descripcion.toLowerCase().includes(term) ||
        permission.modulo.toLowerCase().includes(term)
      );
    });
  }, [allPermissions, searchTerm]);

  const currentPermissionIds = useMemo(() => {
    return new Set(currentPermissions.map(permission => permission.id));
  }, [currentPermissions]);

  const hasPendingChanges = Boolean(pendingRolePermissions[selectedRoleId]);

  const handleTogglePermission = (permission: Permisos, checked: boolean) => {
    const nextPermissions = checked
      ? [...currentPermissions, permission]
      : currentPermissions.filter(item => item.id !== permission.id);

    const originalPermissions =
      rolePermissions.find(entry => entry.roleId === selectedRoleId)
        ?.permisos ?? [];

    const originalIds = new Set(originalPermissions.map(item => item.id));
    const nextIds = new Set(nextPermissions.map(item => item.id));

    const isSameAsOriginal =
      originalIds.size === nextIds.size &&
      Array.from(nextIds).every(id => originalIds.has(id));

    setPendingRolePermissions(prev => {
      if (isSameAsOriginal) {
        const updated = { ...prev };
        delete updated[selectedRoleId];
        return updated;
      }

      return {
        ...prev,
        [selectedRoleId]: nextPermissions
      };
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      toast.error('Debe seleccionar un rol');
      return;
    }

    const permisos = pendingRolePermissions[selectedRoleId];

    if (!permisos) {
      toast.info('No hay cambios pendientes para guardar');
      return;
    }

    setIsSaving(true);

    try {
      const payload: UpdateRolePermissions[] = [
        {
          roleId: selectedRoleId,
          permisos
        }
      ];

      const result = await rolesPermisosService.updateRolePermissions(
        selectedRoleId,
        payload
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Permisos actualizados exitosamente');
      setPendingRolePermissions(prev => {
        const updated = { ...prev };
        delete updated[selectedRoleId];
        return updated;
      });
      onDataChange?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error inesperado al actualizar permisos'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (roles.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-background backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p>No hay roles disponibles para configurar permisos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-background backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg">
            Asignacion de Permisos por Rol
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={!hasPendingChanges || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <Button
                key={role.id}
                variant={selectedRoleId === role.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRoleId(role.id)}
              >
                {role.name}
              </Button>
            ))}
          </div>

          <div className="relative sm:ml-auto sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Buscar permisos..."
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          <span>
            Rol seleccionado:{' '}
            <strong>
              {roles.find(role => role.id === selectedRoleId)?.name}
            </strong>
          </span>
          <Badge variant="outline">
            {currentPermissions.length} permiso
            {currentPermissions.length === 1 ? '' : 's'}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredPermissions.map(permission => {
            const checked = currentPermissionIds.has(permission.id);

            return (
              <label
                key={permission.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={value =>
                    handleTogglePermission(permission, value === true)
                  }
                  className="mt-0.5"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{permission.nombre}</span>
                    <Badge variant="secondary">{permission.modulo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {permission.descripcion}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {filteredPermissions.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No se encontraron permisos para la busqueda actual.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PermisosTabComponent;
