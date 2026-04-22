// ─────────────────────────────────────────────────────────────────────────────
// NuevoInforme.tsx
// Página con el formulario para que el psicólogo ingrese los datos del informe.
// Al guardar, llama al backend. Desde la lista se puede descargar el PDF.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearInforme, InformeRequest } from "../../../services/informes";

// Valor inicial vacío del formulario
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
  // Lee el pacienteId de la URL: /fichas/informes/nuevo?pacienteId=5
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState(estadoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Actualiza el estado cuando el usuario escribe en cualquier campo
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    if (!pacienteId) return;
    setGuardando(true);
    setError("");
    try {
      await crearInforme({ ...form, pacienteId: Number(pacienteId) });
      navigate(-1); // vuelve a la pantalla anterior
    } catch {
      setError("Error al guardar el informe. Intente nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  // Componente auxiliar para campos de texto corto
  const Campo = ({
    label,
    name,
    type = "text",
  }: {
    label: string;
    name: keyof typeof estadoInicial;
    type?: string;
  }) => (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", fontSize: "13px" }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  // Componente auxiliar para áreas de texto grandes
  const AreaTexto = ({
    label,
    name,
    filas = 4,
  }: {
    label: string;
    name: keyof typeof estadoInicial;
    filas?: number;
  }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", fontSize: "13px" }}>
        {label}
      </label>
      <textarea
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        rows={filas}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          fontSize: "13px",
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>

      <h2 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "24px" }}>
        Nuevo informe psicopedagógico
      </h2>

      {error && (
        <div style={{ background: "#fce8e8", color: "#c0392b", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* ── SECCIÓN 1: Datos de identificación ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px" }}>
        1. Datos de identificación
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Campo label="N° de ficha" name="numeroFicha" />
        <Campo label="Representante" name="representante" />
        <Campo label="Parentesco" name="parentesco" />
        <Campo label="Teléfono de contacto (ya está en el paciente)" name="representante" />
        <Campo label="Fechas de evaluación" name="fechasEvaluacion" />
        <Campo label="Fecha de elaboración del informe" name="fechaElaboracionInforme" type="date" />
        <Campo label="Fecha de lectura del informe" name="fechaLecturaInforme" type="date" />
      </div>

      {/* ── SECCIÓN 2 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "20px" }}>
        2. Motivo de consulta
      </h3>
      <AreaTexto label="" name="motivoConsulta" filas={4} />

      {/* ── SECCIÓN 3 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        3. Historia escolar
      </h3>
      <AreaTexto label="" name="historiaEscolar" filas={4} />

      {/* ── SECCIÓN 4 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        4. Psicobiografía
      </h3>
      <AreaTexto label="" name="psicobiografia" filas={5} />

      {/* ── SECCIÓN 5 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        5. Observación en la consulta
      </h3>
      <AreaTexto label="" name="observacionConsulta" filas={5} />

      {/* ── SECCIÓN 6 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        6. Reactivos aplicados y resultados
      </h3>
      <AreaTexto label="Psicología Educativa" name="reactivosPsicologiaEducativa" filas={5} />
      <AreaTexto label="Psicología Clínica" name="reactivosPsicologiaClinica" filas={5} />

      {/* ── SECCIÓN 7 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        7. Conclusiones
      </h3>
      <AreaTexto label="" name="conclusiones" filas={4} />

      {/* ── SECCIÓN 8 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        8. Recomendaciones para la institución educativa
      </h3>
      <AreaTexto label="" name="recomendacionesInstitucion" filas={6} />

      {/* ── SECCIÓN 9 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        9. Recomendaciones para el representante
      </h3>
      <AreaTexto label="" name="recomendacionesRepresentante" filas={5} />

      {/* ── SECCIÓN 10 ── */}
      <h3 style={{ fontSize: "14px", color: "#c0392b", borderBottom: "2px solid #c0392b", paddingBottom: "4px", marginBottom: "16px", marginTop: "4px" }}>
        10. Profesionales responsables
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Campo label="Evaluador (Psicología Educativa)" name="evaluadorPsicologiaEducativa" />
        <Campo label="Profesional responsable (Psicología Educativa)" name="profesionalPsicologiaEducativa" />
        <Campo label="Evaluador (Psicología Clínica)" name="evaluadorPsicologiaClinica" />
        <Campo label="Profesional responsable (Psicología Clínica)" name="profesionalPsicologiaClinica" />
      </div>
      <Campo label="Coordinadora de la UDIPSAI" name="coordinadora" />

      {/* ── BOTONES ── */}
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          style={{
            padding: "10px 24px",
            background: "#c0392b",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando ? "Guardando..." : "Guardar informe"}
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 24px",
            background: "transparent",
            color: "#555",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}