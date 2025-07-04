import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Hash,
  Briefcase,
  Store,
  Building,
  Loader2,
  XCircle,
  MapPinned,
} from 'lucide-react';
import type { GetClientesByRut } from '~/types/administracion';

interface ClienteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: GetClientesByRut | null;
}

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </p>
      <div className="font-semibold text-slate-800 dark:text-slate-200 break-words">
        {value || (
          <span className="text-sm font-normal text-slate-400 italic">
            No especificado
          </span>
        )}
      </div>
    </div>
  </div>
);

export function ClienteDetailsModal({
  isOpen,
  onClose,
  cliente,
}: ClienteDetailsModalProps) {
  const [detailsData, setDetailsData] = useState<GetClientesByRut | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cliente) {
      setIsLoading(true);
      setError(null);
      // Simula la carga de datos, como en el modal de contratos
      setTimeout(() => {
        setDetailsData(cliente);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen, cliente]);

  const nombreCompleto = detailsData?.esEmpresa
    ? detailsData.nombre
    : `${detailsData?.nombre || ''} ${detailsData?.apellido || ''}`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 rounded-xl shadow-sm">
              {detailsData?.esEmpresa ? (
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-sky-800 dark:from-blue-200 dark:to-sky-200 bg-clip-text text-transparent">
                Detalles del Cliente
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-1">
                Información completa de {nombreCompleto || '...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                <span className="text-sm text-muted-foreground">
                  Cargando detalles del cliente...
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-medium text-rose-800 dark:text-rose-200">
                Error al cargar
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          </div>
        ) : detailsData ? (
          <div className="space-y-6">
            <Card className="border-blue-200/50 dark:border-blue-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-sky-50/80 dark:from-blue-900/20 dark:to-sky-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
                    Información de Contacto
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="RUT"
                  value={detailsData.rut}
                  icon={
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                      <Hash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  }
                />
                <InfoItem
                  label="Tipo"
                  value={
                    <Badge variant={detailsData.esEmpresa ? 'default' : 'secondary'}>
                      {detailsData.esEmpresa ? 'Empresa' : 'Persona Natural'}
                    </Badge>
                  }
                  icon={
                     <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                       <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                     </div>
                  }
                />
                <InfoItem
                  label="Persona de Contacto"
                  value={detailsData.contacto}
                  icon={
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  }
                />
                <InfoItem
                  label="Teléfono"
                  value={detailsData.telefono}
                  icon={
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                      <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  }
                />
                <InfoItem
                  label="Correo Electrónico"
                  value={detailsData.correo}
                  icon={
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                      <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  }
                />
              </CardContent>
            </Card>

            <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">
                    Información de Ubicación
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="Dirección"
                  value={detailsData.direccion}
                  icon={
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  }
                />
                <InfoItem
                  label="Comuna"
                  value={detailsData.comuna}
                  icon={
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                      <Building className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  }
                />
              </CardContent>
            </Card>

            {detailsData.esEmpresa && (
              <Card className="border-violet-200/50 dark:border-violet-800/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/20 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <CardTitle className="text-lg text-violet-800 dark:text-violet-200">
                      Información Comercial
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem
                    label="Código de Giro"
                    value={detailsData.codigoGiro}
                    icon={
                      <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                        <Hash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                    }
                  />
                  <InfoItem
                    label="Giro Comercial"
                    value={detailsData.giro}
                    icon={
                      <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                        <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                    }
                  />
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
