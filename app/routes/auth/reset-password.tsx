/* eslint-disable no-empty-pattern */
import { useSearchParams } from 'react-router';

import { AuthLayout } from '~/components/auth/auth-layout';
import { ResetForm } from '~/components/auth/reset-form';

import type { Route } from './+types/reset-password';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Restablecer Contraseña' },
    { name: 'description', content: 'Agualova | Restablecer Contraseña' }
  ];
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  return (
    <AuthLayout title="Restablecer Contraseña">
      <ResetForm email={email || undefined} token={token || undefined} />
    </AuthLayout>
  );
};

export default ResetPassword;
