// public/js/main.js
// CONTROLADOR PRINCIPAL: Ruteo, Vistas y Utilidades Globales
// Sistema Fusionado WISC-V + WPPSI-IV

document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  const inputEval = document.getElementById('global_fecha_eval');
  const inputNac  = document.getElementById('global_fecha_nac');

  if (inputEval) inputEval.value = hoy;
  if (inputNac)  inputNac.max   = hoy;
  if (inputEval) inputEval.max  = hoy;

  // Inicializar animaciones de GSAP al cargar el DOM
  if (typeof window.initAnimations === 'function') {
    window.initAnimations();
  }
});

// ==========================================
// INICIALIZACIÓN DE ANIMACIONES PREMIUM (GSAP)
// ==========================================
window.initAnimations = () => {
  // 1. Inicializar Fondo Dinámico
  const bg = document.getElementById('dynamic-bg');
  if (bg) {
    bg.innerHTML = `
      <div class="dynamic-orb orb-1"></div>
      <div class="dynamic-orb orb-2"></div>
      <div class="dynamic-orb orb-3"></div>
    `;
    const orbes = bg.querySelectorAll('.dynamic-orb');
    
    // Movimiento orgánico flotante para cada orbe
    orbes.forEach((orb, i) => {
      // Posición inicial aleatoria
      gsap.set(orb, {
        xPercent: gsap.utils.random(-10, 80),
        yPercent: gsap.utils.random(-10, 80),
        scale: gsap.utils.random(0.8, 1.3)
      });

      // Animación en bucle con yoyo para flotar orgánicamente
      gsap.to(orb, {
        xPercent: `+=${gsap.utils.random(-30, 30)}`,
        yPercent: `+=${gsap.utils.random(-30, 30)}`,
        duration: gsap.utils.random(15, 25),
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: i * 2
      });
    });

    // Interacción suave con el mouse
    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const xNorm = (clientX / window.innerWidth - 0.5) * 40; // max 40px desplazamiento
      const yNorm = (clientY / window.innerHeight - 0.5) * 40;

      orbes.forEach((orb, i) => {
        const factor = (i + 1) * 0.4; // Cada orbe se mueve a diferente velocidad
        gsap.to(orb, {
          x: xNorm * factor,
          y: yNorm * factor,
          duration: 1.5,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    });
  }

  // 2. Animación de entrada inicial de la Login-Card
  const loginCard = document.querySelector('.login-card');
  if (loginCard) {
    // Evitar parpadeos ocultándola inicialmente
    gsap.set(loginCard, { autoAlpha: 0, y: 50, scale: 0.97 });
    
    const timeline = gsap.timeline({ delay: 0.2 });
    timeline.to(loginCard, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power3.out"
    });

    // Animar elementos interiores con stagger
    const elementosInternos = loginCard.querySelectorAll('.login-sidebar img, .login-sidebar h1, .login-body h2, .form-row, #vista_previa_edad, .btn-primary');
    if (elementosInternos.length > 0) {
      timeline.fromTo(elementosInternos, 
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.06 },
        "-=0.7"
      );
    }
  }
};

// ==========================================
// VISTA PREVIA DE EDAD EN TIEMPO REAL
// ==========================================
window.mostrarEdadPrevia = () => {
  const nac       = document.getElementById('global_fecha_nac')?.value;
  const evalDate  = document.getElementById('global_fecha_eval')?.value;
  const vistaPrevia  = document.getElementById('vista_previa_edad');
  const inputMeses   = document.getElementById('global_edad_meses');

  if (!nac || !evalDate || !vistaPrevia) return;

  const fNac  = new Date(nac  + 'T00:00:00');
  const fEval = new Date(evalDate + 'T00:00:00');

  if (fEval < fNac) {
    vistaPrevia.innerHTML = '<span style="color:var(--accent-cyan); font-weight:600;">⚠️ La fecha de evaluación no puede ser menor a la de nacimiento.</span>';
    if (inputMeses) inputMeses.value = 0;
    return;
  }

  let anos = fEval.getFullYear() - fNac.getFullYear();
  let meses = fEval.getMonth() - fNac.getMonth();
  let dias = fEval.getDate() - fNac.getDate();

  if (dias < 0) {
    meses--;
    dias += 30; // Regla psicométrica: 1 mes = 30 días, sin redondeo a mes superior
  }

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  const totalMeses = (anos * 12) + meses;
  if (inputMeses) inputMeses.value = totalMeses;

  let prueba = '';
  if (totalMeses >= 30 && totalMeses <= 47)  prueba = 'WPPSI-IV (2:6 - 3:11 años)';
  else if (totalMeses >= 48 && totalMeses <= 71)  prueba = 'WPPSI-IV (4:0 - 5:11 años)';
  else if (totalMeses >= 72 && totalMeses <= 203) prueba = 'WISC-V (6:0 - 16:11 años)';
  else prueba = '❌ Edad fuera de los rangos clínicos disponibles';

  vistaPrevia.innerHTML = `Edad cronológica: <span style="color:var(--text-main); font-weight:700;">${anos} años, ${meses} meses y ${dias} días</span><br>Prueba sugerida: <span style="color:var(--accent-cyan); font-weight:700;">${prueba}</span>`;
};

// ==========================================
// VALIDACIÓN Y ENRUTAMIENTO CLÍNICO
// ==========================================
window.validarYEnrutar = () => {
  const nombre     = document.getElementById('global_nombre_nino')?.value.trim();
  const examinador = document.getElementById('global_examinador')?.value.trim();
  const nac        = document.getElementById('global_fecha_nac')?.value;
  const fechaEval  = document.getElementById('global_fecha_eval')?.value;
  const meses      = parseInt(document.getElementById('global_edad_meses')?.value || 0);
  const diasExtra  = parseInt(document.getElementById('global_edad_dias_extra')?.value || 0);

  // Validaciones estrictas
  if (!nombre) {
    window.mostrarAlertaLocal('Por favor ingrese el nombre del paciente.', 'warning');
    return;
  }
  if (!examinador) {
    window.mostrarAlertaLocal('Por favor ingrese el nombre del examinador.', 'warning');
    return;
  }
  if (!nac || isNaN(meses) || meses <= 0) {
    window.mostrarAlertaLocal('Por favor ingresa una fecha de nacimiento válida.', 'warning');
    return;
  }
  if (!fechaEval) {
    window.mostrarAlertaLocal('Por favor ingresa la fecha de evaluación.', 'warning');
    return;
  }

  const hoyStr = new Date().toISOString().split('T')[0];
  if (fechaEval > hoyStr) {
    window.mostrarAlertaLocal('La fecha de evaluación no puede superar la fecha actual.', 'warning');
    return;
  }
  if (nac >= fechaEval) {
    window.mostrarAlertaLocal('Error cronológico: La fecha de nacimiento debe ser anterior a la evaluación.', 'warning');
    return;
  }

  const anos          = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  const textoResumen  = `
    <div style="display:flex; flex-direction:row; gap:2rem; align-items:center; justify-content:center; flex-wrap:wrap; margin-bottom: 0.5rem;">
      <span style="display:flex; align-items:center; gap:0.5rem;">
        <span class="material-symbols-rounded" style="font-size:1.2em;">person</span>
        <span><strong>Paciente:</strong> ${nombre}</span>
      </span>
      <span style="display:flex; align-items:center; gap:0.5rem;">
        <span class="material-symbols-rounded" style="font-size:1.2em;">calendar_month</span>
        <span><strong>Edad:</strong> ${anos} años, ${mesesRestantes} meses, ${diasExtra} días</span>
      </span>
      <span style="display:flex; align-items:center; gap:0.5rem;">
        <span class="material-symbols-rounded" style="font-size:1.2em;">badge</span>
        <span><strong>Examinador:</strong> ${examinador}</span>
      </span>
    </div>
  `;

  const configScreen = document.getElementById('pantalla_configuracion');
  
  // Transición suave de salida para la pantalla de configuración con GSAP
  gsap.killTweensOf(configScreen);
  gsap.to(configScreen, {
    autoAlpha: 0,
    y: -30,
    scale: 0.98,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      configScreen.style.display = 'none';
      // Restaurar valores iniciales silenciosamente por si regresa
      gsap.set(configScreen, { autoAlpha: 1, y: 0, scale: 1 });

      let moduloId = '';
      if (meses >= 30 && meses <= 47) {
        moduloId = 'modulo_wppsi_1';
        const info = document.getElementById('info_resumen_w1');
        if (info) info.innerHTML = textoResumen;
      }
      else if (meses >= 48 && meses <= 71) {
        moduloId = 'modulo_wppsi_2';
        const info = document.getElementById('info_resumen_w2');
        if (info) info.innerHTML = textoResumen;
      }
      else if (meses >= 72 && meses <= 203) {
        moduloId = 'modulo_wisc';
        const info = document.getElementById('info_resumen_wisc');
        if (info) info.innerHTML = textoResumen;

        // Sincronización silenciosa para la lógica WISC-V legacy
        const elAnos  = document.getElementById('edad_anos');
        const elMeses = document.getElementById('edad_meses');
        if (elAnos)  elAnos.value  = anos;
        if (elMeses) elMeses.value = mesesRestantes;
      }

      if (moduloId) {
        // Ocultar botón de historial al entrar a una evaluación
        const btnHistorial = document.getElementById('btn_historial_clinico_global');
        if (btnHistorial) gsap.to(btnHistorial, { autoAlpha: 0, duration: 0.3, onComplete: () => btnHistorial.style.display = 'none' });

        // Ocultar botones flotantes superiores durante la evaluación
        ['btn_logout', 'user_info_badge'].forEach(id => {
          const el = document.getElementById(id);
          if (el) gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: () => el.style.display = 'none' });
        });

        const targetModulo = document.getElementById(moduloId);
        if (targetModulo) {
          gsap.killTweensOf(targetModulo);
          gsap.set(targetModulo, { display: 'block', autoAlpha: 0, x: 40 });
          gsap.to(targetModulo, { autoAlpha: 1, x: 0, duration: 0.6, ease: "power3.out" });
        }
      } else {
        window.mostrarAlertaLocal('La edad ingresada no aplica para las pruebas disponibles.', 'error');
        configScreen.style.display = 'flex';
      }
    }
  });
};

// Volver a la pantalla de configuración inicial con transición lateral
window.regresarAConfiguracion = () => {
  const modulos = ['modulo_wppsi_1', 'modulo_wppsi_2', 'modulo_wisc']
    .map(id => document.getElementById(id))
    .filter(el => el && el.style.display !== 'none');

  if (modulos.length > 0) {
    gsap.to(modulos, {
      autoAlpha: 0,
      x: -40,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        modulos.forEach(el => el.style.display = 'none');
        
        // Mostrar botón de historial al volver al inicio
        const btnHistorial = document.getElementById('btn_historial_clinico_global');
        if (btnHistorial) {
          btnHistorial.style.display = 'flex';
          gsap.to(btnHistorial, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
        }

        const config = document.getElementById('pantalla_configuracion');
        if (config) {
          gsap.killTweensOf(config);
          config.style.display = 'flex';
          gsap.fromTo(config, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        }

        // Restaurar botones flotantes superiores
        ['btn_logout', 'user_info_badge'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.display = 'flex';
            gsap.to(el, { autoAlpha: 1, duration: 0.3 });
          }
        });
      }
    });
  } else {
    ['modulo_wppsi_1', 'modulo_wppsi_2', 'modulo_wisc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    
    const btnHistorial = document.getElementById('btn_historial_clinico_global');
    if (btnHistorial) {
      btnHistorial.style.display = 'flex';
      gsap.set(btnHistorial, { autoAlpha: 1 });
    }

    const configScreen = document.getElementById('pantalla_configuracion');
    if (configScreen) configScreen.style.display = 'flex';
  }
};

// ==========================================
// UTILIDADES VISUALES
// ==========================================

window.toggleOpcionalesW1 = () => {
  const overlay = document.getElementById('modal_opcionales_w1');
  const card = overlay.querySelector('.opcionales-modal-card');
  if (!overlay) return;
  gsap.set(overlay, { visibility: 'visible' });
  gsap.to(overlay, { autoAlpha: 1, duration: 0.3 });
  gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
};
window.closeOpcionalesW1 = () => {
  const overlay = document.getElementById('modal_opcionales_w1');
  const card = overlay.querySelector('.opcionales-modal-card');
  if (!overlay) return;
  gsap.to(card, { y: 30, scale: 0.95, duration: 0.3, ease: "power2.in" });
  gsap.to(overlay, { autoAlpha: 0, duration: 0.3, delay: 0.1, onComplete: () => gsap.set(overlay, { visibility: 'hidden' }) });
};

window.toggleOpcionalesW2 = () => {
  const overlay = document.getElementById('modal_opcionales_w2');
  const card = overlay.querySelector('.opcionales-modal-card');
  if (!overlay) return;
  gsap.set(overlay, { visibility: 'visible' });
  gsap.to(overlay, { autoAlpha: 1, duration: 0.3 });
  gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
};
window.closeOpcionalesW2 = () => {
  const overlay = document.getElementById('modal_opcionales_w2');
  const card = overlay.querySelector('.opcionales-modal-card');
  if (!overlay) return;
  gsap.to(card, { y: 30, scale: 0.95, duration: 0.3, ease: "power2.in" });
  gsap.to(overlay, { autoAlpha: 0, duration: 0.3, delay: 0.1, onComplete: () => gsap.set(overlay, { visibility: 'hidden' }) });
};

window.toggleOpcionalesWisc = () => {
  const overlay = document.getElementById('modal_opcionales_wisc');
  const card = overlay.querySelector('.opcionales-modal-card');
  if (!overlay) return;
  gsap.set(overlay, { visibility: 'visible' });
  gsap.to(overlay, { autoAlpha: 1, duration: 0.3 });
  gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
};
window.closeOpcionalesWisc = () => {
  const overlay = document.getElementById('modal_opcionales_wisc');
  const card = overlay.querySelector('.opcionales-modal-card');
  if (!overlay) return;
  gsap.to(card, { y: 30, scale: 0.95, duration: 0.3, ease: "power2.in" });
  gsap.to(overlay, { autoAlpha: 0, duration: 0.3, delay: 0.1, onComplete: () => gsap.set(overlay, { visibility: 'hidden' }) });
};

window.validarNumero = (input) => {
  if (input.value < 0) input.value = 0;
  input.value = input.value.replace(/[^0-9]/g, '');
  if (input.value === '') return;

  const val = parseInt(input.value);
  const idParts = input.id.split('_'); 
  
  if (idParts[0] === 'pd' && idParts.length >= 2) {
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
      window.mostrarModalCorreccionFrontal(`Has excedido el límite.<br><br>La puntuación directa máxima para esta subprueba es: <strong>${maxPosible}</strong>.<br><br><span style="font-size:0.9em;color:#666;">Se ha ajustado automáticamente al valor máximo permitido.</span>`);
    }
  }
};

// Modal frontal para validación de máximos
window.mostrarModalCorreccionFrontal = (mensaje) => {
  let modal = document.getElementById('modal_correccion_frontal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal_correccion_frontal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;justify-content:center;align-items:center;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:#ffffff;border-radius:16px;padding:32px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);border:2px solid #e74c3c;">
        <span class="material-symbols-rounded" style="font-size:64px;color:#e74c3c;margin-bottom:16px;display:block;">warning</span>
        <h3 style="color:#0f3460;font-size:1.3em;margin-bottom:12px;">Valor Excedido</h3>
        <p style="color:#334155;line-height:1.5;margin-bottom:24px;font-size:1.05em;" id="texto_correccion_frontal"></p>
        <button onclick="window.cerrarModalCorreccionFrontal()" class="btn-primary" style="width:100%;padding:12px;font-size:1.1em;border-radius:12px;background:#e74c3c;box-shadow:0 4px 15px rgba(231,76,60,0.4);">Entendido</button>
      </div>
    `;
    document.body.appendChild(modal);
    
    window.cerrarModalCorreccionFrontal = () => {
      gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { modal.style.display = 'none'; } });
      gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.25, ease: "power2.in" });
    };
  }
  
  document.getElementById('texto_correccion_frontal').innerHTML = mensaje;
  
  gsap.killTweensOf([modal, modal.firstElementChild]);
  gsap.set(modal, { display: 'flex', autoAlpha: 0 });
  gsap.set(modal.firstElementChild, { scale: 0.7, y: 40 });
  gsap.to(modal, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
  gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" });
};

// ==========================================
// SISTEMA DE ALERTAS GLOBAL
// ==========================================
window.mostrarAlertaLocal = (mensaje, tipo = 'error') => {
  let contenedor = document.getElementById('contenedor_alertas');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'contenedor_alertas';
    contenedor.setAttribute('role', 'status');
    contenedor.setAttribute('aria-live', 'polite');
    document.body.appendChild(contenedor);
  }

  const div = document.createElement('div');
  div.className = `alerta-local alerta-${tipo}`;
  
  const icon = tipo === 'success' ? 'check_circle' : (tipo === 'warning' ? 'warning' : 'error');
  const iconColor = tipo === 'success' ? 'var(--accent-green)' : (tipo === 'warning' ? 'var(--accent-orange)' : 'var(--accent-red)');
  
  div.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <span class="material-symbols-rounded" style="color:${iconColor}; font-size:24px;">${icon}</span>
      <span style="line-height:1.4;">${mensaje}</span>
    </div>
  `;
  
  contenedor.appendChild(div);
  
  setTimeout(() => {
    if (typeof gsap !== 'undefined') {
      gsap.to(div, { opacity: 0, x: 50, duration: 0.4, onComplete: () => div.remove() });
    } else {
      div.style.transition = 'opacity 0.4s';
      div.style.opacity = '0';
      setTimeout(() => div.remove(), 400);
    }
  }, 2500);
};

// ==========================================
// MODAL DE CONFIRMACIÓN ASÍNCRONO
// ==========================================
window.confirmarClinico = (mensaje) => {
  return new Promise((resolve) => {
    const modal      = document.getElementById('modal_confirmacion');
    const texto      = document.getElementById('texto_confirmacion');
    const btnAceptar = document.getElementById('btn_modal_aceptar');
    const btnCancelar = document.getElementById('btn_modal_cancelar');

    if (!modal || !texto || !btnAceptar || !btnCancelar) {
      resolve(confirm(mensaje));
      return;
    }

    texto.innerHTML = mensaje;
    
    // Animación elástica de apertura con GSAP
    gsap.killTweensOf([modal, modal.firstElementChild]);
    gsap.set(modal, { display: 'flex', autoAlpha: 0 });
    gsap.set(modal.firstElementChild, { scale: 0.8, y: 30 });
    gsap.to(modal, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(modal.firstElementChild, { scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" });

    const cerrarYResolver = (resultado) => {
      gsap.killTweensOf([modal, modal.firstElementChild]);
      gsap.to(modal, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { modal.style.display = 'none'; } });
      gsap.to(modal.firstElementChild, { scale: 0.8, y: 20, duration: 0.25, ease: "power2.in" });
      
      btnAceptar.removeEventListener('click', onAceptar);
      btnCancelar.removeEventListener('click', onCancelar);
      resolve(resultado);
    };

    const onAceptar  = () => cerrarYResolver(true);
    const onCancelar = () => cerrarYResolver(false);

    btnAceptar.addEventListener('click', onAceptar);
    btnCancelar.addEventListener('click', onCancelar);
  });
};

// Obtener color para textos de gráficas según el tema
window.getChartTextColor = () => {
  return document.body.getAttribute('data-theme') === 'light' ? '#475569' : '#94a3b8';
};

// LIMPIEZA GLOBAL DE TODOS LOS FORMULARIOS
window.limpiarFormulariosGlobal = () => {
  const hoy = new Date().toISOString().split('T')[0];
  // 1. Limpiar datos demográficos
  const demoIds = ['global_nombre_nino', 'global_fecha_nac', 'global_fecha_eval', 'global_edad_meses'];
  demoIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'global_edad_meses') el.value = 0;
      else if (id === 'global_fecha_eval') el.value = hoy;
      else el.value = '';
    }
  });
  
  const vistaPrevia = document.getElementById('vista_previa_edad');
  if (vistaPrevia) vistaPrevia.innerHTML = '';

  // 2. Limpiar WISC-V
  const wiscSubs = ['C','S','M','D','CL','V','B','PV','SD','BS','I','LN','CA','CO','A'];
  wiscSubs.forEach(s => {
    const el = document.getElementById(`pd_${s}`);
    if (el) el.value = '';
  });
  const wiscExtra = ['edad_anos', 'edad_meses'];
  wiscExtra.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  // 3. Limpiar WPPSI-IV Etapa 1
  const wppsi1Subs = ['D', 'C', 'R', 'I', 'RO', 'L', 'N'];
  wppsi1Subs.forEach(s => {
    const el = document.getElementById(`pd_${s}_w1`);
    if (el) el.value = '';
  });

  // 4. Limpiar WPPSI-IV Etapa 2
  const wppsi2Subs = ['C', 'I', 'M', 'BA', 'R', 'S', 'CON', 'CA', 'L', 'RO', 'V', 'CF', 'CO', 'D', 'N'];
  wppsi2Subs.forEach(s => {
    const el = document.getElementById(`pd_${s}_w2`);
    if (el) el.value = '';
  });

  // 5. Ocultar todos los paneles de resultados
  const resultadosIds = ['panel_resultados', 'panel_grafico', 'panel_resultados_w1', 'panel_resultados_w2'];
  resultadosIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('panel-visible');
      el.classList.add('panel-oculto');
    }
  });

  // 6. Mostrar paneles de ingreso
  ['panel_ingreso_wisc', 'panel_ingreso_w1', 'panel_ingreso_w2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });

  // Restaurar visibilidad de botones Volver
  document.querySelectorAll('.btn-volver').forEach(btn => btn.style.display = '');

  // 7. Resetear clases de layout en grid-main
  document.querySelectorAll('.grid-main').forEach(el => {
    el.classList.remove('layout-expandido');
    el.classList.add('layout-centrado');
  });

  // 8. Restaurar sidebars
  document.querySelectorAll('.clinical-sidebar-card').forEach(el => el.style.display = '');
  document.querySelectorAll('.clinical-dashboard-layout').forEach(el => el.style.gridTemplateColumns = '');
};

// ==========================================
// NAVEGACIÓN INTELIGENTE (Flechas y Enter)
// ==========================================
document.addEventListener('keydown', (e) => {
  const target = e.target;
  if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

  // Teclas que manejaremos
  const isNext = (e.key === 'ArrowDown' || e.key === 'ArrowRight' || (e.key === 'Enter' && target.type !== 'submit'));
  const isPrev = (e.key === 'ArrowUp' || e.key === 'ArrowLeft');

  if (isNext || isPrev) {
    // Obtener todos los campos de entrada que son visibles en el DOM actualmente
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      });

    const index = inputs.indexOf(target);
    if (index === -1) return;

    e.preventDefault();
    let targetIndex = isNext ? index + 1 : index - 1;

    // Navegación circular
    if (targetIndex >= inputs.length) targetIndex = 0;
    if (targetIndex < 0) targetIndex = inputs.length - 1;

    const nextEl = inputs[targetIndex];
    if (nextEl) {
      nextEl.focus();
      if (typeof nextEl.select === 'function' && nextEl.type !== 'date') {
        nextEl.select(); // Autoseleccionar contenido para facilitar reescritura
      }
    }
  }
});



window.addEventListener('load', () => { if(window.location.hash === '#historial') { const btn = document.getElementById('btn_historial_clinico_global'); if(btn) btn.click(); } });


/* Sincronizacion con React Wrapper */
window.addEventListener('message', (event) => {
  if(event.data && event.data.type === 'SYNC_THEME') {
    document.body.setAttribute('data-theme', event.data.theme);
    // Update logo logic if any
    const logoDark = document.querySelector('.logo-dark');
    const logoLight = document.querySelector('.logo-light');
    if(logoDark && logoLight) {
      if(event.data.theme === 'dark') {
        logoDark.style.display = 'block';
        logoLight.style.display = 'none';
      } else {
        logoDark.style.display = 'none';
        logoLight.style.display = 'block';
      }
    }
  }
});

