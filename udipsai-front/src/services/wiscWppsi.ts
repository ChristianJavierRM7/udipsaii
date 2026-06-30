import api from "../api/api";

// ─────────────────────── TIPOS / INTERFACES ──────────────────────────────────

export interface EscalarRequest {
  subprueba: string;
  edadMeses: number;
  directa: number;
}

export interface IndiceResultado {
  suma: number;
  ci: string | null;
  percentil: string | null;
  ic_90_min?: string | null;
  ic_90_max?: string | null;
  ic_95_min?: string | null;
  ic_95_max?: string | null;
  error?: string;
}

export interface CalculoWiscResponse {
  edadMeses: number;
  indices: Record<string, IndiceResultado>;
}

export interface CalculoWppsiResponse {
  edadMeses: number;
  etapa: "ETAPA1" | "ETAPA2";
  indices: Record<string, IndiceResultado>;
}

export interface PacienteEvalData {
  nombre: string;
  examinador: string;
  edadMeses: number;
  fechaEval?: string;
  fechaNac?: string;
}

export interface GuardarEvaluacionRequest {
  tipo: "WISC" | "WPPSI";
  tipoPrueba: string;
  pacienteId?: number | null;
  paciente: PacienteEvalData;
  [key: string]: unknown; // campos extra del payload (puntajes, índices, etc.)
}

export interface GuardarEvaluacionResponse {
  ok: boolean;
  id: string;
}

export interface EvaluacionResumen {
  id: string;
  tipo: string;
  tipoPrueba: string;
  timestamp: string;
  nombrePaciente: string;
  examinador: string;
  edadMeses: number;
  pacienteId: number | null;
}

export interface BuscarEvaluacionRequest {
  nombre?: string;
  fecha?: string;
  tipo?: "WISC" | "WPPSI" | "";
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─────────────────────────── SERVICIO ────────────────────────────────────────

/**
 * Servicio de conexión con la API REST de evaluaciones WISC-V y WPPSI-IV.
 *
 * Todos los métodos usan la instancia `api` de Axios configurada en api/api.ts,
 * que inyecta automáticamente el token JWT en cada petición.
 *
 * Base URLs:
 * - /api/v1/wisc/**           → baremos WISC-V
 * - /api/v1/wppsi/**          → baremos WPPSI-IV
 * - /api/v1/evaluaciones-wisc/** → CRUD de evaluaciones
 */
export const wiscWppsiService = {

  // ─── WISC-V ──────────────────────────────────────────────────────────────

  /**
   * Convierte una puntuación directa a escalar para una subprueba WISC-V.
   */
  calcularEscalarWisc: async (data: EscalarRequest): Promise<{ escalar: number }> => {
    const response = await api.post<{ escalar: number }>("/v1/wisc/escalar", data);
    return response.data;
  },

  /**
   * Calcula los índices compuestos WISC-V desde las sumas de escalares.
   * payload incluye edadMeses + uno o más índices (ICV, IRP, IMT, IVP, CIT).
   */
  calcularIndicesWisc: async (
    payload: Record<string, number>
  ): Promise<CalculoWiscResponse> => {
    const response = await api.post<CalculoWiscResponse>("/v1/wisc/calcular", payload);
    return response.data;
  },

  // ─── WPPSI-IV ────────────────────────────────────────────────────────────

  /**
   * Convierte una puntuación directa a escalar para una subprueba WPPSI-IV.
   * La etapa se detecta automáticamente por la edad en meses.
   */
  calcularEscalarWppsi: async (data: EscalarRequest): Promise<{ escalar: number }> => {
    const response = await api.post<{ escalar: number }>("/v1/wppsi/escalar", data);
    return response.data;
  },

  /**
   * Calcula índices compuestos WPPSI-IV – Etapa 1 (30-47 meses).
   */
  calcularIndicesWppsiEtapa1: async (
    payload: Record<string, number>
  ): Promise<CalculoWppsiResponse> => {
    const response = await api.post<CalculoWppsiResponse>(
      "/v1/wppsi/calcular/etapa1",
      payload
    );
    return response.data;
  },

  /**
   * Calcula índices compuestos WPPSI-IV – Etapa 2 (48-71 meses).
   */
  calcularIndicesWppsiEtapa2: async (
    payload: Record<string, number>
  ): Promise<CalculoWppsiResponse> => {
    const response = await api.post<CalculoWppsiResponse>(
      "/v1/wppsi/calcular/etapa2",
      payload
    );
    return response.data;
  },

  // ─── CRUD EVALUACIONES ───────────────────────────────────────────────────

  /**
   * Guarda una evaluación WISC o WPPSI completa en el servidor.
   */
  guardarEvaluacion: async (
    data: GuardarEvaluacionRequest
  ): Promise<GuardarEvaluacionResponse> => {
    const response = await api.post<GuardarEvaluacionResponse>(
      "/v1/evaluaciones-wisc",
      data
    );
    return response.data;
  },

  /**
   * Búsqueda paginada de evaluaciones con filtros opcionales.
   */
  buscarEvaluaciones: async (
    filtros: BuscarEvaluacionRequest = {}
  ): Promise<PageResponse<EvaluacionResumen>> => {
    const payload = {
      nombre: filtros.nombre ?? "",
      fecha:  filtros.fecha  ?? "",
      tipo:   filtros.tipo   ?? "",
      page:   String(filtros.page  ?? 0),
      size:   String(filtros.size  ?? 20),
    };
    const response = await api.post<PageResponse<EvaluacionResumen>>(
      "/v1/evaluaciones-wisc/buscar",
      payload
    );
    return response.data;
  },

  /**
   * Recupera el payload completo de una evaluación por su ID.
   */
  obtenerEvaluacion: async (id: string): Promise<Record<string, unknown>> => {
    const response = await api.get<Record<string, unknown>>(
      `/v1/evaluaciones-wisc/${id}`
    );
    return response.data;
  },

  /**
   * Elimina permanentemente una evaluación.
   */
  eliminarEvaluacion: async (id: string): Promise<{ ok: boolean }> => {
    const response = await api.delete<{ ok: boolean }>(
      `/v1/evaluaciones-wisc/${id}`
    );
    return response.data;
  },
};
