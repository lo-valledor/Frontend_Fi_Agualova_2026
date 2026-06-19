import { Loader2 } from 'lucide-react';

import React from 'react';

import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import type { TablaValoresEnelProps } from '~/types/operaciones';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table';
import DialogModificarPrecio from './dialog-modificar-precio';

export default function TablaValoresEnel({
  data,
  isLoading,
  isAuthorized,
  selectedRows,
  setSelectedRows
}: TablaValoresEnelProps & {
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const handleCheckboxChange = (codigo: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, codigo]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== codigo));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Seleccionar solo las filas que no están confirmadas y tienen índice
      const availableRows = data
        .filter(
          item => item.confirmacion !== 'Confirmado' && item.indice !== ''
        )
        .map(item => item.codigo);
      setSelectedRows(availableRows);
    } else {
      setSelectedRows([]);
    }
  };

  // Verificar si todas las filas disponibles están seleccionadas
  const allAvailableSelected =
    data.length > 0 &&
    data
      .filter(item => item.confirmacion !== 'Confirmado' && item.indice !== '')
      .every(item => selectedRows.includes(item.codigo));

  return (
    <div className="rounded-xl border border-border/60 shadow-sm bg-background">
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40">
            <TableRow className="bg-muted/40 hover:bg-muted/60 border-b">
              <TableHead className="text-xs text-center font-medium text-muted-foreground w-[50px] bg-muted/40">
                <Checkbox
                  checked={allAvailableSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={!isAuthorized}
                />
              </TableHead>
              <TableHead className="text-xs text-center font-medium text-muted-foreground bg-muted/40">
                Código
              </TableHead>
              <TableHead className="text-xs text-center font-medium text-muted-foreground bg-muted/40">
                Código Energía
              </TableHead>
              <TableHead className="text-xs text-center font-medium text-muted-foreground bg-muted/40">
                Descripción
              </TableHead>
              <TableHead className="text-xs text-center font-medium text-muted-foreground bg-muted/40">
                Valor
              </TableHead>
              <TableHead className="text-xs text-center font-medium text-muted-foreground bg-muted/40">
                Estado
              </TableHead>
              <TableHead className="text-xs text-center font-medium text-muted-foreground bg-muted/40">
                Modificar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
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
                      onCheckedChange={checked =>
                        handleCheckboxChange(item.codigo, checked === true)
                      }
                      disabled={
                        !isAuthorized ||
                        item.confirmacion === 'Confirmado' ||
                        item.indice === ''
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">{item.codigo}</TableCell>
                  <TableCell className="text-center">
                    {item.codigoEner}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.descripcion}
                  </TableCell>
                  <TableCell className="text-center font-medium text-sky-700 dark:text-sky-300">
                    {item.valor}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.confirmacion === 'Confirmado' ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border">
                        Confirmado
                      </Badge>
                    ) : item.indice === '' ? (
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
                    {item.confirmacion === 'Confirmado' ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-border">
                        Confirmado
                      </Badge>
                    ) : item.indice === '' ? (
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
                          setTimeout(
                            () => setSelectedRows(currentSelected),
                            100
                          );
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
    </div>
  );
}
