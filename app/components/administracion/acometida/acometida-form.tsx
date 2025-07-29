import { Building2, List, Save, Search, User, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useMemo, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import Select, { type StylesConfig } from 'react-select';

import { useTheme } from '~/components/theme-provider';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type {
  Acometida,
  ActualizarAcometidaProps,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  CrearAcometidaProps,
} from '~/types/administracion';

// Tipos para las opciones de react-select
interface SelectOption {
  value: string;
  label: string;
}

interface ContratoSelectOption extends SelectOption {
  data: ContratosDisponibles;
}

// Interface principal del componente
interface AcometidaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CrearAcometidaProps | ActualizarAcometidaProps
  ) => Promise<void>;
  acometida?: Acometida | null;
  isLoading?: boolean;
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  contratosDisponibles: ContratosDisponibles[];
  comboSectores: ComboSectores[];
}

export function AcometidaForm({
  isOpen,
  onClose,
  onSubmit,
  acometida,
  isLoading = false,
  comboEmpalmes,
  comboNichos,
  contratosDisponibles,
}: AcometidaFormProps) {
  // Hooks
  const { theme } = useTheme();
  const isEdit = !!acometida;

  // Estados
  const [modalContratos, setModalContratos] = useState(false);
  const [busquedaContrato, setBusquedaContrato] = useState('');

  // Formulario
  const form = useForm({
    defaultValues: {
      ubicacion: '',
      empalmeId: '',
      nichoId: '',
      contratoId: '',
      codigo: '',
      limitePotencia: '',
    },
  });

  // Preparar opciones para react-select
  const empalmeOptions: SelectOption[] = comboEmpalmes.map(empalme => ({
    value: empalme.id,
    label: empalme.nombre,
  }));

  const nichoOptions: SelectOption[] = comboNichos.map(nicho => ({
    value: nicho.id,
    label: nicho.nombre,
  }));

  const contratoOptions: ContratoSelectOption[] = useMemo(() => {
    const opciones = contratosDisponibles.map(contrato => ({
      value: contrato.contratoId,
      label: `${contrato.contratoId} - ${contrato.clienteNombre} ${contrato.clienteApellidos}`,
      data: contrato,
    }));

    // Si estamos editando y el contrato no está en la lista, NO lo agregamos
    // Esto evita mostrar contratos que no están disponibles para acometidas
    if (isEdit && acometida?.contratoId) {
      const contratoExiste = opciones.find(
        opt => opt.value === acometida.contratoId
      );

      if (!contratoExiste) {
        // No agregamos el contrato como opción temporal
        return [];
      }
    }

    return opciones;
  }, [contratosDisponibles, isEdit, acometida]);

  // Verificar si el contrato actual está disponible
  const contratoActualDisponible = useMemo(() => {
    if (!isEdit || !acometida?.contratoId) return null;

    return contratosDisponibles.find(
      c => c.contratoId === acometida.contratoId
    );
  }, [isEdit, acometida, contratosDisponibles]);

  // Estilos personalizados para react-select
  const selectStyles: StylesConfig<any> = {
    control: styles => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
      minHeight: '3rem',
      fontSize: '1rem',
      '&:hover': {
        borderColor: theme === 'dark' ? '#475569' : '#CBD5E1',
      },
    }),
    menu: styles => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      zIndex: 9999,
      maxHeight: '300px',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }),
    menuList: styles => ({
      ...styles,
      maxHeight: '280px',
      overflowY: 'auto',
      padding: '8px 0',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? theme === 'dark'
          ? '#0ea5e9'
          : '#0ea5e9'
        : isFocused
          ? theme === 'dark'
            ? '#1e293b'
            : '#f1f5f9'
          : 'transparent',
      color: isSelected ? '#FFFFFF' : theme === 'dark' ? '#f8fafc' : '#0f172a',
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      ':active': {
        ...styles[':active'],
        backgroundColor: theme === 'dark' ? '#0ea5e9' : '#0ea5e9',
      },
    }),
    singleValue: styles => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    input: styles => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    placeholder: styles => ({
      ...styles,
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
    }),
    noOptionsMessage: styles => ({
      ...styles,
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      padding: '12px 16px',
      textAlign: 'center' as const,
    }),
    loadingMessage: styles => ({
      ...styles,
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      padding: '12px 16px',
      textAlign: 'center' as const,
    }),
  };

  // Datos derivados
  const contratosFiltrados = contratosDisponibles.filter(c => {
    const texto =
      `${c.contratoId} ${c.clienteNombre} ${c.clienteApellidos} ${c.empresa} ${c.local}`.toLowerCase();
    return texto.includes(busquedaContrato.toLowerCase());
  });

  const contratoSeleccionado = contratoOptions.find(
    c => c.value === form.watch('contratoId')
  );

  const empalmeSeleccionado = comboEmpalmes.find(
    e => e.id === form.watch('empalmeId')
  );

  // Effect para valores por defecto
  useEffect(() => {
    if (isEdit && acometida) {
      const empalmeId =
        comboEmpalmes.find(e => e.nombre === acometida.empalmeDescripcion)
          ?.id || '';
      const nichoId =
        comboNichos.find(n => n.nombre === acometida.nichoDescripcion)?.id ||
        '';

      // Siempre establecer el contratoId original, independientemente de si está en la lista
      const contratoId = acometida.contratoId || '';

      form.reset({
        ubicacion: acometida.ubicacion || '',
        empalmeId,
        nichoId,
        contratoId,
        codigo: acometida.codigo || '',
        limitePotencia: acometida.limitePotencia?.toString() || '0',
      });
    } else {
      form.reset({
        ubicacion: '',
        empalmeId: '',
        nichoId: '',
        contratoId: '',
        codigo: '',
        limitePotencia: '0',
      });
    }
  }, [
    acometida,
    isEdit,
    form,
    comboEmpalmes,
    comboNichos,
    contratosDisponibles,
  ]);

  // Handlers
  const handleSubmit = async (data: any) => {
    try {
      // Validación adicional antes del envío
      const empalmeId = Number(data.empalmeId);
      const nichoId = Number(data.nichoId);
      const codigo = data.codigo.trim();
      const limitePotencia = data.limitePotencia
        ? Number(data.limitePotencia)
        : 0;
      const contratoId = data.contratoId.trim();

      // Validación adicional
      if (isNaN(empalmeId) || empalmeId <= 0) {
        toast.error('Empalme no válido');
        return;
      }
      if (isNaN(nichoId) || nichoId <= 0) {
        toast.error('Nicho no válido');
        return;
      }
      if (codigo.length === 0) {
        toast.error('Código de acometida no válido');
        return;
      }
      if (isNaN(limitePotencia) || limitePotencia < 0) {
        toast.error('Límite de potencia no válido');
        return;
      }

      // En creación, el contratoId es obligatorio
      if (!isEdit && (!contratoId || contratoId.length === 0)) {
        toast.error('Debe seleccionar un contrato');
        return;
      }

      // En edición, si no hay contratoId en el formulario, usar el original
      const contratoIdFinal = isEdit
        ? contratoId || acometida?.contratoId || ''
        : contratoId;

      if (isEdit && acometida) {
        const submitData: ActualizarAcometidaProps = {
          acometidaId: acometida.acometidaId,
          ubicacion: data.ubicacion.trim(),
          empalmeId,
          nichoId,
          contratoId: contratoIdFinal,
          limitePotencia,
        };

        await onSubmit(submitData);
      } else {
        const submitData: CrearAcometidaProps = {
          ubicacion: data.ubicacion.trim(),
          empalmeId,
          nichoId,
          contratoId: contratoIdFinal,
          codigo,
          limitePotencia,
        };

        await onSubmit(submitData);
      }

      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar acometida:', error);

      // Manejo más específico de errores
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          'Datos inválidos enviados al servidor';
        toast.error(`Error de validación: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        toast.error('Error interno del servidor');
      } else {
        toast.error('Error al guardar la acometida');
      }
    }
  };

  const handleClose = () => {
    form.reset();
    setBusquedaContrato('');
    onClose();
  };

  const handleSelectContrato = (contratoId: string) => {
    form.setValue('contratoId', contratoId);
    setModalContratos(false);
    setBusquedaContrato('');

    // Si estamos editando y el contrato anterior no estaba disponible,
    // ahora que se seleccionó uno nuevo, el campo se mostrará automáticamente
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className='min-w-3xl max-h-[95vh] min-h-[80vh] overflow-y-auto'>
          <DialogHeader className='space-y-2'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg'>
                <Zap className='h-5 w-5 text-sky-600 dark:text-sky-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  {isEdit ? 'Editar Acometida' : 'Nueva Acometida'}
                </DialogTitle>
                <DialogDescription>
                  {isEdit
                    ? 'Modifica la información de la acometida'
                    : 'Completa los datos para registrar una nueva acometida'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              {/* Información Básica */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-200 dark:border-slate-600'>
                  📋 Información Básica
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='codigo'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Código de Acometida *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Código único'
                            className='h-12 text-base'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='ubicacion'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Ubicación Física *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ej: Pasillo 2, Local 15-A'
                            className='h-12 text-base'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contrato */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-200 dark:border-slate-600'>
                  📄 Contrato Asociado
                </h3>

                {/* Mostrar campo de contrato solo si no estamos editando o si el contrato está disponible */}
                {!isEdit || contratoActualDisponible ? (
                  <FormField
                    control={form.control}
                    name='contratoId'
                    render={() => (
                      <FormItem>
                        <FormLabel className='flex items-center justify-between text-sm font-medium'>
                          Contrato *
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => setModalContratos(true)}
                            className='h-8 gap-2 text-xs'
                          >
                            <List className='h-3 w-3' />
                            Ver Todos
                          </Button>
                        </FormLabel>
                        <Controller
                          control={form.control}
                          name='contratoId'
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <div className='space-y-2'>
                              <Select
                                {...field}
                                options={contratoOptions.slice(0, 50)}
                                styles={selectStyles}
                                placeholder='Buscar y seleccionar contrato...'
                                isSearchable
                                filterOption={(option, inputValue) => {
                                  if (!inputValue) return true;
                                  const searchValue = inputValue.toLowerCase();
                                  return (
                                    option.value
                                      .toLowerCase()
                                      .includes(searchValue) ||
                                    option.label
                                      .toLowerCase()
                                      .includes(searchValue) ||
                                    option.data?.empresa
                                      ?.toLowerCase()
                                      .includes(searchValue) ||
                                    option.data?.local
                                      ?.toLowerCase()
                                      .includes(searchValue)
                                  );
                                }}
                                value={
                                  contratoOptions.find(
                                    option => option.value === value
                                  ) || null
                                }
                                onChange={option =>
                                  onChange(option?.value || '')
                                }
                                noOptionsMessage={({ inputValue }) =>
                                  inputValue
                                    ? `No se encontraron contratos para "${inputValue}"`
                                    : 'Escriba para buscar contratos...'
                                }
                                menuPlacement='auto'
                                maxMenuHeight={280}
                              />
                              <p className='text-xs text-slate-500 dark:text-slate-400'>
                                💡 Busque por ID, cliente, empresa o local. Use
                                el botón "Ver Todos" para más opciones.
                              </p>
                            </div>
                          )}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  /* Mostrar información de que el contrato no está disponible */
                  <div className='p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800'>
                    <div className='flex items-start gap-3'>
                      <div className='p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md'>
                        <svg
                          className='h-4 w-4 text-amber-600 dark:text-amber-400'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h4 className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                            Contrato asociado:
                          </h4>
                          <Badge
                            variant='outline'
                            className='font-mono text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600'
                          >
                            {acometida?.contratoId}
                          </Badge>
                        </div>
                        {/* <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                          Este contrato no está disponible en la lista de contratos para acometidas.
                          Esto puede indicar que el contrato no tiene acometida asociada o no está activo para este propósito.
                        </p> */}
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => setModalContratos(true)}
                            className='h-7 gap-1.5 text-xs border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                          >
                            <List className='h-3 w-3' />
                            Cambiar por contrato disponible
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información del contrato seleccionado - solo si hay datos disponibles */}
                {contratoSeleccionado &&
                  contratoSeleccionado.data.clienteNombre && (
                    <div
                      className={`p-3 rounded-lg border ${
                        contratoSeleccionado.data.estadoActivo === false
                          ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {contratoSeleccionado.data.estadoActivo === false && (
                        <div className='mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300'>
                          <svg
                            className='h-4 w-4'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <span className='text-xs font-medium'>
                            Contrato asociado (puede estar inactivo)
                          </span>
                        </div>
                      )}
                      <div className='grid grid-cols-2 gap-3 text-xs'>
                        <div>
                          <span
                            className={`font-medium ${
                              contratoSeleccionado.data.estadoActivo === false
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Cliente:
                          </span>
                          <p className='text-slate-600 dark:text-slate-400'>
                            {contratoSeleccionado.data.clienteNombre ||
                              'No disponible'}{' '}
                            {contratoSeleccionado.data.clienteApellidos || ''}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`font-medium ${
                              contratoSeleccionado.data.estadoActivo === false
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Empresa:
                          </span>
                          <p className='text-slate-600 dark:text-slate-400'>
                            {contratoSeleccionado.data.empresa ||
                              'No disponible'}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`font-medium ${
                              contratoSeleccionado.data.estadoActivo === false
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Local:
                          </span>
                          <p className='text-slate-600 dark:text-slate-400'>
                            {contratoSeleccionado.data.local || 'No disponible'}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`font-medium ${
                              contratoSeleccionado.data.estadoActivo === false
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Tarifa:
                          </span>
                          <p className='text-slate-600 dark:text-slate-400'>
                            {contratoSeleccionado.data.tarifa ||
                              'No disponible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Configuración Técnica */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-200 dark:border-slate-600'>
                  ⚡ Configuración Técnica
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <Controller
                    name='empalmeId'
                    control={form.control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Empalme *
                        </FormLabel>
                        <Select
                          {...field}
                          options={empalmeOptions}
                          styles={selectStyles}
                          placeholder='Seleccionar empalme'
                          isSearchable
                          value={
                            empalmeOptions.find(
                              option => option.value === value
                            ) || null
                          }
                          onChange={option => onChange(option?.value || '')}
                          noOptionsMessage={() => 'No se encontraron empalmes'}
                          menuPlacement='auto'
                          maxMenuHeight={280}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    name='nichoId'
                    control={form.control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Nicho *
                        </FormLabel>
                        <Select
                          {...field}
                          options={nichoOptions}
                          styles={selectStyles}
                          placeholder='Seleccionar nicho'
                          isSearchable
                          value={
                            nichoOptions.find(
                              option => option.value === value
                            ) || null
                          }
                          onChange={option => onChange(option?.value || '')}
                          noOptionsMessage={() => 'No se encontraron nichos'}
                          menuPlacement='auto'
                          maxMenuHeight={280}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='limitePotencia'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Límite Potencia (kW)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ej: 50'
                            className='h-12 text-base'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Información del empalme seleccionado */}
                {empalmeSeleccionado && (
                  <div className='p-3 bg-sky-50 dark:bg-sky-900/10 rounded-lg border'>
                    <div className='flex items-center gap-2'>
                      <Zap className='h-4 w-4 text-sky-600 dark:text-sky-400' />
                      <span className='text-sm font-medium text-sky-700 dark:text-sky-300'>
                        Empalme seleccionado:
                      </span>
                      <Badge
                        variant='outline'
                        className='text-sky-700 dark:text-sky-300'
                      >
                        {empalmeSeleccionado.nombre}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className='flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-600'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isLoading}
                  className='gap-2'
                >
                  <X className='h-4 w-4' />
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='gap-2 bg-sky-600 hover:bg-sky-700 text-white'
                >
                  {isLoading ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-2xl border-2 border-white border-t-transparent' />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4' />
                      {isEdit ? 'Actualizar Acometida' : 'Crear Acometida'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Contratos */}
      <Dialog open={modalContratos} onOpenChange={setModalContratos}>
        <DialogContent className='min-w-6xl max-h-[80vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'>
                <List className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  Seleccionar Contrato
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el contrato que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Barra de búsqueda */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por ID, cliente, empresa o local...'
                value={busquedaContrato}
                onChange={e => setBusquedaContrato(e.target.value)}
                className='h-11 pl-10'
              />
            </div>

            {/* Tabla de contratos */}
            <div className='border rounded-lg overflow-hidden'>
              <ScrollArea className='h-[50vh]'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead>ID Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Tarifa</TableHead>
                      <TableHead className='text-center'>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contratosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <Search className='h-8 w-8 opacity-50' />
                            <p>
                              No se encontraron contratos con los criterios de
                              búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {contratosFiltrados.map(c => (
                      <TableRow
                        key={c.contratoId}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {c.contratoId}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            {c.clienteNombre} {c.clienteApellidos}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4 text-muted-foreground' />
                            {c.empresa}
                          </div>
                        </TableCell>
                        <TableCell>{c.local}</TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{c.tarifa}</Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Button
                            size='sm'
                            onClick={() => handleSelectContrato(c.contratoId)}
                            className='bg-emerald-600 hover:bg-emerald-700 text-white'
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
