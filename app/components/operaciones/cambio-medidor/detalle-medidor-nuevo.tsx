import { Zap } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { CambioMedidorBuscarNuevoRequest } from '~/types/operaciones';

interface DetalleMedidorNuevoProps {
  detalleMedidorNuevo: CambioMedidorBuscarNuevoRequest;
}

export default function DetalleMedidorNuevo({
  detalleMedidorNuevo
}: Readonly<DetalleMedidorNuevoProps>) {
  const esActivo = detalleMedidorNuevo.idMedidor > 0;

  return (
    <Card className="w-full rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="bg-muted/30 border-b border-border p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500 shadow-sm shrink-0">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-foreground text-sm sm:text-lg truncate">
              <span className="hidden sm:inline">
                Detalle del Nuevo Medidor
              </span>
              <span className="sm:hidden">Nuevo Medidor</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm truncate">
              <span className="hidden sm:inline">
                Información detallada del medidor a instalar
              </span>
              <span className="sm:hidden">Medidor a instalar</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="grid gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="numeroSerie"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Número de Serie
              </Label>
              <Input
                id="numeroSerie"
                value={detalleMedidorNuevo.numeroSerie}
                placeholder="Sin número de serie"
                readOnly
                className="bg-muted/30 border-border text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="tipo"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Tipo de Medidor
              </Label>
              <Input
                id="tipo"
                value={detalleMedidorNuevo.tipo}
                placeholder="Sin tipo"
                readOnly
                className="bg-muted/30 border-border text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="constante"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Constante
              </Label>
              <Input
                id="constante"
                type="number"
                value={detalleMedidorNuevo.constante}
                placeholder="Sin constante"
                readOnly
                className="bg-muted/30 border-border text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="marca"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Marca
              </Label>
              <Input
                id="marca"
                value={detalleMedidorNuevo.marca}
                placeholder="Sin marca"
                readOnly
                className="bg-muted/30 border-border text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="modelo"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Modelo
              </Label>
              <Input
                id="modelo"
                value={detalleMedidorNuevo.modelo}
                placeholder="Sin modelo"
                readOnly
                className="bg-muted/30 border-border text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-foreground">
                Estado
              </Label>
              <div className="flex items-center gap-2 h-10">
                <Badge
                  variant={esActivo ? 'default' : 'destructive'}
                  className={
                    esActivo
                      ? 'bg-emerald-500 text-white text-xs sm:text-sm'
                      : 'text-xs sm:text-sm'
                  }
                >
                  {esActivo ? 'Disponible' : 'No disponible'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
