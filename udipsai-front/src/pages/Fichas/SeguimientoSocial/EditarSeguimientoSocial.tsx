import React, { useEffect, useState } from "react";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import FormularioSeguimientoSocial from "../../../components/form/fichas-form/FormularioSeguimientoSocial";
import { fichasService } from "../../../services/fichas";
import api from "../../../api/api";
import { CheckCircle, Edit, ArrowLeft, List } from "lucide-react";
import { useParams } from "react-router";

export default function EditarSeguimientoSocial() {
  const params = useParams();
  const initialFichaId = params.id || params.fichaId;

  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [listaSeguimientos, setListaSeguimientos] = useState<any[]>([]);
  const [fichaIdSeleccionada, setFichaIdSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!initialFichaId) return;
      try {
        setLoading(true);
  
        const response = await api.get(`/seguimientos-sociales/${initialFichaId}`);
        const pId = response.data.pacienteId;
        setPacienteId(pId);
        const seguimientos = await fichasService.obtenerSeguimientoSocial(pId);
        setListaSeguimientos(seguimientos);
      } catch (error) {
        console.error("Error al cargar lista:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, [initialFichaId]);

  return (
    <>
      <PageMeta title="Editar Seguimiento Social | Udipsai" description="Seleccionar y editar ficha" />
      <PageBreadcrumb
        pageTitle="Gestión de Seguimiento Social"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas?tab=seguimiento_social" },
          { label: "Editar Seguimiento" }
        ]}
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Recuperando historial del paciente...</p>
          </div>
        ) : fichaIdSeleccionada ? (
          /* VISTA 1: FORMULARIO DE EDICIÓN */
          <div className="space-y-4">
            <button 
              onClick={() => setFichaIdSeleccionada(null)}
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
            >
              <ArrowLeft size={18} />
              Volver a la lista de seguimientos
            </button>
            <FormularioSeguimientoSocial 
              pacienteId={pacienteId!} 
              fichaId={fichaIdSeleccionada} 
              onSuccess={async () => {
                setFichaIdSeleccionada(null);
                try {
                  const seguimientos = await fichasService.obtenerSeguimientoSocial(pacienteId!);
                  setListaSeguimientos(seguimientos);
                } catch (error) {
                  console.error("Error al actualizar lista:", error);
                }
              }}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <List className="text-brand-600" size={24} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Seleccione el seguimiento que desea modificar</h3>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listaSeguimientos.map((seg, index) => (
                <div 
                  key={seg.id}
                  className="group p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-brand-300 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => setFichaIdSeleccionada(seg.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-brand-600 font-bold">
                      <CheckCircle size={18} />
                      <span>Seguimiento N° {index + 1}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {seg.fecha ? new Date(seg.fecha).toLocaleDateString() : 'Sin fecha'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 italic">
                    "{seg.objetivo || 'Sin objetivo registrado'}"
                  </p>
                  <button className="w-full flex items-center justify-center gap-2 py-2 bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white rounded-lg text-sm font-bold transition-colors">
                    <Edit size={14} />
                    Editar este registro
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}