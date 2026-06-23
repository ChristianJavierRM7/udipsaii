import { useState, useEffect, useCallback } from "react";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { MessageSquare, User, Upload, X } from "lucide-react";
import { pacientesService, especialistasService, pasantesService } from "../../../services";
import PatientSelector from "../../common/PatientSelector";
import { useAuth } from "../../../context/AuthContext.tsx";
import { validarCedulaEcuatoriana, validarEmail, validarSoloNumeros } from "../../../services/validators";


// Secciones
import DinamicaFamiliarForm from "./sections/InformeSocial/DinamicaFamiliarForm";
import SituacionEconomicaInformeForm from "./sections/InformeSocial/SituacionEconomicaForm";
import SituacionHabitabilidadForm from "./sections/InformeSocial/SituacionHabitabilidadForm";
import SituacionLaboralForm from "./sections/InformeSocial/SituacionLaboralForm";
import SituacionEntornoForm from "./sections/InformeSocial/SituacionEntornoForm";
import SituacionEducativoCulturalForm from "./sections/InformeSocial/SituacionEducativoCulturalForm";
import SituacionSaludForm from "./sections/InformeSocial/SituacionSaludForm";
import SituacionLegalForm from "./sections/InformeSocial/SituacionLegalForm";
import ValoracionProfesionalForm from "./sections/InformeSocial/ValoracionProfesionalForm";
import RecomendacionesForm from "./sections/InformeSocial/RecomendacionesForm";
import ConformacionFamiliar from "./sections/SocioEconomica/ConformacionFamiliarForm";

import { fichasService } from "../../../services/fichas";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export interface FamiliarItem {
  id?: number | null;
  relacion: string;
  nombresApellidos: string;
  edad: number;
  estadoCivil: string;
  instruccion: string;
  ocupacion: string;
  ingresoMensual: number;
  cedula?: string;
  numeroTelefono?: string;
  correoElectronico?: string;
}

export interface InformeSocialState {
  id?: number;
  paciente: {
    id: number;
    nombresApellidos: string;
    cedula: string;
    fechaNacimiento?: string;
    edad?: number;
  };

  especialista: {
    id: number;
    nombresApellidos: string;
  };
  pasante?: {
    id: number;
    nombresApellidos: string;
    especialista?: {
      id: number;
      nombresApellidos: string;
    };
  } | null;

  numFicha: string;
  fechaElaboracion: string;
  descripcionDinamicaFamiliar: string;
  situacionEconomica: string;
  situacionHabitabilidad: string;
  situacionLaboral: string;
  situacionEntorno: string;
  situacionEducativoCultural: string;
  situacionSalud: string;
  situacionLegal: string;
  valoracionProfesional: string;
  recomendaciones: string;
  elaboradoPor: string;

  pacienteEstadoCivil?: string;
  pacienteNacionalidad?: string;
  pacienteSexo?: string;

  informanteId?: number | null;
  informanteNombre?: string;
  informanteParentesco?: string;
  informanteCedula?: string;
  informanteTelefono?: string;
  informanteCorreo?: string;

  familiares: FamiliarItem[];

  genogramFile?: File | null;
  ecomapFile?: File | null;
  genogramaUrl?: string;
  ecomapaUrl?: string;

  tipoFamilia?: string;
  tipoFamiliaEspecificar?: string;
}

const getFechaActual = (): string => {
  const today = new Date();
  return today.toISOString();
};
const buildRequest = (data: InformeSocialState) => {
  return {
    pacienteId: data.paciente?.id || null,
    especialistaId: data.especialista?.id || null,
    numFicha: data.numFicha,
    fechaElaboracion: data.fechaElaboracion,

    descripcionDinamicaFamiliar: data.descripcionDinamicaFamiliar,
    situacionEconomica: data.situacionEconomica,
    situacionHabitabilidad: data.situacionHabitabilidad,
    situacionLaboral: data.situacionLaboral,
    situacionEntorno: data.situacionEntorno,
    situacionEducativoCultural: data.situacionEducativoCultural,
    situacionSalud: data.situacionSalud,
    situacionLegal: data.situacionLegal,
    valoracionProfesional: data.valoracionProfesional,
    recomendaciones: data.recomendaciones,
    elaboradoPor: data.pasante ? data.pasante.nombresApellidos : (data.especialista?.nombresApellidos || data.elaboradoPor || ""),

    pacienteEstadoCivil: data.pacienteEstadoCivil || "",
    pacienteNacionalidad: data.pacienteNacionalidad || "",
    pacienteSexo: data.pacienteSexo || "",

    informante: data.informanteNombre ? {
      id: data.informanteId || null,
      pacienteId: data.paciente?.id || null,
      relacion: data.informanteParentesco || "",
      nombresApellidos: data.informanteNombre || "",
      cedula: data.informanteCedula || "",
      numeroTelefono: data.informanteTelefono || "",
      correoElectronico: data.informanteCorreo || "",
      problemasSalud: false,
      enfermedadCatastrofica: false,
      discapacidad: false,
      activo: true
    } : null,

    tipoFamilia: data.tipoFamilia || "",
    tipoFamiliaEspecificar: data.tipoFamiliaEspecificar || "",

    familiares: (data.familiares ?? []).map((f) => ({
      id: f.id || null,
      nombres: f.nombresApellidos,
      parentesco: f.relacion,
      edad: f.edad,
      estadoCivil: f.estadoCivil,
      instruccion: f.instruccion,
      ocupacion: f.ocupacion,
      ingresos: f.ingresoMensual,
      cedula: f.cedula || "",
      telefono: f.numeroTelefono || "",
      correo: f.correoElectronico || "",
    })),
  };
};
export const initialInformeSocialState: InformeSocialState = {
  paciente: {
    id: 0,
    nombresApellidos: "",
    cedula: "",
  },
  especialista: {
    id: 0,
    nombresApellidos: "",
  },
  pasante: null,
  numFicha: "",
  fechaElaboracion: getFechaActual(),
  descripcionDinamicaFamiliar: "",
  situacionEconomica: "",
  situacionHabitabilidad: "",
  situacionLaboral: "",
  situacionEntorno: "",
  situacionEducativoCultural: "",
  situacionSalud: "",
  situacionLegal: "",
  valoracionProfesional: "",
  recomendaciones: "",
  elaboradoPor: "",
  pacienteEstadoCivil: "",
  pacienteNacionalidad: "",
  pacienteSexo: "",
  informanteNombre: "",
  informanteParentesco: "",
  informanteCedula: "",
  informanteTelefono: "",
  informanteCorreo: "",
  familiares: [],
  tipoFamilia: "",
  tipoFamiliaEspecificar: "",
};

interface FormularioInformeSocialProps {
  fichaId?: number | string;
  onSuccess?: () => void;
}

export default function FormularioInformeSocial({ fichaId, onSuccess }: FormularioInformeSocialProps = {}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const id = fichaId?.toString() || paramId;

  const { userIdentity, userRole } = useAuth();

  const [formData, setFormData] = useState<InformeSocialState>(
    initialInformeSocialState
  );

  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [genogramaPreview, setGenogramaPreview] = useState<string | null>(null);
  const [ecomapaPreview, setEcomapaPreview] = useState<string | null>(null);

  const [secciones, setSecciones] = useState({
    informacionPaciente: false,
    informante: false,
    dinamicaFamiliar: false,
    situacionEconomica: false,
    situacionHabitabilidad: false,
    situacionLaboral: false,
    situacionEntorno: false,
    situacionEducativoCultural: false,
    situacionSalud: false,
    situacionLegal: false,
    valoracionProfesional: false,
    recomendaciones: false,
    familiares: false,
    genograma: false,
    ecomapa: false,
  });

  const [validaciones, setValidaciones] = useState<Record<string, boolean>>({
    dinamicaFamiliar: false,
    situacionEconomica: false,
    situacionHabitabilidad: false,
    situacionLaboral: false,
    situacionEntorno: false,
    situacionEducativoCultural: false,
    situacionSalud: false,
    situacionLegal: false,
    valoracionProfesional: false,
    recomendaciones: false,
  });

  const handleValidateFamiliares = useCallback(
    (isValid: boolean, _errors: string[]) => {
      setValidaciones((prev) => ({
        ...prev,
        familiares: isValid,
      }));
    },
    []
  );

  const isEdit = !!id;

  // Cargar especialista
  useEffect(() => {
    const loadEspecialista = async () => {
      if (!userIdentity || !userRole) {
        return;
      }

      try {
        let especialistaData = null;

        if (userRole === "ROLE_ESPECIALISTA") {
          const result = await especialistasService.filtrar({ search: userIdentity });
          especialistaData = result?.content?.[0];
        } else if (userRole === "ROLE_PASANTE") {
          const result = await pasantesService.filtrar({ search: userIdentity });
          especialistaData = result?.content?.[0];
        }

        if (especialistaData?.id) {
          setFormData((prev) => ({
            ...prev,
            especialista: {
              id: especialistaData.id,
              nombresApellidos: especialistaData.nombresApellidos,
            },
            elaboradoPor: especialistaData.nombresApellidos,
          }));
        }
      } catch (error) {
        console.error("Error al cargar especialista:", error);
        toast.error("Error al cargar la información del especialista.");
      }
    };

    loadEspecialista();
  }, [userIdentity, userRole]);

  // Cargar informe si es edición o inicializar número de ficha
  useEffect(() => {
    if (isEdit && id) {
      loadInforme(id);
    } else {
      setShowSelector(true);
      const loadNextNumero = async () => {
        try {
          const nextNum = await fichasService.obtenerSiguienteNumeroInforme();
          if (nextNum) {
            setFormData((prev) => ({
              ...prev,
              numFicha: nextNum,
            }));
          }
        } catch (error) {
          console.error("Error al obtener el siguiente número de informe:", error);
        }
      };
      loadNextNumero();
    }
  }, [id, isEdit]);

  const loadInforme = async (informeId: string) => {
    try {
      setLoading(true);
      const data = await fichasService.obtenerInformeSocialPorId(informeId);

      if (data) {
        let genogramaObjUrl = undefined;
        let ecomapaObjUrl = undefined;

        if (data.genogramaUrl && data.paciente?.id) {
          try {
            genogramaObjUrl = await fichasService.obtenerGenogramaInformeSocial(data.paciente.id);
          } catch (e) {
            console.error("Error loading genograma blob preview:", e);
          }
        }

        if (data.ecomapaUrl && data.paciente?.id) {
          try {
            ecomapaObjUrl = await fichasService.obtenerEcomapaInformeSocial(data.paciente.id);
          } catch (e) {
            console.error("Error loading ecomapa blob preview:", e);
          }
        }

        const mappedFamiliares = (data.familiares || []).map((f: any) => ({
          id: f.id || null,
          nombresApellidos: f.nombres || "",
          relacion: f.parentesco || "",
          edad: f.edad || 0,
          estadoCivil: f.estadoCivil || "",
          instruccion: f.instruccion || "",
          ocupacion: f.ocupacion || "",
          ingresoMensual: f.ingresos || 0,
          cedula: f.cedula || "",
          numeroTelefono: f.telefono || "",
          correoElectronico: f.correo || "",
        }));

        const informante = data.informante || null;

        setFormData((prev) => ({
          ...prev,
          ...data,
          especialista: prev.especialista,
          paciente: data.paciente || prev.paciente,
          genogramaUrl: genogramaObjUrl || prev.genogramaUrl,
          ecomapaUrl: ecomapaObjUrl || prev.ecomapaUrl,
          
          informanteId: informante?.id || null,
          informanteNombre: informante?.nombresApellidos || "",
          informanteParentesco: informante?.relacion || "",
          informanteCedula: informante?.cedula || "",
          informanteTelefono: informante?.numeroTelefono || "",
          informanteCorreo: informante?.correoElectronico || "",
          
          familiares: mappedFamiliares,
          tipoFamilia: data.tipoFamilia || "",
          tipoFamiliaEspecificar: data.tipoFamiliaEspecificar || "",
        }));

        if (genogramaObjUrl) setGenogramaPreview(genogramaObjUrl);
        if (ecomapaObjUrl) setEcomapaPreview(ecomapaObjUrl);

        // Marcar secciones como abiertas si tienen datos
        setSecciones({
          informacionPaciente: !!(data.pacienteEstadoCivil || data.pacienteNacionalidad || data.pacienteSexo),
          informante: !!(data.informante || data.informanteNombre),
          dinamicaFamiliar: !!data.descripcionDinamicaFamiliar || !!data.tipoFamilia,
          situacionEconomica: !!data.situacionEconomica,
          situacionHabitabilidad: !!data.situacionHabitabilidad,
          situacionLaboral: !!data.situacionLaboral,
          situacionEntorno: !!data.situacionEntorno,
          situacionEducativoCultural: !!data.situacionEducativoCultural,
          situacionSalud: !!data.situacionSalud,
          situacionLegal: !!data.situacionLegal,
          valoracionProfesional: !!data.valoracionProfesional,
          recomendaciones: !!data.recomendaciones,
          familiares: data.familiares?.length > 0,
          genograma: !!data.genogramaUrl,
          ecomapa: !!data.ecomapaUrl,
        });

        if (data.paciente) {
          try {
            const paciente = await pacientesService.obtenerPorId(data.paciente.id);
            setSelectedPatient(paciente);
          } catch (error) {
            console.warn("Error cargando paciente:", error);
          }
        }
      } else {
        toast.error("No se encontró el informe social.");
        navigate("/fichas?tab=informe_social");
      }
    } catch (error) {
      console.error("Error al cargar informe:", error);
      toast.error("Error al cargar el informe. Intente de nuevo.");
      navigate("/fichas?tab=informe_social");
    } finally {
      setLoading(false);
    }
  };

  const importarFamiliaresSocioeconomicos = async (pacienteId: number) => {
    try {
      const familiares = await pacientesService.obtenerFamiliares(pacienteId);
      if (familiares && familiares.length > 0) {
        const mapped = familiares.map((f: any) => ({
          id: f.id || null,
          nombresApellidos: f.nombresApellidos || "",
          relacion: f.relacion || "",
          edad: f.edad || 0,
          estadoCivil: f.estadoCivil || "",
          instruccion: f.instruccion || "",
          ocupacion: f.ocupacion || "",
          ingresoMensual: f.ingresoMensual || 0,
          cedula: f.cedula || "",
          numeroTelefono: f.numeroTelefono || "",
          correoElectronico: f.correoElectronico || "",
        }));
        setFormData((prev) => ({
          ...prev,
          familiares: mapped,
        }));
        setSecciones((prevSec) => ({
          ...prevSec,
          familiares: true,
        }));
        toast.info("Se cargaron los familiares automáticamente");
        return;
      }
    } catch (e) {
      console.log("No se pudo cargar familiares mediante pacientesService:", e);
    }

    try {
      const socioeconomica = await fichasService.obtenerSocioEconomico(pacienteId);
      if (socioeconomica?.familiares?.length > 0) {
        const mapped = socioeconomica.familiares.map((f: any) => ({
          id: f.id || null,
          nombresApellidos: f.nombresApellidos || "",
          relacion: f.relacion || "",
          edad: f.edad || 0,
          estadoCivil: f.estadoCivil || "",
          instruccion: f.instruccion || "",
          ocupacion: f.ocupacion || "",
          ingresoMensual: f.ingresoMensual || 0,
          cedula: f.cedula || "",
          numeroTelefono: f.numeroTelefono || "",
          correoElectronico: f.correoElectronico || "",
        }));
        setFormData((prev) => ({
          ...prev,
          familiares: mapped,
        }));
        setSecciones((prevSec) => ({
          ...prevSec,
          familiares: true,
        }));
        toast.info("Se cargaron los familiares automáticamente");
      }
    } catch (e) {
      console.log("No se pudo cargar familiares automáticamente:", e);
    }
  };

  const handlePatientSelect = async (patient: any) => {
    setFormData((prev) => ({
      ...prev,
      paciente: {
        id: patient.id,
        nombresApellidos: patient.nombresApellidos,
        cedula: patient.cedula,
      },
      // Auto-fill patient information desde el paciente
      pacienteEstadoCivil: patient.estadoCivil || "",
      pacienteNacionalidad: patient.nacionalidad || "",
      pacienteSexo: patient.sexo || "",
    }));
    setSelectedPatient(patient);
    setShowSelector(false);

    // Intentar importar familiares automáticamente
    await importarFamiliaresSocioeconomicos(patient.id);
  };

  const handleSubmit = async () => {
    if (!formData.paciente?.id) {
      toast.error("Debe seleccionar un paciente válido");
      return;
    }

    if (!formData.especialista?.id) {
      toast.error("No se pudo obtener el especialista válido");
      return;
    }

    // 1. Conformación Familiar
    if (!formData.familiares || formData.familiares.length === 0) {
      toast.error("Conformación Familiar (Familiares): Debe registrar al menos un miembro familiar");
      return;
    }

    // 2. Dinámica Familiar
    if (!formData.tipoFamilia) {
      toast.error("Conformación Familiar: El tipo de familia es requerido");
      return;
    }
    if (formData.tipoFamilia === "Otros" && !formData.tipoFamiliaEspecificar?.trim()) {
      toast.error("Conformación Familiar: Debe especificar el tipo de familia");
      return;
    }
    if (!formData.descripcionDinamicaFamiliar?.trim()) {
      toast.error("Descripción de la Dinámica Familiar: La descripción es requerida");
      return;
    }

    // Genograma
    if (!formData.genogramFile && !formData.genogramaUrl) {
      toast.error("Genograma: Debe cargar la imagen del genograma");
      return;
    }

    // 3. Situación Económica
    if (!formData.situacionEconomica?.trim()) {
      toast.error("Situación Económica: La descripción es requerida");
      return;
    }

    // 4. Situación de Habitabilidad
    if (!formData.situacionHabitabilidad?.trim()) {
      toast.error("Situación de Habitabilidad y Vivienda: La descripción es requerida");
      return;
    }

    // 5. Situación Laboral
    if (!formData.situacionLaboral?.trim()) {
      toast.error("Situación Laboral / Ocupacional: La descripción es requerida");
      return;
    }

    // 6. Situación Entorno
    if (!formData.situacionEntorno?.trim()) {
      toast.error("Situación del Entorno Familiar / Social: La descripción es requerida");
      return;
    }

    // 7. Situación Educativo Cultural
    if (!formData.situacionEducativoCultural?.trim()) {
      toast.error("Situación Educativo / Cultural: La descripción es requerida");
      return;
    }

    // 8. Situación Salud
    if (!formData.situacionSalud?.trim()) {
      toast.error("Situación de Salud: La descripción es requerida");
      return;
    }

    // 9. Situación Legal (en caso de existir)
    if (secciones.situacionLegal && !formData.situacionLegal?.trim()) {
      toast.error("Situación Legal: La descripción es requerida");
      return;
    }

    // Ecomapa
    if (!formData.ecomapFile && !formData.ecomapaUrl) {
      toast.error("Ecomapa: Debe cargar la imagen del ecomapa");
      return;
    }

    // 10. Valoración Profesional
    if (!formData.valoracionProfesional?.trim()) {
      toast.error("Valoración Profesional / Diagnóstico: La descripción es requerida");
      return;
    }

    // 11. Recomendaciones
    if (!formData.recomendaciones?.trim()) {
      toast.error("Recomendaciones / Propuesta de Intervención: La descripción es requerida");
      return;
    }

    // 12. Informante
    if (!formData.informanteNombre?.trim() || !formData.informanteParentesco?.trim() || !formData.informanteCedula?.trim()) {
      toast.error("Persona que Proporciona la Información (Informante): El nombre, parentesco y cédula del informante son requeridos");
      return;
    }
    if (formData.informanteCedula && !validarCedulaEcuatoriana(formData.informanteCedula)) {
      toast.error("Persona que Proporciona la Información (Informante): La cédula ingresada no es válida");
      return;
    }
    if (formData.informanteCorreo && !validarEmail(formData.informanteCorreo)) {
      toast.error("Persona que Proporciona la Información (Informante): El correo electrónico no tiene un formato válido");
      return;
    }
    if (formData.informanteTelefono && !validarSoloNumeros(formData.informanteTelefono)) {
      toast.error("Persona que Proporciona la Información (Informante): El teléfono debe contener solo números");
      return;
    }

    try {
      setLoading(true);

      const request = buildRequest(formData);

      if (!request.pacienteId || request.pacienteId === 0) {
        toast.error("Paciente inválido");
        return;
      }

      if (!request.especialistaId || request.especialistaId === 0) {
        toast.error("Especialista inválido");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("informe", JSON.stringify(request));

      if (formData.genogramFile) {
        uploadData.append("genograma", formData.genogramFile);
      }
      if (formData.ecomapFile) {
        uploadData.append("ecomapa", formData.ecomapFile);
      }

      if (isEdit && formData.id) {
        await fichasService.actualizarInformeSocial(formData.id, uploadData);
        toast.success("Informe actualizado exitosamente");
      } else {
        await fichasService.crearInformeSocial(uploadData);
        toast.success("Informe creado exitosamente");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/fichas?tab=informe_social");
      }
    } catch (error: any) {
      console.error("ERROR COMPLETO:", error?.response?.data);
      const serverMessage = error?.response?.data?.message;
      toast.error(
        serverMessage ||
          (isEdit
            ? "Error al actualizar el informe"
            : "Error al crear el informe")
      );
    } finally {
      setLoading(false);
    }
  };

  if (showSelector) {
    return (
      <div className="space-y-6">
        <PatientSelector onSelect={handlePatientSelect} />
      </div>
    );
  }
  const SectionHeader = ({
    title,
    description,
    icon,
    isOpen,
    onToggle,
  }: SectionHeaderProps) => {
    return (
      <div
        onClick={onToggle}
        className={`cursor-pointer group relative overflow-hidden p-6 rounded-3xl border-2 transition-all duration-500 ${isOpen
          ? "border-brand-100 bg-brand-50/20 dark:border-gray-600 dark:bg-gray-800 scale-[1.02]"
          : "border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-600"
          }`}
      >
        <div className="flex items-center gap-5">
          <div
            className={`p-4 rounded-2xl transition-all duration-500 ${isOpen
              ? "bg-brand-400 text-white rotate-12 dark:bg-gray-500 dark:text-gray-200"
              : "bg-brand-50 text-brand-500 dark:bg-gray-800 dark:text-gray-300"
              }`}
          >
            {icon}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Banner paciente */}
      {selectedPatient && (
        <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-3xl flex items-center justify-between border-2 border-brand-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-400 dark:bg-gray-500 rounded-full text-white font-bold">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {selectedPatient.nombresApellidos}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Cédula: {selectedPatient.cedula}
              </p>
            </div>
          </div>
          {!isEdit && (
            <button
              onClick={() => setShowSelector(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Cambiar
            </button>
          )}
        </div>
      )}

      {/* Número de Ficha */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Número de Ficha
        </label>
        <input
          type="text"
          value={formData.numFicha}
          disabled
          placeholder="Cargando..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        />
      </div>

      {/* SECCIÓN INFORMACIÓN DEL PACIENTE */}
      <SectionHeader
        title="Información del Paciente"
        description="Datos personales, de salud y educación del paciente"
        icon={<User size={24} />}
        isOpen={secciones.informacionPaciente}
        onToggle={() =>
          setSecciones({
            ...secciones,
            informacionPaciente: !secciones.informacionPaciente,
          })
        }
      />
      {secciones.informacionPaciente && selectedPatient && (
        <ComponentCard title="Información del Paciente">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombres y Apellidos
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.nombresApellidos || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cédula / Pasaporte
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.cedula || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lugar de Nacimiento
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.lugarNacimiento || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Nacimiento
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.fechaNacimiento || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Edad
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.fechaNacimiento
                    ? `${new Date().getFullYear() - new Date(selectedPatient.fechaNacimiento).getFullYear()} años`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado Civil
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.estadoCivil || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nacionalidad
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.nacionalidad || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sexo
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.sexo || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Discapacidad
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.tieneDiscapacidad ? selectedPatient.tipoDiscapacidad : "Ninguna"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Porcentaje de Discapacidad
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.tieneDiscapacidad && selectedPatient.porcentajeDiscapacidad !== undefined ? `${selectedPatient.porcentajeDiscapacidad}%` : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institución Educativa
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.institucionEducativa?.nombre || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nivel Educativo
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.nivelEducativo || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Año que Cursa
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                  {selectedPatient.anioEducacion || "—"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lugar de Residencia
              </label>
              <p className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100">
                {selectedPatient.domicilio || "—"}
              </p>
            </div>
          </div>
        </ComponentCard>
      )}


      {/* 1. DATOS DE IDENTIFICACIÓN */}
      <SectionHeader
        title="1. DATOS DE IDENTIFICACIÓN"
        description="Información de los miembros familiares"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.familiares}
        onToggle={() =>
          setSecciones({
            ...secciones,
            familiares: !secciones.familiares,
          })
        }
      />
      {secciones.familiares && (
        <ComponentCard title="1. DATOS DE IDENTIFICACIÓN">
          {(!formData.familiares || formData.familiares.length === 0) && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * Debe registrar al menos un familiar en la ficha socioeconómica.
              </p>
            </div>
          )}
          <ConformacionFamiliar
            data={formData.familiares}
            readOnly={true}
            onValidate={handleValidateFamiliares}
          />
        </ComponentCard>
      )}

      {/* 2. CONFORMACIÓN FAMILIAR */}
      <SectionHeader
        title="2. CONFORMACIÓN FAMILIAR"
        description="Tipo de familia y descripción de la dinámica familiar"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.dinamicaFamiliar}
        onToggle={() =>
          setSecciones({
            ...secciones,
            dinamicaFamiliar: !secciones.dinamicaFamiliar,
          })
        }
      />
      {secciones.dinamicaFamiliar && (
        <ComponentCard title="2. CONFORMACIÓN FAMILIAR">
          {(!formData.descripcionDinamicaFamiliar?.trim() || !formData.tipoFamilia || (formData.tipoFamilia === "Otros" && !formData.tipoFamiliaEspecificar?.trim())) && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                Campos pendientes:
              </p>
              <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                {!formData.tipoFamilia && <li>El tipo de familia es requerido</li>}
                {formData.tipoFamilia === "Otros" && !formData.tipoFamiliaEspecificar?.trim() && <li>Debe especificar el tipo de familia</li>}
                {!formData.descripcionDinamicaFamiliar?.trim() && <li>La descripción de la dinámica familiar es requerida</li>}
              </ul>
            </div>
          )}
          <div className="space-y-6">
            {/* Tipo de Familia Matrix */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Familia
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Nuclear", "Extensa", "Monoparental", "Otros"].map((tipo) => (
                  <label
                    key={tipo}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.tipoFamilia === tipo
                      ? "border-brand-500 bg-brand-50/20 text-brand-700 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="tipoFamilia"
                      value={tipo}
                      checked={formData.tipoFamilia === tipo}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          tipoFamilia: e.target.value,
                          tipoFamiliaEspecificar: e.target.value === "Otros" ? formData.tipoFamiliaEspecificar : ""
                        });
                      }}
                      className="text-brand-500 focus:ring-brand-400"
                    />
                    <span className="text-sm font-medium">{tipo}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.tipoFamilia === "Otros" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Especificar Tipo de Familia
                </label>
                <input
                  type="text"
                  value={formData.tipoFamiliaEspecificar || ""}
                  onChange={(e) => setFormData({ ...formData, tipoFamiliaEspecificar: e.target.value })}
                  placeholder="Escriba el tipo de familia..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
            )}

            <hr className="border-gray-150 dark:border-gray-700 my-4" />

            {/* Dinámica Familiar Text Area */}
            <DinamicaFamiliarForm
              data={formData.descripcionDinamicaFamiliar}
              onChange={(value) =>
                setFormData({ ...formData, descripcionDinamicaFamiliar: value })
              }
              onValidate={(isValid) =>
                setValidaciones((prev) => ({ ...prev, dinamicaFamiliar: isValid }))
              }
            />
          </div>
        </ComponentCard>
      )}

      {/* 3. GENOGRAMA */}
      <SectionHeader
        title="3. GENOGRAMA"
        description="Documento gráfico del genograma"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.genograma}
        onToggle={() =>
          setSecciones({
            ...secciones,
            genograma: !secciones.genograma,
          })
        }
      />
      {secciones.genograma && (
        <ComponentCard title="3. GENOGRAMA">
          {(!formData.genogramFile && !formData.genogramaUrl) && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * Debe cargar la imagen del genograma.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Genograma
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {genogramaPreview ? (
                <div className="space-y-3">
                  <img
                    src={genogramaPreview}
                    alt="Genograma"
                    className="mx-auto max-h-60 max-w-full rounded-lg shadow-sm"
                  />
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        genogramFile: null,
                        genogramaUrl: undefined,
                      });
                      setGenogramaPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center justify-center gap-1 mx-auto"
                  >
                    <X size={14} />
                    Eliminar genograma
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 block">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clic para cargar genograma
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          genogramFile: file,
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setGenogramaPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </ComponentCard>
      )}

      {/* 4. SITUACIÓN ECONÓMICA */}
      <SectionHeader
        title="4. SITUACIÓN ECONÓMICA"
        description="Información sobre la situación económica"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionEconomica}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionEconomica: !secciones.situacionEconomica,
          })
        }
      />
      {secciones.situacionEconomica && (
        <ComponentCard title="4. SITUACIÓN ECONÓMICA">
          {!formData.situacionEconomica?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación económica es requerida.
              </p>
            </div>
          )}
          <SituacionEconomicaInformeForm
            data={formData.situacionEconomica}
            onChange={(value) =>
              setFormData({ ...formData, situacionEconomica: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, situacionEconomica: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 5. SITUACIÓN DE HABITABILIDAD O VIVIENDA */}
      <SectionHeader
        title="5. SITUACIÓN DE HABITABILIDAD O VIVIENDA"
        description="Condiciones de habitabilidad y vivienda"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionHabitabilidad}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionHabitabilidad: !secciones.situacionHabitabilidad,
          })
        }
      />
      {secciones.situacionHabitabilidad && (
        <ComponentCard title="5. SITUACIÓN DE HABITABILIDAD O VIVIENDA">
          {!formData.situacionHabitabilidad?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación de habitabilidad es requerida.
              </p>
            </div>
          )}
          <SituacionHabitabilidadForm
            data={formData.situacionHabitabilidad}
            onChange={(value) =>
              setFormData({ ...formData, situacionHabitabilidad: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, situacionHabitabilidad: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 6. SITUACIÓN LABORAL */}
      <SectionHeader
        title="6. SITUACIÓN LABORAL"
        description="Información laboral"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionLaboral}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionLaboral: !secciones.situacionLaboral,
          })
        }
      />
      {secciones.situacionLaboral && (
        <ComponentCard title="6. SITUACIÓN LABORAL">
          {!formData.situacionLaboral?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación laboral es requerida.
              </p>
            </div>
          )}
          <SituacionLaboralForm
            data={formData.situacionLaboral}
            onChange={(value) =>
              setFormData({ ...formData, situacionLaboral: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, situacionLaboral: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 7. SITUACIÓN SOCIAL: RELACIÓN CON EL ENTORNO */}
      <SectionHeader
        title="7. SITUACIÓN SOCIAL: RELACIÓN CON EL ENTORNO"
        description="Información del entorno social"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionEntorno}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionEntorno: !secciones.situacionEntorno,
          })
        }
      />
      {secciones.situacionEntorno && (
        <ComponentCard title="7. SITUACIÓN SOCIAL: RELACIÓN CON EL ENTORNO">
          {!formData.situacionEntorno?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación social (entorno) es requerida.
              </p>
            </div>
          )}
          <SituacionEntornoForm
            data={formData.situacionEntorno}
            onChange={(value) =>
              setFormData({ ...formData, situacionEntorno: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, situacionEntorno: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 8. SITUACIÓN EDUCATIVO – CULTURAL */}
      <SectionHeader
        title="8. SITUACIÓN EDUCATIVO – CULTURAL"
        description="Información educativa y cultural"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionEducativoCultural}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionEducativoCultural: !secciones.situacionEducativoCultural,
          })
        }
      />
      {secciones.situacionEducativoCultural && (
        <ComponentCard title="8. SITUACIÓN EDUCATIVO – CULTURAL">
          {!formData.situacionEducativoCultural?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación educativo-cultural es requerida.
              </p>
            </div>
          )}
          <SituacionEducativoCulturalForm
            data={formData.situacionEducativoCultural}
            onChange={(value) =>
              setFormData({ ...formData, situacionEducativoCultural: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({
                ...prev,
                situacionEducativoCultural: isValid,
              }))
            }
          />
        </ComponentCard>
      )}

      {/* 9. SITUACIÓN DE SALUD FISICA Y PSICOLOGICA */}
      <SectionHeader
        title="9. SITUACIÓN DE SALUD FISICA Y PSICOLOGICA"
        description="Información de salud física y psicológica"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionSalud}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionSalud: !secciones.situacionSalud,
          })
        }
      />
      {secciones.situacionSalud && (
        <ComponentCard title="9. SITUACIÓN DE SALUD FISICA Y PSICOLOGICA">
          {!formData.situacionSalud?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación de salud es requerida.
              </p>
            </div>
          )}
          <SituacionSaludForm
            data={formData.situacionSalud}
            onChange={(value) =>
              setFormData({ ...formData, situacionSalud: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, situacionSalud: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 10. SITUACIÓN LEGAL (en caso de existir) */}
      <SectionHeader
        title="10. SITUACIÓN LEGAL (en caso de existir)"
        description="Información de la situación legal"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.situacionLegal}
        onToggle={() =>
          setSecciones({
            ...secciones,
            situacionLegal: !secciones.situacionLegal,
          })
        }
      />
      {secciones.situacionLegal && (
        <ComponentCard title="10. SITUACIÓN LEGAL (en caso de existir)">
          {!formData.situacionLegal?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la situación legal es requerida.
              </p>
            </div>
          )}
          <SituacionLegalForm
            data={formData.situacionLegal}
            onChange={(value) =>
              setFormData({ ...formData, situacionLegal: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, situacionLegal: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 11. ECOMAPA */}
      <SectionHeader
        title="11. ECOMAPA"
        description="Documento gráfico del ecomapa"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.ecomapa}
        onToggle={() =>
          setSecciones({
            ...secciones,
            ecomapa: !secciones.ecomapa,
          })
        }
      />
      {secciones.ecomapa && (
        <ComponentCard title="11. ECOMAPA">
          {(!formData.ecomapFile && !formData.ecomapaUrl) && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * Debe cargar la imagen del ecomapa.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ecomapa
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {ecomapaPreview ? (
                <div className="space-y-3">
                  <img
                    src={ecomapaPreview}
                    alt="Ecomapa"
                    className="mx-auto max-h-60 max-w-full rounded-lg shadow-sm"
                  />
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        ecomapFile: null,
                        ecomapaUrl: undefined,
                      });
                      setEcomapaPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center justify-center gap-1 mx-auto"
                  >
                    <X size={14} />
                    Eliminar ecomapa
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 block">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clic para cargar ecomapa
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          ecomapFile: file,
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEcomapaPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </ComponentCard>
      )}

      {/* 12. VALORACIÓN PROFESIONAL */}
      <SectionHeader
        title="12. VALORACIÓN PROFESIONAL"
        description="Análisis profesional del caso"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.valoracionProfesional}
        onToggle={() =>
          setSecciones({
            ...secciones,
            valoracionProfesional: !secciones.valoracionProfesional,
          })
        }
      />
      {secciones.valoracionProfesional && (
        <ComponentCard title="12. VALORACIÓN PROFESIONAL">
          {!formData.valoracionProfesional?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * La descripción de la valoración profesional es requerida.
              </p>
            </div>
          )}
          <ValoracionProfesionalForm
            data={formData.valoracionProfesional}
            onChange={(value) =>
              setFormData({ ...formData, valoracionProfesional: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, valoracionProfesional: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* 13. RECOMENDACIONES */}
      <SectionHeader
        title="13. RECOMENDACIONES"
        description="Recomendaciones profesionales"
        icon={<MessageSquare size={24} />}
        isOpen={secciones.recomendaciones}
        onToggle={() =>
          setSecciones({
            ...secciones,
            recomendaciones: !secciones.recomendaciones,
          })
        }
      />
      {secciones.recomendaciones && (
        <ComponentCard title="13. RECOMENDACIONES">
          {!formData.recomendaciones?.trim() && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                * Las recomendaciones son requeridas.
              </p>
            </div>
          )}
          <RecomendacionesForm
            data={formData.recomendaciones}
            onChange={(value) =>
              setFormData({ ...formData, recomendaciones: value })
            }
            onValidate={(isValid) =>
              setValidaciones((prev) => ({ ...prev, recomendaciones: isValid }))
            }
          />
        </ComponentCard>
      )}

      {/* SECCIÓN PERSONA QUE PROPORCIONA LA INFORMACIÓN */}
      <SectionHeader
        title="Persona que Proporciona la Información"
        description="Datos del informante y su relación con el paciente"
        icon={<User size={24} />}
        isOpen={secciones.informante}
        onToggle={() =>
          setSecciones({
            ...secciones,
            informante: !secciones.informante,
          })
        }
      />
      {secciones.informante && (
        <ComponentCard title="Persona que Proporciona la Información">
          {(!formData.informanteNombre?.trim() || 
            !formData.informanteParentesco?.trim() || 
            !formData.informanteCedula?.trim() || 
            (formData.informanteCedula && !validarCedulaEcuatoriana(formData.informanteCedula)) ||
            (formData.informanteCorreo && !validarEmail(formData.informanteCorreo)) ||
            (formData.informanteTelefono && !validarSoloNumeros(formData.informanteTelefono))) && (
            <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                Campos pendientes:
              </p>
              <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                {!formData.informanteNombre?.trim() && <li>El nombre del informante es obligatorio</li>}
                {!formData.informanteParentesco?.trim() && <li>El parentesco del informante es obligatorio</li>}
                {!formData.informanteCedula?.trim() && <li>La cédula del informante es obligatoria</li>}
                {formData.informanteCedula && !validarCedulaEcuatoriana(formData.informanteCedula) && <li>La cédula del informante no es válida (debe ser una cédula ecuatoriana de 10 dígitos)</li>}
                {formData.informanteCorreo && !validarEmail(formData.informanteCorreo) && <li>El correo electrónico no es válido</li>}
                {formData.informanteTelefono && !validarSoloNumeros(formData.informanteTelefono) && <li>El teléfono debe contener solo números</li>}
              </ul>
            </div>
          )}
          <div className="space-y-4">
            {formData.familiares && formData.familiares.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Seleccionar de Miembros Familiares
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const idx = e.target.value;
                    if (idx !== "") {
                      const familiar = formData.familiares[Number(idx)];
                      setFormData({
                        ...formData,
                        informanteId: familiar.id || null,
                        informanteNombre: familiar.nombresApellidos,
                        informanteParentesco: familiar.relacion,
                        informanteCedula: familiar.cedula || "",
                        informanteTelefono: familiar.numeroTelefono || "",
                        informanteCorreo: familiar.correoElectronico || "",
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                >
                  <option value="">-- Seleccione un familiar para auto-completar --</option>
                  {formData.familiares.map((familiar, idx) => (
                    <option key={idx} value={idx}>
                      {familiar.nombresApellidos} ({familiar.relacion})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.informanteNombre || ""}
                  onChange={(e) => setFormData({ ...formData, informanteNombre: e.target.value })}
                  placeholder="Nombre de la persona"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={formData.informanteParentesco || ""}
                  onChange={(e) => setFormData({ ...formData, informanteParentesco: e.target.value })}
                  placeholder="Ej: Madre, Padre, Tío/a"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cédula / Pasaporte
                </label>
                <input
                  type="text"
                  value={formData.informanteCedula || ""}
                  onChange={(e) => setFormData({ ...formData, informanteCedula: e.target.value })}
                  placeholder="Cédula del informante"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.informanteTelefono || ""}
                  onChange={(e) => setFormData({ ...formData, informanteTelefono: e.target.value })}
                  placeholder="Número de teléfono"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.informanteCorreo || ""}
                onChange={(e) => setFormData({ ...formData, informanteCorreo: e.target.value })}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
              />
            </div>
          </div>
        </ComponentCard>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Guardando..."
            : id
              ? "Actualizar Informe"
              : "Guardar Informe"}
        </Button>
      </div>
    </div>
  );
}