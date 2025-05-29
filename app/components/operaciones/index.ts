// Importaciones específicas para evitar conflictos y errores
// Preparar Lecturas
import {
  PrepararLecturasComponent,
  DialogLecturasPendientes,
  TablaAsignacionSectores,
} from './preparar-lecturas'

// Cerrar Lecturas
import {
  CerrarLecturasComponent,
  DialogInformacion as CerrarLecturasDialog,
  AlertCerrarLecturas,
} from './cerrar-lecturas'

// Revisar Cálculo Factura
import { RevisarCalculoFacturaComponent } from './revisar-calculo-factura'

// DataTable
import { DataTable } from './data-table'

// Re-exportaciones
export {
  // Preparar Lecturas
  PrepararLecturasComponent,
  DialogLecturasPendientes,
  TablaAsignacionSectores,

  // Cerrar Lecturas
  CerrarLecturasComponent,
  CerrarLecturasDialog,
  AlertCerrarLecturas,

  // Revisar Cálculo Factura
  RevisarCalculoFacturaComponent,

  // DataTable principal
  DataTable,
}

// Exportamos también todo lo demás desde los otros módulos
// Estas exportaciones pueden generar advertencias si los archivos no están disponibles
// pero no impedirán que el proyecto compile
export * from './precios-cargo'
export * from './periodo-facturacion'
