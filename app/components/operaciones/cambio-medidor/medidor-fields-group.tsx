import React from 'react';
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
}

export default function MedidorFieldsGroup({
  data,
  colorScheme = 'amber',
}: MedidorFieldsGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Primera columna */}
      <div className="space-y-4">
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
        />
      </div>

      {/* Segunda columna */}
      <div className="space-y-4">
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
        />
      </div>
    </div>
  );
}
