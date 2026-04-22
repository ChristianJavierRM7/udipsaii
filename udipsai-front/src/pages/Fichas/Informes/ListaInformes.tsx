// ─────────────────────────────────────────────────────────────────────────────
// ListaInformes.tsx
// Muestra la lista de informes de un paciente con el botón "Descargar PDF".
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInformesPorPaciente,
  descargarInformePdf,
  InformeDTO,
} from "../../../services/informes";

export default function ListaInformes() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();

  const [informes, setInformes] = useState<InformeDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState<number | null>(null);

  useEffect(() => {
    if (!pacienteId) return;
    getInformesPorPaciente(Number(pacienteId))
      .then((res) => setInformes(res.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [pacienteId]);

  const handleDescargar = async (informe: InformeDTO) => {
    setDescargando(informe.id);
    try {
      await descargarInformePdf(informe.id, informe.paciente.nombresApellidos);
    } catch {
      alert("No se pudo descargar el PDF. Intente nuevamente.");
    } finally {
      setDescargando(null);
    }
  };

  if (cargando) {
    return <p style={{ padding: "24px" }}>Cargando informes...</p>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 500, margin: 0 }}>
          Informes psicopedagógicos
        </h2>
        {/* Botón para crear un informe nuevo */}
        <button
          onClick={() => navigate(`/fichas/informes/nuevo/${pacienteId}`)}
          style={{
            padding: "8px 18px",
            background: "#c0392b",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + Nuevo informe
        </button>
      </div>

      {informes.length === 0 ? (
        <p style={{ color: "#888" }}>Este paciente no tiene informes registrados aún.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>N° Ficha</th>
              <th style={th}>Paciente</th>
              <th style={th}>Fecha de elaboración</th>
              <th style={th}>Fecha de lectura</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {informes.map((inf) => (
              <tr key={inf.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{inf.numeroFicha || "—"}</td>
                <td style={td}>{inf.paciente.nombresApellidos}</td>
                <td style={td}>{inf.fechaElaboracionInforme || "—"}</td>
                <td style={td}>{inf.fechaLecturaInforme || "—"}</td>
                <td style={td}>
                  {/* ── BOTÓN DESCARGAR PDF ── */}
                  <button
                    onClick={() => handleDescargar(inf)}
                    disabled={descargando === inf.id}
                    style={{
                      padding: "5px 12px",
                      background: "#2980b9",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: descargando === inf.id ? "not-allowed" : "pointer",
                      opacity: descargando === inf.id ? 0.6 : 1,
                      marginRight: "6px",
                    }}
                  >
                    {descargando === inf.id ? "Generando..." : "Descargar PDF"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Estilos de tabla reutilizables
const th: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 500,
  color: "#555",
  fontSize: "12px",
  borderBottom: "2px solid #ddd",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "middle",
};