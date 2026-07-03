// Las funciones de API ya están disponibles en window desde api-client.js
// No es necesario importarlas ya que api-client.js las expone directamente a window

const CODE_MAP = new Map([
  ['C','C'],['S','S'],['M','M'],['D','D'],['CL','CL'],['V','V'],
  ['B','B'],['PV','PV'],['SD','SD'],['BS','BS'],['I','I'],
  ['LN','LN'],['CA','CA'],['CO','CO'],['A','A']
]);

function q(sel){ return document.querySelector(sel); }
function val(sel){ return (q(sel)?.value ?? '').toString(); }

async function calcularWISC_UI(){
  if (typeof window.obtenerSumaEscalares !== 'function') {
    window.mostrarAlertaLocal('Error de sistema en cálculos.', 'error');
    return;
  }

  const anos = Number(q('#edad_anos')?.value || 0);
  const meses = Number(q('#edad_meses')?.value || 0);
  const edadMeses = (anos * 12) + meses;

  if (edadMeses <= 0) {
    window.mostrarAlertaLocal('Verifica la edad del infante.', 'warning');
    return;
  }

  let sumas;
  try {
    sumas = window.obtenerSumaEscalares();
  } catch (e) {
    window.mostrarAlertaLocal('Error al obtener escalares: ' + e.message, 'error');
    return;
  }

  try {
    const resultado = await window.apiCalcularWISC({ edadMeses, ...sumas });
    window.ultimoResultadoWISC = resultado;
    
    // 1. Damos permiso para guardar
    window.wiscCalculado = true; 

    if (typeof window.pintarResumenWISC === 'function') {
      window.pintarResumenWISC(resultado);
    }
    if (typeof window.dibujarPerfilWISC === 'function') {
      window.dibujarPerfilWISC(resultado);
      
      // 2. REVELAR EL PASO 4 (Gráfico)
      const panelResultadosWisc = document.getElementById('panel_resultados');
      if (panelResultadosWisc) {
          panelResultadosWisc.style.display = 'block';
          panelResultadosWisc.classList.remove('panel-oculto');
          panelResultadosWisc.classList.add('panel-visible');
      }
      
      const panelGrafico = document.getElementById('panel_grafico');
      if (panelGrafico) {
          // Limpiar cualquier propiedad GSAP residual (opacity/visibility del ciclo Editar anterior)
          gsap.killTweensOf(panelGrafico);
          gsap.set(panelGrafico, { clearProps: 'all' });
          panelGrafico.style.display = 'block';
          panelGrafico.classList.remove('panel-oculto');
          panelGrafico.classList.add('panel-visible');
      }

      const panelIngresoWisc = document.getElementById('panel_ingreso_wisc');
      if (panelIngresoWisc) panelIngresoWisc.style.display = 'none';

      // 3. Llenar info de paciente para PDF
      const nombrePaciente = document.getElementById('global_nombre_nino')?.value || 'No especificado';
      const examinador = document.getElementById('global_examinador')?.value || 'No especificado';
      const fechaEval = document.getElementById('global_fecha_eval')?.value || 'No especificada';
      const spanEdad = document.querySelector('#vista_previa_edad span:first-of-type');
      const edadInfo = spanEdad && spanEdad.innerText ? spanEdad.innerText : `${anos} años y ${meses} meses`;

      const infoDiv = document.getElementById('info_paciente_wisc');
      if (infoDiv) {
          infoDiv.innerHTML = `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: var(--text-main); font-size: 0.9em;">
                  <div><strong>Paciente:</strong> ${nombrePaciente}</div>
                  <div><strong>Examinador:</strong> ${examinador}</div>
                  <div><strong>Edad:</strong> ${edadInfo}</div>
                  <div><strong>Fecha de Evaluación:</strong> ${fechaEval}</div>
              </div>
          `;
      }

      // ── Guardar en historial clínico (capturar después de calcular)
      if (typeof window.guardarEnHistorial === 'function') {
        const nombresPruebas = {
          'C':'Cubos','S':'Semejanzas','M':'Matrices','D':'Dígitos','CL':'Clave de Números',
          'V':'Vocabulario','B':'Balanzas','PV':'Puzles Visuales','SD':'Span de Dibujos',
          'BS':'Búsqueda de Símbolos','I':'Información','LN':'Letras y Números',
          'CA':'Cancelación','CO':'Comprensión','A':'Aritmética'
        };
        const filas = typeof window.obtenerFilasParaGuardar === 'function' ? window.obtenerFilasParaGuardar() : [];
        window.guardarEnHistorial({
          id: window._evaluacionIdActual,
          tipo: 'WISC',
          tipoPrueba: 'WISC-V',
          paciente: {
            nombre: document.getElementById('global_nombre_nino')?.value || '',
            examinador: document.getElementById('global_examinador')?.value || '',
            fechaEval: document.getElementById('global_fecha_eval')?.value || '',
            fechaNac: document.getElementById('global_fecha_nac')?.value || '',
            edadMeses: (anos * 12) + meses
          },
          subpruebas: filas.map(f => ({ sub: f.sub, nombre: nombresPruebas[f.sub] || f.sub, directa: f.directa, escalar: f.escalar })),
          indices: resultado.indices,
          datosGrafica: ['ICV','IVE','IRF','IMT','IVP','CIT'].map(k => resultado.indices[k]?.ci || null),
          chartLabels: ['ICV','IVE','IRF','IMT','IVP','CIT'],
          chartColor: '#00c8ff'
        }).then(res => {
          if (res && res.id) {
            window._evaluacionIdActual = res.id;
          }
        }).catch(err => console.error("Error guardando WISC:", err));
      }
    }
  } catch (e) {
    window.mostrarAlertaLocal('No se pudo calcular el WISC: ' + e.message, 'error');
  }
}

async function guardarEvaluacionWISC_UI() {
if (!window.wiscCalculado) {
      window.mostrarAlertaLocal('⚠️ Debes hacer clic en "Calcular WISC-V" antes de guardar la evaluación.', 'warning');
      return;
  }

  const nombreNino = q('#global_nombre_nino')?.value || 'Sin nombre';
  const anosStr = val('#edad_anos');
  const mesesStr = val('#edad_meses');
  
  const anos = Number(anosStr) || 0;
  const meses = Number(mesesStr) || 0;
  const edadMeses = anos * 12 + meses;
  
  if (edadMeses === 0) {
    window.mostrarAlertaLocal('Ingresa la edad del niño antes de guardar', 'warning');
    return;
  }
  
  let filas = [];
  if (typeof window.obtenerFilasParaGuardar === 'function') {
    filas = window.obtenerFilasParaGuardar();
  }
  
  if (filas.length === 0) {
    window.mostrarAlertaLocal('Agrega al menos una subprueba antes de guardar', 'warning');
    return;
  }
  
  const sumas = window.obtenerSumaEscalares();
  let indices = {};
  
  if (window.ultimoResultadoWISC && window.ultimoResultadoWISC.indices) {
    indices = window.ultimoResultadoWISC.indices;
  } else {
    indices = {
      ICV: { suma: sumas.ICV, ci: null, percentil: null },
      IVE: { suma: sumas.IVE, ci: null, percentil: null },
      IRF: { suma: sumas.IRF, ci: null, percentil: null },
      IMT: { suma: sumas.IMT, ci: null, percentil: null },
      IVP: { suma: sumas.IVP, ci: null, percentil: null },
      CIT: { suma: sumas.CIT, ci: null, percentil: null }
    };
  }

  const payload = {
    nombreNino: nombreNino,
    edad: { anos, meses },
    edadMeses: edadMeses,
    subpruebas: filas,
    indices: indices
  };
  
  try {
    // 1. Guardamos en la base de datos local (API)
    const respuesta = await window.apiGuardarEvaluacionWISC(payload);
    
    // 2. Esperamos a que el usuario termine con la ventana de Windows
    const guardadoConfirmado = await generarYDescargarReporte(respuesta.reporte);
    
    // 3. ¡Solo si le dio a "Guardar" lanzamos el modal!
    if (guardadoConfirmado) {
      if (typeof window.mostrarModalPostGuardado === 'function') {
        window.mostrarModalPostGuardado();
      }
    } else {
      window.mostrarAlertaLocal('Descarga del reporte cancelada por el usuario.', 'warning');
    }
    
  } catch (e) {
    window.mostrarAlertaLocal('Error al guardar evaluación: ' + e.message, 'error');
  }
}

/* ============================================
   📄 GENERAR REPORTE HTML DESCARGABLE (DISEÑO PREMIUM + FILE API)
============================================ */
async function generarYDescargarReporte(reporte) {
  const { id, fechaEvaluacionLocal, datosNino, subpruebas, indices, resumen } = reporte;
  let graficoDataUrl = '';
  try {
    const canvas = document.getElementById('grafico-perfil');
    if (canvas && typeof canvas.toDataURL === 'function') {
      graficoDataUrl = canvas.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('[REPORTE] No se pudo capturar imagen del canvas:', err);
  }
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte WISC-V - ${datosNino.nombre}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #2c3e50; background: #f4f7f6; padding: 40px 20px; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .header { border-bottom: 4px solid #0f3460; padding-bottom: 25px; margin-bottom: 35px; text-align: center; }
    .header h1 { color: #0f3460; font-size: 28px; margin-bottom: 8px; display: flex; justify-content: center; align-items: center; gap: 10px; }
    .header .subtitle { color: #596a7b; font-size: 15px; font-weight: 500; }
    .section { margin-bottom: 35px; }
    .section h2 { color: #0f3460; font-size: 18px; border-left: 5px solid #00d4ff; padding-left: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .info-item { padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .info-label { font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 16px; color: #0f3460; margin-top: 5px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    th { background: #0f3460; color: white; padding: 15px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; }
    td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #f8fafc; }
    .valor-ci { color: #0f3460; font-weight: 700; font-size: 18px; background: #e0f2fe; padding: 4px 12px; border-radius: 20px; }
    .valor-escalar { color: #0284c7; font-weight: 700; }
    .valor-percentil { color: #64748b; font-weight: 500; }
    .footer { text-align: center; margin-top: 50px; padding-top: 25px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
    @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span class="material-symbols-rounded" style="font-size: 32px; color: #00d4ff;">analytics</span> Reporte de Evaluación Clínica</h1>
      <p class="subtitle">Escala de Inteligencia de Wechsler para Niños (WISC-V)</p>
    </div>

    <div class="section">
      <h2><span class="material-symbols-rounded">person</span> Datos del Paciente</h2>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Nombre del Infante</div><div class="info-value">${datosNino.nombre}</div></div>
        <div class="info-item"><div class="info-label">Edad Cronológica</div><div class="info-value">${datosNino.edad.anos} años ${datosNino.edad.meses} meses</div></div>
        <div class="info-item"><div class="info-label">Fecha de Evaluación</div><div class="info-value">${fechaEvaluacionLocal.split(',')[0]}</div></div>
        <div class="info-item"><div class="info-label">ID del Reporte</div><div class="info-value" style="font-family: monospace; color: #64748b;">${id}</div></div>
      </div>
    </div>

    <div class="section">
      <h2><span class="material-symbols-rounded">edit_square</span> Puntuaciones Directas y Escalares</h2>
      <table>
        <thead><tr><th>Subprueba</th><th style="text-align: center;">Puntuación Directa</th><th style="text-align: center;">Puntuación Escalar</th></tr></thead>
        <tbody>
          ${subpruebas.map(s => `<tr><td><strong>${s.sub}</strong></td><td style="text-align: center;">${s.directa}</td><td style="text-align: center;" class="valor-escalar">${s.escalar}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2><span class="material-symbols-rounded">bar_chart</span> Índices Clínicos</h2>
      <table>
        <thead><tr><th>Índice</th><th style="text-align: center;">Suma Escalares</th><th style="text-align: center;">Cociente (CI)</th><th style="text-align: center;">Percentil</th><th style="text-align: center;">Intervalo Confianza (95%)</th></tr></thead>
        <tbody>
          ${Object.entries(indices).map(([nombre, datos]) => {
            const ciStr = datos.ci ? `<span class="valor-ci">${datos.ci}</span>` : '—';
            const percStr = datos.percentil ? `<span class="valor-percentil">${datos.percentil}</span>` : '—';
            const icStr = (datos.ic_95_min && datos.ic_95_max) ? `${datos.ic_95_min}% - ${datos.ic_95_max}%` : '—';
            return `<tr><td><strong>${nombre}</strong></td><td style="text-align: center; color: #64748b;">${datos.suma || 0}</td><td style="text-align: center;">${ciStr}</td><td style="text-align: center;">${percStr}</td><td style="text-align: center; color: #64748b; font-size: 13px;">${icStr}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2><span class="material-symbols-rounded">monitoring</span> Perfil de Puntuaciones Compuestas</h2>
      <div style="margin-top:15px; margin-bottom:20px; text-align: center;">
        ${graficoDataUrl ? `<img src="${graficoDataUrl}" alt="Perfil Clínico" style="width:100%; max-width:700px; border:1px solid #e2e8f0; border-radius:8px; padding:10px; background:#fff;">` : `<div style="padding:30px; background:#f8fafc; border-radius:8px; color:#94a3b8; border: 1px dashed #cbd5e1;">Gráfico no disponible</div>`}
      </div>
    </div>

    <div class="footer"><p>Documento generado por el Sistema de Evaluación Psicométrica local.</p><p>Impreso el: ${new Date().toLocaleString('es-ES')}</p></div>
  </div>
</body>
</html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const nombreSugerido = `Reporte_WISC_${datosNino.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;

  try {
    if (window.showSaveFilePicker && window.location.protocol === 'https:') {
      const handle = await window.showSaveFilePicker({
        suggestedName: nombreSugerido,
        types: [{ description: 'Documento HTML', accept: {'text/html': ['.html']} }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } else {
      // PLAN B (Localhost/Electron): Promesa real con captura de foco
      return new Promise((resolve) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreSugerido;
        document.body.appendChild(a);
        
        // Esta función se dispara cuando Windows se cierra y volvemos al sistema
        const handlerFoco = () => {
          window.removeEventListener('focus', handlerFoco);
          // Le damos 0.5 segundos de gracia para que se vea elegante
          setTimeout(() => resolve(true), 500); 
        };

        window.addEventListener('focus', handlerFoco);
        a.click(); // Lanza la ventana de Windows
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  } catch (error) {
    if (error.name === 'AbortError') return false;
    throw new Error('Hubo un problema al guardar el archivo.');
  }

}

// Inicialización
setTimeout(() => {
  window.calcularWISC_UI = calcularWISC_UI;
  window.guardarEvaluacionWISC_UI = guardarEvaluacionWISC_UI;
}, 100);

