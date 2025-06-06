import React, { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { Separator } from '~/components/ui/separator'
import { Skeleton } from '~/components/ui/skeleton'
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Building,
  Zap,
  Shield,
  Gauge,
  CreditCard,
  Phone,
  Home,
  Loader2,
  CheckCircle,
  XCircle,
  Hash,
  Settings
} from 'lucide-react'
import type { ContratosDisponiblesPorId } from '~/types/administracion';
import api from '~/lib/api';

export default function DetallesContrato({ codigoContrato }: { codigoContrato: string }) {
  const [data, setData] = useState<ContratosDisponiblesPorId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/contrato/${codigoContrato}`);
        setData(response.data as ContratosDisponiblesPorId);
      } catch (err) {
        setError('Error al cargar los detalles del contrato');
        console.error('Error fetching contract details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (codigoContrato) {
      fetchData();
    }
  }, [codigoContrato]);

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
    // Formatear RUT chileno (agregar puntos y guión)
    const cleanRut = rut.replace(/[^\dKk]/g, '');
    if (cleanRut.length < 2) return rut;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedBody}-${dv}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/50">
          <FileText className="h-3 w-3" />
          Detalles
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      <SheetHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl shadow-sm">
              <FileText className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-sky-800 to-blue-800 dark:from-sky-200 dark:to-blue-200 bg-clip-text text-transparent">
                Detalles del Contrato
              </SheetTitle>
              <SheetDescription className="text-base text-muted-foreground mt-1">
                Información completa del contrato {codigoContrato}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                <span className="text-sm text-muted-foreground">Cargando detalles del contrato...</span>
              </div>
            </div>

            {/* Skeleton loading */}
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
              <h3 className="font-medium text-rose-800 dark:text-rose-200">Error al cargar</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Información básica del contrato */}
            <Card className="border-sky-200/50 dark:border-sky-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/20 dark:to-blue-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <CardTitle className="text-lg text-sky-800 dark:text-sky-200">
                    Información del Contrato
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tipo de Contrato</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{data.tipoContrato}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tarifa</p>
                      <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                        {data.tarifa}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Estado</p>
                      <Badge variant={data.activoTexto === 'Activo' ? 'default' : 'secondary'}
                             className={data.activoTexto === 'Activo'
                               ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                               : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
                             }>
                        {data.activoTexto}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Gauge className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Potencia Contratada</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{data.potenciaContratada}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de personas */}
            <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">
                    Información de Personas
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Propietario */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Propietario</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Nombre</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{data.nombrePropietario}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">RUT</p>
                      <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{formatRut(data.rutPropietario)}</p>
                    </div>
                  </div>
                </div>

                {/* Cliente */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Cliente</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Nombre</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{data.nombreCliente}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">RUT</p>
                      <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{formatRut(data.rutCliente)}</p>
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
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <Hash className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">ID Local</p>
                      <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{data.localId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <Building className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Código Local</p>
                      <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{data.codigoLocal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Dirección</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{data.direccion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Home className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Comuna</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{data.comunaNombre} ({data.codigoComuna})</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Lugar de Entrega</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{data.lugarEntrega}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de fechas y configuración */}
            <Card className="border-amber-200/50 dark:border-amber-800/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg">
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
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Fecha de Inicio</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(data.fechaInicio)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Fecha de Término</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(data.fechaTermino)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Ciclo de Facturación</p>
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {data.cicloFacturacion}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Gauge className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Límite Invierno</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{data.limiteInvierno.toLocaleString('es-CL')} kWh</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">¿Es Madre?</p>
                      <Badge variant={data.esMadreTexto === 'Sí' ? 'default' : 'secondary'}>
                        {data.esMadreTexto}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Liberado de Corte</p>
                      <Badge variant={data.liberadoCorteTexto === 'Sí' ? 'default' : 'secondary'}
                             className={data.liberadoCorteTexto === 'Sí'
                               ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                               : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
                             }>
                        {data.liberadoCorteTexto}
                      </Badge>
                    </div>
                  </div>
                </div>

                {data.codigoContratoMadre && (
                  <div className="pt-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Código Contrato Madre</p>
                        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{data.codigoContratoMadre}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
