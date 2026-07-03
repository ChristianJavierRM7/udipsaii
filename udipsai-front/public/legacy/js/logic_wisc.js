// ==========================================
// LÓGICA DE CÁLCULO Y REPORTE POPUP: WISC-V
// ==========================================

// Variable global para guardar los CI (para la gráfica)
window.datosGraficaWISC = null;

// 1. Control de Modales con Animaciones Premium de GSAP
window.abrirModalWISC = () => { 
  const modal = document.getElementById('modal_resultados_wisc');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.set(modal, { display: 'flex', autoAlpha: 0 });
    gsap.set(modal.firstElementChild, { scale: 0.8, y: 30 });
    gsap.to(modal, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" });
    
    // Animar las filas de la tabla de resultados y títulos en cascada
    const filas = modal.querySelectorAll('table tr, h4');
    if (filas.length > 0) {
      gsap.killTweensOf(filas);
      gsap.fromTo(filas, 
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.03, delay: 0.25 }
      );
    }
  }
};
window.cerrarModalWISC = () => { 
  const modal = document.getElementById('modal_resultados_wisc');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { modal.style.display = 'none'; } });
    gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.25, ease: "power2.in" });
  }
};
window.abrirModalGraficaWISC = () => { 
  const modal = document.getElementById('modal_grafica_wisc');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.set(modal, { display: 'flex', autoAlpha: 0 });
    gsap.set(modal.firstElementChild, { scale: 0.8, y: 30 });
    gsap.to(modal, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" });
  }
};
window.cerrarModalGraficaWISC = () => { 
  const modal = document.getElementById('modal_grafica_wisc');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { modal.style.display = 'none'; } });
    gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.25, ease: "power2.in" });
  }
};
window.cerrarExitoPDFWISC = () => { 
  const modal = document.getElementById('modal_exito_pdf_wisc');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { modal.style.display = 'none'; } });
    gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.25, ease: "power2.in" });
  }
};

// 2. Diagnóstico Cualitativo
const obtenerDiagnosticoWISC = (ci) => {
  if (ci === "—" || !ci) return "—";
  const valor = parseInt(ci);
  if (valor < 70) return "Extremadamente bajo";
  if (valor >= 70 && valor <= 79) return "Muy bajo";
  if (valor >= 80 && valor <= 89) return "Medio bajo";
  if (valor >= 90 && valor <= 109) return "Medio";
  if (valor >= 110 && valor <= 119) return "Medio alto";
  if (valor >= 120 && valor <= 129) return "Muy alto";
  if (valor >= 130) return "Extremadamente alto";
  return "—";
};

// 3. PROCESAR RESULTADOS
window.procesarWISC_V = async () => {
  const principales = ['C', 'S', 'M', 'D', 'CL', 'V', 'B', 'PV', 'SD', 'BS'];
  const opcionales = ['I', 'LN', 'CA', 'CO', 'A'];
  const todas = [...principales, ...opcionales];

  const maximosWISC = {
    'C': 58, 'S': 54, 'M': 38, 'D': 54, 'CL': 117, 'V': 54, 'B': 38, 'PV': 38, 'SD': 49, 'BS': 60,
    'I': 60, 'LN': 38, 'CA': 128, 'CO': 38, 'A': 38
  };

  const vaciasPrincipales = [];
  const paraProcesar = [];
  const invalidos = [];

  todas.forEach(sub => {
    const el = document.getElementById(`pd_${sub}`);
    if (el) {
      const val = el.value.trim();
      if (val === '') {
        if (principales.includes(sub)) vaciasPrincipales.push(sub);
      } else {
        const num = Number(val);
        if (num > (maximosWISC[sub] || 150)) {
          invalidos.push(`${sub} (máx ${maximosWISC[sub]})`);
        }
        paraProcesar.push({ sub, directa: num });
      }
    }
  });

  if (invalidos.length > 0) {
    if (typeof window.mostrarModalCorreccionFrontal === 'function') {
      window.mostrarModalCorreccionFrontal(`Puntuaciones inválidas exceden el máximo permitido:<br><br><strong>${invalidos.join('<br>')}</strong><br><br><span style="font-size:0.9em;color:#666;">Por favor, corrija estos valores antes de procesar.</span>`);
    } else {
      window.mostrarAlertaLocal(`Puntuaciones inválidas exceden el máximo permitido: ${invalidos.join(', ')}`, 'warning');
    }
    return;
  }

  if (vaciasPrincipales.length > 0) {
    window.mostrarAlertaLocal(`Faltan puntuaciones en subpruebas principales: ${vaciasPrincipales.join(', ')}`, 'warning');
    return;
  }

  if (paraProcesar.length === 0) {
    window.mostrarAlertaLocal('Ingrese al menos una puntuación directa para procesar.', 'warning');
    return;
  }

  const anos = Number(document.getElementById('edad_anos')?.value || Math.floor((document.getElementById('global_edad_meses')?.value || 0) / 12));
  const meses = Number(document.getElementById('edad_meses')?.value || (document.getElementById('global_edad_meses')?.value || 0) % 12);
  const edadMeses = (anos * 12) + meses;

  if (edadMeses === 0) {
    window.mostrarAlertaLocal("Se requiere establecer la edad cronológica antes de continuar.", "error");
    return;
  }

  if (edadMeses < 72 || edadMeses > 203) {
    window.mostrarAlertaLocal(`Edad fuera de rango para WISC-V (6:0 a 16:11 años). Edad ingresada: ${Math.floor(edadMeses/12)} años y ${edadMeses%12} meses.`, "error");
    return;
  }

  try {
    const api = window.apiEscalar;
    if (typeof api !== 'function') throw new Error("La API no está lista. Asegúrate de que hook-api.js se haya cargado.");

    window.filas = [];
    const escalaresLocales = {};

    for (const item of paraProcesar) {
      const res = await api({ subprueba: item.sub, edadMeses, directa: item.directa });
      window.filas.push({ sub: item.sub, directa: item.directa, escalar: res.escalar });
      escalaresLocales[item.sub] = res.escalar;
    }

    // Preparar nombres para la tabla de conversión
    const nombresPruebas = {
      'C': 'Cubos', 'S': 'Semejanzas', 'M': 'Matrices', 'D': 'Dígitos', 'CL': 'Claves',
      'V': 'Vocabulario', 'B': 'Balanzas', 'PV': 'Puzles visuales', 'SD': 'Span de dibujos',
      'BS': 'Búsqueda de símbolos', 'I': 'Información', 'LN': 'Letras y números',
      'CA': 'Cancelación', 'CO': 'Comprensión', 'A': 'Aritmética'
    };

    // Sobrescribir las funciones globales de logic.js para que hook-api.js lea las filas correctas
    window.obtenerFilasParaGuardar = () => window.filas;
    window.obtenerSumaEscalares = () => {
      const suma = (list) => window.filas.filter(f => list.includes(f.sub)).reduce((a, b) => a + b.escalar, 0);
      return {
        ICV: suma(['S', 'V']), IVE: suma(['C', 'PV']), IRF: suma(['M', 'B']),
        IMT: suma(['D', 'SD']), IVP: suma(['CL', 'BS']), CIT: suma(['C', 'S', 'M', 'D', 'CL', 'V', 'B'])
      };
    };

    const sumas = window.obtenerSumaEscalares();
    const apiCalculo = window.apiCalcularWISC;
    if (typeof apiCalculo !== 'function') throw new Error("La API apiCalcularWISC no está lista.");

    const resultado = await apiCalculo({ edadMeses, ...sumas });
    window.ultimoResultadoWISC = resultado;
    window.wiscCalculado = true;

    // Generar la tabla de Resultados
    const { indices } = resultado;

    // Preparar datos para la gráfica
    window.datosGraficaWISC = [
      indices.ICV?.ci || null,
      indices.IVE?.ci || null,
      indices.IRF?.ci || null,
      indices.IMT?.ci || null,
      indices.IVP?.ci || null,
      indices.CIT?.ci || null
    ];

    let htmlResultados = `
      <h4 class="titulo-seccion-informe">1. Conversión a Puntuaciones Escalares</h4>
      <div class="table-responsive">
        <table class="tabla-resultados-clinica">
          <thead><tr><th>Subprueba (Sigla)</th><th>Puntuación Directa</th><th>Puntuación Escalar</th></tr></thead>
          <tbody>`;

    for (const sub of todas) {
      const val = document.getElementById(`pd_${sub}`)?.value;
      if (val !== '' && val !== undefined && escalaresLocales[sub] !== undefined) {
        htmlResultados += `<tr><td>${nombresPruebas[sub]} (${sub})</td><td>${val}</td><td class="col-accent-clinica" style="font-size:1.15em;">${escalaresLocales[sub]}</td></tr>`;
      }
    }
    htmlResultados += `</tbody></table></div>
      <h4 class="titulo-seccion-informe">2. Índices Clínicos y Diagnóstico Cualitativo</h4>
      <div class="table-responsive">
        <table class="tabla-resultados-clinica">
          <thead><tr><th>Índice Clínico (Sigla)</th><th>Suma Escalares</th><th>Cociente (CI)</th><th>Percentil</th><th>Intervalo Confianza</th><th>Rango Diagnóstico</th></tr></thead>
          <tbody>`;

    const mapeoNombresIndices = {
      'ICV': 'Comprensión Verbal (ICV)',
      'IVE': 'Visoespacial (IVE)',
      'IRF': 'Razonamiento Fluido (IRF)',
      'IMT': 'Memoria de Trabajo (IMT)',
      'IVP': 'Velocidad Proces. (IVP)',
      'CIT': 'Escala Total (CIT)'
    };

    for (const key in mapeoNombresIndices) {
      const nombreIndice = mapeoNombresIndices[key];
      const datos = indices[key] || { suma: sumas[key] || 0, ci: null, percentil: null, ic_95_min: null, ic_95_max: null };

      const ciDisplay = datos.ci ? datos.ci : '—';
      const diag = obtenerDiagnosticoWISC(datos.ci);
      const percentilDisplay = datos.percentil ? datos.percentil : '—';
      const icDisplay = (datos.ic_95_min && datos.ic_95_max) ? `${datos.ic_95_min}% - ${datos.ic_95_max}%` : '—';

      let colDiag = "#666";
      if (diag.includes("alto") || diag.includes("uperior")) colDiag = "#2ecc71"; // Verde
      else if (diag === "Medio") colDiag = "#3498db"; // Azul
      else if (diag === "Medio bajo" || diag === "Límite") colDiag = "#e67e22"; // Naranja
      else if (diag.includes("bajo")) colDiag = "#e74c3c"; // Rojo

      htmlResultados += `<tr><td style="font-weight:bold;color:#003366">${nombreIndice}</td><td>${datos.suma || 0}</td><td class="col-accent-clinica" style="font-size:1.3em;">${ciDisplay}</td><td>${percentilDisplay}</td><td>${icDisplay}</td><td style="color:${colDiag};font-weight:bold;">${diag}</td></tr>`;
    }

    htmlResultados += `</tbody></table></div>`;

    document.getElementById('modal_body_wisc').innerHTML = htmlResultados;
    window.abrirModalWISC();
    window.mostrarAlertaLocal(`Cálculo realizado con éxito.`, "success");

    // ── Guardar en historial clínico (backend) ──────────────────────────
    if (typeof window.guardarEnHistorial === 'function') {
      const nombresPruebasWISC = {
        'C':'Cubos','S':'Semejanzas','M':'Matrices','D':'Dígitos','CL':'Claves',
        'V':'Vocabulario','B':'Balanzas','PV':'Puzles visuales','SD':'Span de dibujos',
        'BS':'Búsqueda de símbolos','I':'Información','LN':'Letras y números',
        'CA':'Cancelación','CO':'Comprensión','A':'Aritmética'
      };
      const subpruebasGuardar = window.filas.map(f => ({
        sub: f.sub,
        nombre: nombresPruebasWISC[f.sub] || f.sub,
        directa: f.directa,
        escalar: f.escalar !== null ? f.escalar : '—'
      }));
      window.guardarEnHistorial({
        id: window._evaluacionIdActual,
        tipo: 'WISC',
        tipoPrueba: 'WISC-V',
        paciente: {
          nombre: document.getElementById('global_nombre_nino')?.value || '',
          examinador: document.getElementById('global_examinador')?.value || '',
          fechaEval: document.getElementById('global_fecha_eval')?.value || '',
          fechaNac: document.getElementById('global_fecha_nac')?.value || '',
          edadMeses
        },
        subpruebas: subpruebasGuardar,
        indices,
        datosGrafica: ['ICV','IVE','IRF','IMT','IVP','CIT'].map(k => indices[k]?.ci || null),
        chartLabels: ['ICV','IVE','IRF','IMT','IVP','CIT'],
        chartColor: '#00d4ff'
      }).then(res => {
        if (res && res.id) window._evaluacionIdActual = res.id;
      }).catch(err => console.error("Error al guardar WISC-V Legacy:", err));
    }
    
    // Fuerza el dibujo de la gráfica en background para que el PDF esté actualizado aunque no abran el modal
    setTimeout(() => {
      if (typeof window.actualizarGraficaWISC_Fondo === 'function') {
        window.actualizarGraficaWISC_Fondo();
      }
    }, 50);

  } catch (error) {
    window.mostrarAlertaLocal(error.message, "error");
  }
};

window.actualizarGraficaWISC_Fondo = () => {
  const ctx = document.getElementById('grafico-perfil');
  if (!ctx || !window.datosGraficaWISC) return;
  if (window.graficoCompuestasWISC_instance) { window.graficoCompuestasWISC_instance.destroy(); }
  
  const etiquetas = ['ICV', 'IVE', 'IRF', 'IMT', 'IVP', 'CIT'];
  const valores = window.datosGraficaWISC.map(val => val === null ? null : parseInt(val));
  const color = '#00c8ff';

  window.graficoCompuestasWISC_instance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Cociente Intelectual (CI)',
          data: valores,
          borderColor: color,
          backgroundColor: 'rgba(0, 200, 255, 0.2)',
          borderWidth: 3,
          pointBackgroundColor: '#003366',
          pointRadius: 6,
          fill: true,
          tension: 0.3
        },
        { 
          label: 'Promedio (100)',
          data: Array(etiquetas.length).fill(100),
          borderColor: 'rgba(189,22,4,0.75)', 
          borderWidth: 2,
          borderDash: [5,5], 
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
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148,163,184,0.1)' }
        },
        x: {
          ticks: { color: '#94a3b8', font: { weight: 'bold' } },
          grid: { display: false }
        }
      },
      plugins: { legend: { display: false }, tooltip: { intersect: false } }
    },
    plugins: [{
      id: 'reglasClinicasWISC',
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
            c.beginPath(); c.moveTo(xPos - 5, yPos); c.lineTo(xPos + 5, yPos); c.stroke();
          }
        }
        c.restore();
      }
    }]
  });
};

// 4. MOSTRAR GRÁFICA WISC
window.mostrarGraficaWISC = () => {
  if (!window.datosGraficaWISC) {
    window.mostrarAlertaLocal(`Primero debes "Procesar Resultados" para generar la gráfica.`, "error");
    return;
  }
  window.abrirModalGraficaWISC();
  // Al abrir el modal forzamos un repintado por si el tamaño del canvas cambió al hacerse visible
  setTimeout(() => {
    if (typeof window.actualizarGraficaWISC_Fondo === 'function') {
      window.actualizarGraficaWISC_Fondo();
    }
  }, 100);
  window.mostrarAlertaLocal(`Gráfica generada correctamente. `, "success");
};

// 5. EXPORTAR A PDF 
// (Implementación centralizada en pdf-generator.js)

window.nuevaEvaluacionWISC = () => {
  // Se ha quitado window.location.reload() para no destruir la sesión y las alertas
  window.volverMenuYLimpiar(); // Llamar a la limpieza global como en WPPSI

  const inputsGlobales = [
    'global_nombre_nino', 'global_examinador', 'global_fecha_evaluacion', 'global_fecha_nacimiento', 'global_edad_meses',
    'nombre_nino', 'examinador', 'fecha_nac', 'fecha_eval', 'edad_anos', 'edad_meses'
  ];
  inputsGlobales.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });

  const subpruebas = ['C', 'S', 'M', 'D', 'CL', 'V', 'B', 'PV', 'SD', 'BS', 'I', 'LN', 'CA', 'CO', 'A'];
  subpruebas.forEach(sub => {
    const input = document.getElementById(`pd_${sub}`);
    if (input) input.value = '';
  });

  window.datosGraficaWISC = null;
  if (window.graficoCompuestasWISC_instance) {
    window.graficoCompuestasWISC_instance.destroy();
  }

  window.filas = [];
  window.ultimoResultadoWISC = null;

  document.getElementById('modal_exito_pdf_wisc').style.display = 'none';
  document.getElementById('modal_grafica_wisc').style.display = 'none';
  document.getElementById('modal_resultados_wisc').style.display = 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.mostrarAlertaLocal("Sistema listo para un nuevo paciente", "success");
};
