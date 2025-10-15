import React from 'react';
import CrearContratanteComponent from '~/components/administracion/contratantes/form/crear-contratante-component';

export function meta() {
  return [
    { title: 'Enerlova | Crear Contratante' },
    { description: 'Crea un nuevo contratante en el sistema' }
  ];
}

export default function CrearContratante() {
  return (
    <div>
      <CrearContratanteComponent />
    </div>
  );
}
