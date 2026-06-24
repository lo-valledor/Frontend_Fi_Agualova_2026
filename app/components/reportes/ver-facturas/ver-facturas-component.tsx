import {
  AlertCircleIcon,
  EyeIcon,
  FileTextIcon,
  Loader2,
  ReceiptTextIcon,
  RotateCcwIcon
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { reportesService } from '~/services/reportesService';
import type { PeriodosDisponibles, VerFacturasProps } from '~/types/reportes';

interface VerFacturasComponentProps {
  periodos: PeriodosDisponibles[];
  error: string | null;
}

type VerFacturasFormState = {
  tipo: string;
  rutCliente: string;
  local: string;
  facturaInicial: string;
  facturaFinal: string;
  periodo: string;
  acometida: string;
};

const initialFormState: VerFacturasFormState = {
  tipo: '',
  rutCliente: '',
  local: '',
  facturaInicial: '',
  facturaFinal: '',
  periodo: '',
  acometida: ''
};

const tipoOptions = [
  { value: '1', label: 'Filtrado' },
  { value: '2', label: 'Todos' }
];

const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    globalThis.URL.revokeObjectURL(url);
  }, 100);
};

const buildRequest = (form: VerFacturasFormState): VerFacturasProps | null => {
  const hasPeriodo = form.periodo.trim().length > 0;
  const hasTipo = form.tipo.trim().length > 0;
  const isFilteredMode = form.tipo === '1';

  if (!hasPeriodo || !hasTipo) {
    return null;
  }

  if (
    isFilteredMode &&
    (!form.rutCliente.trim() ||
      !form.local.trim() ||
      !form.facturaInicial.trim() ||
      !form.facturaFinal.trim() ||
      !form.acometida.trim())
  ) {
    return null;
  }

  return {
    tipo: Number(form.tipo),
    rutCliente: form.rutCliente.trim(),
    local: form.local.trim(),
    facturaInicial: form.facturaInicial.trim(),
    facturaFinal: form.facturaFinal.trim(),
    periodo: form.periodo.trim(),
    acometida: form.acometida.trim()
  };
};

export default function VerFacturasComponent({
  periodos,
  error
}: Readonly<VerFacturasComponentProps>) {
  const [form, setForm] = useState<VerFacturasFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(error);
  const [ultimaSolicitud, setUltimaSolicitud] =
    useState<VerFacturasProps | null>(null);

  const hasSelectedPeriodo = Boolean(form.periodo.trim());
  const isFilteredMode = form.tipo === '1';
  const canSubmit = useMemo(() => buildRequest(form) !== null, [form]);
  const periodoSeleccionadoLabel = useMemo(
    () =>
      periodos.find(periodo => periodo.id === form.periodo)?.descripcion ??
      'Sin período seleccionado',
    [form.periodo, periodos]
  );

  const handleChange =
    (field: keyof VerFacturasFormState) =>
    (value: string | React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = typeof value === 'string' ? value : value.target.value;

      setForm(current => ({
        ...current,
        [field]: nextValue
      }));
    };

  const handleConsultar = async () => {
    const request = buildRequest(form);

    if (!request) {
      toast.error('Debes completar todos los campos para consultar.');
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await reportesService.getVerFacturas(request);

      if (response?.error) {
        setUltimaSolicitud(null);
        setFetchError(
          response.error || 'No fue posible consultar las facturas.'
        );
        toast.error('No fue posible generar el lote de facturas.');
        return;
      }

      if (!response.data) {
        setUltimaSolicitud(null);
        setFetchError('No fue posible descargar el lote PDF.');
        toast.error('No fue posible descargar el lote PDF.');
        return;
      }

      const filename = response.data.filename || 'lote-facturas.pdf';
      const pdfBlob = new Blob([response.data.blob], {
        type: response.data.contentType || 'application/pdf'
      });

      downloadBlobFile(pdfBlob, filename);
      setUltimaSolicitud(request);
      toast.success('Lote PDF generado y descargado correctamente.');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido al consultar facturas';

      setUltimaSolicitud(null);
      setFetchError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setForm(initialFormState);
    setUltimaSolicitud(null);
    setFetchError(error);
    toast.success('Formulario reiniciado.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6 p-4 sm:p-6">
        <ModernHeader
          title="Ver Facturas"
          description="Generación de lotes PDF de facturas por período y filtros opcionales"
        />

        <Card className="border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <CardTitle className="text-base">Parámetros de consulta</CardTitle>
            <CardDescription>
              Selecciona primero el período y luego define si deseas descargar
              todas las facturas o un lote filtrado
            </CardDescription>
          </div>

          <CardContent className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <Select
                  value={form.periodo}
                  onValueChange={handleChange('periodo')}
                >
                  <SelectTrigger id="periodo" className="w-full bg-background">
                    <SelectValue placeholder="Selecciona un período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos.map(periodo => (
                      <SelectItem key={periodo.id} value={periodo.id}>
                        {periodo.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={handleChange('tipo')}
                  disabled={!hasSelectedPeriodo}
                >
                  <SelectTrigger id="tipo" className="w-full bg-background">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rutCliente">RUT Cliente</Label>
                <Input
                  id="rutCliente"
                  value={form.rutCliente}
                  onChange={handleChange('rutCliente')}
                  placeholder="Ej: 12345678-9"
                  disabled={!hasSelectedPeriodo || !isFilteredMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={form.local}
                  onChange={handleChange('local')}
                  placeholder="Ej: 101"
                  disabled={!hasSelectedPeriodo || !isFilteredMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facturaInicial">Factura Inicial</Label>
                <Input
                  id="facturaInicial"
                  value={form.facturaInicial}
                  onChange={handleChange('facturaInicial')}
                  placeholder="Ej: 1000"
                  disabled={!hasSelectedPeriodo || !isFilteredMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facturaFinal">Factura Final</Label>
                <Input
                  id="facturaFinal"
                  value={form.facturaFinal}
                  onChange={handleChange('facturaFinal')}
                  placeholder="Ej: 1050"
                  disabled={!hasSelectedPeriodo || !isFilteredMode}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="acometida">Acometida</Label>
                <Input
                  id="acometida"
                  value={form.acometida}
                  onChange={handleChange('acometida')}
                  placeholder="Ej: ACOM-001"
                  disabled={!hasSelectedPeriodo || !isFilteredMode}
                />
              </div>
            </div>

            {!hasSelectedPeriodo ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                Primero debes seleccionar un período para habilitar el resto de
                los filtros.
              </div>
            ) : form.tipo === '2' ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                Modo <span className="font-medium">Todos</span>: se generará el
                lote PDF completo del período seleccionado sin aplicar filtros
                adicionales.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleConsultar}
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando lote...
                  </>
                ) : (
                  <>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Generar lote PDF
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={handleLimpiar}>
                <RotateCcwIcon className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border bg-card lg:col-span-2">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
                  <ReceiptTextIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estado de la consulta
                  </p>
                  <p className="text-lg font-semibold">
                    {fetchError
                      ? 'Con observaciones'
                      : ultimaSolicitud
                        ? 'Lote generado'
                        : 'Pendiente'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-sm font-medium">Observación</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Este endpoint genera y descarga un lote PDF. Por eso esta vista
                prioriza el resumen de la solicitud enviada en lugar de intentar
                representar una “respuesta” tabular que no aporta valor.
              </p>
            </CardContent>
          </Card>
        </div>

        {fetchError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircleIcon className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  Error al consultar facturas
                </p>
                <p className="text-sm text-muted-foreground">{fetchError}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <CardTitle className="text-base">
              Resumen de la última generación
            </CardTitle>
            <CardDescription>
              Confirmación de los parámetros usados para construir el lote PDF
            </CardDescription>
          </div>

          <CardContent className="p-0">
            {!ultimaSolicitud ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Aún no se ha generado ningún lote.
              </div>
            ) : (
              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Período
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {periodoSeleccionadoLabel}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tipo de lote
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {ultimaSolicitud.tipo === 2 ? 'Todos' : 'Filtrado'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Factura inicial
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {ultimaSolicitud.facturaInicial || 'No aplica'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Factura final
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {ultimaSolicitud.facturaFinal || 'No aplica'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    RUT Cliente
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {ultimaSolicitud.rutCliente || 'No aplica'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Local
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {ultimaSolicitud.local || 'No aplica'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Acometida
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {ultimaSolicitud.acometida || 'No aplica'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileTextIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Siguiente paso recomendado</p>
                <p className="text-sm text-muted-foreground">
                  Si después quieres mejorar más esta pantalla, lo correcto
                  sería mostrar progreso o confirmación de descarga por lote, no
                  una tabla de payload.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
