import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import { Card, CardContent } from "~/components/ui/card";
import React, { useEffect, useState } from "react";
import {
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { Select } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Download, Loader2, Filter, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import api from "~/lib/api";
import { type Periodo } from "~/types/monitor";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { useMonitor } from "~/hooks/use-monitor";

export default function ExportarLecturasComponent() {
  const { periodos, sectores, error, activePeriodoId } = useMonitor();

  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSectores, setSelectedSectores] = useState<string[]>([]);
  const [selectedNichos, _setSelectedNichos] = useState<string[]>([]);
  const [selectedEstados, setSelectedEstados] = useState<number[]>([]);
  const [selectedMedidores, setSelectedMedidores] = useState<string[]>([]);
  const [medidorInput, setMedidorInput] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [estadoNormal, setEstadoNormal] = useState<boolean>(false);
  const [estadoFacturado, setEstadoFacturado] = useState<boolean>(false);

  const pageBreadcrumbs = [
    { label: "Monitor" },
    { label: "Exportar Lecturas" },
  ];

  // Efecto para establecer el período activo por defecto
  useEffect(() => {
    if (periodos && periodos.length > 0 && !selectedPeriodo) {
      const periodoActivo =
        periodos.find((p) => Number(p.IdPeriodo) === Number(activePeriodoId)) ||
        periodos[0];

      if (periodoActivo) {
        setSelectedPeriodo(periodoActivo);
      }
    }
  }, [periodos, activePeriodoId, selectedPeriodo]);

  // Función para manejar la selección de sectores
  const handleSectorChange = (sectorId: string, checked: boolean) => {
    if (checked) {
      setSelectedSectores([...selectedSectores, sectorId]);
    } else {
      setSelectedSectores(selectedSectores.filter((id) => id !== sectorId));
    }
  };

  // Función para manejar la selección de estados
  const handleEstadoChange = (estado: number, checked: boolean) => {
    if (estado === 2) {
      setEstadoNormal(checked);
    } else if (estado === 5) {
      setEstadoFacturado(checked);
    }

    // Actualizar la lista de estados seleccionados
    if (checked) {
      setSelectedEstados([...selectedEstados, estado]);
    } else {
      setSelectedEstados(selectedEstados.filter((e) => e !== estado));
    }
  };

  // Función para agregar un medidor a la lista
  const handleAddMedidor = () => {
    if (medidorInput.trim()) {
      setSelectedMedidores([...selectedMedidores, medidorInput.trim()]);
      setMedidorInput("");
    }
  };

  // Función para eliminar un medidor de la lista
  const handleRemoveMedidor = (medidor: string) => {
    setSelectedMedidores(selectedMedidores.filter((m) => m !== medidor));
  };

  // Función para exportar las lecturas
  const handleExportar = async () => {
    if (!selectedPeriodo) {
      toast.error("Debe seleccionar un período");
      return;
    }

    try {
      setIsExporting(true);

      // Construir los parámetros de la consulta
      const params = new URLSearchParams();

      // Período (obligatorio)
      params.append("periodo", selectedPeriodo.IdPeriodo);

      // Sectores (opcional)
      if (selectedSectores.length > 0) {
        // Usar la descripción del sector directamente, sin codificación adicional
        params.append("sectores", selectedSectores.join(","));
      }

      // Nichos (opcional)
      if (selectedNichos.length > 0) {
        params.append("nichos", selectedNichos.join(","));
      }

      // Estados (opcional)
      if (selectedEstados.length > 0) {
        params.append("estados", selectedEstados.join(","));
      }

      // Medidores (opcional)
      if (selectedMedidores.length > 0) {
        params.append("medidores", selectedMedidores.join(","));
      }

      console.log(
        "URL de exportación:",
        `/exportar-lecturas-excel?${params.toString()}`
      );

      // Realizar la petición
      const response = await api.get("/exportar-lecturas-excel", {
        params,
        responseType: "blob", // Importante para descargar archivos
      });

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart])
      );
      const link = document.createElement("a");
      link.href = url;

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers["content-disposition"];
      let filename = `Lecturas_${
        selectedPeriodo.DescripcionPeriodo
      }_${selectedSectores.join(",")}_${selectedNichos.join(
        ","
      )}_${selectedEstados.join(",")}_${selectedMedidores.join(
        ","
      )}_${new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Archivo exportado correctamente");
    } catch (error) {
      console.error("Error al exportar lecturas:", error);
      toast.error("Error al exportar lecturas");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
            Exportar Lecturas
          </h1>
          <p className="text-muted-foreground">
            Exporte las lecturas de medidores en formato Excel.
          </p>
        </div>

        <Button
          onClick={handleExportar}
          disabled={!selectedPeriodo || isExporting}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar a Excel
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar datos: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros principales */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Período (obligatorio) */}
            <div className="space-y-2">
              <Label htmlFor="periodo" className="font-medium">
                Periodo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedPeriodo?.IdPeriodo || ""}
                onValueChange={(value) => {
                  const periodo = periodos.find((p) => p.IdPeriodo === value);
                  setSelectedPeriodo(periodo || null);
                }}
              >
                <SelectTrigger id="periodo" className="w-full">
                  <SelectValue placeholder="Seleccionar Periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periodos?.map((periodo) => (
                    <SelectItem
                      key={periodo.IdPeriodo}
                      value={periodo.IdPeriodo}
                    >
                      {periodo.DescripcionPeriodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Filtros adicionales */}
            <Collapsible
              open={isFiltersOpen}
              onOpenChange={setIsFiltersOpen}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <h3 className="font-medium">Filtros adicionales</h3>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isFiltersOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Filter className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-4 pt-2">
                {/* Sectores */}
                <div className="space-y-2">
                  <Label className="font-medium">Sectores</Label>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sectores?.map((sector) => (
                        <div
                          key={sector.sectorId}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={sector.sectorId}
                            checked={selectedSectores.includes(
                              sector.descripcion
                            )}
                            onCheckedChange={(checked) =>
                              handleSectorChange(
                                sector.descripcion,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={sector.sectorId}
                            className="cursor-pointer text-sm"
                          >
                            {sector.descripcion}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {selectedSectores.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSectores.map((sectorId) => {
                        const sector = sectores?.find(
                          (s) => s.sectorId === sectorId
                        );
                        return (
                          <Badge
                            key={sectorId}
                            variant="outline"
                            className="bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                          >
                            {sector?.descripcion || sectorId}
                            <button
                              className="ml-1 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300"
                              onClick={() =>
                                handleSectorChange(sectorId, false)
                              }
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Estados */}
                <div className="space-y-2">
                  <Label className="font-medium">Estados</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="estado-normal"
                        checked={estadoNormal}
                        onCheckedChange={(checked) =>
                          handleEstadoChange(2, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="estado-normal"
                        className="cursor-pointer text-sm"
                      >
                        Normal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="estado-facturado"
                        checked={estadoFacturado}
                        onCheckedChange={(checked) =>
                          handleEstadoChange(5, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="estado-facturado"
                        className="cursor-pointer text-sm"
                      >
                        Facturado
                      </Label>
                    </div>
                  </div>
                  {selectedEstados.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedEstados.map((estado) => (
                        <Badge
                          key={estado}
                          variant="outline"
                          className="bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                        >
                          {estado === 2 ? "Normal" : "Facturado"}
                          <button
                            className="ml-1 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300"
                            onClick={() => handleEstadoChange(estado, false)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medidores */}
                <div className="space-y-2">
                  <Label className="font-medium">Medidores</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ingrese número de serie del medidor"
                      value={medidorInput}
                      onChange={(e) => setMedidorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMedidor();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddMedidor}
                      disabled={!medidorInput.trim()}
                    >
                      Agregar
                    </Button>
                  </div>

                  {selectedMedidores.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedMedidores.map((medidor, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 pr-1"
                        >
                          {medidor}
                          <button
                            className="ml-1 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300"
                            onClick={() => handleRemoveMedidor(medidor)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
