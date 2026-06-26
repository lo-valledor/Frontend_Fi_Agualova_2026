import type {
  CargosFacturables,
  Conceptos,
  Condiciones,
  GuardarConfiguracionPayload
} from '~/types/administracion';
import CargoTipoContratoForm from './cargo-tipo-contrato-form';

export default function EditarTipoContrato({
  tipoContratoId,
  tipoContrato,
  configuracion,
  conceptos = [],
  condiciones = [],
  cargosFacturables = []
}: Readonly<{
  tipoContratoId: number;
  tipoContrato: string;
  configuracion: GuardarConfiguracionPayload;
  conceptos?: Conceptos[];
  condiciones?: Condiciones[];
  cargosFacturables?: CargosFacturables[];
}>) {
  return (
    <CargoTipoContratoForm
      mode="edit"
      tipoContratoId={tipoContratoId}
      tipoContratoLabel={tipoContrato}
      initialValue={configuracion}
      conceptos={conceptos}
      condiciones={condiciones}
      cargosFacturables={cargosFacturables}
    />
  );
}
