import api from "../api/api";

export const fichasService = {
  // Historial de cambios
  obtenerHistorial: async (id: number | string) => {
    try {
      const response = await api.get(`/historial-cambios/listar/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener historial:", error);
      throw error;
    }
  },

  // Historia Clínica
  listarHistoriaClinica: async () => {
    try {
      const response = await api.get("/historia-clinica");
      return response.data;
    } catch (error) {
      console.error("Error al listar historia clínica:", error);
      throw error;
    }
  },

  crearHistoriaClinica: async (data: any, genograma?: File) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      if (genograma) {
        formData.append("genograma", genograma);
      }

      const response = await api.post("/historia-clinica", formData);
      return response.data;
    } catch (error) {
      console.error("Error al crear historia clínica:", error);
      throw error;
    }
  },

  actualizarHistoriaClinica: async (
    id: number | string,
    data: any,
    genograma?: File
  ) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      if (genograma) {
        formData.append("genograma", genograma);
      }

      const response = await api.put(`/historia-clinica/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar historia clínica:", error);
      throw error;
    }
  },

  obtenerHistoriaClinica: async (id: number | string) => {
    try {
      const response = await api.get(`/historia-clinica/paciente/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener historia clínica:", error);
      throw error;
    }
  },

  obtenerGenograma: async (pacienteId: number | string) => {
    try {
      const response = await api.get(
        `/historia-clinica/paciente/${pacienteId}/genograma`,
        {
          responseType: "blob",
        }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error al obtener genograma:", error);
      throw error;
    }
  },

  eliminarHistoriaClinica: async (id: number | string) => {
    try {
      const response = await api.delete(`/historia-clinica/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar historia clínica:", error);
      throw error;
    }
  },

  // Psicología Educativa
  listarPsicologiaEducativa: async () => {
    try {
      const response = await api.get("/psicologia-educativa");
      return response.data;
    } catch (error) {
      console.error("Error al listar psicología educativa:", error);
      throw error;
    }
  },

  crearPsicologiaEducativa: async (request: any) => {
    try {
      const response = await api.post("/psicologia-educativa", request);
      return response.data;
    } catch (error) {
      console.error("Error al crear psicología educativa:", error);
      throw error;
    }
  },

  obtenerPsicologiaEducativa: async (id: number | string) => {
    try {
      const response = await api.get(`/psicologia-educativa/paciente/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener psicología educativa:", error);
      throw error;
    }
  },

  actualizarPsicologiaEducativa: async (id: number | string, request: any) => {
    try {
      const response = await api.put(`/psicologia-educativa/${id}`, request);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar psicología educativa:", error);
      throw error;
    }
  },

  eliminarPsicologiaEducativa: async (id: number | string) => {
    try {
      const response = await api.delete(`/psicologia-educativa/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar psicología educativa:", error);
      throw error;
    }
  },

  // Psicología Clínica
  listarPsicologiaClinica: async () => {
    try {
      const response = await api.get("/psicologia-clinica");
      return response.data;
    } catch (error) {
      console.error("Error al listar psicología clínica:", error);
      throw error;
    }
  },

  crearPsicologiaClinica: async (request: any) => {
    try {
      const response = await api.post("/psicologia-clinica", request);
      return response.data;
    } catch (error) {
      console.error("Error al crear psicología clínica:", error);
      throw error;
    }
  },

  obtenerPsicologiaClinica: async (id: number | string) => {
    try {
      const response = await api.get(`/psicologia-clinica/paciente/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener psicología clínica:", error);
      throw error;
    }
  },

  actualizarPsicologiaClinica: async (id: number | string, request: any) => {
    try {
      const response = await api.put(`/psicologia-clinica/${id}`, request);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar psicología clínica:", error);
      throw error;
    }
  },

  eliminarPsicologiaClinica: async (id: number | string) => {
    try {
      const response = await api.delete(`/psicologia-clinica/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar psicología clínica:", error);
      throw error;
    }
  },

  // Fonoaudiología
  listarFonoaudiologia: async () => {
    try {
      const response = await api.get("/fonoaudiologia");
      return response.data;
    } catch (error) {
      console.error("Error al listar fonoaudiología:", error);
      throw error;
    }
  },

  crearFonoaudiologia: async (request: any) => {
    try {
      const response = await api.post("/fonoaudiologia", request);
      return response.data;
    } catch (error) {
      console.error("Error al crear fonoaudiología:", error);
      throw error;
    }
  },

  obtenerFonoaudiologia: async (id: number | string) => {
    try {
      const response = await api.get(`/fonoaudiologia/paciente/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener fonoaudiología:", error);
      throw error;
    }
  },

  actualizarFonoaudiologia: async (id: number | string, request: any) => {
    try {
      const response = await api.put(`/fonoaudiologia/${id}`, request);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar fonoaudiología:", error);
      throw error;
    }
  },

  eliminarFonoaudiologia: async (id: number | string) => {
    try {
      const response = await api.delete(`/fonoaudiologia/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar fonoaudiología:", error);
      throw error;
    }
  },

  exportarExcelFonoaudiologia: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/fonoaudiologia/export/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId 
        ? `ficha_fonoaudiologia_${pacienteId}.xlsx` 
        : "fichas_fonoaudiologia.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel de fonoaudiología:", error);
      throw error;
    }
  },

  exportarExcelHistoriaClinica: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/historia-clinica/export/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId 
        ? `historia_clinica_${pacienteId}.xlsx` 
        : "historias_clinicas.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel Historia Clínica:", error);
      throw error;
    }
  },

  exportarExcelPsicologiaEducativa: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/psicologia-educativa/export/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId 
        ? `psicologia_educativa_${pacienteId}.xlsx` 
        : "fichas_psicologia_educativa.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel Psicología Educativa:", error);
      throw error;
    }
  },

  exportarExcelPsicologiaClinica: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/psicologia-clinica/export/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId 
        ? `psicologia_clinica_${pacienteId}.xlsx` 
        : "fichas_psicologia_clinica.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel Psicología Clínica:", error);
      throw error;
    }
  },

  // Socioeconómico
  listarSocioEconomico: async () => {
    const res = await api.get("/fichas-socioeconomicas");
    return res.data;
  },

  obtenerSocioEconomico: async (id: number | string) => {
    const res = await api.get(`/fichas-socioeconomicas/paciente/${id}`);
    return res.data;
  },

  obtenerSocioEconomicoPorId: async (id: number | string) => {
    const res = await api.get(`/fichas-socioeconomicas/${id}`);
    return res.data;
  },

  crearSocioEconomico: async (data: any) => {
    const res = await api.post("/fichas-socioeconomicas/crearFicha", data);
    return res.data;
  },

  actualizarSocioEconomico: async (id: number | string, data: any) => {
    const res = await api.put(`/fichas-socioeconomicas/socioeconomicas/${id}`, data);
    return res.data;
  },

  eliminarSocioEconomico: async (id: number | string) => {
    const res = await api.delete(`/fichas-socioeconomicas/socioeconomicas/${id}`);
    return res.data;
  },

  obtenerHistorialSocioEconomico: async (pacienteId: number | string) => {
    const res = await api.get(`/fichas-socioeconomicas/paciente/id/${pacienteId}/historial`);
    return res.data;
  },

  exportarPdfSocioEconomicoPorId: async (id: number | string) => {
    const res = await api.get(`/fichas-socioeconomicas/reporte/pdf/id/${id}`, {
      responseType: "blob",
    });
    return res.data;
  },

  listarInformeSocial: async () => {
    const res = await api.get("/informes-sociales");
    return res.data;
  },

  obtenerInformeSocial: async (id: number | string) => {
    const res = await api.get(`/informes-sociales/paciente/id/${id}`);
    return res.data;
  },

  obtenerHistorialInformeSocial: async (id: number | string) => {
    const res = await api.get(`/informes-sociales/paciente/id/${id}/historial`);
    return res.data;
  },

  obtenerInformeSocialPorId: async (id: number | string) => {
    const res = await api.get(`/informes-sociales/${id}`);
    return res.data;
  },

  obtenerSiguienteNumeroInforme: async () => {
    const res = await api.get("/informes-sociales/siguiente-numero");
    return res.data;
  },

  crearInformeSocial: async (data: FormData) => {
    const res = await api.post("/informes-sociales/crear", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  actualizarInformeSocial: async (id: number | string, data: FormData) => {
    const res = await api.put(`/informes-sociales/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  eliminarInformeSocial: async (id: number | string) => {
    const res = await api.delete(`/informes-sociales/${id}`);
    return res.data;
  },

  exportarExcelSocioEconomico: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/fichas-socioeconomicas/reporte/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId
        ? `ficha_socioeconomica_${pacienteId}.xlsx`
        : "fichas_socioeconomicas.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel Socioeconómico:", error);
      throw error;
    }
  },

  exportarPdfSocioEconomico: async (pacienteId: number) => {
    try {
      const response = await api.get(
        "/fichas-socioeconomicas/reporte/pdf",
        {
          params: { pacienteId },
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al exportar PDF Socioeconómico:", error);
      throw error;
    }
  },

  // Seguimiento Social
  listarSeguimientoSocial: async () => {
    try {
      const response = await api.get("/seguimientos-sociales");
      return response.data;
    } catch (error) {
      console.error("Error al listar seguimiento social:", error);
      throw error;
    }
  },

  exportartExcelInformeSocial: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/informes-sociales/reporte/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId
        ? `informe_social_${pacienteId}.xlsx`
        : "informes_sociales.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel Informe Social:", error);
      throw error;
    }
  },

  exportarPdfInformeSocial: async (pacienteId: number) => {
    try {
      const response = await api.get("/informes-sociales/reporte/pdf", {
        params: { pacienteId },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error al exportar PDF Informe Social:", error);
      throw error;
    }
  },

  exportarPdfInformeSocialPorId: async (id: number | string) => {
    try {
      const response = await api.get(`/informes-sociales/reporte/pdf/id/${id}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error al exportar PDF Informe Social por ID:", error);
      throw error;
    }
  },

  obtenerGenogramaInformeSocial: async (pacienteId: number | string) => {
    try {
      const response = await api.get(
        `/informes-sociales/paciente/${pacienteId}/genograma`,
        {
          responseType: "blob",
        }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error al obtener genograma de informe social:", error);
      throw error;
    }
  },

  obtenerEcomapaInformeSocial: async (pacienteId: number | string) => {
    try {
      const response = await api.get(
        `/informes-sociales/paciente/${pacienteId}/ecomapa`,
        {
          responseType: "blob",
        }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error al obtener ecomapa de informe social:", error);
      throw error;
    }
  },

  obtenerSeguimientoSocial: async (id: number | string) => {
    try {
      const response = await api.get(`/seguimientos-sociales/paciente/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener seguimiento social:", error);
      throw error;
    }
  },

  crearSeguimientoSocial: async (data: any) => {
    try {
      const response = await api.post("/seguimientos-sociales", data);
      return response.data;
    } catch (error) {
      console.error("Error al crear seguimiento social:", error);
      throw error;
    }
  },

  actualizarSeguimientoSocial: async (id: number | string, data: any) => {
    try {
      const response = await api.put(`/seguimientos-sociales/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar seguimiento social:", error);
      throw error;
    }
  },

  eliminarSeguimientoSocial: async (id: number | string) => {
    try {
      const response = await api.delete(`/seguimientos-sociales/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar seguimiento social:", error);
      throw error;
    }
  },

  exportarPdfSeguimientoSocial: async (id: number) => {
    try {
      const response = await api.get(
        "/seguimientos-sociales/reporte/pdf",
        {
          params: { id },
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al exportar PDF Seguimiento Social:", error);
      throw error;
    }
  },

  exportarExcelSeguimientoSocial: async (pacienteId?: number | string) => {
    try {
      const response = await api.get("/seguimientos-sociales/reporte/excel", {
        params: { pacienteId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = pacienteId
        ? `seguimiento_social_${pacienteId}.xlsx`
        : "seguimientos_sociales.xlsx";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar Excel Seguimiento Social:", error);
      throw error;
    }
  },
};
