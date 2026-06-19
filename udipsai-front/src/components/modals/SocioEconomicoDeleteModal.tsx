import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { toast } from "react-toastify";
import { fichasService } from "../../services/fichas";
import Button from "../ui/button/Button";
import { Trash2, Calendar, User, FileText } from "lucide-react";
import { DeleteModal } from "../ui/modal/DeleteModal";

interface SocioEconomicoDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  pacienteNombre: string;
  onDeleted: () => void;
}

export const SocioEconomicoDeleteModal: React.FC<SocioEconomicoDeleteModalProps> = ({
  isOpen,
  onClose,
  pacienteId,
  pacienteNombre,
  onDeleted,
}) => {
  const [listaFichas, setListaFichas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null);
  const [numParaEliminar, setNumParaEliminar] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && pacienteId) {
      cargarFichas();
    }
  }, [isOpen, pacienteId]);

  const cargarFichas = async () => {
    try {
      setLoading(true);
      const res = await fichasService.obtenerHistorialSocioEconomico(pacienteId);
      // Solo mostrar las activas (que no estén eliminadas lógicamente)
      const activas = (res || []).filter((ficha: any) => ficha.activo === true);
      setListaFichas(activas);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar las fichas socioeconómicas del paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarClick = (id: number, numeroFicha: number) => {
    setIdParaEliminar(id);
    setNumParaEliminar(numeroFicha);
    setShowConfirmModal(true);
  };

  const ejecutarEliminar = async () => {
    if (idParaEliminar === null || numParaEliminar === null) return;
    try {
      setDeletingId(idParaEliminar);
      setShowConfirmModal(false);
      await fichasService.eliminarSocioEconomico(idParaEliminar);
      toast.success(`Ficha N° ${numParaEliminar} eliminada correctamente`);
      
      // Actualizar listado local
      const updatedList = listaFichas.filter((ficha) => ficha.id !== idParaEliminar);
      setListaFichas(updatedList);
      
      // Notificar al componente padre para recargar la tabla principal
      onDeleted();

      // Si no quedan más fichas, cerrar el modal
      if (updatedList.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la ficha");
    } finally {
      setDeletingId(null);
      setIdParaEliminar(null);
      setNumParaEliminar(null);
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] p-0 overflow-hidden"
    >
      <div className="bg-red-600 dark:bg-red-950 p-6 text-white flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-xl">
          <Trash2 size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">Eliminar Ficha Socioeconómica</h3>
          <p className="text-white/80 text-sm mt-0.5">
            Paciente: <span className="font-semibold">{pacienteNombre}</span>
          </p>
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Cargando fichas...</p>
          </div>
        ) : listaFichas.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {listaFichas.map((ficha, index) => {
                const creatorName = ficha.pasante
                  ? `${ficha.pasante.nombresApellidos} (Pasante)`
                  : `${ficha.especialista?.nombresApellidos || ficha.responsable || "Especialista"} (Especialista)`;

                return (
                  <div
                    key={ficha.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-bold text-gray-800 dark:text-white">
                          Ficha N° {listaFichas.length - index}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {normalizarFormatoFecha(ficha.fechaElaboracion)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          Creado por: {creatorName}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deletingId === ficha.id}
                      onClick={() => handleEliminarClick(ficha.id, listaFichas.length - index)}
                      className="flex items-center gap-2 font-bold shrink-0 justify-center"
                    >
                      <Trash2 size={14} />
                      {deletingId === ficha.id ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>No se encontraron fichas activas para este paciente.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <Button variant="outline" onClick={onClose} className="px-6">
          Cerrar
        </Button>
      </div>

      <DeleteModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={ejecutarEliminar}
        title="Confirmar Eliminación"
        description={`¿Está seguro que desea eliminar la ficha de Socioeconómico? Esta acción no se puede deshacer.`}
      />
    </Modal>
  );
};
