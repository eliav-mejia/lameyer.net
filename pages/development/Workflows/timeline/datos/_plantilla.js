// Plantilla de un conjunto de datos para timeline/. Copiar como datos/<id>.js y registrar <id> en datos/indice.js,
// o llenarlo con el formulario: timeline/editor.html (escribe el archivo y lo registra solo, con ./servir.sh).
// Guía paso a paso: timeline/Lameyer-Timeline-Guia-de-Datos.pdf. Al abrir la página, los errores salen en un aviso rojo.
//
// Reglas rápidas
//   · Orden del arreglo `etapas` = orden del flujo. Cada etapa va DESPUÉS de todas las que lista en `depende`.
//   · avance: 0..1 por rama  →  < 0.35 = 1 línea · 0.35–0.7 = 2 líneas (pide 2 `lineas`) · ≥ 0.7 = 3 líneas (pide 3).
//   · estado: 'En curso' | 'Adelantada' (se resaltan en azul) | 'Pendiente' (sin rótulo) | otro texto (rótulo azul).
//   · acciones: en orden; el avance marca cuántas están hechas (avance × número de acciones).
//   · critica: opcional. Parte (0..1) del total de la etapa que pesa la rama; las demás se reparten el resto a partes iguales.
//   · une: opcional. Nombre de otra rama de la misma etapa: la rama se reúne con ella antes de cerrar la etapa en lugar
//     de volver al tronco. No cuenta para el avance (la etapa siguiente solo se alcanza por las ramas que llegan al tronco).
//   · desde + regresa: opcional. Rama que sale de la rama `desde` y vuelve hacia atrás hasta la etapa `regresa` (id de una
//     etapa anterior), donde se une a su rama principal. Tampoco cuenta para el avance. Ej.: retargeting.
//   · Ciclo: el pulso recorre solo las etapas alcanzadas y vuelve a empezar. Una etapa se alcanza cuando todas sus
//     `depende` llegan al `umbral` (0.85 = 85 % del avance ponderado); mientras tanto se ve difuminada.
window.TIMELINE = {
  id: 'mi-proceso',                 // igual al nombre del archivo y al renglón de indice.js
  titulo: 'Nombre del proceso',     // título de la pestaña
  unidad: 'Etapa',                  // cómo se llama cada paso: Etapa, Fase, Paso, Sprint…
  subunidad: 'Rama',                // opcional: cómo se llama cada rama: Rama, Módulo, Taller…
  bloque: {                         // opcional: agrupa todas las etapas; se ve en la cabecera, al inicio y al cierre
    num: '1', sigla: 'ABC', nombre: 'Nombre del bloque',
    lema: 'Frase corta', alcance: 'Qué cubre el bloque', formato: 'Talleres y sprints',
    siguiente: 'Bloque 2',          // rótulo de la compuerta al final del tronco
  },
  umbral: 0.85,                     // avance de las dependencias para entrar en el ciclo (por defecto 0.85)
  etapas: [
    {
      id: 'e1', num: '1', nombre: 'Primera etapa', depende: [],
      fechas: '1 ene – 31 ene 2027', estado: 'En curso',
      carpeta: 'ruta/de/la/carpeta',  // texto libre al pie del panel (de dónde salen los datos)
      ramas: [
        { nombre: 'Rama avanzada', avance: 0.72, critica: 0.5,   // crítica: pesa 50 % de la etapa
          lineas: ['línea 1', 'línea 2', 'línea 3'],
          acciones: ['Acción hecha', 'Acción hecha', 'Acción en curso', 'Acción pendiente'] },
        { nombre: 'Rama a la mitad', avance: 0.4,
          lineas: ['línea 1', 'línea 2'],
          acciones: ['Acción hecha', 'Acción pendiente'] },
        { nombre: 'Rama sin empezar', avance: 0,
          acciones: ['Primera acción'] },
      ],
    },
    {
      id: 'e2', num: '2', nombre: 'Segunda etapa', depende: ['e1'],
      fechas: 'Por definir', estado: 'Pendiente',
      carpeta: 'ruta/de/la/carpeta',
      ramas: [
        { nombre: 'Única rama', avance: 0, acciones: ['Primera acción'] },
      ],
    },
  ],
};
