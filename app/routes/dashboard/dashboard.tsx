/* eslint-disable no-empty-pattern */

import type { Route } from './+types/dashboard';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Inicio' },
    { name: 'description', content: 'Dashboard' },
  ];
}

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">Dashboard</div>
  );
};

export default DashboardPage;
