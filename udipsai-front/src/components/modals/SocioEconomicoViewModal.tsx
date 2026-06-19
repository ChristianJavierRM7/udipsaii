import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { toast } from "react-toastify";
import { fichasService, pacientesService } from "../../services";
import { FichaSocioeconomicaState } from "../form/fichas-form/FormularioSocioEconomica";
import { FileDown, User, Users, ShieldAlert, HeartPulse, Home, Clock, DollarSign, FileText, ArrowLeft, Eye, Calendar } from "lucide-react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";

interface SocioEconomicoProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
}

export const SocioEconomicoViewModal: React.FC<SocioEconomicoProps> = ({
  isOpen,
  onClose,
  pacienteId,
}) => {
  const [data, setData] = useState<FichaSocioeconomicaState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState<any>(null);

  useEffect(() => {
    if (isOpen && pacienteId) {
      cargarHistorial();
    }
    if (!isOpen) {
      setFichaSeleccionada(null);
      setData(null);
    }
  }, [isOpen, pacienteId]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setHistorial([]);
      const res = await fichasService.obtenerHistorialSocioEconomico(pacienteId);
      setHistorial(res || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar historial de fichas socioeconómicas");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarFicha = async (res: any) => {
    try {
      setLoading(true);
      setFichaSeleccionada(res);

      let fullPaciente = res.paciente;
      if (res.paciente?.id) {
        try {
          fullPaciente = await pacientesService.obtenerPorId(res.paciente.id);
        } catch (pError) {
          console.warn("No se pudo cargar el detalle completo del paciente:", pError);
        }
      }

      const mappedFamiliares = (res.familiares || []).map((f: any) => ({
        ...f,
        salud: {
          problema: f.problemasSalud || false,
          enfermedad: f.descripProblemasSalud || "",
          catastrofica: f.enfermedadCatastrofica || false,
          enfermedadCatastrofica: f.descripEnfermedadCatastrofica || "",
          discapacidad: f.discapacidad || false,
          descripDiscapacidad: f.descripDiscapacidad || "",
        },
      }));

      const loadedData: FichaSocioeconomicaState = {
        ...res,
        paciente: {
          ...res.paciente,
          ...fullPaciente,
        },
        riesgosFamiliares: res.riesgosSociales || {},
        vulnerabilidadesDetalle: res.vulnerabilidad || {},
        familiares: mappedFamiliares,
      };

      setData(loadedData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar detalles de la ficha socioeconómica");
    } finally {
      setLoading(false);
    }
  };

  const normalizarFormatoFecha = (fechaStr: string) => {
    if (!fechaStr) return "S/F";
    return new Date(fechaStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizarValor = (val?: string) => {
    if (!val) return "";

    const map: Record<string, string> = {
      MUY_BUENA: "Muy buena",
      BUENA: "Buena",
      REGULAR: "Regular",
      MALA: "Mala",
      HIJO_UNICO: "Hijo único",
      COMPLETO: "Completo",
      INCOMPLETO: "Incompleto",
      FUNCIONAL: "Funcional",
      DISFUNCIONAL: "Disfuncional",
    };

    return map[val] || val;
  };

  const renderOpciones = (
    valor: string | undefined,
    opciones: string[]
  ) => {
    const valorNormalizado = normalizarValor(valor);

    return (
      <div className="flex flex-wrap gap-2.5 mt-1.5">
        {opciones.map((op) => {
          const selected =
            valorNormalizado.toLowerCase() === op.toLowerCase() ||
            (op === "Hijo único" && valorNormalizado === "HIJO_UNICO") ||
            (op === "Muy buena" && valorNormalizado === "Muy buena");
          return (
            <span
              key={op}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-sm font-medium transition-all ${
                selected
                  ? "border-brand-500 bg-brand-50/50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-950/20 dark:text-brand-400"
                  : "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selected ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
              {op}
            </span>
          );
        })}
      </div>
    );
  };

  const getLugarAgresion = (tipo: string, lugarAgresion?: string) => {
    if (!lugarAgresion) return "";
    const item = lugarAgresion.split(",").find((i) => i.startsWith(tipo));
    return item ? item.split(":")[1] || "" : "";
  };

  const getActividadesTiempoLibre = (fieldVal?: string) => {
    if (!fieldVal) return [];
    try {
      return JSON.parse(fieldVal) as string[];
    } catch {
      return [];
    }
  };

  const checkValue = (fieldVal: string | undefined, option: string) => {
    if (!fieldVal) return false;
    const values = fieldVal.split(",");
    if (option === "otros") {
      return values.some((v) => v.startsWith("otros"));
    }
    return values.includes(option);
  };

  const getOtrosValue = (fieldVal: string | undefined) => {
    if (!fieldVal) return "";
    const values = fieldVal.split(",");
    const otrosItem = values.find((v) => v.startsWith("otros:"));
    return otrosItem ? otrosItem.split(":")[1] || "" : "";
  };

  const handleExportPdf = async () => {
    if (!data?.id) return;

    try {
      setIsExporting(true);
      toast.info("Generando reporte PDF...");

      const blob = await fichasService.exportarPdfSocioEconomicoPorId(data.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ficha_socioeconomica_${data.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Reporte PDF generado correctamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdfForId = async (id: number) => {
    try {
      setIsExporting(true);
      toast.info("Generando reporte PDF...");

      const blob = await fichasService.exportarPdfSocioEconomicoPorId(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ficha_socioeconomica_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Reporte PDF generado correctamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-0 overflow-hidden">
      {fichaSeleccionada ? (
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between border-b pb-4 dark:border-gray-800">
            <div>
              <button
                onClick={() => setFichaSeleccionada(null)}
                className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <ArrowLeft size={14} /> Volver al historial
              </button>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-brand-500" /> Ficha Socioeconómica
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Paciente ID: {pacienteId} &bull; Ficha N°: {data?.id ?? "N/A"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileDown size={16} />
              {isExporting ? "Generando..." : "Exportar PDF"}
            </Button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="ml-3 text-gray-500">Cargando datos de la ficha...</span>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-gray-500">
              No existe una ficha socioeconómica registrada para este paciente.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
          {/* HEADER META INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs text-gray-400 block uppercase font-semibold">Fecha de Elaboración</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {data.fechaElaboracion
                  ? new Date(data.fechaElaboracion).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-semibold">N° de Ficha</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{data.id ?? "N/A"}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-semibold">Especialista Encargado</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {data.especialista?.nombresApellidos ?? (data as any).responsable ?? "N/A"}
              </span>
            </div>
          </div>

          {/* 1. DATOS DE IDENTIFICACIÓN */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <User size={18} className="text-brand-500" /> 1. Datos de Identificación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm pt-2">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Nombres y Apellidos:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">{data.paciente?.nombresApellidos || "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Lugar y Fecha de Nacimiento:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {data.paciente?.lugarNacimiento || "N/A"} &bull;{" "}
                  {data.paciente?.fechaNacimiento
                    ? new Date(data.paciente.fechaNacimiento).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Edad:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {data.paciente?.edad ? `${data.paciente.edad} años` : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Instrucción:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">{data.pacienteInstruccion || "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Ocupación:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">{data.pacienteOcupacion || "N/A"}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Dirección Domicilio:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">{data.paciente?.domicilio || "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">E-mail:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">{data.pacienteEmail || "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Teléfono/Celular:</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {[data.paciente?.numeroTelefono, data.paciente?.numeroCelular].filter(Boolean).join(" / ") || "N/A"}
                </span>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2 mt-1 border-t border-gray-50 dark:border-gray-800 pt-3">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Presenta Discapacidad:</span>{" "}
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {data.paciente?.portadorCarnet ? "SÍ" : "NO"}
                  </span>
                </div>
                {data.paciente?.portadorCarnet && (
                  <>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Tipo:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">{data.paciente?.tipoDiscapacidad || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Porcentaje:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {data.paciente?.porcentajeDiscapacidad ? `${data.paciente.porcentajeDiscapacidad}%` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">N° Carné (Cédula):</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">{data.paciente?.cedula || "N/A"}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="md:col-span-2 border-t border-gray-50 dark:border-gray-800 pt-3">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Persona que Proporciona la Información (Responsable):</span>{" "}
                <span className="text-gray-600 dark:text-gray-400 font-medium text-brand-600 dark:text-brand-400">{data.responsable || "N/A"}</span>
              </div>
            </div>
          </section>

          {/* 2. CONFORMACIÓN FAMILIAR */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <Users size={18} className="text-brand-500" /> 2. Conformación Familiar
            </h4>
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">N°</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Relación</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Nombres y Apellidos</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Edad</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Est. Civil</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Instrucción</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Ocupación</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Ingreso Mensual</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Cédula</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Correo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                  {data.familiares && data.familiares.length > 0 ? (
                    data.familiares.map((fam, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.relacion || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.nombresApellidos || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.edad || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.estadoCivil || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.instruccion || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.ocupacion || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {fam.ingresoMensual != null ? `$${fam.ingresoMensual}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.cedula || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.numeroTelefono || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{fam.correoElectronico || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                        Sin miembros de la familia registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. PROBLEMAS SOCIALES QUE PONEN EN RIESGO LA ESTABILIDAD FAMILIAR */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <ShieldAlert size={18} className="text-brand-500" /> 3. Problemas Sociales que ponen en riesgo la estabilidad familiar
            </h4>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  {
                    label: "Violencia intrafamiliar",
                    checked:
                      data.riesgosFamiliares?.violenciaIntrafamiliar ||
                      data.riesgosFamiliares?.problemasSociales?.includes("violencia"),
                  },
                  { label: "Alcoholismo", checked: data.riesgosFamiliares?.problemasSociales?.includes("alcoholismo") },
                  { label: "Drogadicción", checked: data.riesgosFamiliares?.problemasSociales?.includes("drogadiccion") },
                  { label: "Desempleo", checked: data.riesgosFamiliares?.problemasSociales?.includes("desempleo") },
                  { label: "Delincuencia", checked: data.riesgosFamiliares?.problemasSociales?.includes("delincuencia") },
                  { label: "Tabaquismo", checked: data.riesgosFamiliares?.problemasSociales?.includes("tabaquismo") },
                  { label: "Discapacidad", checked: data.riesgosFamiliares?.problemasSociales?.includes("discapacidad") },
                  { label: "Juegos de azar", checked: data.riesgosFamiliares?.problemasSociales?.includes("juegosAzar") },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border ${
                        item.checked
                          ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                          : "border-gray-300 dark:border-gray-700 text-transparent"
                      }`}
                    >
                      {item.checked ? "✓" : ""}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>

              {data.riesgosFamiliares?.problemasSociales?.includes("otros") && (
                <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Otros problemas:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {getOtrosValue(data.riesgosFamiliares?.problemasSociales)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      ¿Algún miembro de la familia migró al exterior?:
                    </span>{" "}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {data.riesgosFamiliares?.migroExterior ? "SÍ" : "NO"}
                    </span>
                  </div>
                  {data.riesgosFamiliares?.migroExterior && (
                    <>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Lugar:</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {data.riesgosFamiliares?.lugarMigracion || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Tiempo:</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {data.riesgosFamiliares?.tiempoMigracion || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {data.riesgosFamiliares?.migroExterior && data.riesgosFamiliares?.afectacionFamiliar && (
                  <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1">
                      Afectación familiar:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{data.riesgosFamiliares.afectacionFamiliar}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 4. SITUACIÓN DE VULNERABILIDAD */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <ShieldAlert size={18} className="text-brand-500" /> 4. Situación de Vulnerabilidad
            </h4>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Movilidad humana", checked: data.vulnerabilidadesDetalle?.movilidadHumana },
                  { label: "Enfermedades catastróficas", checked: data.vulnerabilidadesDetalle?.enfermedadCatastrofica },
                  { label: "Embarazo adolescente", checked: data.vulnerabilidadesDetalle?.embarazoAdolescente },
                  { label: "Abuso sexual", checked: data.vulnerabilidadesDetalle?.abusoSexual },
                  { label: "Agresión física", checked: data.vulnerabilidadesDetalle?.agresionFisica },
                  { label: "Agresión psicológica", checked: data.vulnerabilidadesDetalle?.agresionPsicologica },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border ${
                        item.checked
                          ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                          : "border-gray-300 dark:border-gray-700 text-transparent"
                      }`}
                    >
                      {item.checked ? "✓" : ""}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>

              {(data.vulnerabilidadesDetalle?.agresionFisica || data.vulnerabilidadesDetalle?.agresionPsicologica) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                  {data.vulnerabilidadesDetalle?.agresionFisica && (
                    <div className="text-sm bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Lugar agresión física:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {getLugarAgresion("fisica", data.vulnerabilidadesDetalle?.lugarAgresion) || "N/A"}
                      </span>
                    </div>
                  )}
                  {data.vulnerabilidadesDetalle?.agresionPsicologica && (
                    <div className="text-sm bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Lugar agresión psicológica:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {getLugarAgresion("psicologica", data.vulnerabilidadesDetalle?.lugarAgresion) || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 5. RELACIONES FAMILIARES */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <Users size={18} className="text-brand-500" /> 5. Relaciones Familiares
            </h4>
            <div className="space-y-4 text-sm pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ¿Se respeta la opinión de los miembros de la familia?
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/20 px-3 py-1 rounded-xl">
                    {data.dinamicaFamiliar?.opinionfamiliar ? "SÍ" : "NO"}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ¿La familia es muy unida cuando enfrentan problemas?
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/20 px-3 py-1 rounded-xl">
                    {data.dinamicaFamiliar?.unionfamiliar ? "SÍ" : "NO"}
                  </span>
                </div>
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="font-medium block text-gray-700 dark:text-gray-300 mb-1">
                    En caso de conflictos familiares, ¿cómo los resuelven?
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {data.dinamicaFamiliar?.resolucionConflictos || "N/A"}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ¿Los miembros de la familia cumplen con las reglas establecidas?
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/20 px-3 py-1 rounded-xl">
                    {data.dinamicaFamiliar?.cumplenReglas ? "SÍ" : "NO"}
                  </span>
                </div>
                {!data.dinamicaFamiliar?.cumplenReglas && (
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="font-medium block text-gray-700 dark:text-gray-300 mb-1">
                      ¿Quiénes no cumplen con las reglas?
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {data.dinamicaFamiliar?.quienesIncumplenReglas || "N/A"}
                    </span>
                  </div>
                )}
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ¿La familia comparte actividades del hogar?
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/20 px-3 py-1 rounded-xl ml-2">
                    {data.dinamicaFamiliar?.tieneActividadesFamiliares ? "SÍ" : "NO"}
                  </span>
                  {data.dinamicaFamiliar?.tieneActividadesFamiliares && data.dinamicaFamiliar?.actividadesCompartidas && (
                    <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 text-gray-600 dark:text-gray-400 font-medium">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Actividades:</span>{" "}
                      {data.dinamicaFamiliar.actividadesCompartidas}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Las relaciones entre los/las hermanos/as es:
                  </span>
                  {renderOpciones(data.dinamicaFamiliar?.relacionHermanos, [
                    "Muy buena",
                    "Buena",
                    "Regular",
                    "Mala",
                    "Hijo único",
                  ])}
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Las relaciones entre padres e hijos/as es:
                  </span>
                  {renderOpciones(data.dinamicaFamiliar?.relacionPadresHijos, ["Muy buena", "Buena", "Regular", "Mala"])}
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    La comunicación entre los miembros de la familia es:
                  </span>
                  {renderOpciones(data.dinamicaFamiliar?.comunicacionFamiliar, [
                    "Muy buena",
                    "Buena",
                    "Regular",
                    "Mala",
                  ])}
                </div>
              </div>
            </div>
          </section>

          {/* 6. TIPO DE HOGAR */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <Users size={18} className="text-brand-500" /> 6. Tipo de Hogar
            </h4>
            <div className="text-sm pt-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Estructura y funcionalidad familiar:</p>
              {renderOpciones(data.dinamicaFamiliar?.tipoHogar, ["Completo", "Incompleto", "Funcional", "Disfuncional"])}
            </div>
          </section>

          {/* 7. VIVIENDA Y HABITABILIDAD */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <Home size={18} className="text-brand-500" /> 7. Vivienda y Habitabilidad
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm pt-2">
              {/* Left Column: Vivienda */}
              <div className="space-y-4">
                <h5 className="font-bold text-gray-800 dark:text-gray-200 border-b pb-1 dark:border-gray-800">
                  Condiciones de Vivienda
                </h5>
                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1.5">Tipo de tenencia:</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["propia", "arrendada", "prestada", "servicios", "hipoteca", "otros"].map((t) => {
                      const checked = checkValue(data.vivienda?.tipoTenencia, t);
                      return (
                        <span key={t} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="capitalize text-gray-600 dark:text-gray-400">
                            {t === "servicios" ? "Por servicios" : t === "hipoteca" ? "Hipoteca" : t}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  {checkValue(data.vivienda?.tipoTenencia, "otros") && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Especificado:</span>{" "}
                      {getOtrosValue(data.vivienda?.tipoTenencia)}
                    </p>
                  )}
                </div>

                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1.5">
                    Material de paredes:
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["adobe", "ladrillo", "bloque", "madera", "bahareque", "otros"].map((t) => {
                      const checked = checkValue(data.vivienda?.materialParedes, t);
                      return (
                        <span key={t} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="capitalize text-gray-600 dark:text-gray-400">{t}</span>
                        </span>
                      );
                    })}
                  </div>
                  {checkValue(data.vivienda?.materialParedes, "otros") && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Especificado:</span>{" "}
                      {getOtrosValue(data.vivienda?.materialParedes)}
                    </p>
                  )}
                </div>

                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1.5">Material de piso:</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["baldosa", "cemento", "madera", "tierra", "otros"].map((t) => {
                      const checked = checkValue(data.vivienda?.materialPiso, t);
                      return (
                        <span key={t} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="capitalize text-gray-600 dark:text-gray-400">{t}</span>
                        </span>
                      );
                    })}
                  </div>
                  {checkValue(data.vivienda?.materialPiso, "otros") && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Especificado:</span>{" "}
                      {getOtrosValue(data.vivienda?.materialPiso)}
                    </p>
                  )}
                </div>

                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1.5">Material de techo:</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["zinc", "teja", "eternit", "loza", "ardex", "otros"].map((t) => {
                      const checked = checkValue(data.vivienda?.materialTecho, t);
                      return (
                        <span key={t} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="capitalize text-gray-600 dark:text-gray-400">
                            {t === "ardex" ? "Árdex" : t}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  {checkValue(data.vivienda?.materialTecho, "otros") && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Especificado:</span>{" "}
                      {getOtrosValue(data.vivienda?.materialTecho)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Habitabilidad */}
              <div className="space-y-4 lg:border-l lg:pl-6 lg:border-gray-100 lg:dark:border-gray-800">
                <h5 className="font-bold text-gray-800 dark:text-gray-200 border-b pb-1 dark:border-gray-800">
                  Condiciones de Habitabilidad
                </h5>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">N° Cuartos:</span>{" "}
                    <strong className="text-gray-900 dark:text-white">{data.vivienda?.numeroCuartos ?? 0}</strong>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">N° Dormitorios:</span>{" "}
                    <strong className="text-gray-900 dark:text-white">{data.vivienda?.numeroDormitorios ?? 0}</strong>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">N° Camas:</span>{" "}
                    <strong className="text-gray-900 dark:text-white">{data.vivienda?.numeroCamas ?? 0}</strong>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">N° SS.HH.:</span>{" "}
                    <strong className="text-gray-900 dark:text-white">{data.vivienda?.numeroSanitarios ?? 0}</strong>
                  </div>
                </div>

                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1.5">
                    Abastecimiento de agua:
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["potable", "entubada", "acequia", "fuera"].map((t) => {
                      const checked = checkValue(data.vivienda?.procedenciaAgua, t);
                      return (
                        <span key={t} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {t === "fuera" ? "Fuera de la casa" : t}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-1.5">
                    Tipo de servicio sanitario:
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["sshh", "letrina", "airelibre", "pozo"].map((t) => {
                      const checked = checkValue(data.vivienda?.tipoSanitario, t);
                      return (
                        <span key={t} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {t === "sshh"
                              ? "SS.HH."
                              : t === "airelibre"
                              ? "Aire libre"
                              : t === "pozo"
                              ? "Pozo séptico"
                              : "Letrina"}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ¿Tiene ducha?:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${data.vivienda?.tieneDucha ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"}`}>
                    {data.vivienda?.tieneDucha ? "SÍ" : "NO"}
                  </span>
                </div>

                <div className="md:col-span-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-2">
                    Electricidad y Telecomunicaciones:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-medium mb-1">Tiene Electricidad</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.vivienda?.tieneElectricidad ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"}`}>
                        {data.vivienda?.tieneElectricidad ? "SÍ" : "NO"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-medium mb-1">Tiene Internet</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.vivienda?.tieneInternet ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"}`}>
                        {data.vivienda?.tieneInternet ? "SÍ" : "NO"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-medium mb-1">Número de Focos</span>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{data.vivienda?.numeroFocos ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-medium mb-1">Otros detalles</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.vivienda?.otrosDetallesElectricidad || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. SITUACIÓN DE SALUD */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <HeartPulse size={18} className="text-brand-500" /> 8. Situación de Salud
            </h4>
            <div className="space-y-4 text-sm pt-2">
              <div>
                <span className="font-semibold block text-gray-700 dark:text-gray-300 mb-2">
                  Cuando requiere atención médica acude a:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mb-1.5">Institución Pública</p>
                    <div className="space-y-1">
                      {["Subcentro de Salud", "Hospital", "Seguro Social", "Seguro Campesino", "Institución Pública"].map(
                        (op) => {
                          const checked = data.salud?.lugarAtencionMedica?.includes(op);
                          return (
                            <div key={op} className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                                  checked
                                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                    : "border-gray-300 dark:border-gray-700 text-transparent"
                                }`}
                              >
                                {checked ? "✓" : ""}
                              </span>
                              <span className="text-gray-755 dark:text-gray-300">
                                {op === "Institución Pública" ? "Otra Inst. Pública" : op}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mb-1.5">Institución Privada / Otros</p>
                    <div className="space-y-1">
                      {["Médico naturista", "Médico particular", "Seguro privado", "Medicina casera", "Se automedica"].map(
                        (op) => {
                          const checked = data.salud?.lugarAtencionMedica?.includes(op);
                          return (
                            <div key={op} className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                                  checked
                                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                    : "border-gray-300 dark:border-gray-700 text-transparent"
                                }`}
                              >
                                {checked ? "✓" : ""}
                              </span>
                              <span className="text-gray-755 dark:text-gray-300">{op}</span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Problemas de salud del estudiante:
                  </span>{" "}
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {data.salud?.saludEstudiante ? "SÍ" : "NO"}
                  </span>
                  {data.salud?.saludEstudiante && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400">({data.salud.saludEstudiante})</span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Requiere ayudas técnicas:
                </span>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {["audifonos", "lentes", "jaws", "silla"].map((op) => {
                    const checked = data.salud?.ayudasTecnicas?.includes(op);
                    return (
                      <span key={op} className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                            checked
                              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                              : "border-gray-300 dark:border-gray-700 text-transparent"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span className="capitalize text-gray-600 dark:text-gray-400">
                          {op === "silla" ? "Silla de ruedas" : op}
                        </span>
                      </span>
                    );
                  })}
                </div>
                {data.salud?.ayudasTecnicas?.includes("otros:") && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Otras ayudas:</span>{" "}
                    {data.salud.ayudasTecnicas.split("otros:")[1]}
                  </p>
                )}
              </div>

              {/* Salud de Familiares */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">Salud de Familiares:</span>
                {data.familiares &&
                data.familiares.some((f) => f.salud?.problema || f.salud?.catastrofica || f.salud?.discapacidad) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.familiares
                      .filter((f) => f.salud?.problema || f.salud?.catastrofica || f.salud?.discapacidad)
                      .map((fam, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5"
                        >
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            {fam.nombresApellidos} ({fam.relacion})
                          </p>
                          {fam.salud?.problema && (
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Problemas salud:</span> {fam.salud.enfermedad || "Sí"}
                            </p>
                          )}
                          {fam.salud?.catastrofica && (
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-red-500 dark:text-red-400">
                                Enfermedad catastrófica:
                              </span>{" "}
                              {fam.salud.enfermedadCatastrofica || "Sí"}
                            </p>
                          )}
                          {fam.salud?.discapacidad && (
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Discapacidad:</span>{" "}
                              {(() => {
                                const desc = fam.salud.descripDiscapacidad || "";
                                const parts = desc.split("|");
                                const tipo = parts[0] || "N/A";
                                const pct = parts[1] || "N/A";
                                const carnet = parts[2] ? parts[2].replace("Carnet:", "") : "N/A";
                                return `Tipo: ${tipo}, Porcentaje: ${pct}%, N° Carné: ${carnet}`;
                              })()}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">
                    Ningún familiar presenta problemas de salud, enfermedad catastrófica o discapacidad.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 9. USO DEL TIEMPO LIBRE */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> 9. Uso del Tiempo Libre
            </h4>
            <div className="text-sm pt-2">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {(() => {
                  const actividades = getActividadesTiempoLibre(data.situacionEconomica?.actividadesTiempoLibre);
                  return (
                    <>
                      {["Deporte", "Música", "TV", "Internet", "Paseos familiares", "Amigos/as"].map((op) => {
                        const checked = actividades.includes(op);
                        return (
                          <span key={op} className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                                checked
                                  ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                  : "border-gray-300 dark:border-gray-700 text-transparent"
                              }`}
                            >
                              {checked ? "✓" : ""}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{op}</span>
                          </span>
                        );
                      })}
                      {actividades.some((a) => a.startsWith("Trabajo infantil:")) && (
                        <div className="w-full bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Trabajo infantil:</span>{" "}
                          <span className="text-gray-600 dark:text-gray-400">
                            {actividades.find((a) => a.startsWith("Trabajo infantil:"))?.replace("Trabajo infantil:", "")}
                          </span>
                        </div>
                      )}
                      {actividades.some((a) => a.startsWith("Otros:")) && (
                        <div className="w-full bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Otros detalles:</span>{" "}
                          <span className="text-gray-600 dark:text-gray-400">
                            {actividades.find((a) => a.startsWith("Otros:"))?.replace("Otros:", "")}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* 10. SITUACIÓN ECONÓMICA */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <DollarSign size={18} className="text-brand-500" /> 10. Situación Económica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm pt-2">
              {/* Ingresos */}
              <div className="space-y-3">
                <h5 className="font-bold text-gray-800 dark:text-gray-200 border-b pb-1 dark:border-gray-800">
                  Ingresos Mensuales
                </h5>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Padre:</span>
                    <span>${(data.desgloseEconomico as any)?.ingresoPadre ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Madre:</span>
                    <span>${(data.desgloseEconomico as any)?.ingresoMadre ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Familiares:</span>
                    <span>${(data.desgloseEconomico as any)?.ingresoFamiliares ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Otros:</span>
                    <span>${(data.desgloseEconomico as any)?.ingresoOtros ?? 0}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 font-bold flex justify-between text-brand-600 dark:text-brand-400">
                    <span>Total Ingresos:</span>
                    <span>${data.situacionEconomica?.totalIngresos ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Egresos */}
              <div className="space-y-3">
                <h5 className="font-bold text-gray-800 dark:text-gray-200 border-b pb-1 dark:border-gray-800">
                  Egresos Mensuales
                </h5>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Alimentación:</span>
                    <span>${data.desgloseEconomico?.egresoAlimentacion ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Arriendo:</span>
                    <span>${data.desgloseEconomico?.egresoArriendo ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Agua/Luz:</span>
                    <span>${data.desgloseEconomico?.egresoServiciosBasicos ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Salud:</span>
                    <span>${data.desgloseEconomico?.egresoSalud ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Educación:</span>
                    <span>${data.desgloseEconomico?.egresoEducacion ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Préstamos:</span>
                    <span>${data.desgloseEconomico?.egresoPrestamos ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Otros:</span>
                    <span>${data.desgloseEconomico?.egresoOtros ?? 0}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 font-bold flex justify-between text-brand-600 dark:text-brand-400">
                    <span>Total Egresos:</span>
                    <span>${data.situacionEconomica?.totalEgresos ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Condición y Clasificación */}
              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-gray-800 dark:text-gray-200 border-b pb-1 dark:border-gray-800">
                    Condición Económica
                  </h5>
                  <div className="pt-1.5">
                    {renderOpciones(data.situacionEconomica?.condicionEconomica, ["Muy buena", "Buena", "Regular", "Mala"])}
                  </div>
                </div>

                {data.situacionEconomica?.ingresoPerCapita !== undefined && data.situacionEconomica?.ingresoPerCapita !== null && (
                  <div className="pt-2">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 border-b pb-1 dark:border-gray-800 mb-2">
                      Clasificación Socioeconómica
                    </h5>
                    <div className="space-y-2 bg-gray-50 dark:bg-gray-800/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Ingreso Per Cápita:</span>
                        <span className="font-bold">${Number(data.situacionEconomica.ingresoPerCapita).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Grupo:</span>
                        <span>Grupo {data.situacionEconomica.grupoSocioeconomico ?? 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Categoría:</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">
                          {data.situacionEconomica.categoriaSocioeconomica || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 11. CONCLUSIONES */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-brand-500" /> 11. Conclusiones
            </h4>
            <div className="text-sm bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 whitespace-pre-wrap leading-relaxed mt-2 text-gray-700 dark:text-gray-300">
              {data.conclusiones || "No registradas"}
            </div>
          </section>

          {/* 12. RECOMENDACIONES */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-brand-500" /> 12. Recomendaciones
            </h4>
            <div className="text-sm bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 whitespace-pre-wrap leading-relaxed mt-2 text-gray-700 dark:text-gray-300">
              {data.recomendaciones || "No registradas"}
            </div>
          </section>

          {/* 13. CAPACIDAD DE GASTO EN EVALUACIÓN */}
          <section className="space-y-3 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-800 dark:text-white border-l-4 border-brand-500 pl-3 uppercase text-sm tracking-wider flex items-center gap-2">
              <DollarSign size={18} className="text-brand-500" /> 13. Capacidad de Gasto en Evaluación
            </h4>
            <div className="text-sm pt-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Según su situación económica, ¿hasta cuánto podría gastar en una evaluación psicopedagógica?:
              </p>
              {(() => {
                const val = data.situacionEconomica?.capacidadGastoEvaluacion || "";
                const matchesOp = ["3$ por sesión", "5$ por sesión", "10$ por sesión", "15$ por sesión", "No puedo cubrir los gastos"].some(
                  (op) => val.startsWith(op.substring(0, 3)) || (op.startsWith("No puedo") && val.includes("No puedo"))
                );
                return (
                  <div className="space-y-2.5">
                    {["3$ por sesión", "5$ por sesión", "10$ por sesión", "15$ por sesión", "No puedo cubrir los gastos"].map((op) => {
                      const checked =
                        val.startsWith(op.substring(0, 3)) ||
                        (op.startsWith("No puedo") && val.includes("No puedo"));
                      return (
                        <div key={op} className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${
                              checked
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold"
                                : "border-gray-300 dark:border-gray-700 text-transparent"
                            }`}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{op}</span>
                        </div>
                      );
                    })}
                    {!matchesOp && val.trim() !== "" && (
                      <div className="flex items-center gap-2 mt-2 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Otros:</span>
                        <span className="text-gray-600 dark:text-gray-400">{val.replace("OTRO:", "").trim()}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* FIRMAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 mt-6 shadow-sm">
            {/* CREADO POR */}
            <div className="text-center p-5 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900">
              <div className="h-16 flex items-end justify-center mb-3">
                <span className="text-xs text-gray-400 italic">Creado por</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
                  {data.pasante ? data.pasante.nombresApellidos : (data.especialista?.nombresApellidos || "Especialista")}
                </span>
                <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                  {data.pasante ? "Pasante" : "Especialista"}
                </span>
              </div>
            </div>

            {/* REVISADO POR */}
            <div className="text-center p-5 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900">
              <div className="h-16 flex items-end justify-center mb-3">
                <span className="text-xs text-gray-400 italic">Revisado por</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
                  {data.pasante 
                    ? (data.pasante.especialista?.nombresApellidos || "Especialista a Cargo") 
                    : "Lcda. Gabriela Jara S., Mgs."}
                </span>
                <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                  {data.pasante ? "Especialista a Cargo" : "Coordinadora de la UDIPSAI"}
                </span>
              </div>
            </div>

            {/* RESPONSABLE DE LA INFORMACION */}
            <div className="text-center p-5 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900">
              <div className="h-16 flex items-end justify-center mb-3">
                <span className="text-xs text-gray-400 italic">Responsable de la Información (Familiar)</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">{data.responsable || "N/A"}</span>
                <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Nombre / Relación del Responsable</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
        <>
          {/* MENU / HISTORY LIST OF PREVIOUS SOCIAL REPORTS */}
          <div className="bg-brand-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Historial de Fichas Socioeconómicas</h3>
                <p className="text-white/80 text-sm">Listado de fichas registradas por paciente</p>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Cargando historial...</p>
              </div>
            ) : historial.length > 0 ? (
              <div className="space-y-4">
                {historial.map((ficha, index) => {
                  const creatorName = ficha.pasante 
                    ? `${ficha.pasante.nombresApellidos} (Pasante)` 
                    : `${ficha.especialista?.nombresApellidos || ficha.responsable || "Especialista"} (Especialista)`;

                  return (
                    <div 
                      key={ficha.id} 
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              Ficha N° {historial.length - index}
                            </span>
                            <Badge 
                              size="sm" 
                              color={ficha.activo ? "success" : "error"}
                            >
                              {ficha.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {normalizarFormatoFecha(ficha.fechaElaboracion)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              Creado por: {creatorName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => seleccionarFicha(ficha)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-600 hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm dark:bg-brand-900/20 dark:border-brand-800/50 dark:hover:bg-brand-600 dark:hover:text-white"
                          >
                            <Eye size={16} />
                            Visualizar
                          </button>
                          
                          <button
                            onClick={() => handleExportPdfForId(ficha.id)}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm border bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:hover:bg-red-600 dark:hover:text-white"
                          >
                            <FileDown size={16} />
                            Descargar PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No se encontraron fichas socioeconómicas registradas para este paciente.</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end bg-white dark:bg-gray-800 dark:border-gray-700">
            <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300">
              Cerrar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};