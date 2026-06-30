// public/logic.js
// Sistema Fusionado: compatibilidad WISC-V "primera parte" + enrutamiento unificado
// Esta versión limpia elimina duplicados y mantiene solo lo necesario para la vista WISC-V
// (tabla de resultados inline, funciones de guardado, confirmación asíncrona).

let filas = []; // Filas de subpruebas WISC-V (escala directa → escalar)

// ==========================================
// COMPATIBILIDAD WISC-V LEGACY (primera parte)
// ==========================================

window.volverAlInicio = () => {
  ['modulo_wisc', 'modulo_wppsi_1', 'modulo_wppsi_2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const config = document.getElementById('pantalla_configuracion');
  if (config) config.style.display = 'flex';
  
  // Resetear vista previa de edad
  const vistaPrevia = document.getElementById('vista_previa_edad');
  if (vistaPrevia) vistaPrevia.innerHTML = '';

  // Restaurar botones flotantes superiores
  ['btn_logout', 'user_info_badge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'flex';
      gsap.to(el, { autoAlpha: 1, duration: 0.3 });
    }
  });
};


window.limpiarFormularioWisc = () => {
  if (typeof window.limpiarFormulariosGlobal === 'function') {
    window.limpiarFormulariosGlobal();
  }
  
  filas = [];
  actualizarTablaHTML();
  window.ultimoResultadoWISC = null;
  window.wiscCalculado = false;
};

window.nuevaEvaluacion = () => {
  window.volverMenuYLimpiar();
  if (typeof window.mostrarAlertaLocal === 'function') {
    window.mostrarAlertaLocal("Sistema listo para un nuevo paciente", "success");
  }
};

window.cerrarModalPostGuardado = () => {
  const modal = document.getElementById('modal_post_guardado');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { modal.style.display = 'none'; } });
    gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.25, ease: "power2.in" });
  }
};

window.volverMenuYLimpiar = () => {
  const modal = document.getElementById('modal_post_guardado');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.to(modal, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        modal.style.display = 'none';
        if (typeof window.limpiarFormulariosGlobal === 'function') {
          window.limpiarFormulariosGlobal();
        }
        if (typeof window.regresarAConfiguracion === 'function') {
          window.regresarAConfiguracion();
        } else {
          window.volverAlInicio();
        }
      }
    });
    gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.3, ease: "power2.in" });
  } else {
    if (typeof window.limpiarFormulariosGlobal === 'function') {
      window.limpiarFormulariosGlobal();
    }
    if (typeof window.regresarAConfiguracion === 'function') {
      window.regresarAConfiguracion();
    } else {
      window.volverAlInicio();
    }
  }
};

window.mostrarModalPostGuardado = () => {
  const modal = document.getElementById('modal_post_guardado');
  if (modal) {
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.set(modal, { display: 'flex', autoAlpha: 0 });
    gsap.set(modal.firstElementChild, { scale: 0.8, y: 30 });
    gsap.to(modal, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" });
  }
};

// ==========================================
// VALIDACIONES NUMÉRICAS
// ==========================================
window.validarNumero = window.validarNumero || ((input) => {
  if (input.value < 0) input.value = 0;
  input.value = input.value.replace(/[^0-9]/g, '');
  if (input.value === '') return;

  const val = parseInt(input.value);
  const idParts = input.id.split('_'); 
  if (idParts.length >= 2) {
    const sub = idParts[1];
    let module = 'WISC';
    if (idParts[2] === 'w1') module = 'WPPSI1';
    if (idParts[2] === 'w2') module = 'WPPSI2';

    const maxScores = {
      WISC: { C:58, S:54, M:38, D:54, CL:117, V:54, B:38, PV:38, SD:49, BS:60, I:60, LN:38, CA:128, CO:38, A:38 },
      WPPSI2: { C:34, I:29, M:26, BA:66, R:35, S:40, CON:27, CA:96, L:20, RO:38, V:43, CF:72, CO:40, D:31, N:24, CAA:48, CAE:48 },
      WPPSI1: { D:31, C:34, R:35, I:29, RO:38, L:20, N:24 } 
    };

    const maxPosible = maxScores[module] && maxScores[module][sub];
    if (maxPosible && val > maxPosible) {
      input.value = maxPosible;
      if (typeof window.mostrarAlertaLocal === 'function') {
        window.mostrarAlertaLocal(`La puntuación directa máxima para esta subprueba es ${maxPosible}`, 'warning');
      }
    }
  }
});

// ==========================================
// CÁLCULO DE EDAD AUTOMÁTICO (compatibilidad legacy WISC-V)
// ==========================================
window.calcularEdadAutomatica = () => {
  const fechaNac  = document.getElementById('fecha_nac')?.value;
  const fechaEval = document.getElementById('fecha_eval')?.value;
  const notificacion = document.getElementById('notificacion_edad');
  const textoEdad = document.getElementById('edad_texto');

  if (!fechaNac || !fechaEval) return;

  const nacimiento  = new Date(fechaNac  + 'T00:00:00');
  const evaluacion  = new Date(fechaEval + 'T00:00:00');

  if (evaluacion < nacimiento) {
    window.mostrarAlertaLocal('La fecha de evaluación es inconsistente con el nacimiento.', 'error');
    return;
  }

  let anos  = evaluacion.getFullYear() - nacimiento.getFullYear();
  let meses = evaluacion.getMonth()    - nacimiento.getMonth();
  let dias  = evaluacion.getDate()     - nacimiento.getDate();

  if (dias < 0) {
    meses--;
    dias += 30;
  }
  if (meses < 0) { anos--; meses += 12; }

  if (textoEdad) {
    if (anos < 6 || anos >= 17) {
      textoEdad.innerHTML = `${anos} años, ${meses} meses y ${dias} días <br><span style="color:#e74c3c;font-size:0.85em;">⚠️ Fuera del rango WISC-V (6-16 años)</span>`;
      if (notificacion) { notificacion.style.borderLeft = '4px solid #e74c3c'; notificacion.style.background = '#ffe0e0'; }
    } else {
      textoEdad.innerHTML = `${anos} años, ${meses} meses y ${dias} días <br><span style="color:#2ecc71;font-size:0.85em;">✓ Edad válida para WISC-V</span>`;
      if (notificacion) { notificacion.style.borderLeft = '4px solid #2ecc71'; notificacion.style.background = '#e6f7ff'; }
    }
  }

  if (notificacion) notificacion.style.display = 'block';
  const eAnos  = document.getElementById('edad_anos');
  const eMeses = document.getElementById('edad_meses');
  if (eAnos)  eAnos.value  = anos;
  if (eMeses) eMeses.value = meses;
};

// ==========================================
// CONTROL DE INGRESO RÁPIDO (MODAL WISC-V legacy)
// ==========================================
window.toggleIngresoRapido = () => {
  const modal = document.getElementById('modal-puntuaciones');
  if (!modal) return;
  const isVisible = modal.classList.contains('modal-visible') || modal.style.display === 'flex';
  modal.style.display = isVisible ? 'none' : 'flex';
};

window.toggleOpcionales = () => {
  const sec = document.getElementById('seccion_opcionales');
  if (sec) sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
};

// ==========================================
// PROCESAMIENTO DE LOTE WISC-V
// ==========================================
window.procesarLoteSubpruebas = async () => {
  const principales = ['C','S','M','D','CL','V','B','PV','SD','BS'];
  const opcionales  = ['I','LN','CA','CO','A'];
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
    if (!el) return;
    const v = el.value.trim();
    if (v === '') {
      if (principales.includes(sub)) vaciasPrincipales.push(sub);
    } else {
      const num = Number(v);
      if (num > (maximosWISC[sub] || 150)) {
        invalidos.push(`${sub} (máx ${maximosWISC[sub]})`);
      }
      paraProcesar.push({ sub, directa: num });
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
    window.mostrarAlertaLocal('Ingrese al menos una puntuación directa.', 'warning');
    return;
  }

  const anos  = Number(document.getElementById('edad_anos')?.value || 0);
  const meses = Number(document.getElementById('edad_meses')?.value || 0);
  const edadMeses = (anos * 12) + meses;

  if (edadMeses === 0) {
    window.mostrarAlertaLocal('Se requiere la edad cronológica antes de continuar.', 'error');
    return;
  }

  try {
    const api = window.apiEscalar;
    if (typeof api !== 'function') throw new Error('La API no está lista. Verifica que hook-api.js esté cargado.');

    filas = [];
    for (const item of paraProcesar) {
      const res = await api({ subprueba: item.sub, edadMeses, directa: item.directa });
      filas.push({ sub: item.sub, directa: item.directa, escalar: res.escalar });
    }

    actualizarTablaHTML();
    window.mostrarAlertaLocal('Conversión a escala completada.', 'success');

    // Definir funciones globales necesarias para calcularWISC_UI
    window.obtenerFilasParaGuardar = () => filas;
    window.obtenerSumaEscalares = () => {
      const suma = (list) => filas.filter(f => list.includes(f.sub)).reduce((a, b) => a + b.escalar, 0);
      return {
        ICV: suma(['S', 'V']), 
        IVE: suma(['C', 'PV']), 
        IRF: suma(['M', 'B']),
        IMT: suma(['D', 'SD']), 
        IVP: suma(['CL', 'BS']), 
        CIT: suma(['C', 'S', 'M', 'D', 'CL', 'V', 'B'])
      };
    };

    // Cerrar modal legacy
    const modal = document.getElementById('modal-puntuaciones');
    if (modal) modal.style.display = 'none';

    // Revelar panel de resultados y ocultar ingreso
    const gridWisc = document.querySelector('#modulo_wisc .grid-main');
    if (gridWisc) {
      gridWisc.classList.remove('layout-centrado');
      gridWisc.classList.add('layout-expandido');
    }
    
    const panRes = document.getElementById('panel_resultados');
    const panIng = document.getElementById('panel_ingreso_wisc');
    
    if (panIng) panIng.style.display = 'none';
    const btnVolver = document.querySelector('#modulo_wisc .btn-volver');
    if (btnVolver) btnVolver.style.display = 'none';
    const sidebar = document.querySelector('#modulo_wisc .clinical-sidebar-card');
    if (sidebar) sidebar.style.display = 'none';
    const layout = document.querySelector('#modulo_wisc .clinical-dashboard-layout');
    if (layout) layout.style.gridTemplateColumns = '1fr';
    if (panRes) {
      gsap.killTweensOf(panRes);
      gsap.set(panRes, { display: 'block', autoAlpha: 0, y: 30 });
      gsap.to(panRes, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
      
      // Animar las filas de la tabla de resultados y tarjetas en cascada
      const filasTabla = panRes.querySelectorAll('.resultado-card, table tr, .grafica-container');
      if (filasTabla.length > 0) {
        gsap.killTweensOf(filasTabla);
        gsap.fromTo(filasTabla, 
          { autoAlpha: 0, y: 15 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.04, delay: 0.2 }
        );
      }
      
      panRes.classList.remove('panel-oculto');
      panRes.classList.add('panel-visible');
    }
    
    // Scrollear al panel de resultados para mejor UX
    setTimeout(() => {
      if (panRes) panRes.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);

    window.wiscCalculado = true; // Habilitar flag para cálculo clínico
    
    // LLAMADA AUTOMÁTICA AL CÁLCULO CLÍNICO (Análisis de Índices)
    if (typeof window.calcularWISC_UI === 'function') {
      window.calcularWISC_UI();
    }
  } catch (error) {
    window.mostrarAlertaLocal(error.message, 'error');
  }
};

// ==========================================
// PROCESAMIENTO WPPSI-IV Etapa 1 (legacy - pantalla primera parte)
// ==========================================
window.procesarLoteWPPSI = async (etapa) => {
  if (etapa === 1) {
    if (typeof window.procesarWPPSI_1 === 'function') {
      window.procesarWPPSI_1();
    }
  }
};

// ==========================================
// TABLAS Y RESULTADOS WISC-V
// ==========================================
function actualizarTablaHTML() {
  const tb = document.getElementById('tabla-resultados');
  if (!tb) return;
  tb.innerHTML = '';
  if (filas.length === 0) {
    tb.innerHTML = '<tr><td colspan="4" class="empty-state">Sin datos aún</td></tr>';
    return;
  }
  filas.forEach((f, idx) => {
    tb.innerHTML += `<tr>
      <td><strong>${f.sub}</strong></td>
      <td>${f.directa}</td>
      <td style="color:#00d4ff;font-weight:600;">${f.escalar}</td>
    </tr>`;
  });
}

window.eliminarFila = (idx) => {
  filas.splice(idx, 1);
  actualizarTablaHTML();
};

window.obtenerSumaEscalares = () => {
  const suma = (list) => filas.filter(f => list.includes(f.sub)).reduce((a, b) => a + b.escalar, 0);
  return {
    ICV: suma(['S','V']),
    IVE: suma(['C','PV']),
    IRF: suma(['M','B']),
    IMT: suma(['D','SD']),
    IVP: suma(['CL','BS']),
    CIT: suma(['C','S','M','D','CL','V','B'])
  };
};

window.obtenerFilasParaGuardar = () => filas;

// ==========================================
// DIBUJO DE PERFIL WISC-V (panel lateral)
// ==========================================
window.pintarResumenWISC = (r) => {
  const { indices } = r;
  const tb = document.getElementById('tabla-wisc');
  if (!tb) return;
  tb.innerHTML = '';
  if (!indices) { tb.innerHTML = '<div class="empty-state">Error en cálculo</div>'; return; }

  const obtenerDiagWISC = (ci) => {
    if (!ci) return '—';
    const v = parseInt(ci);
    if (v < 70) return 'Extremadamente bajo';
    if (v <= 79) return 'Muy bajo';
    if (v <= 89) return 'Medio bajo';
    if (v <= 109) return 'Medio';
    if (v <= 119) return 'Medio alto';
    if (v <= 129) return 'Muy alto';
    return 'Extremadamente alto';
  };

  let html = '<h4 class="titulo-seccion-informe" style="margin-top:0;">2. Índices Clínicos y Diagnóstico</h4>';
  html += `<div>
    <table class="tabla-resultados-clinica">
      <thead>
        <tr>
          <th>Índice</th>
          <th style="text-align:center;">Suma Escalares</th>
          <th style="text-align:center;">Cociente (CI)</th>
          <th style="text-align:center;">Percentil</th>
          <th style="text-align:center;">Intervalo 95%</th>
          <th style="text-align:center;">Diagnóstico</th>
        </tr>
      </thead>
      <tbody>`;

  for (const k in indices) {
    const { suma, ci, percentil, ic_95_min, ic_95_max } = indices[k];
    const tieneR = ci !== null && ci !== undefined;
    const icStr = (tieneR && ic_95_min) ? `${ic_95_min} - ${ic_95_max}%` : '—';
    const diag = obtenerDiagWISC(ci);
    
    let colDiag = '#94a3b8';
    if (diag === 'Extremadamente alto') colDiag = '#0ea5e9';
    else if (diag === 'Muy alto') colDiag = '#10b981';
    else if (diag === 'Medio alto') colDiag = '#84cc16';
    else if (diag === 'Medio') colDiag = '#64748b';
    else if (diag === 'Medio bajo') colDiag = '#f59e0b';
    else if (diag === 'Muy bajo') colDiag = '#f97316';
    else if (diag === 'Extremadamente bajo') colDiag = '#ef4444';
    
    html += `<tr>
      <td style="font-weight:700;color:var(--accent-cyan);">${k}</td>
      <td style="text-align:center;font-weight:600;">${suma}</td>
      <td style="text-align:center;color:${tieneR ? 'var(--accent-cyan)' : 'var(--text-muted)'};font-weight:700;font-size:1.2em;">${tieneR ? ci : '—'}</td>
      <td style="text-align:center;">${percentil ? percentil : '—'}</td>
      <td style="text-align:center;">${icStr}</td>
      <td style="text-align:center;">
        <span class="diag-text" style="color:${colDiag}; font-weight:bold;">${diag}</span>
      </td>
    </tr>`;
  }
  html += '</tbody></table></div>';
  tb.innerHTML = html;
};

window.dibujarPerfilWISC = (r) => {
  const { indices } = r;
  if (!indices) return;
  const labels = ['ICV','IVE','IRF','IMT','IVP','CIT'];
  const datos  = labels.map(idx => (indices[idx] && indices[idx].ci !== null) ? indices[idx].ci : 0);

  const ctx = document.getElementById('grafico-perfil');
  if (!ctx) return;
  if (window.graficoPerfilChart) window.graficoPerfilChart.destroy();

  window.graficoPerfilChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'CI', data: datos, borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)', borderWidth: 3, fill: true },
        { label: 'Promedio (100)', data: [100,100,100,100,100,100], borderColor: '#666', borderDash: [5,5], fill: false }
      ]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false, 
      scales: { 
        y: { 
          min: 40, max: 160,
          ticks: { color: window.getChartTextColor() },
          grid: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        x: {
          ticks: { color: window.getChartTextColor() },
          grid: { display: false }
        }
      } 
    }
  });
};

// ==========================================
// PDF EXPORT (primera parte – pantalla WISC-V clásica)
// ==========================================
window.generarPDF = (panelId, nombreBase) => {
  const panel = document.getElementById(panelId);
  if (!panel) { window.mostrarAlertaLocal('Panel no encontrado.', 'error'); return; }

  const botonesOcultar = panel.querySelectorAll('button');
  botonesOcultar.forEach(b => b.style.display = 'none');

  const fechaEmision = new Date().toISOString().split('T')[0];
  const nombreArchivo = `${nombreBase}_${fechaEmision}.pdf`;

  const opciones = {
    margin: 10,
    filename: nombreArchivo,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (typeof html2pdf === 'undefined') {
    const script = document.createElement('script');
    script.src = 'js/html2pdf.bundle.min.js';
    script.onload = () => {
      html2pdf().set(opciones).from(panel).save().then(() => {
        botonesOcultar.forEach(b => b.style.display = '');
        window.mostrarAlertaLocal('PDF generado exitosamente.', 'success');
        if (typeof window.mostrarModalPostGuardado === 'function') {
          window.mostrarModalPostGuardado();
        }
      });
    };
    document.head.appendChild(script);
  } else {
    html2pdf().set(opciones).from(panel).save().then(() => {
      botonesOcultar.forEach(b => b.style.display = '');
      window.mostrarAlertaLocal('PDF generado exitosamente.', 'success');
      if (typeof window.mostrarModalPostGuardado === 'function') {
        window.mostrarModalPostGuardado();
      }
    });
  }
};

// ==========================================
// CONFIGURACIÓN INICIAL DE FECHAS (legacy WISC-V)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  const inputNac  = document.getElementById('fecha_nac');
  const inputEval = document.getElementById('fecha_eval');
  if (inputNac)  inputNac.max  = hoy;
  if (inputEval) { inputEval.max = hoy; inputEval.value = hoy; }
});

window.editarDatosWISC = () => {
  const panRes  = document.getElementById('panel_resultados');
  const panIng  = document.getElementById('panel_ingreso_wisc');
  const panGraf = document.getElementById('panel_grafico');

  const elementos = [panRes, panGraf].filter(Boolean);
  if (elementos.length > 0) {
    gsap.to(elementos, {
      autoAlpha: 0,
      y: 20,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        elementos.forEach(el => {
          // Limpiar estado GSAP residual ANTES de ocultar con display:none
          // para que la próxima vez que se muestre no herede opacity/visibility de GSAP
          gsap.killTweensOf(el);
          gsap.set(el, { clearProps: 'all' });
          el.style.display = 'none';
          el.classList.remove('panel-visible');
          el.classList.add('panel-oculto');
        });

        if (panIng) {
          gsap.killTweensOf(panIng);
          gsap.set(panIng, { display: 'block', autoAlpha: 0, y: 30 });
          gsap.to(panIng, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" });
          
          const btnVolver = document.querySelector('#modulo_wisc .btn-volver');
          if (btnVolver) btnVolver.style.display = '';
          const sidebar = document.querySelector('#modulo_wisc .clinical-sidebar-card');
          if (sidebar) sidebar.style.display = '';
          const layout = document.querySelector('#modulo_wisc .clinical-dashboard-layout');
          if (layout) layout.style.gridTemplateColumns = '';
        }
      }
    });
  } else {
    if (panIng) panIng.style.display = 'block';
  }

  // Volver a centrar el layout
  const gridWisc = document.querySelector('#modulo_wisc .grid-main');
  if (gridWisc) {
    gridWisc.classList.remove('layout-expandido');
    gridWisc.classList.add('layout-centrado');
  }
};

// ==========================================
// GENERAR PDF PROFESIONAL WISC-V
// (Implementación centralizada en pdf-generator.js)
// ==========================================


