/* Business Model Canvas · Lameyer
   Un bloque por categoría. `area` = posición en la rejilla (estilo.css), `orden` = orden sugerido de llenado.
   Para cambiar textos, editar aquí; la página no necesita más cambios. */
window.CANVAS = [
  {
    id: 'socios', area: 'socios', orden: 8, titulo: 'Socios Clave',
    resumen: 'La red de proveedores y aliados que hacen funcionar el modelo.',
    preguntas: ['¿Quiénes son nuestros socios y proveedores clave?', '¿Qué recursos obtenemos de ellos?', '¿Qué actividades realizan por nosotros?'],
    ejemplos: ['Alianzas estratégicas', 'Proveedores de nube', 'Joint ventures'],
    icono: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c0-3 2.2-5 5-5s5 2 5 5M11 19c0-3 2.2-5 5-5s5 2 5 5"/>'
  },
  {
    id: 'actividades', area: 'actividades', orden: 7, titulo: 'Actividades Clave',
    resumen: 'Lo más importante que debemos hacer para que el modelo funcione.',
    preguntas: ['¿Qué actividades exige nuestra propuesta de valor?', '¿Y nuestros canales y relaciones?', '¿Qué genera ingresos?'],
    ejemplos: ['Desarrollo de software', 'Producción', 'Solución de problemas'],
    icono: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/>'
  },
  {
    id: 'recursos', area: 'recursos', orden: 6, titulo: 'Recursos Clave',
    resumen: 'Los activos indispensables para entregar la propuesta de valor.',
    preguntas: ['¿Qué recursos requiere la propuesta de valor?', '¿Físicos, intelectuales, humanos o financieros?', '¿Cuáles son difíciles de copiar?'],
    ejemplos: ['Equipo técnico', 'Plataforma propia', 'Marca y datos'],
    icono: '<path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>'
  },
  {
    id: 'propuesta', area: 'propuesta', orden: 2, titulo: 'Propuesta de Valor',
    resumen: 'El valor que entregamos: qué problema resolvemos y qué necesidad satisfacemos.',
    preguntas: ['¿Qué valor entregamos al cliente?', '¿Qué problema le ayudamos a resolver?', '¿Qué paquetes ofrecemos a cada segmento?'],
    ejemplos: ['Novedad', 'Desempeño', 'Personalización', 'Precio', 'Conveniencia'],
    icono: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3z"/>'
  },
  {
    id: 'relaciones', area: 'relaciones', orden: 4, titulo: 'Relación con Clientes',
    resumen: 'El tipo de relación que cada segmento espera que establezcamos y mantengamos.',
    preguntas: ['¿Qué relación espera cada segmento?', '¿Cuáles ya tenemos y cuánto cuestan?', '¿Cómo se integran al resto del modelo?'],
    ejemplos: ['Asistencia personal', 'Autoservicio', 'Comunidades', 'Co-creación'],
    icono: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
  },
  {
    id: 'canales', area: 'canales', orden: 3, titulo: 'Canales',
    resumen: 'Cómo comunicamos y entregamos la propuesta de valor a cada segmento.',
    preguntas: ['¿Por qué canales quieren ser contactados?', '¿Cuáles funcionan mejor y son más rentables?', '¿Cómo se integran con su rutina?'],
    ejemplos: ['Sitio web', 'Redes sociales', 'Venta directa', 'Socios distribuidores'],
    icono: '<path d="M3 12h13M12 6l6 6-6 6"/><path d="M21 4v16"/>'
  },
  {
    id: 'segmentos', area: 'segmentos', orden: 1, titulo: 'Segmentos de Clientes',
    resumen: 'Para quién creamos valor: los grupos de personas u organizaciones a los que servimos.',
    preguntas: ['¿Para quién creamos valor?', '¿Quiénes son nuestros clientes más importantes?', '¿Mercado masivo, nicho o multilateral?'],
    ejemplos: ['Mercado masivo', 'Nicho', 'Segmentado', 'Plataforma multilateral'],
    icono: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'
  },
  {
    id: 'costos', area: 'costos', orden: 9, titulo: 'Estructura de Costos',
    resumen: 'Los costos más importantes que implica operar el modelo de negocio.',
    preguntas: ['¿Cuáles son los costos más importantes?', '¿Qué recursos y actividades son los más caros?', '¿Modelo orientado a costo o a valor?'],
    ejemplos: ['Costos fijos', 'Costos variables', 'Economías de escala'],
    icono: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
  },
  {
    id: 'ingresos', area: 'ingresos', orden: 5, titulo: 'Fuentes de Ingresos',
    resumen: 'El dinero que genera cada segmento de clientes y cómo prefiere pagar.',
    preguntas: ['¿Por qué valor están dispuestos a pagar?', '¿Cómo pagan hoy y cómo preferirían pagar?', '¿Cuánto aporta cada fuente al total?'],
    ejemplos: ['Venta de activos', 'Suscripción', 'Licencias', 'Comisiones', 'Publicidad'],
    icono: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>'
  }
];
