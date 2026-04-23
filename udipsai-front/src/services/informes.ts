import api from "../api/api";

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface InformeDTO {
  id: number;
  paciente: { id: number; nombresApellidos: string; cedula: string };
  numeroFicha: string;
  representante: string;
  parentesco: string;
  fechasEvaluacion: string;
  fechaElaboracionInforme: string;
  fechaLecturaInforme: string;
  motivoConsulta: string;
  historiaEscolar: string;
  psicobiografia: string;
  observacionConsulta: string;
  reactivosPsicologiaEducativa: string;
  reactivosPsicologiaClinica: string;
  conclusiones: string;
  recomendacionesInstitucion: string;
  recomendacionesRepresentante: string;
  areaPsicologiaEducativa: string;
  evaluadorPsicologiaEducativa: string;
  profesionalPsicologiaEducativa: string;
  areaPsicologiaClinica: string;
  evaluadorPsicologiaClinica: string;
  profesionalPsicologiaClinica: string;
  coordinadora: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface InformeRequest {
  pacienteId: number;
  numeroFicha: string;
  representante: string;
  parentesco: string;
  fechasEvaluacion: string;
  fechaElaboracionInforme: string;
  fechaLecturaInforme: string;
  motivoConsulta: string;
  historiaEscolar: string;
  psicobiografia: string;
  observacionConsulta: string;
  reactivosPsicologiaEducativa: string;
  reactivosPsicologiaClinica: string;
  conclusiones: string;
  recomendacionesInstitucion: string;
  recomendacionesRepresentante: string;
  areaPsicologiaEducativa: string;
  evaluadorPsicologiaEducativa: string;
  profesionalPsicologiaEducativa: string;
  areaPsicologiaClinica: string;
  evaluadorPsicologiaClinica: string;
  profesionalPsicologiaClinica: string;
  coordinadora: string;
}

// ── Servicio ─────────────────────────────────────────────────────────────────

export const informesService = {

  listar: async (): Promise<InformeDTO[]> => {
    const response = await api.get("/informes");
    return response.data;
  },

  listarPorPaciente: async (pacienteId: number): Promise<InformeDTO[]> => {
    const response = await api.get(`/informes/paciente/${pacienteId}`);
    return response.data;
  },

  obtener: async (id: number): Promise<InformeDTO> => {
    const response = await api.get(`/informes/${id}`);
    return response.data;
  },

  crear: async (data: InformeRequest): Promise<InformeDTO> => {
    const response = await api.post("/informes", data);
    return response.data;
  },

  actualizar: async (id: number, data: InformeRequest): Promise<InformeDTO> => {
    const response = await api.put(`/informes/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/informes/${id}`);
  },

  // Descarga el PDF: pide el archivo como blob y dispara la descarga en el navegador
  descargarPdf: async (id: number, nombrePaciente: string): Promise<void> => {
    const response = await api.get(`/informes/${id}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `informe-${nombrePaciente.replace(/\s+/g, "_")}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};