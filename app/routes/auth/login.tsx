/* eslint-disable no-empty-pattern */
import { AuthLayout } from '~/components/auth/auth-layout';
import { LoginForm } from '~/components/auth/login-form';

import type { Route } from './+types/login';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Login' },
    { name: 'description', content: 'Agualova | Login' }
  ];
}

const Login = () => {
  return (
    <AuthLayout title="Iniciar Sesión">
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
