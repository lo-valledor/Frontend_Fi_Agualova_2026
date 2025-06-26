// src/components/sidebar/site-header.tsx
import React from 'react';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { ModeToggle } from '../mode-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { useBreadcrumbs } from '~/context/BreadcrumbContext'; // Importa el hook del contexto
import { NavUser } from './nav-user';
import { useAuth } from '~/context/AuthContext';

export function SiteHeader() {
  // Obtén los breadcrumbs desde el contexto
  const { breadcrumbItems } = useBreadcrumbs();
  const { user } = useAuth();

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex justify-between w-full items-center">
          <h1 className="text-base font-medium">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                <BreadcrumbSeparator />
                {/* Renderiza los items del contexto */}
                {breadcrumbItems?.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem></BreadcrumbItem>
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < (breadcrumbItems?.length || 0) - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </h1>
          <div className="flex items-center gap-2 ml-auto">
            <ModeToggle />
            {user && (
              <NavUser
                user={{
                  name: user.fullName || user.username || 'Usuario',
                  username: user.username,
                  avatar: '', // Si tienes avatar, pon user.avatar aquí
                  role: user.role || 'Usuario',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
