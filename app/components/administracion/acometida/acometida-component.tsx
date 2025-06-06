import React, { useState, useMemo } from "react";
import { DataTable } from "~/components/data-table/data-table";
import type {
  Acometida,
  ComboSectores,
  ComboNichos,
  ComboEmpalmes,
  ContratosDisponibles,
} from "~/types/administracion";
import { columns } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Zap,
  RefreshCw,
  SearchIcon,
  Gauge,
  Network,
  FileText,
} from "lucide-react";
import { AcometidaForm } from "./acometida-form";

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles,
}: {
  acometidas: Acometida[];
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  comboSectores: ComboSectores[];
  contratosDisponibles: ContratosDisponibles[];
}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Estado para modal de acometida
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [acometidaSeleccionada, setAcometidaSeleccionada] =
    useState<Acometida | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar acometidas en tiempo real
  const filteredAcometidas = useMemo(() => {
    if (!searchTerm) return acometidas;

    return acometidas.filter((acometida) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        acometida.acometidaId.toString().includes(searchLower) ||
        acometida.codigo.toLowerCase().includes(searchLower) ||
        acometida.ubicacion.toLowerCase().includes(searchLower) ||
        acometida.contratoId.toLowerCase().includes(searchLower) ||
        acometida.empalmeDescripcion.toLowerCase().includes(searchLower) ||
        acometida.nichoDescripcion.toLowerCase().includes(searchLower) ||
        acometida.sectorDescripcion.toLowerCase().includes(searchLower) ||
        acometida.numeroMedidor.toLowerCase().includes(searchLower)
      );
    });
  }, [acometidas, searchTerm]);

  // Estadísticas de acometidas
  const totalAcometidas = acometidas.length;
  const acometidasConLimite = acometidas.filter(
    (a) => a.limitePotencia !== null && a.limitePotencia > 0
  ).length;
  const acometidasSinLimite = acometidas.filter(
    (a) => a.limitePotencia === null || a.limitePotencia === 0
  ).length;

  // Sectores únicos
  const sectoresUnicos = [
    ...new Set(acometidas.map((a) => a.sectorDescripcion)),
  ].length;

  // Promedio de límite de potencia
  const promedioLimitePotencia =
    acometidas
      .filter((a) => a.limitePotencia !== null && a.limitePotencia > 0)
      .reduce((sum, a) => sum + (a.limitePotencia || 0), 0) /
      acometidasConLimite || 0;

  // Handlers para abrir/cerrar modal
  const handleOpenForm = (acometida?: Acometida) => {
    setAcometidaSeleccionada(acometida || null);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setAcometidaSeleccionada(null);
    setIsFormOpen(false);
  };

  // Handler para submit (simulación, reemplazar por lógica real)
  const handleSubmitForm = async (data: any) => {
    setIsLoading(true);
    try {
      // Aquí deberías llamar a tu lógica de crear/editar acometida
      console.log("Datos enviados:", data);
      // await modificarAcometidaExisten(data) o similar
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh - en una app real esto triggearía el refetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Gestión de Acometidas
          </h1>
          <p className="text-muted-foreground">
            Administra acometidas eléctricas, empalmes y ubicaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalAcometidas} acometidas
          </Badge>
        </div>
      </div>

      {/* Botón para registrar acometida */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => handleOpenForm()}
          className="gap-2 bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-900/20 dark:hover:bg-sky-800/20"
        >
          <Zap className="h-4 w-4" /> Registrar acometida
        </Button>
      </div>
      {/* Modal de registro/edición */}
      <AcometidaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        acometida={acometidaSeleccionada}
        isLoading={isLoading}
        comboEmpalmes={comboEmpalmes}
        comboNichos={comboNichos}
        contratosDisponibles={contratosDisponibles}
      />

      {/* Tabla de acometidas */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <Zap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Acometidas
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredAcometidas.length > 0
                    ? `${filteredAcometidas.length} acometidas ${
                        searchTerm ? "filtradas" : "registradas"
                      } en el sistema`
                    : "No hay acometidas registradas"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="gap-2 hover:bg-muted/50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {acometidas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <Zap className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay acometidas disponibles
                </p>
                <p className="text-sm mt-1">
                  Las acometidas aparecerán aquí cuando estén disponibles
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="🔍 Buscar por código, ubicación, contrato, nicho, sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredAcometidas.length} de {acometidas.length}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {filteredAcometidas.length} acometidas{" "}
                    {searchTerm
                      ? `encontradas de ${acometidas.length} total`
                      : "disponibles"}
                  </span>
                </div>
              </div>

              <DataTable columns={columns} data={filteredAcometidas} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
