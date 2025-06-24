import React from 'react';
import { SiteHeader } from '~/components/sidebar/site-header';
import { SidebarInset } from '~/components/ui/sidebar';
import { AppSidebar } from '~/components/sidebar/app-sidebar';
import { SidebarProvider } from '~/components/ui/sidebar';
import { Outlet } from 'react-router';

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

export default DashboardLayout;
