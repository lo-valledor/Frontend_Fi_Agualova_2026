import {
  Briefcase,
  Building,
  Building2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import type { GetContratante, NombreComuna } from "~/types/administracion";

interface ContratanteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratante: GetContratante | null;
  comunas: NombreComuna[];
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
    <div className="shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium">{label}</p>
      <div className="font-semibold text-slate-800 dark:text-slate-200 wrap-break-word">
        {value || (
          <span className="text-sm font-normal text-slate-400 italic">
            No especificado
          </span>
        )}
      </div>
    </div>
  </div>
);

export function ContratanteDetailsModal({
  isOpen,
  onClose,
  contratante,
  comunas,
}: Readonly<ContratanteDetailsModalProps>) {
  const [detailsData, setDetailsData] = useState<GetContratante | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contratante) {
      setIsLoading(true);
      setError(null);
      // Simula la carga de datos
      setTimeout(() => {
        setDetailsData(contratante);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen, contratante]);

  const nombreCompleto = detailsData?.esEmpresa
    ? detailsData.nombre
    : `${detailsData?.nombre || ""} ${detailsData?.apellido || ""}`.trim();

  const comunaNombre = detailsData?.comunaNombre
    ? comunas
        .find((c) => c.valueOf() === detailsData.comunaNombre)
        ?.valueOf() || detailsData.comuna
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl shadow-sm">
              {detailsData?.esEmpresa ? (
                <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              ) : (
                <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-linear-to-r from-orange-800 to-amber-800 dark:from-orange-200 dark:to-amber-200 bg-clip-text text-transparent">
                Detalles del Contratante
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-1">
                Información completa de {nombreCompleto || "..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                <span className="text-sm text-muted-foreground">
                  Cargando detalles del contratante...
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
            <Card className="border-orange-200/50 dark:border-orange-800/50 shadow-sm">
              <CardHeader className="bg-linear-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
                    Información de Identificación
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="RUT"
                  value={detailsData.rut}
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <Hash className="h-4 w-4" />
                    </div>
                  }
                />
                <InfoItem
                  label="Tipo"
                  value={
                    <Badge
                      variant={detailsData.esEmpresa ? "default" : "secondary"}
                    >
                      {detailsData.esEmpresa ? "Empresa" : "Persona Natural"}
                    </Badge>
                  }
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <Briefcase className="h-4 w-4" />
                    </div>
                  }
                />
                <InfoItem
                  label={detailsData.esEmpresa ? "Razón Social" : "Nombre"}
                  value={detailsData.nombre}
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <User className="h-4 w-4" />
                    </div>
                  }
                />
                {!detailsData.esEmpresa && (
                  <InfoItem
                    label="Apellido"
                    value={detailsData.apellido}
                    icon={
                      <div className="p-2 bg-background rounded-xl">
                        <User className="h-4 w-4" />
                      </div>
                    }
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200/50 dark:border-blue-800/50 shadow-sm">
              <CardHeader className="bg-linear-to-r from-blue-50/80 to-sky-50/80 dark:from-blue-900/20 dark:to-sky-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 " />
                  <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
                    Información de Contacto
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem
                  label="Persona de Contacto"
                  value={detailsData.contacto}
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <User className="h-4 w-4" />
                    </div>
                  }
                />
                <InfoItem
                  label="Teléfono"
                  value={detailsData.telefono}
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <Phone className="h-4 w-4" />
                    </div>
                  }
                />
                <InfoItem
                  label="Correo Electrónico"
                  value={detailsData.email}
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <Mail className="h-4 w-4" />
                    </div>
                  }
                />
              </CardContent>
            </Card>

            <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
              <CardHeader className="bg-linear-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
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
                    <div className="p-2 bg-background rounded-xl">
                      <MapPin className="h-4 w-4" />
                    </div>
                  }
                />
                <InfoItem
                  label="Comuna"
                  value={comunaNombre}
                  icon={
                    <div className="p-2 bg-background rounded-xl">
                      <Building className="h-4 w-4" />
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
