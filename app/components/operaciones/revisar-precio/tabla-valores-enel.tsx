import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PencilIcon, Loader2 } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import type { TablaValoresEnelProps } from "~/types/operaciones";
import api from "~/lib/api";
import { useAuth } from "~/context/AuthContext";
import { toast } from "sonner";
import DialogModificarPrecio from "./dialog-modificar-precio";

export default function TablaValoresEnel({
  data,
  isLoading,
  isAuthorized,
  selectedRows,
  setSelectedRows,
}: TablaValoresEnelProps & {
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { user } = useAuth();

  const handleCheckboxChange = (codigo: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, codigo]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== codigo));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Seleccionar solo las filas que no están confirmadas y tienen índice
      const availableRows = data
        .filter(
          (item) => item.confirmacion !== "Confirmado" && item.indice !== ""
        )
        .map((item) => item.codigo);
      setSelectedRows(availableRows);
    } else {
      setSelectedRows([]);
    }
  };

  // Verificar si todas las filas disponibles están seleccionadas
  const allAvailableSelected =
    data.length > 0 &&
    data
      .filter(
        (item) => item.confirmacion !== "Confirmado" && item.indice !== ""
      )
      .every((item) => selectedRows.includes(item.codigo));

  const handleConfirmar = async (item: any) => {
    if (!user || !user.username) {
      toast.error("No se pudo obtener información del usuario");
      return;
    }

    try {
      const response = await api.post(
        `/ConfirmarPrecio?indice=${item.indice}&usuario=${user.username}`
      );
      console.log(response);
      if (response.status === 200) {
        setSelectedRows((prev) => [...prev, item.codigo]);
        toast.success(`Se ha confirmado el precio para ${item.descripcion}`);
      } else {
        toast.error("No se pudo confirmar el precio");
      }
    } catch (error) {
      console.error("Error al confirmar precio:", error);
      toast.error("Ocurrió un error al procesar la solicitud");
    }
  };

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/60">
            <TableHead className="text-xs text-center font-medium text-muted-foreground w-[50px]">
              <Checkbox
                checked={allAvailableSelected}
                onCheckedChange={handleSelectAll}
                disabled={!isAuthorized}
              />
            </TableHead>
            <TableHead className="text-xs text-center font-medium text-muted-foreground">
              Código
            </TableHead>
            <TableHead className="text-xs text-center font-medium text-muted-foreground">
              Código Energía
            </TableHead>
            <TableHead className="text-xs text-center font-medium text-muted-foreground">
              Descripción
            </TableHead>
            <TableHead className="text-xs text-center font-medium text-muted-foreground">
              Valor
            </TableHead>
            <TableHead className="text-xs text-center font-medium text-muted-foreground">
              Estado
            </TableHead>
            <TableHead className="text-xs text-center font-medium text-muted-foreground">
              Modificar
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-600 dark:text-sky-400" />
                  <span className="ml-2 text-muted-foreground">
                    Cargando datos...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/30">
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedRows.includes(item.codigo)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.codigo, checked === true)
                    }
                    disabled={
                      !isAuthorized ||
                      item.confirmacion === "Confirmado" ||
                      item.indice === ""
                    }
                  />
                </TableCell>
                <TableCell className="text-center">{item.codigo}</TableCell>
                <TableCell className="text-center">{item.codigoEner}</TableCell>
                <TableCell className="text-center">
                  {item.descripcion}
                </TableCell>
                <TableCell className="text-center font-medium text-sky-700 dark:text-sky-300">
                  {item.valor}
                </TableCell>
                <TableCell className="text-center">
                  {item.confirmacion === "Confirmado" ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      Confirmado
                    </Badge>
                  ) : item.indice === "" ? (
                    <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                      Inhabilitado
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    >
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.confirmacion === "Confirmado" ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      Confirmado
                    </Badge>
                  ) : item.indice === "" ? (
                    <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                      Inhabilitado
                    </Badge>
                  ) : (
                    <DialogModificarPrecio
                      isAuthorized={isAuthorized}
                      indice={Number(item.indice)}
                      descripcion={item.descripcion}
                      valorActual={item.valor}
                      onSuccess={() => {
                        // Refrescar datos después de modificar
                        const currentSelected = [...selectedRows];
                        setSelectedRows([]);
                        setTimeout(() => setSelectedRows(currentSelected), 100);
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center h-24 text-muted-foreground"
              >
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
