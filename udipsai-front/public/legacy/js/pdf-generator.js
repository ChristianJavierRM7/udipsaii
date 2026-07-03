// ================================================================
//  pdf-generator.js  Â·  UDIPSAI  Â·  v3.0
//  Generador de PDF completamente nuevo usando jsPDF puro.
//  SIN html2canvas â€” dibuja el PDF desde los datos directamente.
//  Compatible con: WISC-V, WPPSI-IV E1, WPPSI-IV E2, Historial
// ================================================================
(function () {
  'use strict';

  // â”€â”€ Paleta de colores (RGB) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  var C = {
    primario: [15, 52, 96],
    cyan: [0, 200, 255],
    rojoWPP: [230, 25, 43],
    verde: [16, 185, 129],
    texto: [30, 41, 59],
    muted: [100, 116, 139],
    borde: [120, 120, 120],
    bgSutil: [248, 250, 252],
    blanco: [255, 255, 255],
    thBg: [255, 255, 255],
    thText: [30, 30, 30],
    labelBold: [30, 30, 30]
  };

  // â”€â”€ Utilidades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function trunc(s, max) {
    if (s == null) return '-';
    s = String(s);
    return s.length > max ? s.slice(0, max - 1) + '...' : s;
  }

  function fmtFecha(raw) {
    if (!raw || !raw.trim()) return '-';
    try { return new Date(raw.trim() + 'T00:00:00').toLocaleDateString('es-ES'); }
    catch (e) { return raw; }
  }

  function diag(ci) {
    var v = parseInt(ci);
    if (isNaN(v) || !ci || ci === '-') return '-';
    if (v < 70) return 'Extrem. bajo';
    if (v <= 79) return 'Muy bajo';
    if (v <= 89) return 'Medio bajo';
    if (v <= 109) return 'Medio';
    if (v <= 119) return 'Medio alto';
    if (v <= 129) return 'Muy alto';
    return 'Extrem. alto';
  }

  function alerta(msg, tipo) {
    if (window.mostrarAlertaLocal) window.mostrarAlertaLocal(msg, tipo || 'info');
    else console.log('[PDF]', msg);
  }

  // â”€â”€ Obtener jsPDF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  var _jsPDFClass = null;

  function getJsPDF() {
    if (_jsPDFClass) return _jsPDFClass;
    // html2pdf bundle v0.10.x: expone window.jspdf.jsPDF
    if (window.jspdf && window.jspdf.jsPDF) { _jsPDFClass = window.jspdf.jsPDF; return _jsPDFClass; }
    // Versiones legadas
    if (window.jsPDF) { _jsPDFClass = window.jsPDF; return _jsPDFClass; }
    return null;
  }

  function extraerjsPDFDesdeBundle(callback) {
    // TÃ©cnica: usar html2pdf para crear un documento vacÃ­o y capturar jsPDF del worker
    try {
      var worker = html2pdf().set({ jsPDF: { unit: 'mm', format: 'a4' } });
      // Acceder a la propiedad interna del worker que contiene jsPDF
      if (worker && worker.opt && worker.opt.jsPDF) {
        _jsPDFClass = worker.opt.jsPDF.constructor;
        if (_jsPDFClass && typeof _jsPDFClass === 'function') {
          callback(_jsPDFClass);
          return true;
        }
      }
      // Intentar desde la propiedad 'jsPDF' que algunos builds exponen
      if (typeof html2pdf.jsPDF === 'function') {
        _jsPDFClass = html2pdf.jsPDF;
        callback(_jsPDFClass);
        return true;
      }
    } catch (e) { /* ignorar */ }
    return false;
  }

  function conJsPDF(callback) {
    var J = getJsPDF();
    if (J) { callback(J); return; }

    var cargarDesdeBundle = function () {
      if (typeof html2pdf === 'undefined') return false;
      // Intentar extraer del bundle
      if (extraerjsPDFDesdeBundle(callback)) return true;
      return false;
    };

    var cargarCDN = function () {
      // Fallback: cargar jsPDF standalone desde CDN (necesita internet)
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = function () {
        var J2 = getJsPDF();
        if (J2) { callback(J2); }
        else { alerta('Error: no se pudo cargar jsPDF.', 'error'); }
      };
      s.onerror = function () {
        alerta('Sin acceso a internet para cargar jsPDF. Conectate a internet e intenta de nuevo.', 'error');
      };
      document.head.appendChild(s);
    };

    if (typeof html2pdf === 'undefined') {
      // Cargar html2pdf primero
      var s2 = document.createElement('script');
      s2.src = 'js/html2pdf.bundle.min.js';
      s2.onload = function () {
        setTimeout(function () {
          var J3 = getJsPDF();
          if (J3) { callback(J3); return; }
          if (!cargarDesdeBundle()) cargarCDN();
        }, 300);
      };
      document.head.appendChild(s2);
    } else {
      // html2pdf ya cargado
      var J4 = getJsPDF();
      if (J4) { callback(J4); return; }
      if (!cargarDesdeBundle()) cargarCDN();
    }
  }

  // â”€â”€ Primitivas de dibujo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function cabecera(doc, opts) {
    // opts: { titulo, subtitulo, logo, colorLinea, pw, margin, logoW, logoH }
    var y = opts.margin;
    var lw = opts.logoW || 20;
    var lh = opts.logoH || 20;

    // Logo (mantener proporción cuadrada del logo original)
    // >> Para ajustar el tamaño del logo, cambia el valor de logoSize aquí <<
    if (opts.logo) {
      var logoSize = 33; // Tamaño del logo en mm (cambia este valor para hacerlo más grande o pequeño)
      lw = logoSize;
      lh = logoSize;
      try { doc.addImage(opts.logo, 'PNG', opts.pw - opts.margin - lw, y - 12, lw, lh); }
      catch (e) { /* ignorar */ }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor.apply(doc, C.primario);
    doc.text(opts.titulo, opts.margin, y + 5);

    if (opts.subtitulo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor.apply(doc, C.muted);
      doc.text(opts.subtitulo, opts.margin, y + 11);
    }

    // Línea separadora fija (no depende del tamaño del logo)
    var lineY = y + 16;

    doc.setDrawColor.apply(doc, opts.colorLinea);
    doc.setLineWidth(0.7);
    doc.line(opts.margin, lineY, opts.pw - opts.margin, lineY);
    return lineY + 4;
  }

  /** Caja de datos del paciente */
  function cajaPaciente(doc, info, y0, pw, margin) {
    var cw = pw - margin * 2;
    var bh = 21;

    var lx = margin + 3;
    var mx = margin + cw / 2 + 2;
    doc.setFontSize(8);

    function celda(label, valor, x, y) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor.apply(doc, C.labelBold);
      doc.text(label, x, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor.apply(doc, C.texto);
      doc.text(trunc(valor || '-', 38), x + doc.getTextWidth(label) + 2.5, y);
    }

    var y = y0 + 5;
    celda('Paciente:', info.nombre || '-', lx, y);
    celda('Examinador:', info.examinador || '-', mx, y);
    y += 5;
    celda('Fecha Nacimiento:', info.fechaNac || '-', lx, y);
    celda('Fecha Evaluacion:', info.fechaEval || '-', mx, y);
    y += 5;
    celda('Edad:', info.edad || '-', lx, y);

    return y0 + bh + 3;
  }

  /** TÃ­tulo de secciÃ³n */
  function seccion(doc, texto, y, x1, x2) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor.apply(doc, C.labelBold);
    doc.text(texto, x1, y);
    doc.setDrawColor.apply(doc, C.borde);
    doc.setLineWidth(0.2);
    doc.line(x1, y + 1.5, x2, y + 1.5);
    return y + 5;
  }

  /**
   * Dibuja una tabla completa.
   * cols: Array de { label, width, align }
   * rows: Array de Array de valores
   */
  function dibujarTabla(doc, cols, rows, y0, xOff) {
    var rowH = 5.5;
    var headerH = 6.5;
    var totalW = cols.reduce(function (s, c) { return s + c.width; }, 0);
    var y = y0;
    var lineW = 0.4; // Grosor uniforme para todas las líneas de la tabla

    // Cabecera - fondo blanco y texto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor.apply(doc, C.thText);

    var x = xOff;
    cols.forEach(function (col) {
      if (col.align === 'center') {
        doc.text(col.label, x + col.width / 2, y + 4.5, { align: 'center' });
      } else {
        doc.text(col.label, x + 1.5, y + 4.5);
      }
      x += col.width;
    });
    y += headerH;

    // Filas - primero dibujar relleno, luego texto
    rows.forEach(function (row, ri) {
      doc.setFillColor.apply(doc, ri % 2 === 0 ? C.blanco : C.bgSutil);
      doc.rect(xOff, y, totalW, rowH, 'F');

      doc.setFontSize(7);
      doc.setTextColor.apply(doc, C.texto);
      var cx = xOff;
      cols.forEach(function (col, ci) {
        var val = row[ci] != null ? String(row[ci]) : '-';
        var maxCh = Math.floor(col.width / 1.75);
        var txt = trunc(val, maxCh);

        // Primera columna (nombre subprueba/índice) en negrita oscura
        if (ci === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor.apply(doc, C.labelBold);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor.apply(doc, C.texto);
        }

        if (col.label === 'Diagnóstico') {
          var d = val.trim().toLowerCase();
          if (d === 'muy superior' || d === 'extrem. alto' || d === 'muy alto') doc.setTextColor(14, 165, 233);
          else if (d === 'superior') doc.setTextColor(16, 185, 129);
          else if (d === 'medio alto') doc.setTextColor(132, 204, 22);
          else if (d === 'medio') doc.setTextColor(100, 116, 139);
          else if (d === 'medio bajo') doc.setTextColor(245, 158, 11);
          else if (d === 'límite' || d === 'limite') doc.setTextColor(249, 115, 22);
          else if (d === 'muy bajo' || d === 'extrem. bajo') doc.setTextColor(239, 68, 68);

          doc.setFont('helvetica', 'bold');
        }

        if (col.align === 'center') {
          doc.text(txt, cx + col.width / 2, y + 4, { align: 'center' });
        } else {
          doc.text(txt, cx + 1.5, y + 4);
        }
        cx += col.width;
      });
      y += rowH;
    });

    // Dibujar TODAS las líneas de la grilla AL FINAL (encima de los rellenos)
    doc.setDrawColor.apply(doc, C.borde);
    doc.setLineWidth(lineW);

    // Líneas horizontales
    var totalRows = rows.length;
    for (var r = 0; r <= totalRows + 1; r++) {
      var ly = y0 + (r === 0 ? 0 : headerH + (r - 1) * rowH);
      if (r === 1) ly = y0 + headerH; // línea debajo del header
      doc.line(xOff, ly, xOff + totalW, ly);
    }
    // Línea final inferior
    doc.line(xOff, y, xOff + totalW, y);

    // Líneas verticales (de arriba a abajo de toda la tabla)
    var vx = xOff;
    for (var c = 0; c <= cols.length; c++) {
      doc.line(vx, y0, vx, y);
      if (c < cols.length) vx += cols[c].width;
    }

    return y + 2;
  }

  /** Pie de página (desactivado) */
  function pie(doc, prueba, pw, ph, margin) {
    // No renderizar nada en el pie de página
  }

  // â”€â”€ Configuraciones de columnas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  var COLS_ESC = [
    { label: 'Subprueba', width: 65, align: 'left' },
    { label: 'Puntuacion Directa', width: 50, align: 'center' },
    { label: 'Puntuacion Escalar', width: 50, align: 'center' }
  ];
  var COLS_IDX = [
    { label: 'Escala', width: 42, align: 'left' },
    { label: 'Suma punt. escalares', width: 28, align: 'center' },
    { label: 'Punt. compuesta', width: 23, align: 'center' },
    { label: 'Percentil', width: 20, align: 'center' },
    { label: 'Intervalo de confianza', width: 28, align: 'center' },
    { label: 'Diagnóstico', width: 24, align: 'center' }
  ];

  var NOMBRES_IDX = {
    ICV: 'Comprensión Verbal (ICV)',
    IVE: 'Visoespacial (IVE)',
    IRF: 'Razonamiento Fluido (IRF)',
    IMT: 'Memoria de Trabajo (IMT)',
    IVP: 'Vel. Procesamiento (IVP)',
    CIT: 'Escala Total (CIT)'
  };

  // â”€â”€ FunciÃ³n base de generaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function crearDoc(orientacion) {
    return { orientation: orientacion || 'landscape', unit: 'mm', format: 'a4' };
  }

  function layoutBase() {
    var pw = 297, ph = 210, margin = 10;
    var leftW = 165;
    var gap = 8;
    var rightX = margin + leftW + gap;
    var rightW = pw - margin - rightX;
    return { pw: pw, ph: ph, margin: margin, leftW: leftW, gap: gap, rightX: rightX, rightW: rightW };
  }

  /** Captura la grÃ¡fica siempre en MODO CLARO, independientemente del tema activo */
  function addGraficaModoClaro(doc, instanciaOriginal, yR, rightX, rightW) {
    try {
      // Extraer datos del chart original
      var datosOriginales = instanciaOriginal.data;
      var labels = datosOriginales.labels || [];
      var datasets = datosOriginales.datasets || [];

      if (!labels.length || !datasets.length) return yR;

      // Primer dataset (valores CI o escalares)
      var ds0 = datasets[0];
      var valores = ds0.data || [];

      // Crear canvas temporal OCULTO con colores modo claro
      var canvasTmp = document.createElement('canvas');
      canvasTmp.width = 650;
      canvasTmp.height = 320;
      canvasTmp.style.display = 'none';
      document.body.appendChild(canvasTmp);

      var colorLinea = ds0.borderColor || ds0.backgroundColor || '#0f3460';
      // Si es un color con rgba oscuro, forzar color corporativo
      if (typeof colorLinea === 'string' && colorLinea.includes('rgba') && colorLinea.includes('0.')) {
        colorLinea = '#0f3460';
      }

      var chartTmp = new Chart(canvasTmp, {
        type: instanciaOriginal.config.type || 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: ds0.label || '',
            data: valores,
            backgroundColor: (instanciaOriginal.config.type === 'bar')
              ? 'rgba(15,52,96,0.15)'
              : 'rgba(0,200,255,0.12)',
            borderColor: colorLinea,
            borderWidth: 2,
            pointBackgroundColor: colorLinea,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: ds0.tension || 0.3,
            fill: (ds0.fill !== undefined) ? ds0.fill : false
          }]
        },
        options: {
          animation: false,
          responsive: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: { color: '#334155', font: { size: 11, weight: 'bold' } },
              grid: { display: false }
            },
            y: {
              min: 40,
              max: 160,
              ticks: {
                stepSize: 5,
                autoSkip: false,
                color: function (ctx) { return (ctx.tick && ctx.tick.value === 100) ? '#ef4444' : '#334155'; },
                font: function (ctx) { return (ctx.tick && ctx.tick.value === 100) ? { weight: 'bold', size: 14 } : { size: 11 }; }
              },
              grid: { color: 'rgba(148, 163, 184, 0.1)' }
            }
          }
        },
        plugins: (function () {
          var arr = [{
            id: 'fondoBlanco',
            beforeDraw: function (chart) {
              var ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, chart.canvas.width, chart.canvas.height);
              ctx.restore();
            }
          }];
          if (instanciaOriginal.config.plugins) {
            instanciaOriginal.config.plugins.forEach(function (p) { arr.push(p); });
          }
          return arr;
        })()
      });

      var imgData = canvasTmp.toDataURL('image/png');

      // Limpiar
      chartTmp.destroy();
      document.body.removeChild(canvasTmp);

      // Insertar imagen en PDF
      var h = 85;
      doc.addImage(imgData, 'PNG', rightX, yR, rightW, h);
      return yR + h + 3;

    } catch (e) {
      console.warn('[PDF] No se pudo generar grÃ¡fica modo claro:', e);
      // Intentar fallback directo
      try {
        var imgFallback = instanciaOriginal.toBase64Image('image/png');
        doc.addImage(imgFallback, 'PNG', rightX, yR, rightW, 85);
        return yR + 88;
      } catch (e2) { return yR; }
    }
  }

  function infoPaciente() {
    var nombre = (document.getElementById('global_nombre_nino') || {}).value || 'Paciente';
    var examina = (document.getElementById('global_examinador') || {}).value || '-';
    var fnRaw = (document.getElementById('global_fecha_nac') || {}).value;
    var feRaw = (document.getElementById('global_fecha_eval') || {}).value;
    var meses = parseInt((document.getElementById('global_edad_meses') || {}).value || 0);
    var edad = meses > 0
      ? (Math.floor(meses / 12) + ' a\u00f1os y ' + (meses % 12) + ' meses')
      : '-';
    return {
      nombre: nombre,
      examinador: examina,
      fechaNac: fmtFecha(fnRaw),
      fechaEval: fmtFecha(feRaw),
      edad: edad
    };
  }

  function nombreArchivo(prefix, nombre) {
    var fecha = new Date().toISOString().split('T')[0];
    return prefix + '_' + nombre.replace(/\s+/g, '_') + '_' + fecha + '.pdf';
  }

  //************************  Wisc ****************************************************
  function generarPDFWISC() {
    if (!window.wiscCalculado) {
      alerta('Primero calcula los resultados WISC-V.', 'warning');
      return;
    }
    conJsPDF(function (jsPDF) {
      alerta('Generando PDF WISC-V...', 'success');
      var L = layoutBase();
      var info = infoPaciente();

      var nombresP = {
        C: 'Cubos', S: 'Semejanzas', M: 'Matrices', D: 'Digitos', CL: 'Clave de Numeros',
        V: 'Vocabulario', B: 'Balanzas', PV: 'Puzles Visuales', SD: 'Span de Dibujos',
        BS: 'Busqueda de Simbolos', I: 'Informacion', LN: 'Letras y Numeros',
        CA: 'Cancelacion', CO: 'Comprension', A: 'Aritmetica'
      };

      var filas = typeof window.obtenerFilasParaGuardar === 'function'
        ? window.obtenerFilasParaGuardar() : [];

      var rowsEsc = filas.map(function (f) {
        return [(nombresP[f.sub] || f.sub) + ' (' + f.sub + ')', String(f.directa), String(f.escalar)];
      });

      var indices = (window.ultimoResultadoWISC && window.ultimoResultadoWISC.indices) || {};
      var rowsIdx = Object.keys(indices).map(function (k) {
        var d = indices[k];
        var ic = (d.ic_95_min && d.ic_95_max) ? (d.ic_95_min + '-' + d.ic_95_max + '%') : '-';
        return [NOMBRES_IDX[k] || k, String(d.suma || 0), String(d.ci || '-'), String(d.percentil || '-'), ic, diag(d.ci)];
      });

      var doc = new jsPDF(crearDoc('landscape'));
      var y = cabecera(doc, {
        titulo: 'Escala de Inteligencia de Wechsler para Niños-V',
        subtitulo: '',
        logo: window._logoBase64 || null, colorLinea: C.rojoWPP,
        pw: L.pw, margin: L.margin, logoW: 55, logoH: 24
      });

      y = cajaPaciente(doc, info, y, L.pw, L.margin);

      var yL = y;
      var yR = y;

      // Columna izquierda: tablas
      yL = seccion(doc, '1. Puntuaciones Escalares', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_ESC, rowsEsc, yL, L.margin);
      yL += 2;
      yL = seccion(doc, '2. Índices Clínicos y Diagnóstico', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_IDX, rowsIdx, yL, L.margin);

      // Columna derecha: grÃ¡fica
      var grafInst = window.graficoCompuestasWISC_instance || window.graficoPerfilChart;
      if (grafInst) {
        yR = seccion(doc, '3. Perfil de Puntuaciones Compuestas', yR, L.rightX, L.rightX + L.rightW);
        yR = addGraficaModoClaro(doc, grafInst, yR, L.rightX, L.rightW);
      }

      pie(doc, 'WISC-V', L.pw, L.ph, L.margin);
      doc.save(nombreArchivo('WISC-V', info.nombre));

      alerta('PDF WISC-V generado correctamente.', 'success');
      if (typeof window.mostrarModalPostGuardado === 'function') window.mostrarModalPostGuardado();
    });
  }

  //************************  WPPSI-IV Etapa 1 ****************************************************
  function generarPDFWPPSI1() {
    // Verificar que se haya calculado (el modal_body debe tener contenido)
    var panel = document.getElementById('panel_resultados_w1');
    var modalBody = document.getElementById('modal_body_wppsi1');
    if (!panel || panel.style.display === 'none') {
      alerta('Primero calcula los resultados WPPSI-IV Etapa 1.', 'warning');
      return;
    }
    conJsPDF(function (jsPDF) {
      alerta('Generando PDF WPPSI-IV Etapa 1...', 'success');
      var L = layoutBase();
      var info = infoPaciente();

      var nombresP = { D: 'Dibujos', C: 'Cubos', R: 'Reconocimiento', I: 'Informacion', RO: 'Rompecabezas', L: 'Localizacion', N: 'Nombres' };

      // Extraer datos de las tablas ya renderizadas en el DOM
      var rowsEsc = [];
      var rowsIdx = [];

      if (modalBody) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalBody.innerHTML;
        var tablas = tempDiv.querySelectorAll('table');
        if (tablas[0]) {
          tablas[0].querySelectorAll('tbody tr').forEach(function (tr) {
            var tds = tr.querySelectorAll('td');
            if (tds.length >= 3) rowsEsc.push([tds[0].textContent.trim(), tds[1].textContent.trim(), tds[2].textContent.trim()]);
          });
        }
        if (tablas[1]) {
          tablas[1].querySelectorAll('tbody tr').forEach(function (tr) {
            var tds = tr.querySelectorAll('td');
            if (tds.length >= 4) {
              var icRaw = tds[4] ? tds[4].textContent.trim() : '-';
              var ic = (icRaw !== '-' && !icRaw.includes('%')) ? icRaw + '%' : icRaw;
              rowsIdx.push([tds[0].textContent.trim(), tds[1].textContent.trim(), tds[2].textContent.trim(),
              tds[3].textContent.trim(), ic,
              tds[5] ? tds[5].textContent.trim() : diag(tds[2].textContent.trim())]);
            }
          });
        }
      }

      var doc = new jsPDF(crearDoc('landscape'));
      var y = cabecera(doc, {
        titulo: 'Escala de Inteligencia de Wechsler para Preescolar y Primaria-IV',
        subtitulo: '',
        logo: window._logoBase64 || null, colorLinea: C.rojoWPP,
        pw: L.pw, margin: L.margin, logoW: 55, logoH: 24
      });

      y = cajaPaciente(doc, info, y, L.pw, L.margin);
      var yL = y, yR = y;

      yL = seccion(doc, '1. Puntuaciones Escalares', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_ESC, rowsEsc, yL, L.margin);
      yL += 2;
      yL = seccion(doc, '2. Índices Clínicos y Diagnóstico', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_IDX, rowsIdx, yL, L.margin);

      if (window.graficoCompuestasWPPSI1_instance) {
        yR = seccion(doc, '3. Perfil de Puntuaciones Compuestas', yR, L.rightX, L.rightX + L.rightW);
        yR = addGraficaModoClaro(doc, window.graficoCompuestasWPPSI1_instance, yR, L.rightX, L.rightW);
      }

      pie(doc, 'WPPSI-IV - Etapa 1', L.pw, L.ph, L.margin);
      doc.save(nombreArchivo('WPPSI-IV_E1', info.nombre));

      alerta('PDF WPPSI-IV Etapa 1 generado correctamente.', 'success');
      if (typeof window.mostrarModalPostGuardado === 'function') window.mostrarModalPostGuardado();
    });
  }

  //************************  WPPSI-IV Etapa 2 ****************************************************
  function generarPDFWPPSI2() {
    var panel = document.getElementById('panel_resultados_w2');
    var contenidoEl = document.getElementById('contenido_resultados_w2');
    if (!panel || panel.style.display === 'none') {
      alerta('Primero calcula los resultados WPPSI-IV Etapa 2.', 'warning');
      return;
    }
    conJsPDF(function (jsPDF) {
      alerta('Generando PDF WPPSI-IV Etapa 2...', 'success');
      var L = layoutBase();
      var info = infoPaciente();

      var rowsEsc = [];
      var rowsIdx = [];

      if (contenidoEl) {
        var tablas = contenidoEl.querySelectorAll('table');
        if (tablas[0]) {
          tablas[0].querySelectorAll('tbody tr').forEach(function (tr) {
            var tds = tr.querySelectorAll('td');
            if (tds.length >= 3) rowsEsc.push([tds[0].textContent.trim(), tds[1].textContent.trim(), tds[2].textContent.trim()]);
          });
        }
        if (tablas[1]) {
          tablas[1].querySelectorAll('tbody tr').forEach(function (tr) {
            var tds = tr.querySelectorAll('td');
            if (tds.length >= 4) {
              var icRaw = tds[4] ? tds[4].textContent.trim() : '-';
              var ic = (icRaw !== '-' && !icRaw.includes('%')) ? icRaw + '%' : icRaw;
              rowsIdx.push([tds[0].textContent.trim(), tds[1].textContent.trim(), tds[2].textContent.trim(),
              tds[3].textContent.trim(), ic,
              tds[5] ? tds[5].textContent.trim() : diag(tds[2].textContent.trim())]);
            }
          });
        }
      }

      var doc = new jsPDF(crearDoc('landscape'));
      var y = cabecera(doc, {
        titulo: 'Escala de Inteligencia de Wechsler para Preescolar y Primaria-IV',
        subtitulo: '',
        logo: window._logoBase64 || null, colorLinea: C.rojoWPP,
        pw: L.pw, margin: L.margin, logoW: 55, logoH: 24
      });

      y = cajaPaciente(doc, info, y, L.pw, L.margin);
      var yL = y, yR = y;

      yL = seccion(doc, '1. Puntuaciones Escalares', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_ESC, rowsEsc, yL, L.margin);
      yL += 2;
      yL = seccion(doc, '2. Índices Clínicos y Diagnóstico', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_IDX, rowsIdx, yL, L.margin);

      if (window.miGraficoW2) {
        yR = seccion(doc, '3. Perfil de Puntuaciones Compuestas', yR, L.rightX, L.rightX + L.rightW);
        yR = addGraficaModoClaro(doc, window.miGraficoW2, yR, L.rightX, L.rightW);
      }

      pie(doc, 'WPPSI-IV - Etapa 2', L.pw, L.ph, L.margin);
      doc.save(nombreArchivo('WPPSI-IV_E2', info.nombre));

      alerta('PDF WPPSI-IV Etapa 2 generado correctamente.', 'success');
      if (typeof window.mostrarModalPostGuardado === 'function') window.mostrarModalPostGuardado();
    });
  }

  // â”€â”€ Historial ClÃ­nico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function generarPDFHistorial() {
    var ev = window._historialEvaluacionActual;
    if (!ev) {
      alerta('No hay evaluacion seleccionada para exportar.', 'warning');
      return;
    }
    conJsPDF(function (jsPDF) {
      alerta('Generando PDF del historial...', 'success');
      var L = layoutBase();

      var nombre = (ev.paciente && ev.paciente.nombre) || 'Paciente';
      var examina = (ev.paciente && ev.paciente.examinador) || '-';
      var feRaw = (ev.paciente && ev.paciente.fechaEval) || '';
      var fnRaw = (ev.paciente && ev.paciente.fechaNac && ev.paciente.fechaNac.trim())
        ? ev.paciente.fechaNac.trim() : '';
      var edadMeses = (ev.paciente && ev.paciente.edadMeses) || ev.edadMeses || 0;
      var edad = edadMeses ? (Math.floor(edadMeses / 12) + ' a\u00f1os y ' + (edadMeses % 12) + ' meses') : '-';

      var info = { nombre: nombre, examinador: examina, fechaNac: fmtFecha(fnRaw), fechaEval: fmtFecha(feRaw), edad: edad };

      var colores = { WISC: C.cyan, WPPSI1: C.rojoWPP, WPPSI2: C.verde };
      var colorLinea = colores[ev.tipo] || C.cyan;

      // Escalares desde datos guardados
      var subpruebas = ev.subpruebas || [];
      var rowsEsc = subpruebas.map(function (s) {
        return [(s.nombre || s.sub) + ' (' + s.sub + ')', String(s.directa || '-'), String(s.escalar || '-')];
      });

      // Ãndices desde datos guardados
      var indices = ev.indices || {};
      var rowsIdx = Object.keys(indices).map(function (k) {
        var d = indices[k];
        var icRaw = (d.ic_95_min && d.ic_95_max) ? (d.ic_95_min + '-' + d.ic_95_max) : (d.ic95 || '-');
        var icRawStr = String(icRaw);
        var ic = (icRawStr !== '-' && icRawStr.indexOf('%') === -1) ? icRawStr + '%' : icRawStr;
        return [NOMBRES_IDX[k] || k, String(d.suma || d.sumaEscalares || 0), String(d.ci || '-'), String(d.percentil || '-'), ic, diag(d.ci)];
      });

      var doc = new jsPDF(crearDoc('landscape'));
      var y = cabecera(doc, {
        titulo: (ev.tipoPrueba ? ev.tipoPrueba + '\n' : 'Historial\n') + 'Registro Historico',
        subtitulo: '',
        logo: window._logoBase64 || null, colorLinea: colorLinea,
        pw: L.pw, margin: L.margin, logoW: 55, logoH: 24
      });

      y = cajaPaciente(doc, info, y, L.pw, L.margin);
      var yL = y, yR = y;

      yL = seccion(doc, '1. Puntuaciones Escalares', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_ESC, rowsEsc, yL, L.margin);
      yL += 2;
      yL = seccion(doc, '2. Índices Clínicos y Diagnóstico', yL, L.margin, L.margin + L.leftW);
      yL = dibujarTabla(doc, COLS_IDX, rowsIdx, yL, L.margin);

      // GrÃ¡fica del historial (canvas que estÃ¡ visible en el modal)
      var canvas = document.getElementById('grafico_historial_revisar');
      if (canvas && window._graficoHistorialRevisar) {
        try {
          yR = seccion(doc, '3. Perfil de Puntuaciones Compuestas', yR, L.rightX, L.rightX + L.rightW);
          yR = addGraficaModoClaro(doc, window._graficoHistorialRevisar, yR, L.rightX, L.rightW);
        } catch (e) { /* sin grÃ¡fica */ }
      }

      pie(doc, ev.tipoPrueba || 'Historial', L.pw, L.ph, L.margin);
      var tipoPDF = (ev.tipoPrueba || 'Historial').replace(/[^a-z0-9]/gi, '_');
      doc.save('Historial_' + tipoPDF + '_' + nombre.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.pdf');

      alerta('PDF del historial generado correctamente.', 'success');
    });
  }

  // â”€â”€ Registrar en window (sobreescribir funciones anteriores) â”€â”€
  window.descargarPDFWISC = generarPDFWISC;
  window.descargarPDFWPPSI_1 = generarPDFWPPSI1;
  window.descargarPDFWPPSI_2 = generarPDFWPPSI2;
  window.generarPDFDesdeRevision = generarPDFHistorial;

  // API pÃºblica para debugging
  window.PDFGenerator = {
    wisc: generarPDFWISC,
    wppsi1: generarPDFWPPSI1,
    wppsi2: generarPDFWPPSI2,
    historial: generarPDFHistorial
  };

  console.log('[PDF Generator v3.0] Listo. Usando jsPDF puro sin html2canvas.');

}());

