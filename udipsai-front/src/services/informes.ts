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

function descargarBlob(data: BlobPart, nombreArchivo: string, tipo: string) {
  const url = window.URL.createObjectURL(new Blob([data], { type: tipo }));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", nombreArchivo);

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

function nombreSeguro(nombre: string) {
  return nombre.replace(/\s+/g, "_").replace(/[^\wÁÉÍÓÚáéíóúÑñ-]/g, "");
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

  descargarPdf: async (id: number, nombrePaciente: string): Promise<void> => {
    const response = await api.get(`/informes/${id}/pdf`, {
      responseType: "blob",
    });

    descargarBlob(
      response.data,
      `informe-${nombreSeguro(nombrePaciente)}.pdf`,
      "application/pdf"
    );
  },

  descargarWord: async (id: number, nombrePaciente: string): Promise<void> => {
    const response = await api.get(`/informes/${id}/word`, {
      responseType: "blob",
    });

    descargarBlob(
      response.data,
      `informe-${nombreSeguro(nombrePaciente)}.docx`,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  },
};
