import React, { useEffect, useState } from 'react';

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
import { NavUser } from './nav-user';

export function SiteHeader() {
  const { breadcrumbItems } = useBreadcrumbs();
  const { user } = useAuth();
  const [clock, setClock] = useState('');

  const isUAT = window.location.hostname !== 'enerlova.mmlovalledor.cl';
  const environment = isUAT ? 'UAT' : 'CORE';

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      );
    };
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className='sticky top-0 z-10 bg-background/95 backdrop-blur-sm group-has-data-[collapsible=icon]/sidebar-wrapper:h-10 sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-11 flex h-10 sm:h-11 shrink-0 items-center border-b transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-5'>
        <SidebarTrigger className='-ml-0.5 sm:-ml-1 h-6 w-6 sm:h-7 sm:w-7' />
        <Separator
          orientation='vertical'
          className='mx-1 sm:mx-2 data-[orientation=vertical]:h-3 sm:data-[orientation=vertical]:h-4'
        />

        {/* Breadcrumb */}
        <div className='flex-1 min-w-0'>
          <Breadcrumb>
            <BreadcrumbList className='text-xs sm:text-sm flex-nowrap'>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href='/dashboard'
                  className='truncate max-w-[60px] sm:max-w-none text-muted-foreground hover:text-foreground transition-colors'
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems?.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator className='hidden sm:block' />
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
                        className='truncate max-w-[100px] sm:max-w-none text-muted-foreground hover:text-foreground transition-colors'
                      >
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className='truncate max-w-[120px] sm:max-w-none font-medium'>
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Status bar right */}
        <div className='flex items-center gap-2 sm:gap-3 ml-auto shrink-0'>
          {/* Clock */}
          <span className='hidden md:block text-[0.65rem] font-mono text-muted-foreground tabular-nums tracking-wider'>
            {clock}
          </span>

          {/* Environment badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[0.6rem] font-bold tracking-[0.12em] uppercase border ${
              isUAT
                ? 'border-energy/40 text-energy bg-energy/8'
                : 'border-chart-2/40 text-chart-2 bg-chart-2/8'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isUAT ? 'bg-energy' : 'bg-chart-2'
              }`}
            />
            {environment}
          </div>

          {/* Theme toggle */}
          <div className='hidden sm:block'>
            <ModeToggle />
          </div>

          {/* User */}
          {user && (
            <NavUser
              user={{
                name: user.fullName || user.username || 'Usuario',
                username: user.username,
                avatar: '',
                role: user.role || 'Usuario'
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
