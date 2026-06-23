const isDevelopment = process.env.NODE_ENV === 'development';

export interface ApiDebugOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  response?: any;
  expectedTemplate?: any;
  showInConsole?: boolean;
}

export function debugApi({
  endpoint,
  method,
  payload,
  response,
  expectedTemplate,
  showInConsole = true
}: ApiDebugOptions) {
  if (!isDevelopment || !showInConsole) return;

  const timestamp = new Date().toISOString();

  console.groupCollapsed(
    `%c🔍 API Debug: ${method} ${endpoint}`,
    'color: #3b82f6; font-weight: bold; font-size: 12px;'
  );

  console.log(
    '%c⏰ Timestamp:',
    'color: #6b7280; font-weight: bold;',
    timestamp
  );

  if (payload) {
    console.log('%c📤 Request Payload:', 'color: #10b981; font-weight: bold;');
    console.log(JSON.stringify(payload, null, 2));
  }

  if (response) {
    console.log('%c📥 Response:', 'color: #8b5cf6; font-weight: bold;');
    console.log(JSON.stringify(response, null, 2));
  }

  if (expectedTemplate) {
    console.log(
      '%c📋 Expected Template:',
      'color: #f59e0b; font-weight: bold;'
    );
    console.log(JSON.stringify(expectedTemplate, null, 2));

    if (response) {
      const validation = validateAgainstTemplate(response, expectedTemplate);
      if (validation.isValid) {
        console.log(
          '%c✅ Response matches template',
          'color: #10b981; font-weight: bold;'
        );
      } else {
        console.warn(
          '%c⚠️ Response does NOT match template:',
          'color: #ef4444; font-weight: bold;'
        );
        console.warn('Missing fields:', validation.missingFields);
        console.warn('Extra fields:', validation.extraFields);
        console.warn('Type mismatches:', validation.typeMismatches);
      }
    }
  }

  console.groupEnd();
}

function validateAgainstTemplate(data: any, template: any) {
  const missingFields: string[] = [];
  const extraFields: string[] = [];
  const typeMismatches: Array<{
    field: string;
    expected: string;
    actual: string;
  }> = [];

  // Si es un array, validar el primer elemento
  const dataToValidate = Array.isArray(data) ? data[0] : data;
  const templateToValidate = Array.isArray(template) ? template[0] : template;

  if (!dataToValidate || !templateToValidate) {
    return { isValid: true, missingFields, extraFields, typeMismatches };
  }

  // Verificar campos faltantes y tipos
  for (const key in templateToValidate) {
    if (!(key in dataToValidate)) {
      missingFields.push(key);
    } else if (typeof dataToValidate[key] !== typeof templateToValidate[key]) {
      typeMismatches.push({
        field: key,
        expected: typeof templateToValidate[key],
        actual: typeof dataToValidate[key]
      });
    }
  }

  // Verificar campos extra
  for (const key in dataToValidate) {
    if (!(key in templateToValidate)) {
      extraFields.push(key);
    }
  }

  const isValid = missingFields.length === 0 && typeMismatches.length === 0;

  return { isValid, missingFields, extraFields, typeMismatches };
}

export const API_TEMPLATES = {
  // Roles y Permisos
  rol: {
    idRol: 0,
    nombreRol: '',
    descripcion: '',
    estadoRol: true
  },

  menu: {
    idMenu: 0,
    nombreMenu: '',
    ruta: '',
    orden: 0,
    icono: '',
    esVisible: true
  },

  permisoRolMenu: {
    idRol: 0,
    idMenu: 0,
    puedeVer: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    fechaAsignacion: '2025-01-01T00:00:00'
  },

  // Usuarios
  usuario: {
    id: 0,
    nombreUsuario: '',
    email: '',
    activo: true
  }
};

export function logApiError(
  endpoint: string,
  error: any,
  context?: Record<string, any>
) {
  if (!isDevelopment) return;

  console.group(
    `%c❌ API Error: ${endpoint}`,
    'color: #ef4444; font-weight: bold; font-size: 12px;'
  );

  console.error('Error:', error);

  if (error.response) {
    console.error('Response Status:', error.response.status);
    console.error('Response Data:', error.response.data);

    // Si hay errores de validación, mostrarlos claramente
    if (error.response.data?.errors) {
      console.error(
        '%c⚠️ Validation Errors:',
        'color: #f59e0b; font-weight: bold;'
      );
      console.table(error.response.data.errors);
    }
  }

  if (context) {
    console.log('Context:', context);
  }

  console.groupEnd();
}
