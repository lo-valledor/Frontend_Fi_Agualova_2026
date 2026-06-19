import React from 'react';
import EditarClienteComponent from '~/components/administracion/clientes/form/editar-cliente-component';

export function meta() {
  return [
    { title: 'Agualova | Editar Cliente' },
    { description: 'Edita un cliente existente en el sistema' }
  ];
}

export default function EditarCliente() {
  return (
    <div>
      <EditarClienteComponent />
    </div>
  );
}
