import { Check, Eye, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import api from '~/lib/api';
import type { PermisoUsuario, Usuarios } from '~/types/administracion';

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuarios | null;
}

export function UserPermissionsModal({
  isOpen,
  onClose,
  user
}: UserPermissionsModalProps) {
  const [permisos, setPermisos] = useState<PermisoUsuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchPermisos();
    }
  }, [isOpen, user]);

  const fetchPermisos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.get<PermisoUsuario[]>(
        `/ObtenerPermisoUsuario/${user.idUsuario}`
      );
      setPermisos(response.data as PermisoUsuario[]);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Error al obtener los permisos del usuario'
      );
    } finally {
      setLoading(false);
    }
  };

  const PermissionBadge = ({ hasPermission }: { hasPermission: boolean }) => {
    return hasPermission ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <Check className="h-3 w-3" />
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <X className="h-3 w-3" />
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-sky-900 dark:text-sky-100">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            Permisos de Usuario
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {user && (
              <span>
                Visualizando permisos de{' '}
                <span className="font-semibold">
                  {user.nombres} {user.apellidos}
                </span>{' '}
                (@{user.nombreDeUsuario})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
          ) : permisos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                No hay permisos asignados a este usuario
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Menú</TableHead>
                    <TableHead className="font-semibold">Ruta</TableHead>
                    <TableHead className="text-center font-semibold">
                      Ver
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Crear
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Editar
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Eliminar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permisos.map(permiso => (
                    <TableRow key={permiso.idMenu}>
                      <TableCell className="font-medium">
                        {permiso.nombreMenu}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {permiso.ruta}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionBadge hasPermission={permiso.puedeVer} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionBadge hasPermission={permiso.puedeCrear} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionBadge
                            hasPermission={permiso.puedeEditar}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionBadge
                            hasPermission={permiso.puedeEliminar}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {!loading && permisos.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Total de permisos: {permisos.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
