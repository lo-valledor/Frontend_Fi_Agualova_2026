import { FileText, MapPin, User, Zap } from 'lucide-react';

import { memo } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type {
  DetalleCliente,
  DetalleContrato,
  DetalleLocal,
  DetalleMedidores,
  DetallePropietario,
  DetalleUbicacion
} from '~/types/reportes';

interface InformacionContratoProps {
  contratoInfo?: DetalleContrato;
  propietarioInfo?: DetallePropietario;
  clienteInfo?: DetalleCliente;
  localInfo?: DetalleLocal;
  medidorInfo?: DetalleMedidores;
  ubicacionInfo?: DetalleUbicacion;
}

/** Card industrial reutilizable para bloques de información */
function InfoCard({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className='overflow-hidden border border-border bg-card'>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
            <Icon className='h-4 w-4' />
          </div>
          <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <div className='industrial-divider' />
      <CardContent className='space-y-2.5 pt-3'>{children}</CardContent>
    </Card>
  );
}

/** Fila de dato con label industrial */
function InfoRow({
  label,
  value,
  className
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-baseline gap-2 ${className ?? ''}`}>
      <span className='sidebar-section-label shrink-0'>{label}</span>
      <span className='text-sm font-medium text-foreground text-right truncate'>
        {value}
      </span>
    </div>
  );
}

const InformacionContrato = memo(function InformacionContrato({
  contratoInfo,
  propietarioInfo,
  clienteInfo,
  localInfo,
  medidorInfo,
  ubicacionInfo
}: InformacionContratoProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <InfoCard icon={FileText} title='Información del Contrato'>
        {contratoInfo && (
          <>
            <InfoRow label='ID' value={contratoInfo.contratoId} />
            <InfoRow label='Tipo' value={contratoInfo.tipoContrato} />
            <InfoRow
              label='Tarifa'
              value={
                <Badge variant='outline' className='text-xs font-medium'>
                  {contratoInfo.codigoTarifa}
                </Badge>
              }
            />
            <InfoRow
              label='Potencia'
              value={`${contratoInfo.potenciaContratada} kW`}
            />
            <InfoRow
              label='Estado'
              value={
                <Badge
                  variant={
                    contratoInfo.estadoContrato === 'Activo'
                      ? 'default'
                      : 'secondary'
                  }
                  className='text-xs'
                >
                  {contratoInfo.estadoContrato}
                </Badge>
              }
            />
          </>
        )}
      </InfoCard>

      <InfoCard icon={User} title='Propietario'>
        {propietarioInfo && (
          <>
            <InfoRow label='RUT' value={propietarioInfo.rut} />
            <InfoRow label='Nombre' value={propietarioInfo.nombre} />
            <InfoRow label='Comuna' value={propietarioInfo.comuna} />
            <InfoRow label='Teléfono' value={propietarioInfo.telefono} />
            <InfoRow label='Email' value={propietarioInfo.email} />
          </>
        )}
      </InfoCard>

      <InfoCard icon={User} title='Cliente'>
        {clienteInfo && (
          <>
            <InfoRow label='RUT' value={clienteInfo.rut} />
            <InfoRow label='Nombre' value={clienteInfo.nombre} />
            <InfoRow label='Comuna' value={clienteInfo.comuna} />
            <InfoRow label='Teléfono' value={clienteInfo.telefono} />
            <InfoRow label='Email' value={clienteInfo.email} />
          </>
        )}
      </InfoCard>

      <InfoCard icon={MapPin} title='Local'>
        {localInfo && (
          <>
            <InfoRow label='ID' value={localInfo.localId} />
            <InfoRow label='Empresa' value={localInfo.empresa} />
            <div className='flex flex-col gap-1'>
              <span className='sidebar-section-label'>Dirección</span>
              <span className='text-sm font-medium text-foreground'>
                {localInfo.lugarEntregaServicio}
              </span>
            </div>
          </>
        )}
      </InfoCard>

      <InfoCard icon={Zap} title='Medidor'>
        {medidorInfo && (
          <>
            <InfoRow label='Serie' value={medidorInfo.nroSerie} />
            <InfoRow label='Tipo' value={medidorInfo.tipoMedidor} />
            <InfoRow label='Constante' value={medidorInfo.constanteMultiplicadora} />
            <InfoRow label='Dígitos' value={medidorInfo.digitos} />
          </>
        )}
      </InfoCard>

      <InfoCard icon={MapPin} title='Ubicación'>
        {ubicacionInfo && (
          <>
            <InfoRow label='Subempalme' value={ubicacionInfo.codigoSubempalme} />
            <InfoRow label='Nicho' value={ubicacionInfo.nicho} />
            <InfoRow label='Sector' value={ubicacionInfo.sector} />
            <InfoRow label='Empalme' value={ubicacionInfo.empalme} />
            <InfoRow label='Zona' value={ubicacionInfo.zona} />
          </>
        )}
      </InfoCard>
    </div>
  );
});

export default InformacionContrato;
