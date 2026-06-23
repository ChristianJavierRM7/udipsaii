import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { toast } from "react-toastify";
import { fichasService, pacientesService } from "../../services";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { FileDown, FileText, ArrowLeft, Eye, Calendar, User, Users, ClipboardList, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface InformeSocialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
}

export const InformeSocialViewModal: React.FC<
  InformeSocialViewModalProps
> = ({ isOpen, onClose, pacienteId }) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [historial, setHistorial] = useState<any[]>([]);
  const [informeSeleccionado, setInformeSeleccionado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState<number | null>(null);
  const [genogramaPreview, setGenogramaPreview] = useState<string | null>(null);
  const [ecomapaPreview, setEcomapaPreview] = useState<string | null>(null);
  const [pacienteFull, setPacienteFull] = useState<any>(null);

  useEffect(() => {
    if (isOpen && pacienteId) {
      cargarHistorial();
    }
    if (!isOpen) {
      setInformeSeleccionado(null);
    }
  }, [isOpen, pacienteId]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setHistorial([]);
      const res = await fichasService.obtenerHistorialInformeSocial(pacienteId);
      setHistorial(res || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar historial de informes sociales");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarInforme = async (inf: any) => {
    try {
      setLoading(true);
      setGenogramaPreview(null);
      setEcomapaPreview(null);
      setPacienteFull(null);
      setInformeSeleccionado(inf);

      if (inf?.paciente?.id) {
        try {
          const patientDetails = await pacientesService.obtenerPorId(inf.paciente.id);
          setPacienteFull(patientDetails);
        } catch (e) {
          console.error("Error loading patient details:", e);
        }
      }

      if (inf?.genogramaUrl && inf.id) {
        try {
          const gUrl = await fichasService.obtenerGenogramaInformeSocial(inf.id);
          setGenogramaPreview(gUrl);
        } catch (e) {
          console.error("Error loading genograma:", e);
        }
      }

      if (inf?.ecomapaUrl && inf.id) {
        try {
          const eUrl = await fichasService.obtenerEcomapaInformeSocial(inf.id);
          setEcomapaPreview(eUrl);
        } catch (e) {
          console.error("Error loading ecomapa:", e);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar detalles del informe");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (fichaId: number) => {
    try {
      setIsExporting(fichaId);
      toast.info("Generando PDF...");

      const blob = await fichasService.exportarPdfInformeSocialPorId(fichaId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `informe_social_${fichaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar PDF");
    } finally {
      setIsExporting(null);
    }
  };

  const normalizarFormatoFecha = (fechaStr: string) => {
    if (!fechaStr) return "S/F";
    return new Date(fechaStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCloseModal = () => {
    setInformeSeleccionado(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      className="max-w-[1000px] p-0 overflow-hidden"
    >
      {informeSeleccionado ? (
        <div className="bg-gray-50 dark:bg-gray-900 flex flex-col max-h-[90vh]">
          {/* HEADER DEL INFORME DETALLADO */}
          <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
            <button
              onClick={() => setInformeSeleccionado(null)}
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors"
            >
              <ArrowLeft size={18} />
              Volver al historial
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPdf(informeSeleccionado.id)}
                disabled={isExporting === informeSeleccionado.id}
                className="flex items-center gap-2"
              >
                <FileDown size={16} />
                {isExporting === informeSeleccionado.id ? "Generando..." : "Exportar PDF"}
              </Button>
            </div>
          </div>

          {/* DETALLES DEL INFORME SELECCIONADO */}
          <div className="p-6 overflow-y-auto space-y-8">
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="ml-3 text-gray-500">Cargando detalles del informe...</span>
              </div>
            ) : (
              <>
                {/* GENERAL INFO & PATIENT INFO */}
                <section className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <User size={18} className="text-brand-500" /> Datos Generales del Informe y del Paciente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm pt-2">
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Nombres y Apellidos:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.paciente?.nombresApellidos || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Lugar y Fecha de Nacimiento:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {pacienteFull?.lugarNacimiento || "—"} / {pacienteFull?.fechaNacimiento ? new Date(pacienteFull.fechaNacimiento).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Edad:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {pacienteFull?.fechaNacimiento
                          ? `${new Date().getFullYear() - new Date(pacienteFull.fechaNacimiento).getFullYear()} años`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Cédula / Pasaporte:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.paciente?.cedula || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Estado Civil:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.estadoCivil || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Nacionalidad:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.nacionalidad || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Sexo:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.sexo || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Tipo de Discapacidad:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {pacienteFull?.tieneDiscapacidad ? pacienteFull.tipoDiscapacidad : "Ninguna"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Porcentaje de Discapacidad:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {pacienteFull?.tieneDiscapacidad && pacienteFull.porcentajeDiscapacidad !== undefined
                          ? `${pacienteFull.porcentajeDiscapacidad}%`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Institución Educativa:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.institucionEducativa?.nombre || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Nivel Educativo:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.nivelEducativo || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Año que Cursa:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.anioEducacion || "—"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Lugar de Residencia:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{pacienteFull?.domicilio || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">N° de Ficha:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.numFicha || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Fecha de Elaboración:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {informeSeleccionado.fechaElaboracion
                          ? new Date(informeSeleccionado.fechaElaboracion).toLocaleDateString("es-ES")
                          : "—"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* INFORMANT INFO */}
                <section className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <User size={18} className="text-brand-500" /> Datos del Informante y su Relación con el Paciente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm pt-2">
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Persona que Proporciona la Información:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.informante?.nombresApellidos || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Parentesco:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.informante?.relacion || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Cédula / Pasaporte:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.informante?.cedula || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Teléfono:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.informante?.numeroTelefono || "—"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold block text-gray-500 dark:text-gray-400">Correo Electrónico:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{informeSeleccionado.informante?.correoElectronico || "—"}</span>
                    </div>
                  </div>
                </section>

                {/* 1. DATOS DE IDENTIFICACIÓN (FAMILIARES) */}
                <section className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <Users size={18} className="text-brand-500" /> 1. DATOS DE IDENTIFICACIÓN
                  </h4>
                  {informeSeleccionado.familiares && informeSeleccionado.familiares.length > 0 ? (
                    <div className="overflow-x-auto border rounded-xl dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-white/[0.02]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Nombres</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Parentesco</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Estado Civil</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Edad</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Ingresos</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Instrucción</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Ocupación</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Cédula</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Teléfono</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Correo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                          {informeSeleccionado.familiares.map((familiar: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.nombres || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.parentesco || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.estadoCivil || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.edad || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.ingresos !== undefined ? `$${familiar.ingresos}` : "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.instruccion || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.ocupacion || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.cedula || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.telefono || "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{familiar.correo || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No hay familiares registrados</p>
                  )}
                </section>

                {/* 2. CONFORMACIÓN FAMILIAR */}
                <section className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList size={18} className="text-brand-500" /> 2. CONFORMACIÓN FAMILIAR
                  </h4>
                  <div className="space-y-4 text-sm pt-2">
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400 mb-1">Tipo de Familia:</span>
                      <div className="flex flex-wrap gap-2">
                        {["Nuclear", "Extensa", "Monoparental", "Otros"].map((tipo) => (
                          <span
                            key={tipo}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${informeSeleccionado.tipoFamilia === tipo
                              ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                              : "bg-gray-50 border-gray-200 text-gray-400 dark:bg-white/[0.01] dark:border-gray-800 dark:text-gray-600"
                              }`}
                          >
                            {tipo} {tipo === "Otros" && informeSeleccionado.tipoFamiliaEspecificar ? `(${informeSeleccionado.tipoFamiliaEspecificar})` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 dark:text-gray-400 mb-1">Descripción de la Dinámica Familiar:</span>
                      <p className="text-gray-950 dark:text-gray-50 whitespace-pre-wrap leading-relaxed">{informeSeleccionado.descripcionDinamicaFamiliar || "—"}</p>
                    </div>
                  </div>
                </section>

                {/* 3. GENOGRAMA */}
                <section className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={18} className="text-brand-500" /> 3. GENOGRAMA
                  </h4>
                  <div className="space-y-2 pt-2">
                    {genogramaPreview ? (
                      <div className="max-w-xl mx-auto">
                        {informeSeleccionado.genogramaUrl?.toLowerCase().endsWith(".pdf") ? (
                          <div className="flex flex-col items-center gap-2 py-6 border rounded-lg bg-gray-50 dark:bg-white/5">
                            <FileText size={32} className="text-red-500" />
                            <span className="text-xs text-gray-500">Documento PDF</span>
                            <a
                              href={genogramaPreview}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-600 hover:underline mt-1 font-medium"
                            >
                              Abrir / Descargar PDF
                            </a>
                          </div>
                        ) : (
                          <img
                            src={genogramaPreview}
                            alt="Genograma"
                            className="w-full rounded-lg border shadow-sm max-h-[300px] object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No se ha cargado genograma</p>
                    )}
                  </div>
                </section>

                {/* 4. SITUACIÓN ECONÓMICA */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    4. SITUACIÓN ECONÓMICA
                  </h4>
                  <p className="text-gray-950 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionEconomica || "—"}
                  </p>
                </section>

                {/* 5. SITUACIÓN DE HABITABILIDAD */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    5. SITUACIÓN DE HABITABILIDAD O VIVIENDA
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionHabitabilidad || "—"}
                  </p>
                </section>

                {/* 6. SITUACIÓN LABORAL */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    6. SITUACIÓN LABORAL
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionLaboral || "—"}
                  </p>
                </section>

                {/* 7. SITUACIÓN SOCIAL */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    7. SITUACIÓN SOCIAL: RELACIÓN CON EL ENTORNO
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionEntorno || "—"}
                  </p>
                </section>

                {/* 8. SITUACIÓN EDUCATIVO – CULTURAL */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    8. SITUACIÓN EDUCATIVO – CULTURAL
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionEducativoCultural || "—"}
                  </p>
                </section>

                {/* 9. SITUACIÓN DE SALUD */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    9. SITUACIÓN DE SALUD FISICA Y PSICOLOGICA
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionSalud || "—"}
                  </p>
                </section>

                {/* 10. SITUACIÓN LEGAL */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    10. SITUACIÓN LEGAL (en caso de existir)
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.situacionLegal || "—"}
                  </p>
                </section>

                {/* 11. ECOMAPA */}
                <section className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={18} className="text-brand-500" /> 11. ECOMAPA
                  </h4>
                  <div className="space-y-2 pt-2">
                    {ecomapaPreview ? (
                      <div className="max-w-xl mx-auto">
                        {informeSeleccionado.ecomapaUrl?.toLowerCase().endsWith(".pdf") ? (
                          <div className="flex flex-col items-center gap-2 py-6 border rounded-lg bg-gray-50 dark:bg-white/5">
                            <FileText size={32} className="text-red-500" />
                            <span className="text-xs text-gray-500">Documento PDF</span>
                            <a
                              href={ecomapaPreview}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-600 hover:underline mt-1 font-medium"
                            >
                              Abrir / Descargar PDF
                            </a>
                          </div>
                        ) : (
                          <img
                            src={ecomapaPreview}
                            alt="Ecomapa"
                            className="w-full rounded-lg border shadow-sm max-h-[300px] object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No se ha cargado ecomapa</p>
                    )}
                  </div>
                </section>

                {/* 12. VALORACIÓN PROFESIONAL */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    12. VALORACIÓN PROFESIONAL
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.valoracionProfesional || "—"}
                  </p>
                </section>

                {/* 13. RECOMENDACIONES */}
                <section className="space-y-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    13. RECOMENDACIONES
                  </h4>
                  <p className="text-gray-955 dark:text-gray-50 whitespace-pre-wrap leading-relaxed pt-2">
                    {informeSeleccionado.recomendaciones || "—"}
                  </p>
                </section>

                {/* 14. PROFESIONALES RESPONSABLES */}
                <section className="space-y-4">
                  <h4 className="font-bold border-b pb-2 text-lg text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                    14. PROFESIONALES RESPONSABLES
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 mt-4 shadow-sm">
                    {/* Evaluado Por */}
                    <div className="text-center p-5 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900">
                      <div className="h-16 flex items-end justify-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Evaluado Por</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
                          {informeSeleccionado.pasante ? informeSeleccionado.pasante.nombresApellidos : (informeSeleccionado.especialista?.nombresApellidos || informeSeleccionado.elaboradoPor || "Profesional de Trabajo Social")}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                          {informeSeleccionado.pasante ? "Pasante" : "Especialista"}
                        </span>
                      </div>
                    </div>

                    {/* Profesional Responsable (Supervisor tutor for Pasante, or Coordinator for Specialist) */}
                    <div className="text-center p-5 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900">
                      <div className="h-16 flex items-end justify-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {informeSeleccionado.pasante ? "PROFESIONAL RESPONSABLE:" : "COORDINADORA DE LA UDIPSAI"}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
                          {informeSeleccionado.pasante 
                            ? (informeSeleccionado.pasante.especialista?.nombresApellidos || "Especialista a Cargo") 
                            : "Lcda. Gabriela Jara S., Mgs."}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                          {informeSeleccionado.pasante ? "Especialista" : "Coordinadora de la UDIPSAI"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
            <button onClick={handleCloseModal} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
              Cerrar
            </button>
          </div>
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
                <h3 className="text-xl font-bold">Historial de Informes Sociales</h3>
                <p className="text-white/80 text-sm">Listado de informes registrados por paciente</p>
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
                {historial.map((inf, index) => {
                  const creatorName = inf.pasante 
                    ? `${inf.pasante.nombresApellidos} (Pasante)` 
                    : `${inf.especialista?.nombresApellidos || inf.elaboradoPor || "Trabajo Social"} (Especialista)`;

                  return (
                    <div 
                      key={inf.id} 
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              Informe N° {historial.length - index}
                            </span>
                            <Badge 
                              size="sm" 
                              color={inf.activo ? "success" : "error"}
                            >
                              {inf.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {normalizarFormatoFecha(inf.fechaElaboracion)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              Creado por: {creatorName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => seleccionarInforme(inf)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-600 hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm dark:bg-brand-900/20 dark:border-brand-800/50 dark:hover:bg-brand-600 dark:hover:text-white"
                          >
                            <Eye size={16} />
                            Visualizar
                          </button>
                          
                          <button
                            onClick={() => handleExportPdf(inf.id)}
                            disabled={isExporting === inf.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm border
                              ${isExporting === inf.id 
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700" 
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:hover:bg-red-600 dark:hover:text-white"
                              }`}
                          >
                            <FileDown size={16} className={isExporting === inf.id ? "animate-bounce" : ""} />
                            {isExporting === inf.id ? "Generando..." : "Descargar PDF"}
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
                <p>No se encontraron informes sociales registrados para este paciente.</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
            <button onClick={handleCloseModal} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
              Cerrar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default InformeSocialViewModal;