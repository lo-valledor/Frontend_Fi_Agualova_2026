import { LayoutList, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { VirtualDataTable } from "~/components/data-table/virtual-data-table";
import { ExportButton } from "~/components/shared/export-button";
import { ModernHeader } from "~/components/shared/modern-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { administracionService } from "~/services/administracionService";
import type {
  GetContratante,
  PropietarioModalState,
  PropietariosRow,
} from "~/types/administracion";
import {
  createInitialPropietarioModalState,
  extractPropietarioErrorMessage,
  getSyncStatusMessage,
} from "~/utils/administracion";

import { columns } from "./columns";
import { PropietarioDetailsModal } from "./detalles-propietario";
import { FilterSummary } from "./filter-summary";
import {
  type PropietarioFilters,
  PropietarioFiltersComponent,
} from "./propietario-filters";

interface PropietariosComponentProps {
  propietarios: PropietariosRow[];
  contratantes: GetContratante[];
}

interface FilterOptions {
  comunas: string[];
}

export default function PropietariosComponent({
  propietarios,
}: Readonly<PropietariosComponentProps>) {
  // Estado de datos
  const [propietariosList] = useState<PropietariosRow[]>(propietarios);
  const [detailedPropietario, setDetailedPropietario] =
    useState<PropietariosRow | null>(null);

  // Estado unificado de modales
  const [modalsState, setModalsState] = useState<PropietarioModalState>(
    createInitialPropietarioModalState(),
  );

  // Estado de sincronización
  const [isSyncing, setIsSyncing] = useState(false);

  // Estado de filtros
  const [filters, setFilters] = useState<PropietarioFilters>({
    comuna: "all",
    tieneTelefono: "all",
    tieneCelular: "all",
    tieneEmail: "all",
  });

  // Dependencias

  // Filter options from data
  const filterOptions = useMemo((): FilterOptions => {
    const comunas = [
      ...new Set(propietariosList.map((p) => p.comuna).filter(Boolean)),
    ].sort();

    return {
      comunas,
    };
  }, [propietariosList]);

  // Filtered propietarios
  const filteredPropietarios = useMemo(() => {
    return propietariosList.filter((propietario) => {
      // Filtro por comuna
      if (
        filters.comuna &&
        filters.comuna !== "all" &&
        propietario.comuna !== filters.comuna
      ) {
        return false;
      }

      // Filtro por teléfono
      if (
        filters.tieneTelefono &&
        filters.tieneTelefono !== "all" &&
        ((filters.tieneTelefono === "true" && !propietario.telefono) ||
          (filters.tieneTelefono === "false" && propietario.telefono))
      ) {
        return false;
      }

      // Filtro por celular
      if (
        filters.tieneCelular &&
        filters.tieneCelular !== "all" &&
        ((filters.tieneCelular === "true" && !propietario.celular) ||
          (filters.tieneCelular === "false" && propietario.celular))
      ) {
        return false;
      }

      // Filtro por email
      if (
        filters.tieneEmail &&
        filters.tieneEmail !== "all" &&
        ((filters.tieneEmail === "true" && !propietario.email) ||
          (filters.tieneEmail === "false" && propietario.email))
      ) {
        return false;
      }

      return true;
    });
  }, [propietariosList, filters]);

  // Filter stats
  const filterStats = useMemo(() => {
    const total = propietariosList.length;
    const filtered = filteredPropietarios.length;
    const activeFilters = Object.values(filters).filter(
      (value) => value !== "" && value !== "all",
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0,
    };
  }, [propietariosList.length, filteredPropietarios.length, filters]);

  // Export columns
  const propietarioColumns = [
    { header: "RUT", key: "rut" },
    { header: "Nombre", key: "nombre" },
    { header: "Comuna", key: "comuna" },
    { header: "Teléfono", key: "telefono" },
    { header: "Celular", key: "celular" },
    { header: "Email", key: "email" },
  ];

  const handleDetailsPropietario = useCallback(
    (propietario: PropietariosRow) => {
      setDetailedPropietario(propietario);
      setModalsState((prev) => ({
        ...prev,
        details: { isOpen: true },
      }));
    },
    [],
  );

  const handleSyncPropietarios = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await administracionService.sincronizarPropietarios();

      // Early return: validar respuesta con error
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Mostrar éxito y recargar
      if (result.data) {
        toast.success(
          `${result.data.mensaje} (${result.data.registrosAfectados} registros afectados)`,
        );
        globalThis.location.reload();
      }
    } catch (error) {
      const errorInfo = extractPropietarioErrorMessage(
        error,
        "Error al sincronizar propietarios",
      );
      toast.error(errorInfo.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const alreadySynced =
      sessionStorage.getItem("propietariosSyncDone") === "true";
    if (!alreadySynced) {
      // Marcar antes de iniciar para evitar reentradas en caso de reload
      sessionStorage.setItem("propietariosSyncDone", "true");
      void handleSyncPropietarios();
    }
  }, [handleSyncPropietarios]);

  const handleFiltersChange = useCallback((newFilters: PropietarioFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      comuna: "all",
      tieneTelefono: "all",
      tieneCelular: "all",
      tieneEmail: "all",
    });
  }, []);

  const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <header>
          <ModernHeader
            title="Propietarios"
            description="Gestiona los propietarios del sistema"
            actions={
              <div className="flex gap-2">
                <ExportButton
                  data={filteredPropietarios}
                  columns={propietarioColumns}
                  filename="propietarios"
                  size="sm"
                />
                <Button
                  onClick={handleSyncPropietarios}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                  disabled={isSyncing}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {getSyncStatusMessage(isSyncing)}
                </Button>
              </div>
            }
          />
          <div className="industrial-divider mt-4" />
        </header>

        <PropietarioFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />

        <FilterSummary
          totalPropietarios={propietariosList.length}
          filteredPropietarios={filteredPropietarios.length}
          activeFilters={filterStats.activeFilters}
          isFiltered={filterStats.isFiltered}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <LayoutList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Propietarios
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {filteredPropietarios.length} propietario
                    {filteredPropietarios.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="p-4">
              <div className="overflow-x-auto -mx-1">
                <VirtualDataTable
                  columns={columns({
                    onDetails: handleDetailsPropietario,
                  })}
                  data={filteredPropietarios}
                  searchPlaceholder="Buscar por RUT, nombre o email..."
                  estimateRowHeight={60}
                  maxHeight="600px"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de detalles del propietario */}
        <PropietarioDetailsModal
          isOpen={modalsState.details.isOpen}
          onClose={() =>
            setModalsState((prev) => ({
              ...prev,
              details: { isOpen: false },
            }))
          }
          propietario={detailedPropietario}
        />
      </div>
    </div>
  );
}
