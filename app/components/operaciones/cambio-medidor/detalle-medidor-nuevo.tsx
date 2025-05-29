import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { type DetalleMedidorNuevoProps } from "~/types/operaciones";
import { Badge } from "~/components/ui/badge";

export default function DetalleMedidorNuevo({
  detalleMedidorNuevo,
  onDetalleMedidorChange,
}: DetalleMedidorNuevoProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Convertir valores numéricos
    if (id === "constante_multiplicar" || id === "estado_medidor") {
      const numValue = value === "" ? 0 : Number(value);
      if (!isNaN(numValue)) {
        onDetalleMedidorChange({
          target: {
            id,
            value: numValue.toString(),
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    } else {
      onDetalleMedidorChange(e);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detalle del Nuevo Medidor</CardTitle>
        <CardDescription>
          Información detallada del medidor a instalar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Serie</Label>
              <Input
                id="numero_serie"
                value={detalleMedidorNuevo.numero_serie}
                onChange={handleInputChange}
                placeholder="Ingrese el número de serie"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_medidor">Tipo de Medidor</Label>
              <Input
                id="tipo_medidor"
                value={detalleMedidorNuevo.tipo_medidor}
                onChange={handleInputChange}
                placeholder="Ingrese el tipo de medidor"
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="constante_multiplicar">Constante</Label>
              <Input
                id="constante_multiplicar"
                type="number"
                value={detalleMedidorNuevo.constante_multiplicar}
                onChange={handleInputChange}
                placeholder="Ingrese la constante"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={detalleMedidorNuevo.marca}
                onChange={handleInputChange}
                placeholder="Ingrese la marca"
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={detalleMedidorNuevo.modelo}
                onChange={handleInputChange}
                placeholder="Ingrese el modelo"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado_medidor">Estado</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="estado_medidor"
                  type="number"
                  value={detalleMedidorNuevo.estado_medidor}
                  onChange={handleInputChange}
                  placeholder="Ingrese el estado"
                  readOnly
                  className="w-24"
                />
                <Badge
                  variant={
                    detalleMedidorNuevo.estado_medidor === 1
                      ? "default"
                      : "destructive"
                  }
                >
                  {detalleMedidorNuevo.estado_medidor === 1
                    ? "Activo"
                    : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
