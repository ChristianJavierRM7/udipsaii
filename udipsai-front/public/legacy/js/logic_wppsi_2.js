// public/js/logic_wppsi_2.js
// WPPSI-IV Etapa 2 (4:0 - 5:11 años)
// VERSIÓN FUSIONADA: adaptada al sistema unificado (usa global_* IDs y API unificada).

window.procesarWPPSI_2 = async function () {
    // 1. Obtener edad del campo unificado (sistema fusionado)
    const edadMeses = parseInt(document.getElementById('global_edad_meses')?.value || 0);

    if (!edadMeses || edadMeses < 48 || edadMeses > 71) {
        window.mostrarAlertaLocal('Edad fuera de rango para WPPSI-IV Etapa 2 (48-71 meses).', 'error');
        return;
    }

    // 2. Recolectar Puntuaciones Directas (subpruebas principales)
    const subpruebas = {
        C:   document.getElementById('pd_C_w2')?.value,
        I:   document.getElementById('pd_I_w2')?.value,
        M:   document.getElementById('pd_M_w2')?.value,
        BA:  document.getElementById('pd_BA_w2')?.value,
        R:   document.getElementById('pd_R_w2')?.value,
        S:   document.getElementById('pd_S_w2')?.value,
        CON: document.getElementById('pd_CON_w2')?.value,
        CA:  document.getElementById('pd_CA_w2')?.value,
        L:   document.getElementById('pd_L_w2')?.value,
        RO:  document.getElementById('pd_RO_w2')?.value
    };

    // Opcionales
    const opcionales = {
        V:  document.getElementById('pd_V_w2')?.value,
        CF: document.getElementById('pd_CF_w2')?.value,
        CO: document.getElementById('pd_CO_w2')?.value,
        D:  document.getElementById('pd_D_w2')?.value,
        N:  document.getElementById('pd_N_w2')?.value,
        CAA: document.getElementById('pd_CAA_w2')?.value,
        CAE: document.getElementById('pd_CAE_w2')?.value
    };

    // Validar que no falten datos principales (al menos 0)
    const faltantes = Object.entries(subpruebas)
        .filter(([k, v]) => v === '' || v === null || v === undefined)
        .map(([k]) => k);

    if (faltantes.length > 0) {
        window.mostrarAlertaLocal(`Faltan puntuaciones: ${faltantes.join(', ')}. Ingresa al menos 0 en los campos vacíos.`, 'warning');
        return;
    }

    try {
        // Eliminada la alerta de "Calculando baremos..." para evitar duplicados

        // 3. Calcular escalares vía API unificada
        const maximosW2 = { 'C': 34, 'I': 29, 'M': 26, 'BA': 66, 'R': 35, 'S': 40, 'CON': 27, 'CA': 96, 'L': 20, 'RO': 38, 'V': 43, 'CF': 72, 'CO': 40, 'D': 31, 'N': 24, 'CAA': 48, 'CAE': 48 };
        const invalidos = [];
        const todasSubpruebas = { ...subpruebas };
        // Añadir opcionales que tengan valor
        Object.entries(opcionales).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) {
                todasSubpruebas[k] = v;
            }
        });

        for (const [sub, directa] of Object.entries(todasSubpruebas)) {
            if (directa === '' || directa === null || directa === undefined) continue;
            const pd = Number(directa);
            if (pd > (maximosW2[sub] || 100)) {
                invalidos.push(`${sub} (máx ${maximosW2[sub]})`);
            }
        }

        if (invalidos.length > 0) {
            if (typeof window.mostrarModalCorreccionFrontal === 'function') {
                window.mostrarModalCorreccionFrontal(`Puntuaciones inválidas exceden el máximo permitido:<br><br><strong>${invalidos.join('<br>')}</strong><br><br><span style="font-size:0.9em;color:#666;">Por favor, corrija estos valores antes de procesar.</span>`);
            } else {
                window.mostrarAlertaLocal(`Puntuaciones inválidas exceden el máximo permitido: ${invalidos.join(', ')}`, 'warning');
            }
            return;
        }

        const pe = {};
        for (const [sub, directa] of Object.entries(todasSubpruebas)) {
            if (directa === '' || directa === null || directa === undefined) continue;
            const pd = Number(directa);
            try {
                const data = await window.apiClinica.invoke('api:wppsi:escalar', { subprueba: sub, edadMeses, directa: pd });
                pe[sub] = data.escalar;
            } catch (err) {
                console.warn(`⚠️ Sin baremo para ${sub} (pd=${pd}, edad=${edadMeses}m)`);
                pe[sub] = null;
            }
        }

        // 4. Sumar Escalares para Índices
        const sumas = {
            ICV: (pe.I || 0) + (pe.S || 0),
            IVE: (pe.C || 0) + (pe.RO || 0),
            IRF: (pe.M || 0) + (pe.CON || 0),
            IMT: (pe.R || 0) + (pe.L || 0),
            IVP: (pe.BA || 0) + (pe.CA || 0),
            CIT: (pe.I || 0) + (pe.S || 0) + (pe.C || 0) + (pe.M || 0) + (pe.R || 0) + (pe.BA || 0)
        };

        // 5. Obtener Índices Compuestos del servidor
        const dataIndices = await window.apiClinica.invoke('api:wppsi:etapa2:calcular', { edadMeses, ...sumas });

        // 6. Renderizar resultados
        renderizarResultadosW2(pe, sumas, dataIndices.indices);
        window.mostrarAlertaLocal('Cálculo realizado con éxito.', 'success');

    } catch (error) {
        console.error('Error crítico en procesarWPPSI_2:', error);
        window.mostrarAlertaLocal('Error al procesar los datos: ' + error.message, 'error');
    }
};

function renderizarResultadosW2(escalares, sumas, indices) {
    let divResultados = document.getElementById('panel_resultados_w2');
    let divIngreso = document.getElementById('panel_ingreso_w2');
    if (!divResultados) return;
    if (divIngreso) divIngreso.style.display = 'none';
    const btnVolver = document.querySelector('#modulo_wppsi_2 .btn-volver');
    if (btnVolver) btnVolver.style.display = 'none';
    const sidebar = document.querySelector('#modulo_wppsi_2 .clinical-sidebar-card');
    if (sidebar) sidebar.style.display = 'none';
    const layout = document.querySelector('#modulo_wppsi_2 .clinical-dashboard-layout');
    if (layout) layout.style.gridTemplateColumns = '1fr';
    if (divResultados) {
      gsap.killTweensOf(divResultados);
      gsap.set(divResultados, { display: 'block', autoAlpha: 0, y: 30 });
      gsap.to(divResultados, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
      
      // Animar las filas de la tabla de resultados, tarjetas y la gráfica en cascada
      const filasTabla = divResultados.querySelectorAll('.resultado-card, table tr, .grafica-container');
      if (filasTabla.length > 0) {
        gsap.killTweensOf(filasTabla);
        gsap.fromTo(filasTabla, 
          { autoAlpha: 0, y: 15 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.04, delay: 0.2 }
        );
      }
      
      divResultados.classList.remove('panel-oculto');
      divResultados.classList.add('panel-visible');
    }

    const grid = document.querySelector('#modulo_wppsi_2 .grid-main');
    if (grid) {
      grid.classList.remove('layout-centrado');
      grid.classList.add('layout-expandido');
    }

    const nombrePaciente = document.getElementById('global_nombre_nino')?.value || 'No especificado';
    const examinador = document.getElementById('global_examinador')?.value || 'No especificado';
    const edadMeses = parseInt(document.getElementById('global_edad_meses')?.value || 0);
    const anos = Math.floor(edadMeses / 12);
    const mesesRestantes = edadMeses % 12;

    // Obtener fecha de evaluación
    const fechaEvalInput = document.getElementById('global_fecha_eval');
    let fechaEvalStr = fechaEvalInput?.value ? new Date(fechaEvalInput.value + 'T00:00:00').toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES');

    // Diagnóstico cualitativo
    const obtenerDiagWPPSI2 = (ci) => {
        if (!ci) return '—';
        const v = parseInt(ci);
        if (v < 70) return 'Muy bajo';
        if (v <= 79) return 'Límite';
        if (v <= 89) return 'Medio bajo';
        if (v <= 109) return 'Medio';
        if (v <= 119) return 'Medio alto';
        if (v <= 129) return 'Superior';
        return 'Muy superior';
    };

    const nombresPruebas = {
        C: 'Cubos', I: 'Información', M: 'Matrices', BA: 'Búsqueda de Animales',
        R: 'Reconocimiento', S: 'Semejanzas', CON: 'Conceptos', CA: 'Cancelación',
        L: 'Localización', RO: 'Rompecabezas', V: 'Vocabulario', CF: 'Clave de Figuras',
        CO: 'Comprensión', D: 'Dibujos', N: 'Nombres', CAA: 'Cancelación Aleatoria', CAE: 'Cancelación Estructurada'
    };

    const titulos = {
        ICV: 'Comprensión Verbal (ICV)',
        IVE: 'Visoespacial (IVE)',
        IRF: 'Razonamiento Fluido (IRF)',
        IMT: 'Memoria de Trabajo (IMT)',
        IVP: 'Velocidad de Procesamiento (IVP)',
        CIT: 'Escala Total (CIT)'
    };

    let html = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 0.9em;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>Paciente:</strong> ${nombrePaciente}</div>
                <div><strong>Examinador:</strong> ${examinador}</div>
                <div><strong>Edad:</strong> ${anos} años y ${mesesRestantes} meses (${edadMeses} meses)</div>
                <div><strong>Fecha de Evaluación:</strong> ${fechaEvalStr}</div>
            </div>
        </div>

        <div class="resultados-grid">
          <div>
            <h4 class="titulo-seccion-informe" style="margin-top:0;">1. Puntuaciones Escalares</h4>
            <div class="table-responsive">
              <table class="tabla-resultados-clinica">
                <thead><tr><th>Subprueba (Sigla)</th><th>Puntaje Directo</th><th>Puntaje Escalar</th></tr></thead>
                <tbody>
    `;

    for (const [sub, esc] of Object.entries(escalares)) {
        const inputEl = document.getElementById(`pd_${sub}_w2`);
        const pd = inputEl?.value ?? '—';
        html += `<tr>
            <td>${nombresPruebas[sub] || sub} (${sub})</td>
            <td>${pd}</td>
            <td class="col-accent-clinica" style="font-size:1.15em;">${esc !== null ? esc : '—'}</td>
        </tr>`;
    }

    html += `</tbody></table></div>
          </div>
          <div>
            <h4 class="titulo-seccion-informe" style="margin-top:0;">2. Índices Clínicos y Diagnóstico</h4>
            <div class="table-responsive">
              <table class="tabla-resultados-clinica">
                <thead>
                    <tr>
                        <th>Índice</th><th>Suma Escalares</th><th>Cociente (CI)</th>
                        <th>Percentil</th><th>Intervalo 95%</th><th>Diagnóstico</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (const [clave, obj] of Object.entries(indices)) {
        if (!obj) continue;
        const ic = (obj.ic_95_min && obj.ic_95_max) ? `${obj.ic_95_min} - ${obj.ic_95_max}%` : '—';
        const diag = obtenerDiagWPPSI2(obj.ci);
        let colDiag = '#94a3b8';
        if (diag === 'Muy superior') colDiag = '#0ea5e9';
        else if (diag === 'Superior') colDiag = '#10b981';
        else if (diag === 'Medio alto') colDiag = '#84cc16';
        else if (diag === 'Medio') colDiag = '#64748b';
        else if (diag === 'Medio bajo') colDiag = '#f59e0b';
        else if (diag === 'Límite') colDiag = '#f97316';
        else if (diag === 'Muy bajo') colDiag = '#ef4444';

        html += `<tr>
            <td style="font-weight:bold;color:var(--accent-green)">${titulos[clave] || clave}</td>
            <td style="text-align:center;">${sumas[clave] || 0}</td>
            <td class="col-accent-clinica" style="text-align:center;font-size:1.3em;">${obj.ci || '—'}</td>
            <td style="text-align:center;">${obj.percentil || '—'}</td>
            <td style="text-align:center;">${ic}</td>
            <td style="text-align:center;">
                <span class="diag-text" style="color:${colDiag}; font-weight:bold;">${diag}</span>
            </td>
        </tr>`;
    }

    html += `</tbody></table></div>
            <div style="margin-top:1rem; width:100%;">
                <h4 class="titulo-seccion-informe" style="margin-top:0;">3. Perfil de Puntuaciones Compuestas</h4>
                <div style="margin-top: 10px; height: 350px; width: 100%;">
                    <canvas id="grafico_w2"></canvas>
                </div>
            </div>
          </div>
        </div>
    `;

    let divContenido = document.getElementById('contenido_resultados_w2');
    if (divContenido) {
      divContenido.innerHTML = html;
    }

    // Guardar datos para la gráfica
    window.datosGraficaWPPSI2 = Object.keys(titulos).map(k => indices[k]?.ci || null);
    dibujarGraficaW2(indices);

    // ── Guardar en historial clínico
    if (typeof window.guardarEnHistorial === 'function') {
      const nombresPruebasW2 = {
        C:'Cubos', I:'Información', M:'Matrices', BA:'Búsqueda de Animales',
        R:'Reconocimiento', S:'Semejanzas', CON:'Conceptos', CA:'Cancelación',
        L:'Localización', RO:'Rompecabezas', V:'Vocabulario',
        CF:'Clave de Figuras', CO:'Comprensión', D:'Dibujos', N:'Nombres', CAA: 'Cancelación Aleatoria', CAE: 'Cancelación Estructurada'
      };
      const subpruebas = Object.entries(escalares).map(([sub, esc]) => ({
        sub,
        nombre: nombresPruebasW2[sub] || sub,
        directa: document.getElementById(`pd_${sub}_w2`)?.value || 0,
        escalar: esc !== null ? esc : '—'
      }));
      window.guardarEnHistorial({
        id: window._evaluacionIdActual,
        tipo: 'WPPSI2',
        tipoPrueba: 'WPPSI-IV (Etapa 2)',
        paciente: {
          nombre: document.getElementById('global_nombre_nino')?.value || '',
          examinador: document.getElementById('global_examinador')?.value || '',
          fechaEval: document.getElementById('global_fecha_eval')?.value || '',
          fechaNac: document.getElementById('global_fecha_nac')?.value || '',
          edadMeses
        },
        subpruebas,
        indices,
        datosGrafica: ['ICV','IVE','IRF','IMT','IVP','CIT'].map(k => indices[k]?.ci || null),
        chartLabels: ['ICV','IVE','IRF','IMT','IVP','CIT'],
        chartColor: '#10b981'
      }).then(res => {
        if (res && res.id) window._evaluacionIdActual = res.id;
      }).catch(err => console.error("Error al guardar WPPSI-2:", err));
    }
}

function dibujarGraficaW2(indices) {
    const labels = ['ICV', 'IVE', 'IRF', 'IMT', 'IVP', 'CIT'];
    const datos = labels.map(key => indices[key]?.ci || null);
    const ctx = document.getElementById('grafico_w2');
    if (!ctx) return;

    if (window.miGraficoW2) window.miGraficoW2.destroy();

    window.miGraficoW2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Puntuación CI',
                data: datos,
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(0, 212, 255, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#003366',
                pointRadius: 6,
                fill: true,
                tension: 0.3
            }, {
                label: 'Promedio (100)',
                data: [100, 100, 100, 100, 100, 100],
                borderColor: 'rgba(14, 165, 233, 0.8)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 40,
                    max: 160,
                    ticks: {
                        stepSize: 5,
                        autoSkip: false,
                        color: ctx => (ctx.tick?.value === 100) ? '#ef4444' : window.getChartTextColor(),
                        font: ctx => (ctx.tick?.value === 100) ? { weight: 'bold', size: 14 } : { size: 11 }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: window.getChartTextColor(), font: { weight: 'bold', size: 14 } },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { intersect: false }
            }
        },
        plugins: [{
            id: 'reglasClinicasW2',
            beforeDraw: (chart) => {
                const { ctx: c, chartArea, scales: { x, y } } = chart;
                if (!chartArea) return;
                c.save();
                c.lineWidth = 1;
                c.strokeStyle = 'rgba(148, 163, 184, 0.3)';
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

window.editarDatosW2 = () => {
    const pRes = document.getElementById('panel_resultados_w2');
    const pIng = document.getElementById('panel_ingreso_w2');
    if (pRes) {
        pRes.style.display = 'none';
        pRes.classList.replace('panel-visible', 'panel-oculto');
    }
    if (pIng) pIng.style.display = 'block';
    const btnVolver = document.querySelector('#modulo_wppsi_2 .btn-volver');
    if (btnVolver) btnVolver.style.display = '';
    const sidebar = document.querySelector('#modulo_wppsi_2 .clinical-sidebar-card');
    if (sidebar) sidebar.style.display = '';
    const layout = document.querySelector('#modulo_wppsi_2 .clinical-dashboard-layout');
    if (layout) layout.style.gridTemplateColumns = '';
    const grid = document.querySelector('#modulo_wppsi_2 .grid-main');
    if (grid) {
      grid.classList.remove('layout-expandido');
      grid.classList.add('layout-centrado');
    }
};

// ==========================================
// GENERAR PDF WPPSI-IV ETAPA 2
// (Implementación centralizada en pdf-generator.js)
// ==========================================



