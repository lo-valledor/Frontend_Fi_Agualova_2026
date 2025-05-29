import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/login", "routes/auth/login.tsx"),
  layout("routes/dashboard/layout.tsx", [
    ...prefix("dashboard", [
      index("routes/dashboard/dashboard.tsx"),
      ...prefix("monitor", [
        route(
          "monitor-lecturas",
          "routes/dashboard/monitor/monitor-lecturas.tsx"
        ),
        route(
          "exportar-lecturas",
          "routes/dashboard/monitor/exportar-lecturas.tsx"
        ),
      ]),
      ...prefix("operaciones", [
        route(
          "periodo-facturacion",
          "routes/dashboard/operaciones/periodo-facturacion.tsx"
        ),
        route(
          "precios-cargo",
          "routes/dashboard/operaciones/precios-cargo.tsx"
        ),
        route(
          "revisar-precio",
          "routes/dashboard/operaciones/revisar-precio.tsx"
        ),
        route(
          "preparar-lecturas",
          "routes/dashboard/operaciones/preparar-lecturas.tsx"
        ),
        route(
          "cerrar-lecturas",
          "routes/dashboard/operaciones/cerrar-lecturas.tsx"
        ),
        route(
          "revisar-calculo-factura",
          "routes/dashboard/operaciones/revisar-calculo-factura.tsx"
        ),
        route(
          "cambio-medidor",
          "routes/dashboard/operaciones/cambio-medidor.tsx"
        ),
        route(
          "corte-reposicion",
          "routes/dashboard/operaciones/corte-reposicion.tsx"
        ),
        route(
          "crear-archivos-sap",
          "routes/dashboard/operaciones/crear-archivos-sap.tsx"
        ),

        route(
          "anular-factura-impresa",
          "routes/dashboard/operaciones/anular-factura-impresa.tsx"
        ),
        route(
          "factura-anticipada",
          "routes/dashboard/operaciones/factura-anticipada.tsx"
        ),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
