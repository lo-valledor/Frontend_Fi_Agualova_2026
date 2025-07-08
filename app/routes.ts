import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('session-expired', 'routes/session-expired.tsx'),
  route('auth/login', 'routes/auth/login.tsx'),
  layout('routes/protected-route.tsx', [
    layout('routes/dashboard/layout.tsx', [
      ...prefix('dashboard', [
        index('routes/dashboard/dashboard.tsx'),
        ...prefix('monitor', [
          route(
            'monitor-lecturas',
            'routes/dashboard/monitor/monitor-lecturas.tsx',
          ),
          route(
            'exportar-lecturas',
            'routes/dashboard/monitor/exportar-lecturas.tsx',
          ),
        ]),
        ...prefix('operaciones', [
          route(
            'periodo-facturacion',
            'routes/dashboard/operaciones/periodo-facturacion.tsx',
          ),
          route(
            'precios-cargo',
            'routes/dashboard/operaciones/precios-cargo.tsx',
          ),
          route(
            'revisar-precio',
            'routes/dashboard/operaciones/revisar-precio.tsx',
          ),
          route(
            'preparar-lecturas',
            'routes/dashboard/operaciones/preparar-lecturas.tsx',
          ),
          route(
            'cerrar-lecturas',
            'routes/dashboard/operaciones/cerrar-lecturas.tsx',
          ),
          route(
            'revisar-calculo-factura',
            'routes/dashboard/operaciones/revisar-calculo-factura.tsx',
          ),
          route(
            'cambio-medidor',
            'routes/dashboard/operaciones/cambio-medidor.tsx',
          ),
          route(
            'corte-reposicion',
            'routes/dashboard/operaciones/corte-reposicion.tsx',
          ),
          route(
            'crear-archivos-sap',
            'routes/dashboard/operaciones/crear-archivos-sap.tsx',
          ),

          route(
            'anular-factura-impresa',
            'routes/dashboard/operaciones/anular-factura-impresa.tsx',
          ),
        ]),
        ...prefix('administracion', [
          route('usuarios', 'routes/dashboard/administracion/usuarios.tsx'),
          route('contratos', 'routes/dashboard/administracion/contratos.tsx'),
          route('clientes', 'routes/dashboard/administracion/clientes.tsx'),
          route('medidores', 'routes/dashboard/administracion/medidores.tsx'),
          route('acometida', 'routes/dashboard/administracion/acometida.tsx'),
          route(
            'cargo-facturable',
            'routes/dashboard/administracion/cargo-facturable.tsx',
          ),
          route(
            'cargo-tipo-contrato',
            'routes/dashboard/administracion/cargo-tipo-contrato.tsx',
          ),
          route(
            'condiciones-contrato',
            'routes/dashboard/administracion/condiciones-contrato.tsx',
          ),
        ]),
        route('profile', 'routes/dashboard/profile.tsx'),
        ...prefix('mantencion', [
          route('zonas', 'routes/dashboard/mantencion/zonas.tsx'),
          route('sector', 'routes/dashboard/mantencion/sector.tsx'),
          route('nichos', 'routes/dashboard/mantencion/nichos.tsx'),
          route('empalmes', 'routes/dashboard/mantencion/empalmes.tsx'),
          route('marcas', 'routes/dashboard/mantencion/marcas.tsx'),
          route(
            'ciclos-facturacion',
            'routes/dashboard/mantencion/ciclos-facturacion.tsx',
          ),
          route('claves', 'routes/dashboard/mantencion/claves.tsx'),
          route(
            'tipos-contratos',
            'routes/dashboard/mantencion/tipos-contratos.tsx',
          ),
          route('conceptos', 'routes/dashboard/mantencion/conceptos.tsx'),
          route('tarifas', 'routes/dashboard/mantencion/tarifas.tsx'),
          route('parametros', 'routes/dashboard/mantencion/parametros.tsx'),
        ]),
        ...prefix('reportes', [
          route(
            'consultar-contrato',
            'routes/dashboard/reportes/consultar-contrato.tsx',
          ),
          route(
            'resumen-facturacion',
            'routes/dashboard/reportes/resumen-facturacion.tsx',
          ),
          route('ver-facturas', 'routes/dashboard/reportes/ver-facturas.tsx'),
        ]),
        route('activity-analytics', 'routes/dashboard/activity-analytics.tsx'),
      ]),
    ]),
  ]),
  // Ruta catch-all para 404
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
