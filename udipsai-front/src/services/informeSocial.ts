import api from "../api/api";

export const informeSocialService = {
  listar: async () => {
    const res = await api.get("/api/informes-sociales");
    return res.data;
  },

  obtenerPorId: async (id: number | string) => {
    const res = await api.get(`/api/informes-sociales/${id}`);
    return res.data;
  },

  obtenerPorCedula: async (cedula: string) => {
    const res = await api.get(`/api/informes-sociales/paciente/${cedula}`);
    return res.data;
  },

  crear: async (data: FormData) => {
    const res = await api.post("/api/informes-sociales/crear", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  actualizar: async (id: number | string, data: FormData) => {
    const res = await api.put(`/api/informes-sociales/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  eliminar: async (id: number | string) => {
    const res = await api.delete(`/api/informes-sociales/${id}`);
    return res.data;
  },

  exportarExcel: async (cedula?: string) => {
    const res = await api.get("/api/informes-sociales/reporte/excel", {
      params: cedula ? { cedula } : {},
      responseType: "blob",
    });
    return res.data;
  },

  exportarPdf: async (cedula: string) => {
    const res = await api.get("/api/informes-sociales/reporte/pdf", {
      params: { cedula },
      responseType: "blob",
    });
    return res.data;
  },
};
