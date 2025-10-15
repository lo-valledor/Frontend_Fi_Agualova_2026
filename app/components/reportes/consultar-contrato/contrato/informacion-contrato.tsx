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
      {/* Información del Contrato */}
      <Card className='border bg-background'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <FileText className='h-4 w-4 text-blue-600' />
            Información del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {contratoInfo && (
            <>
              <div className='flex justify-between'>
                <span className='text-xs'>ID:</span>
                <span className='text-xs font-medium'>
                  {contratoInfo.contratoId}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Tipo:</span>
                <span className='text-xs font-medium'>
                  {contratoInfo.tipoContrato}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Tarifa:</span>
                <Badge variant='outline' className='text-xs'>
                  {contratoInfo.codigoTarifa}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Potencia:</span>
                <span className='text-xs font-medium'>
                  {contratoInfo.potenciaContratada} kW
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Estado:</span>
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
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información del Propietario */}
      <Card className='border bg-background'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <User className='h-4 w-4 text-green-600' />
            Propietario
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {propietarioInfo && (
            <>
              <div className='flex justify-between'>
                <span className='text-xs'>RUT:</span>
                <span className='text-xs font-medium'>
                  {propietarioInfo.rut}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Nombre:</span>
                <span className='text-xs font-medium'>
                  {propietarioInfo.nombre}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Comuna:</span>
                <span className='text-xs font-medium'>
                  {propietarioInfo.comuna}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Teléfono:</span>
                <span className='text-xs font-medium'>
                  {propietarioInfo.telefono}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Email:</span>
                <span className='text-xs font-medium truncate'>
                  {propietarioInfo.email}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información del Cliente */}
      <Card className='border bg-background'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <User className='h-4 w-4 text-purple-600' />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {clienteInfo && (
            <>
              <div className='flex justify-between'>
                <span className='text-xs'>RUT:</span>
                <span className='text-xs font-medium'>{clienteInfo.rut}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Nombre:</span>
                <span className='text-xs font-medium'>
                  {clienteInfo.nombre}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Comuna:</span>
                <span className='text-xs font-medium'>
                  {clienteInfo.comuna}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Teléfono:</span>
                <span className='text-xs font-medium'>
                  {clienteInfo.telefono}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Email:</span>
                <span className='text-xs font-medium truncate'>
                  {clienteInfo.email}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información del Local */}
      <Card className='border bg-background'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-orange-600' />
            Local
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {localInfo && (
            <>
              <div className='flex justify-between'>
                <span className='text-xs'>ID:</span>
                <span className='text-xs font-medium'>{localInfo.localId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Empresa:</span>
                <span className='text-xs font-medium'>{localInfo.empresa}</span>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-xs'>Dirección:</span>
                <span className='text-xs font-medium'>
                  {localInfo.lugarEntregaServicio}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información del Medidor */}
      <Card className='border bg-background'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <Zap className='h-4 w-4 text-yellow-600' />
            Medidor
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {medidorInfo && (
            <>
              <div className='flex justify-between'>
                <span className='text-xs'>Serie:</span>
                <span className='text-xs font-medium'>
                  {medidorInfo.nroSerie}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Tipo:</span>
                <span className='text-xs font-medium'>
                  {medidorInfo.tipoMedidor}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Constante:</span>
                <span className='text-xs font-medium'>
                  {medidorInfo.constanteMultiplicadora}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Dígitos:</span>
                <span className='text-xs font-medium'>
                  {medidorInfo.digitos}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información de Ubicación */}
      <Card className='border bg-background'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-teal-600' />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {ubicacionInfo && (
            <>
              <div className='flex justify-between'>
                <span className='text-xs'>Subempalme:</span>
                <span className='text-xs font-medium'>
                  {ubicacionInfo.codigoSubempalme}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Nicho:</span>
                <span className='text-xs font-medium'>
                  {ubicacionInfo.nicho}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Sector:</span>
                <span className='text-xs font-medium'>
                  {ubicacionInfo.sector}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Empalme:</span>
                <span className='text-xs font-medium'>
                  {ubicacionInfo.empalme}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs'>Zona:</span>
                <span className='text-xs font-medium'>
                  {ubicacionInfo.zona}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default InformacionContrato;
