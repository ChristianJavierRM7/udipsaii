import { useState, useEffect, useCallback } from "react";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";

import { useNavigate, useParams, useSearchParams } from "react-router";
import Input from "../input/InputField";
import { toast } from "react-toastify";
import { MessageSquare, User } from "lucide-react";
import { pacientesService, especialistasService, pasantesService } from "../../../services";
import PatientSelector from "../../common/PatientSelector";
import { useAuth } from "../../../context/AuthContext.tsx";


import { fichasService } from "../../../services/fichas";

import InformacionPacienteForm from "./sections/SocioEconomica/InformacionPacienteForm";
import RiesgosFamiliaresForm from "./sections/SocioEconomica/RiesgosFamiliaresForm";
import VulnerabilidadesForm from "./sections/SocioEconomica/VulnerabilidadesForm";
import RelacionFamiliar from "./sections/SocioEconomica/RelacionFamiliar";
import CondicionesViviendaForm from "./sections/SocioEconomica/CondicionesViviendaForm";
import ConformacionFamiliar from "./sections/SocioEconomica/ConformacionFamiliarForm";
import SaludForm from "./sections/SocioEconomica/SaludForm";
import SituacionEconomicaForm from "./sections/SocioEconomica/SituacionEconomicaForm";
import Label from "../Label.tsx";



interface FamiliarSalud {
  problema?: boolean;
  enfermedad?: string;
  catastrofica?: boolean;
  enfermedadCatastrofica?: string;
  discapacidad?: boolean;
  descripDiscapacidad?: string;
}
interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}
export interface FichaSocioeconomicaState {
  id?: number;
  activo: boolean;
  fechaElaboracion: string;

  paciente: {
    id: number;
    nombresApellidos: string;
    fechaNacimiento: string;
    lugarNacimiento: string;
    edad: number;
    cedula: string;
    numeroTelefono?: string;
    numeroCelular?: string;
    institucionEducativa?: { nombre: string; };
    domicilio?: string;
    portadorCarnet?: boolean;
    tipoDiscapacidad?: string;
    porcentajeDiscapacidad?: number;
    estadoCivil?: string;
    nacionalidad?: string;
    sexo?: string;
    nivelEducativo?: string;
    email?: string;
    ocupacion?: string;
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
  };

  familiares: {
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
    salud?: FamiliarSalud;
  }[];

  riesgosFamiliares: {
    tabaquismo: boolean;
    alcoholismo: boolean;
    drogadiccion: boolean;
    violenciaIntrafamiliar: boolean;
    problemasSociales: string;
    vulnerabilidades: string;
    migroExterior: boolean;
    lugarMigracion: string;
    tiempoMigracion: string;
    afectacionFamiliar: string;
  };

  vulnerabilidadesDetalle: {
    movilidadHumana: boolean;
    enfermedadCatastrofica: boolean;
    embarazoAdolescente: boolean;
    abusoSexual: boolean;
    agresionFisica: boolean;
    agresionPsicologica: boolean;
    lugarAgresion: string;
  };

  dinamicaFamiliar: {
    opinionfamiliar: boolean;
    unionfamiliar: boolean;
    resolucionConflictos: string;
    quienesIncumplenReglas: string;
    actividadesCompartidas: string;
    cumplenReglas: boolean;
    tieneActividadesFamiliares: boolean;
    relacionHermanos: string;
    relacionPadresHijos: string;
    comunicacionFamiliar: string;
    tipoHogar: string;
  };

  vivienda: {
    tipoTenencia: string;
    materialParedes: string;
    materialPiso: string;
    materialTecho: string;
    numeroCuartos: number;
    numeroDormitorios: number;
    numeroCamas: number;
    numeroSanitarios: number;
    tipoSanitario: string;
    procedenciaAgua: string;
    detalleElectricidad: string;
    tieneElectricidad?: boolean;
    numeroFocos?: number;
    otrosDetallesElectricidad?: string;
    tieneInternet?: boolean;
    tieneDucha?: boolean;
  };

  salud: {
    lugarAtencionMedica: string;
    saludEstudiante: string;
    ayudasTecnicas: string;
  };

  situacionEconomica: {
    totalIngresos: number;
    totalEgresos: number;
    condicionEconomica: string;
    capacidadGastoEvaluacion: string;
    actividadesTiempoLibre: string;
    ingresoPerCapita?: number;
    categoriaSocioeconomica?: string;
    grupoSocioeconomico?: number;
  };

  desgloseEconomico: {
    egresoAlimentacion: number;
    egresoArriendo: number;
    egresoServiciosBasicos: number;
    egresoSalud: number;
    egresoEducacion: number;
    egresoPrestamos: number;
    egresoOtros: number;
  };

  conclusiones: string;
  recomendaciones: string;

  pacienteInstruccion?: string;
  pacienteOcupacion?: string;
  pacienteEmail?: string;
  pacienteNumCarne?: string;
  responsable?: string;
}

const getFechaActual = (): string => {
  const today = new Date();
  return today.toISOString();
};

export const initialFichaSocioeconomicaState: FichaSocioeconomicaState = {
  // TODO: Datos faltantes paciente : email, instruccion, ocupacion,tipo hogar, tiempo libre
  activo: true,
  fechaElaboracion: getFechaActual(), // ✅ Fecha actual del sistema
  paciente: {
    id: 0,
    nombresApellidos: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    edad: 0,
    cedula: "",
    numeroTelefono: "",
    numeroCelular: "",
    institucionEducativa: { nombre: "" },
    domicilio: "",
    portadorCarnet: false,
    tipoDiscapacidad: "",
    porcentajeDiscapacidad: 0,
    estadoCivil: "",
    nacionalidad: "",
    sexo: "",
    nivelEducativo: "",
    email: "",
    ocupacion: "",
  },
  especialista: {
    id: 0,
    nombresApellidos: "",
  },
  familiares: [],
  riesgosFamiliares: {
    tabaquismo: false,
    alcoholismo: false,
    drogadiccion: false,
    violenciaIntrafamiliar: false,
    problemasSociales: "",
    vulnerabilidades: "",
    migroExterior: false,
    lugarMigracion: "",
    tiempoMigracion: "",
    afectacionFamiliar: "",
  },
  vulnerabilidadesDetalle: {
    movilidadHumana: false,
    enfermedadCatastrofica: false,
    embarazoAdolescente: false,
    abusoSexual: false,
    agresionFisica: false,
    agresionPsicologica: false,
    lugarAgresion: "",
  },
  dinamicaFamiliar: {
    opinionfamiliar: false,
    unionfamiliar: false,
    resolucionConflictos: "",
    quienesIncumplenReglas: "",
    actividadesCompartidas: "",
    cumplenReglas: false,
    tieneActividadesFamiliares: false,
    relacionHermanos: "",
    relacionPadresHijos: "",
    comunicacionFamiliar: "",
    tipoHogar: "",
  },
  vivienda: {
    tipoTenencia: "",
    materialParedes: "",
    materialPiso: "",
    materialTecho: "",
    numeroCuartos: 0,
    numeroDormitorios: 0,
    numeroCamas: 0,
    numeroSanitarios: 0,
    tipoSanitario: "",
    procedenciaAgua: "",
    detalleElectricidad: "",
    tieneElectricidad: false,
    numeroFocos: 0,
    otrosDetallesElectricidad: "",
    tieneInternet: false,
    tieneDucha: false,
  },
  salud: {
    lugarAtencionMedica: "",
    saludEstudiante: "",
    ayudasTecnicas: "",
  },
  situacionEconomica: {
    totalIngresos: 0,
    totalEgresos: 0,
    condicionEconomica: "",
    capacidadGastoEvaluacion: "",
    actividadesTiempoLibre: "",
    ingresoPerCapita: 0,
    categoriaSocioeconomica: "",
    grupoSocioeconomico: 1,
  },
  desgloseEconomico: {
    egresoAlimentacion: 0,
    egresoArriendo: 0,
    egresoServiciosBasicos: 0,
    egresoSalud: 0,
    egresoEducacion: 0,
    egresoPrestamos: 0,
    egresoOtros: 0,
  },
  conclusiones: "",
  recomendaciones: "",
  pacienteInstruccion: "",
  pacienteOcupacion: "",
  pacienteEmail: "",
  pacienteNumCarne: "",
  responsable: "",
};
const buildRequest = (data: FichaSocioeconomicaState) => {
  return {
    pacienteId: data.paciente.id,
    especialistaId: data.especialista.id,
    fechaElaboracion: data.fechaElaboracion,

    riesgosSociales: {
      tabaquismo: data.riesgosFamiliares.tabaquismo,
      alcoholismo: data.riesgosFamiliares.alcoholismo,
      drogadiccion: data.riesgosFamiliares.drogadiccion,
      violenciaIntrafamiliar: data.riesgosFamiliares.violenciaIntrafamiliar,
      problemasSociales: data.riesgosFamiliares.problemasSociales,
      vulnerabilidades: data.riesgosFamiliares.vulnerabilidades,
      migroExterior: data.riesgosFamiliares.migroExterior,
      lugarMigracion: data.riesgosFamiliares.lugarMigracion,
      tiempoMigracion: data.riesgosFamiliares.tiempoMigracion,
      afectacionFamiliar: data.riesgosFamiliares.afectacionFamiliar,
    },

    vulnerabilidad: {
      movilidadHumana: data.vulnerabilidadesDetalle.movilidadHumana,
      enfermedadCatastrofica: data.vulnerabilidadesDetalle.enfermedadCatastrofica,
      embarazoAdolescente: data.vulnerabilidadesDetalle.embarazoAdolescente,
      abusoSexual: data.vulnerabilidadesDetalle.abusoSexual,
      agresionFisica: data.vulnerabilidadesDetalle.agresionFisica,
      agresionPsicologica: data.vulnerabilidadesDetalle.agresionPsicologica,
      lugarAgresion: data.vulnerabilidadesDetalle.lugarAgresion,
    },

    dinamicaFamiliar: data.dinamicaFamiliar,
    vivienda: {
      ...data.vivienda,
      tieneElectricidad: data.vivienda.tieneElectricidad || false,
      numeroFocos: Number(data.vivienda.numeroFocos) || 0,
      otrosDetallesElectricidad: data.vivienda.otrosDetallesElectricidad || "",
      tieneInternet: data.vivienda.tieneInternet || false,
      tieneDucha: data.vivienda.tieneDucha || false,
    },
    salud: data.salud,

    situacionEconomica: {
      totalIngresos: data.situacionEconomica.totalIngresos,
      totalEgresos: data.situacionEconomica.totalEgresos,
      condicionEconomica: data.situacionEconomica.condicionEconomica,
      capacidadGastoEvaluacion: data.situacionEconomica.capacidadGastoEvaluacion,
      actividadesTiempoLibre: data.situacionEconomica.actividadesTiempoLibre,
      ingresoPerCapita: data.situacionEconomica.ingresoPerCapita || 0,
      categoriaSocioeconomica: data.situacionEconomica.categoriaSocioeconomica || "",
      grupoSocioeconomico: data.situacionEconomica.grupoSocioeconomico || 1,
    },

    desgloseEconomico: data.desgloseEconomico,

    pacienteInstruccion: data.pacienteInstruccion,
    pacienteOcupacion: data.pacienteOcupacion,
    pacienteEmail: data.pacienteEmail,
    pacienteNumCarne: data.paciente.cedula,

    conclusiones: data.conclusiones,
    recomendaciones: data.recomendaciones,
    responsable: data.responsable || "",

    familiares: data.familiares.map((f) => ({
      id: f.id || null,
      relacion: f.relacion,
      nombresApellidos: f.nombresApellidos,
      edad: f.edad,
      estadoCivil: f.estadoCivil,
      instruccion: f.instruccion,
      ocupacion: f.ocupacion,
      ingresoMensual: f.ingresoMensual,
      cedula: f.cedula || "",
      numeroTelefono: f.numeroTelefono || "",
      correoElectronico: f.correoElectronico || "",

      problemasSalud: f.salud?.problema || false,
      descripProblemasSalud: f.salud?.enfermedad || "",

      enfermedadCatastrofica: f.salud?.catastrofica || false,
      descripEnfermedadCatastrofica: f.salud?.enfermedadCatastrofica || "",

      discapacidad: f.salud?.discapacidad || false,
      descripDiscapacidad: f.salud?.descripDiscapacidad || "",
    })),
  };
};

export interface FormularioSocioeconomicoProps {
  fichaId?: number | string;
  onSuccess?: () => void;
}

export default function FormularioFichaSocioeconomica({ fichaId, onSuccess }: FormularioSocioeconomicoProps = {}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const id = fichaId?.toString() || paramId;
  const [searchParams] = useSearchParams();

  // ✅ OBTENER EL USUARIO AUTENTICADO
  const { userIdentity, userRole } = useAuth();

  const [formData, setFormData] = useState<FichaSocioeconomicaState>(
    initialFichaSocioeconomicaState
  );

  const [loading, setLoading] = useState(false);
  const [especialistaLoading, setEspecialistaLoading] = useState(true); // ✅ Loading para especialista
  const [verInformacionPaciente, setVerInformacionPaciente] = useState(false);
  const [verConformacionFamiliar, setVerConformacionFamiliar] = useState(false);
  const [verRiesgosFamiliares, setVerRiesgosFamiliares] = useState(false);
  const [verVulnerabilidades, setVerVulnerabilidades] = useState(false);
  const [verRelacionFamiliar, setVerRelacionFamiliar] = useState(false);
  const [verTipoHogar, setVerTipoHogar] = useState(false);
  const [verVivienda, setVerVivienda] = useState(false);
  const [verSalud, setVerSalud] = useState(false);
  const [verTiempoLibre, setVerTiempoLibre] = useState(false);
  const [verSituacionEconomica, setVerSituacionEconomica] = useState(false);
  const [verConclusiones, setVerConclusiones] = useState(false);
  const [verRecomendaciones, setVerRecomendaciones] = useState(false);
  const [verCapacidadGasto, setVerCapacidadGasto] = useState(false);
  const [verResponsableSeccion, setVerResponsableSeccion] = useState(false);

  const [validaciones, setValidaciones] = useState<Record<string, boolean>>({
    conformacionFamiliar: false,
    riesgosFamiliares: false,
    vulnerabilidades: false,
    relacionFamiliar: false,
    tipoHogar: false,
    condicionesVivienda: false,
    salud: false,
    tiempoLibre: false,
    situacionEconomica: false,
    capacidadGasto: false,
  });
  const [erroresSecciones, setErroresSecciones] = useState<Record<string, string[]>>({
    conformacionFamiliar: [],
    riesgosFamiliares: [],
    vulnerabilidades: [],
    relacionFamiliar: [],
    condicionesVivienda: [],
    salud: [],
    situacionEconomica: [],
  });
  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    nombresApellidos: string;
    cedula: string;
  } | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const isEdit = !!id;

  // ✅ EFECTO PARA OBTENER EL ESPECIALISTA/PASANTE DESDE LA API
  useEffect(() => {
    const loadEspecialista = async () => {
      if (!userIdentity || !userRole) {
        setEspecialistaLoading(false);
        return;
      }

      try {
        setEspecialistaLoading(true);
        let especialistaData = null;

        // Determinar si es especialista o pasante según el rol
        if (userRole === "ROLE_ESPECIALISTA") {
          const result = await especialistasService.filtrar({ search: userIdentity });
          especialistaData = result?.content?.[0];
        } else if (userRole === "ROLE_PASANTE") {
          const result = await pasantesService.filtrar({ search: userIdentity });
          especialistaData = result?.content?.[0];
        }

        if (especialistaData?.id) {
          setFormData((prev) => {

            return {
              ...prev,
              especialista: {
                id: especialistaData.id,
                nombresApellidos: especialistaData.nombresApellidos,
              },
            };
          });
        } else {
          console.warn("No se encontró especialista/pasante para:", userIdentity);
          toast.warn("No se pudo cargar la información del especialista. Intente recargar.");
        }
      } catch (error) {
        console.error("Error al cargar especialista:", error);
        toast.error("Error al cargar la información del especialista.");
      } finally {
        setEspecialistaLoading(false);
      }
    };

    loadEspecialista();
  }, [userIdentity, userRole]);

  // ✅ EFECTO PARA CARGAR LA FICHA SI ES EDICIÓN
  useEffect(() => {
    const pacienteIdParam = searchParams.get("pacienteId");
    if (isEdit && id) {
      loadFicha(id);
    } else if (pacienteIdParam) {
      loadPacienteFromUrl(pacienteIdParam);
    } else {
      setShowSelector(true);
    }
  }, [id, isEdit, searchParams]);
  const loadPacienteFromUrl = async (id: string) => {
    try {
      setLoading(true);
      const paciente = await pacientesService.obtenerPorId(id);
      if (paciente) {
        setSelectedPatient(paciente);
        
        let mappedFamiliares: any[] = [];
        try {
          const familiaresResponse = await pacientesService.obtenerFamiliares(paciente.id);
          mappedFamiliares = (familiaresResponse || []).map((f: any) => ({
            ...f,
            salud: {
              problema: f.problemasSalud || false,
              enfermedad: f.descripProblemasSalud || "",
              catastrofica: f.enfermedadCatastrofica || false,
              enfermedadCatastrofica: f.descripEnfermedadCatastrofica || "",
              discapacidad: f.discapacidad || false,
              descripDiscapacidad: f.descripDiscapacidad || "",
            }
          }));
        } catch (fError) {
          console.warn("No se pudieron cargar los familiares del paciente:", fError);
        }

        setFormData((prev) => ({
          ...prev,
          paciente: paciente,
          pacienteInstruccion: paciente.nivelEducativo || "",
          pacienteOcupacion: paciente.ocupacion || "",
          pacienteEmail: paciente.email || "",
          familiares: mappedFamiliares,
        }));
        
        if (mappedFamiliares.length > 0) {
          setVerConformacionFamiliar(true);
        }
        setShowSelector(false);
      }
    } catch (error) {
      console.error("Error al cargar paciente:", error);
      toast.error("No se pudo cargar el paciente. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isSectionEmpty = (sectionData: any, initialSectionData: any) => {
    if (!sectionData) return true;

    return Object.keys(initialSectionData).every((key) => {
      const v1 = sectionData[key];
      const v2 = initialSectionData[key];

      const normalize = (v: any) => (v === null || v === undefined ? "" : v);

      return normalize(v1) === normalize(v2);
    });
  };

  const loadFicha = async (fichaiId: string) => {
    try {
      setLoading(true);
      const data = await fichasService.obtenerSocioEconomicoPorId(fichaiId);
      
      let fullPaciente = data?.paciente;
      if (data && data.paciente && data.paciente.id) {
        try {
          const pData = await pacientesService.obtenerPorId(data.paciente.id);
          if (pData) {
            fullPaciente = pData;
          }
        } catch (error) {
          console.error("Error al obtener paciente completo:", error);
        }
      }

      const mappedFamiliares = (data.familiares || []).map((f: any) => ({
        ...f,
        salud: {
          problema: f.problemasSalud || false,
          enfermedad: f.descripProblemasSalud || "",

          catastrofica: f.enfermedadCatastrofica || false,
          enfermedadCatastrofica: f.descripEnfermedadCatastrofica || "",

          discapacidad: f.discapacidad || false,
          descripDiscapacidad: f.descripDiscapacidad || "",
        }
      }));

      if (data) {
        if (fullPaciente) {
          setSelectedPatient(fullPaciente);
        }
        const loadedData = {
          ...data,
          paciente: {
            ...initialFichaSocioeconomicaState.paciente,
            ...fullPaciente,
          },
          riesgosFamiliares: {
            ...initialFichaSocioeconomicaState.riesgosFamiliares,
            ...data.riesgosSociales,
          },
          vulnerabilidadesDetalle: {
            ...initialFichaSocioeconomicaState.vulnerabilidadesDetalle,
            ...data.vulnerabilidad,
          },
          dinamicaFamiliar: {
            ...initialFichaSocioeconomicaState.dinamicaFamiliar,
            ...data.dinamicaFamiliar,
          },
          vivienda: {
            ...initialFichaSocioeconomicaState.vivienda,
            ...data.vivienda,
          },
          salud: {
            ...initialFichaSocioeconomicaState.salud,
            ...data.salud,
          },
          situacionEconomica: {
            ...initialFichaSocioeconomicaState.situacionEconomica,
            ...data.situacionEconomica,
            capacidadGastoEvaluacion:
              data.situacionEconomica?.capacidadGastoEvaluacion || "",
          },
          desgloseEconomico: {
            ...initialFichaSocioeconomicaState.desgloseEconomico,
            ...data.desgloseEconomico,
          },
          familiares: mappedFamiliares,
          pacienteInstruccion: data.pacienteInstruccion || fullPaciente?.nivelEducativo || "",
          pacienteOcupacion: data.pacienteOcupacion || fullPaciente?.ocupacion || "",
          pacienteEmail: data.pacienteEmail || fullPaciente?.email || "",
          pacienteNumCarne: data.pacienteNumCarne || "",
          responsable: data.responsable || "",
          conclusiones: data.conclusiones || "",
          recomendaciones: data.recomendaciones || "",
        };
        setFormData((prev) => ({
          ...loadedData,
          especialista: prev.especialista,
        }));

        const hasInformacionPaciente = !isSectionEmpty(
          data.paciente,
          initialFichaSocioeconomicaState.paciente
        );
        const hasConformacionFamiliar =
          data.familiares && data.familiares.length > 0;
        const hasRiesgosFamiliares = !isSectionEmpty(
          data.riesgosSociales,
          initialFichaSocioeconomicaState.riesgosFamiliares
        );
        const hasVulnerabilidades = !isSectionEmpty(
          data.vulnerabilidad,
          initialFichaSocioeconomicaState.vulnerabilidadesDetalle
        );
        const hasDinamicaFamiliar = !isSectionEmpty(
          data.dinamicaFamiliar,
          initialFichaSocioeconomicaState.dinamicaFamiliar
        );
        const hasVivienda = !isSectionEmpty(
          data.vivienda,
          initialFichaSocioeconomicaState.vivienda
        );
        const hasSalud = !isSectionEmpty(
          data.salud,
          initialFichaSocioeconomicaState.salud
        );
        const hasSituacionEconomica = !isSectionEmpty(
          data.situacionEconomica,
          initialFichaSocioeconomicaState.situacionEconomica
        );
        const hasConclusiones = !isSectionEmpty(
          data.conclusiones,
          initialFichaSocioeconomicaState.conclusiones
        );

         if (hasInformacionPaciente) setVerInformacionPaciente(true);
        if (hasConformacionFamiliar) setVerConformacionFamiliar(true);
        if (hasRiesgosFamiliares) setVerRiesgosFamiliares(true);
        if (hasVulnerabilidades) setVerVulnerabilidades(true);
        if (hasDinamicaFamiliar) {
          setVerRelacionFamiliar(true);
          setVerTipoHogar(true);
        }
        if (hasVivienda) setVerVivienda(true);
        if (hasSalud) setVerSalud(true);
        if (hasSituacionEconomica) {
          setVerSituacionEconomica(true);
          setVerTiempoLibre(true);
          setVerCapacidadGasto(true);
        }
        if (hasConclusiones) {
          setVerConclusiones(true);
          setVerRecomendaciones(true);
        }

        if (data.paciente) {
          try {
            const paciente = await pacientesService.obtenerPorId(
              data.paciente.id
            );
            setSelectedPatient(paciente);
          } catch (pError) {
            console.warn(
              "No se pudo cargar el paciente asociado a la ficha:",
              pError
            );
          }
        }
      } else {
        toast.error("No se encontró la ficha socioeconómica.");
        navigate("/fichas?tab=socioeconomico");
      }
    } catch (error) {
      console.error("Error al cargar ficha:", error);
      toast.error("Ocurrió un error al cargar la ficha. Intente de nuevo.");
      navigate("/fichas?tab=socioeconomico");
    } finally {
      setLoading(false);
    }
  };

  const handleNestedChange = (
    section: keyof FichaSocioeconomicaState,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };
  const handleValidateConformacionFamiliar = useCallback(
    (isValid: boolean, errors: string[]) => {
      setValidaciones((prev) => ({
        ...prev,
        conformacionFamiliar: isValid,
      }));
      setErroresSecciones((prev) => ({
        ...prev,
        conformacionFamiliar: errors || [],
      }));
    },
    []
  );
  const handleSubmit = async () => {
    if (!formData.paciente?.id || formData.paciente.id <= 0) {
      toast.error("Debe seleccionar un paciente válido");
      return;
    }

    if (!formData.especialista?.id || formData.especialista.id <= 0) {
      toast.error("No se pudo obtener el especialista válido");
      return;
    }

    // ✅ VALIDAR QUE EL ESPECIALISTA ESTÉ ASIGNADO
    if (!formData.especialista.id) {
      toast.error(
        "No se pudo obtener el especialista. Intente recargar la página."
      );
      return;
    }

    if (!formData.fechaElaboracion) {
      toast.error("Debe establecer la fecha de elaboración");
      return;
    }

    // 1. Conformación Familiar
    if (!formData.familiares || formData.familiares.length === 0) {
      toast.error("Conformación Familiar: Debe registrar al menos un miembro familiar");
      return;
    }
    for (let i = 0; i < formData.familiares.length; i++) {
      const f = formData.familiares[i];
      if (!f.relacion?.trim()) {
        toast.error(`Conformación Familiar: Relación es requerida para el miembro #${i + 1}`);
        return;
      }
      if (!f.nombresApellidos?.trim()) {
        toast.error(`Conformación Familiar: Nombres y apellidos es requerido para el miembro #${i + 1}`);
        return;
      }
      if (!f.edad || f.edad <= 0) {
        toast.error(`Conformación Familiar: Edad es requerida para el miembro #${i + 1}`);
        return;
      }
    }

    // 2. Riesgos Familiares
    const r = formData.riesgosFamiliares;
    if (!r.problemasSociales || r.problemasSociales.trim() === "") {
      toast.error("Riesgos Familiares: Debe seleccionar al menos un problema social");
      return;
    }
    if (r.migroExterior) {
      if (!r.lugarMigracion?.trim()) {
        toast.error("Riesgos Familiares: Lugar de migración es requerido");
        return;
      }
      if (!r.tiempoMigracion?.trim()) {
        toast.error("Riesgos Familiares: Tiempo de migración es requerido");
        return;
      }
      if (!r.afectacionFamiliar?.trim()) {
        toast.error("Riesgos Familiares: Afectación familiar es requerida");
        return;
      }
    }

    // 3. Dinámica Familiar
    const d = formData.dinamicaFamiliar;
    if (!d.resolucionConflictos?.trim()) {
      toast.error("Dinámica Familiar: Resolución de conflictos es requerida");
      return;
    }
    if (!d.cumplenReglas && !d.quienesIncumplenReglas?.trim()) {
      toast.error("Dinámica Familiar: Quiénes no cumplen las reglas es requerido");
      return;
    }
    if (!d.relacionHermanos?.trim()) {
      toast.error("Dinámica Familiar: Relación entre hermanos es requerida");
      return;
    }
    if (!d.relacionPadresHijos?.trim()) {
      toast.error("Dinámica Familiar: Relación entre padres e hijos es requerida");
      return;
    }
    if (!d.comunicacionFamiliar?.trim()) {
      toast.error("Dinámica Familiar: Comunicación familiar es requerida");
      return;
    }

    // 4. Tipo de Hogar
    if (!formData.dinamicaFamiliar.tipoHogar?.trim()) {
      toast.error("Tipo de Hogar: El tipo de hogar es requerido");
      return;
    }

    // 5. Condiciones de Vivienda
    const v = formData.vivienda;
    if (!v.tipoTenencia?.trim()) {
      toast.error("Condiciones de Vivienda: Tipo de tenencia es requerido");
      return;
    }
    if (!v.materialParedes?.trim()) {
      toast.error("Condiciones de Vivienda: Material de paredes es requerido");
      return;
    }
    if (!v.materialPiso?.trim()) {
      toast.error("Condiciones de Vivienda: Material de piso es requerido");
      return;
    }
    if (!v.materialTecho?.trim()) {
      toast.error("Condiciones de Vivienda: Material de techo es requerido");
      return;
    }
    if (v.numeroCuartos === undefined || v.numeroCuartos < 0) {
      toast.error("Condiciones de Vivienda: Número de cuartos es requerido");
      return;
    }
    if (v.numeroDormitorios === undefined || v.numeroDormitorios < 0) {
      toast.error("Condiciones de Vivienda: Número de dormitorios es requerido");
      return;
    }
    if (v.numeroCamas === undefined || v.numeroCamas < 0) {
      toast.error("Condiciones de Vivienda: Número de camas es requerido");
      return;
    }
    if (v.numeroSanitarios === undefined || v.numeroSanitarios < 0) {
      toast.error("Condiciones de Vivienda: Número de sanitarios es requerido");
      return;
    }
    if (!v.tipoSanitario?.trim()) {
      toast.error("Condiciones de Vivienda: Tipo de sanitario es requerido");
      return;
    }
    if (!v.procedenciaAgua?.trim()) {
      toast.error("Condiciones de Vivienda: Procedencia de agua es requerida");
      return;
    }

    // 6. Salud
    if (!formData.salud.lugarAtencionMedica?.trim()) {
      toast.error("Salud: Lugar de atención médica es requerido");
      return;
    }

    // 7. Uso del Tiempo Libre
    if (!formData.situacionEconomica.actividadesTiempoLibre || formData.situacionEconomica.actividadesTiempoLibre === "[]" || formData.situacionEconomica.actividadesTiempoLibre.trim() === "") {
      toast.error("Uso del Tiempo Libre: Debe seleccionar al menos una actividad de tiempo libre");
      return;
    }

    // 8. Situación Económica
    if (!formData.situacionEconomica.condicionEconomica?.trim()) {
      toast.error("Situación Económica: Condición económica es requerida");
      return;
    }
    if (!formData.situacionEconomica.totalEgresos || formData.situacionEconomica.totalEgresos <= 0) {
      toast.error("Situación Económica: Debe registrar los egresos (gastos) familiares y deben ser mayores a 0");
      return;
    }

    // 9. Capacidad de Gasto
    if (!formData.situacionEconomica.capacidadGastoEvaluacion?.trim()) {
      toast.error("Capacidad de Gasto en Evaluación: La capacidad de gasto es requerida");
      return;
    }

    // 10. Conclusiones
    if (!formData.conclusiones || formData.conclusiones.trim() === "") {
      toast.error("Conclusiones: Las conclusiones son requeridas");
      return;
    }

    // 11. Recomendaciones
    if (!formData.recomendaciones || formData.recomendaciones.trim() === "") {
      toast.error("Recomendaciones: Las recomendaciones son requeridas");
      return;
    }

    try {

      setLoading(true);
      if (isEdit && formData.id) {
        const request = buildRequest(formData);
        await fichasService.actualizarSocioEconomico(formData.id, request);
        toast.success("Ficha actualizada exitosamente");
      } else if (isEdit && !formData.id) {
        toast.error("No se encontró la ficha");
        return;
      } else {
        const request = buildRequest(formData);
        await fichasService.crearSocioEconomico(request);
        toast.success("Ficha creada exitosamente");
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/fichas?tab=socioeconomico");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Este paciente ya tiene una ficha activa.");
      } else {
        const serverMessage = error.response?.data?.message;
        toast.error(
          serverMessage ||
            (isEdit ? "Error al actualizar la ficha" : "Error al crear la ficha")
        );
      }
      console.error("Error saving ficha:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient: any) => {
    try {
      setLoading(true);
      let mappedFamiliares: any[] = [];
      try {
        const familiaresResponse = await pacientesService.obtenerFamiliares(patient.id);
        mappedFamiliares = (familiaresResponse || []).map((f: any) => ({
          ...f,
          salud: {
            problema: f.problemasSalud || false,
            enfermedad: f.descripProblemasSalud || "",
            catastrofica: f.enfermedadCatastrofica || false,
            enfermedadCatastrofica: f.descripEnfermedadCatastrofica || "",
            discapacidad: f.discapacidad || false,
            descripDiscapacidad: f.descripDiscapacidad || "",
          }
        }));
      } catch (fError) {
        console.warn("No se pudieron cargar los familiares del paciente:", fError);
      }

      setFormData((prev) => ({
        ...prev,
        paciente: {
          ...prev.paciente,
          ...patient,
        },
        pacienteInstruccion: patient.nivelEducativo || "",
        pacienteOcupacion: patient.ocupacion || "",
        pacienteEmail: patient.email || "",
        familiares: mappedFamiliares,
      }));

      if (mappedFamiliares.length > 0) {
        setVerConformacionFamiliar(true);
      }
      setSelectedPatient(patient);
      setShowSelector(false);
    } catch (error) {
      console.error("Error al seleccionar paciente:", error);
      toast.error("Error al cargar datos del paciente.");
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
        <div className="bg-red-50/20 dark:bg-gray-800 p-4 rounded-3xl flex items-center justify-between border-2 border-brand-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-400 dark:bg-gray-500 rounded-full text-white font-bold dark:text-gray-200">
              <User size={20} />
            </div>

            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">
                {selectedPatient.nombresApellidos}
              </h4>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                CI: {selectedPatient.cedula}
              </p>
            </div>
          </div>

          {!isEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSelector(true)}
            >
              Cambiar Paciente
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* INFORMACION PACIENTE */}
        <SectionHeader
          title="Información del Paciente"
          description="Datos personales y demográficos"
          icon={<User size={24} />}
          isOpen={verInformacionPaciente}
          onToggle={() =>
            setVerInformacionPaciente(!verInformacionPaciente)
          }
        />

        {verInformacionPaciente && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Información del Paciente"
              onHeaderClick={() =>
                setVerInformacionPaciente(!verInformacionPaciente)
              }
              bodyDisabled={!verInformacionPaciente}
            >
              <InformacionPacienteForm
                data={formData.paciente}
                pacienteInstruccion={formData.pacienteInstruccion}
                pacienteOcupacion={formData.pacienteOcupacion}
                pacienteEmail={formData.pacienteEmail}
                responsable={formData.responsable}
                familiares={formData.familiares}
                onChangePaciente={(field, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    [field]: value,
                  }));
                }}
                onChange={(field, value) =>
                  handleNestedChange("paciente", field, value)
                }
              />
            </ComponentCard>
          </div>
        )}

        {/* CONFORMACION FAMILIAR */}
        <SectionHeader
          title="Conformación Familiar"
          description="Información sobre los miembros de la familia"
          icon={<User size={24} />}
          isOpen={verConformacionFamiliar}
          onToggle={() =>
            setVerConformacionFamiliar(!verConformacionFamiliar)
          }
        />

        {verConformacionFamiliar && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Conformación Familiar"
              onHeaderClick={() =>
                setVerConformacionFamiliar(!verConformacionFamiliar)
              }
              bodyDisabled={!verConformacionFamiliar}
            >
              {erroresSecciones.conformacionFamiliar?.length > 0 && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {erroresSecciones.conformacionFamiliar.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <ConformacionFamiliar
                data={formData.familiares}
                onChange={(index, field, value) => {
                  setFormData((prev) => {
                    const updated = [...prev.familiares];

                    updated[index] = {
                      ...updated[index],
                      [field]: value,
                    };

                    return {
                      ...prev,
                      familiares: updated,
                    };
                  });
                }}
                onAdd={() => {
                  setFormData((prev) => ({
                    ...prev,
                    familiares: [
                      ...prev.familiares,
                      {
                        id: null,
                        relacion: "",
                        nombresApellidos: "",
                        edad: 0,
                        estadoCivil: "",
                        instruccion: "",
                        ocupacion: "",
                        ingresoMensual: 0,
                        cedula: "",
                        numeroTelefono: "",
                        correoElectronico: "",
                      },
                    ],
                  }));
                }}
                onRemove={(index) => {
                  setFormData((prev) => ({
                    ...prev,
                    familiares: prev.familiares.filter((_, i) => i !== index),
                  }));
                }}
                onValidate={handleValidateConformacionFamiliar}
              />
            </ComponentCard>
          </div>
        )}

        {/* RIESGOS */}
        <SectionHeader
          title="Riesgos Familiares"
          description="Factores de riesgo presentes en el entorno familiar"
          icon={<MessageSquare size={24} />}
          isOpen={verRiesgosFamiliares}
          onToggle={() =>
            setVerRiesgosFamiliares(!verRiesgosFamiliares)
          }
        />

        {verRiesgosFamiliares && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Riesgos Familiares"
              onHeaderClick={() =>
                setVerRiesgosFamiliares(!verRiesgosFamiliares)
              }
              bodyDisabled={!verRiesgosFamiliares}
            >
              {erroresSecciones.riesgosFamiliares?.length > 0 && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {erroresSecciones.riesgosFamiliares.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <RiesgosFamiliaresForm
                data={
                  formData.riesgosFamiliares ||
                  initialFichaSocioeconomicaState.riesgosFamiliares
                }
                onChange={(field, value) =>
                  handleNestedChange(
                    "riesgosFamiliares",
                    field,
                    value
                  )
                }
                onValidate={(isValid, errors) => {
                  setValidaciones((prev) => {
                    if (prev.riesgosFamiliares === isValid) return prev;
                    return { ...prev, riesgosFamiliares: isValid };
                  });
                  setErroresSecciones((prev) => ({
                    ...prev,
                    riesgosFamiliares: errors || [],
                  }));
                }}
              />
            </ComponentCard>
          </div>
        )}

        {/* VULNERABILIDADES */}
        <SectionHeader
          title="Vulnerabilidades"
          description="Factores de vulnerabilidad presentes en el entorno familiar"
          icon={<MessageSquare size={24} />}
          isOpen={verVulnerabilidades}
          onToggle={() =>
            setVerVulnerabilidades(!verVulnerabilidades)
          }
        />

        {verVulnerabilidades && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Vulnerabilidades"
              onHeaderClick={() =>
                setVerVulnerabilidades(!verVulnerabilidades)
              }
              bodyDisabled={!verVulnerabilidades}
            >
              {erroresSecciones.vulnerabilidades?.length > 0 && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {erroresSecciones.vulnerabilidades.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <VulnerabilidadesForm
                data={formData.vulnerabilidadesDetalle}
                onChange={(field, value) =>
                  handleNestedChange(
                    "vulnerabilidadesDetalle",
                    field,
                    value
                  )
                }
                onValidate={(isValid, errors) => {
                  setValidaciones((prev) => {
                    if (prev.vulnerabilidades === isValid) return prev;
                    return { ...prev, vulnerabilidades: isValid };
                  });
                  setErroresSecciones((prev) => ({
                    ...prev,
                    vulnerabilidades: errors || [],
                  }));
                }}
              />
            </ComponentCard>
          </div>
        )}

        {/* DINAMICA */}
        <SectionHeader
          title="5. Relaciones Familiares"
          description="Relaciones y dinámicas dentro del núcleo familiar"
          icon={<MessageSquare size={24} />}
          isOpen={verRelacionFamiliar}
          onToggle={() =>
            setVerRelacionFamiliar(!verRelacionFamiliar)
          }
        />

        {verRelacionFamiliar && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Relaciones Familiares"
              onHeaderClick={() =>
                setVerRelacionFamiliar(!verRelacionFamiliar)
              }
              bodyDisabled={!verRelacionFamiliar}
            >
              {erroresSecciones.relacionFamiliar?.length > 0 && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {erroresSecciones.relacionFamiliar.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <RelacionFamiliar
                data={formData.dinamicaFamiliar}
                onChange={(field, value) =>
                  handleNestedChange(
                    "dinamicaFamiliar",
                    field,
                    value
                  )
                }
                onValidate={(isValid, errors) => {
                  setValidaciones((prev) => {
                    if (prev.relacionFamiliar === isValid) return prev;
                    return { ...prev, relacionFamiliar: isValid };
                  });
                  setErroresSecciones((prev) => ({
                    ...prev,
                    relacionFamiliar: errors || [],
                  }));
                }}
              />
            </ComponentCard>
          </div>
        )}

        {/* TIPO DE HOGAR */}
        <SectionHeader
          title="6. Tipo de Hogar"
          description="Estructura y funcionalidad familiar"
          icon={<MessageSquare size={24} />}
          isOpen={verTipoHogar}
          onToggle={() => setVerTipoHogar(!verTipoHogar)}
        />
        {verTipoHogar && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Tipo de Hogar"
              onHeaderClick={() => setVerTipoHogar(!verTipoHogar)}
              bodyDisabled={!verTipoHogar}
            >
              {!formData.dinamicaFamiliar.tipoHogar?.trim() && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                    <li>El tipo de hogar es requerido</li>
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Completo", "Incompleto", "Funcional", "Disfuncional"].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="tipoHogar"
                      value={t}
                      checked={formData.dinamicaFamiliar.tipoHogar === t}
                      onChange={() => handleNestedChange("dinamicaFamiliar", "tipoHogar", t)}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{t}</span>
                  </label>
                ))}
              </div>
            </ComponentCard>
          </div>
        )}

        {/* VIVIENDA */}
        <SectionHeader
          title="7. Vivienda y Habitabilidad"
          description="Información sobre las condiciones habitacionales"
          icon={<MessageSquare size={24} />}
          isOpen={verVivienda}
          onToggle={() => setVerVivienda(!verVivienda)}
        />

        {verVivienda && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Vivienda y Habitabilidad"
              onHeaderClick={() =>
                setVerVivienda(!verVivienda)
              }
              bodyDisabled={!verVivienda}
            >
              {erroresSecciones.condicionesVivienda?.length > 0 && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {erroresSecciones.condicionesVivienda.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <CondicionesViviendaForm
                data={formData.vivienda}
                onChange={(field, value) =>
                  handleNestedChange("vivienda", field, value)
                }
                onValidate={(isValid, errors) => {
                  setValidaciones((prev) => {
                    if (prev.condicionesVivienda === isValid) return prev;
                    return { ...prev, condicionesVivienda: isValid };
                  });
                  setErroresSecciones((prev) => ({
                    ...prev,
                    condicionesVivienda: errors || [],
                  }));
                }}
              />
            </ComponentCard>
          </div>
        )}

        {/* SALUD */}
        <SectionHeader
          title="8. Situación de Salud"
          description="Información sobre la salud del paciente y su familia"
          icon={<MessageSquare size={24} />}
          isOpen={verSalud}
          onToggle={() => setVerSalud(!verSalud)}
        />

        {verSalud && (
          <div className="space-y-4">
            {erroresSecciones.salud?.length > 0 && (
              <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                  Campos pendientes:
                </p>
                <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                  {erroresSecciones.salud.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <SaludForm
              data={formData.salud}
              familiares={formData.familiares}
              onChange={(field, value) =>
                handleNestedChange("salud", field, value)
              }
              onChangeFamiliar={(index, field, value) => {
                setFormData((prev) => {
                  const updated = [...prev.familiares];

                  updated[index] = {
                    ...updated[index],
                    salud: {
                      ...updated[index].salud,
                      [field]: value,
                    },
                  };

                  return {
                    ...prev,
                    familiares: updated,
                  };
                });
              }}
              onValidate={(isValid, errors) => {
                setValidaciones((prev) => {
                  if (prev.salud === isValid) return prev;
                  return { ...prev, salud: isValid };
                });
                setErroresSecciones((prev) => ({
                  ...prev,
                  salud: errors || [],
                }));
              }}
            />
          </div>
        )}

        {/* USO DEL TIEMPO LIBRE */}
        <SectionHeader
          title="9. Uso del Tiempo Libre"
          description="Actividades recreativas del estudiante"
          icon={<MessageSquare size={24} />}
          isOpen={verTiempoLibre}
          onToggle={() => setVerTiempoLibre(!verTiempoLibre)}
        />
        {verTiempoLibre && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Uso del Tiempo Libre"
              onHeaderClick={() => setVerTiempoLibre(!verTiempoLibre)}
              bodyDisabled={!verTiempoLibre}
            >
              {(!formData.situacionEconomica.actividadesTiempoLibre || formData.situacionEconomica.actividadesTiempoLibre === "[]" || formData.situacionEconomica.actividadesTiempoLibre.trim() === "") && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                    <li>Debe seleccionar al menos una actividad de tiempo libre</li>
                  </ul>
                </div>
              )}
              {(() => {
                let actividadesSeleccionadas: string[] = [];
                try {
                  actividadesSeleccionadas = formData.situacionEconomica.actividadesTiempoLibre
                    ? JSON.parse(formData.situacionEconomica.actividadesTiempoLibre)
                    : [];
                } catch {
                  actividadesSeleccionadas = [];
                }

                const actividadesBase = [
                  "Deporte",
                  "Música",
                  "TV",
                  "Internet",
                  "Paseos familiares",
                  "Amigos/as",
                ];

                const toggleActividad = (value: string) => {
                  let nuevas = [...actividadesSeleccionadas];
                  if (nuevas.includes(value)) {
                    nuevas = nuevas.filter((a) => a !== value);
                  } else {
                    nuevas.push(value);
                  }
                  handleNestedChange("situacionEconomica", "actividadesTiempoLibre", JSON.stringify(nuevas));
                };

                const toggleEspecial = (prefijo: string, checked: boolean) => {
                  let nuevas = actividadesSeleccionadas.filter((a) => !a.startsWith(prefijo));
                  if (checked) {
                    nuevas.push(`${prefijo}`);
                  }
                  handleNestedChange("situacionEconomica", "actividadesTiempoLibre", JSON.stringify(nuevas));
                };

                const actualizarTextoEspecial = (prefijo: string, valor: string) => {
                  let nuevas = actividadesSeleccionadas.filter((a) => !a.startsWith(prefijo));
                  nuevas.push(`${prefijo}${valor}`);
                  handleNestedChange("situacionEconomica", "actividadesTiempoLibre", JSON.stringify(nuevas));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {actividadesBase.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={actividadesSeleccionadas.includes(item)}
                            onChange={() => toggleActividad(item)}
                          />
                          {item}
                        </label>
                      ))}

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={actividadesSeleccionadas.some((a) => a.startsWith("Trabajo infantil:"))}
                          onChange={(e) => toggleEspecial("Trabajo infantil:", e.target.checked)}
                        />
                        Trabajo infantil
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={actividadesSeleccionadas.some((a) => a.startsWith("Otros:"))}
                          onChange={(e) => toggleEspecial("Otros:", e.target.checked)}
                        />
                        Otros
                      </label>
                    </div>

                    {actividadesSeleccionadas.some((a) => a.startsWith("Trabajo infantil:")) && (
                      <div className="mt-3">
                        <Label>Especifique trabajo infantil</Label>
                        <input
                          type="text"
                          value={actividadesSeleccionadas.find((a) => a.startsWith("Trabajo infantil:"))?.replace("Trabajo infantil:", "") || ""}
                          onChange={(e) => actualizarTextoEspecial("Trabajo infantil:", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-gray-900 dark:border-gray-700 mt-2"
                        />
                      </div>
                    )}

                    {actividadesSeleccionadas.some((a) => a.startsWith("Otros:")) && (
                      <div className="mt-3">
                        <Label>Especifique otros</Label>
                        <input
                          type="text"
                          value={actividadesSeleccionadas.find((a) => a.startsWith("Otros:"))?.replace("Otros:", "") || ""}
                          onChange={(e) => actualizarTextoEspecial("Otros:", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-gray-900 dark:border-gray-700 mt-2"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </ComponentCard>
          </div>
        )}

        {/* SITUACION ECONOMICA */}
        <SectionHeader
          title="10. Situación Económica"
          description="Información sobre ingresos, egresos y condiciones económicas"
          icon={<MessageSquare size={24} />}
          isOpen={verSituacionEconomica}
          onToggle={() =>
            setVerSituacionEconomica(!verSituacionEconomica)
          }
        />
        {verSituacionEconomica && (
          <div className="space-y-4">
            {erroresSecciones.situacionEconomica?.length > 0 && (
              <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                  Campos pendientes:
                </p>
                <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
                  {erroresSecciones.situacionEconomica.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <SituacionEconomicaForm
              data={formData.situacionEconomica}
              desglose={formData.desgloseEconomico}
              familiares={formData.familiares}
              onChange={(field, value) =>
                handleNestedChange("situacionEconomica", field, value)
              }
              onChangeDesglose={(field: string, value: number) =>
                setFormData((prev) => ({
                  ...prev,
                  desgloseEconomico: {
                    ...prev.desgloseEconomico,
                    [field]: value,
                  },
                }))
              }
              onValidate={(isValid, errors) => {
                setValidaciones((prev) => {
                  if (prev.situacionEconomica === isValid) return prev;
                  return { ...prev, situacionEconomica: isValid };
                });
                setErroresSecciones((prev) => ({
                  ...prev,
                  situacionEconomica: errors || [],
                }));
              }}
            />
          </div>
        )}

        {/* CONCLUSIONES */}
        <SectionHeader
          title="11. Conclusiones"
          description="Conclusiones finales de la evaluación"
          icon={<MessageSquare size={24} />}
          isOpen={verConclusiones}
          onToggle={() =>
            setVerConclusiones(!verConclusiones)
          }
        />
        {verConclusiones && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Conclusiones"
              onHeaderClick={() => setVerConclusiones(!verConclusiones)}
              bodyDisabled={!verConclusiones}
            >
              {!formData.conclusiones?.trim() && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                    <li>Las conclusiones son requeridas</li>
                  </ul>
                </div>
              )}
              <textarea
                value={formData.conclusiones}
                onChange={(e) => setFormData((prev) => ({ ...prev, conclusiones: e.target.value }))}
                placeholder="Ingrese las conclusiones de la evaluación"
                className="w-full min-h-[120px] p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900"
              />
            </ComponentCard>
          </div>
        )}

        {/* RECOMENDACIONES */}
        <SectionHeader
          title="12. Recomendaciones"
          description="Recomendaciones sugeridas"
          icon={<MessageSquare size={24} />}
          isOpen={verRecomendaciones}
          onToggle={() =>
            setVerRecomendaciones(!verRecomendaciones)
          }
        />
        {verRecomendaciones && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Recomendaciones"
              onHeaderClick={() => setVerRecomendaciones(!verRecomendaciones)}
              bodyDisabled={!verRecomendaciones}
            >
              {!formData.recomendaciones?.trim() && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                    <li>Las recomendaciones son requeridas</li>
                  </ul>
                </div>
              )}
              <textarea
                value={formData.recomendaciones}
                onChange={(e) => setFormData((prev) => ({ ...prev, recomendaciones: e.target.value }))}
                placeholder="Ingrese las recomendaciones sugeridas"
                className="w-full min-h-[120px] p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900"
              />
            </ComponentCard>
          </div>
        )}

        {/* CAPACIDAD DE GASTO */}
        <SectionHeader
          title="13. Capacidad de Gasto en Evaluación"
          description="Hasta cuánto podría gastar en una evaluación psicopedagógica"
          icon={<MessageSquare size={24} />}
          isOpen={verCapacidadGasto}
          onToggle={() => setVerCapacidadGasto(!verCapacidadGasto)}
        />
        {verCapacidadGasto && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Capacidad de Gasto"
              onHeaderClick={() => setVerCapacidadGasto(!verCapacidadGasto)}
              bodyDisabled={!verCapacidadGasto}
            >
              {!formData.situacionEconomica.capacidadGastoEvaluacion?.trim() && (
                <div className="p-3 px-4 mb-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                    Campos pendientes:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
                    <li>La capacidad de gasto es requerida</li>
                  </ul>
                </div>
              )}
              <div className="space-y-3">
                {[
                  { label: "3$ por sesión", value: "3" },
                  { label: "5$ por sesión", value: "5" },
                  { label: "10$ por sesión", value: "10" },
                  { label: "15$ por sesión", value: "15" },
                  { label: "No puedo cubrir los gastos", value: "NO" },
                ].map((op) => (
                  <label key={op.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <input
                      type="radio"
                      name="capacidadGasto"
                      value={op.value}
                      checked={formData.situacionEconomica.capacidadGastoEvaluacion?.startsWith(op.value)}
                      onChange={() => handleNestedChange("situacionEconomica", "capacidadGastoEvaluacion", op.label)}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{op.label}</span>
                  </label>
                ))}

                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <input
                    type="radio"
                    name="capacidadGasto"
                    value="OTRO"
                    checked={formData.situacionEconomica.capacidadGastoEvaluacion?.startsWith("OTRO")}
                    onChange={() => handleNestedChange("situacionEconomica", "capacidadGastoEvaluacion", "OTRO")}
                  />
                  <span className="text-gray-700 dark:text-gray-300">Otros:</span>
                  <input
                    type="text"
                    placeholder="Especifique..."
                    disabled={!formData.situacionEconomica.capacidadGastoEvaluacion?.startsWith("OTRO")}
                    value={formData.situacionEconomica.capacidadGastoEvaluacion?.startsWith("OTRO:") ? formData.situacionEconomica.capacidadGastoEvaluacion.replace("OTRO:", "").trim() : ""}
                    onChange={(e) => handleNestedChange("situacionEconomica", "capacidadGastoEvaluacion", "OTRO: " + e.target.value)}
                    className="px-2 py-1 border rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </ComponentCard>
          </div>
        )}

        {/* RESPONSABLE DE LA INFORMACION */}
        <SectionHeader
          title="14. Responsable de la Información"
          description="Familiar responsable de proporcionar la información"
          icon={<User size={24} />}
          isOpen={verResponsableSeccion}
          onToggle={() => setVerResponsableSeccion(!verResponsableSeccion)}
        />
        {verResponsableSeccion && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ComponentCard
              title="Responsable de la Información (Familiar)"
              onHeaderClick={() => setVerResponsableSeccion(!verResponsableSeccion)}
              bodyDisabled={!verResponsableSeccion}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsable de la Información (Familiar)
                  </label>
                  <select
                    value={formData.familiares?.some(f => `${f.nombresApellidos} (${f.relacion})` === formData.responsable) ? formData.responsable : ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, responsable: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Seleccionar de la lista de familiares...</option>
                    {formData.familiares?.map((f, i) => (
                      <option key={i} value={`${f.nombresApellidos} (${f.relacion})`}>
                        {f.nombresApellidos} ({f.relacion})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre / Relación del Responsable
                  </label>
                  <Input
                    value={formData.responsable}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, responsable: e.target.value }))}
                    placeholder="Escriba nombre y relación (Ej: Juan Pérez (Padre))"
                  />
                </div>
              </div>
            </ComponentCard>
          </div>
        )}

        {/* BOTONES */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : id
                ? "Actualizar Ficha"
                : "Guardar Ficha"}
          </Button>
        </div>
      </div>
    </div>
  );
}