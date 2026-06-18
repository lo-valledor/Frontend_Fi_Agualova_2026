/* eslint-disable no-empty-pattern */
import { AuthLayout } from '~/components/auth/auth-layout';
import { ForgotForm } from '~/components/auth/forgot-form';

import type { Route } from './+types/forgot-password';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Recuperar Contraseña' },
    { name: 'description', content: 'Agualova | Recuperar Contraseña' }
  ];
}

const ForgotPassword = () => {
  return (
    <AuthLayout title='Recuperar Contraseña'>
      <ForgotForm />
    </AuthLayout>
  );
};

export default ForgotPassword;
