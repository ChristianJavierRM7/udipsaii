// ─────────────────────────────────────────────────────────────────────────────
// Este archivo contiene todas las funciones que el frontend usa para
// comunicarse con el backend. Cada función hace una llamada HTTP.
// ─────────────────────────────────────────────────────────────────────────────

import { axiosInstance } from "./index"; // reutiliza el axios ya configurado con JWT

// ── Tipos TypeScript ─────────────────────────────────────────────────────────

export interface InformeDTO {
  id: number;
  paciente: { id: number; nombresApellidos: string; cedula: string };
  numeroFicha: string;
  representante: string;
  parentesco: string;
  fechasEvaluacion: string;
  fechaElaboracionInforme: string;   // "YYYY-MM-DD"
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

// InformeRequest = lo que enviamos al backend al crear o editar
export type InformeRequest = Omit<InformeDTO, "id" | "paciente" | "activo" | "fechaCreacion"> & {
  pacienteId: number;
};

// ── Funciones de API ─────────────────────────────────────────────────────────

// Obtener todos los informes
export const getInformes = () =>
  axiosInstance.get<InformeDTO[]>("/informes");

// Obtener informes de un paciente específico
export const getInformesPorPaciente = (pacienteId: number) =>
  axiosInstance.get<InformeDTO[]>(`/informes/paciente/${pacienteId}`);

// Obtener un informe por ID
export const getInforme = (id: number) =>
  axiosInstance.get<InformeDTO>(`/informes/${id}`);

// Crear un informe nuevo
export const crearInforme = (data: InformeRequest) =>
  axiosInstance.post<InformeDTO>("/informes", data);

// Actualizar un informe existente
export const actualizarInforme = (id: number, data: InformeRequest) =>
  axiosInstance.put<InformeDTO>(`/informes/${id}`, data);

// Eliminar un informe
export const eliminarInforme = (id: number) =>
  axiosInstance.delete(`/informes/${id}`);

// ── Descarga del PDF ─────────────────────────────────────────────────────────
// Esta función es especial: pide el PDF como "blob" (archivo binario),
// crea un link temporal en el navegador y lo "hace clic" para descargar.
export const descargarInformePdf = async (id: number, nombrePaciente: string) => {
  const response = await axiosInstance.get(`/informes/${id}/pdf`, {
    responseType: "blob",   // ← importante: le dice a axios que es un archivo
  });

  // Crear URL temporal para el blob
  const url = window.URL.createObjectURL(new Blob([response.data]));

  // Crear un <a> invisible, hacer clic en él y eliminarlo
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `informe-psicopedagogico-${nombrePaciente.replace(/\s/g, "_")}.pdf`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};