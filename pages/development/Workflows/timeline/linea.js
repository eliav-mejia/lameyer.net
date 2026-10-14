// Línea de tiempo de las etapas: flujo de control principal (tronco) con ramas que se separan, se suavizan en paralelo
// y vuelven al tronco al cerrar la etapa. Avance de cada rama → opacidad, grosor y división en 1–3 líneas.
// Los datos llegan en window.TIMELINE (datos/<id>.js, cargado por index.html). Formato: datos/_plantilla.js.
(() => {
  'use strict';

  const T = window.TIMELINE;
  const LARGO = 1700;          // largo de cada etapa en unidades de mundo
  const HUECO = 260;           // tramo de tronco entre etapas
  const CARRIL = 120;          // separación vertical entre carriles de rama
  const CURVA = 280;           // largo de la curva de salida / regreso
  const ABRE = 16;             // separación entre las líneas en que se divide una rama
  const VEL = 150;             // unidades de mundo por segundo a 1×
  const Z_MIN = 0.2, Z_MAX = 5, Z_ENTRA = 1.5, Z_SALE = 1.3;

  const INK = '26,32,44', AZUL = '37,99,235';
  const reduceMov = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Geometría -------------------------------------------------------------------------------------------------
  // Rama que regresa: su flujo va de b hacia a. espejo() pasa de la posición en el flujo a la del mundo (y al revés).
  const espejo = (r, x) => (r.atras ? r.a + r.b - x : x);
  const suave = t => { t = Math.min(1, Math.max(0, t)); return t * t * t * (t * (t * 6 - 15) + 10); };
  const R = window.TimelineReglas;
  const nLineas = R.nLineas;
  const opac = av => 0.13 + 0.87 * Math.pow(av, 0.75);
  const pct = v => `${Math.round(v * 100)} %`;

  // --- Validación de datos (reglas.js) ---------------------------------------------------------------------------
  // Errores: impiden dibujar. Avisos: se dibuja igual (con valores por defecto) y se muestran arriba.
  function avisar(lista) {
    const a = document.getElementById('aviso');
    if (!a || !lista.length) return;
    a.hidden = false;
    a.innerHTML += lista.map(t => `<p>${t}</p>`).join('');
  }

  const revision = R.validar(T);
  avisar([...revision.err, ...revision.av]);
  if (revision.err.length) { document.getElementById('panel').hidden = true; return; }

  const ETAPAS = T.etapas;
  const UNIDAD = T.unidad || 'Etapa';
  const RAMA = T.subunidad || 'Rama';                 // cómo se llama cada rama: Rama, Módulo, Taller…
  const RAMAS = /[aeiouáéíóú]$/i.test(RAMA) ? `${RAMA}s` : `${RAMA}es`;
  const rama = RAMA.toLowerCase();
  const B = T.bloque && T.bloque.nombre ? T.bloque : null;   // bloque opcional que agrupa todas las etapas
  const nomBloque = B ? `Bloque ${B.num || 1}` : '';
  const porId = Object.fromEntries(ETAPAS.map(e => [e.id, e]));
  if (T.titulo) document.title = `${T.titulo} · Lameyer`;
  if (RAMA !== 'Rama') {
    const etq = document.querySelectorAll('.control .etq')[1], ay = document.querySelector('.ayuda');
    if (etq) etq.textContent = RAMA;
    const masc = /o$/i.test(RAMA);   // Módulo, Taller… → «un módulo», «crítico»
    if (ay) ay.textContent = ay.textContent.replace(/\buna rama\b/g, `${masc ? 'un' : 'una'} ${rama}`).replace(/\brama\b/g, rama);
    const crit = document.querySelector('.leyenda .critica');
    if (crit && crit.nextSibling) crit.nextSibling.textContent = ` ${rama} ${masc ? 'crítico' : 'crítica'} y su peso`;
  }
  if (B) {
    const eb = document.getElementById('bloque');
    if (eb) {
      eb.hidden = false;
      eb.innerHTML = `<b>${nomBloque}</b>${B.sigla || B.nombre}`;
      eb.title = [`${B.nombre}${B.sigla ? ` (${B.sigla})` : ''}`, B.lema, B.alcance, B.formato].filter(Boolean).join('\n');
    }
  }

  ETAPAS.forEach((e, s) => {
    e.num = e.num || String(s + 1);
    e.fechas = e.fechas || '';
    e.estado = e.estado || 'Pendiente';
    e.depende = e.depende || [];
    e.x0 = s * (LARGO + HUECO);
    e.x1 = e.x0 + LARGO;
    R.pesos(e).forEach((w, i) => { e.ramas[i].peso = w; });   // parte del total de la etapa (críticas: su `critica`)
    e.avance = R.avanceEtapa(e);                                // avance ponderado
    e.ramas.sort((a, b) => b.avance - a.avance);   // las más avanzadas, más cerca del tronco
    // Carriles: primero las ramas que vuelven al tronco, alternando arriba y abajo. Las que se unen a otra rama van del
    // lado de esa rama, y las que regresan, del lado de la rama de la que salen; cada una, un carril más afuera.
    const porNombre = n => e.ramas.find(q => q.nombre === n);
    const usados = { '-1': 0, '1': 0 };
    const poner = (r, lado) => { usados[lado]++; r.carril = lado * usados[lado] * CARRIL; };
    e.ramas.filter(R.alTronco).forEach((r, i) => poner(r, i % 2 === 0 ? -1 : 1));
    e.ramas.filter(r => r.une).forEach(r => poner(r, Math.sign(porNombre(r.une).carril)));
    e.ramas.filter(r => r.regresa).forEach(r => poner(r, Math.sign(porNombre(r.desde).carril)));
    e.ramas.forEach((r, i) => {
      r.etapa = e; r.i = i;
      r.a = e.x0 + 110 + i * 55;
      r.b = e.x1 - 110 - i * 55;
      r.y0 = 0; r.y1 = 0;                          // altura de salida y de llegada (0 = tronco)
      r.atras = false;
    });
    e.ramas.forEach(r => {
      if (r.une) {
        // Se reúne con su rama antes de que esa rama vuelva al tronco
        r.unida = porNombre(r.une);
        r.b = Math.min(r.b, r.unida.b - CURVA - 60);
        r.y1 = r.unida.carril;
      } else if (r.regresa) {
        // Sale de la rama `desde` al empezar la etapa y corre hacia atrás hasta la rama principal de la etapa `regresa`
        const desde = porNombre(r.desde);
        r.destino = porId[r.regresa].ramas[0];
        r.atras = true;
        r.a = r.destino.a + CURVA + 160;
        r.b = desde.a + CURVA + 260;
        r.y0 = r.destino.carril; r.y1 = desde.carril;
      }
    });
    e.ramas.forEach(r => {
      r.xf = r.a + r.avance * (r.b - r.a);         // punto de avance en el sentido del flujo
      r.xp = espejo(r, r.xf);                      // … y sobre el mundo (la rama que regresa avanza de b hacia a)
      r.n = nLineas(r.avance);
      r.lineas = Array.from({ length: r.n }, (_, j) => (r.lineas || [])[j] || `línea ${j + 1}`);
    });
    e.xmin = Math.min(e.x0, ...e.ramas.map(r => r.a));   // las ramas que regresan empiezan antes de la etapa
  });
  const FIN = ETAPAS[ETAPAS.length - 1].x1 + HUECO;
  const INICIO = -HUECO;

  // Etapas alcanzadas: sus dependencias llegaron al umbral (85 % por defecto). Las demás son futuras: se difuminan y el
  // ciclo no entra en ellas. El pulso recorre del inicio al cierre de la última etapa alcanzada y vuelve a empezar.
  const UMBRAL = R.umbralDe(T);
  const ALCANZADAS = R.alcanzadas(T);
  ETAPAS.forEach(e => { e.futura = !ALCANZADAS.has(e.id); });
  const VIGENTES = ETAPAS.filter(e => !e.futura);
  const LIMITE = Math.max(...(VIGENTES.length ? VIGENTES : ETAPAS.slice(0, 1)).map(e => e.x1)) + HUECO / 2;   // fin del ciclo
  // Qué falta para desbloquear una etapa futura: dependencias por debajo del umbral (o futuras ellas mismas)
  const bloqueos = e => e.depende.map(d => porId[d]).filter(d => d.futura || !R.cumple(T, d));
  const umbralTxt = d => `${pct(R.umbralEtapa(T, d))}${typeof d.umbral === 'number' ? ` en cada ${rama}` : ''}`;

  // Sale de y0 (tronco u otra rama), corre en su carril y llega a y1 (tronco, la rama a la que se une o de la que salió)
  const yRama = (r, x) => r.y0 + (r.carril - r.y0) * suave((x - r.a) / CURVA) + (r.y1 - r.carril) * suave((x - (r.b - CURVA)) / CURVA);
  // Cuánto se abren las sub-líneas: después de asentarse la rama y hasta reunirse en el punto de avance
  const apertura = (r, x) => {
    if (r.n < 2) return 0;
    x = espejo(r, x);
    const s0 = r.a + CURVA * 0.9, s1 = r.xf, L = s1 - s0;
    if (L <= 0) return 0;
    const k = Math.min(CURVA * 0.75, L / 2);
    return suave((x - s0) / k) * (1 - suave((x - (s1 - k)) / k));
  };
  const ySub = (r, j, x) => yRama(r, x) + (j - (r.n - 1) / 2) * ABRE * apertura(r, x);
  const etapaEn = x => {
    for (const e of ETAPAS) if (x < e.x1 + HUECO / 2) return e;
    return ETAPAS[ETAPAS.length - 1];
  };
  const activa = (r, x) => x >= r.a && x <= r.b;
  // Posición del pulso en el mundo: sobre la rama enfocada (al revés si regresa) o sobre el tronco
  const pulso = () => {
    const r = st.dentro ? st.foco : null;
    if (!r || !activa(r, st.px)) return [st.px, 0];
    const x = espejo(r, st.px);
    return [x, yRama(r, x)];
  };

  // --- Estado ---------------------------------------------------------------------------------------------------
  const st = {
    t: 0, tf: 0, px: ETAPAS[0].x0 - 120, play: !reduceMov, vel: 1,
    cam: { x: 0, y: 0, z: 0.42 }, zMeta: 0.42,
    seguir: true, foco: null, dentro: false, carrilMemo: 0,
    etapa: null, hover: null,
    mira: null,            // x del mundo hacia donde va la cámara al mirar una etapa futura (sin mover el pulso)
  };
  st.cam.x = st.px;

  // --- DOM ------------------------------------------------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const cv = $('lienzo'), principal = cv.getContext('2d');
  // Capa aparte para las etapas futuras: se dibujan nítidas y se difuminan de una vez al copiarlas (barato)
  const capa = document.createElement('canvas'), ctxCapa = capa.getContext('2d');
  let ctx = principal;
  const fondo = $('fondo'), pista = $('pista'), panel = $('panel');
  const bPlay = $('bPlay'), bRama = $('bRama'), bSeguir = $('bSeguir'), rZoom = $('rZoom');
  let W = 0, H = 0, DPR = 1;

  function medir() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = capa.width = W * DPR; cv.height = capa.height = H * DPR;
  }
  addEventListener('resize', medir);
  medir();

  const aPantalla = (x, y) => [(x - st.cam.x) * st.cam.z + W / 2, (y - st.cam.y) * st.cam.z + H / 2];
  const aMundo = (sx, sy) => [(sx - W / 2) / st.cam.z + st.cam.x, (sy - H / 2) / st.cam.z + st.cam.y];

  // Chips de etapa
  const chips = $('chips');
  ETAPAS.forEach(e => {
    const b = document.createElement('button');
    b.innerHTML = `<b>${e.num}</b>${e.nombre}`;
    if (e.futura) { b.classList.add('futura'); b.title = `Futura: se desbloquea cuando ${e.depende.map(d => `${UNIDAD.toLowerCase()} ${porId[d].num} llega a ${umbralTxt(porId[d])}`).join(' y ')}`; }
    b.onclick = () => irA(e);
    e.chip = b;
    chips.appendChild(b);
  });

  // --- Foco (dentro de una rama) --------------------------------------------------------------------------------
  function enfocar(r, acercar) {
    if (r && r.atras && r !== st.foco) st.px = r.a;   // la rama que regresa se recorre desde donde sale
    st.foco = r;
    st.dentro = !!r;
    if (r) st.carrilMemo = r.carril;
    if (acercar && r && st.zMeta < 2.2) st.zMeta = 2.2;
    if (!r && acercar) st.zMeta = 0.42;
    st.seguir = true;
    pintarPanel(true);
  }

  // Rama más cercana a un punto del mundo dentro de una etapa
  function ramaCercana(e, wx, wy) {
    let mejor = null, d = Infinity;
    for (const r of e.ramas) {
      if (r.atras) continue;
      const x = Math.min(Math.max(wx, r.a + CURVA), r.b - CURVA);
      const dd = Math.abs(yRama(r, x) - wy);
      if (dd < d) { d = dd; mejor = r; }
    }
    return mejor;
  }

  // Al avanzar el flujo dentro de una rama: si la rama termina, salta a la del mismo rango en la etapa siguiente
  function seguirRama() {
    if (!st.dentro) return;
    const r = st.foco;
    // Rama que regresa: al terminar, el flujo vuelve a la etapa de destino y sigue por su rama
    if (r && r.atras && st.px > r.b) {
      st.px = r.a; st.foco = r.destino; st.carrilMemo = r.destino.carril;
      pintarPanel(true);
      return;
    }
    if (r && st.px <= r.b + 10 && st.px >= r.a - 400) return;
    // Rama que se une a otra: el flujo sigue por esa rama
    if (r && r.unida && st.px <= r.unida.b) {
      st.foco = r.unida; st.carrilMemo = r.unida.carril;
      pintarPanel(true);
      return;
    }
    const e = etapaEn(st.px);
    if (e.futura) return;   // el ciclo cruza una etapa futura: se queda en el tronco
    const cand = e.ramas.filter(q => !q.atras && st.px <= q.b);
    if (!cand.length) return;
    let elegida = cand.find(q => q.carril === st.carrilMemo);
    if (!elegida) elegida = cand.reduce((m, q) => (Math.abs(q.carril - st.carrilMemo) < Math.abs(m.carril - st.carrilMemo) ? q : m));
    st.foco = elegida;
    pintarPanel(true);
  }

  function cambiarCarril(dir) {
    const e = st.foco ? st.foco.etapa : etapaEn(st.px);
    const orden = [...e.ramas].sort((a, b) => a.carril - b.carril);
    if (!st.dentro) { enfocar(ramaCercana(e, st.px, dir * CARRIL), true); return; }
    const k = orden.indexOf(st.foco) + dir;
    if (k >= 0 && k < orden.length) enfocar(orden[k], false);
  }

  // Etapa futura: solo se mira (la cámara va hacia ella); el pulso sigue su ciclo en las etapas alcanzadas
  function mirar(e) {
    st.mira = e.x0 + LARGO / 2;
    st.seguir = false; st.dentro = false; st.foco = null;
    st.zMeta = 0.42;
    actualizarBotones();
    pintarPanel(true);
  }

  function irA(e) {
    if (e.futura) return mirar(e);
    st.mira = null;
    st.px = e.x0 - 60;
    st.seguir = true;
    if (st.dentro) { st.foco = null; seguirRama(); }
    pintarPanel(true);
  }

  // --- Panel y marquesina ---------------------------------------------------------------------------------------
  function ponerMarquesina(e) {
    const txt = `${B && B.sigla ? `${B.sigla} · ` : ''}${UNIDAD} ${e.num} · ${e.nombre}`;
    const marq = pista.parentElement;
    marq.classList.add('cambiando');
    setTimeout(() => {
      pista.innerHTML = Array(8).fill(`<span>${txt}</span>`).join('');
      marq.classList.remove('cambiando');
    }, 350);
    ETAPAS.forEach(q => q.chip.classList.toggle('activo', q === e));
  }

  const ponderada = e => e.ramas.some(R.esCritica);
  const marcaCritica = q => (R.esCritica(q) ? `<span class="critica" title="Crítica: pesa ${pct(q.peso)} del total">◆ ${pct(q.peso)}</span>` : '');
  // A dónde va la rama al terminar (las que no vuelven al tronco no pesan en la etapa)
  const destinoDe = q => (q.unida ? `se une a ${q.une}` : q.atras ? `regresa a ${UNIDAD.toLowerCase()} ${porId[q.regresa].num} · ${q.destino.nombre}` : '');
  const marcaDestino = q => (R.alTronco(q) ? '' : `<span class="critica" title="${destinoDe(q)}; no cuenta para el avance">${q.atras ? '↩' : '↪'} ${q.atras ? `${UNIDAD.toLowerCase()} ${porId[q.regresa].num}` : q.une}</span>`);
  const dependeDe = e => (e.depende.length ? ` · depende de ${e.depende.map(d => porId[d].num).join(' y ')}` : '');
  let firmaPanel = '';

  function pintarPanel(forzar) {
    const r = st.dentro ? st.foco : null;
    const e = r ? r.etapa : st.etapa;
    if (!e) return;
    // Posición del flujo dentro de la rama (0..1) para marcar la acción en la que vamos
    const u = r ? Math.min(1, Math.max(0, (st.px - r.a) / (r.b - r.a))) : 0;
    const aqui = r ? Math.min(r.acciones.length - 1, Math.floor(u * r.acciones.length)) : -1;
    const firma = `${e.id}|${r ? r.nombre : ''}|${aqui}`;
    if (!forzar && firma === firmaPanel) return;
    firmaPanel = firma;

    const vivo = e.estado === 'En curso' || e.estado === 'Adelantada';
    let html = `<div class="kicker">${B ? `${nomBloque} · ` : ''}${UNIDAD} ${e.num} de ${ETAPAS.length}${e.fechas ? ` · ${e.fechas}` : ''}</div>`;
    if (r) {
      const n = r.acciones.length;
      html += `<h2>${r.nombre}</h2><p class="sub">${e.nombre} · ${rama} ${r.i + 1} de ${e.ramas.length} · ${R.alTronco(r) ? `pesa ${pct(r.peso)} de la ${UNIDAD.toLowerCase()}` : destinoDe(r)}</p>
        <span class="estado ${r.avance > 0.3 ? 'vivo' : ''}">${pct(r.avance)} de avance</span>${marcaCritica(r)}
        <div class="barra"><i style="width:${r.avance * 100}%"></i></div>`;
      if (r.n > 1) html += `<h3>Líneas de trabajo</h3><div class="lineas">${r.lineas.slice(0, r.n).map(l => `<span>${l}</span>`).join('')}</div>`;
      html += `<h3>Acciones</h3><ul class="acciones">${r.acciones.map((a, k) => {
        const c = (k + 1) / n <= r.avance ? 'hecha' : k / n < r.avance ? 'curso' : '';
        return `<li class="${c} ${k === aqui ? 'aqui' : ''}">${a}</li>`;
      }).join('')}</ul>
      ${e.carpeta ? `<p class="carpeta">${e.carpeta}</p>` : ''}`;
    } else {
      const faltan = e.futura ? bloqueos(e) : [];
      html += `<h2>${e.nombre}</h2><p class="sub">${e.ramas.length} ${RAMAS.toLowerCase()} · avance ${ponderada(e) ? 'ponderado' : 'medio'} ${pct(e.avance)}${dependeDe(e)}</p>
        <span class="estado ${vivo && !e.futura ? 'vivo' : ''}">${e.futura ? 'Futura' : e.estado}</span>
        <div class="barra"><i style="width:${e.avance * 100}%"></i></div>
        ${e.futura ? `<p class="bloqueo">Fuera del ciclo hasta que ${faltan.map(d => `${UNIDAD.toLowerCase()} ${d.num} (${pct(d.avance)})`).join(' y ')} llegue a ${faltan.map(umbralTxt).join(' y ')}.</p>` : ''}
        <h3>${RAMAS}${e.futura ? '' : ' · clic para entrar'}</h3><ul class="ramas">${e.ramas.map((q, k) =>
          `<li data-k="${k}"><span class="n" style="opacity:${0.45 + 0.55 * opac(q.avance)}">${q.nombre}${marcaCritica(q)}${marcaDestino(q)}</span><span class="p">${pct(q.avance)}</span>
           <div class="barra"><i style="width:${q.avance * 100}%"></i></div></li>`).join('')}</ul>
        <h3>Siguientes acciones</h3><ul class="acciones">${e.ramas.slice(0, 3).map(q => {
          const n = q.acciones.length, k = Math.min(n - 1, Math.floor(q.avance * n));
          return `<li class="curso">${q.acciones[k]}</li>`;
        }).join('')}</ul>
        ${e.carpeta ? `<p class="carpeta">${e.carpeta}</p>` : ''}`;
    }
    panel.innerHTML = html;
    panel.querySelectorAll('.ramas li').forEach(li => {
      li.onclick = () => {
        const q = e.ramas[+li.dataset.k];
        if (e.futura) return;
        if (st.px > q.b || st.px < q.a - 300) st.px = q.a - 40;
        enfocar(q, true);
      };
    });
  }

  // --- Controles ------------------------------------------------------------------------------------------------
  const zDeSlider = v => Z_MIN * Math.pow(Z_MAX / Z_MIN, v / 1000);
  const sliderDeZ = z => Math.round(1000 * Math.log(z / Z_MIN) / Math.log(Z_MAX / Z_MIN));

  function zoomA(z, sx, sy) {
    z = Math.min(Z_MAX, Math.max(Z_MIN, z));
    const antes = st.dentro;
    if (!st.dentro && z >= Z_ENTRA) {
      // Entrar: la rama de la etapa actual más cercana al cursor (o al centro)
      const [wx, wy] = aMundo(sx ?? W / 2, sy ?? H / 2);
      const e = etapaEn(st.px);
      st.foco = ramaCercana(e, Math.max(st.px, e.x0), wy);
      if (st.px > st.foco.b && !etapaEn(wx).futura) st.foco = ramaCercana(etapaEn(wx), wx, wy);
      st.dentro = true; st.carrilMemo = st.foco.carril;
    } else if (st.dentro && z < Z_SALE) {
      st.dentro = false; st.foco = null;
    }
    if (antes !== st.dentro) pintarPanel(true);
    st.zMeta = z;
  }

  cv.addEventListener('wheel', ev => {
    ev.preventDefault();
    const f = Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0016));
    if (!st.seguir) {
      // Sin seguimiento: acercar hacia el punto bajo el cursor
      const [wx, wy] = aMundo(ev.clientX, ev.clientY);
      const z = Math.min(Z_MAX, Math.max(Z_MIN, st.cam.z * f));
      st.cam.x = wx - (ev.clientX - W / 2) / z;
      st.cam.y = wy - (ev.clientY - H / 2) / z;
      st.cam.z = z;
    }
    zoomA(st.zMeta * f, ev.clientX, ev.clientY);
  }, { passive: false });

  // Arrastrar para mover (deja de seguir el flujo); clic sin arrastre = entrar a la rama bajo el cursor
  let drag = null;
  cv.addEventListener('pointerdown', ev => {
    drag = { x: ev.clientX, y: ev.clientY, cx: st.cam.x, cy: st.cam.y, movio: false };
    cv.setPointerCapture(ev.pointerId);
  });
  cv.addEventListener('pointermove', ev => {
    if (!drag) { st.hover = ramaBajo(ev.clientX, ev.clientY); cv.style.cursor = st.hover ? 'pointer' : ''; return; }
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      drag.movio = true; cv.classList.add('arrastrando');
      st.seguir = false; st.mira = null; actualizarBotones();
      st.cam.x = drag.cx - dx / st.cam.z;
      st.cam.y = drag.cy - dy / st.cam.z;
    }
  });
  cv.addEventListener('pointerup', ev => {
    cv.classList.remove('arrastrando');
    if (drag && !drag.movio) {
      const r = ramaBajo(ev.clientX, ev.clientY);
      if (r && r.etapa.futura) mirar(r.etapa);
      else if (r) {
        if (st.px > r.b || st.px < r.a - 300) st.px = Math.max(r.a - 40, Math.min(aMundo(ev.clientX, 0)[0], r.b - 80));
        enfocar(r, true);
      }
    }
    drag = null;
  });

  function ramaBajo(sx, sy) {
    const [wx, wy] = aMundo(sx, sy);
    let mejor = null, d = 14 / st.cam.z;
    for (const e of ETAPAS) {
      if (wx < e.xmin || wx > e.x1) continue;
      for (const r of e.ramas) {
        if (!activa(r, wx)) continue;
        const dd = Math.abs(yRama(r, wx) - wy) - (r.n > 1 ? ABRE : 0);
        if (dd < d && Math.abs(yRama(r, wx)) > 6) { d = dd; mejor = r; }
      }
    }
    return mejor;
  }

  function actualizarBotones() {
    bPlay.textContent = st.play ? '❚❚' : '▶';
    bRama.textContent = st.dentro ? `Salir de ${rama}` : `Entrar a ${rama}`;
    bRama.classList.toggle('activo', st.dentro);
    bSeguir.classList.toggle('activo', st.seguir);
  }

  bPlay.onclick = () => { st.play = !st.play; actualizarBotones(); };
  // ← → recorren solo las etapas alcanzadas (el ciclo); las futuras se miran desde sus chips
  $('bAnt').onclick = () => irA([...VIGENTES].reverse().find(e => e.x0 < st.px - 200) || VIGENTES[VIGENTES.length - 1]);
  $('bSig').onclick = () => irA(VIGENTES.find(e => e.x0 > st.px + 10) || VIGENTES[0]);
  $('sVel').onchange = ev => { st.vel = +ev.target.value; };
  $('bMenos').onclick = () => zoomA(st.zMeta / 1.5);
  $('bMas').onclick = () => zoomA(st.zMeta * 1.5);
  rZoom.oninput = () => zoomA(zDeSlider(+rZoom.value));
  bRama.onclick = () => {
    if (st.dentro) enfocar(null, true);
    else enfocar(ramaCercana(etapaEn(st.px), st.px, -1), true);
  };
  bSeguir.onclick = () => { st.seguir = !st.seguir; st.mira = null; actualizarBotones(); };

  addEventListener('keydown', ev => {
    if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
    const k = ev.key;
    if (k === ' ') { ev.preventDefault(); bPlay.click(); }
    else if (k === 'ArrowRight') $('bSig').click();
    else if (k === 'ArrowLeft') $('bAnt').click();
    else if (k === 'ArrowUp') { ev.preventDefault(); cambiarCarril(-1); }
    else if (k === 'ArrowDown') { ev.preventDefault(); cambiarCarril(1); }
    else if (k === '+' || k === '=') zoomA(st.zMeta * 1.4);
    else if (k === '-') zoomA(st.zMeta / 1.4);
    else if (k === 'Escape') enfocar(null, true);
    else if (k === 'Enter' && !st.dentro) bRama.click();
    else if (k === 'f' || k === 'F') bSeguir.click();
  });

  // --- Dibujo ---------------------------------------------------------------------------------------------------
  function trazo(fnY, x0, x1, paso) {
    const [sx, sy] = aPantalla(x0, fnY(x0));
    ctx.moveTo(sx, sy);
    for (let x = x0 + paso; x < x1; x += paso) {
      const [px, py] = aPantalla(x, fnY(x));
      ctx.lineTo(px, py);
    }
    const [ex, ey] = aPantalla(x1, fnY(x1));
    ctx.lineTo(ex, ey);
  }

  function texto(t, sx, sy, { tam = 12, peso = 600, color = `rgba(${INK},1)`, alin = 'left', base = 'alphabetic', esp = 0 } = {}) {
    ctx.font = `${peso} ${tam}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = color; ctx.textAlign = alin; ctx.textBaseline = base;
    if (esp) ctx.letterSpacing = `${esp}px`;
    ctx.fillText(t, sx, sy);
    if (esp) ctx.letterSpacing = '0px';
  }

  function dibujarRama(r, eActual, vx0, vx1) {
    if (r.b < vx0 || r.a > vx1) return;
    const z = st.cam.z;
    const enfocada = st.dentro && st.foco === r;
    const atenuar = st.dentro && !enfocada ? 0.35 : (r.etapa === eActual ? 1 : 0.7);
    const op = opac(r.avance) * atenuar;
    const col = enfocada ? AZUL : INK;
    const ancho = Math.max(0.8, (1 + 2.6 * r.avance) * Math.min(1.6, Math.sqrt(z)));
    const paso = Math.max(3, 9 / z);
    const xa = Math.max(r.a, vx0 - 50), xb = Math.min(r.b, vx1 + 50);
    const [h0, h1] = r.atras ? [r.xp, r.b] : [r.a, r.xp];   // tramo avanzado (en el mundo)
    const [p0, p1] = r.atras ? [r.a, r.xp] : [r.xp, r.b];   // tramo por recorrer

    ctx.lineCap = 'round';
    // Tramo por recorrer: discontinuo, una sola línea
    if (p1 > p0 + 1 && p1 > xa && p0 < xb) {
      ctx.beginPath();
      trazo(x => yRama(r, x), Math.max(p0, xa), Math.min(p1, xb), paso);
      ctx.setLineDash([3 * Math.min(2, z) + 2, 5 * Math.min(2, z) + 3]);
      ctx.strokeStyle = `rgba(${col},${op * 0.55})`;
      ctx.lineWidth = Math.max(0.8, ancho * 0.6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Tramo avanzado: se divide en n líneas
    if (h1 > h0 + 1 && h1 > xa && h0 < xb) {
      for (let j = 0; j < r.n; j++) {
        ctx.beginPath();
        trazo(x => ySub(r, j, x), Math.max(h0, xa), Math.min(h1, xb), paso);
        ctx.strokeStyle = `rgba(${col},${op})`;
        ctx.lineWidth = r.n > 1 ? ancho * 0.72 : ancho;
        ctx.stroke();
      }
      // Partículas que fluyen por la parte avanzada (más rápidas y numerosas cuanto más avance)
      if (!reduceMov && r.avance > 0.02) {
        const m = Math.ceil(r.avance * 5);
        for (let j = 0; j < r.n; j++) {
          for (let k = 0; k < m; k++) {
            const u = ((st.tf * (0.04 + 0.05 * r.avance) + k / m + j * 0.17) % 1);
            const x = espejo(r, r.a + u * (r.xf - r.a));
            if (x < vx0 || x > vx1) continue;
            const [sx, sy] = aPantalla(x, ySub(r, j, x));
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1.2, ancho * 0.9), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${col},${Math.min(1, op * 1.1)})`;
            ctx.fill();
          }
        }
      }
    }
    // Punto de avance
    {
      const [sx, sy] = aPantalla(r.xp, yRama(r, r.xp));
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(2.5, 3.5 * Math.min(1.5, z)), 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = `rgba(${col},${Math.max(0.35, op)})`; ctx.lineWidth = 1.5; ctx.stroke();
      if (z > 0.75 || enfocada) texto(pct(r.avance), sx + 8, sy - 6, { tam: 10, peso: 700, color: `rgba(${col},${Math.max(0.4, op)})` });
    }
    // Rama que regresa: flechas hacia atrás sobre su carril
    if (r.atras && z > 0.3) {
      for (let x = r.a + CURVA + 160; x < r.b - CURVA - 160; x += 420) {
        if (x < vx0 - 20 || x > vx1 + 20) continue;
        const [sx, sy] = aPantalla(x, r.carril);
        texto('◀', sx, sy, { tam: 8 + 3 * Math.min(1.6, z), peso: 800, alin: 'center', base: 'middle', color: `rgba(${col},${Math.max(0.45, op)})` });
      }
    }
    // Etiqueta de la rama
    if (z > 0.32) {
      const lx = espejo(r, r.a + CURVA + 20);
      const [sx, sy] = aPantalla(lx, r.carril);
      const tam = Math.min(15, 10 + 2.5 * z);
      const off = r.n > 1 && z > 1 ? ABRE * z + 8 : 8;
      const crit = R.esCritica(r);
      texto(crit ? `◆ ${r.nombre} · crítica ${pct(r.peso)}` : r.nombre, sx, sy - off,
        { tam, alin: r.atras ? 'right' : 'left', peso: enfocada || crit ? 800 : 600, color: crit && !enfocada ? `rgba(${AZUL},${Math.max(0.55, op)})` : `rgba(${col},${Math.max(0.35, op)})` });
      // Con zoom alto, nombre de cada línea de trabajo
      if (z > 2 && r.n > 1) {
        for (let j = 0; j < r.n; j++) {
          const xf = r.a + CURVA * 0.9 + Math.min(CURVA * 0.75, (r.xf - r.a - CURVA * 0.9) / 2) + 30;
          if (xf > r.xf) break;
          const x = espejo(r, xf);
          const [qx, qy] = aPantalla(x, ySub(r, j, x));
          texto(r.lineas[j], qx + (r.atras ? -6 : 6), qy - 6, { tam: 9.5, peso: 600, alin: r.atras ? 'right' : 'left', color: `rgba(${col},${op * 0.8})` });
        }
      }
    }
  }

  function dibujar() {
    const z = st.cam.z;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const [vx0] = aMundo(0, 0), [vx1] = aMundo(W, 0);
    const eActual = st.etapa;

    // Tronco: flujo de control principal (sólido en el ciclo; discontinuo y tenue hacia las etapas futuras)
    const grosor = Math.max(1.6, 3 * Math.min(1.4, Math.sqrt(z)));
    ctx.lineCap = 'round';
    if (vx0 - 10 < LIMITE) {
      ctx.beginPath();
      trazo(() => 0, Math.max(INICIO, vx0 - 10), Math.min(LIMITE, vx1 + 10), 400);
      ctx.strokeStyle = `rgba(${INK},${st.dentro ? 0.45 : 0.9})`;
      ctx.lineWidth = grosor;
      ctx.stroke();
    }
    if (vx1 + 10 > LIMITE && LIMITE < FIN) {
      ctx.beginPath();
      trazo(() => 0, Math.max(LIMITE, vx0 - 10), Math.min(FIN, vx1 + 10), 400);
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = `rgba(${INK},0.22)`;
      ctx.lineWidth = grosor * 0.7;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Flujo recorrido del tronco (resalte detrás del pulso)
    {
      const cola = Math.max(INICIO, st.px - 900);
      const [ax, ay] = aPantalla(cola, 0), [bx] = aPantalla(st.px, 0);
      const g = ctx.createLinearGradient(ax, 0, bx, 0);
      g.addColorStop(0, `rgba(${AZUL},0)`); g.addColorStop(1, `rgba(${AZUL},${st.dentro ? 0.35 : 0.9})`);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, ay);
      ctx.strokeStyle = g; ctx.lineWidth = Math.max(2, 3.4 * Math.min(1.4, Math.sqrt(z))); ctx.stroke();
    }

    let hayFuturas = false;
    const rotulos = [];   // rótulos nítidos de las etapas futuras, encima de la capa difuminada
    for (const e of ETAPAS) {
      if (e.x1 + 200 < vx0 || e.xmin - 400 > vx1) continue;
      // Etapa futura: se dibuja en la capa aparte, que después se copia difuminada y tenue
      if (e.futura) {
        if (!hayFuturas) { ctxCapa.setTransform(DPR, 0, 0, DPR, 0, 0); ctxCapa.clearRect(0, 0, W, H); hayFuturas = true; }
        ctx = ctxCapa;
      }
      for (const r of e.ramas) dibujarRama(r, eActual, vx0, vx1);

      // Nodos de entrada y cierre de etapa
      const actual = e === eActual;
      for (const [x, cierre] of [[e.x0, false], [e.x1, true]]) {
        const [sx, sy] = aPantalla(x, 0);
        ctx.beginPath();
        ctx.arc(sx, sy, cierre ? 5 : Math.max(10, 13 * Math.min(1.3, z)), 0, Math.PI * 2);
        ctx.fillStyle = cierre ? '#fff' : (actual ? `rgb(${INK})` : '#fff');
        ctx.fill();
        ctx.strokeStyle = `rgba(${INK},${actual ? 1 : 0.55})`; ctx.lineWidth = 1.6; ctx.stroke();
        if (!cierre) texto(e.num, sx, sy + 0.5, { tam: Math.max(10, 12 * Math.min(1.3, z)), peso: 800, alin: 'center', base: 'middle', color: actual ? '#fff' : `rgba(${INK},0.8)` });
      }
      // Rótulo de etapa bajo el nodo
      const [sx, sy] = aPantalla(e.x0, 0);
      const alto = Math.max(10, 13 * Math.min(1.3, z));
      texto(`${UNIDAD.toUpperCase()} ${e.num}`, sx, sy + alto + 16, { tam: 10, peso: 700, alin: 'center', esp: 2, color: `rgba(${INK},${actual ? 0.7 : 0.4})` });
      texto(e.nombre, sx, sy + alto + 31, { tam: 12, peso: 700, alin: 'center', color: `rgba(${INK},${actual ? 0.95 : 0.5})` });
      if (e.estado !== 'Pendiente' && !e.futura) texto(e.estado.toUpperCase(), sx, sy - alto - 10, { tam: 9, peso: 800, alin: 'center', esp: 1.5, color: `rgba(${AZUL},0.9)` });
      ctx = principal;
      if (e.futura) rotulos.push([`FUTURA · ${pct(e.avance)}`, sx, sy - alto - 10]);
    }

    if (hayFuturas) {
      principal.save();
      principal.setTransform(1, 0, 0, 1, 0, 0);
      principal.filter = `blur(${(Math.min(6, 2.2 + 1.6 * z) * DPR).toFixed(1)}px)`;
      principal.globalAlpha = 0.45;
      principal.drawImage(capa, 0, 0);
      principal.restore();
    }
    for (const [t, x, y] of rotulos) texto(t, x, y, { tam: 9, peso: 800, alin: 'center', esp: 1.5, color: `rgba(${INK},0.5)` });

    // Bloque: rótulo de apertura antes del primer nodo y compuerta de cierre hacia el siguiente bloque
    if (B) {
      const [ax, ay] = aPantalla(INICIO, 0);
      if (ax > -40 && ax < W + 600) {
        texto(`${nomBloque.toUpperCase()}${B.sigla ? ` · ${B.sigla}` : ''}`, ax - 18, ay - 16, { tam: 10, peso: 800, alin: 'right', esp: 2, color: `rgba(${AZUL},0.9)` });
        texto(B.nombre, ax - 18, ay + 2, { tam: 14, peso: 800, alin: 'right', base: 'middle', color: `rgba(${INK},0.9)` });
        if (B.lema) texto(B.lema, ax - 18, ay + 22, { tam: 10.5, peso: 600, alin: 'right', color: `rgba(${INK},0.5)` });
        if (B.formato) texto(`${ETAPAS.length} ${UNIDAD.toLowerCase()}s · ${B.formato.toLowerCase()}`, ax - 18, ay + 37, { tam: 9.5, peso: 600, alin: 'right', color: `rgba(${INK},0.4)` });
      }
      const [fx, fy] = aPantalla(FIN, 0);
      if (fx > -600 && fx < W + 40) {
        ctx.strokeStyle = `rgba(${INK},0.45)`; ctx.lineWidth = 1.5;
        for (const d of [0, 5]) { ctx.beginPath(); ctx.moveTo(fx + d, fy - 26); ctx.lineTo(fx + d, fy + 26); ctx.stroke(); }
        texto(`FIN DEL ${nomBloque.toUpperCase()}`, fx + 18, fy - 6, { tam: 10, peso: 800, esp: 2, color: `rgba(${INK},0.55)` });
        if (B.siguiente) texto(`→ ${B.siguiente}`, fx + 18, fy + 12, { tam: 13, peso: 800, color: `rgba(${AZUL},0.85)` });
      }
    }

    // Fin del ciclo: el pulso vuelve al inicio aquí
    if (LIMITE < FIN && LIMITE > vx0 - 50 && LIMITE < vx1 + 50) {
      const [sx, sy] = aPantalla(LIMITE, 0);
      ctx.beginPath(); ctx.moveTo(sx, sy - 22); ctx.lineTo(sx, sy + 22);
      ctx.strokeStyle = `rgba(${AZUL},0.55)`; ctx.lineWidth = 1.5; ctx.stroke();
      texto('↺ CICLO', sx - 6, sy - 30, { tam: 9, peso: 800, alin: 'right', esp: 1.5, color: `rgba(${AZUL},0.8)` });
      texto(`siguiente al ${VIGENTES.length ? umbralTxt(VIGENTES[VIGENTES.length - 1]) : pct(UMBRAL)}`, sx, sy + 36, { tam: 9, peso: 600, alin: 'center', color: `rgba(${INK},0.45)` });
    }

    // Pulso: posición del flujo (sobre la rama enfocada o sobre el tronco)
    const [sx, sy] = aPantalla(...pulso());
    const lat = 0.5 + 0.5 * Math.sin(st.t * 4);
    ctx.beginPath(); ctx.arc(sx, sy, 10 + 8 * lat, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${AZUL},${0.12 * (1 - lat) + 0.05})`; ctx.fill();
    ctx.beginPath(); ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${AZUL})`; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    // Dentro de una rama: acción actual junto al pulso
    if (st.dentro && st.foco && activa(st.foco, st.px)) {
      const r = st.foco, u = (st.px - r.a) / (r.b - r.a);
      const k = Math.min(r.acciones.length - 1, Math.floor(u * r.acciones.length));
      const t = r.acciones[k];
      ctx.font = `600 12px 'Plus Jakarta Sans', system-ui, sans-serif`;
      const w = ctx.measureText(t).width + 20;
      const bx = sx + 14, by = sy - 40;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.strokeStyle = `rgba(${AZUL},0.35)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx, by, w, 26, 13); ctx.fill(); ctx.stroke();
      texto(t, bx + 10, by + 13, { tam: 12, peso: 600, base: 'middle', color: u <= r.avance ? `rgb(${INK})` : `rgba(${INK},0.55)` });
    }

    // Cursor sobre una rama
    if (st.hover && !drag) {
      cv.title = `${st.hover.nombre} · ${pct(st.hover.avance)} — ${st.hover.etapa.futura ? `${UNIDAD.toLowerCase()} futura` : 'clic para entrar'}`;
    } else cv.title = '';

    // Rejilla de fondo acompaña la cámara (mismo tamaño visual, desplazada con el mundo)
    let g = 80 * z; while (g < 56) g *= 2; while (g >= 112) g /= 2;
    const ox = ((W / 2 - st.cam.x * z) % g + g) % g, oy = ((H / 2 - st.cam.y * z) % g + g) % g;
    fondo.style.setProperty('--g', `${g}px`);
    fondo.style.setProperty('--gm', `${g / 4}px`);
    fondo.style.setProperty('--grid-x', `${ox}px`);
    fondo.style.setProperty('--grid-y', `${oy}px`);
  }

  // --- Bucle ----------------------------------------------------------------------------------------------------
  let previo = performance.now();
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - previo) / 1000);
    previo = ahora;
    st.t += dt;
    if (st.play) st.tf += dt * st.vel;   // reloj del flujo: sigue la velocidad elegida
    if (st.play) {
      // Dentro de una rama el flujo va más despacio para leer las acciones
      st.px += VEL * st.vel * dt * (st.dentro ? 0.55 : 1);
      if (st.px > LIMITE) { st.px = INICIO; if (st.dentro) st.foco = null; }   // repite el ciclo sin pasar a etapas futuras
    }
    seguirRama();

    // Cámara
    const k = 1 - Math.pow(0.002, dt);
    st.cam.z += (st.zMeta - st.cam.z) * k;
    if (st.seguir) {
      const [px, py] = pulso();
      const ty = st.dentro && st.foco ? (activa(st.foco, st.px) ? py : st.foco.carril * 0.5) : 0;
      const adelanto = (W * 0.08) / st.cam.z * (st.dentro && st.foco && st.foco.atras ? -1 : 1);
      st.cam.x += (px + adelanto - st.cam.x) * k;
      st.cam.y += (ty - st.cam.y) * k;
    } else if (st.mira != null) {
      st.cam.x += (st.mira - st.cam.x) * k;
      st.cam.y += (0 - st.cam.y) * k;
    }
    rZoom.value = sliderDeZ(st.zMeta);

    const e = st.seguir ? etapaEn(pulso()[0]) : etapaEn(st.cam.x);
    if (e !== st.etapa) { st.etapa = e; ponerMarquesina(e); pintarPanel(true); }
    else pintarPanel(false);
    actualizarBotones();

    dibujar();
    requestAnimationFrame(cuadro);
  }

  requestAnimationFrame(cuadro);
})();
