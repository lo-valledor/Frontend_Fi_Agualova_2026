import React, { useEffect, useState } from "react";
import api from "~/lib/api";
import { FileText, RotateCcw, Loader2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import EditarMedidores from "./editar-medidores";
import type { MedidorNichoItem } from "~/types/monitor";
import { LoadingState, EmptyState } from "~/components/loading-state";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { columnsNichos, columnGroups } from "./columns-nichos";
import { DataTableNichos } from "./data-table-nichos";

export default function MonitorNichos({
  periodo,
  nicho,
  onSuccess,
}: {
  periodo: string;
  nicho: string;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<MedidorNichoItem[]>([]);
  const [openDialogs, setOpenDialogs] = useState<Record<number, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [highlightTimeout, setHighlightTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedMedidor, setSelectedMedidor] =
    useState<MedidorNichoItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const searchResults = async () => {
    const params = new URLSearchParams({
      periodo,
      nicho,
    });

    try {
      setIsLoading(true);
      const response = await api.get("/lecturas-nicho", { params });
      setResults(response.data as MedidorNichoItem[]);
    } catch (error) {
      console.error("Error al obtener lecturas de nicho:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    searchResults();
  }, [periodo, nicho]);

  // Limpiar el temporizador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (highlightTimeout) {
        clearTimeout(highlightTimeout);
      }
    };
  }, [highlightTimeout]);

  const handleOpenDialog = (id: number, isOpen: boolean) => {
    setOpenDialogs((prev) => ({
      ...prev,
      [id]: isOpen,
    }));
  };

  const handleRowClick = (medidor: MedidorNichoItem) => {
    // Solo abrir el diálogo si no es Estado 5 (facturación) y no es el último editado
    if (medidor.Estado !== 5 && lastEditedId !== medidor.LM_ID) {
      setSelectedMedidor(medidor);
      setIsDialogOpen(true);
    }
  };

  const handleSuccess = (id: number) => {
    // Cerrar el diálogo
    handleOpenDialog(id, false);
    setIsDialogOpen(false);

    // Limpiar cualquier temporizador existente
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }

    // Establecer el ID editado para resaltarlo
    setLastEditedId(id);

    // Configurar un temporizador para quitar el resaltado después de 3 segundos
    const timer = setTimeout(() => {
      setLastEditedId(null);
    }, 3000);

    setHighlightTimeout(timer);

    // Actualizar los datos
    searchResults();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    searchResults();
  };

  if (isLoading) {
    return <LoadingState message="Cargando datos de nichos..." />;
  }

  if (results.length === 0) {
    return (
      <EmptyState message="No se encontraron nichos para los parámetros seleccionados" />
    );
  }

  // Preparar las props para pasar a la función de columnas
  const columnProps = {
    handleOpenDialog,
    openDialogs,
    lastEditedId,
    handleSuccess,
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="p-0">
        <div className="p-2 flex justify-between items-center border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
            >
              Nicho: {nicho}
            </Badge>
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            >
              Periodo: {periodo}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-muted/50"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {isRefreshing ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>

        <div className="overflow-auto">
          <DataTableNichos
            columns={columnsNichos(columnProps)}
            data={results}
            columnGroups={columnGroups}
            onRowClick={handleRowClick}
          />
        </div>
      </CardContent>

      {/* Diálogo para editar/reaperturar medidor */}
      {selectedMedidor && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="min-w-[900px] h-auto max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-sky-800 dark:text-sky-200">
                <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                {selectedMedidor.Estado === 4
                  ? "Reaperturar Medidor"
                  : "Editar Medidor"}
                <Badge
                  variant="outline"
                  className="ml-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                >
                  {selectedMedidor.ME_NSerie}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Complete la información para{" "}
                {selectedMedidor.Estado === 4 ? "reaperturar" : "actualizar"} la
                medición
              </DialogDescription>
            </DialogHeader>
            <EditarMedidores
              result={selectedMedidor}
              onSuccess={() => handleSuccess(selectedMedidor.LM_ID)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
