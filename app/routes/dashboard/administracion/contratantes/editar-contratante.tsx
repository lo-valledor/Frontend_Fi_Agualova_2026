import EditarContratanteComponent from '~/components/administracion/contratantes/form/editar-contratante-component';

export function meta() {
  return [
    { title: 'Agualova | Editar Contratante' },
    { description: 'Edita un contratante existente en el sistema' }
  ];
}

export default function EditarContratante() {
  return (
    <div>
      <EditarContratanteComponent />
    </div>
  );
}
