'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  IdCard,
  UserCheck,
  Hash,
  CheckCircle,
  XCircle,
  Loader2,
  Briefcase,
} from 'lucide-react';
import type { GetClientes, GetClientesByRut } from '~/types/administracion';
import { useAdministracion } from '~/hooks/use-administracion';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: GetClientes | null;
}

export function ClientDetailsModal({
  isOpen,
  onClose,
  client,
}: ClientDetailsModalProps) {
  const [detailsData, setDetailsData] = useState<GetClientesByRut | null>(null);
  const { fetchClienteByRut, loadingState } = useAdministracion();

  const isLoading = loadingState.fetchClienteByRut?.isLoading || false;
  const error = loadingState.fetchClienteByRut?.error;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!client || !isOpen) {
        setDetailsData(null);
        return;
      }

      try {
        const data = await fetchClienteByRut(client.rut);
        setDetailsData(data);
      } catch (err) {
        console.error('Error fetching client details:', err);
        setDetailsData(null);
      }
    };

    fetchDetails();
  }, [isOpen, client, fetchClienteByRut]);

  const formatRut = (rut: string) => {
    if (!rut) return 'No especificado';
    const cleanRut = rut.replace(/[^\dKk]/g, '');
    if (cleanRut.length < 2) return rut;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedBody}-${dv}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl shadow-sm">
              {client?.esEmpresa ? (
                <Building className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-800 to-green-800 dark:from-emerald-200 dark:to-green-200 bg-clip-text text-transparent">
                Detalles del Cliente
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-1">
                Información completa del cliente {client?.nombreCompleto}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
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
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
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
                {error.message || 'Error al cargar los detalles del cliente'}
              </p>
            </div>
          </div>
        ) : detailsData ? (
          <div className="space-y-6">
            {/* Información básica del cliente */}
            <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  {detailsData.esEmpresa ? (
                    <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">
                    Información del Cliente
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <IdCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        RUT
                      </p>
                      <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatRut(detailsData.rut)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Tipo de Cliente
                      </p>
                      <Badge
                        className={
                          detailsData.esEmpresa
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }
                      >
                        {detailsData.esEmpresa ? (
                          <>
                            <Building className="w-3 h-3 mr-1" />
                            Empresa
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Persona Natural
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Nombre Completo
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {detailsData.esEmpresa
                          ? detailsData.nombre
                          : `${detailsData.nombre} ${detailsData.apellido}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de ubicación */}
            <Card className="border-violet-200/50 dark:border-violet-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <CardTitle className="text-lg text-violet-800 dark:text-violet-200">
                    Información de Ubicación
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Dirección
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {detailsData.direccion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Comuna
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {detailsData.comuna}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <Hash className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Código Comuna
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-mono text-xs"
                      >
                        {detailsData.codComuna}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de contacto */}
            <Card className="border-blue-200/50 dark:border-blue-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
                    Información de Contacto
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailsData.contacto && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Persona de Contacto
                        </p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {detailsData.contacto}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsData.telefono && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                        <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Teléfono
                        </p>
                        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                          {detailsData.telefono}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsData.correo && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Correo Electrónico
                        </p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {detailsData.correo}
                        </p>
                      </div>
                    </div>
                  )}

                  {!detailsData.contacto &&
                    !detailsData.telefono &&
                    !detailsData.correo && (
                      <div className="md:col-span-2 text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No hay información de contacto disponible
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Información comercial */}
            <Card className="border-amber-200/50 dark:border-amber-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                    Información Comercial
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <Hash className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Código de Giro
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 font-mono"
                      >
                        {detailsData.codigoGiro}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Actividad Económica
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {detailsData.giro}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
