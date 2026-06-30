# Changelog

## [Unreleased]

### Changed

- **administracion:** aligned consumers, forms, and table flows with the current
  administration service/type contract across acometida, clientes, contratos,
  medidores, and condiciones de contrato.
- **condiciones de contrato:** synchronized the route, modal, details view, and
  table behavior so they share the same contract assumptions.

### Refactored

- Simplified administration table column definitions and related consumers to
  remove local drift from the shared contract.
- Applied the same small column cleanup pattern across the touched mantención
  tables.

### Docs

- Added a review note for the administracion + mantención slice in
  `docs/review/feat-ajustes-administracion-slice.md`.

## [1.2.0](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/compare/v1.1.0...v1.2.0) (2026-06-26)


### Features

* **acometida:** make contrato selection optional for new acometidas ([a1f64b1](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a1f64b1cb90cd02abebeb90b7fe3a7577c382f67))
* actualización de componentes y mejoras en la gestión de acometidas ([be797c4](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/be797c4c7e3ce07407deb455598e286417a7f4c8))
* actualización y adición de componentes para la gestión de ciclos de facturación y claves ([c3045a2](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/c3045a259be7411c906d25affeaf5908ea0224d1))
* actualizar componentes y rutas en operaciones ([de639f9](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/de639f91c2a6f59c2211eabd40b55b4385ca0413))
* add analytics components for invoices and readings, including data processing and visualization ([fd915d3](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/fd915d3d623ff056e3b63eeb607bc1f9f988f6da))
* Add contract editing component, new PostgreSQL and Redis implementation documentation, and update server setup guide for Docker, Kubernetes, Prometheus, and Grafana. ([602aecc](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/602aeccdde72b323d03e1d64584e0b19eba9b495))
* Add core application layout, CI/CD workflow, and site header component, and update Docker Compose for UAT environment. ([26e91b5](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/26e91b5c8e71d52fdef46ed67e18d9accfef0c14))
* Add GitHub Actions workflow for DAST security testing using OWASP ZAP. ([6cc779e](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6cc779e9fab81ddaf0d097682dd1566c2671fe85))
* Add GitHub Actions workflows for build, DAST, and secret scanning. ([a9d71c5](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a9d71c566e2f99f6aace717474a066245d356c8c))
* Add hierarchical data table with pre-calculation columns and update Vite API proxy target. ([c8ae6e1](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/c8ae6e1aef627b1bd29527e6cc907f6512b0bfe4))
* add meter reading search results UI, administration service, and contract creation component. ([dbf551e](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/dbf551e1a47bdccbe08ab9579d78dc3635e098ca))
* add monitor readings and meter details module with new UI components, utilities, and environment configuration updates. ([6afcedc](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6afcedc700044593bb5c159c0d10f01dd6615a48))
* add multi-environment deployment setup and UI improvements ([ea5373a](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/ea5373aab2cc9363bf14b45f3ca86b0caf0f43a7))
* Add new UI components for monitoring imported readings, preparing readings, and reviewing invoice calculations. ([ea419d2](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/ea419d2f0efa856eaa1c355d0d96e60b5710f6ff))
* add Precios Cargo management component with period filtering, data display, and interactive tour ([dbb3b18](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/dbb3b183ba8409b8ef9ac47e5b5efc15b1da4c8c))
* Add Propietarios and CrearPropietarios components; refactor HierarchicalDataTable and RevisarCalculoFacturaComponent for improved layout and accessibility ([522228c](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/522228c9191037cea99dc2b645381a30a1dbc7b2))
* Add quick start guide and essential setup instructions ([3e0ea63](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/3e0ea636203bbdd1bfa1ea82c3ac38c825d6f68e))
* Add ResultadoProcesamientoModal component for processing results display and Excel export ([3acdce6](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/3acdce69c4350e73d3b0eea74af426465596396d))
* add roles and permissions management components ([b2e0d43](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/b2e0d43e86ac3b36ef213db9767cd60e2646d64c))
* Add root layout with theme, auth, breadcrumb, loading bar contexts, performance monitoring, and comprehensive error boundary. ([fcfa3bc](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/fcfa3bcfb1d2f3a13e4dd98370474ecdb3dd63f7))
* Add SonarQube optimization scripts and commands ([fcdee55](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/fcdee556b53ee436e0e05c77e045de8d88b144af))
* add support for imported readings with updated status and calculations ([5848b26](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/5848b26684d022031b052142eb2eeb3432b19bf3))
* add user role management functionality ([866bd8b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/866bd8ba87b789e63d3d80d15410a2c9f56527e5))
* Add utilities for administration and operations modules ([39eab60](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/39eab60d8e3e08a12b686f8e40376b2047780566))
* agregar barra de carga y optimizar componentes de administración ([68117db](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/68117db6ff3cdc558942c5c2c21b22c5a67cfbc9))
* agregar componentes y columnas para la gestión de empalmes, nichos, sectores y zonas ([cfabc6a](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/cfabc6ad954910c9b1ddafedb5f93c32bdb73cc3))
* agregar configuración de Prettier y ESLint, y nuevos componentes ([d2d3246](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/d2d3246a4b5c3fa57bd5a80f9c727e50f2e2f55c))
* agregar funcionalidad de exportación a Excel en componentes de administración ([1b186c9](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/1b186c99ab4d45ddc917b3acc3bc20468d7b3840))
* agregar herramientas para configurar y solucionar runner ([3f3e497](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/3f3e4976af75867cd29d00661f6b22e8869a18d6))
* agregar manejo de rutas y mejoras en componentes de operaciones ([1bb7ecb](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/1bb7ecb69cadc1d251518012159651ee3052300f))
* agregar nuevas funcionalidades y mejoras en componentes de operaciones ([ed9b35a](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/ed9b35ac4d3ba3447d6a9014da855f0db5cf8c0a))
* agregar nuevos componentes y ajustes en la administración ([2227c28](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2227c28da1a4c4abc6b4de2e3971e7e359476bf3))
* agregar nuevos componentes y mejorar la configuración del dashboard ([4d2df14](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/4d2df14e8383c8460ad8fa50b2b0ba96d0773171))
* agregar nuevos componentes y mejorar la configuración del dashboard ([4f50db3](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/4f50db34f17ea5c5c7db5aedbb715856df9480fc))
* agregar nuevos servicios y componentes para la administración y mantención ([8a4d7ac](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/8a4d7aced49cf5334a25a29f179494101db1e97a))
* agregar nuevos servicios y componentes para la administración y mantención ([a1c3b5b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a1c3b5b7c2a0d96fa5355bb9d3ef202283d26329))
* agregar rut.js y mejoras en componentes de administración ([2ef8396](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2ef83966121b541be9d4ededef0b755d7c206697))
* agregar seguimiento de actividad y nuevas rutas ([79bb654](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/79bb65496aaf07c0c96edf4f7be69f3b78d40073))
* align auth admin release workflows ([9c67155](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/9c67155303978e4ddc14aae77572a05a1b9f570e))
* align auth admin release workflows ([71db143](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/71db14311ed542429b26c70c826e68687b6125cb))
* align auth, admin, and release workflows ([71bc7f1](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/71bc7f14c2d36ee706b32cda8601bd65ec23a789))
* ampliar cliente AI y mejorar Proyecciones IA (UI, cache y health) ([e40f2e8](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/e40f2e81bbeb34e2d30d9516c258c4ecdd2e1437))
* Añade app.dev.css con tokens de tema y refactoriza LoginForm ([c668d64](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/c668d64df95b472d250c933750017c422b60457b))
* biome config and lint ([8ee0a9c](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/8ee0a9c3456653428a4f8a93fd2e385e1a4f0f59))
* cambio de medidor, corte y reposicion ([395245a](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/395245ae46db9122299ed5f7e30754a4ca0e5195))
* Complete PHASE 6 refactoring of Reportes and Mantencion services ([87d8e4b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/87d8e4bdf23731b0d786f1b12aee17ad12f73c51))
* **contratos:** update local selection to be optional and improve validation messages ([a1f64b1](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a1f64b1cb90cd02abebeb90b7fe3a7577c382f67))
* corte-reposicion ([1f4969d](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/1f4969da93b2fa54ac8fa559ccb184db03e4b373))
* Enhance CambioMedidorComponent with validation for lecturaActual and update MedidorField to support required and placeholder props ([ce21101](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/ce21101eb02f47e44ce43f48d95e98fadb8e4084))
* Enhance error handling and improve performance in various compo… ([45d6012](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/45d601276c2a5ca0704cddee88caa94b60b71378))
* Enhance error handling and improve performance in various components ([fd5c26e](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/fd5c26ebe8d5963ca6e5525d394a34fe209fd745))
* enhance import readings component with new processing state and actions ([194ffcb](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/194ffcbafdc437d26316e9a05391a391b3d67595))
* enhance monitor readings interface with animations and loading states ([a333dbb](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a333dbbf0a620e970c728f9350c8c8482cd5d86b))
* enhance performance tests by increasing run iterations and adjusting tolerance levels ([bb0f548](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/bb0f5485820c5e9bb7765f82fc0050dda1d66462))
* enhance RevisarPrecioComponent with Enter key validation and UI improvements ([29cf2cd](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/29cf2cdec29251791759932096be3ecf4e184e66))
* header fijo en tablas operativas ([e7602db](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/e7602db91f051e90a7fe158f99538a0fa935755c))
* Implement billing calculation flow with multiple steps and error handling ([acdd10d](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/acdd10d8b2602223fecd6e70b00c9690c525e49c))
* Implement frontend CI/CD pipeline with Docker Compose deployment and add root application component. ([de18877](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/de188776a36524bec23f4718ff8fd79fd8d6050f))
* Implement new operations module with components for cargo prices, price review, and billing period, along with supporting utilities. ([9b93223](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/9b93223894c7c3b7b064efc56401673022e94fa1))
* Implement SAST, DAST, SCA, and secret scanning GitHub Actions workflows. ([12700fb](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/12700fbad2386a890d12583afe8a97a8c3ce0c90))
* implement user management hooks and components ([23a5a4b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/23a5a4b3a64c6156876cf07bf7cfee8e1967bea8))
* Implement visual theming system for environment differentiation ([17c3501](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/17c350126e59fbcebdb400f4e316d98e1dcd0faf))
* Implementación completa de UI y mejoras de estabilidad ([092e71d](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/092e71d4d579a6ff90308ea8c5b5ef693316332d))
* implementar sistema de debounce para evitar registros duplicados en el seguimiento de actividad ([8b92d97](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/8b92d97cb0cd8780ee11742259dae4ebb4a7d3b7))
* **importar-lecturas:** restrict reprocesamiento to admin users with appropriate messaging ([a1f64b1](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a1f64b1cb90cd02abebeb90b7fe3a7577c382f67))
* improve responsive design and mobile layout across components ([10ead96](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/10ead960187efae0d07f2d310bb91d7b885393b7))
* int ([6c1602c](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6c1602c133f27ebc3b76aeb87bed0450900aacda))
* integra shadcn y app.dev.css; actualiza entorno Docker/Dev y refactoriza ForgotForm ([2079384](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2079384b673211a33a6ba4b553944391a097691c))
* Introduce CI/CD pipeline with new test and updated production Docker Compose configurations, and add deployment documentation. ([f48b233](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/f48b2335cc5ed145ee5ac46cd91f60f59bed534f))
* Introduce CI/CD pipeline, add site header and meter change components, and update Docker Compose API ports. ([b8581cd](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/b8581cd1ed99a56c09d747b6b34194266870092d))
* Introduce GitHub Actions CI/CD workflow for frontend deployments and update Docker Compose API URLs to use domain names. ([09fb93e](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/09fb93e5e9f42eee4cbd67ee5721acde506bd634))
* Introduce performance optimizations, new CI/CD workflows, extensive documentation, and environment management scripts. ([09a6274](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/09a6274b716f034b15b593f9bb383e5791f8621c))
* **medidores:** improve subempalme association UX and validation ([9e46722](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/9e467228b592b1f92cb23e0c275370bde3836d70))
* mejora a operaciones ([1ab8592](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/1ab859206ba2bf76099fd263d6e49d9f57febb10))
* Mejora visual solicitada ([39977a3](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/39977a38b19c5005a2a754ddd8be94fba0cb243f))
* mejorar la presentación y funcionalidad de componentes en la administración ([ac8193c](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/ac8193c66764a9fafe70d46b3b4bb874cede13fb))
* mejorar manejo de errores y timer en revisar cálculo factura ([747b356](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/747b356d05e1c0538263dd2702f79f69ad485d9d))
* monitor ([cc61398](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/cc613989457a37a5e1a5e41e56c5a9228a3e9838))
* **monitor:** align grilla to MonitorGrillaProps, modal flow with historial/detalle ([a7c34bf](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a7c34bf87537e6602e07fb57fd8d82d074512dea))
* **monitor:** align grilla to MonitorGrillaProps, restore design with modal flow ([9ba293a](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/9ba293a5f6cd501401ba2d79becd6f248b33335b))
* **operaciones:** align sap and anular-factura with source-of-truth ([6d26e34](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6d26e3411ea248d9fdb29681d22c85940e948164)), closes [#22](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/issues/22)
* **operaciones:** mejorar UX cuando no hay lecturas pendientes por f… ([e5a225d](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/e5a225dfa1b410cdb08ed37c85357cb3f4223a68))
* **operaciones:** mejorar UX cuando no hay lecturas pendientes por facturar ([4895dc7](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/4895dc7c7858918643866c2c64343e8aabcab404))
* **performance:** complete optimization - all 30 components + debugging system ([4034f66](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/4034f66d9c684bd3b17019e7ca82d7473983701e))
* **performance:** implement bundle optimization phase 1 ([bde9d93](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/bde9d938ab0b44aa6e0546f860048474ccf0a044))
* **performance:** phase 3 + fix roles-permisos service ([42132eb](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/42132eb801c6e4c7f999ca61e29e9159e294a81b))
* **performance:** phase 4 - re-render optimization (13 components + guides) ([0e5482b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/0e5482b6b71c4c8e459db79891f059a07dd3885e))
* **performance:** phase 4 - re-render optimization (8 components) ([953be0b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/953be0b686da3cd8e76f0fc7bf3ad681e2641ba9))
* **performance:** phase 5 - lazy loading xlsx + debounce hook ([91ad6a0](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/91ad6a09bbf8bc5d3cf1f1744ab79f9639df0e75))
* **performance:** phase 6-7 - virtual scrolling + prefetching + monitoring ([68af75b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/68af75b5106555736286517d0dd5e6fd6223cb05))
* reestructuración de componentes de administración ([a8f497b](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a8f497b9635542d70fff25ff6eaaa05b4e4f327d))
* reestructuración de componentes de administración y adición de nuevos ([d3f9d66](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/d3f9d6650fbb586c6e02946ad96ac7b84cb3b442))
* refactor components and update UI elements for improved readability and performance ([82d8dd0](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/82d8dd02c5d24ba595488132cc6d51d7e477f8f2))
* refactor reset password UI y flujo de restablecimiento ([9c56195](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/9c561958d0ea4f01a88bb14356aff24af0058dd6))
* remoción temporal de roles y permisos ([3325bab](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/3325babb5fb552934b8cbfef6b241a70c57eff71))
* remove outdated documentation files and improve UX components ([6977328](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/697732873d060150c3cb144e96b42cd085984968))
* remove outdated documentation files and improve UX components ([56cf9a6](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/56cf9a6c382b97d044f11a1d0f884b0127bb7f1d))
* **revisar-calculo-factura:** enhance success message for no pending readings and update alert styling ([59e6345](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/59e63452bb4be78c04e8cac4f450dbfefd676674))
* Roles-permisos, documentacion ([43bc6b7](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/43bc6b7f4121ef72c71078befdd52064f3683a61))
* se arrgela interfaz de revisar-calculo-facturas ([eebfbe0](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/eebfbe01213e838b603123818c69ceb766951090))
* test to traefik ([b1767be](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/b1767beccf699081154042987b63240e164475ff))
* test to traefik ([#57](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/issues/57)) ([6d2e127](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6d2e1277a53f594fdd277a3339e56806051fd5b5))
* typecheck 1/2 ([8bd2f80](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/8bd2f8088b297586556572cb7c4f1210d623c3b9))
* update .dockerignore to exclude additional build artifacts and temporary files ([d8c73f0](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/d8c73f0feff84c6bbf6e8e28eef2b81ee92fbedf))
* Update API URL to internal IP, add Ubuntu deployment script, and introduce new Import Readings and Cargo Prices UI components. ([0176322](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/0176322c7b40e4bf571992436c2d9eea350d366e))
* update form validation and UI elements for client, contractor, and meter creation components ([194ffcb](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/194ffcbafdc437d26316e9a05391a391b3d67595))


### Bug Fixes

* add VITE_API_URL env to sonar.yml test step ([572a654](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/572a654f287e1b124dc6415f19263ce71ad0d26f))
* add VITE_API_URL env to sonar.yml test step ([2c49b9a](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2c49b9a56d235ff433e76c078de19ee6f2652931))
* address sonar security and accessibility issues ([92eabc7](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/92eabc7cf6310bb34a4592f7b0898a2cb945fab8))
* **app:** force-disable CSP meta tag temporarily (debug) ([36edae0](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/36edae0bebb72ed252da8e0270ff91ffa4fd8170))
* **app:** force-disable CSP meta tag temporarily (debug) ([0fd17b5](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/0fd17b5060590e8bc48f36cbf0c2f1366ae36986))
* **app:** only emit upgrade-insecure-requests CSP when HTTPS is enabled ([6d97064](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6d970640e2a8d1466400bbf650c6b5c49a1eb5d2))
* **app:** only emit upgrade-insecure-requests CSP when HTTPS is enabled ([2c1105f](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2c1105f56be660b1822dfd11e681dfb384324ae2))
* **build:** remove broken Node import from reportesService ([6240898](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/6240898c8dbe982653cde2bd401b689d88cd2baf))
* Change button variant from 'primary' to 'default' in RevisarCalculoFacturaComponent ([86a10c2](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/86a10c24744ce56e7040d3a8015de973ce06f105))
* **ci:** align docker image tags with push step ([5046436](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/50464364315a993b5cbb65040caf45cf78105250))
* **contratantes:** add comunas prop to details modal for comuna display ([9e46722](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/9e467228b592b1f92cb23e0c275370bde3836d70))
* correct badge truncation and responsive behavior in data tables ([10ead96](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/10ead960187efae0d07f2d310bb91d7b885393b7))
* corregir errores TypeScript y configurar CI/CD ([62933e9](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/62933e98ea8c191df0b17151c445e1f9cf181360))
* corregir errores TypeScript y configurar CI/CD ([a36aa00](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a36aa00184351b2c50e9b497a9a7a5cde1ca5606))
* corregir sintaxis del workflow GitHub Actions ([b5cda39](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/b5cda3908e7a4bb19cd2d8719977827d2231d06a))
* corregir sintaxis del workflow GitHub Actions ([fa6f53f](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/fa6f53f3672b364a4a945ede3ccb5f603a37d7cb))
* corregir test de periodo vacío y actualizar URL UAT en docker-compose ([8434218](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/8434218c3b38bf4c89821a8f1c4aad54e20e1486))
* **dast:** improve server startup and health check ([45e255f](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/45e255f93eec2db84bd1c583b74240b8445815a9))
* **dast:** use dev server instead of build+start for SSR-disabled project ([27ec29e](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/27ec29e93d64fd0d92ac9239245b78188335ff03))
* **dast:** use dev server instead of build+start for SSR-disabled project ([#44](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/issues/44)) ([3f51c59](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/3f51c590e77bcf2b7ae870299981374b2bf64bda))
* enhance Docker image build step with additional tags for better versioning ([5ba2d7f](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/5ba2d7f04536973f8acceedcfad506c34835584b))
* expose codigo medidor in edit form ([b3d1b6e](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/b3d1b6e96fd20fc10eff8f5c3fe90d4de87fb412))
* free production port before docker deploy ([2498503](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2498503f6028b1767bcfebaae280c6fd75f23fb3))
* improve password validation and utility functions ([8677f72](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/8677f72409c63476653700c978de1e5c08302a66))
* pnpm run typecheck ([a96b547](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a96b54726805a80762da2fa2fd5384aabcf460c0))
* proxy staging api through nginx ([96e9814](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/96e9814cc38e41d7634945af5800cd4008d32605))
* proxy staging api through nginx ([2d44596](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2d4459616fd73ea12147e7df5878eea2e307d20a))
* readonly ([1462b5d](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/1462b5d657e94f5f402a710c2068fd4669da32e4))
* remove staging environment from pr checks ([8308892](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/83088929d31378b18630e3efa21408b888309e41))
* render nginx config during docker build ([1f97524](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/1f97524148eacd34257c29c1c187c72135e0e1ab))
* render nginx config during docker build ([fcc7ff7](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/fcc7ff71ebaa83c87df74b247f0f519ab14880f9))
* Resolve SonarQube encoding and configuration issues ([543dc81](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/543dc81702ec7ecc77355f15f532e1561192d596))
* revisar calculo ([a3443d3](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/a3443d3e4de434af6d22d7fee1dc280195fea4a7))
* se cambia puerto en main a 8081 ([003ca32](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/003ca32f7c614a706ea2528d029a28287231f98c))
* se quita url hardcodeada ([9258401](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/925840111385452a9e052e36afa4c5d3a19fc5a6))
* security hotspot ([316193d](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/316193d6e6e974ab11b894f83fa65766760711a9))
* test use calculo proceso ([ecf10d4](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/ecf10d4d911f5765a2fb99f537fb882c5ccbaf0a))
* Update Bash permissions and remove outdated documentation workflow ([4d21fa9](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/4d21fa9d6fb861a4162214d3bfba4d2ba6ee3feb))
* update Docker Hub push step to use environment variables for credentials ([2785a1f](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/2785a1f72874cc32ba15b13b3c0f1ead651e9b69))


### Performance Improvements

* optimize table rendering and column sizing for mobile devices ([10ead96](https://github.com/gbourguett-lv/Frontend_Fi_Agualova_2026/commit/10ead960187efae0d07f2d310bb91d7b885393b7))

## Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

La generación del changelog y del versionado se automatiza con `release-please`
en base a commits convencionales sobre `main`.
