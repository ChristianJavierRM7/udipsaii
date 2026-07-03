// =====================================================================
// HISTORIAL CLÍNICO — Sistema sin base de datos (localStorage)
// Persiste las últimas 3 evaluaciones (WISC-V / WPPSI-IV E1 / E2)
// =====================================================================

(function () {
  'use strict';

  // ── Llamadas IPC al Backend ───────────────────────────────────────
  async function buscarEnBackend(query = {}) {
    if (window.apiClinica) {
      return await window.apiClinica.invoke('api:evaluaciones:buscar', query);
    }
    return [];
  }

  // ── Guardar evaluación (llamado desde cada módulo) ──────────────────
  window.guardarEnHistorial = async function (datos) {
    if (window.apiClinica) {
      return await window.apiClinica.invoke('api:evaluaciones:guardar', datos);
    }
    return null;
  };

  // ── Badge del botón ─────────────────────────────────────────────────
  async  function actualizarBadgeHistorial(count) {
    // El usuario solicitó eliminar el badge visualmente.
  }

  // ── Colores por tipo de prueba ──────────────────────────────────────
  const TIPO_META = {
    WISC:   { bg:'rgba(0,212,255,0.12)',   border:'rgba(0,212,255,0.3)',   text:'#00d4ff', icon:'psychology' },
    WPPSI1: { bg:'rgba(14, 165, 233,0.1)',    border:'rgba(14, 165, 233,0.3)',   text:'#0ea5e9', icon:'child_care' },
    WPPSI2: { bg:'rgba(16,185,129,0.1)',   border:'rgba(16,185,129,0.3)', text:'#10b981', icon:'child_care' }
  };
  function meta(tipo) { return TIPO_META[tipo] || TIPO_META.WISC; }

  // ── Diagnóstico cualitativo ─────────────────────────────────────────
  function obtenerDiag(ci) {
    if (!ci || ci === '—') return '—';
    const v = parseInt(ci);
    if (v < 70)  return 'Muy bajo';
    if (v <= 79)  return 'Límite';
    if (v <= 89)  return 'Medio bajo';
    if (v <= 109) return 'Medio';
    if (v <= 119) return 'Medio alto';
    if (v <= 129) return 'Superior';
    return 'Muy superior';
  }
  function colorDiag(diag) {
    const mapa = { 'Muy superior':'#0ea5e9', 'Superior':'#10b981', 'Medio alto':'#84cc16',
      'Medio':'#64748b', 'Medio bajo':'#f59e0b', 'Límite':'#f97316', 'Muy bajo':'#ef4444' };
    return mapa[diag] || '#94a3b8';
  }
  function formatIC(d) {
    if (d.ic_95_min != null && d.ic_95_max != null) return `${d.ic_95_min} - ${d.ic_95_max}%`;
    if (d.ic95 && d.ic95 !== '—') return d.ic95.replace(/(\d+)-(\d+)/, '$1 - $2%');
    return '—';
  }

  // ══════════════════════════════════════════════════════════════════════
  // MODAL HISTORIAL — lista de evaluaciones recientes
  // ══════════════════════════════════════════════════════════════════════
  let _busquedaTimeout = null;

  window.buscarEnHistorialUI = async function () {
    const inputNombre = document.getElementById('buscador_historial_nombre');
    const inputFecha = document.getElementById('buscador_historial_fecha');
    
    const query = {
      nombre: inputNombre ? inputNombre.value : '',
      fecha: inputFecha ? inputFecha.value : ''
    };

    const lista = document.getElementById('historial_lista_evaluaciones');
    if (lista) lista.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">sync</span><br>Buscando...</div>';
    
    if (_busquedaTimeout) clearTimeout(_busquedaTimeout);
    _busquedaTimeout = setTimeout(async () => {
      // Mostrar hasta 100 por defecto
      if (!query.nombre && !query.fecha) query.size = '100';
      else query.size = '100';

      const historial = await buscarEnBackend(query);
      renderizarLista(historial);
    }, 300); // 300ms debounce
  };

  window.limpiarBuscadorHistorial = function() {
    const inputNombre = document.getElementById('buscador_historial_nombre');
    const inputFecha = document.getElementById('buscador_historial_fecha');
    if (inputNombre) inputNombre.value = '';
    if (inputFecha) inputFecha.value = '';
    window.buscarEnHistorialUI();
  };

  window.abrirHistorial = async function () {
    const inputNombre = document.getElementById('buscador_historial_nombre');
    const inputFecha = document.getElementById('buscador_historial_fecha');
    if (inputNombre) inputNombre.value = '';
    if (inputFecha) inputFecha.value = '';
    
    const lista = document.getElementById('historial_lista_evaluaciones');
    if (lista) lista.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">sync</span><br>Cargando...</div>';

    const modal = document.getElementById('modal_historial_clinico');
    if (!modal) return;
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.set(modal, { display: 'flex', autoAlpha: 0 });
    gsap.set(modal.firstElementChild, { scale: 0.9, y: 30 });
    gsap.to(modal, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' });

    // Por defecto cargar hasta las últimas 100
    const historial = await buscarEnBackend({ size: '100' });
    renderizarLista(historial);
  };

  window.cerrarHistorial = function () {
    const modal = document.getElementById('modal_historial_clinico');
    if (!modal) return;
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, { autoAlpha: 0, duration: 0.22, ease: 'power2.in',
      onComplete: () => { modal.style.display = 'none'; } });
    gsap.to(modal.firstElementChild, { scale: 0.9, y: 20, duration: 0.22, ease: 'power2.in' });
  };

  function renderizarLista(historial) {
    const lista = document.getElementById('historial_lista_evaluaciones');
    if (!lista) return;
    if (historial.length === 0) {
      lista.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#94a3b8;background:#f8fafc;border-radius:16px;border:2px dashed #e2e8f0;margin-top:20px;">
          <span class="material-symbols-rounded" style="font-size:64px;display:block;margin-bottom:16px;opacity:0.5;color:#cbd5e1;">history_toggle_off</span>
          <p style="font-size:1.1rem;margin:0 0 8px;font-weight:600;color:#64748b;">No hay evaluaciones guardadas aún.</p>
          <p style="font-size:0.9em;opacity:0.8;">Se guardan automáticamente al calcular resultados.</p>
        </div>`;
      return;
    }

    let filas = historial.map((ev, idx) => {
      const m = meta(ev.tipo);
      const fecha = ev.timestamp
        ? new Date(ev.timestamp).toLocaleDateString('es-ES', {day:'2-digit',month:'short',year:'numeric'})
        : '—';
      const hora = ev.timestamp
        ? new Date(ev.timestamp).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})
        : '';
      const edadMeses = ev.edadMeses || ev.paciente?.edadMeses || 0;
      const edadTexto = edadMeses
        ? `${Math.floor(edadMeses/12)} años, ${edadMeses%12} m`
        : '—';

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'">
          <td style="padding: 16px 20px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:42px;height:42px;border-radius:12px;background:${m.bg};color:${m.text};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px ${m.border};flex-shrink:0;">
                <span class="material-symbols-rounded" style="font-size:24px;">${m.icon}</span>
              </div>
              <div>
                <div style="font-weight:700;font-size:1.05rem;color:#1e293b;margin-bottom:2px;">${ev.nombre || ev.paciente?.nombre || 'Sin nombre'}</div>
                <div style="font-size:0.85em;color:#64748b;display:flex;align-items:center;gap:4px;">
                  <span class="material-symbols-rounded" style="font-size:14px;">stethoscope</span>
                  ${ev.examinador || ev.paciente?.examinador || 'N/A'}
                </div>
              </div>
            </div>
          </td>
          <td style="padding: 16px 20px;">
            <div style="display:inline-flex;align-items:center;background:${m.bg};border:1px solid ${m.border};color:${m.text};padding:6px 12px;border-radius:8px;font-size:0.8rem;font-weight:700;text-transform:uppercase;">
              ${ev.tipoPrueba}
            </div>
          </td>
          <td style="padding: 16px 20px;">
            <div style="font-weight:600;color:#334155;font-size:0.95rem;margin-bottom:2px;">${fecha} <span style="font-weight:400;color:#94a3b8;font-size:0.9em;">${hora}</span></div>
            <div style="font-size:0.85em;color:#64748b;display:flex;align-items:center;gap:4px;">
              <span class="material-symbols-rounded" style="font-size:14px;color:#10b981;">child_care</span>
              ${edadTexto}
            </div>
          </td>
          <td style="padding: 16px 20px; text-align:right;">
            <button onclick="window.revisarEvaluacion('${ev.id}')"
              style="padding:8px 12px;background:#ffffff;color:#0f172a;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.2s;"
              title="Revisar Resultados"
              onmouseenter="this.style.background='#f8fafc';this.style.borderColor='#cbd5e1';this.style.color='${m.text}'" 
              onmouseleave="this.style.background='#ffffff';this.style.borderColor='#e2e8f0';this.style.color='#0f172a'">
              <span class="material-symbols-rounded" style="font-size:20px;">visibility</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    lista.innerHTML = `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <table style="width:100%;border-collapse:collapse;text-align:left;">
          <thead style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <tr>
              <th style="padding:16px 20px;font-weight:700;color:#475569;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;">Paciente</th>
              <th style="padding:16px 20px;font-weight:700;color:#475569;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;">Prueba</th>
              <th style="padding:16px 20px;font-weight:700;color:#475569;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;">Fecha y Edad</th>
              <th style="padding:16px 20px;font-weight:700;color:#475569;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════════════
  // MODAL REVISIÓN — resultados completos
  // ══════════════════════════════════════════════════════════════════════
  window._historialEvaluacionActual = null;

  window.revisarEvaluacion = async function (id) {
    if (!window.apiClinica) return;
    
    try {
      const ev = await window.apiClinica.invoke('api:evaluaciones:leer', { id: id });
      if (!ev) return;
      window._historialEvaluacionActual = ev;

      // Cerrar modal de historial primero
      window.cerrarHistorial();

      // Esperar a que cierre, luego abrir revisión
      setTimeout(() => {
        poblarModalRevision(ev);
        const modal = document.getElementById('modal_revisar_evaluacion');
        if (!modal) return;
        gsap.killTweensOf([modal, modal.firstElementChild]);
        gsap.set(modal, { display: 'flex', autoAlpha: 0 });
        gsap.set(modal.firstElementChild, { scale: 0.9, y: 40 });
        gsap.to(modal, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
        gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' });

        // Dibujar gráfica DESPUÉS de que el modal sea visible
        setTimeout(() => dibujarGraficaRevision(ev), 400);
      }, 300);
    } catch (e) {
      console.error(e);
      if (window.mostrarAlertaLocal) window.mostrarAlertaLocal('Error al cargar la evaluación.', 'error');
    }
  };

  window.cerrarRevisar = function () {
    const modal = document.getElementById('modal_revisar_evaluacion');
    if (!modal) return;
    if (window._graficoHistorialRevisar) {
      window._graficoHistorialRevisar.destroy();
      window._graficoHistorialRevisar = null;
    }
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => { 
        modal.style.display = 'none'; 
        // Solucion al bug de cierre vacio:
        // Re-abrir la lista del historial para que el usuario no se quede en una pantalla negra
        window.abrirHistorial();
      } 
    });
    gsap.to(modal.firstElementChild, { scale: 0.9, y: 30, duration: 0.25, ease: 'power2.in' });
  };

  window.eliminarEvaluacionActual = async function() {
    if (!window._historialEvaluacionActual || !window._historialEvaluacionActual.id) return;
    
    if (typeof window.confirmarClinico !== 'function') return;

    const modalRevision = document.getElementById('modal_revisar_evaluacion');
    
    // 1. Ocultar el modal de revisión temporalmente
    if (modalRevision) gsap.to(modalRevision, { autoAlpha: 0, duration: 0.2 });
    
    // 2. Pedir confirmación
    const confirmado = await window.confirmarClinico('¿Estás seguro de eliminar esta evaluación permanentemente? Esta acción no se puede deshacer.');
    
    if (!confirmado) {
      // Si cancela, reaparecer el modal de revisión
      if (modalRevision) gsap.to(modalRevision, { autoAlpha: 1, duration: 0.2 });
      return;
    }

    // 3. Si acepta, eliminar
    try {
      await window.apiClinica.invoke('api:evaluaciones:eliminar', { id: window._historialEvaluacionActual.id });
      if (typeof window.mostrarAlertaLocal === 'function') {
        window.mostrarAlertaLocal('Evaluación eliminada correctamente.', 'success');
      }
      
      // Limpiar y cerrar revisión por completo
      window.cerrarRevisar();
      // Opcional: Reabrir el historial para ver la lista actualizada
      window.buscarEnHistorialUI();
      window.abrirHistorial(); 
    } catch (e) {
      console.error(e);
      if (typeof window.mostrarAlertaLocal === 'function') {
        window.mostrarAlertaLocal('Error al eliminar la evaluación: ' + e.message, 'error');
      }
      // Restaurar si falla
      if (modalRevision) gsap.to(modalRevision, { autoAlpha: 1, duration: 0.2 });
    }
  };

  function poblarModalRevision(ev) {
    const m = meta(ev.tipo);

    // Título
    const titulo = document.getElementById('revisar_titulo_prueba');
    if (titulo) titulo.textContent = `Revisión — ${ev.tipoPrueba}`;
    const subtitulo = document.getElementById('revisar_subtitulo_prueba');
    if (subtitulo) {
      const ts = ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-ES') : '';
      subtitulo.textContent = ts ? `Evaluado el ${ts}` : '';
    }
    const iconEl = document.getElementById('revisar_tipo_icono');
    if (iconEl) { iconEl.textContent = m.icon; iconEl.style.color = m.text; }

    // Info del paciente
    const header = document.getElementById('revisar_header_info');
    if (header) {
      const edadMeses = ev.paciente?.edadMeses || 0;
      const edadTexto = edadMeses
        ? `${Math.floor(edadMeses/12)} años y ${edadMeses%12} meses`
        : '—';
      const fechaStr = ev.paciente?.fechaEval
        ? new Date(ev.paciente.fechaEval+'T00:00:00').toLocaleDateString('es-ES')
        : (ev.timestamp ? new Date(ev.timestamp).toLocaleDateString('es-ES') : '—');

      // Obtener fecha de nacimiento: usar el valor guardado, o calcular desde fechaEval - edadMeses
      const fechaNacRaw = (ev.paciente?.fechaNac || '').trim();
      let nacStr = '—';
      if (fechaNacRaw) {
        nacStr = new Date(fechaNacRaw + 'T00:00:00').toLocaleDateString('es-ES');
      } else if (ev.paciente?.fechaEval && edadMeses > 0) {
        // Fallback: calcular fecha aproximada de nacimiento
        const fEval = new Date(ev.paciente.fechaEval + 'T00:00:00');
        fEval.setMonth(fEval.getMonth() - edadMeses);
        nacStr = fEval.toLocaleDateString('es-ES') + ' (aprox.)';
      }
      header.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.88em;">
          <div><strong>Paciente:</strong> ${ev.paciente?.nombre || '—'}</div>
          <div><strong>Examinador:</strong> ${ev.paciente?.examinador || '—'}</div>
          <div><strong>Edad:</strong> ${edadTexto}</div>
          <div><strong>Fecha de Evaluación:</strong> ${fechaStr}</div>
          <div><strong>Fecha de Nacimiento:</strong> ${nacStr}</div>
          <div><span style="color:${m.text};font-weight:700;">${ev.tipoPrueba}</span></div>
        </div>`;
    }

    // Tabla de escalares
    const tablaEsc = document.getElementById('revisar_tabla_escalares');
    if (tablaEsc && ev.subpruebas?.length) {
      tablaEsc.innerHTML = `
        <h4 class="titulo-seccion-informe" style="margin-top:0;">1. Puntuaciones Escalares</h4>
        <div class="table-responsive">
          <table class="tabla-resultados-clinica">
            <thead><tr><th>Subprueba</th><th style="text-align:center;">P. Directa</th><th style="text-align:center;">P. Escalar</th></tr></thead>
            <tbody>${ev.subpruebas.map(s => `
              <tr>
                <td>${s.nombre || s.sub} <span style="color:var(--text-muted);font-size:0.85em;">(${s.sub})</span></td>
                <td style="text-align:center;">${s.directa}</td>
                <td style="text-align:center;color:var(--accent-cyan);font-weight:700;">${s.escalar}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else if (tablaEsc) {
      tablaEsc.innerHTML = '';
    }

    // Tabla de índices
    const tablaIdx = document.getElementById('revisar_tabla_indices');
    if (tablaIdx && ev.indices) {
      const nombresIdx = {
        ICV:'Comprensión Verbal (ICV)', IVE:'Visoespacial (IVE)',
        IRF:'Razonamiento Fluido (IRF)', IMT:'Memoria de Trabajo (IMT)',
        IVP:'Velocidad Procesamiento (IVP)', CIT:'Escala Total (CIT)'
      };
      tablaIdx.innerHTML = `
        <h4 class="titulo-seccion-informe" style="margin-top:0;">2. Índices Clínicos y Diagnóstico</h4>
        <div class="table-responsive">
          <table class="tabla-resultados-clinica">
            <thead>
              <tr><th>Índice</th><th style="text-align:center;">Suma Esc.</th><th style="text-align:center;">Puntuación Comp.</th>
              <th style="text-align:center;">Percentil</th><th style="text-align:center;">IC 95%</th><th style="text-align:center;">Diagnóstico</th></tr>
            </thead>
            <tbody>${Object.entries(ev.indices).map(([k, d]) => {
              const diag = obtenerDiag(d.ci);
              return `<tr>
                <td style="font-weight:700;color:var(--accent-cyan);">${nombresIdx[k] || k}</td>
                <td style="text-align:center;">${d.suma ?? 0}</td>
                <td style="text-align:center;font-weight:700;font-size:1.15em;color:var(--accent-cyan);">${d.ci || '—'}</td>
                <td style="text-align:center;">${d.percentil || '—'}</td>
                <td style="text-align:center;font-size:0.9em;">${formatIC(d)}</td>
                <td style="text-align:center;"><span style="color:${colorDiag(diag)};font-weight:700;">${diag}</span></td>
              </tr>`;
            }).join('')}
            </tbody>
          </table>
        </div>`;
    } else if (tablaIdx) {
      tablaIdx.innerHTML = '';
    }
  }

  function dibujarGraficaRevision(ev) {
    const canvas = document.getElementById('grafico_historial_revisar');
    if (!canvas || !ev.datosGrafica || !ev.chartLabels) return;

    if (window._graficoHistorialRevisar) {
      window._graficoHistorialRevisar.destroy();
      window._graficoHistorialRevisar = null;
    }

    const datos = ev.datosGrafica.map(v => (!v || v === '—') ? null : parseInt(v));
    const color = ev.chartColor || '#00c8ff';

    window._graficoHistorialRevisar = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ev.chartLabels,
        datasets: [
          { label: 'CI', data: datos, borderColor: color,
            backgroundColor: color + '22', borderWidth: 3,
            pointBackgroundColor: '#003366', pointRadius: 6,
            fill: true, tension: 0.3 },
          { label: 'Promedio (100)',
            data: Array(ev.chartLabels.length).fill(100),
            borderColor: 'rgba(189,22,4,0.75)', borderWidth: 2,
            borderDash: [5,5], pointRadius: 0, fill: false }
        ]
      },
      options: {
        animation: false,
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { min: 40, max: 160,
            ticks: { color: window.getChartTextColor ? window.getChartTextColor() : '#94a3b8' },
            grid:  { color: 'rgba(148,163,184,0.1)' } },
          x: { ticks: { color: window.getChartTextColor ? window.getChartTextColor() : '#94a3b8', font: { weight:'bold' } },
            grid: { display: false } }
        },
        plugins: { legend: { display: false }, tooltip: { intersect: false } }
      },
      plugins: [{
        id: 'reglasHistorial',
        beforeDraw: (chart) => {
          const { ctx: c, chartArea, scales: { x, y } } = chart;
          if (!chartArea) return;
          c.save();
          c.lineWidth = 1; c.strokeStyle = 'rgba(148,163,184,0.2)';
          for (let i = 0; i < x.ticks.length; i++) {
            const xPos = x.getPixelForTick(i);
            c.beginPath(); c.moveTo(xPos, chartArea.top); c.lineTo(xPos, chartArea.bottom); c.stroke();
            for (let val = 40; val <= 160; val += 5) {
              const yPos = y.getPixelForValue(val);
              c.beginPath(); c.moveTo(xPos-5, yPos); c.lineTo(xPos+5, yPos); c.stroke();
            }
          }
          c.lineWidth = 2; c.strokeStyle = 'rgba(189,22,4,0.7)';
          const y100 = y.getPixelForValue(100);
          c.beginPath(); c.moveTo(chartArea.left, y100); c.lineTo(chartArea.right, y100); c.stroke();
          c.restore();
        }
      }]
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // EXPORTAR PDF DESDE REVISIÓN
  // (Implementación centralizada en pdf-generator.js)
  // ══════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ══════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeHistorial();
  });

})();
