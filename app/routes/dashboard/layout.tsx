import React from 'react';

import { Outlet, useRouteError } from 'react-router';

import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { AppSidebar } from '~/components/sidebar/app-sidebar';
import { SiteHeader } from '~/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorBoundaryComponent error={error} />;
}

export default DashboardLayout;
