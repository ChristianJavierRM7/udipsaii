import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import FormularioInformeSocial from "../../../components/form/fichas-form/FormularioInformeSocial";
import { fichasService } from "../../../services/fichas";
import { useParams, useNavigate } from "react-router";
import { List, ArrowLeft, Calendar, User, FileText, Pencil } from "lucide-react";
import Badge from "../../../components/ui/badge/Badge";

export default function EditarInformeSocial() {
  const params = useParams();
  const initialFichaId = params.id;
  const navigate = useNavigate();

  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [listaInformes, setListaInformes] = useState<any[]>([]);
  const [fichaIdSeleccionada, setFichaIdSeleccionada] = useState<number | null>(
    initialFichaId ? Number(initialFichaId) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!initialFichaId) return;
      try {
        setLoading(true);
        // Cargar el informe específico para obtener el ID del paciente
        const response = await fichasService.obtenerInformeSocialPorId(initialFichaId);
        const pId = response.paciente?.id || response.pacienteId;
        setPacienteId(pId);
        
        // Cargar todos los informes del paciente para el historial
        const historial = await fichasService.obtenerHistorialInformeSocial(pId);
        setListaInformes(historial || []);
      } catch (error) {
        console.error("Error al cargar datos del informe:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, [initialFichaId]);

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

  const pacienteNombre = listaInformes[0]?.paciente?.nombresApellidos || "Cargando...";

  return (
    <>
      <PageMeta
        title="Editar Informe Social | Udipsai"
        description="Seleccionar y editar un informe social existente"
      />
      <PageBreadcrumb
        pageTitle="Gestión de Informes Sociales"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas?tab=informe_social" },
          { label: "Editar Informe Social" },
        ]}
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Recuperando historial del paciente...</p>
          </div>
        ) : fichaIdSeleccionada ? (
          /* VISTA: FORMULARIO DE EDICIÓN */
          <div className="space-y-4">
            <button
              onClick={() => setFichaIdSeleccionada(null)}
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-bold transition-all bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
            >
              <ArrowLeft size={18} />
              Volver a la lista de informes
            </button>
            <FormularioInformeSocial
              fichaId={fichaIdSeleccionada}
              onSuccess={async () => {
                setFichaIdSeleccionada(null);
                try {
                  if (pacienteId) {
                    const historial = await fichasService.obtenerHistorialInformeSocial(pacienteId);
                    setListaInformes(historial || []);
                  }
                } catch (error) {
                  console.error("Error al actualizar lista:", error);
                }
              }}
            />
          </div>
        ) : (
          /* VISTA: HISTORIAL DE SELECCIÓN PARA EDICIÓN */
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <List className="text-red-600 dark:text-red-400" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Seleccione el informe que desea modificar
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Paciente: <span className="font-semibold text-gray-700 dark:text-gray-200">{pacienteNombre}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaInformes.map((inf, index) => {
                const isActivo = inf.activo;
                const creatorName = inf.pasante 
                  ? `${inf.pasante.nombresApellidos} (Pasante)` 
                  : `${inf.especialista?.nombresApellidos || inf.elaboradoPor || "Trabajo Social"} (Especialista)`;
                
                return (
                  <div
                    key={inf.id}
                    onClick={() => setFichaIdSeleccionada(inf.id)}
                    className="group relative p-6 border border-red-100 dark:border-red-900/30 bg-red-50/5 dark:bg-red-950/5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-red-300 dark:hover:border-red-500"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-red-500" size={20} />
                          <span className="font-bold text-gray-800 dark:text-white">
                            Informe N° {listaInformes.length - index}
                          </span>
                        </div>
                        <Badge
                          size="sm"
                          color={isActivo ? "success" : "error"}
                        >
                          {isActivo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      <div className="space-y-2.5 mb-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{normalizarFormatoFecha(inf.fechaElaboracion)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="truncate">Creado por: {creatorName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white dark:bg-red-950/20 dark:text-red-400 dark:group-hover:bg-red-600 dark:group-hover:text-white border border-red-100 dark:border-red-900/30"
                    >
                      <Pencil size={14} />
                      Editar este informe
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
