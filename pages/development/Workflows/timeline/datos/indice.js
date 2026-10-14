// Índice de conjuntos de datos de timeline/. Un renglón por proceso; `id` = nombre del archivo en datos/ (sin .js).
// Para agregar un proceso: copiar _plantilla.js como datos/<id>.js, llenarlo y añadir su renglón aquí.
// Se abre con timeline/?datos=<id> (sin parámetro, el primero de la lista).
window.TIMELINES = [
  { id: 'flujo-principal', titulo: 'Flujo principal del cliente', origen: 'timeline/datos',
    descripcion: 'Flujo principal en 8 etapas: primer contacto, información, pago y comprobante, seguimiento, entrega, finalización, estado de cuenta y facturación, y rating.' },
];
