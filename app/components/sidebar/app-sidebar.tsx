import * as React from "react";
import {
  BookOpen,
  Bot,
  File,
  Settings2,
  SquareTerminal,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { Input } from "../ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const data = {
  user: {
    name: "Usuario",
    username: "usuario~enerlova.cl",
    avatar: "https://github.com/shadcn.png",
  },
  navClouds: [
    {
      title: "Monitor",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Monitor de Lecturas",
          url: "/dashboard/monitor/monitor-lecturas",
        },
        {
          title: "Exportar Lecturas",
          url: "/dashboard/monitor/exportar-lecturas",
        },
      ],
    },
    {
      title: "Operaciones",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Periodo Facturación",
          url: "/dashboard/operaciones/periodo-facturacion",
        },
        {
          title: "Precios Cargo",
          url: "/dashboard/operaciones/precios-cargo",
        },
        {
          title: "Revisar Precio",
          url: "/dashboard/operaciones/revisar-precio",
        },
        {
          title: "Preparar Lecturas",
          url: "/dashboard/operaciones/preparar-lecturas",
        },
        {
          title: "Cerrar Lecturas",
          url: "/dashboard/operaciones/cerrar-lecturas",
        },
        {
          title: "Revisar Calculo Factura",
          url: "/dashboard/operaciones/revisar-calculo-factura",
        },
        {
          title: "Cambio Medidor",
          url: "/dashboard/operaciones/cambio-medidor",
        },
        {
          title: "Corte y Reposición",
          url: "/dashboard/operaciones/corte-reposicion",
        },
        {
          title: "Crear Archivos SAP",
          url: "/dashboard/operaciones/crear-archivos-sap",
        },
        {
          title: "Anular Factura Imp.",
          url: "/dashboard/operaciones/anular-factura-impresa",
        },
      ],
    },
    {
      title: "Administracion",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Usuarios",
          url: "/dashboard/administracion/usuarios",
        },
        {
          title: "Contratos",
          url: "/dashboard/administracion/contratos",
        },
        {
          title: "Clientes",
          url: "/dashboard/administracion/clientes",
        },
        {
          title: "Medidores",
          url: "/dashboard/administracion/medidores",
        },
        {
          title: "Acometida",
          url: "/dashboard/administracion/acometida",
        },
        {
          title: "Cargo Facturable",
          url: "/dashboard/administracion/cargo-facturable",
        },
        {
          title: "Cargo Tipo Contrato",
          url: "/dashboard/administracion/cargo-tipo-contrato",
        },
        {
          title: "Condiciones de Contrato",
          url: "/dashboard/administracion/condiciones-contrato",
        },
      ],
    },
    {
      title: "Mantencion",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Zonas",
          url: "/dashboard/mantencion/zonas",
        },
        {
          title: "Sector",
          url: "/dashboard/mantencion/sector",
        },
        {
          title: "Nichos",
          url: "/dashboard/mantencion/nichos",
        },
        {
          title: "Empalmes",
          url: "/dashboard/mantencion/empalmes",
        },
        {
          title: "Marcas",
          url: "/dashboard/mantencion/marcas",
        },
        {
          title: "Ciclos de Facturación",
          url: "/dashboard/mantencion/ciclos-facturacion",
        },
        {
          title: "Claves",
          url: "/dashboard/mantencion/claves",
        },
        {
          title: "Tipos de Contratos",
          url: "/dashboard/mantencion/tipos-contratos",
        },
        {
          title: "Conceptos",
          url: "/dashboard/mantencion/conceptos",
        },
        {
          title: "Tarifas",
          url: "/dashboard/mantencion/tarifas",
        },
        {
          title: "Parametros",
          url: "/dashboard/mantencion/parametros",
        },
      ],
    },
    {
      title: "Reportes",
      url: "#",
      icon: File,
      items: [
        {
          title: "Consultar Contrato",
          url: "/dashboard/reportes/consultar-contrato",
        },
        {
          title: "Resumen de Facturación",
          url: "/dashboard/reportes/resumen-facturacion",
        },
        {
          title: "Ver Facturas",
          url: "/dashboard/reportes/ver-facturas",
        },
      ],
    },
  ],
  navMain: [
    {
      title: "Monitor",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Monitor de Lecturas",
          url: "/dashboard/monitor/monitor-lecturas",
        },
      ],
    },
    {
      title: "Operaciones",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Periodo Facturación",
          url: "/dashboard/operaciones/periodo-facturacion",
        },
        {
          title: "Precios Cargo",
          url: "/dashboard/operaciones/precios-cargo",
        },
        {
          title: "Revisar Precio",
          url: "/dashboard/operaciones/revisar-precio",
        },
        {
          title: "Preparar Lecturas",
          url: "/dashboard/operaciones/preparar-lecturas",
        },
        {
          title: "Cerrar Lecturas",
          url: "/dashboard/operaciones/cerrar-lecturas",
        },
        {
          title: "Revisar Calculo Factura",
          url: "/dashboard/operaciones/revisar-calculo-factura",
        },
        {
          title: "Cambio Medidor",
          url: "/dashboard/operaciones/cambio-medidor",
        },
        {
          title: "Corte y Reposición",
          url: "/dashboard/operaciones/corte-reposicion",
        },
        {
          title: "Crear Archivos SAP",
          url: "/dashboard/operaciones/crear-archivos-sap",
        },
        {
          title: "Anular Factura Imp.",
          url: "/dashboard/operaciones/anular-factura-impresa",
        },
        {
          title: "Factura Anticipada",
          url: "/dashboard/operaciones/factura-anticipada",
        },
      ],
    },
    {
      title: "Administracion",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Usuarios",
          url: "/dashboard/administracion/usuarios",
        },
        {
          title: "Contratos",
          url: "/dashboard/administracion/contratos",
        },
        {
          title: "Clientes",
          url: "/dashboard/administracion/clientes",
        },
        {
          title: "Medidores",
          url: "/dashboard/administracion/medidores",
        },
        {
          title: "Acometida",
          url: "/dashboard/administracion/acometida",
        },
        {
          title: "Cargo Facturable",
          url: "/dashboard/administracion/cargo-facturable",
        },
        {
          title: "Cargo Tipo Contrato",
          url: "/dashboard/administracion/cargo-tipo-contrato",
        },
        {
          title: "Condiciones de Contrato",
          url: "/dashboard/administracion/condiciones-contrato",
        },
      ],
    },
    {
      title: "Mantencion",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Zonas",
          url: "/dashboard/mantencion/zonas",
        },
        {
          title: "Sector",
          url: "/dashboard/mantencion/sector",
        },
        {
          title: "Nichos",
          url: "/dashboard/mantencion/nichos",
        },
        {
          title: "Empalmes",
          url: "/dashboard/mantencion/empalmes",
        },
        {
          title: "Marcas",
          url: "/dashboard/mantencion/marcas",
        },
        {
          title: "Ciclos de Facturación",
          url: "/dashboard/mantencion/ciclos-facturacion",
        },
        {
          title: "Claves",
          url: "/dashboard/mantencion/claves",
        },
        {
          title: "Tipos de Contratos",
          url: "/dashboard/mantencion/tipos-contratos",
        },
        {
          title: "Conceptos",
          url: "/dashboard/mantencion/conceptos",
        },
        {
          title: "Tarifas",
          url: "/dashboard/mantencion/tarifas",
        },
        {
          title: "Parametros",
          url: "/dashboard/mantencion/parametros",
        },
      ],
    },
    {
      title: "Reportes",
      url: "#",
      icon: File,
      items: [
        {
          title: "Consultar Contrato",
          url: "/dashboard/reportes/consultar-contrato",
        },
        {
          title: "Resumen de Facturación",
          url: "/dashboard/reportes/resumen-facturacion",
        },
        {
          title: "Ver Facturas",
          url: "/dashboard/reportes/ver-facturas",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [search, setSearch] = React.useState("");

  // Función para verificar si una ruta está activa
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Filtrado de grupos y opciones según búsqueda
  const filteredGroups = data.navClouds
    .map((group) => {
      const filteredItems = group.items.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      return filteredItems.length > 0
        ? { ...group, items: filteredItems }
        : null;
    })
    .filter(Boolean);

  return (
    <Sidebar
      className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      {...props}
    >
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-border/40 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar opción..."
          className="bg-muted/50 border-border/70 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <SidebarContent className="p-0">
        {filteredGroups.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            Sin resultados
          </div>
        ) : (
          filteredGroups.map((group) => {
            if (!group) return null;
            return (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="px-6 text-xs font-medium text-muted-foreground">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = isActiveRoute(item.url);
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`group transition-colors hover:bg-accent/50 active:bg-accent ${
                              isActive ? "bg-sky-500/20 text-sky-500" : ""
                            }`}
                          >
                            <Link
                              to={item.url}
                              className={`flex items-center gap-2 ${
                                isActive
                                  ? "bg-sky-500/20"
                                  : "hover:bg-sky-500/20"
                              }`}
                            >
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                  isActive
                                    ? "bg-sky-500/30 text-sky-500"
                                    : "bg-muted/50 text-muted-foreground transition-colors group-hover:bg-sky-500/20 group-hover:text-sky-500"
                                }`}
                              >
                                <group.icon className="h-4 w-4" />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isActive
                                    ? "text-sky-500 font-semibold"
                                    : "text-muted-foreground group-hover:text-foreground"
                                }`}
                              >
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-6">
        <p className="text-xs text-muted-foreground">
          © 2024 Enerlova. Todos los derechos reservados.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
