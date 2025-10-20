import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('session-expired', 'routes/session-expired.tsx'),
  ...prefix('auth', [
    route('login', 'routes/auth/login.tsx'),
    route('forgot-password', 'routes/auth/forgot-password.tsx'),
    route('reset-password', 'routes/auth/reset-password.tsx')
  ]),
  layout('routes/protected-route.tsx', [
    layout('routes/dashboard/layout.tsx', [
      ...prefix('dashboard', [
        index('routes/dashboard/dashboard.tsx'),
        ...prefix('monitor', [
          route(
            'monitor-lecturas',
            'routes/dashboard/monitor/monitor-lecturas.tsx'
          ),
          route(
            'exportar-lecturas',
            'routes/dashboard/monitor/exportar-lecturas.tsx'
          ),
          route(
            'importar-lecturas',
            'routes/dashboard/monitor/importar-lecturas.tsx'
          )
        ]),
        ...prefix('operaciones', [
          route(
            'periodo-facturacion',
            'routes/dashboard/operaciones/periodo-facturacion.tsx'
          ),
          route(
            'precios-cargo',
            'routes/dashboard/operaciones/precios-cargo.tsx'
          ),
          route(
            'revisar-precio',
            'routes/dashboard/operaciones/revisar-precio.tsx'
          ),
          route(
            'preparar-lecturas',
            'routes/dashboard/operaciones/preparar-lecturas.tsx'
          ),
          route(
            'cerrar-lecturas',
            'routes/dashboard/operaciones/cerrar-lecturas.tsx'
          ),
          route(
            'revisar-calculo-factura',
            'routes/dashboard/operaciones/revisar-calculo-factura.tsx'
          ),
          route(
            'cambio-medidor',
            'routes/dashboard/operaciones/cambio-medidor.tsx'
          ),
          route(
            'corte-reposicion',
            'routes/dashboard/operaciones/corte-reposicion.tsx'
          ),
          route(
            'crear-archivos-sap',
            'routes/dashboard/operaciones/crear-archivos-sap.tsx'
          ),

          route(
            'anular-factura-impresa',
            'routes/dashboard/operaciones/anular-factura-impresa.tsx'
          )
        ]),
        ...prefix('administracion', [
          route('usuarios', 'routes/dashboard/administracion/usuarios.tsx'),
          route('contratos', 'routes/dashboard/administracion/contratos.tsx'),
          route(
            'contratos/crear',
            'routes/dashboard/administracion/contratos/crear-contrato.tsx'
          ),
          route(
            'contratos/:id',
            'routes/dashboard/administracion/contratos/editar-contrato.tsx'
          ),
          route('clientes', 'routes/dashboard/administracion/clientes.tsx'),
          route(
            'clientes/crear',
            'routes/dashboard/administracion/clientes/crear-cliente.tsx'
          ),
          route(
            'clientes/:id',
            'routes/dashboard/administracion/clientes/editar-cliente.tsx'
          ),
          route(
            'propietarios',
            'routes/dashboard/administracion/propietarios.tsx'
          ),
          route(
            'contratantes',
            'routes/dashboard/administracion/contratantes.tsx'
          ),
          route(
            'contratantes/crear',
            'routes/dashboard/administracion/contratantes/crear-contratante.tsx'
          ),
          route('medidores', 'routes/dashboard/administracion/medidores.tsx'),
          route(
            'medidores/crear',
            'routes/dashboard/administracion/medidores/crear-medidor.tsx'
          ),
          route(
            'medidores/:codigo',
            'routes/dashboard/administracion/medidores/editar-medidor.tsx'
          ),
          route('acometida', 'routes/dashboard/administracion/acometida.tsx'),
          route(
            'cargo-facturable',
            'routes/dashboard/administracion/cargo-facturable.tsx'
          ),
          ...prefix('cargo-tipo-contrato', [
            index('routes/dashboard/administracion/cargo-tipo-contrato.tsx'),
            route(
              'crear',
              'routes/dashboard/administracion/cargo-tipo-contrato/crear-ctp.tsx'
            ),
            route(
              'edit/:cargoTipoContratoId',
              'routes/dashboard/administracion/cargo-tipo-contrato/edit.tsx'
            )
          ]),
          route(
            'condiciones-contrato',
            'routes/dashboard/administracion/condiciones-contrato.tsx'
          )
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
            'routes/dashboard/mantencion/ciclos-facturacion.tsx'
          ),
          route('claves', 'routes/dashboard/mantencion/claves.tsx'),
          route(
            'tipos-contratos',
            'routes/dashboard/mantencion/tipos-contratos.tsx'
          ),
          route('conceptos', 'routes/dashboard/mantencion/conceptos.tsx'),
          route('tarifas', 'routes/dashboard/mantencion/tarifas.tsx'),
          route('parametros', 'routes/dashboard/mantencion/parametros.tsx')
        ]),
        ...prefix('reportes', [
          route(
            'consultar-contrato',
            'routes/dashboard/reportes/consultar-contrato.tsx'
          ),
          route(
            'consultar-contrato/contrato/:contratoId',
            'routes/dashboard/reportes/consultar-contrato/contrato.tsx'
          ),
          route(
            'resumen-facturacion',
            'routes/dashboard/reportes/resumen-facturacion.tsx'
          ),
          route('ver-facturas', 'routes/dashboard/reportes/ver-facturas.tsx')
        ]),
        ...prefix('configuracion', [
          route(
            'roles-permisos',
            'routes/dashboard/configuracion/roles-permisos.tsx'
          ),
          route(
            'permisos-usuarios',
            'routes/dashboard/configuracion/permisos-usuarios.tsx'
          )
        ])
      ])
    ])
  ]),
  // Ruta catch-all para 404
  route('*', 'routes/not-found.tsx')
] satisfies RouteConfig;
