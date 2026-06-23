import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  MapPin,
  Network,
  Save,
  Search,
  User,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router";
import { toast } from "sonner";

import { ModernHeader } from "~/components/shared/modern-header";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { administracionService } from "~/services/administracionService";
import { mantencionService } from "~/services/mantencionService";
import type {
  ContratoFormData,
  GetClienteContrato,
  GetLocal,
  GetMadres,
  NombreComuna,
  PropietariosRow,
} from "~/types/administracion";
import type { Tarifas, TiposContrato } from "~/types/mantencion";

export default function CrearContratoComponent({
  propietarios,
  locales,
  comunas,
  madres,
  clientes: _clientes,
}: {
  readonly propietarios: PropietariosRow[];
  readonly locales: GetLocal[];
  readonly comunas: NombreComuna[];
  readonly madres: GetMadres[];
  readonly clientes: GetClienteContrato[];
}) {
  const navigate = useNavigate();

  // Estados para los modales de selección
  const [modalPropietario, setModalPropietario] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalLocal, setModalLocal] = useState(false);
  const [modalMadres, setModalMadres] = useState(false);
  const [modalComuna, setModalComuna] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de éxito
  const [modalExito, setModalExito] = useState(false);
  const [contratoCreado, setContratoCreado] = useState<{
    id: string | number | null;
    fecha: string;
  } | null>(null);

  // Estados para las búsquedas
  const [busquedaPropietario, setBusquedaPropietario] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [busquedaMadres, setBusquedaMadres] = useState("");
  const [busquedaComuna, setBusquedaComuna] = useState("");

  // Refs para virtualización de modales
  const propietariosTableRef = useRef<HTMLDivElement>(null);
  const clientesTableRef = useRef<HTMLDivElement>(null);
  const localesTableRef = useRef<HTMLDivElement>(null);
  const madresTableRef = useRef<HTMLDivElement>(null);
  const comunasTableRef = useRef<HTMLDivElement>(null);

  // Estados para datos adicionales
  const [tipoContrato, setTipoContrato] = useState<TiposContrato[]>([]);
  const [tarifas, setTarifas] = useState<Tarifas[]>([]);

  const [formData, setFormData] = useState<ContratoFormData>({
    tipoContrato: "",
    tarifa: "",
    nombrePropietario: "",
    nombreCliente: "",
    local: "",
    fechaInicio: "",
    activo: true,
    fechaTermino: "",
    comunaEnvio: "",
    direccionEnvio: "",
    limiteInvierno: 0,
    promedioAnual: "",
    cicloFacturacion: "Ciclo Día 15",
    potenciaContratada: "",
    liberadoCorte: false,
    madre: "",
  });

  // Cargar datos adicionales al montar el componente
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        // Cargar tipos de contrato
        const tiposResult = await mantencionService.getTiposContratos();
        if (tiposResult.data) {
          setTipoContrato(tiposResult.data);
        }

        // Cargar tarifas
        const tarifasResult = await mantencionService.getTarifas();
        if (tarifasResult.data) {
          setTarifas(tarifasResult.data);
        }
      } catch (error) {
        toast.error("Error al cargar datos del formulario", error as any);
      }
    };

    loadAdditionalData();
  }, []);

  // Helper para obtener el nombre del cliente
  const getClienteDisplayName = (cliente: any) => {
    if (!cliente.nombreCompleto) {
      return `${cliente.nombre || "sin RUT"}`;
    }

    return cliente.nombreCompleto;
  };

  // Función para copiar código al portapapeles
  const copiarCodigoContrato = async (codigo: string | number) => {
    try {
      await navigator.clipboard.writeText(codigo.toString());
      toast.success("ID del contrato copiado al portapapeles", {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error al copiar:", error);
      toast.error("Error al copiar. Intente seleccionar manualmente el ID.");
    }
  };

  // Función utilitaria para trim seguro
  // Previene errores "Cannot read properties of undefined (reading 'trim')"
  const safeTrim = (value: string | undefined | null): string => {
    return value && typeof value === "string" ? value.trim() : "";
  };

  // Funciones de filtrado
  const propietariosFiltrados = useMemo(() => {
    return propietarios.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busquedaPropietario.toLowerCase()) ||
        p.rut.toLowerCase().includes(busquedaPropietario.toLowerCase()),
    );
  }, [propietarios, busquedaPropietario]);

  const clientesFiltrados = useMemo(() => {
    if (!_clientes || _clientes.length === 0) {
      return [];
    }

    return _clientes.filter(
      (c: any) =>
        c.nombreCompleto
          ?.toLowerCase()
          .includes(busquedaCliente.toLowerCase()) ||
        c.rut?.toLowerCase().includes(busquedaCliente.toLowerCase()),
    );
  }, [_clientes, busquedaCliente]);

  const localesFiltrados = useMemo(() => {
    return locales.filter(
      (l) =>
        l.numeroLocal?.toLowerCase().includes(busquedaLocal.toLowerCase()) ||
        l.empresa?.toLowerCase().includes(busquedaLocal.toLowerCase()),
    );
  }, [locales, busquedaLocal]);

  const madresFiltradas = useMemo(() => {
    return madres.filter(
      (m) =>
        m.nombrePropietario
          ?.toLowerCase()
          .includes(busquedaMadres.toLowerCase()) ||
        m.codigoContrato?.toLowerCase().includes(busquedaMadres.toLowerCase()),
    );
  }, [madres, busquedaMadres]);

  const comunasFiltradas = useMemo(() => {
    return comunas.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(busquedaComuna.toLowerCase()) ||
        c.codigo?.toLowerCase().includes(busquedaComuna.toLowerCase()),
    );
  }, [comunas, busquedaComuna]);

  // Virtualizadores para cada modal
  const propietariosVirtualizer = useVirtualizer({
    count: propietariosFiltrados.length,
    getScrollElement: () => propietariosTableRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const clientesVirtualizer = useVirtualizer({
    count: clientesFiltrados.length,
    getScrollElement: () => clientesTableRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const localesVirtualizer = useVirtualizer({
    count: localesFiltrados.length,
    getScrollElement: () => localesTableRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const madresVirtualizer = useVirtualizer({
    count: madresFiltradas.length,
    getScrollElement: () => madresTableRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const comunasVirtualizer = useVirtualizer({
    count: comunasFiltradas.length,
    getScrollElement: () => comunasTableRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  // Forzar medición del virtualizador cuando se abren los modales
  useEffect(() => {
    if (modalPropietario) {
      // Doble requestAnimationFrame para asegurar que el modal esté completamente renderizado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          propietariosVirtualizer.measure();
        });
      });
    }
  }, [modalPropietario, propietariosVirtualizer]);

  useEffect(() => {
    if (modalCliente) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clientesVirtualizer.measure();
        });
      });
    }
  }, [modalCliente, clientesVirtualizer]);

  useEffect(() => {
    if (modalLocal) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          localesVirtualizer.measure();
        });
      });
    }
  }, [modalLocal, localesVirtualizer]);

  useEffect(() => {
    if (modalMadres) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          madresVirtualizer.measure();
        });
      });
    }
  }, [modalMadres, madresVirtualizer]);

  useEffect(() => {
    if (modalComuna) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          comunasVirtualizer.measure();
        });
      });
    }
  }, [modalComuna, comunasVirtualizer]);

  // Funciones de selección
  const handleSelectPropietario = (propietarioRut: string) => {
    const prop = propietarios.find((p) => p.rut === propietarioRut);
    if (prop) {
      setFormData((prev) => ({ ...prev, nombrePropietario: prop.nombre }));
    }
    setModalPropietario(false);
    setBusquedaPropietario("");
  };

  const handleSelectCliente = (clienteRut: string) => {
    const cliente = _clientes.find((c) => c.rut === clienteRut);
    if (cliente) {
      const nombreCompleto = getClienteDisplayName(cliente);
      setFormData((prev) => ({ ...prev, nombreCliente: nombreCompleto }));
    }
    setModalCliente(false);
    setBusquedaCliente("");
  };

  const handleSelectLocal = (localNumero: string) => {
    const loc = locales.find((l) => l.numeroLocal === localNumero);
    if (loc) {
      setFormData((prev) => ({ ...prev, local: loc.numeroLocal }));
    }
    setModalLocal(false);
    setBusquedaLocal("");
  };

  const handleSelectMadre = (madreCodigo: string) => {
    const mad = madres.find((m) => m.codigoContrato === madreCodigo);
    if (mad) {
      setFormData((prev) => ({ ...prev, madre: mad.nombrePropietario }));
    }
    setModalMadres(false);
    setBusquedaMadres("");
  };

  const handleSelectComuna = (comunaCodigo: string) => {
    const com = comunas.find((c) => c.codigo === comunaCodigo);
    if (com) {
      setFormData((prev) => ({ ...prev, comunaEnvio: com.codigo }));
    }
    setModalComuna(false);
    setBusquedaComuna("");
  };

  const handleInputChange = (
    field: keyof ContratoFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Funciones para deseleccionar
  const handleClearPropietario = () => {
    setFormData((prev) => ({ ...prev, nombrePropietario: "" }));
  };

  const handleClearCliente = () => {
    setFormData((prev) => ({ ...prev, nombreCliente: "" }));
  };

  const handleClearLocal = () => {
    setFormData((prev) => ({ ...prev, local: "" }));
  };

  const handleClearComuna = () => {
    setFormData((prev) => ({ ...prev, comunaEnvio: "" }));
  };

  const handleClearMadre = () => {
    setFormData((prev) => ({ ...prev, madre: "" }));
  };

  // Helper para mostrar el nombre de la comuna en el input
  const getComunaDisplayName = () => {
    const comuna = comunas.find((c) => c.codigo === formData.comunaEnvio);
    return comuna ? comuna.nombre : formData.comunaEnvio;
  };

  // Validación de campos requeridos
  const validateRequiredFields = (): boolean => {
    const validations = [
      {
        field: formData.fechaInicio,
        message: "La fecha de inicio es obligatoria",
      },
      {
        field: formData.tipoContrato,
        message: "El tipo de contrato es obligatorio",
      },
      { field: formData.tarifa, message: "La tarifa es obligatoria" },
      {
        field: formData.nombrePropietario,
        message: "El nombre del propietario es obligatorio",
      },
      {
        field: formData.nombreCliente,
        message: "El nombre del cliente es obligatorio",
      },
      {
        field: formData.comunaEnvio,
        message: "La comuna de envío es obligatoria",
      },
      {
        field: formData.direccionEnvio,
        message: "La dirección de envío es obligatoria",
      },
    ];

    for (const validation of validations) {
      if (!validation.field) {
        toast.error(validation.message);
        return false;
      }
    }
    return true;
  };

  // Validación de entidades existentes
  const validateEntities = () => {
    const propietarioSeleccionado = propietarios.find(
      (p) => safeTrim(p.nombre) === safeTrim(formData.nombrePropietario),
    );
    if (!propietarioSeleccionado) {
      toast.error(
        "El propietario seleccionado no es válido. Por favor, selecciona uno de la lista.",
      );
      return null;
    }

    // El local es opcional: solo validar si se ingresó alguno
    const localSeleccionado = formData.local
      ? locales.find((l) => l.numeroLocal === formData.local)
      : null;
    if (formData.local && !localSeleccionado) {
      toast.error(
        "El local ingresado no existe en la lista. Selecciona uno válido o deja el campo vacío.",
      );
      return null;
    }

    const comunaSeleccionada = comunas.find(
      (c) => c.codigo === formData.comunaEnvio,
    );
    if (!comunaSeleccionada) {
      toast.error(
        "La comuna seleccionada no es válida. Por favor, selecciona una de la lista.",
      );
      return null;
    }

    const tipoContratoValido = tipoContrato.find(
      (tc) => tc.id.toString() === formData.tipoContrato,
    );
    if (!tipoContratoValido) {
      toast.error("El tipo de contrato seleccionado no es válido.");
      return null;
    }

    const tarifaValida = tarifas.find(
      (t) => t.id.toString() === formData.tarifa,
    );
    if (!tarifaValida) {
      toast.error("La tarifa seleccionada no es válida.");
      return null;
    }

    return {
      propietarioSeleccionado,
      localSeleccionado,
      comunaSeleccionada,
      tipoContratoValido,
      tarifaValida,
    };
  };

  // Validación de contrato madre
  const validateMadreContract = () => {
    if (!formData.madre) return "";

    const madreSeleccionada = madres.find(
      (m) => m.nombrePropietario === formData.madre,
    );
    if (!madreSeleccionada) {
      toast.error("El contrato madre seleccionado no es válido.");
      return null;
    }
    return madreSeleccionada.codigoContrato;
  };

  // Helper para formatear fechas
  const formatDateForSP = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Helper para obtener RUT del cliente
  const getClienteRut = (propietarioRut: string): string => {
    // Si cliente y propietario son el mismo, usar RUT del propietario
    if (
      safeTrim(formData.nombreCliente) === safeTrim(formData.nombrePropietario)
    ) {
      return propietarioRut;
    }

    // Buscar en clientes si están disponibles
    if (_clientes && _clientes.length > 0) {
      const clienteEncontrado = _clientes.find(
        (c: any) =>
          safeTrim(c.nombreCliente) === safeTrim(formData.nombreCliente),
      );
      if (clienteEncontrado) {
        return clienteEncontrado.rut;
      }
    }

    // Si no se encuentra en clientes, buscar en propietarios
    const propietarioCliente = propietarios.find(
      (p) => safeTrim(p.nombre) === safeTrim(formData.nombreCliente),
    );
    if (propietarioCliente) {
      return propietarioCliente.rut;
    }

    return propietarioRut;
  };

  // Helper para validar valores numéricos
  const validateNumericValues = () => {
    const tipoContratoNum = Number.parseInt(formData.tipoContrato);
    const tarifaNum = Number.parseInt(formData.tarifa);

    if (Number.isNaN(tipoContratoNum) || tipoContratoNum <= 0) {
      throw new Error("Tipo de contrato no válido");
    }

    if (Number.isNaN(tarifaNum) || tarifaNum <= 0) {
      throw new Error("Tarifa no válida");
    }

    return { tipoContratoNum, tarifaNum };
  };

  // Preparación de datos para envío
  const prepareSubmitData = (entities: any, madreCodigoContrato: string) => {
    const { propietarioSeleccionado } = entities;
    const clienteRut = getClienteRut(propietarioSeleccionado.rut);
    const { tipoContratoNum, tarifaNum } = validateNumericValues();

    return {
      tipoContrato: tipoContratoNum,
      tarifa: tarifaNum,
      propietario: propietarioSeleccionado.rut,
      cliente: clienteRut,
      localId: formData.local || "",
      fechaInicio: formatDateForSP(formData.fechaInicio),
      activo: formData.activo,
      direccion: safeTrim(formData.direccionEnvio),
      comuna: safeTrim(formData.comunaEnvio),
      limite: Math.max(0, formData.limiteInvierno || 0),
      ciclo: 1,
      potencia: safeTrim(formData.potenciaContratada),
      guardaCliente: "1",
      esMadre: formData.madre ? "1" : "0",
      madre: madreCodigoContrato,
      lugar: formData.local || "",
      sinCorte: formData.liberadoCorte ? 1 : 0,
    };
  };

  // Manejo de errores HTTP
  const handleHttpError = (error: any) => {
    const errorMessages: Record<number, string> = {
      500: "Error interno del servidor. Verifica que todos los datos sean válidos.",
      400: "Datos inválidos. Revisa la información ingresada.",
      401: "No tienes permisos para realizar esta acción.",
    };

    const status = error.response?.status;
    const serverMessage = error.response?.data?.message || error.response?.data;
    const message =
      errorMessages[status] ||
      "Error inesperado al crear el contrato. Contacta al administrador.";

    // Mostrar mensaje del servidor si está disponible
    if (serverMessage && typeof serverMessage === "string") {
      toast.error(`${message}\n\nDetalle: ${serverMessage}`);
    } else {
      toast.error(message);
    }
  };

  const handleSubmit = async () => {
    if (!validateRequiredFields()) return;

    setIsSubmitting(true);

    try {
      const entities = validateEntities();
      if (!entities) return;

      const madreCodigoContrato = validateMadreContract();
      if (madreCodigoContrato === null) return;

      let submitData;
      try {
        submitData = prepareSubmitData(entities, madreCodigoContrato);
      } catch (validationError: any) {
        toast.error(
          validationError.message || "Error en la validación de datos",
        );
        return;
      }

      const result = await administracionService.crearContrato(submitData);

      if (result.error) {
        toast.error(result.error || "Error al crear el contrato");
        return;
      }

      // Buscar el idContrato en diferentes estructuras posibles
      let contratoId = null;

      if (result.data?.idContrato) {
        contratoId = result.data.idContrato;
      } else if (result.data && typeof result.data === "number") {
        contratoId = result.data;
      } else if (result.data?.id) {
        contratoId = result.data.id;
      } else if (result?.data) {
        contratoId = result.data;
      }

      // Preparar datos del contrato creado y mostrar modal
      const fechaActual = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setContratoCreado({
        id: contratoId,
        fecha: fechaActual,
      });
      setModalExito(true);

      // No navegar automáticamente - el usuario decide cuándo salir
    } catch (error: any) {
      handleHttpError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <ModernHeader
            title="Crear Nuevo Contrato"
            description="Creación de nuevo Contrato para sistema"
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate("/dashboard/administracion/contratos")
                  }
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate("/dashboard/administracion/contratos")
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="gap-2"
                  variant="default"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Creando..." : "Crear Contrato"}
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-background rounded-xl shadow-sm border border-border">
          <form className="p-6 space-y-6">
            {/* Información básica del contrato */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-sky-800 dark:text-sky-200">
                Información del Contrato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoContrato">
                    Tipo de Contrato <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipoContrato}
                    onValueChange={(value) =>
                      handleInputChange("tipoContrato", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoContrato.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tarifa">
                    Tarifa <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tarifa}
                    onValueChange={(value) =>
                      handleInputChange("tarifa", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar tarifa" />
                    </SelectTrigger>
                    <SelectContent>
                      {tarifas.map((tarifa) => (
                        <SelectItem
                          key={tarifa.id}
                          value={tarifa.id.toString()}
                        >
                          {tarifa.codigo} - {tarifa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Información de personas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Información de Personas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombrePropietario">
                    Propietario <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="nombrePropietario"
                      value={formData.nombrePropietario}
                      onChange={(e) =>
                        handleInputChange("nombrePropietario", e.target.value)
                      }
                      placeholder="Nombre del propietario"
                      className="w-full"
                      required
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalPropietario(true)}
                      className="shrink-0"
                      title="Seleccionar propietario"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    {formData.nombrePropietario && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearPropietario}
                        className="shrink-0"
                        title="Deseleccionar propietario"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreCliente">
                    Cliente <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="nombreCliente"
                      value={formData.nombreCliente}
                      onChange={(e) =>
                        handleInputChange("nombreCliente", e.target.value)
                      }
                      placeholder="Nombre del cliente"
                      className="w-full"
                      required
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalCliente(true)}
                      className="shrink-0"
                      title="Seleccionar cliente"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    {formData.nombreCliente && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearCliente}
                        className="shrink-0"
                        title="Deseleccionar cliente"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de ubicación */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-violet-800 dark:text-violet-200">
                Información de Ubicación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <div className="flex gap-2">
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) =>
                        handleInputChange("local", e.target.value)
                      }
                      placeholder="Número del local"
                      className="w-full"
                      required
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalLocal(true)}
                      className="shrink-0"
                      title="Seleccionar local"
                    >
                      <Building2 className="h-4 w-4" />
                    </Button>
                    {formData.local && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearLocal}
                        className="shrink-0"
                        title="Deseleccionar local"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comunaEnvio">
                    Comuna de Envío <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="comunaEnvio"
                      value={getComunaDisplayName()}
                      onChange={(e) =>
                        handleInputChange("comunaEnvio", e.target.value)
                      }
                      placeholder="Comuna de envío"
                      className="w-full"
                      required
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalComuna(true)}
                      className="shrink-0"
                      title="Seleccionar comuna"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    {formData.comunaEnvio && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearComuna}
                        className="shrink-0"
                        title="Deseleccionar comuna"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccionEnvio">
                  Dirección de Envío <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="direccionEnvio"
                  value={formData.direccionEnvio}
                  onChange={(e) =>
                    handleInputChange("direccionEnvio", e.target.value)
                  }
                  placeholder="Dirección completa de envío"
                  className="w-full resize-none"
                  rows={2}
                  required
                />
              </div>
            </div>

            {/* Fechas y configuración */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Fechas y Configuración
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      handleInputChange("fechaInicio", e.target.value)
                    }
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaTermino">Fecha de Término</Label>
                  <Input
                    id="fechaTermino"
                    type="date"
                    value={formData.fechaTermino}
                    onChange={(e) =>
                      handleInputChange("fechaTermino", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limiteInvierno">Límite Invierno</Label>
                  <Input
                    id="limiteInvierno"
                    type="number"
                    value={formData.limiteInvierno}
                    onChange={(e) =>
                      handleInputChange(
                        "limiteInvierno",
                        Number.parseInt(e.target.value) || 0,
                      )
                    }
                    placeholder="0"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promedioAnual">Promedio Anual</Label>
                  <Input
                    id="promedioAnual"
                    value={formData.promedioAnual}
                    onChange={(e) =>
                      handleInputChange("promedioAnual", e.target.value)
                    }
                    placeholder="Promedio anual"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potenciaContratada">
                    Potencia Contratada
                  </Label>
                  <Input
                    id="potenciaContratada"
                    value={formData.potenciaContratada}
                    onChange={(e) =>
                      handleInputChange("potenciaContratada", e.target.value)
                    }
                    placeholder="Potencia contratada"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) =>
                      handleInputChange("activo", checked)
                    }
                  />
                  <Label htmlFor="activo" className="text-sm font-medium">
                    Contrato Activo
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="liberadoCorte"
                    checked={formData.liberadoCorte}
                    onCheckedChange={(checked) =>
                      handleInputChange("liberadoCorte", checked)
                    }
                  />
                  <Label
                    htmlFor="liberadoCorte"
                    className="text-sm font-medium"
                  >
                    Liberado de Corte
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="madre">Contrato Madre (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="madre"
                    value={formData.madre}
                    onChange={(e) => handleInputChange("madre", e.target.value)}
                    placeholder="Contrato madre (opcional)"
                    className="w-full"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalMadres(true)}
                    className="shrink-0"
                    title="Seleccionar contrato madre"
                  >
                    <Network className="h-4 w-4" />
                  </Button>
                  {formData.madre && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearMadre}
                      className="shrink-0"
                      title="Deseleccionar contrato madre"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal de Selección de Propietarios */}
        <Dialog open={modalPropietario} onOpenChange={setModalPropietario}>
          <DialogContent className="min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-3xl xl:min-w-4xl 2xl:min-w-5xl max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <DialogTitle>Seleccionar Propietario</DialogTitle>
                  <DialogDescription>
                    Selecciona un propietario de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 overflow-auto">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o RUT..."
                  value={busquedaPropietario}
                  onChange={(e) => setBusquedaPropietario(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>

              <div
                ref={propietariosTableRef}
                className="border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto"
              >
                <div className="min-w-[500px]">
                  <Table style={{ width: "100%" }}>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "140px", minWidth: "140px" }}
                        >
                          RUT
                        </TableHead>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "auto", minWidth: "200px" }}
                        >
                          Nombre
                        </TableHead>
                        <TableHead
                          className="text-center text-xs sm:text-sm"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${propietariosVirtualizer.getTotalSize()}px`,
                        position: "relative",
                      }}
                    >
                      {propietariosFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <User className="h-8 w-8 opacity-50" />
                              <p className="text-sm">
                                No se encontraron propietarios
                              </p>
                              {busquedaPropietario && (
                                <p className="text-xs">
                                  Intenta con otro término de búsqueda
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        propietariosVirtualizer
                          .getVirtualItems()
                          .map((virtualRow) => {
                            const prop =
                              propietariosFiltrados[virtualRow.index];
                            return (
                              <TableRow
                                key={prop.rut}
                                data-index={virtualRow.index}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "50px",
                                  transform: `translateY(${virtualRow.start}px)`,
                                  display: "table",
                                }}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell
                                  className="font-mono text-xs sm:text-sm font-medium h-[50px]"
                                  style={{ width: "140px", minWidth: "140px" }}
                                >
                                  {prop.rut}
                                </TableCell>
                                <TableCell
                                  className="text-xs sm:text-sm h-[50px]"
                                  style={{ width: "auto", minWidth: "200px" }}
                                >
                                  <div
                                    className="truncate max-w-[200px]"
                                    title={prop.nombre}
                                  >
                                    {prop.nombre}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="text-center h-[50px]"
                                  style={{ width: "120px", minWidth: "120px" }}
                                >
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleSelectPropietario(prop.rut)
                                    }
                                  >
                                    Seleccionar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Locales */}
        <Dialog open={modalLocal} onOpenChange={setModalLocal}>
          <DialogContent className="min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-3xl xl:min-w-4xl 2xl:min-w-5xl max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <DialogTitle>Seleccionar Local</DialogTitle>
                  <DialogDescription>
                    Puedes seleccionar un local de la lista (opcional)
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 overflow-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número de local o empresa..."
                  value={busquedaLocal}
                  onChange={(e) => setBusquedaLocal(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>

              <div
                ref={localesTableRef}
                className="border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto"
              >
                <div className="min-w-[450px]">
                  <Table style={{ width: "100%" }}>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Número
                        </TableHead>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "auto", minWidth: "200px" }}
                        >
                          Empresa
                        </TableHead>
                        <TableHead
                          className="text-center text-xs sm:text-sm"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${localesVirtualizer.getTotalSize()}px`,
                        position: "relative",
                      }}
                    >
                      {localesFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Building2 className="h-8 w-8 opacity-50" />
                              <p className="text-sm">
                                No se encontraron locales
                              </p>
                              {busquedaLocal && (
                                <p className="text-xs">
                                  Intenta con otro término de búsqueda
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        localesVirtualizer
                          .getVirtualItems()
                          .map((virtualRow) => {
                            const loc = localesFiltrados[virtualRow.index];
                            return (
                              <TableRow
                                key={loc.numeroLocal}
                                data-index={virtualRow.index}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "50px",
                                  transform: `translateY(${virtualRow.start}px)`,
                                  display: "table",
                                }}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell
                                  className="font-mono text-xs sm:text-sm font-medium h-[50px]"
                                  style={{ width: "120px", minWidth: "120px" }}
                                >
                                  {loc.numeroLocal}
                                </TableCell>
                                <TableCell
                                  className="text-xs sm:text-sm h-[50px]"
                                  style={{ width: "auto", minWidth: "200px" }}
                                >
                                  <div
                                    className="truncate max-w-[200px]"
                                    title={loc.empresa}
                                  >
                                    {loc.empresa}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="text-center h-[50px]"
                                  style={{ width: "120px", minWidth: "120px" }}
                                >
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleSelectLocal(loc.numeroLocal)
                                    }
                                  >
                                    Seleccionar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Madres */}
        <Dialog open={modalMadres} onOpenChange={setModalMadres}>
          <DialogContent className="min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-3xl xl:min-w-4xl 2xl:min-w-5xl max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Network className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <DialogTitle>Seleccionar Contrato Madre</DialogTitle>
                  <DialogDescription>
                    Selecciona un contrato madre de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 overflow-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por propietario o código de contrato..."
                  value={busquedaMadres}
                  onChange={(e) => setBusquedaMadres(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>

              <div
                ref={madresTableRef}
                className="border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto"
              >
                <div className="min-w-[450px]">
                  <Table style={{ width: "100%" }}>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "140px", minWidth: "140px" }}
                        >
                          Código
                        </TableHead>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "auto", minWidth: "200px" }}
                        >
                          Propietario
                        </TableHead>
                        <TableHead
                          className="text-center text-xs sm:text-sm"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${madresVirtualizer.getTotalSize()}px`,
                        position: "relative",
                      }}
                    >
                      {madresFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Network className="h-8 w-8 opacity-50" />
                              <p className="text-sm">
                                No se encontraron contratos madre
                              </p>
                              {busquedaMadres && (
                                <p className="text-xs">
                                  Intenta con otro término de búsqueda
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        madresVirtualizer
                          .getVirtualItems()
                          .map((virtualRow) => {
                            const mad = madresFiltradas[virtualRow.index];
                            return (
                              <TableRow
                                key={mad.codigoContrato}
                                data-index={virtualRow.index}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "50px",
                                  transform: `translateY(${virtualRow.start}px)`,
                                  display: "table",
                                }}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell
                                  className="font-mono text-xs sm:text-sm font-medium h-[50px]"
                                  style={{ width: "140px", minWidth: "140px" }}
                                >
                                  {mad.codigoContrato}
                                </TableCell>
                                <TableCell
                                  className="text-xs sm:text-sm h-[50px]"
                                  style={{ width: "auto", minWidth: "200px" }}
                                >
                                  <div
                                    className="truncate max-w-[200px]"
                                    title={mad.nombrePropietario}
                                  >
                                    {mad.nombrePropietario}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="text-center h-[50px]"
                                  style={{ width: "120px", minWidth: "120px" }}
                                >
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleSelectMadre(mad.codigoContrato)
                                    }
                                  >
                                    Seleccionar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Clientes */}
        <Dialog open={modalCliente} onOpenChange={setModalCliente}>
          <DialogContent className="min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-3xl xl:min-w-4xl 2xl:min-w-5xl max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <User className="h-5 w-5 " />
                </div>
                <div>
                  <DialogTitle>Seleccionar Cliente</DialogTitle>
                  <DialogDescription>
                    Selecciona un cliente de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 overflow-auto">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido o RUT..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>

              <div
                ref={clientesTableRef}
                className="border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto"
              >
                <div className="min-w-[600px]">
                  <Table style={{ width: "100%" }}>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "auto", minWidth: "180px" }}
                        >
                          Nombre
                        </TableHead>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "140px", minWidth: "140px" }}
                        >
                          RUT
                        </TableHead>
                        <TableHead
                          className="text-center text-xs sm:text-sm"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${clientesVirtualizer.getTotalSize()}px`,
                        position: "relative",
                      }}
                    >
                      {clientesFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <User className="h-8 w-8 opacity-50" />
                              <p className="text-sm">
                                No se encontraron clientes
                              </p>
                              {busquedaCliente && (
                                <p className="text-xs">
                                  Intenta con otro término de búsqueda
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        clientesVirtualizer
                          .getVirtualItems()
                          .map((virtualRow) => {
                            const cliente = clientesFiltrados[virtualRow.index];
                            return (
                              <TableRow
                                key={cliente.rut}
                                data-index={virtualRow.index}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "60px",
                                  transform: `translateY(${virtualRow.start}px)`,
                                  display: "table",
                                }}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell
                                  className="text-xs sm:text-sm h-[60px]"
                                  style={{ width: "auto", minWidth: "180px" }}
                                >
                                  <div
                                    className="truncate max-w-[200px]"
                                    title={cliente.nombre}
                                  >
                                    {cliente.nombre || ""}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="font-mono text-xs sm:text-sm font-medium h-[60px]"
                                  style={{ width: "140px", minWidth: "140px" }}
                                >
                                  {cliente.rut}
                                </TableCell>
                                <TableCell
                                  className="text-center h-[60px]"
                                  style={{ width: "120px", minWidth: "120px" }}
                                >
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleSelectCliente(cliente.rut)
                                    }
                                  >
                                    Seleccionar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Comunas */}
        <Dialog open={modalComuna} onOpenChange={setModalComuna}>
          <DialogContent className="min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-3xl xl:min-w-4xl 2xl:min-w-5xl max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>Seleccionar Comuna</DialogTitle>
                  <DialogDescription>
                    Selecciona una comuna de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 overflow-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o código de comuna..."
                  value={busquedaComuna}
                  onChange={(e) => setBusquedaComuna(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>

              <div
                ref={comunasTableRef}
                className="border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto"
              >
                <div className="min-w-[400px]">
                  <Table style={{ width: "100%" }}>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "100px", minWidth: "100px" }}
                        >
                          Código
                        </TableHead>
                        <TableHead
                          className="text-xs sm:text-sm"
                          style={{ width: "auto", minWidth: "200px" }}
                        >
                          Nombre
                        </TableHead>
                        <TableHead
                          className="text-center text-xs sm:text-sm"
                          style={{ width: "120px", minWidth: "120px" }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${comunasVirtualizer.getTotalSize()}px`,
                        position: "relative",
                      }}
                    >
                      {comunasFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <MapPin className="h-8 w-8 opacity-50" />
                              <p className="text-sm">
                                No se encontraron comunas
                              </p>
                              {busquedaComuna && (
                                <p className="text-xs">
                                  Intenta con otro término de búsqueda
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        comunasVirtualizer
                          .getVirtualItems()
                          .map((virtualRow) => {
                            const com = comunasFiltradas[virtualRow.index];
                            return (
                              <TableRow
                                key={com.codigo}
                                data-index={virtualRow.index}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "50px",
                                  transform: `translateY(${virtualRow.start}px)`,
                                  display: "table",
                                }}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell
                                  className="font-mono text-xs sm:text-sm font-medium h-[50px]"
                                  style={{ width: "100px", minWidth: "100px" }}
                                >
                                  {com.codigo}
                                </TableCell>
                                <TableCell
                                  className="text-xs sm:text-sm h-[50px]"
                                  style={{ width: "auto", minWidth: "200px" }}
                                >
                                  <div
                                    className="truncate max-w-[200px]"
                                    title={com.nombre}
                                  >
                                    {com.nombre}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="text-center h-[50px]"
                                  style={{ width: "120px", minWidth: "120px" }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSelectComuna(com.codigo)
                                    }
                                    variant="default"
                                  >
                                    Seleccionar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Éxito - Contrato Creado */}
        <Dialog open={modalExito} onOpenChange={setModalExito}>
          <DialogContent className="min-w-[320px] sm:min-w-[400px] md:min-w-[500px] lg:min-w-[600px] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold text-green-900 dark:text-green-100">
                    ¡Contrato Creado Exitosamente!
                  </DialogTitle>
                  <DialogDescription className="text-sm text-green-700 dark:text-green-300 mt-1">
                    El contrato ha sido registrado correctamente en el sistema
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Alert de información del contrato */}
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  Información del Contrato
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200 space-y-4 mt-3">
                  {contratoCreado?.id && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-green-200 dark:border-green-700/50 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                            ID del Contrato
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-lg font-mono font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-3 py-2 rounded-md break-all">
                              {contratoCreado.id}
                            </code>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={async () => {
                            await copiarCodigoContrato(contratoCreado.id!);
                          }}
                          className="shrink-0 bg-green-600 hover:bg-green-700 text-white gap-2 h-auto py-2 px-3"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="text-xs font-semibold">Copiar</span>
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-green-100 dark:border-green-900/50">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                      📅 Fecha de creación
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                      {contratoCreado?.fecha}
                    </p>
                  </div>
                  <div className="flex gap-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                    <span className="text-lg flex-shrink-0">💡</span>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Importante:</strong> Guarde este ID para futuras
                      referencias. Puede utilizarlo para buscar y gestionar este
                      contrato.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalExito(false);
                    setContratoCreado(null);
                  }}
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setModalExito(false);
                    setContratoCreado(null);
                    navigate("/dashboard/administracion/contratos");
                  }}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Contratos
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
