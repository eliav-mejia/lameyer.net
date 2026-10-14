// Reglas comunes de timeline/: las usan linea.js (animación) y editor.js (formulario), para que validen y midan igual.
//   nLineas(avance)     → en cuántas líneas se divide una rama (1–3)
//   pesos(etapa)        → parte (0..1) del total de la etapa que aporta cada rama; las críticas pesan lo que dice `critica`;
//                         las que no vuelven al tronco (`une` o `regresa`) pesan 0
//   alTronco(rama)      → la rama vuelve al tronco al cerrar la etapa (no se une a otra rama ni regresa a otra etapa)
//   avanceEtapa(etapa)  → avance ponderado de la etapa (0..1)
//   umbralEtapa(T, e)   → umbral que debe cumplir la etapa para desbloquear a las que dependen de ella
//   cumple(T, e)        → la etapa llegó a su umbral: con `umbral` propio, CADA rama ≥ ese umbral;
//                         sin él, el avance ponderado ≥ umbral del conjunto
//   alcanzadas(T)       → Set de ids de etapas alcanzadas: todas sus `depende` alcanzadas y cumplidas
//   validar(T)          → { err: [...], av: [...] } en HTML corto
window.TimelineReglas = (() => {
  'use strict';

  const UMBRAL = 0.85;
  const nLineas = av => (av >= 0.7 ? 3 : av >= 0.35 ? 2 : 1);
  const alTronco = r => !r.une && !r.regresa;
  const esCritica = r => alTronco(r) && typeof r.critica === 'number' && r.critica > 0;
  const umbralDe = T => (typeof T.umbral === 'number' ? T.umbral : UMBRAL);

  // Ramas críticas: pesan su `critica` del total; las demás se reparten lo que sobra a partes iguales.
  // Si todas son críticas (o no sobra nada), se normaliza para que la suma sea 1. Las ramas que se unen a otra o regresan
  // a otra etapa no llegan al tronco: pesan 0 y la etapa siguiente solo se alcanza por las que sí llegan.
  function pesos(e) {
    const ramas = e.ramas || [];
    const crit = ramas.filter(esCritica), resto = ramas.filter(alTronco).length - crit.length;
    const suma = crit.reduce((t, r) => t + r.critica, 0);
    const libre = Math.max(0, 1 - suma);
    const p = ramas.map(r => (!alTronco(r) ? 0 : esCritica(r) ? r.critica : resto ? libre / resto : 0));
    const total = p.reduce((t, x) => t + x, 0) || 1;
    return p.map(x => x / total);
  }

  const avanceEtapa = e => pesos(e).reduce((t, w, i) => t + w * (e.ramas[i].avance || 0), 0);

  const umbralEtapa = (T, e) => (typeof e.umbral === 'number' ? e.umbral : umbralDe(T));
  const cumple = (T, e) => (typeof e.umbral === 'number'
    ? (e.ramas || []).filter(alTronco).every(r => (r.avance || 0) >= e.umbral - 1e-9)   // tolerancia de redondeo
    : avanceEtapa(e) >= umbralDe(T) - 1e-9);

  function alcanzadas(T) {
    const si = new Set(), porId = {};
    for (const e of T.etapas) porId[e.id] = e;
    for (const e of T.etapas) {
      const ok = (e.depende || []).every(d => si.has(d) && cumple(T, porId[d]));
      if (ok) si.add(e.id);
    }
    return si;
  }

  function validar(T) {
    const err = [], av = [];
    if (!T || !Array.isArray(T.etapas) || !T.etapas.length) {
      err.push('El archivo de datos debe definir <b>window.TIMELINE</b> con un arreglo <b>etapas</b> no vacío.');
      return { err, av };
    }
    if (T.umbral != null && !(typeof T.umbral === 'number' && T.umbral > 0 && T.umbral <= 1))
      err.push('«umbral» debe ser un número mayor que 0 y hasta 1 (0.85 = 85 %).');
    if (T.bloque != null && !(T.bloque && typeof T.bloque === 'object' && T.bloque.nombre))
      av.push('«bloque» debe ser un objeto con al menos «nombre»; se dibuja sin bloque.');
    const ids = new Set(T.etapas.map(e => e.id)), vistos = new Set();
    T.etapas.forEach((e, s) => {
      const q = `<b>${e.id || `etapa ${s + 1}`}</b>`;
      if (!e.id) err.push(`${q}: falta «id».`);
      else if (vistos.has(e.id)) err.push(`${q}: «id» repetido.`);
      if (!e.nombre) err.push(`${q}: falta «nombre».`);
      if (e.umbral != null && !(typeof e.umbral === 'number' && e.umbral > 0 && e.umbral <= 1))
        err.push(`${q}: «umbral» debe ser un número mayor que 0 y hasta 1 (0.95 = 95 % en cada rama).`);
      for (const c of ['num', 'fechas', 'estado']) if (!e[c]) av.push(`${q}: falta «${c}».`);
      (e.depende || []).forEach(d => {
        if (!ids.has(d)) err.push(`${q}: depende de «${d}», que no existe.`);
        else if (d === e.id) err.push(`${q}: no puede depender de sí misma.`);
        else if (!vistos.has(d)) av.push(`${q} va antes de su dependencia «${d}» en el arreglo: muévela después.`);
      });
      vistos.add(e.id);
      if (!Array.isArray(e.ramas) || !e.ramas.length) { err.push(`${q}: necesita al menos una rama.`); return; }
      let sumaCrit = 0;
      const nombres = new Set(e.ramas.map(r => r.nombre));
      if (!e.ramas.some(alTronco)) err.push(`${q}: al menos una rama debe volver al tronco (sin «une» ni «regresa»).`);
      e.ramas.forEach((r, i) => {
        const qr = `${q} › ${r.nombre || `rama ${i + 1}`}`;
        if (!r.nombre) err.push(`${qr}: falta «nombre».`);
        // une: se reúne con otra rama de la misma etapa (que vuelve al tronco) en lugar de volver al tronco
        if (r.une != null) {
          const t = e.ramas.find(o => o.nombre === r.une);
          if (!t || t === r) err.push(`${qr}: «une» debe ser el nombre de otra rama de esta etapa.`);
          else if (!alTronco(t)) err.push(`${qr}: se une a «${r.une}», que tampoco vuelve al tronco.`);
          if (r.regresa != null) err.push(`${qr}: usa «une» o «regresa», no ambos.`);
        }
        // regresa: sale de la rama `desde` y vuelve hacia atrás hasta una etapa anterior
        if (r.regresa != null) {
          if (!vistos.has(r.regresa) || r.regresa === e.id) err.push(`${qr}: «regresa» debe ser el id de una etapa anterior.`);
          if (!r.desde || !nombres.has(r.desde) || r.desde === r.nombre) err.push(`${qr}: con «regresa» indica en «desde» la rama de esta etapa de la que sale.`);
          else if (e.ramas.find(o => o.nombre === r.desde).regresa) err.push(`${qr}: «desde» no puede ser otra rama que regresa.`);
        } else if (r.desde != null) av.push(`${qr}: «desde» solo se usa junto con «regresa»; se ignora.`);
        if (typeof r.avance !== 'number' || !(r.avance >= 0 && r.avance <= 1)) { err.push(`${qr}: «avance» debe ser un número de 0 a 1.`); return; }
        if (!Array.isArray(r.acciones) || !r.acciones.length) err.push(`${qr}: necesita al menos una acción.`);
        const n = nLineas(r.avance), tiene = Array.isArray(r.lineas) ? r.lineas.length : 0;
        if (n > 1 && n > tiene) av.push(`${qr}: con avance ${r.avance} se divide en ${n} líneas; «lineas» tiene ${tiene}.`);
        if (r.critica != null) {
          if (!(typeof r.critica === 'number' && r.critica > 0 && r.critica <= 1)) err.push(`${qr}: «critica» debe ser un número mayor que 0 y hasta 1 (0.4 = 40 %).`);
          else sumaCrit += r.critica;
        }
      });
      const normales = e.ramas.filter(r => alTronco(r) && !esCritica(r)).length;
      if (sumaCrit > 1.0001) err.push(`${q}: las ramas críticas suman ${Math.round(sumaCrit * 100)} %; no pueden pasar de 100 %.`);
      else if (sumaCrit > 0.9999 && normales) av.push(`${q}: las críticas suman 100 %; las otras ${normales} ramas no cuentan para el avance.`);
      else if (sumaCrit > 0 && !normales && sumaCrit < 0.9999) av.push(`${q}: todas las ramas son críticas y suman ${Math.round(sumaCrit * 100)} %; se reparten en proporción.`);
    });
    return { err, av };
  }

  return { UMBRAL, nLineas, alTronco, esCritica, umbralDe, umbralEtapa, cumple, pesos, avanceEtapa, alcanzadas, validar };
})();
