import {
  ArrowLeft,
  Building2,
  FileText,
  Gauge,
  MapPin,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { ConsolidadoConsultaContrato } from '~/types/reportes';

interface ContratoDetailComponentProps {
  contrato: ConsolidadoConsultaContrato | null;
  error: Error | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || 'N/A'}</span>
    </div>
  );
}

export default function ContratoDetailComponent({
  contrato,
  error
}: Readonly<ContratoDetailComponentProps>) {
  const navigate = useNavigate();

  if (error || !contrato) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar el contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error?.message ?? 'No se encontró información del contrato.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/dashboard/reportes/consultar-contrato')}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Numero" value={contrato.contrato.nroContrato} />
            <DetailRow label="Tipo" value={contrato.contrato.tipoContrato} />
            <DetailRow label="Tarifa" value={contrato.contrato.codigoTarifa} />
            <DetailRow
              label="Ciclo"
              value={contrato.contrato.cicloFacturacion}
            />
            <DetailRow label="Estado" value={contrato.contrato.estado} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="RUT" value={contrato.cliente.rut} />
            <DetailRow label="Nombre" value={contrato.cliente.nombre} />
            <DetailRow label="Comuna" value={contrato.cliente.comuna} />
            <DetailRow label="Contacto" value={contrato.cliente.contacto} />
            <DetailRow label="Email" value={contrato.cliente.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Propietario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="RUT" value={contrato.propietario.rut} />
            <DetailRow label="Nombre" value={contrato.propietario.nombre} />
            <DetailRow label="Comuna" value={contrato.propietario.comuna} />
            <DetailRow label="Telefono" value={contrato.propietario.telefono} />
            <DetailRow label="Email" value={contrato.propietario.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Ubicacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Local" value={contrato.lugar.nroLocal} />
            <DetailRow label="Referencia" value={contrato.lugar.otroLugar} />
            <DetailRow label="Acometida" value={contrato.empalme.acometida} />
            <DetailRow label="Sector" value={contrato.empalme.sector} />
            <DetailRow label="Nicho" value={contrato.empalme.nicho} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4" />
              Medidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Serie" value={contrato.medidor.nroMedidor} />
            <DetailRow label="Tipo" value={contrato.medidor.tipoMedidor} />
            <DetailRow
              label="Constante"
              value={contrato.medidor.constanteMultiplicar}
            />
            <DetailRow label="Digitos" value={contrato.medidor.digitos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen historico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              label="Lecturas"
              value={String(contrato.lecturas.length)}
            />
            <DetailRow
              label="Facturas"
              value={String(contrato.facturas.length)}
            />
            <DetailRow
              label="Ultimo periodo lectura"
              value={contrato.lecturas.at(-1)?.periodo ?? 'N/A'}
            />
            <DetailRow
              label="Ultimo periodo factura"
              value={contrato.facturas.at(-1)?.periodo ?? 'N/A'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
