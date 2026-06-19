import React, { useEffect, useState } from "react";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { fichasService } from "../../../services/fichas";
import api from "../../../api/api"; 
import { toast } from "react-toastify";
import { 
  CheckCircle, 
  EyeOff, 
  List, 
  Calendar, 
  AlertTriangle, 
  ArrowLeft, 
  Search 
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function EliminarSeguimientoSocial() {
  const params = useParams();
  const navigate = useNavigate();
  
  const initialFichaId = params.id || params.fichaId;

  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [listaSeguimientos, setListaSeguimientos] = useState<any[]>([]);
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
        
        // 3. Filtramos para mostrar solo los que aún están activos
        const activos = seguimientos.filter((s: any) => s.activo !== false);
        setListaSeguimientos(activos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("No se pudo recuperar el historial del paciente.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, [initialFichaId]);
  const handleDesactivar = async (idFicha: number, numeroSeg: number) => {
    const confirmar = window.confirm(
      `¿Confirmar desactivación del Seguimiento N° ${numeroSeg}? \n\nEl registro se ocultará del sistema pero permanecerá en la base de datos.`
    );

    if (!confirmar) return;

    try {

      const res = await api.get(`/seguimientos-sociales/${idFicha}`);
      const fichaData = res.data;

      const fichaInactiva = {
        ...fichaData,
        activo: false
      };

      await fichasService.actualizarSeguimientoSocial(idFicha, fichaInactiva);
      
      toast.success(`Seguimiento N° ${numeroSeg} desactivado con éxito`);

      setListaSeguimientos((prev) => prev.filter(item => item.id !== idFicha));

    } catch (error) {
      console.error("Error al desactivar:", error);
      toast.error("Hubo un error al procesar la solicitud.");
    }
  };

  return (
    <>
      <PageMeta 
        title="Desactivar Seguimiento Social | Udipsai" 
        description="Listado para desactivación de fichas" 
      />
      
      <PageBreadcrumb
        pageTitle="Desactivar Ficha de Seguimiento Social"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Gestión de Bajas" }
        ]}
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Cargando registros activos...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm overflow-hidden">
            {/* Cabecera de la sección */}
            <div className="p-6 border-b border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Panel de Desactivación</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                      Seleccione el seguimiento que desea ocultar del historial principal.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold transition-all shadow-sm"
                >
                  <ArrowLeft size={16} />
                  Regresar
                </button>
              </div>
            </div>
            
            {/* Grid de Tarjetas */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaSeguimientos.map((seg, index) => (
                <div 
                  key={seg.id}
                  className="group p-5 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-orange-400 hover:shadow-xl transition-all bg-white dark:bg-gray-800 flex flex-col justify-between border-b-4 border-b-transparent hover:border-b-orange-500"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-gray-800 dark:text-white font-black">
                        <CheckCircle size={18} className="text-orange-500" />
                        <span className="tracking-tight">SEGUIMIENTO N° {index + 1}</span>
                      </div>
                      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {seg.fecha ? new Date(seg.fecha).toLocaleDateString() : 'S/F'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Objetivo registrado:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 italic leading-relaxed">
                        {seg.objetivo ? `"${seg.objetivo}"` : "Sin descripción de objetivo."}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDesactivar(seg.id, index + 1)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500 rounded-xl text-sm font-bold transition-all border border-orange-100 dark:border-orange-900/30"
                  >
                    <EyeOff size={16} />
                    Desactivar este registro
                  </button>
                </div>
              ))}

              {/* Estado vacío */}
              {listaSeguimientos.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-gray-300" />
                  </div>
                  <h4 className="text-gray-800 dark:text-white font-bold">No hay seguimientos activos</h4>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
                    Todos los registros de este paciente han sido desactivados o no existen seguimientos aún.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}