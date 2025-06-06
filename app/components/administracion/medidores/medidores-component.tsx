import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "~/components/data-table/data-table";
import { createColumns } from "./columns";
import { MedidorForm } from "./medidor-form";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
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
  Gauge,
  Plus,
  RefreshCw,
  SearchIcon,
  Activity,
  Hash,
  Building,
  Download,
  FileText,
  Zap,
} from "lucide-react";
import type {
  BuscarMedidores,
  CrearMedidorProps,
  ActualizarMedidorProps,
} from "~/types/administracion";
import { toast } from "sonner";

export default function MedidoresComponent({
  medidores,
}: {
  medidores: BuscarMedidores[];
}) {
  // Estados para modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedidor, setSelectedMedidor] =
    useState<BuscarMedidores | null>(null);
  const [medidorToDelete, setMedidorToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filtrar medidores en tiempo real
  const filteredMedidores = useMemo(() => {
    if (!searchTerm) return medidores;

    return medidores.filter((medidor) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        medidor.codigo.toString().includes(searchLower) ||
        medidor.marca.toLowerCase().includes(searchLower) ||
        medidor.tipo.toLowerCase().includes(searchLower) ||
        medidor.modelo.toLowerCase().includes(searchLower) ||
        medidor.serie.toLowerCase().includes(searchLower) ||
        medidor.ubicacion.toLowerCase().includes(searchLower) ||
        medidor.estado.toLowerCase().includes(searchLower) ||
        medidor.codigoAcometida.toLowerCase().includes(searchLower)
      );
    });
  }, [medidores, searchTerm]);

  // Estadísticas de medidores
  const totalMedidores = medidores.length;
  const medidoresActivos = medidores.filter((m) =>
    m.estado.toLowerCase().includes("activo")
  ).length;
  const marcasUnicas = [...new Set(medidores.map((m) => m.marca))].length;
  const tiposUnicos = [...new Set(medidores.map((m) => m.tipo))].length;

  // Handlers para crear medidor
  const handleCreateMedidor = () => {
    setSelectedMedidor(null);
    setIsFormOpen(true);
  };

  // Handlers para editar medidor
  const handleEditMedidor = (medidor: BuscarMedidores) => {
    setSelectedMedidor(medidor);
    setIsFormOpen(true);
  };

  // Handlers para eliminar medidor
  const handleDeleteMedidor = (codigo: number) => {
    const medidor = medidores.find((m) => m.codigo === codigo);
    if (medidor) {
      setMedidorToDelete({
        id: codigo,
        name: `${medidor.marca} ${medidor.modelo} (${medidor.serie})`,
      });
      setIsDeleteDialogOpen(true);
    }
  };

  // Función para actualizar datos
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    toast.info("Actualizando medidores...");
    // Simular refresh - en una app real esto triggearía el refetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Función para exportar Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      toast.info("Generando archivo Excel...");

      // Llamada a la API para exportar
      const response = await fetch("/api/exportar-medidores", {
        method: "GET",
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        throw new Error("Error al exportar medidores");
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `medidores_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Archivo Excel descargado correctamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar medidores a Excel");
    } finally {
      setIsExporting(false);
    }
  };

  // Submit del formulario (placeholder - necesitará integración con API)
  const handleFormSubmit = async (
    data: CrearMedidorProps | ActualizarMedidorProps
  ) => {
    try {
      if (selectedMedidor) {
        // Actualizar medidor existente - PUT /Medidormodificar
        console.log("Actualizando medidor:", data);
        toast.success("El medidor ha sido actualizado correctamente.");
      } else {
        // Crear nuevo medidor - POST /MedidorCrear
        console.log("Creando medidor:", data);
        toast.success("El medidor ha sido creado correctamente.");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error al guardar medidor:", error);
      toast.error("Ha ocurrido un error al guardar el medidor.");
    }
  };

  // Confirmar eliminación (placeholder)
  const handleConfirmDelete = async () => {
    if (medidorToDelete) {
      try {
        console.log("Eliminando medidor:", medidorToDelete.id);
        toast.success("El medidor ha sido eliminado correctamente.");
        setIsDeleteDialogOpen(false);
        setMedidorToDelete(null);
      } catch (error) {
        console.error("Error al eliminar medidor:", error);
        toast.error("Ha ocurrido un error al eliminar el medidor.");
      }
    }
  };

  // Crear columnas con handlers
  const columns = createColumns({
    onEdit: handleEditMedidor,
    onDelete: handleDeleteMedidor,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Gestión de Medidores
          </h1>
          <p className="text-muted-foreground">
            Administra medidores eléctricos, marcas y configuraciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalMedidores} medidores
          </Badge>
        </div>
      </div>

      {/* Tabla de medidores */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <Gauge className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Medidores
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredMedidores.length > 0
                    ? `${filteredMedidores.length} medidores ${
                        searchTerm ? "filtrados" : "registrados"
                      } en el sistema`
                    : "No hay medidores registrados"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                disabled={isExporting}
                className="gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              >
                {isExporting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Excel
              </Button>
              <Button
                onClick={handleRefreshData}
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
              <Button
                onClick={handleCreateMedidor}
                size="sm"
                className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Nuevo Medidor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {medidores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <Gauge className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay medidores disponibles
                </p>
                <p className="text-sm mt-1">
                  Haz clic en "Nuevo Medidor" para agregar el primer medidor
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
                  placeholder="🔍 Buscar por código, marca, tipo, modelo, serie, ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredMedidores.length} de {medidores.length}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {filteredMedidores.length} medidores{" "}
                    {searchTerm
                      ? `encontrados de ${medidores.length} total`
                      : "disponibles"}
                  </span>
                </div>
              </div>

              <DataTable data={filteredMedidores} columns={columns} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulario */}
      <MedidorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        medidor={selectedMedidor}
        isLoading={false} // Placeholder
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMedidorToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        medidorName={medidorToDelete?.name || ""}
        isLoading={false} // Placeholder
      />
    </div>
  );
}
