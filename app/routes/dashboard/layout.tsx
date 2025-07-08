import React from 'react';
import { SiteHeader } from '~/components/sidebar/site-header';
import { SidebarInset } from '~/components/ui/sidebar';
import { AppSidebar } from '~/components/sidebar/app-sidebar';
import { SidebarProvider } from '~/components/ui/sidebar';
import { Outlet, useRouteError } from 'react-router';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
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
