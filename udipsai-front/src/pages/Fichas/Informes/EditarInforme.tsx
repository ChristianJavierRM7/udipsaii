import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import { informesService, InformeRequest } from "../../../services/informes";

// ── Componentes auxiliares (FUERA del componente principal) ───────────────────

type FormState = Omit<InformeRequest, "pacienteId">;

interface CampoProps {
  label: string;
  name: keyof FormState;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Campo({ label, name, type = "text", value, onChange }: CampoProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
    </div>
  );
}

interface AreaTextoProps {
  label?: string;
  name: keyof FormState;
  filas?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function AreaTexto({ label, name, filas = 4, value, onChange }: AreaTextoProps) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={filas}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        style={{ resize: "vertical" }}
      />
    </div>
  );
}

// ── Estado inicial vacío ──────────────────────────────────────────────────────

const VACIO: FormState = {
  numeroFicha: "", representante: "", parentesco: "", fechasEvaluacion: "",
  fechaElaboracionInforme: "", fechaLecturaInforme: "", motivoConsulta: "",
  historiaEscolar: "", psicobiografia: "", observacionConsulta: "",
  reactivosPsicologiaEducativa: "", reactivosPsicologiaClinica: "",
  conclusiones: "", recomendacionesInstitucion: "", recomendacionesRepresentante: "",
  areaPsicologiaEducativa: "Psicología Educativa", evaluadorPsicologiaEducativa: "",
  profesionalPsicologiaEducativa: "", areaPsicologiaClinica: "Psicología Clínica",
  evaluadorPsicologiaClinica: "", profesionalPsicologiaClinica: "", coordinadora: "",
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function EditarInforme() {
  // El id del informe viene en la URL: /fichas/informes/editar/5
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(VACIO);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar los datos del informe existente al montar
  useEffect(() => {
    if (!id) return;
    informesService
      .obtener(Number(id))
      .then((inf) => {
        setPacienteId(inf.paciente?.id ?? null);
        setForm({
          numeroFicha:                   inf.numeroFicha ?? "",
          representante:                 inf.representante ?? "",
          parentesco:                    inf.parentesco ?? "",
          fechasEvaluacion:              inf.fechasEvaluacion ?? "",
          fechaElaboracionInforme:       inf.fechaElaboracionInforme ?? "",
          fechaLecturaInforme:           inf.fechaLecturaInforme ?? "",
          motivoConsulta:                inf.motivoConsulta ?? "",
          historiaEscolar:               inf.historiaEscolar ?? "",
          psicobiografia:                inf.psicobiografia ?? "",
          observacionConsulta:           inf.observacionConsulta ?? "",
          reactivosPsicologiaEducativa:  inf.reactivosPsicologiaEducativa ?? "",
          reactivosPsicologiaClinica:    inf.reactivosPsicologiaClinica ?? "",
          conclusiones:                  inf.conclusiones ?? "",
          recomendacionesInstitucion:    inf.recomendacionesInstitucion ?? "",
          recomendacionesRepresentante:  inf.recomendacionesRepresentante ?? "",
          areaPsicologiaEducativa:       inf.areaPsicologiaEducativa ?? "Psicología Educativa",
          evaluadorPsicologiaEducativa:  inf.evaluadorPsicologiaEducativa ?? "",
          profesionalPsicologiaEducativa:inf.profesionalPsicologiaEducativa ?? "",
          areaPsicologiaClinica:         inf.areaPsicologiaClinica ?? "Psicología Clínica",
          evaluadorPsicologiaClinica:    inf.evaluadorPsicologiaClinica ?? "",
          profesionalPsicologiaClinica:  inf.profesionalPsicologiaClinica ?? "",
          coordinadora:                  inf.coordinadora ?? "",
        });
      })
      .catch(() => toast.error("No se pudo cargar el informe"))
      .finally(() => setCargando(false));
  }, [id]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardar = async () => {
    if (!id || !pacienteId) { toast.error("Datos incompletos"); return; }
    setGuardando(true);
    try {
      await informesService.actualizar(Number(id), { ...form, pacienteId });
      toast.success("Informe actualizado correctamente");
      navigate(`/fichas/informes/${pacienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
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
      <PageMeta title="Editar Informe Psicopedagógico | Udipsai" description="Editar informe psicopedagógico" />
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
            <Campo label="N° de ficha"              name="numeroFicha"            value={form.numeroFicha}            onChange={onInput} />
            <Campo label="Representante"             name="representante"           value={form.representante}           onChange={onInput} />
            <Campo label="Parentesco"                name="parentesco"              value={form.parentesco}              onChange={onInput} />
            <Campo label="Fechas de evaluación"      name="fechasEvaluacion"        value={form.fechasEvaluacion}        onChange={onInput} />
            <Campo label="Fecha elaboración informe" name="fechaElaboracionInforme" type="date" value={form.fechaElaboracionInforme} onChange={onInput} />
            <Campo label="Fecha lectura informe"     name="fechaLecturaInforme"     type="date" value={form.fechaLecturaInforme}     onChange={onInput} />
          </div>
        </ComponentCard>

        <ComponentCard title="2. Motivo de consulta">
          <AreaTexto name="motivoConsulta" value={form.motivoConsulta} onChange={onTextarea} filas={4} />
        </ComponentCard>

        <ComponentCard title="3. Historia escolar">
          <AreaTexto name="historiaEscolar" value={form.historiaEscolar} onChange={onTextarea} filas={4} />
        </ComponentCard>

        <ComponentCard title="4. Psicobiografía">
          <AreaTexto name="psicobiografia" value={form.psicobiografia} onChange={onTextarea} filas={5} />
        </ComponentCard>

        <ComponentCard title="5. Observación en la consulta">
          <AreaTexto name="observacionConsulta" value={form.observacionConsulta} onChange={onTextarea} filas={5} />
        </ComponentCard>

        <ComponentCard title="6. Reactivos aplicados y resultados">
          <div className="space-y-4">
            <AreaTexto label="Psicología Educativa" name="reactivosPsicologiaEducativa" value={form.reactivosPsicologiaEducativa} onChange={onTextarea} filas={5} />
            <AreaTexto label="Psicología Clínica"   name="reactivosPsicologiaClinica"   value={form.reactivosPsicologiaClinica}   onChange={onTextarea} filas={5} />
          </div>
        </ComponentCard>

        <ComponentCard title="7. Conclusiones">
          <AreaTexto name="conclusiones" value={form.conclusiones} onChange={onTextarea} filas={4} />
        </ComponentCard>

        <ComponentCard title="8. Recomendaciones para la institución educativa">
          <AreaTexto name="recomendacionesInstitucion" value={form.recomendacionesInstitucion} onChange={onTextarea} filas={6} />
        </ComponentCard>

        <ComponentCard title="9. Recomendaciones para el representante o familiares">
          <AreaTexto name="recomendacionesRepresentante" value={form.recomendacionesRepresentante} onChange={onTextarea} filas={5} />
        </ComponentCard>

        <ComponentCard title="10. Profesionales responsables">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Evaluador — Psicología Educativa"              name="evaluadorPsicologiaEducativa"    value={form.evaluadorPsicologiaEducativa}    onChange={onInput} />
            <Campo label="Profesional responsable — Psicología Educativa" name="profesionalPsicologiaEducativa" value={form.profesionalPsicologiaEducativa} onChange={onInput} />
            <Campo label="Evaluador — Psicología Clínica"                name="evaluadorPsicologiaClinica"      value={form.evaluadorPsicologiaClinica}      onChange={onInput} />
            <Campo label="Profesional responsable — Psicología Clínica"  name="profesionalPsicologiaClinica"   value={form.profesionalPsicologiaClinica}   onChange={onInput} />
            <div className="sm:col-span-2">
              <Campo label="Coordinadora de la UDIPSAI" name="coordinadora" value={form.coordinadora} onChange={onInput} />
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