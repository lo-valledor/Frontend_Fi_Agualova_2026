import React, { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  CheckCircle2,
  Gauge,
  FileText,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  InfoIcon,
} from "lucide-react";
import api from "~/lib/api";
import {
  type ConsultaMedidorAntiguoResponse,
  type MedidorAntiguo,
  type MedidorNuevo,
  type DetalleMedidorAntiguo,
  type DetalleMedidorNuevo,
  type ConsultaMedidorNuevoResponse,
} from "~/types/operaciones";
import AntiguoMedidorForm from "./antiguo-medidor-form";
import DetalleMedidorAntiguoComponent from "./detalle-medidor-antiguo";
import NuevoMedidorForm from "./nuevo-medidor-form";
import DetalleMedidorNuevoComponent from "./detalle-medidor-nuevo";
import NuevoContratoForm from "./nuevo-contrato-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export default function CambioMedidorComponent() {
  // Estados para medidor antiguo
  const [medidorAntiguo, setMedidorAntiguo] = useState<MedidorAntiguo>({
    acometida: "",
    numeroSerie: "",
  });

  // Estados para detalles de medidor antiguo
  const [detalleMedidorAntiguo, setDetalleMedidorAntiguo] =
    useState<DetalleMedidorAntiguo>({
      acometidaDetalle: "",
      constante: "",
      marca: "",
      ultimaLectura: "",
      numeroMedidor: "",
      tipo: "",
      modelo: "",
      lecturaActual: "",
      medidorId: 0,
    });

  // Estados para nuevo medidor
  const [medidorNuevo, setMedidorNuevo] = useState<MedidorNuevo>({
    numeroSerie: "",
  });

  // Estados para detalle nuevo medidor
  const [detalleMedidorNuevo, setDetalleMedidorNuevo] =
    useState<DetalleMedidorNuevo>({
      medidor_id: 0,
      tipo_medidor: "",
      constante_multiplicar: 0,
      marca: "",
      modelo: "",
      numero_serie: "",
      estado_medidor: 0,
    });

  // Estado para nuevo contrato
  const [codigoContrato, setCodigoContrato] = useState<string>("");

  // Estado para manejar carga
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Manejadores de cambio de formularios
  const handleMedidorAntiguoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setMedidorAntiguo((prev) => ({
      ...prev,
      [id === "acometida" ? "acometida" : "numeroSerie"]: value,
    }));
  };

  const handleMedidorNuevoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedidorNuevo({
      numeroSerie: e.target.value,
    });
  };

  const handleDetalleMedidorNuevoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;

    // Actualizar el estado con los campos correctos según la interfaz DetalleMedidorNuevo
    if (id === "nuevo-numero-medidor") {
      setDetalleMedidorNuevo((prev) => ({
        ...prev,
        numero_serie: value,
      }));
    } else if (id === "nueva-constante") {
      setDetalleMedidorNuevo((prev) => ({
        ...prev,
        constante_multiplicar: parseFloat(value) || 0,
      }));
    } else if (id === "nueva-marca") {
      setDetalleMedidorNuevo((prev) => ({
        ...prev,
        marca: value,
      }));
    } else if (id === "nuevo-tipo") {
      setDetalleMedidorNuevo((prev) => ({
        ...prev,
        tipo_medidor: value,
      }));
    } else if (id === "nuevo-modelo") {
      setDetalleMedidorNuevo((prev) => ({
        ...prev,
        modelo: value,
      }));
    }
  };

  const handleBuscarAntiguo = async () => {
    try {
      setIsLoading(true);

      // Validar que se haya ingresado al menos un campo
      if (!medidorAntiguo.acometida && !medidorAntiguo.numeroSerie) {
        toast.error("Debe ingresar la acometida o el número de serie");
        return;
      }

      // Construir parámetros
      const params = new URLSearchParams();
      if (medidorAntiguo.acometida) {
        params.append("acometida", medidorAntiguo.acometida);
      }
      if (medidorAntiguo.numeroSerie) {
        params.append("numeroSerie", medidorAntiguo.numeroSerie);
      }

      const response = await api.get("/consulta-medidor-antiguo", { params });

      if (response.status === 200) {
        // Asegurarse de acceder al primer elemento [0] si la respuesta es un array
        const responseData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        const data = responseData as ConsultaMedidorAntiguoResponse;

        setDetalleMedidorAntiguo({
          acometidaDetalle: data.codigo_acometida,
          constante: data.constante_multiplicar.toString(),
          marca: data.marca,
          ultimaLectura: data.ultima_lectura.toString(),
          numeroMedidor: data.numero_serie,
          tipo: data.tipo_medidor,
          modelo: data.modelo,
          lecturaActual: data.lectura_actual?.toString() || "",
          medidorId: data.medidor_id,
        });

        toast.success("Datos del medidor cargados correctamente");

        // Avanzar al siguiente paso si se encontró el medidor
        if (data.medidor_id) {
          setCurrentStep(2);
        }
      }
    } catch (error) {
      console.error("Error al buscar medidor antiguo:", error);
      toast.error("No se pudo obtener la información del medidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscarNuevo = async () => {
    try {
      setIsLoading(true);

      // Validar que se haya ingresado el número de serie
      if (!medidorNuevo.numeroSerie) {
        toast.error("Debe ingresar el número de serie del nuevo medidor");
        return;
      }

      const response = await api.get("/consulta-medidor-nuevo", {
        params: {
          numeroSerie: medidorNuevo.numeroSerie,
        },
      });

      if (response.status === 200) {
        // Asegurarse de acceder al primer elemento [0] si la respuesta es un array
        const responseData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!responseData) {
          toast.error("No se encontró información del medidor");
          return;
        }

        const data = responseData as ConsultaMedidorNuevoResponse;

        setDetalleMedidorNuevo({
          medidor_id: data.medidor_id,
          tipo_medidor: data.tipo_medidor,
          constante_multiplicar: data.constante_multiplicar,
          marca: data.marca,
          modelo: data.modelo,
          numero_serie: data.numero_serie,
          estado_medidor: data.estado_medidor,
        });

        toast.success("Datos del nuevo medidor cargados correctamente");

        // Avanzar al siguiente paso si se encontró el medidor
        setCurrentStep(3);
      }
    } catch (error) {
      console.error("Error al buscar medidor nuevo:", error);
      toast.error("No se pudo obtener la información del nuevo medidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarMedidorAntiguo = () => {
    setMedidorAntiguo({ acometida: "", numeroSerie: "" });
  };

  const handleCambioMedidor = async () => {
    try {
      setIsLoading(true);

      // Validaciones
      if (!detalleMedidorAntiguo.medidorId) {
        toast.error("Debe buscar y seleccionar un medidor antiguo");
        return;
      }

      if (!detalleMedidorNuevo.numero_serie) {
        toast.error("Debe configurar el nuevo medidor");
        return;
      }

      // Implementación pendiente - Aquí iría la llamada a API
      // Por ahora simularemos una respuesta exitosa
      setTimeout(() => {
        toast.success("Cambio de medidor registrado correctamente");

        // Reiniciar formularios
        setMedidorAntiguo({ acometida: "", numeroSerie: "" });
        setDetalleMedidorAntiguo({
          acometidaDetalle: "",
          constante: "",
          marca: "",
          ultimaLectura: "",
          numeroMedidor: "",
          tipo: "",
          modelo: "",
          lecturaActual: "",
          medidorId: 0,
        });
        setMedidorNuevo({ numeroSerie: "" });
        setDetalleMedidorNuevo({
          medidor_id: 0,
          tipo_medidor: "",
          constante_multiplicar: 0,
          marca: "",
          modelo: "",
          numero_serie: "",
          estado_medidor: 0,
        });
        setCodigoContrato("");

        // Volver al primer paso
        setCurrentStep(1);

        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error al registrar cambio de medidor:", error);
      toast.error("No se pudo registrar el cambio de medidor");
      setIsLoading(false);
    }
  };

  // Verificar si el formulario es válido para habilitar botón de cambio
  const isFormValid =
    detalleMedidorAntiguo.medidorId > 0 &&
    detalleMedidorNuevo.numero_serie !== "";

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Función para retroceder al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para renderizar el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="border-sky-200 dark:border-sky-800 shadow-md">
              <CardHeader className="bg-sky-50 dark:bg-sky-950/30 border-b border-sky-200 dark:border-sky-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-full">
                    <Gauge className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-sky-800 dark:text-sky-200">
                      Paso 1: Medidor Antiguo
                    </CardTitle>
                    <CardDescription>
                      Busque el medidor que será reemplazado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AntiguoMedidorForm
                  medidorAntiguo={medidorAntiguo}
                  isLoading={isLoading}
                  onMedidorChange={handleMedidorAntiguoChange}
                  onBuscar={handleBuscarAntiguo}
                  onLimpiar={handleLimpiarMedidorAntiguo}
                />
              </CardContent>
              <CardFooter className="flex justify-end border-t border-sky-100 dark:border-sky-900 pt-4">
                <Button
                  onClick={nextStep}
                  disabled={!detalleMedidorAntiguo.medidorId || isLoading}
                  className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Card className="border-amber-200 dark:border-amber-800 shadow-md">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                    <Gauge className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
                      Paso 2: Detalles del Medidor Antiguo
                    </CardTitle>
                    <CardDescription>
                      Revise la información del medidor a reemplazar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <DetalleMedidorAntiguoComponent
                  detalleMedidorAntiguo={detalleMedidorAntiguo}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-amber-100 dark:border-amber-900 pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Card className="border-emerald-200 dark:border-emerald-800 shadow-md">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                    <Gauge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">
                      Paso 3: Medidor Nuevo
                    </CardTitle>
                    <CardDescription>
                      Configure el nuevo medidor a instalar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <NuevoMedidorForm
                    medidorNuevo={medidorNuevo}
                    isLoading={isLoading}
                    onMedidorChange={handleMedidorNuevoChange}
                    onBuscar={handleBuscarNuevo}
                  />

                  {detalleMedidorNuevo.numero_serie && (
                    <DetalleMedidorNuevoComponent
                      detalleMedidorNuevo={detalleMedidorNuevo}
                      onDetalleMedidorChange={handleDetalleMedidorNuevoChange}
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-emerald-100 dark:border-emerald-900 pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!detalleMedidorNuevo.numero_serie || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <Card className="border-indigo-200 dark:border-indigo-800 shadow-md">
              <CardHeader className="bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-indigo-800 dark:text-indigo-200">
                      Paso 4: Confirmar Cambio
                    </CardTitle>
                    <CardDescription>
                      Revise y confirme el cambio de medidor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-amber-200 dark:border-amber-800">
                      <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
                        <CardTitle className="text-amber-800 dark:text-amber-200">
                          Medidor Antiguo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Acometida:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorAntiguo.acometidaDetalle}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Número de Serie:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorAntiguo.numeroMedidor}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Última Lectura:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorAntiguo.ultimaLectura}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-800">
                      <CardHeader className="bg-emerald-50 dark:bg-emerald-950/30">
                        <CardTitle className="text-emerald-800 dark:text-emerald-200">
                          Medidor Nuevo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Número de Serie:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorNuevo.numero_serie}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Tipo de Medidor:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorNuevo.tipo_medidor}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Constante:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorNuevo.constante_multiplicar}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Marca:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorNuevo.marca}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Modelo:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorNuevo.modelo}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Estado:
                            </span>
                            <span className="font-medium">
                              {detalleMedidorNuevo.estado_medidor === 1
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <NuevoContratoForm
                    codigoContrato={codigoContrato}
                    onCodigoChange={(e) => setCodigoContrato(e.target.value)}
                    isLoading={isLoading}
                    isFormValid={isFormValid}
                    onCambioMedidor={handleCambioMedidor}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-indigo-100 dark:border-indigo-900 pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button
                  onClick={handleCambioMedidor}
                  disabled={!isFormValid || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Confirmar Cambio
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Cambio de Medidor
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestión y reemplazo de medidores en el sistema
          </p>
        </div>
        <div className="hidden md:block">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
              >
                <InfoIcon className="h-4 w-4" />
                <span className="ml-2">Información</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Información</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <p>
                  Este es un componente de cambio de medidor. Aquí puedes
                  gestionar el reemplazo de medidores en el sistema.
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1
                  ? "bg-sky-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>1</span>
              )}
            </div>
            <div className="ml-2 text-sm font-medium">Medidor Antiguo</div>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-muted">
            <div
              className="h-full bg-sky-600"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2
                  ? "bg-amber-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 2 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>2</span>
              )}
            </div>
            <div className="ml-2 text-sm font-medium">Detalles Antiguo</div>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-muted">
            <div
              className="h-full bg-amber-600"
              style={{
                width: `${((currentStep - 2) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 3 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>3</span>
              )}
            </div>
            <div className="ml-2 text-sm font-medium">Medidor Nuevo</div>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-muted">
            <div
              className="h-full bg-emerald-600"
              style={{
                width: `${((currentStep - 3) / (totalSteps - 1)) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 4
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span>4</span>
            </div>
            <div className="ml-2 text-sm font-medium">Confirmar</div>
          </div>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Contenido del paso actual */}
      {renderStep()}
    </div>
  );
}
