import MedidorField from './medidor-field';

interface MedidorFieldsGroupProps {
  data: {
    acometidaDetalle: string;
    constante: string;
    marca: string;
    ultimaLectura: string;
    numeroMedidor: string;
    tipo: string;
    modelo: string;
    lecturaActual: string;
  };
  colorScheme?: 'amber' | 'blue' | 'green' | 'purple';
  onUltimaLecturaChange?: (value: string) => void;
  onLecturaActualChange?: (value: string) => void;
}

export default function MedidorFieldsGroup({
  data,
  colorScheme = 'amber',
  onUltimaLecturaChange,
  onLecturaActualChange
}: Readonly<MedidorFieldsGroupProps>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
      {/* Primera columna */}
      <div className="space-y-3 sm:space-y-4">
        <MedidorField
          id="acometida-detalle"
          label="Acometida"
          value={data.acometidaDetalle}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="constante"
          label="Constante"
          value={data.constante}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="marca"
          label="Marca"
          value={data.marca}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="ultima-lectura"
          label="Última Lectura"
          value={data.ultimaLectura}
          colorScheme={colorScheme}
          readOnly={!onUltimaLecturaChange}
          onChange={
            onUltimaLecturaChange
              ? e => onUltimaLecturaChange(e.target.value)
              : undefined
          }
        />
      </div>

      {/* Segunda columna */}
      <div className="space-y-3 sm:space-y-4">
        <MedidorField
          id="numero-medidor"
          label="Número de Medidor"
          value={data.numeroMedidor}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="tipo"
          label="Tipo"
          value={data.tipo}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="modelo"
          label="Modelo"
          value={data.modelo}
          colorScheme={colorScheme}
        />
        <MedidorField
          id="lectura-actual"
          label="Lectura Actual"
          value={data.lecturaActual}
          colorScheme={colorScheme}
          readOnly={!onLecturaActualChange}
          onChange={
            onLecturaActualChange
              ? e => onLecturaActualChange(e.target.value)
              : undefined
          }
          required={!!onLecturaActualChange}
          placeholder="Ingrese la lectura actual"
        >
          <span className="text-red-500 ml-1">*</span>
        </MedidorField>
      </div>
    </div>
  );
}
