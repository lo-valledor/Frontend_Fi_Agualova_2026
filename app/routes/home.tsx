// eslint-disable no-empty-pattern
import { AutoRedirect } from '~/components/auth/auto-redirect';
import type { Route } from './+types/home';
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Inicio' },
    { name: 'description', content: 'Enerlova | Inicio' },
  ];
}

useLayoutEffect(() => {
  const navigate = useNavigate();
  const isAuth = sessionStorage.getItem('token');
  if (isAuth) {
    navigate('/dashboard');
  } else {
    navigate('/auth/login');
  }
});

export default function Home() {
  return <AutoRedirect loadingMessage="Redirigiendo..." />;
}
