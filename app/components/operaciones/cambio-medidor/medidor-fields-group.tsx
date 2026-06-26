import type { CambioMedidorBuscarAntiguoRequest } from '~/types/operaciones';

import MedidorField from './medidor-field';

interface MedidorFieldsGroupProps {
  data: CambioMedidorBuscarAntiguoRequest;
  lecturaFinalValue: string;
  colorScheme?: 'amber' | 'blue' | 'green' | 'purple';
  onLecturaFinalChange: (value: string) => void;
}

export default function MedidorFieldsGroup({
  data,
  lecturaFinalValue,
  colorScheme = 'amber',
  onLecturaFinalChange
}: Readonly<MedidorFieldsGroupProps>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Primera columna */}
      <div className="space-y-3 sm:space-y-4">
        <MedidorField
          id="acometida-detalle"
          label="Acometida"
          value={data.acometida}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="numero-medidor"
          label="Número de Medidor"
          value={data.numeroSerie}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="constante"
          label="Constante"
          value={data.constante}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="ultima-lectura"
          label="Última Lectura Registrada"
          value={data.ultimaLectura}
          colorScheme={colorScheme}
        />
      </div>

      {/* Segunda columna */}
      <div className="space-y-3 sm:space-y-4">
        <MedidorField
          id="tipo"
          label="Tipo"
          value={data.tipo}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="marca"
          label="Marca"
          value={data.marca}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="modelo"
          label="Modelo"
          value={data.modelo}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="lectura-final"
          label="Lectura Final"
          value={lecturaFinalValue}
          colorScheme={colorScheme}
          readOnly={false}
          onChange={e => onLecturaFinalChange(e.target.value)}
          required
          placeholder="Ingrese la lectura final"
        >
          <span className="text-red-500 ml-1">*</span>
        </MedidorField>
      </div>
    </div>
  );
}
