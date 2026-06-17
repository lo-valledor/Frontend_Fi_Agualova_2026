export function convertirCicloParaAPI(ciclo: string): string {
  if (ciclo === '1' || ciclo === '2') return ciclo;
  if (ciclo.includes('15')) return '1';
  return ciclo;
}


export function validarCicloYPeriodo(
  periodoFormateado: string,
  cicloId: string
): boolean {
  return !!(periodoFormateado && cicloId);
}


export function extraerMesYAnio(periodoFormateado: string): {
  mes: string;
  anio: string;
} {
  return {
    mes: periodoFormateado.substring(0, 2),
    anio: periodoFormateado.substring(2)
  };
}


export function obtenerDiaDelCiclo(cicloParaAPI: string): string {
  return cicloParaAPI === '1' ? '15' : '30';
}
