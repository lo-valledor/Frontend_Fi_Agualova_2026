// src/components/sidebar/site-header.tsx
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { useAuth } from '~/context/AuthContext';
import { useBreadcrumbs } from '~/context/BreadcrumbContext';

import { ModeToggle } from '../mode-toggle';
// Importa el hook del contexto
import { NavUser } from './nav-user';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

export function SiteHeader() {
  // Obtén los breadcrumbs desde el contexto
  const { breadcrumbItems } = useBreadcrumbs();
  const { user } = useAuth();

  // Detectar si es entorno UAT o Core basado en variables de entorno
  const isUAT = import.meta.env.VITE_APP_ENV === 'uat';
  const environment = isUAT ? 'Sistema UAT' : 'Sistema Core';

  return (
    <header className='sticky top-0 z-10 bg-background group-has-data-[collapsible=icon]/sidebar-wrapper:h-10 sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-10 sm:h-12 shrink-0 items-center gap-1 sm:gap-2 border-b transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-0.5 sm:-ml-1 h-6 w-6 sm:h-8 sm:w-8' />
        <Separator
          orientation='vertical'
          className='mx-1 sm:mx-2 data-[orientation=vertical]:h-3 sm:data-[orientation=vertical]:h-4'
        />
        <div className='flex justify-between w-full items-center'>
          <h1 className='text-sm sm:text-base font-medium'>
            <Breadcrumb>
              <BreadcrumbList className='text-xs sm:text-sm'>
                <BreadcrumbLink
                  href='/dashboard'
                  className='truncate max-w-[60px] sm:max-w-none'
                >
                  Dashboard
                </BreadcrumbLink>
                <BreadcrumbSeparator className='hidden sm:block' />
                {/* Renderiza los items del contexto */}
                {breadcrumbItems?.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem className='hidden sm:block'></BreadcrumbItem>
                    <BreadcrumbItem
                      className={
                        index === breadcrumbItems.length - 1
                          ? 'block'
                          : 'hidden sm:block'
                      }
                    >
                      {item.href ? (
                        <BreadcrumbLink
                          href={item.href}
                          className='truncate max-w-[100px] sm:max-w-none'
                        >
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className='truncate max-w-[100px] sm:max-w-none'>
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < (breadcrumbItems?.length || 0) - 1 && (
                      <BreadcrumbSeparator className='hidden sm:block' />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </h1>
          <div className='flex items-center gap-1 sm:gap-2 ml-auto'>
            <div>
              <Badge variant='outline' className='px-2 py-1'>
                <Label className='text-xs text-primary'>{environment}</Label>
              </Badge>
            </div>
            <div className='hidden sm:block'>
              <ModeToggle />
            </div>
            <div>
              {user && (
                <NavUser
                  user={{
                    name: user.fullName || user.username || 'Usuario',
                    username: user.username,
                    avatar: '', // Si tienes avatar, pon user.avatar aquí
                    role: user.role || 'Usuario'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
