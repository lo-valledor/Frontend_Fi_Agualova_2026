import type {
  CalculoPrefacturaCargoResponse,
  CalculoPrefacturaCompleto,
  CalculoPrefacturaDetalle
} from '~/types/operaciones';

export function combinarPrefactura(
  encabezados: CalculoPrefacturaDetalle[],
  cargosData: CalculoPrefacturaCargoResponse[]
): CalculoPrefacturaCompleto[] {
  return encabezados.map(encabezado => {
    const cargosContrato = cargosData.find(
      c => c.contratoId === encabezado.contratoId
    );

    const totalFacturado =
      cargosContrato?.cargos.reduce((sum, cargo) => sum + cargo.subtotal, 0) ||
      0;

    return {
      ...encabezado,
      cargos: cargosContrato?.cargos || [],
      totalFacturado
    };
  });
}

export function calcularTotalFacturado(
  datosCompletos: CalculoPrefacturaCompleto[]
): number {
  return datosCompletos.reduce((sum, item) => sum + item.totalFacturado, 0);
}

export function validarDatosCombinados(
  encabezados: CalculoPrefacturaDetalle[] | undefined,
  cargos: CalculoPrefacturaCargoResponse[] | undefined
): boolean {
  return Array.isArray(encabezados) && Array.isArray(cargos);
}
