import { FileText } from 'lucide-react';
import { motion } from 'motion/react';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import type { BuscarContratos } from '~/types/reportes';

import { columns } from './columns';

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

interface ConsultarContratoComponentProps {
  buscarContratos: BuscarContratos[];
  error: Error | null;
}

export default function ConsultarContratoComponent({
  buscarContratos,
  error
}: Readonly<ConsultarContratoComponentProps>) {
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="industrial-divider mb-6" />
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/20">
                <FileText className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Error al cargar contratos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        <header>
          <ModernHeader
            title="Consultar Contratos Activos"
            description="Busca y consulta información detallada de los contratos activos"
          />
          <div className="industrial-divider mt-4" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Listado de Contratos
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                    {buscarContratos.length} contrato
                    {buscarContratos.length !== 1 ? 's' : ''} activo
                    {buscarContratos.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="industrial-divider" />
            <CardContent className="relative p-4">
              <div className="overflow-x-auto -mx-1">
                <DataTable columns={columns} data={buscarContratos} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
