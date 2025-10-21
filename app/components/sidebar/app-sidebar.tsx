import {
  BarChart3,
  ChevronRight,
  FileText,
  Settings,
  Settings2,
  Users,
  Wrench
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import * as React from 'react';
import { Link, useLocation } from 'react-router';

import { useDebounce } from '~/hooks/shared/use-debounce';

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

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

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
    /* {
      title: 'Análisis',
      url: '#',
      icon: Activity,
      items: [
        {
          title: 'Análisis de Actividad',
          url: '/dashboard/activity-analytics',
        },
      ],
    }, */
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
        /* {
          title: 'Ver Facturas',
          url: '/dashboard/reportes/ver-facturas',
        }, */
      ]
    },
    {
      title: 'Configuración	',
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

  // Función para filtrar elementos basada en la búsqueda
  const filteredNavMain = React.useMemo(() => {
    if (!debouncedSearch.trim()) {
      return data.navMain;
    }

    const searchLower = debouncedSearch.toLowerCase();
    return data.navMain
      .map(section => {
        const filteredItems = section.items.filter(
          item =>
            item.title.toLowerCase().includes(searchLower) ||
            section.title.toLowerCase().includes(searchLower)
        );

        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...section,
          items: filteredItems
        };
      })
      .filter(section => section !== null) as typeof data.navMain;
  }, [debouncedSearch]);

  // Función para verificar si una ruta está activa
  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

  return (
    <Sidebar {...props}>
      {/* Header mejorado con gradiente */}
      <SidebarHeader className='border-b border-primary'>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SearchForm onSearchChange={setSearchTerm} searchTerm={searchTerm} />
        </motion.div>
      </SidebarHeader>

      <SidebarContent className='gap-1 px-2 sm:px-3 py-2 sm:py-3'>
        <AnimatePresence>
          {filteredNavMain.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-1 sm:space-y-2'
            >
              {filteredNavMain.map((item, index) => {
                // Verificar si alguno de los items del submenú coincide con la ruta actual
                const isActive = item.items?.some(
                  subItem => location.pathname === subItem.url
                );

                return (
                  <motion.div
                    key={item.title}
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                    transition={{ delay: index * 0.1 }}
                  >
                    <Collapsible
                      title={item.title}
                      defaultOpen={isActive}
                      className='group/collapsible'
                    >
                      <SidebarGroup className='mb-1'>
                        <SidebarGroupLabel
                          asChild
                          className='group/label text-sidebar-foreground/90 hover:text-sidebar-accent-foreground text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 border border-transparent hover:border-border'
                        >
                          <CollapsibleTrigger className='w-full px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between group'>
                            <div className='flex items-center gap-2 sm:gap-3'>
                              {item.icon && (
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 17
                                  }}
                                  className='flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300'
                                >
                                  <item.icon className='h-3 w-3 sm:h-4 sm:w-4' />
                                </motion.div>
                              )}
                              <span className='truncate font-medium'>
                                {item.title}
                              </span>
                            </div>
                            <motion.div
                              initial={{ rotate: 0 }}
                              whileHover={{ rotate: 90 }}
                              transition={{ duration: 0.2 }}
                              className='group-data-[state=open]/collapsible:rotate-90 transition-transform duration-300'
                            >
                              <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4 opacity-70 group-hover:opacity-100 transition-opacity' />
                            </motion.div>
                          </CollapsibleTrigger>
                        </SidebarGroupLabel>

                        <CollapsibleContent className='overflow-hidden'>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <SidebarGroupContent className='pt-1 sm:pt-2 ml-1 sm:ml-2 border-l border-border'>
                              <SidebarMenu className='space-y-0.5 sm:space-y-1'>
                                {item.items.map((menuItem, menuIndex) => (
                                  <motion.div
                                    key={menuItem.title}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: menuIndex * 0.05 }}
                                  >
                                    <SidebarMenuItem>
                                      <SidebarMenuButton
                                        asChild
                                        isActive={isActiveRoute(menuItem.url)}
                                        className='rounded-xl transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:border data-[active=true]:border-border hover:border hover:border-border ml-2 sm:ml-4'
                                      >
                                        <motion.div
                                          whileHover={{ x: 4 }}
                                          transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 17
                                          }}
                                          className='w-full'
                                        >
                                          <Link
                                            to={menuItem.url}
                                            className='px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 w-full'
                                          >
                                            <motion.div
                                              className='w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current opacity-50'
                                              whileHover={{
                                                scale: 1.5,
                                                opacity: 1
                                              }}
                                              transition={{ duration: 0.2 }}
                                            />
                                            <span className='truncate'>
                                              {menuItem.title}
                                            </span>
                                          </Link>
                                        </motion.div>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  </motion.div>
                                ))}
                              </SidebarMenu>
                            </SidebarGroupContent>
                          </motion.div>
                        </CollapsibleContent>
                      </SidebarGroup>
                    </Collapsible>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className='flex items-center justify-center py-8 sm:py-12 text-center'
            >
              <div className='space-y-2 sm:space-y-3 max-w-[180px] sm:max-w-[200px] px-2'>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className='mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center'
                >
                  <div className='w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary opacity-50' />
                </motion.div>
                <div className='text-muted-foreground text-xs sm:text-sm leading-relaxed'>
                  No se encontraron resultados para{' '}
                  <span className='font-medium text-primary'>
                    "{searchTerm}"
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm('')}
                  className='text-xs text-primary hover:text-primary/80 hover:underline bg-muted/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border transition-all duration-200'
                >
                  Limpiar búsqueda
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
