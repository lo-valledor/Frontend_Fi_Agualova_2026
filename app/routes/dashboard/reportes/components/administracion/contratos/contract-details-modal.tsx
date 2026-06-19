import {
  Building,
  Calendar,
  CheckCircle,
  FileText,
  Gauge,
  Hash,
  Loader2,
  MapPin,
  Settings,
  Shield,
  User,
  XCircle,
  Zap
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import type {
  ContratosDisponiblesPorId,
  GetContratos
} from '~/types/administracion';

interface ContractDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: GetContratos | null;
}

export function ContractDetailsModal({
  isOpen,
  onClose,
  contract
}: ContractDetailsModalProps) {
  const [detailsData, setDetailsData] =
    useState<ContratosDisponiblesPorId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!contract) return;

      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock detailed data based on contract
        const mockDetails: ContratosDisponiblesPorId = {
          tipoContrato: contract.tipoContrato,
          tarifa: contract.tarifa,
          nombrePropietario: contract.nombrePropietario,
          rutPropietario: '12.345.678-9',
          nombreCliente: contract.nombreCliente,
          rutCliente: '98.765.432-1',
          localId: 'LOC001',
          codigoLocal: contract.local,
          fechaInicio: contract.fechaInicio,
          activoTexto: contract.activo ? 'Activo' : 'Inactivo',
          fechaTermino: contract.fechaTermino,
          direccion: contract.direccionEnvio,
          codigoComuna: '001',
          limiteInvierno: contract.limiteInvierno,
          cicloFacturacion: contract.cicloFacturacion,
          potenciaContratada: contract.potenciaContratada,
          comunaNombre: contract.comunaEnvio,
          esMadreTexto: 'No',
          codigoContratoMadre: '',
          lugarEntrega: contract.direccionEnvio,
          liberadoCorteTexto: contract.liberadoCorte ? 'Sí' : 'No'
        };

        setDetailsData(mockDetails);
      } catch (err) {
        console.error('Error al cargar los detalles del contrato:', err);
        setError('Error al cargar los detalles del contrato');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && contract) {
      fetchDetails();
    }
  }, [isOpen, contract]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatRut = (rut: string) => {
    if (!rut) return 'No especificado';
    const cleanRut = rut.replace(/[^\dKk]/g, '');
    if (cleanRut.length < 2) return rut;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedBody}-${dv}`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              <span className="text-sm text-muted-foreground">
                Cargando detalles del contrato...
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full">
            <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-medium text-rose-800 dark:text-rose-200">
              Error al cargar
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        </div>
      );
    }

    if (!detailsData) {
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Información básica del contrato */}
        <Card className="border-sky-200/50 dark:border-sky-800/50 shadow-sm">
          <CardHeader className="bg-linear-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/20 dark:to-blue-900/20 rounded-t-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg text-sky-800 dark:text-sky-200">
                Información del Contrato
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Tipo de Contrato</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailsData.tipoContrato}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Tarifa</p>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                  >
                    {detailsData.tarifa}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Estado</p>
                  <Badge
                    variant={
                      detailsData.activoTexto === 'Activo'
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      detailsData.activoTexto === 'Activo'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
                    }
                  >
                    {detailsData.activoTexto}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Gauge className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Potencia Contratada</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailsData.potenciaContratada}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de personas */}
        <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
          <CardHeader className="bg-linear-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">
                Información de Personas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Propietario
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Nombre
                    </p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {detailsData.nombrePropietario}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      RUT
                    </p>
                    <p className="font-mono text-sm font-medium">
                      {formatRut(detailsData.rutPropietario)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <User className="h-4 w-4 " />
                  </div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Cliente
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium ">Nombre</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {detailsData.nombreCliente}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium ">RUT</p>
                    <p className="font-mono text-sm font-medium">
                      {formatRut(detailsData.rutCliente)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de ubicación */}
        <Card className="border-violet-200/50 dark:border-violet-800/50 shadow-sm">
          <CardHeader className="bg-linear-to-r from-violet-50/80 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/20 rounded-t-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <CardTitle className="text-lg text-violet-800 dark:text-violet-200">
                Información de Ubicación
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                  <Hash className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">ID Local</p>
                  <p className="font-mono text-sm font-medium">
                    {detailsData.localId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                  <Building className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Código Local</p>
                  <p className="font-mono text-sm font-medium">
                    {detailsData.codigoLocal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <MapPin className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Dirección</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {detailsData.direccion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Comuna</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {detailsData.comunaNombre} ({detailsData.codigoComuna})
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de fechas y configuración */}
        <Card className="border-amber-200/50 dark:border-amber-800/50 shadow-sm">
          <CardHeader className="bg-linear-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                Configuración y Fechas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                  <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Fecha de Inicio</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(detailsData.fechaInicio)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Fecha de Término</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(detailsData.fechaTermino)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Calendar className="h-4 w-4 " />
                </div>
                <div>
                  <p className="text-xs font-medium">Ciclo de Facturación</p>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  >
                    {detailsData.cicloFacturacion}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Gauge className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Límite Invierno</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {detailsData.limiteInvierno.toLocaleString('es-CL')} kWh
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Liberado de Corte</p>
                  <Badge
                    variant={
                      detailsData.liberadoCorteTexto === 'Sí'
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      detailsData.liberadoCorteTexto === 'Sí'
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
                    }
                  >
                    {detailsData.liberadoCorteTexto}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">¿Es Madre?</p>
                  <Badge
                    variant={
                      detailsData.esMadreTexto === 'Sí'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {detailsData.esMadreTexto}
                  </Badge>
                </div>
              </div>
            </div>

            {detailsData.codigoContratoMadre && (
              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Código Contrato Madre</p>
                    <p className="font-mono text-sm font-medium">
                      {detailsData.codigoContratoMadre}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-linear-to-r from-sky-800 to-blue-800 dark:from-sky-200 dark:to-blue-200 bg-clip-text text-transparent">
                Detalles del Contrato
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-1">
                Información completa del contrato {contract?.codigoContrato}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
