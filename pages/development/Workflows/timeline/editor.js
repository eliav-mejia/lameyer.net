// Editor de conjuntos de datos de timeline/: formulario → datos/<nombre>.js con la sintaxis y los nombres de _plantilla.js.
// Guarda con el servidor local (../servir.py, POST /api/guardar); sin servidor, descarga el archivo.
// Valida y mide con reglas.js, igual que la animación. El borrador se recuerda en este navegador (localStorage).
(() => {
  'use strict';

  const R = window.TimelineReglas;
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = v => `${Math.round(v * 100)} %`;
  const r2 = v => Math.round((+v || 0) * 100) / 100;
  const BORRADOR = 'timeline-editor-borrador';
  const ID_OK = /^[a-z0-9][a-z0-9-]{0,62}$/;

  // --- Estado del formulario -------------------------------------------------------------------------------------
  const ramaNueva = () => ({ nombre: '', avance: 0, critica: null, une: null, desde: null, regresa: null, lineas: [], acciones: [] });
  // Campos de recorrido (une · desde + regresa): el formulario no los edita, pero los conserva al cargar y guardar
  const RECORRIDO = ['une', 'desde', 'regresa'];
  const etapaNueva = (id, num) => ({ id, num, nombre: '', depende: [], fechas: '', estado: 'Pendiente', carpeta: '', ramas: [ramaNueva()] });
  const bloqueNuevo = () => ({ num: '', sigla: '', nombre: '', lema: '', alcance: '', formato: '', siguiente: '' });
  const CAMPOS_BLOQUE = Object.keys(bloqueNuevo());
  const conjuntoNuevo = () => ({
    id: '', idManual: false, titulo: '', unidad: 'Etapa', subunidad: 'Rama', umbral: R.UMBRAL, origen: '', descripcion: '',
    bloque: bloqueNuevo(),
    etapas: [etapaNueva('e1', '1')],
  });

  function desdeDatos(T, meta = {}) {
    return {
      id: T.id || meta.id || '', idManual: !!(T.id || meta.id), titulo: T.titulo || meta.titulo || '',
      unidad: T.unidad || 'Etapa', subunidad: T.subunidad || 'Rama', umbral: typeof T.umbral === 'number' ? T.umbral : R.UMBRAL,
      bloque: Object.fromEntries(CAMPOS_BLOQUE.map(c => [c, String((T.bloque || {})[c] || '')])),
      origen: meta.origen || '', descripcion: meta.descripcion || '',
      etapas: (T.etapas || []).map(e => ({
        id: e.id || '', num: e.num || '', nombre: e.nombre || '', depende: [...(e.depende || [])],
        fechas: e.fechas || '', estado: e.estado || 'Pendiente', carpeta: e.carpeta || '',
        umbral: typeof e.umbral === 'number' ? e.umbral : null,   // umbral propio: cada rama debe llegar a él
        ramas: (e.ramas || []).map(r => ({
          nombre: r.nombre || '', avance: +r.avance || 0, critica: typeof r.critica === 'number' ? r.critica : null,
          ...Object.fromEntries(RECORRIDO.map(c => [c, r[c] || null])),
          lineas: [...(r.lineas || [])], acciones: [...(r.acciones || [])],
        })),
      })),
    };
  }

  let S = conjuntoNuevo();

  // --- Estado → datos limpios (lo que se valida y se escribe) ----------------------------------------------------
  function aObjeto() {
    const ids = new Set(S.etapas.map(e => e.id.trim()));
    return {
      id: S.id.trim(), titulo: S.titulo.trim(), unidad: S.unidad.trim() || 'Etapa', umbral: r2(S.umbral),
      ...((S.subunidad || '').trim() && S.subunidad.trim() !== 'Rama' ? { subunidad: S.subunidad.trim() } : {}),
      ...(() => {
        const b = Object.fromEntries(CAMPOS_BLOQUE.map(c => [c, String((S.bloque || {})[c] || '').trim()]).filter(([, v]) => v));
        return b.nombre ? { bloque: b } : {};
      })(),
      etapas: S.etapas.map(e => {
        const o = {
          id: e.id.trim(), num: e.num.trim(), nombre: e.nombre.trim(),
          depende: e.depende.filter(d => ids.has(d) && d !== e.id.trim()),
          fechas: e.fechas.trim(), estado: e.estado.trim(),
        };
        if (e.carpeta.trim()) o.carpeta = e.carpeta.trim();
        if (e.umbral != null) o.umbral = r2(e.umbral);
        o.ramas = e.ramas.map(r => {
          const q = { nombre: r.nombre.trim(), avance: r2(r.avance) };
          if (r.critica != null) q.critica = r2(r.critica);
          for (const c of RECORRIDO) if (r[c]) q[c] = r[c];
          // Se conservan todos los nombres de línea (también los que el avance aún no muestra)
          const lineas = r.lineas.slice(0, 3).map(s => String(s || '').trim()).filter(Boolean);
          if (lineas.length) q.lineas = lineas;
          q.acciones = r.acciones.map(s => String(s).trim()).filter(Boolean);
          return q;
        });
        return o;
      }),
    };
  }

  // --- Datos → texto JS con el formato de _plantilla.js -------------------------------------------------------------
  const s = v => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')}'`;
  const lista = a => `[${a.map(s).join(', ')}]`;

  function generar(o) {
    const hoy = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    const L = [
      `// Conjunto de datos «${o.id}» para timeline/ (creado con editor.html, ${hoy}). Formato: datos/_plantilla.js.`,
      '// avance: 0..1 por rama → < 0.35 = 1 línea · 0.35–0.7 = 2 líneas · ≥ 0.7 = 3 líneas.',
      '// critica: parte (0..1) del total de la etapa que pesa la rama; las demás ramas se reparten el resto.',
      '// Orden del arreglo = orden del flujo. Cada etapa va después de todas las que lista en `depende`;',
      `//   entra en el ciclo cuando sus dependencias llegan al umbral (${pct(o.umbral)}).`,
      'window.TIMELINE = {',
      `  id: ${s(o.id)},`,
      `  titulo: ${s(o.titulo)},`,
      `  unidad: ${s(o.unidad)},`,
      ...(o.subunidad ? [`  subunidad: ${s(o.subunidad)},`] : []),
      ...(o.bloque ? [`  bloque: { ${Object.entries(o.bloque).map(([k, v]) => `${k}: ${s(v)}`).join(', ')} },`] : []),
      `  umbral: ${o.umbral},`,
      '  etapas: [',
    ];
    for (const e of o.etapas) {
      L.push('    {');
      L.push(`      id: ${s(e.id)}, num: ${s(e.num)}, nombre: ${s(e.nombre)}, depende: ${lista(e.depende)},`);
      L.push(`      fechas: ${s(e.fechas)}, estado: ${s(e.estado)},`);
      if (e.carpeta) L.push(`      carpeta: ${s(e.carpeta)},`);
      if (e.umbral != null) L.push(`      umbral: ${e.umbral},`);
      L.push('      ramas: [');
      for (const r of e.ramas) {
        L.push(`        { nombre: ${s(r.nombre)}, avance: ${r.avance}${r.critica != null ? `, critica: ${r.critica}` : ''}${RECORRIDO.filter(c => r[c]).map(c => `, ${c}: ${s(r[c])}`).join('')},`);
        if (r.lineas) L.push(`          lineas: ${lista(r.lineas)},`);
        L.push(`          acciones: ${lista(r.acciones)} },`);
      }
      L.push('      ],');
      L.push('    },');
    }
    L.push('  ],', '};', '');
    return L.join('\n');
  }

  const renglonIndice = () =>
    `{ id: ${s(S.id)}, titulo: ${s(S.titulo || S.id)}, origen: ${s(S.origen)}, descripcion: ${s(S.descripcion)} },`;

  const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 63);

  // --- Formulario --------------------------------------------------------------------------------------------------
  const campo = (etq, k, v, { tipo = 'text', pista = '', clase = '', extra = '' } = {}) =>
    `<label class="${clase}">${etq}<input type="${tipo}" data-k="${k}" value="${esc(v)}" ${extra}>${pista ? `<small>${pista}</small>` : ''}</label>`;

  function cajaConjunto() {
    const u = S.unidad || 'Etapa';
    return `<section class="caja glass">
      <h2><span class="n">00</span>Conjunto</h2>
      <div class="rejilla">
        ${campo('Título', 'titulo', S.titulo, { pista: 'Título de la pestaña y de la tarjeta en la galería', extra: 'placeholder="Etapas de la plataforma"' })}
        ${campo('Nombre del archivo', 'id', S.id, { pista: `datos/<b>${esc(S.id || '…')}</b>.js · minúsculas, números y guiones`, extra: 'placeholder="mi-proceso" spellcheck="false" id="inId"' })}
        ${campo('Unidad', 'unidad', S.unidad, { pista: 'Etapa, Fase, Paso, Sprint…' })}
        ${campo('Subunidad', 'subunidad', S.subunidad, { pista: 'Cómo se llama cada rama: Rama, Módulo, Taller…' })}
        <label>Umbral para avanzar<div class="pct"><input type="number" min="1" max="100" step="1" data-k="umbral" data-t="pct" value="${Math.round(S.umbral * 100)}"> %</div>
          <small>Una ${esc(u.toLowerCase())} entra en el ciclo cuando sus dependencias llegan a este avance</small></label>
        ${campo('Origen', 'origen', S.origen, { pista: 'Rótulo de la tarjeta (indice.js), p. ej. sites/_plataforma' })}
        ${campo('Descripción', 'descripcion', S.descripcion, { clase: 'ancho', pista: 'Texto de la tarjeta en la galería (indice.js)' })}
        ${campo('Bloque · nombre', 'bloque.nombre', S.bloque.nombre, { pista: 'Opcional: agrupa todas las etapas (vacío = sin bloque)', extra: 'placeholder="Núcleo Modular + Edge Serverless"' })}
        ${campo('Bloque · número', 'bloque.num', S.bloque.num, { pista: 'Bloque 1, 2…' })}
        ${campo('Bloque · sigla', 'bloque.sigla', S.bloque.sigla, { pista: 'Insignia de la cabecera, p. ej. MC-SE' })}
        ${campo('Bloque · siguiente', 'bloque.siguiente', S.bloque.siguiente, { pista: 'Rótulo al cerrar el bloque, p. ej. Bloque 2' })}
        ${campo('Bloque · lema', 'bloque.lema', S.bloque.lema, { clase: 'ancho' })}
        ${campo('Bloque · alcance', 'bloque.alcance', S.bloque.alcance, { clase: 'ancho' })}
        ${campo('Bloque · formato', 'bloque.formato', S.bloque.formato, { pista: 'Talleres y sprints…' })}
      </div>
    </section>`;
  }

  function cajaEtapa(e, i) {
    const u = S.unidad || 'Etapa';
    const otras = S.etapas.map((q, j) => ({ q, j })).filter(({ j }) => j !== i);
    const deps = otras.length ? otras.map(({ q, j }) =>
      `<label title="${j > i ? 'Va después en el orden: muévela arriba o mueve esta abajo' : ''}">
         <input type="checkbox" data-accion="dep" data-e="${i}" value="${esc(q.id)}" ${e.depende.includes(q.id) ? 'checked' : ''}>
         ${esc(q.num || '?')} · ${esc(q.nombre || q.id)}${j > i ? ' ↓' : ''}</label>`).join('')
      : '<span class="vacio">Es la única: no depende de nada.</span>';
    return `<section class="caja glass etapa" id="etapa-${i}">
      <h2><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(u)} ${esc(e.num || '')} ${esc(e.nombre || '')}
        <span class="chip" id="est-${i}"></span>
        <span class="der">
          <button class="mini" data-accion="etapa-arriba" data-e="${i}" title="Antes en el flujo" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="mini" data-accion="etapa-abajo" data-e="${i}" title="Después en el flujo" ${i === S.etapas.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="mini quitar" data-accion="etapa-quitar" data-e="${i}" title="Quitar">✕</button>
        </span></h2>
      <div class="rejilla">
        ${campo('id', `etapas.${i}.id`, e.id, { pista: 'Clave única: la usan los «depende»', extra: `data-prev="${esc(e.id)}" data-render spellcheck="false"` })}
        ${campo('num', `etapas.${i}.num`, e.num, { pista: 'Número visible en el nodo', extra: 'data-render' })}
        ${campo('nombre', `etapas.${i}.nombre`, e.nombre, { extra: 'data-render' })}
        ${campo('fechas', `etapas.${i}.fechas`, e.fechas, { extra: 'placeholder="1 ene – 31 ene 2027"' })}
        ${campo('estado', `etapas.${i}.estado`, e.estado, { pista: 'En curso y Adelantada se resaltan', extra: 'list="estados"' })}
        ${campo('carpeta', `etapas.${i}.carpeta`, e.carpeta, { pista: 'Opcional: de dónde salen los datos', extra: 'spellcheck="false"' })}
        <label class="ancho">depende<div class="deps">${deps}</div>
          <small>Solo las directas: lo que debe estar listo antes de empezar (guía, sección 03)</small></label>
      </div>
      ${e.ramas.map((r, k) => cajaRama(e, i, r, k)).join('')}
      <p><button data-accion="rama-mas" data-e="${i}">+ Añadir rama</button></p>
    </section>`;
  }

  function cajaRama(e, i, r, k) {
    const base = `etapas.${i}.ramas.${k}`;
    const n = R.nLineas(r2(r.avance));
    const llenas = r.lineas.filter(s => String(s || '').trim()).length;
    const cajas = Math.min(3, Math.max(n > 1 ? n : 0, llenas));
    const lineas = cajas ? `<label class="ancho">lineas · con este avance se ven ${n}<div class="lineas-in">${
      Array.from({ length: cajas }, (_, j) => `<input data-k="${base}.lineas.${j}" value="${esc(r.lineas[j] || '')}" placeholder="línea ${j + 1}">`).join('')
    }</div></label>` : '';
    const crit = r.critica != null;
    return `<div class="rama ${crit ? 'critica' : ''}">
      <div class="cab">Rama ${k + 1} <span id="peso-${i}-${k}"></span>
        <span class="der">
          <button class="mini" data-accion="rama-arriba" data-e="${i}" data-r="${k}" ${k === 0 ? 'disabled' : ''}>↑</button>
          <button class="mini" data-accion="rama-abajo" data-e="${i}" data-r="${k}" ${k === e.ramas.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="mini quitar" data-accion="rama-quitar" data-e="${i}" data-r="${k}" title="Quitar">✕</button>
        </span></div>
      <div class="fila2">
        ${campo('nombre', `${base}.nombre`, r.nombre)}
        <label>avance<div class="pct">
          <input type="range" min="0" max="100" step="1" data-k="${base}.avance" data-t="pct" data-render value="${Math.round(r.avance * 100)}">
          <input type="number" min="0" max="100" step="1" data-k="${base}.avance" data-t="pct" data-render value="${Math.round(r.avance * 100)}"></div>
          <small>≥ 35 % se divide en 2 líneas · ≥ 70 % en 3</small></label>
        <label>critica<div class="crit">
          <input type="checkbox" data-accion="critica" data-e="${i}" data-r="${k}" ${crit ? 'checked' : ''}> crítica
          ${crit ? `<input type="number" min="1" max="100" step="1" data-k="${base}.critica" data-t="pct" value="${Math.round(r.critica * 100)}"> % de la ${esc((S.unidad || 'etapa').toLowerCase())}` : ''}</div>
          <small>Pesa ese % del total; las demás ramas se reparten el resto</small></label>
        ${lineas}
        <label class="ancho">acciones<textarea data-k="${base}.acciones" data-t="lista" placeholder="Una acción por renglón, en orden">${esc(r.acciones.join('\n'))}</textarea>
          <small>Una por renglón. El avance marca como hechas las primeras (avance × número de acciones)</small></label>
      </div>
    </div>`;
  }

  function render() {
    const y = scrollY, foco = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    $('form').innerHTML = cajaConjunto() + S.etapas.map(cajaEtapa).join('') +
      `<p><button class="primario" data-accion="etapa-mas">+ Añadir ${esc((S.unidad || 'Etapa').toLowerCase())}</button></p>
       <datalist id="estados"><option>En curso</option><option>Adelantada</option><option>Pendiente</option><option>Terminada</option></datalist>`;
    scrollTo(0, y);
    if (foco) { const el = document.querySelector(`[data-k="${CSS.escape(foco)}"]:not([type=range])`); if (el) el.focus(); }
    actualizar();
  }

  // Asignar un valor por ruta («etapas.0.ramas.1.avance»)
  function poner(ruta, valor) {
    const p = ruta.split('.');
    let o = S;
    for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
    o[p[p.length - 1]] = valor;
  }

  function leer(el) {
    const t = el.dataset.t;
    if (t === 'pct') return Math.min(100, Math.max(0, +el.value || 0)) / 100;
    if (t === 'lista') return el.value.split('\n');
    return el.value;
  }

  // --- Revisión, vista previa y borrador ---------------------------------------------------------------------------
  let ultimo = { o: null, texto: '', err: [] };

  function actualizar() {
    const o = aObjeto();
    const { err, av } = R.validar(o);
    if (!ID_OK.test(o.id)) err.unshift('<b>Nombre del archivo</b>: minúsculas, números y guiones (sin «_» al inicio).');
    const texto = generar(o);
    ultimo = { o, texto, err };

    $('mensajes').innerHTML = err.map(t => `<p class="e">✕ ${t}</p>`).join('') + av.map(t => `<p class="a">! ${t}</p>`).join('') ||
      '<p class="ok">✓ Listo para guardar.</p>';
    $('codigo').textContent = texto;
    $('nombreArchivo').textContent = `datos/${o.id || '…'}.js`;
    $('bGuardar').disabled = err.length > 0;
    $('aVer').href = `index.html?datos=${encodeURIComponent(o.id)}`;
    const inId = $('inId');
    if (inId) inId.classList.toggle('mal', !ID_OK.test(o.id));

    // Avance ponderado, peso de cada rama y si la etapa entra en el ciclo
    const alc = R.alcanzadas(o), u = o.umbral;
    const filas = o.etapas.map((e, i) => {
      const a = R.avanceEtapa(e), si = alc.has(e.id);
      const chip = $(`est-${i}`);
      if (chip) { chip.className = `chip ${si ? 'si' : 'no'}`; chip.textContent = `${pct(a)} · ${si ? 'en el ciclo' : 'futura'}`; }
      const caja = $(`etapa-${i}`);
      if (caja) caja.classList.toggle('futura', !si);
      R.pesos(e).forEach((w, k) => {
        const el = $(`peso-${i}-${k}`);
        if (el) el.textContent = `· pesa ${pct(w)}${e.ramas[k].critica != null ? ' (crítica)' : ''}`;
      });
      return `<tr><td>${esc(e.num)} · ${esc(e.nombre || e.id)}</td><td class="num">${pct(a)}</td>
        <td class="num"><span class="chip ${si ? 'si' : 'no'}">${si ? 'ciclo' : 'futura'}</span></td></tr>`;
    });
    $('resumen').innerHTML = `<table>${filas.join('')}</table>
      <p class="pista">Avance ponderado por etapa. Una etapa entra en el ciclo cuando sus dependencias llegan a ${pct(u)}.</p>`;

    try { localStorage.setItem(BORRADOR, JSON.stringify(S)); } catch { /* sin almacenamiento: no pasa nada */ }
  }

  // --- Eventos ------------------------------------------------------------------------------------------------------
  const form = $('form');
  form.addEventListener('input', ev => {
    const el = ev.target, k = el.dataset.k;
    if (!k) return;
    poner(k, leer(el));
    if (k === 'titulo' && !S.idManual) { S.id = slug(S.titulo); const inId = $('inId'); if (inId) inId.value = S.id; }
    if (k === 'id') S.idManual = true;
    // Mantener sincronizados el deslizador y la casilla del mismo avance
    if (el.dataset.t === 'pct') form.querySelectorAll(`[data-k="${CSS.escape(k)}"]`).forEach(o => { if (o !== el) o.value = el.value; });
    actualizar();
  });

  form.addEventListener('change', ev => {
    const el = ev.target;
    if (el.dataset.accion === 'dep') {
      const e = S.etapas[+el.dataset.e];
      e.depende = el.checked ? [...new Set([...e.depende, el.value])] : e.depende.filter(d => d !== el.value);
      return actualizar();
    }
    if (el.dataset.accion === 'critica') {
      const r = S.etapas[+el.dataset.e].ramas[+el.dataset.r];
      r.critica = el.checked ? 0.25 : null;
      return render();
    }
    if (el.dataset.k && /^etapas\.\d+\.id$/.test(el.dataset.k)) {
      // Renombrar el id también en los «depende» que lo usaban
      const antes = el.dataset.prev, ahora = el.value.trim();
      if (antes && antes !== ahora) S.etapas.forEach(q => { q.depende = q.depende.map(d => (d === antes ? ahora : d)); });
    }
    if ('render' in el.dataset || el.dataset.k === 'unidad') render();
  });

  form.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-accion]');
    if (!b) return;
    const i = +b.dataset.e, k = +b.dataset.r, A = b.dataset.accion;
    const mover = (arr, de, a) => { if (a < 0 || a >= arr.length) return; const [x] = arr.splice(de, 1); arr.splice(a, 0, x); };
    if (A === 'etapa-mas') {
      let n = S.etapas.length + 1;
      while (S.etapas.some(e => e.id === `e${n}`)) n++;
      const nueva = etapaNueva(`e${n}`, String(S.etapas.length + 1));
      const prev = S.etapas[S.etapas.length - 1];
      if (prev) nueva.depende = [prev.id];      // por defecto, después de la anterior
      S.etapas.push(nueva);
    } else if (A === 'etapa-quitar') {
      const e = S.etapas[i];
      if (S.etapas.length === 1) return alert('Debe quedar al menos una etapa.');
      if ((e.nombre || e.ramas.some(r => r.nombre)) && !confirm(`¿Quitar «${e.nombre || e.id}» y sus ramas?`)) return;
      S.etapas.splice(i, 1);
      S.etapas.forEach(q => { q.depende = q.depende.filter(d => d !== e.id); });
    } else if (A === 'etapa-arriba') mover(S.etapas, i, i - 1);
    else if (A === 'etapa-abajo') mover(S.etapas, i, i + 1);
    else if (A === 'rama-mas') S.etapas[i].ramas.push(ramaNueva());
    else if (A === 'rama-quitar') {
      const e = S.etapas[i];
      if (e.ramas.length === 1) return alert('Cada etapa necesita al menos una rama.');
      if (e.ramas[k].nombre && !confirm(`¿Quitar la rama «${e.ramas[k].nombre}»?`)) return;
      e.ramas.splice(k, 1);
    } else if (A === 'rama-arriba') mover(S.etapas[i].ramas, k, k - 1);
    else if (A === 'rama-abajo') mover(S.etapas[i].ramas, k, k + 1);
    else return;
    render();
  });

  // --- Cargar, nuevo ------------------------------------------------------------------------------------------------
  const sCargar = $('sCargar');
  function opcionesCargar() {
    sCargar.innerHTML = '<option value="">Cargar conjunto…</option><option value="_plantilla">Plantilla (_plantilla.js)</option>' +
      (window.TIMELINES || []).map(d => `<option value="${esc(d.id)}">${esc(d.titulo)} (${esc(d.id)})</option>`).join('');
  }

  function cargar(id) {
    return new Promise((ok, mal) => {
      delete window.TIMELINE;
      const sc = document.createElement('script');
      sc.src = `datos/${encodeURIComponent(id)}.js?v=${Date.now()}`;
      sc.onload = () => {
        sc.remove();
        if (!window.TIMELINE) return mal(new Error(`datos/${id}.js no define window.TIMELINE.`));
        const meta = (window.TIMELINES || []).find(d => d.id === id) || {};
        S = desdeDatos(window.TIMELINE, meta);
        if (id === '_plantilla') { S.id = ''; S.idManual = false; S.titulo = ''; }
        render();
        ok();
      };
      sc.onerror = () => { sc.remove(); mal(new Error(`No se pudo cargar datos/${id}.js.`)); };
      document.body.appendChild(sc);
    });
  }

  const conContenido = () => S.titulo || S.etapas.some(e => e.nombre || e.ramas.some(r => r.nombre));
  sCargar.onchange = () => {
    const id = sCargar.value;
    sCargar.value = '';
    if (!id || (conContenido() && !confirm('Se reemplaza lo que hay en el formulario. ¿Continuar?'))) return;
    cargar(id).then(() => history.replaceState(null, '', `?datos=${encodeURIComponent(id)}`))
      .catch(e => mostrar(e.message, true));
  };
  $('bNuevo').onclick = () => {
    if (conContenido() && !confirm('¿Empezar uno nuevo? Se borra lo que hay en el formulario.')) return;
    S = conjuntoNuevo();
    history.replaceState(null, '', location.pathname);
    render();
  };

  // --- Guardar --------------------------------------------------------------------------------------------------
  function mostrar(html, error = false) {
    const el = $('estadoGuardar');
    el.className = `estado-guardar ${error ? 'e' : ''}`;
    el.innerHTML = html;
  }

  function descargar() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ultimo.texto], { type: 'text/javascript' }));
    a.download = `${ultimo.o.id}.js`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function hayServidor() {
    if (!location.protocol.startsWith('http')) return false;
    try { return (await fetch('/api/estado', { cache: 'no-store' })).ok; } catch { return false; }
  }

  async function guardar(sobrescribir = false) {
    actualizar();
    if (ultimo.err.length) return mostrar('Corrige los errores marcados con ✕ antes de guardar.', true);
    const { o, texto } = ultimo;
    if (!(await hayServidor())) {
      descargar();
      return mostrar(`Sin servidor local: se descargó <code>${esc(o.id)}.js</code>. Muévelo a <code>timeline/datos/</code> y añade a
        <code>datos/indice.js</code>:<br><code>${esc(renglonIndice())}</code><br>Para guardar directo, abre el editor con <code>./servir.sh</code>.`);
    }
    try {
      const res = await fetch('/api/guardar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: o.id, contenido: texto, sobrescribir,
          indice: { titulo: S.titulo || o.id, origen: S.origen, descripcion: S.descripcion } }),
      });
      const j = await res.json();
      if (res.status === 409) {
        if (confirm(`datos/${o.id}.js ya existe. ¿Reemplazarlo?`)) return guardar(true);
        return mostrar('No se guardó: el archivo ya existe.', true);
      }
      if (!res.ok) return mostrar(esc(j.error || 'No se pudo guardar.'), true);
      if (j.registrado) (window.TIMELINES = window.TIMELINES || []).push({ id: o.id, titulo: S.titulo || o.id, origen: S.origen, descripcion: S.descripcion });
      opcionesCargar();
      history.replaceState(null, '', `?datos=${encodeURIComponent(o.id)}`);
      mostrar(`✓ Guardado en <code>${esc(j.archivo)}</code>${j.registrado ? ' y registrado en <code>indice.js</code>' : ' (ya estaba en <code>indice.js</code>)'}.
        <a href="index.html?datos=${encodeURIComponent(o.id)}">Ver animación →</a>`);
    } catch (e) {
      mostrar(`Error al guardar: ${esc(e.message)}`, true);
    }
  }

  $('bGuardar').onclick = () => guardar();
  $('bDescargar').onclick = () => { actualizar(); descargar(); };
  $('bCopiar').onclick = async () => {
    actualizar();
    try { await navigator.clipboard.writeText(ultimo.texto); mostrar('Copiado al portapapeles.'); }
    catch { mostrar('No se pudo copiar: selecciona el código de abajo.', true); }
  };

  // --- Inicio: ?datos=<id>, o el borrador de este navegador, o uno nuevo ------------------------------------------
  opcionesCargar();
  const pedido = new URLSearchParams(location.search).get('datos');
  if (pedido) {
    cargar(pedido).catch(e => { render(); mostrar(e.message, true); });
  } else {
    try { const b = JSON.parse(localStorage.getItem(BORRADOR)); if (b && Array.isArray(b.etapas)) S = { ...conjuntoNuevo(), ...b, bloque: { ...bloqueNuevo(), ...(b.bloque || {}) } }; } catch { /* sin borrador */ }
    render();
  }
})();
