import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { SearchForm } from './search-form';
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

// This is sample data.
const data = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  navMain: [
    {
      title: 'Monitor',
      url: '#',
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
      items: [
        {
          title: 'Periodo Facturación',
          url: '/dashboard/operaciones/periodo-facturacion',
        },
        {
          title: 'Precios de Cargos',
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
          title: 'Revisar Calculo de Factura',
          url: '/dashboard/operaciones/revisar-calculo-factura',
        },
        {
          title: 'Cambio de Medidor',
          url: '/dashboard/operaciones/cambio-medidor',
        },
        {
          title: 'Corte de Reposición',
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
          title: 'Ciclos de Facturación',
          url: '/dashboard/mantencion/ciclos-facturacion',
        },
        {
          title: 'Claves',
          url: '/dashboard/mantencion/claves',
        },
        {
          title: 'Tipos de Contratos',
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
    {
      title: 'Reportes',
      url: '#',
      items: [
        {
          title: 'Consultar Contrato',
          url: '/dashboard/reportes/consultar-contrato',
        },
        {
          title: 'Resumen de Facturación',
          url: '/dashboard/reportes/resumen-facturacion',
        },
        {
          title: 'Ver Facturas',
          url: '/dashboard/reportes/ver-facturas',
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
      .map((section) => {
        const filteredItems = section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchLower) ||
            section.title.toLowerCase().includes(searchLower),
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
      <SidebarHeader className="border-b border-border/50 pb-2">
        <SearchForm onSearchChange={setSearchTerm} searchTerm={searchTerm} />
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2 py-2">
        {filteredNavMain.length > 0 ? (
          filteredNavMain.map((item) => (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sm font-medium rounded-md transition-all duration-200"
                >
                  <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between">
                    <span className="truncate">{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-60" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                  <SidebarGroupContent className="pt-1">
                    <SidebarMenu>
                      {item.items.map((menuItem) => (
                        <SidebarMenuItem key={menuItem.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActiveRoute(menuItem.url)}
                            className="rounded-md transition-all duration-200 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                          >
                            <Link
                              to={menuItem.url}
                              className="px-3 py-2 text-sm"
                            >
                              {menuItem.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))
        ) : (
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">
                No se encontraron resultados para "{searchTerm}"
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-primary hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
