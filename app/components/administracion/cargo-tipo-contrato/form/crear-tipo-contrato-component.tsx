import CargoTipoContratoForm from './cargo-tipo-contrato-form';

import type {
  CargosFacturables,
  Conceptos,
  Condiciones,
  TiposContrato
} from '~/types/administracion';

export default function CrearTipoContratoComponent({
  tiposContrato = [],
  conceptos = [],
  condiciones = [],
  cargosFacturables = []
}: Readonly<{
  tiposContrato?: TiposContrato[];
  conceptos?: Conceptos[];
  condiciones?: Condiciones[];
  cargosFacturables?: CargosFacturables[];
}>) {
  return (
    <CargoTipoContratoForm
      mode='create'
      tiposContrato={tiposContrato}
      conceptos={conceptos}
      condiciones={condiciones}
      cargosFacturables={cargosFacturables}
    />
  );
}
