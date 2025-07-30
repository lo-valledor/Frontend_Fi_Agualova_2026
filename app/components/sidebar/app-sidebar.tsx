import {
  BarChart3,
  ChevronRight,
  FileText,
  Settings,
  Settings2,
  Users,
  Wrench,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import * as React from 'react';

import { Link, useLocation } from 'react-router';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  SidebarRail,
} from '~/components/ui/sidebar';

import { SearchForm } from './search-form';

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
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
          url: '/dashboard/monitor/monitor-lecturas',
        },
        {
          title: 'Exportar Lecturas',
          url: '/dashboard/monitor/exportar-lecturas',
        },
      ],
    },
    {
      title: 'Operaciones',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'Periodo Facturación',
          url: '/dashboard/operaciones/periodo-facturacion',
        },
        {
          title: 'Precios Cargos',
          url: '/dashboard/operaciones/precios-cargo',
        },
        {
          title: 'Revisar Precio',
          url: '/dashboard/operaciones/revisar-precio',
        },
        {
          title: 'Preparar Lecturas',
          url: '/dashboard/operaciones/preparar-lecturas',
        },
        {
          title: 'Cerrar Lecturas',
          url: '/dashboard/operaciones/cerrar-lecturas',
        },
        {
          title: 'Revisar Calculo Facturas',
          url: '/dashboard/operaciones/revisar-calculo-factura',
        },
        {
          title: 'Cambio Medidor',
          url: '/dashboard/operaciones/cambio-medidor',
        },
        {
          title: 'Corte y Reposición',
          url: '/dashboard/operaciones/corte-reposicion',
        },
        {
          title: 'Crear Archivos SAP',
          url: '/dashboard/operaciones/crear-archivos-sap',
        },
        {
          title: 'Anular Factura Impresa',
          url: '/dashboard/operaciones/anular-factura-impresa',
        },
      ],
    },
    {
      title: 'Administracion',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'Usuarios',
          url: '/dashboard/administracion/usuarios',
        },
        {
          title: 'Contratos',
          url: '/dashboard/administracion/contratos',
        },
        {
          title: 'Clientes',
          url: '/dashboard/administracion/clientes',
        },
        {
          title: 'Medidores',
          url: '/dashboard/administracion/medidores',
        },
        {
          title: 'Acometida',
          url: '/dashboard/administracion/acometida',
        },
        {
          title: 'Cargo Facturable',
          url: '/dashboard/administracion/cargo-facturable',
        },
        {
          title: 'Cargo Tipo Contrato',
          url: '/dashboard/administracion/cargo-tipo-contrato',
        },
        {
          title: 'Condiciones Contrato',
          url: '/dashboard/administracion/condiciones-contrato',
        },
      ],
    },
    {
      title: 'Mantencion',
      url: '#',
      icon: Wrench,
      items: [
        {
          title: 'Zonas',
          url: '/dashboard/mantencion/zonas',
        },
        {
          title: 'Sector',
          url: '/dashboard/mantencion/sector',
        },
        {
          title: 'Nichos',
          url: '/dashboard/mantencion/nichos',
        },
        {
          title: 'Empalmes',
          url: '/dashboard/mantencion/empalmes',
        },
        {
          title: 'Marcas',
          url: '/dashboard/mantencion/marcas',
        },
        {
          title: 'Ciclos Facturación',
          url: '/dashboard/mantencion/ciclos-facturacion',
        },
        {
          title: 'Claves',
          url: '/dashboard/mantencion/claves',
        },
        {
          title: 'Tipos Contrato',
          url: '/dashboard/mantencion/tipos-contratos',
        },
        {
          title: 'Conceptos',
          url: '/dashboard/mantencion/conceptos',
        },
        {
          title: 'Tarifas',
          url: '/dashboard/mantencion/tarifas',
        },
        {
          title: 'Parametros',
          url: '/dashboard/mantencion/parametros',
        },
      ],
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
          url: '/dashboard/reportes/consultar-contrato',
        },
        {
          title: 'Resumen Facturación',
          url: '/dashboard/reportes/resumen-facturacion',
        },
        {
          title: 'Ver Facturas',
          url: '/dashboard/reportes/ver-facturas',
        },
      ],
    },
    {
      title: 'Configuración	',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'Roles y Permisos',
          url: '/dashboard/configuracion/roles-permisos',
        },
        {
          title: 'Perfil',
          url: '/dashboard/configuracion/perfil',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Función para filtrar elementos basada en la búsqueda
  const filteredNavMain = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return data.navMain;
    }

    const searchLower = searchTerm.toLowerCase();
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
          items: filteredItems,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [searchTerm]);

  // Función para verificar si una ruta está activa
  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

  return (
    <Sidebar {...props}>
      {/* Header mejorado con gradiente */}
      <SidebarHeader className='border-b border-sky-200 dark:border-sky-800'>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SearchForm onSearchChange={setSearchTerm} searchTerm={searchTerm} />
        </motion.div>
      </SidebarHeader>

      <SidebarContent className='gap-1 px-3 py-3'>
        <AnimatePresence>
          {filteredNavMain.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-2'
            >
              {filteredNavMain.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  transition={{ delay: index * 0.1 }}
                >
                  <Collapsible
                    title={item.title}
                    defaultOpen
                    className='group/collapsible'
                  >
                    <SidebarGroup className='mb-1'>
                      <SidebarGroupLabel
                        asChild
                        className='group/label text-sidebar-foreground/90 hover:text-sidebar-accent-foreground text-sm font-semibold rounded-lg transition-all duration-300 border border-transparent hover:border-sky-200/50 dark:hover:border-sky-700/50  '
                      >
                        <CollapsibleTrigger className='w-full px-4 py-3 flex items-center justify-between group'>
                          <div className='flex items-center gap-3'>
                            {item.icon && (
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 17,
                                }}
                                className='flex h-6 w-6 items-center justify-center rounded-md bg-sky-500 text-white group-hover:from-sky-500/30 group-hover:to-sky-500/30 transition-all duration-300'
                              >
                                <item.icon className='h-4 w-4' />
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
                            <ChevronRight className='h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity' />
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
                          <SidebarGroupContent className='pt-2 ml-2 border-l border-sky-200/50 dark:border-sky-700/50'>
                            <SidebarMenu className='space-y-1'>
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
                                      className='rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-sky-500/10 hover:to-sky-500/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-sky-500/20 data-[active=true]:to-sky-500/20 data-[active=true]:text-sky-900 dark:data-[active=true]:text-sky-100 data-[active=true]:border data-[active=true]:border-sky-200/50 dark:data-[active=true]:border-sky-700/50 hover:border hover:border-sky-200/50 dark:hover:border-sky-700/50 ml-4'
                                    >
                                      <motion.div
                                        whileHover={{ x: 4 }}
                                        transition={{
                                          type: 'spring',
                                          stiffness: 400,
                                          damping: 17,
                                        }}
                                        className='w-full'
                                      >
                                        <Link
                                          to={menuItem.url}
                                          className='px-3 py-2.5 text-sm font-medium flex items-center gap-2 w-full'
                                        >
                                          <motion.div
                                            className='w-1.5 h-1.5 rounded-full bg-current opacity-50'
                                            whileHover={{
                                              scale: 1.5,
                                              opacity: 1,
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
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className='flex items-center justify-center py-12 text-center'
            >
              <div className='space-y-3 max-w-[200px]'>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className='mx-auto w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center'
                >
                  <div className='w-6 h-6 rounded-full bg-sky-500 opacity-50' />
                </motion.div>
                <div className='text-muted-foreground text-sm leading-relaxed'>
                  No se encontraron resultados para{' '}
                  <span className='font-medium text-sky-600 dark:text-sky-400'>
                    "{searchTerm}"
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm('')}
                  className='text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline bg-sky-50/50 dark:bg-sky-900/20 px-3 py-1.5 rounded-full border border-sky-200/50 dark:border-sky-800/50 transition-all duration-200'
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
