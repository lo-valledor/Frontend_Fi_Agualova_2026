import { BreadcrumbSetter } from '~/components/breadcrumb-setter'
import AnularFacturaImpresaComponent from '~/components/operaciones/anular-factura-impresa/anular-factura-impresa-component'
import React, { useEffect } from 'react'

export default function AnularFacturaImpresa() {
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Anular Factura Impresa' },
  ]

  useEffect(() => {
    document.title = 'Anular Factura Impresa'
  }, [])

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AnularFacturaImpresaComponent />
    </div>
  )
}
