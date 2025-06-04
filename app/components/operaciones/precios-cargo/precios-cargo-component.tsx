import React, { useState } from "react";
import { columns } from "./columns-enerlova";
import { Button } from "~/components/ui/button";
import {
  DollarSignIcon,
  BarChartIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { columns as columnsEnel } from "./columns-enel";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type {
  PreciosCargoEnel,
  PreciosCargoEnerlova,
} from "~/types/operaciones";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { DataTable } from "./data-table";

interface PreciosCargoComponentProps {
  tablaEnel: PreciosCargoEnel[];
  tablaEnerlova: PreciosCargoEnerlova[];
  mes: string;
  anio: string;
  onSearch: () => Promise<void>;
}

const months = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export default function PreciosCargoComponent({
  tablaEnel,
  tablaEnerlova,
  mes,
  anio,
  onSearch,
}: PreciosCargoComponentProps) {
  const [isEnelOpen, setIsEnelOpen] = useState(true);
  const [isEnerlovaOpen, setIsEnerlovaOpen] = useState(true);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Precios de Cargo
        </h1>
        <p className="text-muted-foreground">
          Gestión de precios de cargo desde compañías de electricidad
        </p>
      </div>

      {/* Precios de Cargo - Enel */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isEnelOpen} onOpenChange={setIsEnelOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shadow-sm">
                  <DollarSignIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Precios de Cargo - Enel
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Precios de cargo desde compañía de electricidad Enel
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                >
                  {months.find((m) => m.value === mes)?.label || "Mes"} {anio}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnelOpen(!isEnelOpen);
                  }}
                >
                  {isEnelOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar sección Enel</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 md:p-6">
              <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
                <DataTable
                  columns={columnsEnel(mes, anio, onSearch)}
                  data={tablaEnel}
                  columnGroups={[
                    {
                      id: "identificacion",
                      title: "Identificación",
                      columns: ["codigo", "codigoener", "descripcion"],
                      className: "bg-zinc-700 text-white",
                    },
                    {
                      id: "valores",
                      title: "Valores Anteriores",
                      columns: ["valor", "valor2", "valor3"],
                      className: "bg-sky-700 text-white",
                    },
                    {
                      id: "valoresActuales",
                      title: "Valores Actuales",
                      columns: ["valoractual", "valoractual2", "valoractual3"],
                      className: "bg-green-700 text-white",
                    },
                  ]}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Precios de Cargo - Enerlova */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isEnerlovaOpen} onOpenChange={setIsEnerlovaOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow-sm">
                  <BarChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Precios de Cargo - Enerlova
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Precios de cargo desde Enerlova
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  Precios actuales
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnerlovaOpen(!isEnerlovaOpen);
                  }}
                >
                  {isEnerlovaOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar sección Enerlova</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 md:p-6">
              <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
                <DataTable
                  columns={columns}
                  data={tablaEnerlova}
                  columnGroups={[
                    {
                      id: "informacion",
                      title: "Información",
                      columns: ["CD_ID", "cd_codigoenerlova", "CD_Descripcion"],
                      className: "bg-zinc-700 text-white",
                    },
                    {
                      id: "valores",
                      title: "Valores",
                      columns: ["valor", "dias"],
                      className: "bg-emerald-700 text-white",
                    },
                  ]}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
