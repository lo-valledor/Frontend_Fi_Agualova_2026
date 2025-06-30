import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from '~/components/ui/table';
import { Key, History, Info } from 'lucide-react';
import type { EtapaTres } from '~/types/monitor';
import { format } from 'date-fns';

interface ClavesLecturaProps {
  data: EtapaTres[];
  error?: string;
  onAceptarLectura: () => void;
}

export default function ClavesLectura({
  data,
  error,
  onAceptarLectura,
}: ClavesLecturaProps) {
  const isAceptarDisabled = data.length > 0 && data[0].CLA_Codigo === 'LEOK';

  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-lg dark:shadow-slate-900/10">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Key className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </div>
          Claves
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {error ? (
          <Alert variant="destructive" className="mb-3">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                  <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                    Código
                  </TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                    Descripción
                  </TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                    Fecha
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20"
                    >
                      <TableCell className="font-mono text-slate-900 dark:text-slate-100 text-sm">
                        {item.CLA_Codigo}
                      </TableCell>
                      <TableCell className="text-slate-800 dark:text-slate-200 text-sm">
                        {item.CLA_Descripcion}
                      </TableCell>
                      <TableCell className="text-slate-800 dark:text-slate-200 text-sm">
                        {format(
                          new Date(item.CLL_Fecha),
                          'dd-MM-yyyy HH:mm:ss',
                        ) || ''}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm"
                    >
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <History className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
            Resolver lectura con clave para lectura crítica
          </div>
          <div className="flex gap-2 items-center justify-end">
            <Button
              variant="destructive"
              onClick={onAceptarLectura}
              className="min-w-[150px] bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
              disabled={isAceptarDisabled}
            >
              Aceptar Lectura con Clave Crítica
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
