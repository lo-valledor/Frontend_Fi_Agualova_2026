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
import { administracionService } from '~/services/administracionService';
import type { GetUserById, Usuarios } from '~/types/administracion';

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
  const [userDetail, setUserDetail] = useState<GetUserById | null>(null);
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
      const result = await administracionService.getUserById(user.id);

      if (result.error || !result.data) {
        throw new Error(result.error || 'No fue posible obtener el usuario');
      }

      setUserDetail(result.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al obtener los permisos del usuario';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const permisos = userDetail?.permisos ?? [];

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
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold">Módulo</TableHead>
                    <TableHead className="text-center font-semibold">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permisos.map(permiso => (
                    <TableRow key={permiso.id}>
                      <TableCell className="font-medium">
                        {permiso.nombre}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {permiso.descripcion}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {permiso.modulo}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionBadge hasPermission={true} />
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
