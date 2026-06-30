// public/js/logic_wppsi_1.js
// WPPSI-IV Etapa 1 (2:6 – 3:11 años)
// VERSIÓN FUSIONADA: resultados en paneles inline, PDF con gráfica automática.

window.datosGraficaWPPSI1 = null;

// ==========================================
// DIAGNÓSTICO CUALITATIVO
// ==========================================
const obtenerDiagnostico = (ci) => {
  if (!ci || ci === '—') return '—';
  const v = parseInt(ci);
  if (v < 70)  return 'Muy bajo';
  if (v <= 79)  return 'Límite';
  if (v <= 89)  return 'Medio bajo';
  if (v <= 109) return 'Medio';
  if (v <= 119) return 'Medio alto';
  if (v <= 129) return 'Superior';
  return 'Muy superior';
};

// ==========================================
// PROCESAR Y MOSTRAR RESULTADOS (inline)
// ==========================================
window.procesarWPPSI_1 = () => {
  const edadMeses = parseInt(document.getElementById('global_edad_meses')?.value || 0);

  // Determinar rango
  let rangoEdad = null;
  if (edadMeses >= 30 && edadMeses <= 32) rangoEdad = '30-32';
  else if (edadMeses >= 33 && edadMeses <= 35) rangoEdad = '33-35';
  else if (edadMeses >= 36 && edadMeses <= 38) rangoEdad = '36-38';
  else if (edadMeses >= 39 && edadMeses <= 41) rangoEdad = '39-41';
  else if (edadMeses >= 42 && edadMeses <= 44) rangoEdad = '42-44';
  else if (edadMeses >= 45 && edadMeses <= 47) rangoEdad = '45-47';

  if (!rangoEdad) {
    window.mostrarAlertaLocal('Edad fuera de rango WPPSI-IV Etapa 1 (30-47 meses).', 'error');
    return;
  }

  const tablaBaremos = baremos_WPPSI_1?.escalares?.[rangoEdad];
  if (!tablaBaremos) {
    window.mostrarAlertaLocal(`Sin baremos para el rango ${rangoEdad}.`, 'warning');
    return;
  }

  // Leer puntuaciones directas
  const subpruebas     = ['D', 'C', 'R', 'I', 'RO', 'L', 'N'];
  const principales    = ['D', 'C', 'R', 'I', 'RO', 'L'];
  const maximosW1 = { 'D': 31, 'C': 34, 'R': 35, 'I': 29, 'RO': 38, 'L': 20, 'N': 24 };
  const escalares      = {};
  const vacias         = [];
  const invalidos      = [];

  for (const sub of subpruebas) {
    const input = document.getElementById(`pd_${sub}_w1`);
    if (!input || input.value === '') {
      if (principales.includes(sub)) vacias.push(sub);
      continue;
    }
    const directa = parseInt(input.value);
    if (directa > (maximosW1[sub] || 100)) {
      invalidos.push(`${sub} (máx ${maximosW1[sub]})`);
    }
    const tabla   = tablaBaremos[sub];
    const fila    = tabla?.find(b => directa >= b.min && directa <= b.max);
    if (fila) escalares[sub] = fila.pe;
  }

  if (invalidos.length > 0) {
    if (typeof window.mostrarModalCorreccionFrontal === 'function') {
      window.mostrarModalCorreccionFrontal(`Puntuaciones inválidas exceden el máximo permitido:<br><br><strong>${invalidos.join('<br>')}</strong><br><br><span style="font-size:0.9em;color:#666;">Por favor, corrija estos valores antes de procesar.</span>`);
    } else {
      window.mostrarAlertaLocal(`Puntuaciones inválidas exceden el máximo permitido: ${invalidos.join(', ')}`, 'warning');
    }
    return;
  }

  if (vacias.length > 0) {
    window.mostrarAlertaLocal(`Faltan subpruebas principales: ${vacias.join(', ')}`, 'warning');
    return;
  }

  // Calcular sumas de índices
  const sICV = (escalares['D'] || 0) + (escalares['I']  || 0);
  const sIVE = (escalares['C'] || 0) + (escalares['RO'] || 0);
  const sIMT = (escalares['R'] || 0) + (escalares['L']  || 0);
  const sCIT = (escalares['D'] || 0) + (escalares['C']  || 0) +
               (escalares['R'] || 0) + (escalares['I']  || 0) + (escalares['RO'] || 0);

  // Buscar CI en baremos de índices
  const buscarIdx = (nombre, suma) =>
    baremos_WPPSI_1.indices[nombre]?.find(i => i.suma === suma) ||
    { suma, ci: '—', percentil: '—', ic95: '—' };

  const rICV = buscarIdx('ICV', sICV);
  const rIVE = buscarIdx('IVE', sIVE);
  const rIMT = buscarIdx('IMT', sIMT);
  const rCIT = buscarIdx('CIT', sCIT);

  // Guardar para la gráfica y PDF
  window.datosGraficaWPPSI1   = [rICV.ci, rIVE.ci, rIMT.ci, rCIT.ci];
  window._escalaresWPPSI1     = escalares;
  window._indicesWPPSI1       = { ICV: rICV, IVE: rIVE, IMT: rIMT, CIT: rCIT };

  // ──────────── Construir HTML de tablas ────────────
  const nombresPruebas = {
    D: 'Dibujos', C: 'Cubos', R: 'Reconocimiento',
    I: 'Información', RO: 'Rompecabezas', L: 'Localización', N: 'Nombres'
  };

  let htmlTablas = `
    <div class="resultados-grid">
      <div>
        <h4 class="titulo-seccion-informe" style="margin-top:0;">1. Puntuaciones Escalares</h4>
        <div class="table-responsive">
          <table class="tabla-resultados-clinica">
          <thead><tr><th>Subprueba</th><th>P. Directa</th><th>P. Escalar</th></tr></thead>
          <tbody>
  `;
  for (const sub of subpruebas) {
    const input = document.getElementById(`pd_${sub}_w1`);
    if (!input || input.value === '') continue;
    htmlTablas += `<tr>
      <td>${nombresPruebas[sub]} (${sub})</td>
      <td>${input.value}</td>
      <td class="col-accent-clinica" style="font-size:1.15em;">${escalares[sub] ?? '—'}</td>
    </tr>`;
  }
  htmlTablas += `</tbody></table></div>
      </div>
      <div>
        <h4 class="titulo-seccion-informe" style="margin-top:0;">2. Índices Clínicos y Diagnóstico</h4>
        <div class="table-responsive">
          <table class="tabla-resultados-clinica">
          <thead>
            <tr>
              <th>Índice</th><th>Suma Esc.</th><th>CI</th>
              <th>Percentil</th><th>IC 95%</th><th>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
  `;

  const indicesLabel = {
    ICV: 'Comprensión Verbal (ICV)',
    IVE: 'Visoespacial (IVE)',
    IMT: 'Memoria de Trabajo (IMT)',
    CIT: 'Escala Total (CIT)'
  };

  for (const [clave, datos] of [['ICV', rICV], ['IVE', rIVE], ['IMT', rIMT], ['CIT', rCIT]]) {
    const diag = obtenerDiagnostico(datos.ci);
    let colDiag = '#94a3b8';
    if (diag === 'Muy superior') colDiag = '#0ea5e9';
    else if (diag === 'Superior') colDiag = '#10b981';
    else if (diag === 'Medio alto') colDiag = '#84cc16';
    else if (diag === 'Medio') colDiag = '#64748b';
    else if (diag === 'Medio bajo') colDiag = '#f59e0b';
    else if (diag === 'Límite') colDiag = '#f97316';
    else if (diag === 'Muy bajo') colDiag = '#ef4444';

    htmlTablas += `<tr>
      <td style="font-weight:bold;color:#003366;">${indicesLabel[clave]}</td>
      <td style="text-align:center;">${datos.suma}</td>
      <td class="col-accent-clinica" style="text-align:center;font-size:1.3em;">${datos.ci}</td>
      <td style="text-align:center;">${datos.percentil}</td>
      <td style="text-align:center;">${datos.ic95 && datos.ic95 !== '—' ? datos.ic95.replace(/(\d+)-(\d+)/, '$1 - $2%') : datos.ic95}</td>
      <td style="text-align:center;">
        <span class="diag-text" style="color:${colDiag}; font-weight:bold;">${diag}</span>
      </td>
    </tr>`;
  }
  htmlTablas += `</tbody></table></div>
      <div style="margin-top:1rem; width:100%;">
        <h4 class="titulo-seccion-informe" style="margin-top:0; color:#0ea5e9;">3. Perfil de Puntuaciones Compuestas</h4>
        <div style="height:320px;position:relative;margin-top:10px;">
          <canvas id="grafico_compuestas_wppsi_1"></canvas>
        </div>
      </div>
    </div>
  </div>`;

  // ──────────── Inyectar en el panel ────────────
  document.getElementById('modal_body_wppsi1').innerHTML = htmlTablas;

  // Rellenar info del paciente
  const edadAnos  = Math.floor(edadMeses / 12);
  const edadMeses2 = edadMeses % 12;
  const nombre    = document.getElementById('global_nombre_nino')?.value || '—';
  const examina   = document.getElementById('global_examinador')?.value  || '—';
  const fechaEval = document.getElementById('global_fecha_eval')?.value;
  const fechaStr  = fechaEval
    ? new Date(fechaEval + 'T00:00:00').toLocaleDateString('es-ES')
    : new Date().toLocaleDateString('es-ES');

  document.getElementById('info_paciente_reporte_w1').innerHTML = `
    <hr style="border: 1px solid var(--border-color); margin: 20px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: var(--accent-cyan); margin: 0; display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-rounded" style="color:var(--accent-cyan);">child_care</span>
            Perfil Clínico WPPSI-IV
        </h2>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><strong>Paciente:</strong> ${nombre}</div>
      <div><strong>Examinador:</strong> ${examina}</div>
      <div><strong>Edad:</strong> ${edadAnos} años y ${edadMeses2} meses</div>
      <div><strong>Fecha de Evaluación:</strong> ${fechaStr}</div>
    </div>
  `;

  // Mostrar panel de resultados y ocultar el de ingreso
  const panelRes = document.getElementById('panel_resultados_w1');
  const panelIngreso = document.getElementById('panel_ingreso_w1');
  
  if (panelIngreso) panelIngreso.style.display = 'none';
  const btnVolver = document.querySelector('#modulo_wppsi_1 .btn-volver');
  if (btnVolver) btnVolver.style.display = 'none';
  const sidebar = document.querySelector('#modulo_wppsi_1 .clinical-sidebar-card');
  if (sidebar) sidebar.style.display = 'none';
  const layout = document.querySelector('#modulo_wppsi_1 .clinical-dashboard-layout');
  if (layout) layout.style.gridTemplateColumns = '1fr';
  if (panelRes) {
    gsap.killTweensOf(panelRes);
    gsap.set(panelRes, { display: 'block', autoAlpha: 0, y: 30 });
    gsap.to(panelRes, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
    
    // Animar las filas de la tabla de resultados, tarjetas y la gráfica en cascada
    const filasTabla = panelRes.querySelectorAll('.resultado-card, table tr, .grafica-container');
    if (filasTabla.length > 0) {
      gsap.killTweensOf(filasTabla);
      gsap.fromTo(filasTabla, 
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.04, delay: 0.2 }
      );
    }
    
    panelRes.classList.remove('panel-oculto');
    panelRes.classList.add('panel-visible');
  }

  const grid = document.querySelector('#modulo_wppsi_1 .grid-main');
  if (grid) {
    grid.classList.remove('layout-centrado');
    grid.classList.add('layout-expandido');
  }

  // Dibujar gráfica automáticamente
  setTimeout(() => dibujarGraficaWPPSI1(), 150);

  window.mostrarAlertaLocal('Cálculo realizado con éxito.', 'success');
  if (panelRes) panelRes.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // ── Guardar en historial clínico
  if (typeof window.guardarEnHistorial === 'function') {
    const subpruebas = Object.entries(escalares).map(([sub, esc]) => ({
      sub,
      nombre: nombresPruebas[sub] || sub,
      directa: document.getElementById(`pd_${sub}_w1`)?.value || 0,
      escalar: esc
    }));
    window.guardarEnHistorial({
      id: window._evaluacionIdActual,
      tipo: 'WPPSI1',
      tipoPrueba: 'WPPSI-IV (Etapa 1)',
      paciente: {
        nombre: document.getElementById('global_nombre_nino')?.value || '',
        examinador: document.getElementById('global_examinador')?.value || '',
        fechaEval: document.getElementById('global_fecha_eval')?.value || '',
        fechaNac: document.getElementById('global_fecha_nac')?.value || '',
        edadMeses: edadMeses
      },
      subpruebas,
      indices: {
        ICV: { suma: sICV, ci: rICV.ci, percentil: rICV.percentil, ic95: rICV.ic95 },
        IVE: { suma: sIVE, ci: rIVE.ci, percentil: rIVE.percentil, ic95: rIVE.ic95 },
        IMT: { suma: sIMT, ci: rIMT.ci, percentil: rIMT.percentil, ic95: rIMT.ic95 },
        CIT: { suma: sCIT, ci: rCIT.ci, percentil: rCIT.percentil, ic95: rCIT.ic95 }
      },
      datosGrafica: [rICV.ci, rIVE.ci, rIMT.ci, rCIT.ci],
      chartLabels: ['ICV', 'IVE', 'IMT', 'CIT'],
      chartColor: '#0ea5e9'
    }).then(res => {
      if (res && res.id) window._evaluacionIdActual = res.id;
    }).catch(err => console.error("Error al guardar WPPSI-1:", err));
  }
};

// ==========================================
// DIBUJAR GRÁFICA (automática, sin modal)
// ==========================================
function dibujarGraficaWPPSI1() {
  const ctx = document.getElementById('grafico_compuestas_wppsi_1');
  if (!ctx || !window.datosGraficaWPPSI1) return;

  if (window.graficoCompuestasWPPSI1_instance) {
    window.graficoCompuestasWPPSI1_instance.destroy();
  }

  const etiquetas = ['ICV', 'IVE', 'IMT', 'CIT'];
  const valores   = window.datosGraficaWPPSI1.map(v => (v === '—' || !v) ? null : parseInt(v));

  window.graficoCompuestasWPPSI1_instance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'CI',
          data: valores,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(243,156,18,0.12)',
          borderWidth: 3,
          pointBackgroundColor: '#003366',
          pointRadius: 6,
          fill: true,
          tension: 0.3
        },
        {
          label: 'Promedio (100)',
          data: [100, 100, 100, 100],
          borderColor: 'rgba(189,22,4,0.8)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 40, max: 160,
          ticks: {
            stepSize: 5,
            autoSkip: false,
            color: ctx => (ctx.tick?.value === 100) ? '#ef4444' : window.getChartTextColor(),
            font:  ctx => (ctx.tick?.value === 100) ? { weight: 'bold', size: 13 } : { size: 11 }
          },
          grid: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        x: {
          ticks: { color: window.getChartTextColor(), font: { weight: 'bold', size: 13 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false }
      }
    },
    plugins: [{
      id: 'reglasClinicasW1',
      beforeDraw: (chart) => {
        const { ctx: c, chartArea, scales: { x, y } } = chart;
        if (!chartArea) return;
        c.save();
        c.lineWidth = 1;
        c.strokeStyle = '#bbb';
        for (let i = 0; i < x.ticks.length; i++) {
          const xPos = x.getPixelForTick(i);
          c.beginPath(); c.moveTo(xPos, chartArea.top); c.lineTo(xPos, chartArea.bottom); c.stroke();
          for (let val = 40; val <= 160; val += 5) {
            const yPos = y.getPixelForValue(val);
            c.beginPath(); c.moveTo(xPos - 6, yPos); c.lineTo(xPos + 6, yPos); c.stroke();
          }
        }
        const y100 = y.getPixelForValue(100);
        c.lineWidth = 2; c.strokeStyle = 'rgba(189,22,4,0.8)';
        c.beginPath(); c.moveTo(chartArea.left, y100); c.lineTo(chartArea.right, y100); c.stroke();
        c.restore();
      }
    }]
  });
}

// ==========================================
// GENERAR PDF CON GRÁFICA INCLUIDA
// (Implementación centralizada en pdf-generator.js)
// ==========================================

// Alias por si otros módulos lo llaman
window.mostrarGraficaWPPSI_1 = () => {
  if (!window.datosGraficaWPPSI1) {
    window.mostrarAlertaLocal('Primero calcula los resultados.', 'warning');
    return;
  }
  dibujarGraficaWPPSI1();
};
window.editarDatosW1 = () => {
  const pRes = document.getElementById('panel_resultados_w1');
  const pIng = document.getElementById('panel_ingreso_w1');
  if (pRes) {
    pRes.style.display = 'none';
    pRes.classList.replace('panel-visible', 'panel-oculto');
  }
  if (pIng) pIng.style.display = 'block';
  const btnVolver = document.querySelector('#modulo_wppsi_1 .btn-volver');
  if (btnVolver) btnVolver.style.display = '';
  const sidebar = document.querySelector('#modulo_wppsi_1 .clinical-sidebar-card');
  if (sidebar) sidebar.style.display = '';
  const layout = document.querySelector('#modulo_wppsi_1 .clinical-dashboard-layout');
  if (layout) layout.style.gridTemplateColumns = '';
  const grid = document.querySelector('#modulo_wppsi_1 .grid-main');
  if (grid) {
    grid.classList.remove('layout-expandido');
    grid.classList.add('layout-centrado');
  }
};



