import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import { informesService, InformeRequest } from "../../../services/informes";
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

const VACIO: FormState = {
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

export default function EditarInforme() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(VACIO);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [especialistas, setEspecialistas] = useState<EspecialistaDTO[]>([]);

  useEffect(() => {
    especialistasService
      .listarParaInformes()
      .then(setEspecialistas)
      .catch(() =>
        toast.error("No se pudieron cargar los especialistas para el informe")
      );
  }, []);

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

  useEffect(() => {
    if (!id) return;

    informesService
      .obtener(Number(id))
      .then((inf) => {
        const parentescoGuardado = inf.parentesco ?? "";
        const parentescoEsLista = PARENTESCOS.some(
          (p) => p.value && p.value === parentescoGuardado
        );

        setPacienteId(inf.paciente?.id ?? null);
        setForm({
          numeroFicha: inf.numeroFicha ?? "",
          representante: inf.representante ?? "",
          parentesco: parentescoGuardado
            ? parentescoEsLista
              ? parentescoGuardado
              : "Otro"
            : "",
          parentescoOtro: parentescoGuardado && !parentescoEsLista ? parentescoGuardado : "",
          fechasEvaluacion: inf.fechasEvaluacion ?? "",
          fechaElaboracionInforme: inf.fechaElaboracionInforme ?? "",
          fechaLecturaInforme: inf.fechaLecturaInforme ?? "",
          motivoConsulta: inf.motivoConsulta ?? "",
          historiaEscolar: inf.historiaEscolar ?? "",
          psicobiografia: inf.psicobiografia ?? "",
          observacionConsulta: inf.observacionConsulta ?? "",
          reactivosPsicologiaEducativa: inf.reactivosPsicologiaEducativa ?? "",
          reactivosPsicologiaClinica: inf.reactivosPsicologiaClinica ?? "",
          conclusiones: inf.conclusiones ?? "",
          recomendacionesInstitucion: inf.recomendacionesInstitucion ?? "",
          recomendacionesRepresentante: inf.recomendacionesRepresentante ?? "",
          areaPsicologiaEducativa:
            inf.areaPsicologiaEducativa ?? "Psicología Educativa",
          evaluadorPsicologiaEducativa:
            inf.evaluadorPsicologiaEducativa ?? "",
          profesionalPsicologiaEducativa:
            inf.profesionalPsicologiaEducativa ?? "",
          areaPsicologiaClinica:
            inf.areaPsicologiaClinica ?? "Psicología Clínica",
          evaluadorPsicologiaClinica: inf.evaluadorPsicologiaClinica ?? "",
          profesionalPsicologiaClinica:
            inf.profesionalPsicologiaClinica ?? "",
          coordinadora: inf.coordinadora || COORDINADORA_DEFAULT,
        });
      })
      .catch(() => toast.error("No se pudo cargar el informe"))
      .finally(() => setCargando(false));
  }, [id]);

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

  const guardar = async () => {
    if (!id || !pacienteId) {
      toast.error("Datos incompletos");
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

    setGuardando(true);

    try {
      const payload: InformeRequest = {
        ...form,
        pacienteId,
        parentesco: parentescoFinal,
      };

      await informesService.actualizar(Number(id), payload);
      toast.success("Informe actualizado correctamente");
      navigate(`/fichas/informes/${pacienteId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar"
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Cargando informe...</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Editar Informe Psicopedagógico | Udipsai"
        description="Editar informe psicopedagógico"
      />

      <PageBreadcrumb
        pageTitle="Editar Informe Psicopedagógico"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Informes", path: `/fichas/informes/${pacienteId}` },
          { label: "Editar" },
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

            <Campo
              label="Fecha de evaluación"
              name="fechasEvaluacion"
              type="date"
              value={form.fechasEvaluacion}
              onChange={onInput}
            />

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

        <ComponentCard title="4. Psicobiografía">
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
            {guardando ? "Guardando..." : "Guardar cambios"}
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