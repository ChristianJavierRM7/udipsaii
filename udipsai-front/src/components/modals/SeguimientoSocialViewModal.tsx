import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { toast } from "react-toastify";
import { FileText, Calendar, CheckCircle, Edit, ArrowLeft, Eye, FileDown } from "lucide-react"; 
import { fichasService } from "../../services";
import FormularioSeguimientoSocial, { SeguimientoSocialState } from "../form/fichas-form/FormularioSeguimientoSocial";
import Button from "../ui/button/Button";

interface SeguimientoSocialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number | null;
  modo: "ver" | "editar"; 
}

export const SeguimientoSocialViewModal: React.FC<SeguimientoSocialViewModalProps> = ({
  isOpen,
  onClose,
  pacienteId,
  modo,
}) => {
  const [seguimientos, setSeguimientos] = useState<SeguimientoSocialState[]>([]);
  const [loading, setLoading] = useState(false);
  const [fichaAEditar, setFichaAEditar] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && pacienteId) {
      cargarFichas();
    }
  
    if (!isOpen) {
      setFichaAEditar(null);
    }
  }, [isOpen, pacienteId, modo]);

  const cargarFichas = async () => {
    try {
      setLoading(true);
      const res = await fichasService.obtenerSeguimientoSocial(pacienteId!);
      setSeguimientos(res);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el historial actualizado");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (fichaId: number) => {
    try {
      setIsExporting(fichaId);
      toast.info("Generando reporte PDF...");
      
      const blob = await fichasService.exportarPdfSeguimientoSocial(fichaId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const nombreArchivo = `seguimiento_social_${fichaId}.pdf`;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Reporte PDF generado correctamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setIsExporting(null);
    }
  };

  const handleCloseModal = () => {
    setFichaAEditar(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[900px] p-0 overflow-hidden">
      
      {fichaAEditar && modo === "editar" ? (
        <div className="bg-gray-50 dark:bg-gray-900 flex flex-col max-h-[85vh]">
          <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center shadow-sm z-10">
            <button 
              onClick={() => setFichaAEditar(null)}
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors"
            >
              <ArrowLeft size={18} />
              Volver al historial
            </button>
          </div>
          
          <div className="overflow-y-auto p-4">
            <FormularioSeguimientoSocial 
              pacienteId={pacienteId!} 
              fichaId={fichaAEditar} 
              onSuccess={() => {
                setFichaAEditar(null); 
                cargarFichas(); 
                toast.info("Historial actualizado");
              }} 
            />
          </div>
        </div>
      ) : (
        <>
          <div className={modo === "editar" ? "bg-blue-600 p-6 text-white" : "bg-brand-600 p-6 text-white"}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {modo === "editar" ? <Edit size={24} /> : <Eye size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {modo === "editar" ? "Seleccionar para Editar" : "Historial de Seguimiento"}
                </h3>
                <p className="text-white/80 text-sm">Registros del sistema UDIPSAI</p>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Sincronizando datos...</p>
              </div>
            ) : seguimientos.length > 0 ? (
              <div className="space-y-6">
                {seguimientos.map((seg, index) => (
                  <div key={seg.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-2 font-bold text-brand-600">
                        <CheckCircle size={18} />
                        <span>Seguimiento N° {index + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {seg.fecha ? new Date(seg.fecha).toLocaleDateString() : 'S/F'}
                        </span>
                        
                        {modo === "ver" && (
                          <button
                            onClick={() => handleExportPdf(seg.id!)}
                            disabled={isExporting === seg.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm border
                              ${isExporting === seg.id 
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700" 
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:hover:bg-red-600 dark:hover:text-white"
                              }`}
                          >
                            <FileDown size={16} className={isExporting === seg.id ? "animate-bounce" : ""} />
                            {isExporting === seg.id ? "Generando..." : "Descargar PDF"}
                          </button>
                        )}
                        
                        {modo === "editar" && (
                          <button
                            onClick={() => setFichaAEditar(seg.id!)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:bg-blue-600 dark:hover:text-white"
                          >
                            <Edit size={16} />
                            Modificar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-brand-50/50 dark:bg-brand-900/10 p-3 rounded-lg border border-brand-100 dark:border-brand-800/30 transition-colors hover:bg-brand-50">
                          <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                            Área de Acompañamiento
                          </p>
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{seg.areaAcompanamiento || "No especificada"}</p>
                        </div>
                        
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30 transition-colors hover:bg-amber-50">
                          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Objetivo del Seguimiento
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">"{seg.objetivo || "Sin objetivo definido"}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay seguimientos registrados.</p>
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