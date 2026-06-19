import React, { useEffect, useState } from "react";
import InputField from "../input/InputField";
import TextArea from "../input/TextArea";
import Label from "../Label"; 
import Button from "../../ui/button/Button";
import { toast } from "react-toastify";
import api from "../../../api/api";
import { fichasService } from "../../../services/fichas";
import { MapPin, User, CheckCircle2 } from "lucide-react";

export interface SeguimientoSocialState {
  id?: number;
  activo: boolean;
  pacienteId: number;
  areaAcompanamiento: string;
  numeroSeguimiento: number;
  fecha: string; 
  nombreVisitador: string;
  apellidoVisitador: string;
  direccionVisita: string;
  objetivo: string;
  participantes: string;
  actividades: string;
  observaciones: string;
  lugarFirma: string; 
  nombreRepresentante: string;
  rolEscuela: string;
  nombrePersonalEscuela: string;
  especificarOtro: string;
}

interface FormularioSeguimientoSocialProps {
  pacienteId: number;
  fichaId?: number; 
  onSuccess?: () => void;
}

const FormularioSeguimientoSocial: React.FC<FormularioSeguimientoSocialProps> = ({
  pacienteId,
  fichaId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState<SeguimientoSocialState>({
    activo: true, 
    pacienteId: pacienteId,
    areaAcompanamiento: "",
    numeroSeguimiento: 1,
    fecha: new Date().toISOString().split("T")[0], 
    nombreVisitador: "",
    apellidoVisitador: "",
    direccionVisita: "",
    objetivo: "",
    participantes: "",
    actividades: "",
    observaciones: "",
    lugarFirma: "", 
    nombreRepresentante: "",
    rolEscuela: "",
    nombrePersonalEscuela: "",
    especificarOtro: "",
  });

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        setFetching(true);

        if (fichaId) {
          const response = await api.get(`/seguimientos-sociales/${fichaId}`);
          const data = response.data;
          
          setFormData({
            id: data.id,
            activo: data.activo !== undefined ? data.activo : true,
            pacienteId: data.pacienteId || pacienteId,
            numeroSeguimiento: data.numeroSeguimiento || 1,
            fecha: data.fecha ? data.fecha.split("T")[0] : "",
            areaAcompanamiento: data.areaAcompanamiento || "",
            nombreVisitador: data.nombreVisitador || "",
            apellidoVisitador: data.apellidoVisitador || "",
            direccionVisita: data.direccionVisita || "",
            objetivo: data.objetivo || "",
            participantes: data.participantes || "",
            actividades: data.actividades || "",
            observaciones: data.observaciones || "",
            lugarFirma: data.lugarFirma || "", 
            nombreRepresentante: data.nombreRepresentante || "",
            rolEscuela: data.rolEscuela || "",
            nombrePersonalEscuela: data.nombrePersonalEscuela || "",
            especificarOtro: data.especificarOtro || "",
          });
        } else {
          const fichasDelPaciente = await fichasService.obtenerSeguimientoSocial(pacienteId);
          if (fichasDelPaciente && fichasDelPaciente.length > 0) {
            const maxSeguimiento = Math.max(...fichasDelPaciente.map((f: any) => f.numeroSeguimiento || 0));
            setFormData((prev) => ({ ...prev, numeroSeguimiento: maxSeguimiento + 1 }));
          }
        }
      } catch (error) {
        console.error("Error inicializando el formulario:", error);
        toast.error("Hubo un problema al cargar la información.");
      } finally {
        setFetching(false);
      }
    };

    inicializarDatos();
  }, [fichaId, pacienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "numeroSeguimiento" ? (value === "" ? 0 : parseInt(value)) : value 
    }));
  };

  // --- LÓGICA DE VALIDACIÓN ---
  const validarFormulario = (): string | null => {
    if (!formData.areaAcompanamiento.trim()) return "El Área de Acompañamiento es obligatoria.";
    if (!formData.fecha) return "La fecha de visita es obligatoria.";
    if (!formData.nombreVisitador.trim()) return "El nombre del visitador es obligatorio.";
    if (!formData.apellidoVisitador.trim()) return "El apellido del visitador es obligatorio.";
    if (!formData.direccionVisita.trim()) return "La dirección de la visita es obligatoria.";
    if (!formData.objetivo.trim()) return "Debe especificar el objetivo de la intervención.";
    if (!formData.participantes.trim()) return "Debe ingresar las personas participantes.";
    if (!formData.actividades.trim()) return "Debe detallar las actividades realizadas.";
    
    if (!formData.lugarFirma) return "Debe seleccionar el lugar para imprimir la firma.";

    // Validaciones condicionales según el lugar de la firma
    if (formData.lugarFirma === "CASA" && !formData.nombreRepresentante.trim()) {
      return "Para firma en CASA, ingrese el nombre del representante o familiar.";
    }
    if (formData.lugarFirma === "ESCUELA") {
      if (!formData.rolEscuela) return "Seleccione el rol del personal de la escuela.";
      if (!formData.nombrePersonalEscuela.trim()) return "Ingrese el nombre del personal de la escuela.";
    }
    if (formData.lugarFirma === "OTRO" && !formData.especificarOtro.trim()) {
      return "Especifique el lugar y la persona encargada de firmar.";
    }

    return null; // Si todo está correcto, retorna null
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ejecutamos la validación
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      toast.warn(errorValidacion); // Muestra el mensaje de error exacto al usuario
      return; // Detiene el envío
    }

    setLoading(true);
    try {
      if (fichaId) {
        await fichasService.actualizarSeguimientoSocial(fichaId, formData);
        toast.success("Ficha actualizada correctamente");
      } else {
        await fichasService.crearSeguimientoSocial(formData);
        toast.success("Ficha guardada correctamente");
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar la ficha");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p className="text-brand-600 font-bold">Cargando datos de la ficha...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {fichaId ? "Editar" : "Nueva"} Ficha de Seguimiento Social
        </h2>
      </div>

      {/* SECCIÓN 1: Datos Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <Label>Área de Acompañamiento <span className="text-red-500">*</span></Label>
          <InputField name="areaAcompanamiento" value={formData.areaAcompanamiento} onChange={handleChange} placeholder="Ej. Trabajo Social" required />
        </div>
        <div className="space-y-1">
          <Label>Fecha de Visita <span className="text-red-500">*</span></Label>
          <InputField type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
        </div>
        <div className="max-w-[140px] space-y-1">
          <Label>N° Seguimiento</Label>
          <InputField type="number" name="numeroSeguimiento" value={formData.numeroSeguimiento.toString()} readOnly hint="Auto" />
        </div>
      </div>

      {/* SECCIÓN 2: Visitador */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
          <User size={14} /> Información del Visitador
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label>Nombres del Visitador <span className="text-red-500">*</span></Label>
            <InputField name="nombreVisitador" value={formData.nombreVisitador} onChange={handleChange} placeholder="Ej. Nombres" required />
          </div>
          <div className="space-y-1">
            <Label>Apellidos del Visitador <span className="text-red-500">*</span></Label>
            <InputField name="apellidoVisitador" value={formData.apellidoVisitador} onChange={handleChange} placeholder="Ej. Apellidos" required />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Ubicación */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
          <MapPin size={14} /> Ubicación de la Visita
        </div>
        <div className="space-y-1">
          <Label>Dirección Completa / Institución <span className="text-red-500">*</span></Label>
          <InputField name="direccionVisita" value={formData.direccionVisita} onChange={handleChange} placeholder="Calle, Sector o Nombre de la Institución" required />
        </div>
      </div>

      {/* SECCIÓN 4: Contenido Técnico */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Objetivo de la Intervención <span className="text-red-500">*</span></Label>
          <TextArea name="objetivo" value={formData.objetivo} onChange={handleChange} placeholder="Propósito..." rows={2} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Personas Participantes <span className="text-red-500">*</span></Label>
            <TextArea name="participantes" value={formData.participantes} onChange={handleChange} placeholder="Nombres..." rows={3} required />
          </div>
          <div className="space-y-2">
            <Label>Actividades Realizadas <span className="text-red-500">*</span></Label>
            <TextArea name="actividades" value={formData.actividades} onChange={handleChange} placeholder="Detalles..." rows={3} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observaciones Generales</Label>
          <TextArea name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Notas adicionales (opcional)..." rows={3} />
        </div>
      </div>

      {/* SECCIÓN 5: Firmas */}
      <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
          <CheckCircle2 size={14} /> Responsable para imprimir firma <span className="text-red-500">*</span>
        </div>

        <div className="flex flex-wrap gap-8 p-5 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/[0.05]">
          {["CASA", "ESCUELA", "OTRO"].map((opcion) => (
            <label key={opcion} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="lugarFirma" value={opcion} checked={formData.lugarFirma === opcion} onChange={handleChange} className="w-4.5 h-4.5 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-brand-600 capitalize">{opcion.toLowerCase()}</span>
            </label>
          ))}
        </div>

        <div className="transition-all duration-300 min-h-[80px]">
          {formData.lugarFirma === "CASA" && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <Label>Nombre del Representante / Familiar <span className="text-red-500">*</span></Label>
              <InputField name="nombreRepresentante" value={formData.nombreRepresentante} onChange={handleChange} placeholder="Nombre completo para colocar debajo de la firma" required />
            </div>
          )}

          {formData.lugarFirma === "ESCUELA" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col space-y-1">
                <Label>Rol del Personal <span className="text-red-500">*</span></Label>
                <select 
                  name="rolEscuela" 
                  value={formData.rolEscuela} 
                  onChange={handleChange} 
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white dark:bg-gray-900" 
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="DIRECTOR">Director/a</option>
                  <option value="PSICOLOGO">Psicólogo/a</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Nombre del Personal Identificado <span className="text-red-500">*</span></Label>
                <InputField name="nombrePersonalEscuela" value={formData.nombrePersonalEscuela} onChange={handleChange} placeholder="Nombre completo para el PDF" required />
              </div>
            </div>
          )}

          {formData.lugarFirma === "OTRO" && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <Label>Especificar Lugar y Persona <span className="text-red-500">*</span></Label>
              <InputField name="especificarOtro" value={formData.especificarOtro} onChange={handleChange} placeholder="Quién firma..." required />
            </div>
          )}
        </div>
      </div>

      {/* BOTONES */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Ficha"}
        </Button>
      </div>
    </form>
  );
};

export default FormularioSeguimientoSocial;