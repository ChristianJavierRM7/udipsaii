import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import { informesService, InformeRequest } from "../../../services/informes";
import { fichasService } from "../../../services/fichas";
import {
  especialistasService,
  EspecialistaDTO,
} from "../../../services/especialistas";

type FormState = Omit<InformeRequest, "pacienteId"> & {
  parentescoOtro: string;
};

interface CampoProps {
  label: string;
  name: keyof FormState;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function Campo({
  label,
  name,
  type = "text",
  value,
  onChange,
}: CampoProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        name={String(name)}
        value={value}
        onChange={onChange}
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none placeholder:text-gray-400 focus:border-brand-300 dark:border-gray-700 dark:text-white/90"
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

function SelectCampo({
  label,
  name,
  value,
  onChange,
  options,
}: SelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        name={String(name)}
        value={value}
        onChange={onChange}
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-300 dark:border-gray-700 dark:text-white/90"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-black">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface AreaTextoProps {
  label?: string;
  name: keyof FormState;
  filas?: number;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

function AreaTexto({
  label,
  name,
  filas = 4,
  value,
  onChange,
}: AreaTextoProps) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        name={String(name)}
        rows={filas}
        value={value}
        onChange={onChange}
        className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs outline-none placeholder:text-gray-400 focus:border-brand-300 dark:border-gray-700 dark:text-white/90"
      />
    </div>
  );
}

interface BuscadorEspecialistaProps {
  label: string;
  value: string;
  options: EspecialistaDTO[];
  onSelect: (nombre: string) => void;
}

function normalizar(texto?: string) {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function obtenerTexto(objeto: Record<string, unknown>, clave: string) {
  const valor = objeto[clave];
  return typeof valor === "string" ? valor.trim() : "";
}

function cerrarOracion(texto: string) {
  const limpio = texto.trim();
  if (!limpio) return "";
  return /[.!?]$/.test(limpio) ? limpio : `${limpio}.`;
}

function etiquetaDesdeClave(clave: string) {
  const especiales: Record<string, string> = {
    anamnesisFamiliar: "Anamnesis familiar",
    anamnesisPersonal: "Anamnesis personal",
    personal: "Anamnesis personal",
    momentosEvolutivosEnElDesarrollo: "Momentos evolutivos en el desarrollo",
    momentosEvolutivosDesarrollo: "Momentos evolutivos en el desarrollo",
    habitosEnLaOralidad: "Hábitos en la oralidad",
    inicioHorarioSueno: "Inicio horario de sueño",
    finHorarioSueno: "Fin horario de sueño",
    tipoHorarioSueno: "Tipo horario de sueño",
    companiaEnSueno: "Compañía en el sueño",
    hipersomnia: "Hipersomnia",
    dificultadConciliarSueno: "Dificultad de conciliar el sueño",
    dificultadDeConciliarElSueno: "Dificultad de conciliar el sueño",
    despertarFrecuente: "Despertar frecuente",
    despertarPrematuro: "Despertar prematuro",
    sonambulismo: "Sonambulismo",
    observacionesHabitosSueno: "Observaciones hábitos de sueño",
    cuidadoPersonal: "Cuidado personal",
    otrasConductasPreocupantes: "Otras conductas preocupantes",
    observacionesConductasPreocupantes: "Observaciones conductas preocupantes",
    sexoNacimiento: "Sexo de nacimiento",
    orientacionSexual: "Orientación sexual",
    gradoInformacion: "Grado de información",
    actividadSexual: "Actividad sexual",
    curiosidadSexual: "Curiosidad sexual",
    masturbacion: "Masturbación",
    promiscuidad: "Promiscuidad",
    disfunciones: "Disfunciones",
    erotismo: "Erotismo",
    parafilias: "Parafilias",
    observacionesAspectoPsicosexual: "Observaciones aspecto psicosexual",
    observacionesGuiaObservacion: "Observaciones guía de observación",
    relacionConGrupo: "Relación con el grupo",
    causaRelacionConGrupo: "Causa de la relación con el grupo",
    relacionDocentes: "Relación con docentes",
    causaRelacionDocentes: "Causa de la relación con docentes",
  };

  if (especiales[clave]) return especiales[clave];

  return clave
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letra) => letra.toUpperCase())
    .trim();
}

function textoValor(valor: unknown) {
  if (typeof valor === "string") return valor.trim();
  if (typeof valor === "number") return String(valor);
  if (typeof valor === "boolean") return valor ? "Sí" : "";
  return "";
}

function seccionDesdeRutas(
  fuente: Record<string, unknown>,
  rutas: string[]
): Record<string, unknown> | null {
  for (const ruta of rutas) {
    const partes = ruta.split(".");
    let actual: unknown = fuente;

    for (const parte of partes) {
      if (!esObjeto(actual)) {
        actual = null;
        break;
      }

      actual = actual[parte];
    }

    if (esObjeto(actual)) return actual;
  }

  return null;
}

function resumenObjetoPorCampos(
  objeto: Record<string, unknown>,
  campos: string[],
  opciones?: {
    soloVerdaderos?: boolean;
    etiquetas?: Record<string, string>;
  }
) {
  const valores: string[] = [];

  campos.forEach((campo) => {
    const valor = objeto[campo];

    if (valor === undefined || valor === null || valor === "") return;

    const etiqueta = opciones?.etiquetas?.[campo] ?? etiquetaDesdeClave(campo);

    if (typeof valor === "boolean") {
      if (valor) valores.push(etiqueta);
      return;
    }

    if (opciones?.soloVerdaderos) return;

    const texto = textoValor(valor);

    if (texto) valores.push(`${etiqueta}: ${texto}`);
  });

  return valores;
}

function resumenGenericoDeObjeto(
  objeto: Record<string, unknown>,
  ignorarCampos: string[] = []
) {
  const ignorar = new Set(ignorarCampos);
  const valores: string[] = [];

  Object.entries(objeto).forEach(([clave, valor]) => {
    if (ignorar.has(clave)) return;
    if (clave.toLowerCase().includes("id")) return;
    if (clave.toLowerCase().includes("paciente")) return;
    if (clave.toLowerCase().includes("created")) return;
    if (clave.toLowerCase().includes("updated")) return;

    if (typeof valor === "boolean") {
      if (valor) valores.push(etiquetaDesdeClave(clave));
      return;
    }

    if (typeof valor === "string" || typeof valor === "number") {
      const texto = textoValor(valor);
      if (texto && texto !== "0") {
        valores.push(`${etiquetaDesdeClave(clave)}: ${texto}`);
      }
      return;
    }
  });

  return valores;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function unirConY(partes: string[]) {
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return `${partes[0]} y ${partes[1]}`;
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

function formatearFechaCorta(fechaIso: string) {
  const [anio, mes, dia] = fechaIso.split("-");
  if (!anio || !mes || !dia) return fechaIso;
  return `${dia}/${mes}/${anio}`;
}

function formatearFechasEvaluacion(fechasIso: string[]) {
  const fechasOrdenadas = Array.from(new Set(fechasIso))
    .filter((fecha) => /^\d{4}-\d{2}-\d{2}$/.test(fecha))
    .sort();

  if (fechasOrdenadas.length === 0) return "";

  const grupos = new Map<
    string,
    { anio: string; mesNumero: number; mesNombre: string; dias: string[] }
  >();

  fechasOrdenadas.forEach((fecha) => {
    const [anio, mes, dia] = fecha.split("-");
    const mesNumero = Number(mes);
    const clave = `${anio}-${mes}`;

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        anio,
        mesNumero,
        mesNombre: MESES[mesNumero - 1] ?? mes,
        dias: [],
      });
    }

    grupos.get(clave)?.dias.push(dia);
  });

  const gruposOrdenados = Array.from(grupos.values()).sort((a, b) => {
    if (a.anio !== b.anio) return Number(a.anio) - Number(b.anio);
    return a.mesNumero - b.mesNumero;
  });

  const mismoAnio = gruposOrdenados.every(
    (grupo) => grupo.anio === gruposOrdenados[0].anio
  );

  return gruposOrdenados
    .map((grupo, index) => {
      const dias = unirConY(grupo.dias);
      const textoBase = `${dias} de ${grupo.mesNombre}`;
      const debeMostrarAnio = !mismoAnio || index === gruposOrdenados.length - 1;
      return debeMostrarAnio ? `${textoBase} de ${grupo.anio}` : textoBase;
    })
    .join(", ");
}

function BuscadorEspecialista({
  label,
  value,
  options,
  onSelect,
}: BuscadorEspecialistaProps) {
  const [abierto, setAbierto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtrados = useMemo(() => {
    const criterio = normalizar(value);
    return options
      .filter((esp) => {
        if (!criterio) return true;
        return (
          normalizar(esp.nombresApellidos).includes(criterio) ||
          normalizar(esp.cedula).includes(criterio)
        );
      })
      .slice(0, 8);
  }, [options, value]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onFocus={() => setAbierto(true)}
        onChange={(e) => {
          onSelect(e.target.value);
          setAbierto(true);
        }}
        placeholder="Buscar por nombre o cédula"
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none placeholder:text-gray-400 focus:border-brand-300 dark:border-gray-700 dark:text-white/90"
      />

      {abierto && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {filtrados.length > 0 ? (
            filtrados.map((esp) => (
              <button
                type="button"
                key={esp.id}
                onClick={() => {
                  onSelect(esp.nombresApellidos);
                  setAbierto(false);
                }}
                className="block w-full border-b border-gray-100 px-4 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <span className="block font-medium text-gray-800 dark:text-white/90">
                  {esp.nombresApellidos}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {esp.cedula} — {esp.especialidad?.area ?? "Sin especialidad"}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron especialistas
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const COORDINADORA_DEFAULT = "Lcda. Gabriela Jara S., Mgtr.";

const PARENTESCOS = [
  { value: "", label: "Seleccione" },
  { value: "Padre", label: "Padre" },
  { value: "Madre", label: "Madre" },
  { value: "Abuelo", label: "Abuelo" },
  { value: "Abuela", label: "Abuela" },
  { value: "Tío", label: "Tío" },
  { value: "Tía", label: "Tía" },
  { value: "Hermano", label: "Hermano" },
  { value: "Hermana", label: "Hermana" },
  { value: "Tutor legal", label: "Tutor legal" },
  { value: "Otro", label: "Otro (especificar)" },
];

function extraerDatosRepresentante(historia: unknown) {
  if (!esObjeto(historia)) {
    return {
      representante: "",
      parentesco: "",
      motivoConsulta: "",
    };
  }

  const informacionGeneral = historia.informacionGeneral;

  if (esObjeto(informacionGeneral)) {
    const representante =
      obtenerTexto(informacionGeneral, "fuenteDeInformacion") ||
      obtenerTexto(informacionGeneral, "fuenteInformacion") ||
      obtenerTexto(informacionGeneral, "representante");

    const parentesco = obtenerTexto(informacionGeneral, "parentesco");

    const motivoConsulta =
      obtenerTexto(informacionGeneral, "motivoConsulta") ||
      obtenerTexto(informacionGeneral, "motivoDeConsulta");

    return {
      representante,
      parentesco,
      motivoConsulta,
    };
  }

  return {
    representante:
      obtenerTexto(historia, "fuenteDeInformacion") ||
      obtenerTexto(historia, "fuenteInformacion") ||
      obtenerTexto(historia, "representante"),
    parentesco: obtenerTexto(historia, "parentesco"),
    motivoConsulta:
      obtenerTexto(historia, "motivoConsulta") ||
      obtenerTexto(historia, "motivoDeConsulta"),
  };
}

function resolverParentescoParaFormulario(parentescoHistoria: string) {
  const parentescoLimpio = parentescoHistoria.trim();

  if (!parentescoLimpio) {
    return {
      parentesco: "",
      parentescoOtro: "",
    };
  }

  const opcionEncontrada = PARENTESCOS.find(
    (opcion) => normalizar(opcion.value) === normalizar(parentescoLimpio)
  );

  if (opcionEncontrada) {
    return {
      parentesco: opcionEncontrada.value,
      parentescoOtro: "",
    };
  }

  return {
    parentesco: "Otro",
    parentescoOtro: parentescoLimpio,
  };
}

function construirResumenHistoriaEscolar(fichaEducativa: unknown) {
  if (!esObjeto(fichaEducativa)) return "";

  const historiaEscolar = fichaEducativa.historiaEscolar;
  const desarrollo = fichaEducativa.desarrollo;
  const adaptacion = fichaEducativa.adaptacion;
  const estadoGeneral = fichaEducativa.estadoGeneral;

  const partes: string[] = [];

  /**
   * HISTORIA ESCOLAR
   */
  if (esObjeto(historiaEscolar)) {
    const asignaturasGustan = obtenerTexto(historiaEscolar, "asignaturasGustan");
    const asignaturasDisgustan = obtenerTexto(
      historiaEscolar,
      "asignaturasDisgustan"
    );
    const relacionDocentes = obtenerTexto(historiaEscolar, "relacionDocentes");
    const causaRelacionDocentes = obtenerTexto(
      historiaEscolar,
      "causaRelacionDocentes"
    );
    const causaGustaIrInstitucion = obtenerTexto(
      historiaEscolar,
      "causaGustaIrInstitucion"
    );
    const relacionConGrupo = obtenerTexto(historiaEscolar, "relacionConGrupo");
    const causaRelacionConGrupo = obtenerTexto(
      historiaEscolar,
      "causaRelacionConGrupo"
    );

    if (asignaturasGustan) {
      partes.push(
        cerrarOracion(`Asignaturas que le gustan: ${asignaturasGustan}`)
      );
    }

    if (asignaturasDisgustan) {
      partes.push(
        cerrarOracion(`Asignaturas que no le gustan: ${asignaturasDisgustan}`)
      );
    }

    if (relacionDocentes || causaRelacionDocentes) {
      partes.push(
        cerrarOracion(
          [
            relacionDocentes
              ? `Relación con docentes: ${relacionDocentes}`
              : "",
            causaRelacionDocentes
              ? `Causa: ${causaRelacionDocentes}`
              : "",
          ]
            .filter(Boolean)
            .join(". ")
        )
      );
    }

    if (typeof historiaEscolar.gustaIrInstitucion === "boolean") {
      const texto = historiaEscolar.gustaIrInstitucion
        ? "Le gusta asistir a la institución"
        : "No le gusta asistir a la institución";

      const completo = causaGustaIrInstitucion
        ? `${texto}. Causa: ${causaGustaIrInstitucion}`
        : texto;

      partes.push(cerrarOracion(completo));
    }

    if (relacionConGrupo || causaRelacionConGrupo) {
      partes.push(
        cerrarOracion(
          [
            relacionConGrupo
              ? `Relación con el grupo: ${relacionConGrupo}`
              : "",
            causaRelacionConGrupo
              ? `Causa: ${causaRelacionConGrupo}`
              : "",
          ]
            .filter(Boolean)
            .join(". ")
        )
      );
    }
  }

  /**
   * DESARROLLO ESCOLAR
   */
  if (esObjeto(desarrollo)) {
    const lineas: string[] = [];

    const problemasAprendizaje = desarrollo.problemasAprendizaje;
    const detalleProblemas = obtenerTexto(
      desarrollo,
      "problemasAprendizajeEspecificar"
    );

    if (typeof problemasAprendizaje === "boolean") {
      lineas.push(
        problemasAprendizaje
          ? "Presenta dificultades de aprendizaje."
          : "No se reportan dificultades de aprendizaje."
      );
    }

    if (detalleProblemas) {
      lineas.push(
        `Detalle de dificultades de aprendizaje: ${cerrarOracion(detalleProblemas)}`
      );
    }

    if (desarrollo.perdidaAnio) {
      const causa = obtenerTexto(desarrollo, "gradoCausaPerdidaAnio");
      lineas.push(
        cerrarOracion(
          `Ha presentado pérdida de año${causa ? `. Detalle: ${causa}` : ""}`
        )
      );
    }

    if (desarrollo.desercionEscolar) {
      const causa = obtenerTexto(desarrollo, "gradoCausaDesercionEscolar");
      lineas.push(
        cerrarOracion(
          `Antecedente de deserción escolar${causa ? `. Detalle: ${causa}` : ""}`
        )
      );
    }

    if (desarrollo.cambioInstitucion) {
      const causa = obtenerTexto(desarrollo, "gradoCausaCambioInstitucion");
      lineas.push(
        cerrarOracion(
          `Ha existido cambio de institución educativa${
            causa ? `. Motivo: ${causa}` : ""
          }`
        )
      );
    }

    partes.push(...lineas);
  }

  /**
   * NECESIDADES Y APOYO / ADAPTACIONES
   */
  if (esObjeto(adaptacion)) {
    const lineas: string[] = [];

    if (adaptacion.inclusionEducativa) {
      const causa = obtenerTexto(adaptacion, "causaInclusionEducativa");

      lineas.push(
        cerrarOracion(
          `Recibe inclusión educativa${
            causa ? `. Motivo: ${causa}` : ""
          }`
        )
      );
    }

    if (adaptacion.adaptacionesCurriculares) {
      const grado = obtenerTexto(adaptacion, "gradoAdaptacion");
      const asignaturas = obtenerTexto(adaptacion, "especifiqueAsignaturas");

      lineas.push(
        cerrarOracion(
          `Presenta adaptaciones curriculares${
            grado ? ` de grado ${grado}` : ""
          }${asignaturas ? `. En asignaturas: ${asignaturas}` : ""}`
        )
      );
    }

    if (adaptacion.evaluacionPsicologicaUOtrosAnterior) {
      const detalle = obtenerTexto(
        adaptacion,
        "causaEvaluacionPsicologicaUOtrosAnterior"
      );

      lineas.push(
        cerrarOracion(
          `Cuenta con evaluación psicológica o apoyo previo${
            detalle ? `. ${detalle}` : ""
          }`
        )
      );
    }

    if (adaptacion.recibeApoyo) {
      const detalle = obtenerTexto(
        adaptacion,
        "causaLugarTiempoRecibeApoyo"
      );

      lineas.push(
        cerrarOracion(
          `Actualmente recibe apoyo${
            detalle ? `. ${detalle}` : ""
          }`
        )
      );
    }

    partes.push(...lineas);
  }

  /**
   * ESTADO GENERAL
   */
  if (esObjeto(estadoGeneral)) {
    const aprovechamiento = obtenerTexto(
      estadoGeneral,
      "aprovechamientoGeneral"
    );

    const actividad = obtenerTexto(
      estadoGeneral,
      "actividadEscolar"
    );

    const observaciones = obtenerTexto(
      estadoGeneral,
      "observaciones"
    );

    if (aprovechamiento) {
      partes.push(
        cerrarOracion(
          `Aprovechamiento general: ${aprovechamiento}`
        )
      );
    }

    if (actividad) {
      partes.push(
        cerrarOracion(
          `Actividad escolar: ${actividad}`
        )
      );
    }

    if (observaciones) {
      partes.push(
        cerrarOracion(
          `Observaciones generales: ${observaciones}`
        )
      );
    }
  }

  return partes.join("\n");
}

function agregarBloqueResumen(
  bloques: string[],
  titulo: string,
  lineas: string[]
) {
  const lineasLimpias = lineas
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (lineasLimpias.length === 0) return;

  bloques.push(`${titulo}\n${lineasLimpias.map((linea) => `- ${linea}`).join("\n")}`);
}

function valoresBooleanos(
  objeto: Record<string, unknown>,
  campos: string[],
  etiquetas?: Record<string, string>
) {
  return resumenObjetoPorCampos(objeto, campos, {
    soloVerdaderos: true,
    etiquetas,
  });
}

function construirResumenHistoriaYHabitos(fichaClinica: unknown) {
  if (!esObjeto(fichaClinica)) return "";

  const bloques: string[] = [];

  const anamnesis = seccionDesdeRutas(fichaClinica, [
    "anamnesis",
    "historiaHabitos.anamnesis",
    "historiaYHabitos.anamnesis",
  ]);

  if (anamnesis) {
    const lineas: string[] = [];

    const familiar =
      obtenerTexto(anamnesis, "anamnesisFamiliar") ||
      obtenerTexto(anamnesis, "familiar");

    const personal =
      obtenerTexto(anamnesis, "anamnesisPersonal") ||
      obtenerTexto(anamnesis, "personal");

    const momentos =
      obtenerTexto(anamnesis, "momentosEvolutivosEnElDesarrollo") ||
      obtenerTexto(anamnesis, "momentosEvolutivosDesarrollo");

    const oralidad = obtenerTexto(anamnesis, "habitosEnLaOralidad");

    if (familiar) lineas.push(`Anamnesis familiar: ${cerrarOracion(familiar)}`);
    if (personal) lineas.push(`Anamnesis personal: ${cerrarOracion(personal)}`);

    if (momentos) {
      lineas.push(
        `Momentos evolutivos en el desarrollo: ${cerrarOracion(momentos)}`
      );
    }

    if (oralidad) {
      lineas.push(`Hábitos en la oralidad: ${cerrarOracion(oralidad)}`);
    }

    agregarBloqueResumen(bloques, "ANAMNESIS", lineas);
  }

  const sueno = seccionDesdeRutas(fichaClinica, [
    "sueno",
    "sueño",
    "habitosSueno",
    "historiaHabitos.sueno",
    "historiaYHabitos.sueno",
  ]);

  if (sueno) {
    const lineas: string[] = [];

    const inicioHorario = obtenerTexto(sueno, "inicioHorarioSueno");
    const finHorario = obtenerTexto(sueno, "finHorarioSueno");
    const tipo = obtenerTexto(sueno, "tipoHorarioSueno");
    const compania = obtenerTexto(sueno, "companiaEnSueno");
    const edad = obtenerTexto(sueno, "edad");
    const observaciones = obtenerTexto(sueno, "observacionesHabitosSueno");

    if (inicioHorario || finHorario) {
      lineas.push(
        `Horario de sueño: ${inicioHorario || "no registrado"} a ${finHorario || "no registrado"}.`
      );
    }

    if (tipo) lineas.push(`Tipo de horario de sueño: ${tipo}.`);
    if (compania) lineas.push(`Compañía en el sueño: ${compania}.`);

    if (edad && edad !== "0") {
      lineas.push(`Edad relacionada con hábitos de sueño: ${edad}.`);
    }

    const alteraciones = valoresBooleanos(sueno, [
      "hipersomnia",
      "dificultadConciliarSueno",
      "dificultadDeConciliarElSueno",
      "despertarFrecuente",
      "despertarPrematuro",
      "sonambulismo",
    ]);

    if (alteraciones.length > 0) {
      lineas.push(`Alteraciones del sueño observadas: ${alteraciones.join(", ")}.`);
    }

    if (observaciones) {
      lineas.push(`Observaciones: ${cerrarOracion(observaciones)}`);
    }

    agregarBloqueResumen(bloques, "HÁBITOS DE SUEÑO", lineas);
  }

  const conducta = seccionDesdeRutas(fichaClinica, [
    "conducta",
    "conductas",
    "historiaHabitos.conducta",
    "historiaYHabitos.conducta",
  ]);

  if (conducta) {
    const lineas: string[] = [];

    const indicadores = valoresBooleanos(conducta, [
      "temores",
      "nerviosismo",
      "egocentrismo",
      "tics",
      "mentira",
      "destructividad",
      "irritabilidad",
      "regresiones",
      "hurto",
      "cuidadoPersonal",
    ]);

    const otras = obtenerTexto(conducta, "otrasConductasPreocupantes");
    const observaciones = obtenerTexto(
      conducta,
      "observacionesConductasPreocupantes"
    );

    if (indicadores.length > 0) {
      lineas.push(`Indicadores conductuales presentes: ${indicadores.join(", ")}.`);
    }

    if (otras) {
      lineas.push(`Otras conductas preocupantes: ${cerrarOracion(otras)}`);
    }

    if (observaciones) {
      lineas.push(`Observaciones: ${cerrarOracion(observaciones)}`);
    }

    agregarBloqueResumen(bloques, "CONDUCTA", lineas);
  }

  return bloques.join("\n\n");
}

function construirResumenObservacionPsicologica(fichaClinica: unknown) {
  if (!esObjeto(fichaClinica)) return "";

  const bloques: string[] = [];

  const cognitiva = seccionDesdeRutas(fichaClinica, [
    "evaluacionCognitiva",
    "evaluacionPsicologica.evaluacionCognitiva",
    "evaluacionPsicologica.cognitiva",
  ]);

  if (cognitiva) {
    const lineas: string[] = [];

    const estadoConciencia = seccionDesdeRutas(cognitiva, ["estadoConciencia"]);
    const atencion = seccionDesdeRutas(cognitiva, ["atencion"]);
    const sensopercepcion = seccionDesdeRutas(cognitiva, [
      "sensopercepcion",
      "sensoPercepcion",
    ]);
    const memoria = seccionDesdeRutas(cognitiva, ["memoria"]);
    const orientacion = seccionDesdeRutas(cognitiva, [
      "orientacion",
      "orientacionDesorientacion",
    ]);

    if (estadoConciencia) {
      const valores = resumenGenericoDeObjeto(estadoConciencia);
      if (valores.length > 0) {
        lineas.push(`Estado de conciencia: ${valores.join(", ")}.`);
      }
    }

    if (atencion) {
      const valores = resumenGenericoDeObjeto(atencion);
      if (valores.length > 0) lineas.push(`Atención: ${valores.join(", ")}.`);
    }

    if (sensopercepcion) {
      const valores = resumenGenericoDeObjeto(sensopercepcion);
      if (valores.length > 0) {
        lineas.push(`Sensopercepción: ${valores.join(", ")}.`);
      }
    }

    if (memoria) {
      const valores = resumenGenericoDeObjeto(memoria);
      if (valores.length > 0) lineas.push(`Memoria: ${valores.join(", ")}.`);
    }

    if (orientacion) {
      const valores = resumenGenericoDeObjeto(orientacion);
      if (valores.length > 0) {
        lineas.push(`Orientación: ${valores.join(", ")}.`);
      }
    }

    const valoresDirectos = resumenGenericoDeObjeto(cognitiva, [
      "estadoConciencia",
      "atencion",
      "sensopercepcion",
      "sensoPercepcion",
      "memoria",
      "orientacion",
      "orientacionDesorientacion",
    ]);

    if (valoresDirectos.length > 0) {
      lineas.push(`Otros indicadores cognitivos: ${valoresDirectos.join(", ")}.`);
    }

    agregarBloqueResumen(bloques, "EVALUACIÓN COGNITIVA", lineas);
  }

  const afectiva = seccionDesdeRutas(fichaClinica, [
    "evaluacionAfectiva",
    "evaluacionPsicologica.evaluacionAfectiva",
    "evaluacionPsicologica.afectiva",
  ]);

  if (afectiva) {
    const indicadores = valoresBooleanos(afectiva, [
      "altaSensibilidad",
      "solidaridad",
      "ansiedadSituacional",
      "perdidaRecienteInteres",
      "aplanamiento",
      "tenacidad",
      "disociacionIdeoAfectiva",
      "agresividad",
      "generosidad",
      "timidez",
      "desesperacion",
      "ambivalencia",
      "incontinencia",
      "anhedonia",
      "sumision",
      "afectuoso",
      "ansiedadExpectante",
      "euforia",
      "irritabilidad",
      "sentimientosInadecuados",
      "rabietas",
      "angustia",
      "depresion",
      "indiferencia",
      "labilidad",
      "neotimia",
    ]);

    agregarBloqueResumen(
      bloques,
      "EVALUACIÓN AFECTIVA",
      indicadores.length > 0
        ? [`Indicadores presentes: ${indicadores.join(", ")}.`]
        : []
    );
  }

  const pensamiento = seccionDesdeRutas(fichaClinica, [
    "evaluacionPensamiento",
    "evaluacionPsicologica.evaluacionPensamiento",
    "evaluacionPsicologica.pensamiento",
  ]);

  if (pensamiento) {
    const lineas: string[] = [];

    const estructura = seccionDesdeRutas(pensamiento, ["estructuraPensamiento"]);
    const curso = seccionDesdeRutas(pensamiento, ["cursoPensamiento"]);
    const contenido = seccionDesdeRutas(pensamiento, ["contenidoPensamiento"]);

    if (estructura) {
      const valores = resumenGenericoDeObjeto(estructura);
      if (valores.length > 0) {
        lineas.push(`Estructura del pensamiento: ${valores.join(", ")}.`);
      }
    }

    if (curso) {
      const valores = resumenGenericoDeObjeto(curso);
      if (valores.length > 0) {
        lineas.push(`Curso del pensamiento: ${valores.join(", ")}.`);
      }
    }

    if (contenido) {
      const valores = resumenGenericoDeObjeto(contenido);
      if (valores.length > 0) {
        lineas.push(`Contenido del pensamiento: ${valores.join(", ")}.`);
      }
    }

    const camposPensamiento = [
      "incoherencia",
      "bloqueos",
      "preservacion",
      "disgregacion",
      "estereotipiasEstructuraDelPensamiento",
      "neologismos",
      "musitacion",
      "retardo",
      "indecision",
      "enfermedad",
    ];

    const otrosIndicadores = camposPensamiento
      .map((campo) => {
        const valor = pensamiento?.[campo];

        if (
          valor === null ||
          valor === undefined ||
          valor === "" ||
          valor === false
        ) {
          return null;
        }

return `${campo}: ${valor}`;      })
      .filter(Boolean);

    if (otrosIndicadores.length > 0) {
      lineas.push(`Otros indicadores: ${otrosIndicadores.join(", ")}.`);
    }

    agregarBloqueResumen(bloques, "EVALUACIÓN DEL PENSAMIENTO", lineas);
  }

  const evaluacionLenguaje = seccionDesdeRutas(fichaClinica, [
    "evaluacionLenguaje",
    "evaluacionPsicologica.evaluacionLenguaje",
  ]);

  if (evaluacionLenguaje) {
    const indicadores = valoresBooleanos(evaluacionLenguaje, [
      "palabrasRaras",
      "logicoYClaro",
      "vozMonotona",
      "malHablado",
      "lentoYTeatral",
      "incoherente",
      "verborrea",
      "disartria",
      "afasiaExpresiva",
      "afasiaReceptiva",
      "afasiaAnomica",
      "afasiaGlobal",
      "ecolalia",
      "palilalia",
      "mutismo",
      "reticencia",
      "evitaConversar",
      "callado",
    ]);

    agregarBloqueResumen(
      bloques,
      "EVALUACIÓN DEL LENGUAJE",
      indicadores.length > 0
        ? [`Indicadores presentes: ${indicadores.join(", ")}.`]
        : []
    );
  }

  return bloques.join("\n\n");
}

const ESTADO_INICIAL: FormState = {
  numeroFicha: "",
  representante: "",
  parentesco: "",
  parentescoOtro: "",
  fechasEvaluacion: "",
  fechaElaboracionInforme: "",
  fechaLecturaInforme: "",
  motivoConsulta: "",
  historiaEscolar: "",
  psicobiografia: "",
  observacionConsulta: "",
  reactivosPsicologiaEducativa: "",
  reactivosPsicologiaClinica: "",
  conclusiones: "",
  recomendacionesInstitucion: "",
  recomendacionesRepresentante: "",
  areaPsicologiaEducativa: "Psicología Educativa",
  evaluadorPsicologiaEducativa: "",
  profesionalPsicologiaEducativa: "",
  areaPsicologiaClinica: "Psicología Clínica",
  evaluadorPsicologiaClinica: "",
  profesionalPsicologiaClinica: "",
  coordinadora: COORDINADORA_DEFAULT,
};

export default function NuevoInforme() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [especialistas, setEspecialistas] = useState<EspecialistaDTO[]>([]);
  const [fechaEvaluacionTemporal, setFechaEvaluacionTemporal] = useState("");
  const [fechasEvaluacionLista, setFechasEvaluacionLista] = useState<string[]>([]);

  useEffect(() => {
    especialistasService
      .listarParaInformes()
      .then(setEspecialistas)
      .catch(() =>
        toast.error("No se pudieron cargar los especialistas para el informe")
      );
  }, []);

  useEffect(() => {
    if (!pacienteId) return;

    const cargarDatosDesdeHistoriaClinica = async () => {
      try {
        const historia = await fichasService.obtenerHistoriaClinica(pacienteId);

        const { representante, parentesco, motivoConsulta } =
          extraerDatosRepresentante(historia);

        if (!representante && !parentesco && !motivoConsulta) return;

        const parentescoFormulario =
          resolverParentescoParaFormulario(parentesco);

        setForm((prev) => ({
          ...prev,
          representante: prev.representante || representante,
          parentesco: prev.parentesco || parentescoFormulario.parentesco,
          parentescoOtro:
            prev.parentescoOtro || parentescoFormulario.parentescoOtro,
          motivoConsulta: prev.motivoConsulta || motivoConsulta,
        }));
      } catch (error) {
        console.warn(
          "No se pudo cargar la historia clínica para llenar datos del informe",
          error
        );
      }
    };

    cargarDatosDesdeHistoriaClinica();
  }, [pacienteId]);

  useEffect(() => {
    if (!pacienteId) return;

    const cargarHistoriaEscolarDesdePsicologiaEducativa = async () => {
      try {
        const psicologiaEducativa =
          await fichasService.obtenerPsicologiaEducativa(pacienteId);

        const resumenHistoriaEscolar =
          construirResumenHistoriaEscolar(psicologiaEducativa);

        if (!resumenHistoriaEscolar) return;

        setForm((prev) => ({
          ...prev,
          historiaEscolar: prev.historiaEscolar || resumenHistoriaEscolar,
        }));
      } catch (error) {
        console.warn(
          "No se pudo cargar Psicología Educativa para llenar historia escolar",
          error
        );
      }
    };

    cargarHistoriaEscolarDesdePsicologiaEducativa();
  }, [pacienteId]);

  useEffect(() => {
    if (!pacienteId) return;

    const cargarDatosDesdePsicologiaClinica = async () => {
      try {
        const psicologiaClinica =
          await fichasService.obtenerPsicologiaClinica(pacienteId);

        const resumenHistoriaYHabitos =
          construirResumenHistoriaYHabitos(psicologiaClinica);

        const resumenObservacionPsicologica =
          construirResumenObservacionPsicologica(psicologiaClinica);

        setForm((prev) => ({
          ...prev,
          psicobiografia: prev.psicobiografia || resumenHistoriaYHabitos,
          observacionConsulta:
            prev.observacionConsulta || resumenObservacionPsicologica,
        }));
      } catch (error) {
        console.warn(
          "No se pudo cargar Psicología Clínica para llenar historia/hábitos y observación psicológica",
          error
        );
      }
    };

    cargarDatosDesdePsicologiaClinica();
  }, [pacienteId]);

  const especialistasEducativa = useMemo(
    () =>
      especialistas.filter(
        (esp) => normalizar(esp.especialidad?.area) === "psicologia educativa"
      ),
    [especialistas]
  );

  const especialistasClinica = useMemo(
    () =>
      especialistas.filter(
        (esp) => normalizar(esp.especialidad?.area) === "psicologia clinica"
      ),
    [especialistas]
  );

  const onInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "parentesco" && value !== "Otro" ? { parentescoOtro: "" } : {}),
    }));
  };

  const onTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const agregarFechaEvaluacion = () => {
    if (!fechaEvaluacionTemporal) {
      toast.error("Seleccione una fecha de evaluación");
      return;
    }

    if (fechasEvaluacionLista.includes(fechaEvaluacionTemporal)) {
      toast.error("Esa fecha ya fue agregada");
      return;
    }

    const nuevaLista = [...fechasEvaluacionLista, fechaEvaluacionTemporal].sort();

    setFechasEvaluacionLista(nuevaLista);
    setForm((prev) => ({
      ...prev,
      fechasEvaluacion: formatearFechasEvaluacion(nuevaLista),
    }));
    setFechaEvaluacionTemporal("");
  };

  const eliminarFechaEvaluacion = (fecha: string) => {
    const nuevaLista = fechasEvaluacionLista.filter((f) => f !== fecha);

    setFechasEvaluacionLista(nuevaLista);
    setForm((prev) => ({
      ...prev,
      fechasEvaluacion: formatearFechasEvaluacion(nuevaLista),
    }));
  };

  const guardar = async () => {
    if (!pacienteId) {
      toast.error("Falta el ID del paciente");
      return;
    }

    const parentescoFinal =
      form.parentesco === "Otro"
        ? form.parentescoOtro.trim()
        : form.parentesco.trim();

    if (!parentescoFinal) {
      toast.error("Debe seleccionar o especificar el parentesco");
      return;
    }

    if (fechasEvaluacionLista.length === 0) {
      toast.error("Debe agregar al menos una fecha de evaluación");
      return;
    }

    setGuardando(true);

    try {
      const payload: InformeRequest = {
        ...form,
        pacienteId: Number(pacienteId),
        parentesco: parentescoFinal,
        fechasEvaluacion: formatearFechasEvaluacion(fechasEvaluacionLista),
      };

      await informesService.crear(payload);
      toast.success("Informe guardado correctamente");
      navigate(`/fichas/informes/${pacienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Nuevo Informe Psicopedagógico | Udipsai"
        description="Crear informe psicopedagógico"
      />

      <PageBreadcrumb
        pageTitle="Nuevo Informe Psicopedagógico"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Informes", path: `/fichas/informes/${pacienteId}` },
          { label: "Nuevo" },
        ]}
      />

      <div className="space-y-5">
        <ComponentCard title="1. Datos de identificación">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              label="N° de ficha"
              name="numeroFicha"
              value={form.numeroFicha}
              onChange={onInput}
            />

            <Campo
              label="Representante"
              name="representante"
              value={form.representante}
              onChange={onInput}
            />

            <SelectCampo
              label="Parentesco"
              name="parentesco"
              value={form.parentesco}
              onChange={onInput}
              options={PARENTESCOS}
            />

            {form.parentesco === "Otro" && (
              <Campo
                label="Especifique parentesco"
                name="parentescoOtro"
                value={form.parentescoOtro}
                onChange={onInput}
              />
            )}

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fechas de evaluación
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="date"
                  value={fechaEvaluacionTemporal}
                  onChange={(e) => setFechaEvaluacionTemporal(e.target.value)}
                  className="dark:bg-dark-900 h-11 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-300 dark:border-gray-700 dark:text-white/90"
                />

                <button
                  type="button"
                  onClick={agregarFechaEvaluacion}
                  className="h-11 rounded-lg border border-brand-300 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/20"
                >
                  Agregar fecha
                </button>
              </div>

              {fechasEvaluacionLista.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {fechasEvaluacionLista.map((fecha) => (
                    <div
                      key={fecha}
                      className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    >
                      <span>{formatearFechaCorta(fecha)}</span>
                      <button
                        type="button"
                        onClick={() => eliminarFechaEvaluacion(fecha)}
                        className="font-bold text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Vista previa para el informe:{" "}
                {form.fechasEvaluacion || "Sin fechas agregadas"}
              </p>
            </div>

            <Campo
              label="Fecha elaboración informe"
              name="fechaElaboracionInforme"
              type="date"
              value={form.fechaElaboracionInforme}
              onChange={onInput}
            />

            <Campo
              label="Fecha lectura informe"
              name="fechaLecturaInforme"
              type="date"
              value={form.fechaLecturaInforme}
              onChange={onInput}
            />
          </div>
        </ComponentCard>

        <ComponentCard title="2. Motivo de consulta">
          <AreaTexto
            name="motivoConsulta"
            value={form.motivoConsulta}
            onChange={onTextarea}
            filas={4}
          />
        </ComponentCard>

        <ComponentCard title="3. Historia escolar">
          <AreaTexto
            name="historiaEscolar"
            value={form.historiaEscolar}
            onChange={onTextarea}
            filas={4}
          />
        </ComponentCard>

        <ComponentCard title="4. Historia y hábitos">
          <AreaTexto
            name="psicobiografia"
            value={form.psicobiografia}
            onChange={onTextarea}
            filas={5}
          />
        </ComponentCard>

        <ComponentCard title="5. Observación en la consulta">
          <AreaTexto
            name="observacionConsulta"
            value={form.observacionConsulta}
            onChange={onTextarea}
            filas={5}
          />
        </ComponentCard>

        <ComponentCard title="6. Reactivos aplicados y resultados">
          <div className="space-y-4">
            <AreaTexto
              label="Psicología Educativa"
              name="reactivosPsicologiaEducativa"
              value={form.reactivosPsicologiaEducativa}
              onChange={onTextarea}
              filas={5}
            />
            <AreaTexto
              label="Psicología Clínica"
              name="reactivosPsicologiaClinica"
              value={form.reactivosPsicologiaClinica}
              onChange={onTextarea}
              filas={5}
            />
          </div>
        </ComponentCard>

        <ComponentCard title="7. Conclusiones">
          <AreaTexto
            name="conclusiones"
            value={form.conclusiones}
            onChange={onTextarea}
            filas={4}
          />
        </ComponentCard>

        <ComponentCard title="8. Recomendaciones para la institución educativa">
          <AreaTexto
            name="recomendacionesInstitucion"
            value={form.recomendacionesInstitucion}
            onChange={onTextarea}
            filas={6}
          />
        </ComponentCard>

        <ComponentCard title="9. Recomendaciones para el representante o familiares">
          <AreaTexto
            name="recomendacionesRepresentante"
            value={form.recomendacionesRepresentante}
            onChange={onTextarea}
            filas={5}
          />
        </ComponentCard>

        <ComponentCard title="10. Profesionales responsables">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              label="Evaluador — Psicología Educativa"
              name="evaluadorPsicologiaEducativa"
              value={form.evaluadorPsicologiaEducativa}
              onChange={onInput}
            />

            <BuscadorEspecialista
              label="Profesional responsable — Psicología Educativa"
              value={form.profesionalPsicologiaEducativa}
              options={especialistasEducativa}
              onSelect={(nombre) =>
                setForm((prev) => ({
                  ...prev,
                  profesionalPsicologiaEducativa: nombre,
                }))
              }
            />

            <Campo
              label="Evaluador — Psicología Clínica"
              name="evaluadorPsicologiaClinica"
              value={form.evaluadorPsicologiaClinica}
              onChange={onInput}
            />

            <BuscadorEspecialista
              label="Profesional responsable — Psicología Clínica"
              value={form.profesionalPsicologiaClinica}
              options={especialistasClinica}
              onSelect={(nombre) =>
                setForm((prev) => ({
                  ...prev,
                  profesionalPsicologiaClinica: nombre,
                }))
              }
            />

            <div className="sm:col-span-2">
              <Campo
                label="Coordinadora de la UDIPSAI"
                name="coordinadora"
                value={form.coordinadora}
                onChange={onInput}
              />
            </div>
          </div>
        </ComponentCard>

        <div className="flex items-center gap-3 pb-6">
          <Button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar informe"}
          </Button>

          <button
            onClick={() => navigate(`/fichas/informes/${pacienteId}`)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}
