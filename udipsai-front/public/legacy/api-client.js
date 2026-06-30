// public/api-client.js
// Todas las funciones se exponen directamente a window
// Actualizado para usar HTTP (fetch) hacia el servidor Express local

window.apiClinica = {
  invoke: async (channel, data = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Mapeo interno de canales a rutas RESTful
      const routeMap = {
        'api:escalar': { url: '/api/wisc/escalar', method: 'POST' },
        'api:wppsi:escalar': { url: '/api/wppsi/escalar', method: 'POST' },
        'api:wisc:calcular': { url: '/api/wisc/calcular', method: 'POST' },
        'api:wppsi:etapa1:calcular': { url: '/api/wppsi/calcular/etapa1', method: 'POST' },
        'api:wppsi:etapa2:calcular': { url: '/api/wppsi/calcular/etapa2', method: 'POST' },
        'api:evaluaciones:guardar': { url: '/api/wisc/evaluaciones', method: 'POST' },
        'api:evaluaciones:buscar': { url: '/api/wisc/evaluaciones/buscar', method: 'POST' },
        'api:evaluaciones:eliminar': { url: `/api/wisc/evaluaciones/${data.id}`, method: 'DELETE', omitBody: true },
        'api:evaluaciones:leer': { url: `/api/wisc/evaluaciones/${data.id}`, method: 'GET', omitBody: true },
        'api:leer:logo:base64': { url: '/legacy/ucacue_b64.txt', method: 'GET', omitBody: true },
        'api:wisc:guardar': { url: '/api/wisc/guardar', method: 'POST' },
        'api:wppsi:etapa1:guardar': { url: '/api/wppsi/etapa1/guardar', method: 'POST' }
      };

      const route = routeMap[channel];
      if (!route) {
        throw new Error(`Canal API no soportado: ${channel}`);
      }

      const fetchOptions = {
        method: route.method,
        headers: headers
      };

      if (!route.omitBody) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(route.url, fetchOptions);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || `Error HTTP: ${response.status}`);
      }

      // Para el caso en que devuelva texto plano o html (ej. api:leer:modulo o logo)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        return await response.text();
      }
      if (contentType && contentType.includes('text/plain')) {
        return await response.text();
      }

      let jsonResponse = await response.json();

      // Si es una búsqueda paginada, extraemos el contenido para no romper el frontend
      if (channel === 'api:evaluaciones:buscar' && jsonResponse.content) {
          jsonResponse = jsonResponse.content;
      }

      return jsonResponse;
    } catch (e) {
      console.error(`Error en fetch a canal ${channel}:`, e);
      throw e;
    }
  }
};

window.apiEscalar = async function({ subprueba, edadMeses, directa }) {
  const j = await window.apiClinica.invoke('api:escalar', { 
    subprueba: String(subprueba).toUpperCase(), 
    edadMeses: Number(edadMeses), 
    directa: Number(directa) 
  });
  return { escalar: j.escalar, fuente: 'real' };
};

window.apiGuardarEvaluacion = async function(payload) {
  return await window.apiClinica.invoke('api:evaluaciones:guardar', payload);
};

window.apiListarEvaluaciones = async function() {
  return [];
};

window.apiCalcularWISC = async function(payload) {
  if (!Number.isInteger(payload.edadMeses)) {
    throw new Error('edadMeses debe ser un número entero');
  }
  return await window.apiClinica.invoke('api:wisc:calcular', payload);
};

window.apiGuardarEvaluacionWISC = async function(payload) {
  return await window.apiClinica.invoke('api:wisc:guardar', payload);
};

// Pre-cargar logo al inicio
window._logoBase64 = null;
(async function precargarLogoUDAIPSAI() {
  try {
    window._logoBase64 = await window.apiClinica.invoke('api:leer:logo:base64');
  } catch (e) {
    console.warn('[LOGO] No se pudo precargar el logo:', e.message);
  }
})();

