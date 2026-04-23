import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import { informesService, InformeRequest } from "../../../services/informes";

const estadoInicial: Omit<InformeRequest, "pacienteId"> = {
  numeroFicha: "",
  representante: "",
  parentesco: "",
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
  coordinadora: "",
};

export default function NuevoInforme() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState(estadoInicial);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    if (!pacienteId) {
      toast.error("No se encontró el ID del paciente");
      return;
    }
    setGuardando(true);
    try {
      await informesService.crear({ ...form, pacienteId: Number(pacienteId) });
      toast.success("Informe guardado correctamente");
      navigate(`/fichas/informes/${pacienteId}`);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Error al guardar el informe";
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  // ── Componentes auxiliares ──────────────────────────────────────────────────

  const Campo = ({
    label,
    name,
    type = "text",
  }: {
    label: string;
    name: keyof typeof estadoInicial;
    type?: string;
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );

  const AreaTexto = ({
    label,
    name,
    filas = 4,
  }: {
    label?: string;
    name: keyof typeof estadoInicial;
    filas?: number;
  }) => (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        rows={filas}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        style={{ resize: "vertical", fontFamily: "inherit" }}
      />
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta
        title="Nuevo Informe Psicopedagógico | Udipsai"
        description="Crear un nuevo informe psicopedagógico"
      />
      <PageBreadcrumb
        pageTitle="Nuevo Informe Psicopedagógico"
        items={[
          { label: "Inicio", path: "/" },
          { label: "Fichas", path: "/fichas" },
          { label: "Informes", path: `/fichas/informes/${pacienteId}` },
          { label: "Nuevo informe" },
        ]}
      />

      <div className="space-y-5">

        <ComponentCard title="1. Datos de identificación">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="N° de ficha" name="numeroFicha" />
            <Campo label="Representante" name="representante" />
            <Campo label="Parentesco" name="parentesco" />
            <Campo label="Fechas de evaluación" name="fechasEvaluacion" />
            <Campo label="Fecha de elaboración del informe" name="fechaElaboracionInforme" type="date" />
            <Campo label="Fecha de lectura del informe" name="fechaLecturaInforme" type="date" />
          </div>
        </ComponentCard>

        <ComponentCard title="2. Motivo de consulta">
          <AreaTexto name="motivoConsulta" filas={4} />
        </ComponentCard>

        <ComponentCard title="3. Historia escolar">
          <AreaTexto name="historiaEscolar" filas={4} />
        </ComponentCard>

        <ComponentCard title="4. Psicobiografía">
          <AreaTexto name="psicobiografia" filas={5} />
        </ComponentCard>

        <ComponentCard title="5. Observación en la consulta">
          <AreaTexto name="observacionConsulta" filas={5} />
        </ComponentCard>

        <ComponentCard title="6. Reactivos aplicados y resultados">
          <div className="space-y-4">
            <AreaTexto label="Psicología Educativa" name="reactivosPsicologiaEducativa" filas={5} />
            <AreaTexto label="Psicología Clínica" name="reactivosPsicologiaClinica" filas={5} />
          </div>
        </ComponentCard>

        <ComponentCard title="7. Conclusiones">
          <AreaTexto name="conclusiones" filas={4} />
        </ComponentCard>

        <ComponentCard title="8. Recomendaciones para la institución educativa">
          <AreaTexto name="recomendacionesInstitucion" filas={6} />
        </ComponentCard>

        <ComponentCard title="9. Recomendaciones para el representante o familiares">
          <AreaTexto name="recomendacionesRepresentante" filas={5} />
        </ComponentCard>

        <ComponentCard title="10. Profesionales responsables">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Evaluador (Psicología Educativa)" name="evaluadorPsicologiaEducativa" />
            <Campo label="Profesional responsable (Psicología Educativa)" name="profesionalPsicologiaEducativa" />
            <Campo label="Evaluador (Psicología Clínica)" name="evaluadorPsicologiaClinica" />
            <Campo label="Profesional responsable (Psicología Clínica)" name="profesionalPsicologiaClinica" />
            <div className="sm:col-span-2">
              <Campo label="Coordinadora de la UDIPSAI" name="coordinadora" />
            </div>
          </div>
        </ComponentCard>

        <div className="flex items-center gap-3">
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar informe"}
          </Button>
          <button
            onClick={() => navigate(`/fichas/informes/${pacienteId}`)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
          >
            Cancelar
          </button>
        </div>

      </div>
    </>
  );
}