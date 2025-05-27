import {
  type RouteConfig,
  index,
  prefix,
  layout,
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
    ]),
  ]),
] satisfies RouteConfig;
