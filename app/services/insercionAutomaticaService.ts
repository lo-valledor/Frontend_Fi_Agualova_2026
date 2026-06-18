import api from '~/lib/api';
import type { MedidorNichoItem } from '~/types/monitor';

export interface ValidacionResultado {
  valido: boolean;
  razones: string[];
  severidad: 'ok' | 'warning' | 'error';
}

export interface LecturaParaInsertar {
  medidor: MedidorNichoItem;
  validacion: ValidacionResultado;
  lecturaActual: number;
  lecturaAnterior: number;
  consumoCalculado: number;
}

export interface ResultadoInsercion {
  exitosas: number;
  fallidas: number;
  omitidas: number;
  detalles: {
    id: number;
    nSerie: string;
    estado: 'exitosa' | 'fallida' | 'omitida';
    mensaje: string;
  }[];
}


function detectarConsumoAnomalo(
  lecturaActual: number,
  lecturaAnterior: number,
  consumoAnterior: number | null,
  capacidadMedidor: number = 99999
): { anomalo: boolean; tipo?: string; razon?: string } {
  const consumo = lecturaActual - lecturaAnterior;

  // 1. Detectar patrón de 9s (decimal truncado)
  const consumoStr = Math.abs(consumo).toString();
  const tiene9s = /9{4,}/.test(consumoStr);
  if (tiene9s) {
    return {
      anomalo: true,
      tipo: 'decimal_truncado',
      razon: `Consumo sospechoso (${consumo} kWh) - posible decimal truncado`
    };
  }

  // 2. Consumo negativo (sin considerar rollover todavía)
  if (consumo < 0) {
    // Verificar si es un rollover válido
    const consumoRollover =
      capacidadMedidor + 1 - lecturaAnterior + lecturaActual;
    if (consumoRollover > capacidadMedidor * 0.8) {
      return {
        anomalo: true,
        tipo: 'rollover_incorrecto',
        razon: `Rollover sospechoso (${consumoRollover} kWh)`
      };
    }
  }

  // 3. Consumo excesivo comparado con el anterior
  if (consumoAnterior !== null && consumoAnterior > 0) {
    const ratio = consumo / consumoAnterior;
    if (ratio > 3) {
      return {
        anomalo: true,
        tipo: 'excesivo',
        razon: `Consumo ${ratio.toFixed(1)}x mayor al anterior (${consumo} vs ${consumoAnterior} kWh)`
      };
    }
    if (ratio < 0.3 && consumo > 100) {
      return {
        anomalo: true,
        tipo: 'muy_bajo',
        razon: `Consumo ${ratio.toFixed(1)}x menor al anterior (${consumo} vs ${consumoAnterior} kWh)`
      };
    }
  }

  // 4. Consumo absoluto muy alto
  if (consumo > 2000) {
    return {
      anomalo: true,
      tipo: 'excesivo_absoluto',
      razon: `Consumo muy alto (${consumo} kWh)`
    };
  }

  return { anomalo: false };
}


export function validarLecturaParaInsercionAutomatica(
  medidor: MedidorNichoItem
): ValidacionResultado {
  const razones: string[] = [];
  let severidad: 'ok' | 'warning' | 'error' = 'ok';

  // 1. Validar que sea BT1 o BT2
  const tarifa = medidor.tarifa?.toUpperCase();
  if (!tarifa || (!tarifa.includes('BT-1') && !tarifa.includes('BT-2'))) {
    razones.push('Solo BT1 y BT2 califican para inserción automática');
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  // 2. Validar que tenga datos importados Y que no sea 0
  const energiaActiva = medidor.LMC_EnergiaActiva;
  if (
    energiaActiva === undefined ||
    energiaActiva === null ||
    energiaActiva < 0
  ) {
    razones.push('Sin datos de energía activa importados');
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  // 2.1 Validar que la energía activa no sea 0
  if (energiaActiva === 0) {
    razones.push('Lectura actual es 0 - requiere revisión manual');
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  // 3. Validar que tenga lectura anterior válida
  const lecturaAnterior = medidor.LM_ValorUltimaLectura;
  if (
    lecturaAnterior === undefined ||
    lecturaAnterior === null ||
    lecturaAnterior < 0
  ) {
    razones.push('Sin lectura anterior válida');
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  // 4. Validar que las lecturas sean diferentes
  if (energiaActiva === lecturaAnterior) {
    razones.push('Lectura actual igual a la anterior (consumo 0)');
    severidad = 'warning';
    return { valido: false, razones, severidad };
  }

  // 4.1 Validar que el C8 (consumo importado) coincida EXACTAMENTE con la diferencia calculada
  // Esto asegura que no hubo ajustes manuales ni inconsistencias menores
  const consumoImportado = medidor.LMC_ConsumoEnergiaActiva;
  const diferenciaSinRollover = energiaActiva - lecturaAnterior;

  // Si el consumo importado no coincide con la diferencia simple, requiere revisión manual
  if (
    consumoImportado !== undefined &&
    consumoImportado !== null &&
    Math.abs(consumoImportado - diferenciaSinRollover) > 0.01
  ) {
    razones.push(
      `Inconsistencia detectada: C8 (${consumoImportado}) ≠ 8-Ant (${diferenciaSinRollover}) - requiere validación manual`
    );
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  // 5. Calcular consumo y detectar anomalías
  const consumo = energiaActiva - lecturaAnterior;
  const consumoAnterior =
    Number.parseFloat(medidor.LM_ConsumoMesAnterior) || null;
  const anomalia = detectarConsumoAnomalo(
    energiaActiva,
    lecturaAnterior,
    consumoAnterior
  );

  if (anomalia.anomalo) {
    razones.push(anomalia.razon || 'Consumo anómalo detectado');
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  // 6. Validar consumo en rango razonable
  if (consumo < 0) {
    // Intentar calcular rollover
    const consumoRollover = 99999 + 1 - lecturaAnterior + energiaActiva;
    if (consumoRollover > 0 && consumoRollover <= 99999) {
      razones.push(`Rollover detectado (consumo: ${consumoRollover} kWh)`);
      severidad = 'warning';
      // Permitir rollover válido pero con advertencia
    } else {
      razones.push('Consumo negativo inválido');
      severidad = 'error';
      return { valido: false, razones, severidad };
    }
  }

  // 7. Validar que no haya sido guardado previamente
  if (medidor.LM_FechaLectura) {
    razones.push('Lectura ya guardada anteriormente');
    severidad = 'error';
    return { valido: false, razones, severidad };
  }

  razones.push(`Consumo válido: ${consumo} kWh`);
  return { valido: true, razones, severidad: 'ok' };
}


function calcularConsumoReal(
  lecturaActual: number,
  lecturaAnterior: number,
  digitos: number,
  constante: number
): number {
  let vlecturadigitos = lecturaActual;

  // Si la lectura actual es menor que la anterior, es un rollover
  if (lecturaActual < lecturaAnterior) {
    switch (digitos) {
      case 1:
        vlecturadigitos = lecturaActual;
        break;
      case 4:
        vlecturadigitos = lecturaActual + 10000;
        break;
      case 5:
        vlecturadigitos = lecturaActual + 100000;
        break;
      case 6:
        vlecturadigitos = lecturaActual + 1000000;
        break;
      case 7:
        vlecturadigitos = lecturaActual + 10000000;
        break;
      case 8:
        vlecturadigitos = lecturaActual + 100000000;
        break;
      case 10:
        vlecturadigitos = lecturaActual + 10000000000;
        break;
      default:
        vlecturadigitos = lecturaActual;
    }
    // Consumo con rollover aplicado
    return (vlecturadigitos - lecturaAnterior) * constante;
  }

  // Consumo normal (lectura actual mayor o igual)
  return (lecturaActual - lecturaAnterior) * constante;
}


export function analizarMedidoresParaInsercion(medidores: MedidorNichoItem[]): {
  autoInsertables: LecturaParaInsertar[];
  requierenRevision: LecturaParaInsertar[];
  resumen: {
    total: number;
    autoInsertables: number;
    requierenRevision: number;
  };
} {
  const autoInsertables: LecturaParaInsertar[] = [];
  const requierenRevision: LecturaParaInsertar[] = [];

  for (const medidor of medidores) {
    const validacion = validarLecturaParaInsercionAutomatica(medidor);
    const lecturaActual = medidor.LMC_EnergiaActiva || 0;
    const lecturaAnterior = medidor.LM_ValorUltimaLectura || 0;
    const digitos = medidor.ME_Digitos || 5;
    const constante = medidor.ME_ConstanteMultiplicar || 1;

    // Calcular consumo real considerando rollovers y constante (misma lógica que bt1-bt2-form.tsx)
    const consumoCalculado = calcularConsumoReal(
      lecturaActual,
      lecturaAnterior,
      digitos,
      constante
    );

    const lecturaParaInsertar: LecturaParaInsertar = {
      medidor,
      validacion,
      lecturaActual,
      lecturaAnterior,
      consumoCalculado
    };

    if (validacion.valido) {
      autoInsertables.push(lecturaParaInsertar);
    } else {
      requierenRevision.push(lecturaParaInsertar);
    }
  }

  return {
    autoInsertables,
    requierenRevision,
    resumen: {
      total: medidores.length,
      autoInsertables: autoInsertables.length,
      requierenRevision: requierenRevision.length
    }
  };
}


export async function procesarInsercionAutomatica(
  lecturas: LecturaParaInsertar[],
  _periodo: string
): Promise<ResultadoInsercion> {
  const resultado: ResultadoInsercion = {
    exitosas: 0,
    fallidas: 0,
    omitidas: 0,
    detalles: []
  };

  // ID de clave LEOK (Lectura OK) - usado para lecturas válidas
  const CLAVE_LEOK_ID = '23';

  // Procesar cada lectura
  for (const lectura of lecturas) {
    try {
      const { medidor } = lectura;

      // Preparar datos en el mismo formato que bt1-bt2-form.tsx
      const datos = {
        lmid: medidor.LM_ID.toString(),
        vactual: lectura.lecturaActual.toString(),
        consumo: lectura.consumoCalculado.toString(),
        claid: CLAVE_LEOK_ID // Usar clave LEOK para lecturas válidas
      };

      // Llamar al mismo endpoint que usa el formulario manual
      await api.put('/actualizar-lectura-bt-1-bt-2', datos);

      resultado.exitosas++;
      resultado.detalles.push({
        id: medidor.LM_ID,
        nSerie: medidor.ME_NSerie || 'N/A',
        estado: 'exitosa',
        mensaje: `Guardado correctamente (${lectura.consumoCalculado} kWh)`
      });
    } catch (error: any) {
      resultado.fallidas++;
      resultado.detalles.push({
        id: lectura.medidor.LM_ID,
        nSerie: lectura.medidor.ME_NSerie || 'N/A',
        estado: 'fallida',
        mensaje: error.response?.data?.message || 'Error al guardar'
      });
    }
  }

  return resultado;
}
