import React from 'react';
import CrearClienteComponent from '~/components/administracion/clientes/form/crear-cliente-component';

export function meta() {
  return [
    { title: 'Enerlova | Crear Cliente' },
    { description: 'Crea un nuevo cliente en el sistema' }
  ];
}

export default function CrearCliente() {
  return (
    <div>
      <CrearClienteComponent />
    </div>
  );
}
