import {
  BarChart3,
  ChevronRight,
  FileText,
  Lock,
  Settings,
  Settings2,
  Users,
  Wrench
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import * as React from 'react';
import { Link, useLocation } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { useDebounce } from '~/hooks/shared/use-debounce';
import { usePeriodoAbierto } from '~/hooks/use-operaciones';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '~/components/ui/sidebar';

import { SearchForm } from './search-form';

// This is sample data.
const data = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  navMain: [
    {
      title: 'Monitor',
      url: '#',
      icon: BarChart3,
      items: [
        {
          title: 'Monitor de Lecturas',
          url: '/dashboard/monitor/monitor-lecturas'
        },
        {
          title: 'Exportar Lecturas',
          url: '/dashboard/monitor/exportar-lecturas'
        },
        {
          title: 'Importar Lecturas',
          url: '/dashboard/monitor/importar-lecturas'
        }
      ]
    },
    {
      title: 'Operaciones',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'Periodo Facturación',
          url: '/dashboard/operaciones/periodo-facturacion'
        },
        {
          title: 'Precios Cargos',
          url: '/dashboard/operaciones/precios-cargo'
        },
        {
          title: 'Revisar Precio',
          url: '/dashboard/operaciones/revisar-precio'
        },
        {
          title: 'Preparar Lecturas',
          url: '/dashboard/operaciones/preparar-lecturas'
        },
        {
          title: 'Cerrar Lecturas',
          url: '/dashboard/operaciones/cerrar-lecturas'
        },
        {
          title: 'Revisar Calculo Facturas',
          url: '/dashboard/operaciones/revisar-calculo-factura'
        },
        {
          title: 'Cambio Medidor',
          url: '/dashboard/operaciones/cambio-medidor'
        },
        {
          title: 'Corte y Reposición',
          url: '/dashboard/operaciones/corte-reposicion'
        },
        {
          title: 'Crear Archivos SAP',
          url: '/dashboard/operaciones/crear-archivos-sap'
        },
        {
          title: 'Anular Factura Impresa',
          url: '/dashboard/operaciones/anular-factura-impresa'
        }
      ]
    },
    {
      title: 'Administracion',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'Usuarios',
          url: '/dashboard/administracion/usuarios'
        },
        {
          title: 'Contratos',
          url: '/dashboard/administracion/contratos'
        },
        {
          title: 'Clientes',
          url: '/dashboard/administracion/clientes'
        },
        {
          title: 'Propietarios',
          url: '/dashboard/administracion/propietarios'
        },
        {
          title: 'Contratantes',
          url: '/dashboard/administracion/contratantes'
        },
        {
          title: 'Medidores',
          url: '/dashboard/administracion/medidores'
        },
        {
          title: 'Acometida',
          url: '/dashboard/administracion/acometida'
        },
        {
          title: 'Cargo Facturable',
          url: '/dashboard/administracion/cargo-facturable'
        },
        {
          title: 'Cargo Tipo Contrato',
          url: '/dashboard/administracion/cargo-tipo-contrato'
        },
        {
          title: 'Condiciones Contrato',
          url: '/dashboard/administracion/condiciones-contrato'
        }
      ]
    },
    {
      title: 'Mantencion',
      url: '#',
      icon: Wrench,
      items: [
        {
          title: 'Zonas',
          url: '/dashboard/mantencion/zonas'
        },
        {
          title: 'Sector',
          url: '/dashboard/mantencion/sector'
        },
        {
          title: 'Nichos',
          url: '/dashboard/mantencion/nichos'
        },
        {
          title: 'Empalmes',
          url: '/dashboard/mantencion/empalmes'
        },
        {
          title: 'Marcas',
          url: '/dashboard/mantencion/marcas'
        },
        {
          title: 'Ciclos Facturación',
          url: '/dashboard/mantencion/ciclos-facturacion'
        },
        {
          title: 'Claves',
          url: '/dashboard/mantencion/claves'
        },
        {
          title: 'Tipos Contrato',
          url: '/dashboard/mantencion/tipos-contratos'
        },
        {
          title: 'Conceptos',
          url: '/dashboard/mantencion/conceptos'
        },
        {
          title: 'Tarifas',
          url: '/dashboard/mantencion/tarifas'
        },
        {
          title: 'Parametros',
          url: '/dashboard/mantencion/parametros'
        }
      ]
    },
    {
      title: 'Reportes',
      url: '#',
      icon: FileText,
      items: [
        {
          title: 'Consultar Contrato',
          url: '/dashboard/reportes/consultar-contrato'
        },
        {
          title: 'Resumen Facturación',
          url: '/dashboard/reportes/resumen-facturacion'
        }
      ]
    },
    {
      title: 'Configuración',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'Roles y Permisos',
          url: '/dashboard/configuracion/roles-permisos'
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { canView } = useAuth();
  const { periodoAbierto } = usePeriodoAbierto();

  const hasPeriodoAbierto = periodoAbierto.length > 0;

  const filteredNavMain = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return data.navMain
      .map(section => {
        const filteredItems = section.items
          .map(item => {
            if (!canView(item.url)) {
              return null;
            }

            const isOperacionesItem = section.title === 'Operaciones';
            const isPeriodoFacturacionItem =
              isOperacionesItem && item.title === 'Periodo Facturación';
            const isDisabled =
              isOperacionesItem &&
              !hasPeriodoAbierto &&
              !isPeriodoFacturacionItem;

            return {
              ...item,
              disabled: isDisabled
            };
          })
          .filter(item => item !== null)
          .filter(item => {
            if (debouncedSearch.trim()) {
              return (
                item.title.toLowerCase().includes(searchLower) ||
                section.title.toLowerCase().includes(searchLower)
              );
            }
            return true;
          });

        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...section,
          items: filteredItems
        };
      })
      .filter(section => section !== null) as typeof data.navMain;
  }, [debouncedSearch, canView, hasPeriodoAbierto]);

  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

  return (
    <Sidebar {...props}>
      {/* ── Branded Header ── */}
      <SidebarHeader className='border-b border-sidebar-border px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md'>
            <img src='/logo-enerlova.png' alt='Logo' width={32} height={32} />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-black tracking-tight leading-none'>
              ENERLOVA
            </span>
          </div>
        </div>
        <div className='mt-3'>
          <SearchForm onSearchChange={setSearchTerm} searchTerm={searchTerm} />
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className='px-2 py-2 gap-0'>
        <AnimatePresence mode='wait'>
          {filteredNavMain.length > 0 ? (
            <motion.div
              key='nav-list'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='space-y-0.5'
            >
              {filteredNavMain.map((item, sectionIndex) => {
                const isActive = item.items?.some(
                  subItem => location.pathname === subItem.url
                );
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: sectionIndex * 0.04,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    <Collapsible
                      title={item.title}
                      defaultOpen={isActive}
                      className='group/collapsible'
                    >
                      <SidebarGroup className='py-0'>
                        <SidebarGroupLabel
                          asChild
                          className='group/label text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-md transition-colors duration-150 h-auto'
                        >
                          <CollapsibleTrigger className='w-full px-2 py-2 flex items-center justify-between'>
                            <div className='flex items-center gap-2.5'>
                              {item.icon && (
                                <div className='flex h-6 w-6 items-center justify-center rounded bg-sidebar-accent/80 text-sidebar-accent-foreground'>
                                  <item.icon className='h-3.5 w-3.5' />
                                </div>
                              )}
                              <span className='text-xs font-bold tracking-wide uppercase'>
                                {item.title}
                              </span>
                            </div>
                            <ChevronRight className='h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </CollapsibleTrigger>
                        </SidebarGroupLabel>

                        <CollapsibleContent>
                          <SidebarGroupContent className='pt-0.5 pb-1'>
                            <SidebarMenu className='gap-0'>
                              {item.items.map((menuItem, menuIndex) => {
                                const isDisabled =
                                  (menuItem as any).disabled || false;
                                const active =
                                  !isDisabled && isActiveRoute(menuItem.url);

                                return (
                                  <motion.div
                                    key={menuItem.title}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.15,
                                      delay: menuIndex * 0.02,
                                      ease: [0.25, 0.1, 0.25, 1]
                                    }}
                                  >
                                    <SidebarMenuItem>
                                      <SidebarMenuButton
                                        asChild={!isDisabled}
                                        disabled={isDisabled}
                                        isActive={active}
                                        className={`relative rounded-md transition-all duration-150 ml-4 h-auto py-1.5 ${
                                          isDisabled
                                            ? 'opacity-40 cursor-not-allowed'
                                            : active
                                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                              : 'hover:bg-sidebar-accent/40 text-sidebar-foreground/80 hover:text-sidebar-foreground'
                                        }`}
                                        title={
                                          isDisabled
                                            ? 'Debe abrir un período de facturación primero'
                                            : undefined
                                        }
                                      >
                                        {isDisabled ? (
                                          <div className='flex items-center gap-2 px-2 text-xs'>
                                            <Lock className='h-3 w-3 shrink-0 opacity-50' />
                                            <span className='truncate'>
                                              {menuItem.title}
                                            </span>
                                          </div>
                                        ) : (
                                          <Link
                                            to={menuItem.url}
                                            className='flex items-center gap-2 px-2 text-xs w-full'
                                          >
                                            {/* Active indicator strip */}
                                            {active && (
                                              <motion.div
                                                layoutId='sidebar-active-strip'
                                                className='energy-strip energy-strip-active'
                                                transition={{
                                                  type: 'spring',
                                                  stiffness: 500,
                                                  damping: 35
                                                }}
                                              />
                                            )}
                                            <div
                                              className={`w-1 h-1 rounded-full shrink-0 transition-colors duration-150 ${
                                                active
                                                  ? 'bg-energy'
                                                  : 'bg-muted-foreground/30'
                                              }`}
                                            />
                                            <span className='truncate'>
                                              {menuItem.title}
                                            </span>
                                          </Link>
                                        )}
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  </motion.div>
                                );
                              })}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </SidebarGroup>
                    </Collapsible>

                    {/* Industrial divider between sections */}
                    {sectionIndex < filteredNavMain.length - 1 && (
                      <div className='industrial-divider mx-3 my-1' />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key='nav-empty'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex flex-col items-center py-10 px-4 text-center'
            >
              <p className='text-xs text-muted-foreground'>
                Sin resultados para{' '}
                <span className='font-medium text-foreground'>
                  &ldquo;{searchTerm}&rdquo;
                </span>
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className='mt-2 text-xs text-primary hover:underline underline-offset-2'
              >
                Limpiar búsqueda
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
