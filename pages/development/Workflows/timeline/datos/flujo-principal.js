// Conjunto de datos «flujo-principal» para timeline/ (guía: Lameyer-Timeline-Guia-de-Datos.pdf).
// Flujo principal del cliente: 8 etapas en una sola línea, de primer contacto a rating. Cada etapa depende de la anterior
// y tiene una sola rama con sus tres pasos, salvo la Etapa 3: «Contacto con representante» se une a «Pago y envío de
// comprobante» antes de cerrar la etapa, o sale por «Retargeting», que regresa a la Etapa 2. Solo el pago vuelve al tronco.
// avance 1 en cada rama: el flujo está definido completo, así que el pulso recorre las 8 etapas en ciclo.
// avance: < 0.35 → 1 línea · 0.35–0.7 → 2 líneas · ≥ 0.7 → 3 líneas (pide ese número de `lineas`).
window.TIMELINE = {
  id: 'flujo-principal',
  titulo: 'Flujo principal',
  unidad: 'Etapa',
  subunidad: 'Paso',
  etapas: [
    {
      id: 'e1', num: '1', nombre: 'Primer contacto', depende: [], fechas: 'Paso 1 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Primer contacto', avance: 1,
          lineas: ['saludo', 'necesidad del cliente', 'datos de contacto'],
          acciones: ['Saludo y presentación', 'Identificar la necesidad del cliente', 'Registrar datos de contacto'] },
      ],
    },
    {
      id: 'e2', num: '2', nombre: 'Información de producto/servicio', depende: ['e1'], fechas: 'Paso 2 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Información de producto/servicio', avance: 1,
          lineas: ['catálogo o servicio', 'precios y condiciones', 'dudas'],
          acciones: ['Enviar catálogo o descripción del servicio', 'Compartir precios y condiciones', 'Resolver dudas'] },
      ],
    },
    {
      id: 'e3', num: '3', nombre: 'Pago y envío de comprobante', depende: ['e2'], fechas: 'Paso 3 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        // Única rama que vuelve al tronco: a la Etapa 4 solo se llega con pago y comprobante
        { nombre: 'Pago y envío de comprobante', avance: 1,
          lineas: ['datos de pago', 'comprobante', 'confirmación'],
          acciones: ['Enviar datos o enlace de pago', 'Recibir comprobante del cliente', 'Confirmar el pago'] },
        // Se une a «Pago y envío de comprobante» antes de cerrar la etapa (no cuenta para el avance)
        { nombre: 'Contacto con representante', avance: 1, une: 'Pago y envío de comprobante',
          lineas: ['canalizar', 'dudas y objeciones', 'decisión'],
          acciones: ['Canalizar al cliente con un representante', 'Resolver dudas u objeciones de pago', 'Pasar a pago o a retargeting'] },
        // Sale de «Contacto con representante» y regresa a la Etapa 2 (no cuenta para el avance)
        { nombre: 'Retargeting', avance: 1, desde: 'Contacto con representante', regresa: 'e2',
          lineas: ['registro', 'seguimiento', 'reenganche'],
          acciones: ['Registrar al cliente para retargeting', 'Mensaje o campaña de seguimiento', 'Volver a información de producto/servicio'] },
      ],
    },
    {
      id: 'e4', num: '4', nombre: 'Seguimiento inmediato', depende: ['e3'], fechas: 'Paso 4 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Seguimiento inmediato', avance: 1,
          lineas: ['acuse de recibo', 'próximos pasos', 'fecha de entrega'],
          acciones: ['Acuse de recibo al cliente', 'Explicar los próximos pasos', 'Confirmar fecha de entrega o inicio'] },
      ],
    },
    {
      id: 'e5', num: '5', nombre: 'Inicio de entrega de producto o servicio', depende: ['e4'], fechas: 'Paso 5 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Inicio de entrega', avance: 1,
          lineas: ['preparación', 'envío o arranque', 'aviso al cliente'],
          acciones: ['Preparar producto o servicio', 'Enviar o arrancar el servicio', 'Avisar al cliente con guía o agenda'] },
      ],
    },
    {
      id: 'e6', num: '6', nombre: 'Finalización del servicio', depende: ['e5'], fechas: 'Paso 6 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Finalización del servicio', avance: 1,
          lineas: ['entrega final', 'conformidad', 'cierre'],
          acciones: ['Entrega final', 'Confirmar conformidad del cliente', 'Cerrar el servicio'] },
      ],
    },
    {
      id: 'e7', num: '7', nombre: 'Estado de cuenta y facturación', depende: ['e6'], fechas: 'Paso 7 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Estado de cuenta y facturación', avance: 1,
          lineas: ['estado de cuenta', 'factura', 'saldos'],
          acciones: ['Enviar estado de cuenta', 'Emitir factura', 'Conciliar saldos pendientes'] },
      ],
    },
    {
      id: 'e8', num: '8', nombre: 'Rating del producto o servicio', depende: ['e7'], fechas: 'Paso 8 de 8', estado: 'Definida',
      carpeta: 'Flujo principal del cliente',
      ramas: [
        { nombre: 'Rating del producto o servicio', avance: 1,
          lineas: ['solicitud de rating', 'comentarios', 'mejoras'],
          acciones: ['Solicitar calificación', 'Registrar comentarios', 'Aplicar mejoras al flujo'] },
      ],
    },
  ],
};
