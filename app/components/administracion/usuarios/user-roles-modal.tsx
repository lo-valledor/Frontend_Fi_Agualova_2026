import { Check, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { Usuarios } from '~/types/administracion';
import type { Roles } from '~/types/roles-permisos';

interface UserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: Usuarios | null;
}

export function UserRolesModal({
  isOpen,
  onClose,
  onSuccess,
  user
}: UserRolesModalProps) {
  const [availableRoles, setAvailableRoles] = useState<Roles[]>([]);
  const [userRoles, setUserRoles] = useState<Roles[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Obtener todos los roles disponibles
      const rolesResponse = await rolesPermisosService.getRoles();
      if (rolesResponse.error) {
        throw new Error(rolesResponse.error);
      }

      // Obtener roles actuales del usuario
      const userRolesResponse = await rolesPermisosService.getRolesUsuario(
        String(user.id)
      );
      if (userRolesResponse.error) {
        throw new Error(userRolesResponse.error);
      }

      const allRoles = rolesResponse.data || [];
      const currentUserRoles = userRolesResponse.data || [];

      setAvailableRoles(allRoles);
      setUserRoles(currentUserRoles);

      // Pre-seleccionar los roles actuales del usuario
      const currentRoleIds = new Set(currentUserRoles.map(role => role.idRol));
      setSelectedRoleIds(currentRoleIds);
    } catch (error: any) {
      toast.error(error.message || 'Error al obtener la información de roles');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const currentRoleIds = new Set(userRoles.map(role => role.idRol));
      const newSelectedRoleIds = selectedRoleIds;

      // Roles a agregar
      const rolesToAdd = Array.from(newSelectedRoleIds).filter(
        id => !currentRoleIds.has(id)
      );

      // Roles a quitar
      const rolesToRemove = Array.from(currentRoleIds).filter(
        id => !newSelectedRoleIds.has(id)
      );
      // Asignar roles nuevos
      if (rolesToAdd.length > 0) {
        const response = await rolesPermisosService.asignarRolesUsuario(
          String(user.id),
          { roles: rolesToAdd }
        );

        if (response.error) {
          throw new Error(response.error);
        }
      }

      // Quitar roles removidos
      for (const roleId of rolesToRemove) {
        const response = await rolesPermisosService.quitarRolUsuario(
          String(user.id),
          roleId
        );

        if (response.error) {
          throw new Error(response.error);
        }
      }

      toast.success('Roles actualizados exitosamente');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ DEBUG - Error completo:', error);
      console.error('❌ DEBUG - Error response:', error.response);
      console.error('❌ DEBUG - Error data:', error.response?.data);

      const errorMessage =
        error.response?.data?.title ||
        error.response?.data?.message ||
        error.message ||
        'Error al actualizar los roles';

      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    const currentRoleIds = new Set(userRoles.map(role => role.idRol));
    if (currentRoleIds.size !== selectedRoleIds.size) return true;

    for (const id of selectedRoleIds) {
      if (!currentRoleIds.has(id)) return true;
    }
    return false;
  };

  const getRoleStatus = (
    roleId: number
  ): 'current' | 'new' | 'removed' | 'none' => {
    const wasCurrent = userRoles.some(role => role.idRol === roleId);
    const isSelected = selectedRoleIds.has(roleId);

    if (wasCurrent && isSelected) return 'current';
    if (!wasCurrent && isSelected) return 'new';
    if (wasCurrent && !isSelected) return 'removed';
    return 'none';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-sky-900 dark:text-sky-100">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            Gestionar Roles de Usuario
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {user && (
              <span>
                Asigna o quita roles para{' '}
                <span className="font-semibold">
                  {user.nombre_Usuario} {user.apellidos_Usuario}
                </span>{' '}
                (@{user.userName})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
          ) : availableRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                No hay roles disponibles en el sistema
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-12"></TableHead>
                    <TableHead className="font-semibold">Rol</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold text-center">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableRoles
                    .filter(role => role.estadoRol) // Solo mostrar roles activos
                    .map(role => {
                      const status = getRoleStatus(role.idRol);
                      return (
                        <TableRow
                          key={role.idRol}
                          className={
                            status === 'removed'
                              ? 'bg-red-50/50 dark:bg-red-950/20'
                              : status === 'new'
                                ? 'bg-green-50/50 dark:bg-green-950/20'
                                : ''
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedRoleIds.has(role.idRol)}
                              onCheckedChange={() =>
                                handleToggleRole(role.idRol)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {role.nombreRol}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {role.descripcion || 'Sin descripción'}
                          </TableCell>
                          <TableCell className="text-center">
                            {status === 'current' && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <Check className="h-3 w-3 mr-1" />
                                Asignado
                              </Badge>
                            )}
                            {status === 'new' && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Nuevo
                              </Badge>
                            )}
                            {status === 'removed' && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                <X className="h-3 w-3 mr-1" />
                                Se quitará
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {!loading && availableRoles.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>
                Roles seleccionados: {selectedRoleIds.size} de{' '}
                {availableRoles.filter(r => r.estadoRol).length}
              </span>
              {hasChanges() && (
                <Badge variant="outline" className="text-amber-600">
                  Hay cambios sin guardar
                </Badge>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges() || saving || loading}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
