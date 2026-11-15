// Blog · Ciberseguridad (formerly the Academia). Loaded after /js/layout.jsx (which provides Layout, RegisterCTA, renderPage, React hooks).
//
// Every entry is a folder:  /blog/ciberseguridad/<series>/<slug>/index.html   (e.g. /blog/ciberseguridad/seguridad-apis/limitacion-de-tasa/)
// and one object in ACADEMIA_POSTS below with the same `slug`. Search either name to find the other.
//
// HOW TO ADD AN ENTRY
//   1. Copy an entry folder inside its series, e.g. blog/ciberseguridad/seguridad-apis/limitacion-de-tasa/ -> .../seguridad-apis/mi-nueva-entrada/
//   2. Edit its index.html: <title>, description, canonical, CONTROLS (checklist) and Content.
//      Nothing else: renderPost() finds the entry from the page's own URL.
//   3. Add an object to ACADEMIA_POSTS with `slug: 'mi-nueva-entrada'` and a `type` from ACADEMIA_TYPES.
//      The dashboard lists it automatically. For a crossover, also give it `crosses: [...]` and a short `label`.
//   4. A new series (capa) needs one entry in SERIES (with `capa`), its ACADEMIA_TYPES and ZONES, and a folder /blog/ciberseguridad/<series-id>/.
//   5. Run node tools/generar-blog.mjs and python tools/generar-sitemap.py.

// --- ACADEMIA ---

// Folder names, series ids and slugs are in Spanish (1.0.7); type and zone ids stay as short internal keys.
// Blog · Ciberseguridad (2.0.0): every series is one CAPA, ordered from the perimeter inwards (`capa`).
// The academia is split into series. Each series has its own types (shown as an ordered flow),
// zones, facet name and call to action. A post belongs to one type and may also `cross` others.
const SERIES = [
    {
        id: 'seguridad-apis',
        capa: 1,
        capaShort: 'Perímetro',
        capaRole: 'La primera barrera: lo que una petición cruza antes de tocar tu sistema.',
        label: 'Seguridad de APIs',
        eyebrow: 'CIBERSEGURIDAD · SEGURIDAD DE APIS',
        title: 'Defensa en capas',
        accent: 'para APIs headless',
        intro: 'Una API headless sin frontend expone claves y datos al raspado, a la fuerza bruta y a ataques directos al origen. Recorre cada capa del modelo de defensa de Cloudflare, del edge a tu origen.',
        step: 'Barrera',
        from: 'Cliente',
        to: 'Origen',
        flowLabel: 'Recorrido de la petición',
        typesLabel: 'Barreras de defensa',
        facet: 'Amenaza',
        facetsLabel: 'Amenazas cubiertas',
        verb: 'Detiene',
        placeholder: 'p. ej. inyección SQL, mTLS, 429',
        cta: { title: '¿Necesitas blindar tu API?', text: 'Diseñamos y desplegamos defensas en capas con Cloudflare para APIs headless.' },
    },
    {
        id: 'edge-serverless',
        capa: 2,
        capaShort: 'Edge',
        capaRole: 'Donde se ejecuta la lógica, se autentica y se cachea, lejos del servidor de origen.',
        label: 'Edge Serverless',
        eyebrow: 'CIBERSEGURIDAD · EDGE SERVERLESS',
        title: 'Lógica que se ejecuta',
        accent: 'cerca del usuario',
        intro: 'La «SE» de MC-SE (Serverless Edge, Edge Serverless): ejecutar la lógica de las peticiones, la caché y las tareas programadas en funciones serverless en el edge, con el almacenamiento a su lado y sin servidores que parchear.',
        step: 'Paso',
        from: 'Usuario',
        to: 'Núcleo',
        flowLabel: 'Recorrido de la petición en el edge',
        typesLabel: 'Pasos',
        facet: 'Caso de uso',
        facetsLabel: 'Casos de uso cubiertos',
        verb: 'Resuelve',
        placeholder: 'p. ej. Workers, KV, cron, arranque en frío',
        cta: { title: '¿Llevando la lógica al edge?', text: 'Construimos y operamos funciones serverless en el edge delante de tu núcleo y de tus APIs.' },
    },
    {
        id: 'automatizacion-flujos',
        capa: 3,
        capaShort: 'Integraciones',
        capaRole: 'Webhooks, colas y terceros: las puertas de entrada que más se olvidan.',
        label: 'Automatización de flujos',
        eyebrow: 'CIBERSEGURIDAD · AUTOMATIZACIÓN DE FLUJOS',
        title: 'Conecta tus flujos',
        accent: 'con lógica serverless',
        intro: 'Webhooks, colas y flujos duraderos que conectan formularios, CRM, hojas de cálculo y pasarelas de pago con tu núcleo modular, de forma fiable, incluso cuando alguno de ellos está caído.',
        step: 'Paso',
        from: 'Disparador',
        to: 'Resultado',
        flowLabel: 'Recorrido del flujo',
        typesLabel: 'Pasos',
        facet: 'Caso de uso',
        facetsLabel: 'Casos de uso cubiertos',
        verb: 'Resuelve',
        placeholder: 'p. ej. webhook, reintento, idempotencia',
        cta: { title: '¿Los pasos manuales te frenan?', text: 'Automatizamos flujos de negocio con funciones serverless, colas e integraciones.' },
    },
    {
        id: 'nucleo-modular',
        capa: 4,
        capaShort: 'Núcleo',
        capaRole: 'Límites, contratos y propiedad de datos: quién puede tocar qué dentro del sistema.',
        label: 'Núcleo Modular',
        eyebrow: 'CIBERSEGURIDAD · NÚCLEO MODULAR',
        title: 'Un núcleo que puedes',
        accent: 'reconstruir por piezas',
        intro: 'La «MC» de MC-SE (Modular Core, Núcleo Modular): dividir la lógica de negocio en módulos con límites y contratos claros, para que el edge, los flujos y las integraciones puedan llamarla sin saber cómo funciona por dentro.',
        step: 'Paso',
        from: 'Monolito',
        to: 'Módulos',
        flowLabel: 'Recorrido de modularización',
        typesLabel: 'Pasos',
        facet: 'Caso de uso',
        facetsLabel: 'Casos de uso cubiertos',
        verb: 'Resuelve',
        placeholder: 'p. ej. OpenAPI, workspaces, migraciones',
        cta: { title: '¿Desenredando un monolito?', text: 'Diseñamos núcleos modulares con contratos tipados sobre los que construir funciones serverless e integraciones.' },
    },
    {
        id: 'busqueda-visibilidad',
        capa: 5,
        capaShort: 'Exposición',
        capaRole: 'Lo que el sistema publica: qué ven rastreadores, buscadores e IA, y qué no deberían ver.',
        label: 'Búsqueda de código y visibilidad',
        eyebrow: 'CIBERSEGURIDAD · BÚSQUEDA DE CÓDIGO Y VISIBILIDAD',
        title: 'Código localizable,',
        accent: 'páginas localizables',
        intro: 'Organizar, filtrar y buscar semánticamente código y repositorios, y después publicar lo que construyes para que rastreadores, buscadores y sistemas de IA lo encuentren. Cada etapa, más los cruces donde las etapas se encuentran.',
        step: 'Etapa',
        from: 'Repositorio',
        to: 'Resultados',
        flowLabel: 'Recorrido de descubrimiento',
        typesLabel: 'Etapas',
        facet: 'Problema',
        facetsLabel: 'Problemas cubiertos',
        verb: 'Resuelve',
        placeholder: 'p. ej. embeddings, LCP, JSON-LD',
        cta: { title: '¿Quieres que encuentren tu código y tu documentación?', text: 'Creamos búsqueda semántica de código y sitios de documentación rápidos, rastreables y estructurados.' },
    },
];

const ACADEMIA_TYPES = [
    // API Security: the five layers of the Cloudflare defense model, in the order a request crosses them.
    { id: 'edge', series: 'seguridad-apis', layer: 1, label: 'Capa edge (DDoS y DNS)', short: 'Edge', zone: 'network' },
    { id: 'waf', series: 'seguridad-apis', layer: 2, label: 'Capa WAF y bots (capa 7)', short: 'WAF y bots', zone: 'application' },
    { id: 'api', series: 'seguridad-apis', layer: 3, label: 'Protección de endpoints de API', short: 'API Shield', zone: 'application' },
    { id: 'rate', series: 'seguridad-apis', layer: 4, label: 'Limitación de tasa', short: 'Límite de tasa', zone: 'application' },
    { id: 'tunnel', series: 'seguridad-apis', layer: 5, label: 'Cloudflare Tunnel', short: 'Túnel', zone: 'origin' },

    // Code Search & Discoverability: from organizing a repository to being found on the open web.
    { id: 'hub', series: 'busqueda-visibilidad', layer: 0, label: 'Búsqueda de código y organización de repositorios', short: 'Visión general', zone: 'retrieval' },
    { id: 'semantic', series: 'busqueda-visibilidad', layer: 1, label: 'Búsqueda semántica y vectorial', short: 'Búsqueda vectorial', zone: 'retrieval' },
    { id: 'sac', series: 'busqueda-visibilidad', layer: 2, label: 'Búsqueda como código (SaC)', short: 'Búsqueda como código', zone: 'retrieval' },
    { id: 'bench', series: 'busqueda-visibilidad', layer: 3, label: 'Curación de benchmarks (REAP / Harvest)', short: 'Benchmarks', zone: 'retrieval' },
    { id: 'ssr', series: 'busqueda-visibilidad', layer: 4, label: 'SSR y generación estática', short: 'SSR / SSG', zone: 'discovery' },
    { id: 'html', series: 'busqueda-visibilidad', layer: 5, label: 'Marcado HTML semántico', short: 'HTML semántico', zone: 'discovery' },
    { id: 'cwv', series: 'busqueda-visibilidad', layer: 6, label: 'Core Web Vitals y velocidad de página', short: 'Web Vitals', zone: 'discovery' },
    { id: 'crawl', series: 'busqueda-visibilidad', layer: 7, label: 'Rastreabilidad e indexación', short: 'Rastreo e índice', zone: 'discovery' },
    { id: 'sd', series: 'busqueda-visibilidad', layer: 8, label: 'Datos estructurados', short: 'Datos estructurados', zone: 'discovery' },

    // Núcleo Modular: from one codebase to modules that the edge and workflows can call.
    { id: 'core-hub', series: 'nucleo-modular', layer: 0, label: 'Arquitectura de Núcleo Modular', short: 'Visión general', zone: 'boundaries' },
    { id: 'modules', series: 'nucleo-modular', layer: 1, label: 'Módulos de dominio y límites', short: 'Módulos', zone: 'boundaries' },
    { id: 'contracts', series: 'nucleo-modular', layer: 2, label: 'Contratos y APIs tipadas', short: 'Contratos', zone: 'boundaries' },
    { id: 'packages', series: 'nucleo-modular', layer: 3, label: 'Paquetes compartidos y espacios de trabajo', short: 'Paquetes', zone: 'delivery' },
    { id: 'data', series: 'nucleo-modular', layer: 4, label: 'Propiedad de datos y migraciones', short: 'Datos', zone: 'delivery' },
    { id: 'ctest', series: 'nucleo-modular', layer: 5, label: 'Pruebas de contrato y versionado', short: 'Versionado', zone: 'delivery' },

    // Edge Serverless: the path a request takes through edge functions before it reaches the core.
    { id: 'serverless-hub', series: 'edge-serverless', layer: 0, label: 'Arquitectura de Edge Serverless', short: 'Visión general', zone: 'compute' },
    { id: 'functions', series: 'edge-serverless', layer: 1, label: 'Funciones edge (Workers)', short: 'Funciones', zone: 'compute' },
    { id: 'routing', series: 'edge-serverless', layer: 2, label: 'Enrutado, caché y autenticación en el edge', short: 'Enrutado y caché', zone: 'compute' },
    { id: 'storage', series: 'edge-serverless', layer: 3, label: 'Almacenamiento edge (KV, D1, R2)', short: 'Almacenamiento', zone: 'state' },
    { id: 'cron', series: 'edge-serverless', layer: 4, label: 'Tareas programadas (Cron Triggers)', short: 'Cron', zone: 'state' },
    { id: 'observe', series: 'edge-serverless', layer: 5, label: 'Logs, trazas y costes', short: 'Observabilidad', zone: 'state' },
    // Edge Serverless · expansion: capabilities built on the same request path.
    { id: 'realtime', series: 'edge-serverless', layer: 6, label: 'Tiempo real (WebSockets y Durable Objects)', short: 'Tiempo real', zone: 'state' },
    { id: 'edge-ai', series: 'edge-serverless', layer: 7, label: 'IA en el edge (Workers AI, Vectorize, AI Gateway)', short: 'IA en el edge', zone: 'compute' },
    { id: 'media', series: 'edge-serverless', layer: 8, label: 'Imágenes y multimedia en el edge', short: 'Multimedia', zone: 'compute' },
    { id: 'deploy', series: 'edge-serverless', layer: 9, label: 'Desplegar, probar y lanzar', short: 'Despliegue', zone: 'platform' },

    // Workflow Automation: from the event that starts a workflow to the outcome it produces.
    { id: 'workflows-hub', series: 'automatizacion-flujos', layer: 0, label: 'Automatización serverless de flujos', short: 'Visión general', zone: 'triggers' },
    { id: 'webhooks', series: 'automatizacion-flujos', layer: 1, label: 'Webhooks y disparadores de formularios', short: 'Webhooks', zone: 'triggers' },
    { id: 'queues', series: 'automatizacion-flujos', layer: 2, label: 'Colas y eventos', short: 'Colas', zone: 'triggers' },
    { id: 'durable', series: 'automatizacion-flujos', layer: 3, label: 'Flujos duraderos y orquestación', short: 'Duraderos', zone: 'execution' },
    { id: 'idempotency', series: 'automatizacion-flujos', layer: 4, label: 'Idempotencia y reintentos', short: 'Reintentos', zone: 'execution' },
    { id: 'integrations', series: 'automatizacion-flujos', layer: 5, label: 'Integraciones (CRM, Sheets, email, pagos)', short: 'Integraciones', zone: 'execution' },
];

const ZONES = [
    { id: 'network', series: 'seguridad-apis', label: 'Red (L3/L4 + DNS)' },
    { id: 'application', series: 'seguridad-apis', label: 'Aplicación (L7)' },
    { id: 'origin', series: 'seguridad-apis', label: 'Origen' },
    { id: 'retrieval', series: 'busqueda-visibilidad', label: 'Recuperación (código y repos)' },
    { id: 'discovery', series: 'busqueda-visibilidad', label: 'Descubrimiento (web y rastreadores)' },
    { id: 'boundaries', series: 'nucleo-modular', label: 'Límites (diseño)' },
    { id: 'delivery', series: 'nucleo-modular', label: 'Entrega (construir y evolucionar)' },
    { id: 'compute', series: 'edge-serverless', label: 'Cómputo (recorrido de la petición)' },
    { id: 'state', series: 'edge-serverless', label: 'Estado y operaciones' },
    { id: 'platform', series: 'edge-serverless', label: 'Plataforma (publicar y evolucionar)' },
    { id: 'triggers', series: 'automatizacion-flujos', label: 'Disparadores (eventos de entrada)' },
    { id: 'execution', series: 'automatizacion-flujos', label: 'Ejecución (trabajo de salida)' },
];

// `threats` holds the facet values for any series (threats for security, problems for search).
// `crosses` lists other types a crossover post also covers; `label` names a crossover in titles and nav.
const ACADEMIA_POSTS = [
    {
        type: 'edge',
        slug: 'capa-edge-ddos-dns',
        title: 'Capa edge: absorber DDoS e inundaciones DNS en el perímetro',
        summary: 'Cómo la red Anycast global de Cloudflare absorbe los ataques volumétricos de capa 3/4 y las inundaciones de consultas DNS antes de que lleguen a tu API.',
        threats: ['DDoS', 'Inundaciones DNS', 'IP de origen expuesta'],
        tags: ['Anycast', 'Inundación SYN', 'Inundación UDP', 'DNSSEC', 'DNS con proxy'],
        readTime: 6,
        published: '2026-09-26',
    },
    {
        type: 'waf',
        slug: 'capa-waf-bots-capa-7',
        title: 'Capa WAF y bots: filtrar peticiones maliciosas en la capa 7',
        summary: 'Bloquear la inyección SQL, el XSS y el raspado de datos automatizado de una API headless con conjuntos de reglas gestionadas, reglas personalizadas y señales de bots.',
        threats: ['Inyección SQL', 'XSS', 'Raspado de datos', 'Relleno de credenciales'],
        tags: ['WAF', 'Reglas gestionadas', 'OWASP', 'Bot Management', 'Reglas personalizadas'],
        readTime: 7,
        published: '2026-09-26',
    },
    {
        type: 'api',
        slug: 'proteccion-endpoints-api',
        title: 'Protección de endpoints de API con API Shield',
        summary: 'Descubrir APIs en la sombra, exigir validación de esquema y autenticar clientes con mTLS para proteger la lógica de negocio de la API.',
        threats: ['APIs en la sombra', 'Cargas útiles malformadas', 'Exfiltración de datos', 'Abuso de claves'],
        tags: ['API Shield', 'Validación de esquema', 'OpenAPI', 'mTLS', 'Descubrimiento de APIs'],
        readTime: 7,
        published: '2026-09-26',
    },
    {
        type: 'rate',
        slug: 'limitacion-de-tasa',
        title: 'Limitación de tasa: frenar la fuerza bruta y el abuso de la API',
        summary: 'Limitar cuántas peticiones puede hacer cada cliente por ventana de tiempo, identificándolo por IP, clave de API, cookie o cabecera.',
        threats: ['Fuerza bruta', 'Relleno de credenciales', 'Raspado de datos', 'Abuso de claves'],
        tags: ['Reglas de limitación de tasa', '429', 'Umbrales', 'Claves de API'],
        readTime: 5,
        published: '2026-09-26',
    },
    {
        type: 'tunnel',
        slug: 'tunel-cloudflare',
        title: 'Cloudflare Tunnel: ocultar el origen y cerrar los puertos de entrada',
        summary: 'Asegurar la última milla con una conexión solo de salida desde tu backend hacia Cloudflare, para que nadie pueda saltarse las demás capas.',
        threats: ['IP de origen expuesta', 'Ataques directos al origen', 'DDoS'],
        tags: ['cloudflared', 'Zero Trust', 'Access', 'Tokens de servicio', 'Cortafuegos'],
        readTime: 6,
        published: '2026-09-26',
    },

    // --- Code Search & Discoverability ---
    {
        type: 'hub',
        slug: 'busqueda-codigo-organizacion-repositorios',
        title: 'Organizar, filtrar y buscar código semánticamente',
        summary: 'Un mapa de toda la serie: estructurar los repositorios para que los filtros funcionen, añadir búsqueda semántica encima, medirla y publicar páginas que personas y rastreadores puedan encontrar.',
        threats: ['Dispersión de repositorios', 'Código imposible de encontrar', 'Búsqueda solo por palabras clave'],
        tags: ['Monorepo', 'CODEOWNERS', 'Temas de GitHub', 'Calificadores', 'Metadatos', 'Búsqueda de código'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'semantic',
        slug: 'busqueda-semantica-vectorial',
        title: 'Búsqueda semántica y vectorial en repositorios de código',
        summary: 'Trocear el código siguiendo su sintaxis, generar embeddings y combinar la similitud vectorial con la búsqueda por palabras clave para que «¿dónde reintentamos los pagos?» encuentre la función correcta.',
        threats: ['Búsqueda solo por palabras clave', 'Desajuste de vocabulario', 'Código imposible de encontrar'],
        tags: ['Embeddings', 'HNSW', 'pgvector', 'Búsqueda híbrida', 'BM25', 'RRF', 'tree-sitter', 'Fragmentación'],
        readTime: 8,
        published: '2026-10-02',
    },
    {
        type: 'sac',
        slug: 'busqueda-como-codigo-sac',
        title: 'Búsqueda como código: versionar consultas, filtros y ranking',
        summary: 'Tratar la configuración de búsqueda como infraestructura: analizadores, sinónimos, boosts y consultas guardadas viven en git, se revisan en pull requests y se despliegan con CI.',
        threats: ['Deriva de configuración', 'Regresiones silenciosas de ranking', 'Dispersión de repositorios'],
        tags: ['GitOps', 'Sinónimos', 'Impulsos de relevancia', 'Búsquedas guardadas', 'Calificadores', 'CI', 'Facetas'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'bench',
        slug: 'curacion-benchmarks-reap-harvest',
        title: 'Curación de benchmarks: cosechar y depurar tareas de búsqueda reales',
        summary: 'Extraer consultas y tareas del historial del repositorio (Harvest) y filtrarlas hasta obtener un benchmark fiable (REAP) para medir la búsqueda de código con Recall@k, MRR y nDCG.',
        threats: ['Relevancia sin medir', 'Contaminación del benchmark', 'Regresiones silenciosas de ranking'],
        tags: ['Harvest', 'REAP', 'Recall@k', 'MRR', 'nDCG', 'Etiquetas de referencia', 'Deduplicación'],
        readTime: 8,
        published: '2026-10-02',
    },
    {
        type: 'ssr',
        slug: 'ssr-generacion-estatica',
        title: 'SSR y generación estática: servir HTML que los rastreadores pueden leer',
        summary: 'Por qué las páginas que solo se renderizan en el navegador son frágiles para los rastreadores de búsqueda e IA, y cómo lo resuelven el prerenderizado en build o el renderizado en servidor.',
        threats: ['HTML inicial vacío', 'Indexación tardía', 'Contenido invisible'],
        tags: ['SSR', 'SSG', 'Prerenderizado', 'Hidratación', 'renderToString', 'Cola de renderizado'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'html',
        slug: 'marcado-html-semantico',
        title: 'HTML semántico: marcado que las máquinas entienden',
        summary: 'Usar landmarks, un esquema de encabezados real, <time>, <code> y enlaces de verdad para que navegadores, lectores de pantalla, rastreadores y troceadores lean la página igual.',
        threats: ['Sopa de divs', 'Esquema de encabezados roto', 'Navegación inaccesible'],
        tags: ['Regiones ARIA', 'Encabezados', '<article>', '<time>', '<pre><code>', 'Accesibilidad'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'cwv',
        slug: 'core-web-vitals-velocidad-pagina',
        title: 'Core Web Vitals y velocidad de página en sitios de documentación',
        summary: 'Qué miden LCP, INP y CLS, qué umbrales hay que cumplir en el percentil 75 y las causas habituales de los sitios para desarrolladores lentos y a tirones.',
        threats: ['LCP lento', 'INP deficiente', 'Saltos de diseño'],
        tags: ['LCP', 'INP', 'CLS', 'CrUX', 'Lighthouse', 'Datos de campo', 'Bloqueo de renderizado'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'crawl',
        slug: 'rastreabilidad-indexacion',
        title: 'Rastreabilidad e indexación: que se descubra cada página',
        summary: 'robots.txt, sitemaps, URLs canónicas, códigos de estado y enlaces reales: la fontanería que decide si una página se puede encontrar, descargar y mantener en el índice.',
        threats: ['Páginas huérfanas', 'Rutas solo con hash', 'URLs duplicadas', '404 blandos'],
        tags: ['robots.txt', 'sitemap.xml', 'URL canónica', 'noindex', 'Search Console', 'Enlaces internos'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'sd',
        slug: 'datos-estructurados',
        title: 'Datos estructurados: describir páginas con JSON-LD',
        summary: 'Añadir marcado schema.org BlogPosting, BreadcrumbList y TechArticle para que los buscadores entiendan qué es una página, quién la escribió y dónde se ubica.',
        threats: ['Contenido ambiguo', 'Sin resultados enriquecidos', 'Contenido sin autoría'],
        tags: ['JSON-LD', 'schema.org', 'BlogPosting', 'TechArticle', 'BreadcrumbList', 'Prueba de resultados enriquecidos'],
        readTime: 6,
        published: '2026-10-02',
    },

    // --- Crossovers ---
    {
        type: 'bench',
        crosses: ['sac', 'semantic'],
        label: 'Benchmarks × búsqueda como código',
        slug: 'benchmarks-x-busqueda-como-codigo',
        title: 'Benchmarks como pruebas de regresión para la búsqueda como código',
        summary: 'Ejecutar el benchmark curado en CI en cada pull request de configuración de búsqueda, para que un sinónimo o un nuevo modelo de embeddings no se publique si baja la relevancia.',
        threats: ['Regresiones silenciosas de ranking', 'Deriva de configuración', 'Relevancia sin medir'],
        tags: ['CI', 'GitHub Actions', 'nDCG', 'Umbrales', 'Embeddings', 'Solicitudes de cambios (PR)'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'ssr',
        crosses: ['html', 'semantic'],
        label: 'Generación estática × búsqueda vectorial',
        slug: 'generacion-estatica-x-busqueda-vectorial',
        title: 'Una compilación, dos públicos: páginas estáticas y un índice vectorial',
        summary: 'Aprovechar el paso de build estático para generar HTML rastreable y, a partir de los mismos encabezados semánticos, los fragmentos que alimentan un índice vectorial.',
        threats: ['HTML inicial vacío', 'Desajuste de vocabulario', 'Índice de búsqueda desactualizado'],
        tags: ['SSG', 'Fragmentación', 'Encabezados', 'Embeddings', 'Hash de contenido', 'Compilaciones incrementales'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'sd',
        crosses: ['crawl', 'hub'],
        label: 'Datos estructurados × repositorios',
        slug: 'datos-estructurados-x-repositorios',
        title: 'Repositorios legibles por máquinas: SoftwareSourceCode y CodeMeta',
        summary: 'Describir proyectos de código con schema.org SoftwareSourceCode en sus páginas de presentación y codemeta.json en el repositorio, para que rastreadores y herramientas de búsqueda de código puedan filtrarlos.',
        threats: ['Contenido ambiguo', 'Dispersión de repositorios', 'Contenido sin autoría'],
        tags: ['SoftwareSourceCode', 'codemeta.json', 'JSON-LD', 'Temas de GitHub', 'Licencia', 'Metadatos', 'sitemap.xml'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'cwv',
        crosses: ['semantic', 'html'],
        label: 'Core Web Vitals × búsqueda en el sitio',
        slug: 'core-web-vitals-x-busqueda-sitio',
        title: 'Cajas de búsqueda que no perjudican las Core Web Vitals',
        summary: 'Cargar el índice de búsqueda bajo demanda, mantener la escritura fluida para el INP y reservar espacio para los resultados para que la búsqueda en cliente nunca desplace el diseño.',
        threats: ['INP deficiente', 'Saltos de diseño', 'LCP lento'],
        tags: ['INP', 'CLS', 'Web Worker', 'Antirrebote (debounce)', 'Carga diferida', '<search>', 'Embeddings', 'Regiones ARIA'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'crawl',
        crosses: ['sac', 'ssr'],
        label: 'Rastreabilidad × búsqueda por facetas',
        slug: 'rastreabilidad-x-busqueda-facetas',
        title: 'Filtros por facetas sin trampas de rastreo',
        summary: 'Las URLs de filtros como ?type=…&threats=… se multiplican rápido. Decide en el código qué facetas merecen páginas indexables y deja el resto fuera del rastreo.',
        threats: ['URLs duplicadas', 'Presupuesto de rastreo desperdiciado', 'Páginas huérfanas'],
        tags: ['Facetas', 'Parámetros de consulta', 'URL canónica', 'robots.txt', 'Páginas de aterrizaje', 'sitemap.xml', 'Prerenderizado'],
        readTime: 6,
        published: '2026-10-02',
    },

    // --- Núcleo Modular ---
    {
        type: 'core-hub',
        slug: 'arquitectura-nucleo-modular',
        title: 'Núcleo Modular: lógica de negocio con límites claros',
        summary: 'Dividir una base de código en módulos de dominio que son dueños de sus datos y exponen contratos tipados, para que las funciones edge y los flujos llamen al núcleo sin meterse dentro.',
        threats: ['Monolito enredado', 'Acoplamiento por base de datos compartida', 'Cambios incompatibles', 'Despliegues lentos'],
        tags: ['Monolito modular', 'Contextos delimitados', 'OpenAPI', 'Espacios de trabajo', 'Pruebas de contrato', 'Semver'],
        readTime: 7,
        published: '2026-10-03',
    },
    {
        type: 'modules',
        slug: 'modulos-dominio-limites',
        title: 'Módulos de dominio: trazar límites que se mantengan',
        summary: 'Encontrar los límites de los módulos a partir de las capacidades de negocio y no de las capas técnicas, dar a cada módulo un punto de entrada público y hacerlo cumplir con reglas de lint para que los límites sobrevivan a la próxima fecha de entrega.',
        threats: ['Monolito enredado', 'Dependencias ocultas', 'Responsables poco claros'],
        tags: ['Contextos delimitados', 'Event storming', 'Monolito modular', 'dependency-cruiser', 'ESLint', 'CODEOWNERS'],
        readTime: 8,
        published: '2026-10-03',
    },
    {
        type: 'contracts',
        slug: 'contratos-apis-tipadas',
        title: 'Contratos y APIs tipadas: un esquema para todos los consumidores',
        summary: 'Definir una sola vez, en un esquema, las entradas, salidas y errores de cada módulo, y generar a partir de él tipos de TypeScript, validación en tiempo de ejecución y un documento OpenAPI con el que las funciones edge y los flujos construyen sus clientes.',
        threats: ['Cambios incompatibles', 'Errores de tipo en ejecución', 'Endpoints sin documentar'],
        tags: ['OpenAPI', 'Zod', 'JSON Schema', 'TypeScript', 'Generación de código', 'Tipos Result'],
        readTime: 8,
        published: '2026-10-03',
    },
    {
        type: 'packages',
        slug: 'paquetes-compartidos-espacios-trabajo',
        title: 'Paquetes compartidos y espacios de trabajo: reutilizar sin una carpeta utils/',
        summary: 'Mover el código compartido (esquemas, tipos de dinero, logging, clientes generados) a paquetes del workspace con exports y responsables explícitos, y construir solo lo que un cambio ha tocado de verdad.',
        threats: ['Código copiado y pegado', 'Cajón de sastre utils', 'Despliegues lentos'],
        tags: ['pnpm workspaces', 'Turborepo', 'Campo exports', 'Changesets', 'Monorepo', 'Compilaciones afectadas'],
        readTime: 7,
        published: '2026-10-03',
    },
    {
        type: 'data',
        slug: 'propiedad-datos-migraciones',
        title: 'Propiedad de datos y migraciones: un dueño por tabla',
        summary: 'Dar a cada tabla exactamente un módulo propietario, sustituir los joins entre módulos por llamadas a contratos, modelos de lectura y eventos, y cambiar los esquemas con migraciones expandir-y-contraer que nunca dejan el núcleo fuera de servicio.',
        threats: ['Acoplamiento por base de datos compartida', 'Migraciones arriesgadas', 'Joins entre módulos'],
        tags: ['Esquemas', 'Patrón outbox', 'Expandir y contraer', 'Modelos de lectura', 'Postgres', 'Sin tiempo de inactividad'],
        readTime: 8,
        published: '2026-10-03',
    },
    {
        type: 'ctest',
        slug: 'pruebas-contrato-versionado',
        title: 'Pruebas de contrato y versionado: cambiar el núcleo sin romper a quien lo llama',
        summary: 'Detectar cambios incompatibles en CI con diffs de esquema y pruebas de contrato guiadas por el consumidor, versionar los contratos con semver y retirar versiones antiguas con cabeceras de deprecación y datos de uso reales.',
        threats: ['Cambios incompatibles', 'Consumidores desconocidos', 'Lanzamientos de golpe'],
        tags: ['Semver', 'Pact', 'oasdiff', 'Cabecera Deprecation', 'Cabecera Sunset', 'Contratos guiados por el consumidor'],
        readTime: 8,
        published: '2026-10-03',
    },

    // --- Edge Serverless ---
    {
        type: 'serverless-hub',
        slug: 'arquitectura-edge-serverless',
        title: 'Edge Serverless: ejecutar la lógica cerca del usuario',
        summary: 'Qué va en una función edge y qué va en el núcleo: enrutado, autenticación, caché y tareas programadas en el edge, con KV, D1 y R2 para el estado.',
        threats: ['Latencia alta', 'Mantenimiento de servidores', 'Picos de tráfico', 'Arranques en frío'],
        tags: ['Cloudflare Workers', 'KV', 'D1', 'R2', 'Cron Triggers', 'Cache API', 'Wrangler'],
        readTime: 7,
        published: '2026-10-03',
    },
    {
        type: 'functions',
        slug: 'funciones-edge-workers',
        title: 'Funciones edge: Workers como puerta de entrada de tu plataforma',
        summary: 'Cómo se ejecutan los Workers (isolates, no contenedores), qué implican sus límites para el diseño y cómo los service bindings dividen una plataforma en funciones pequeñas que se llaman entre sí sin pasar por internet.',
        threats: ['Arranques en frío', 'Mantenimiento de servidores', 'Picos de tráfico', 'Pasarelas monolíticas'],
        tags: ['Cloudflare Workers', 'V8 isolates', 'Service bindings', 'Smart Placement', 'Hono', 'wrangler.jsonc'],
        readTime: 8,
        published: '2026-10-04',
    },
    {
        type: 'routing',
        slug: 'enrutado-cache-autenticacion-edge',
        title: 'Enrutado, caché y autenticación en el edge: una pasarela para todos los clientes',
        summary: 'Convertir un Worker en un API gateway: enrutado por ruta y versión, verificación de JWT, límites por clave y reglas de caché, para que el núcleo solo reciba peticiones autenticadas, permitidas y que no estén ya en caché.',
        threats: ['Latencia alta', 'Tráfico no autenticado', 'Sobrecarga del origen', 'Proliferación de versiones'],
        tags: ['Pasarela de API', 'JWT', 'jose', 'Cache API', 'Binding de limitación de tasa', 'Nombres de host personalizados'],
        readTime: 8,
        published: '2026-10-04',
    },
    {
        type: 'storage',
        slug: 'almacenamiento-edge-kv-d1-r2',
        title: 'Almacenamiento edge: elegir entre KV, D1, R2 y Durable Objects',
        summary: 'Una guía de decisión para el estado en una plataforma serverless: qué garantiza cada almacén en consistencia, cuánto te cuesta en latencia y cuándo conviene mantener los datos en tu base de datos actual detrás de Hyperdrive.',
        threats: ['Datos desactualizados', 'Almacenamiento equivocado', 'Costes de salida (egress)', 'Límites de conexiones a la base de datos'],
        tags: ['KV', 'D1', 'R2', 'Durable Objects', 'Hyperdrive', 'API de S3', 'Consistencia'],
        readTime: 9,
        published: '2026-10-04',
    },
    {
        type: 'cron',
        slug: 'tareas-programadas-cron',
        title: 'Tareas programadas: sustituir el servidor de sincronización siempre encendido',
        summary: 'Pasar las sincronizaciones nocturnas, la generación de informes y la limpieza de una VM con crontab a Cron Triggers que reparten el trabajo en colas, con bloqueos, puntos de control y alertas cuando una ejecución no se produce.',
        threats: ['Mantenimiento de servidores', 'Tareas no ejecutadas', 'Ejecuciones solapadas', 'Dispersión de integraciones'],
        tags: ['Cron Triggers', 'scheduled()', 'Colas', 'Durable Objects', 'Puntos de control', 'UTC'],
        readTime: 7,
        published: '2026-10-04',
    },
    {
        type: 'observe',
        slug: 'logs-trazas-costes',
        title: 'Logs, trazas y costes: ver por dentro una plataforma serverless',
        summary: 'Seguir una petición desde el edge, a través de las colas, hasta el núcleo; conservar logs en los que se pueda buscar, y medir el tiempo de CPU y las peticiones por cliente para que la factura mensual no dé sorpresas.',
        threats: ['Fallos invisibles', 'Coste impredecible', 'Depuración lenta'],
        tags: ['Workers Logs', 'Tail Workers', 'Logpush', 'OpenTelemetry', 'ID de petición', 'Tiempo de CPU'],
        readTime: 8,
        published: '2026-10-04',
    },

    // --- Edge Serverless · expansion ---
    {
        type: 'realtime',
        slug: 'tiempo-real-websockets-durable-objects',
        title: 'Tiempo real en el edge: WebSockets y Durable Objects',
        summary: 'Paneles en vivo, chat y edición colaborativa sin servidor de sockets: un Durable Object por sala o documento coordina las conexiones, guarda el estado en SQLite e hiberna cuando nadie habla.',
        threats: ['Carga por sondeo', 'Actualizaciones perdidas', 'Condiciones de carrera', 'Coste de conexiones inactivas'],
        tags: ['Durable Objects', 'WebSockets', 'API de hibernación', 'Almacenamiento SQLite', 'Alarmas', 'Server-Sent Events'],
        readTime: 8,
        published: '2026-10-04',
    },
    {
        type: 'edge-ai',
        slug: 'ia-en-el-edge-workers-ai',
        title: 'IA en el edge: Workers AI, Vectorize y AI Gateway',
        summary: 'Dónde va la inferencia en una plataforma serverless: modelos pequeños y embeddings junto al usuario, modelos grandes detrás de un gateway que cachea, limita y registra cada llamada, y recuperación sobre tus propios datos con Vectorize.',
        threats: ['Latencia de inferencia', 'Coste de IA desbocado', 'Respuestas sin fundamento', 'Dependencia del proveedor'],
        tags: ['Workers AI', 'Vectorize', 'AI Gateway', 'RAG', 'Embeddings', 'Límites de uso'],
        readTime: 8,
        published: '2026-10-04',
    },
    {
        type: 'media',
        slug: 'imagenes-multimedia-edge',
        title: 'Imágenes y multimedia en el edge: R2, transformaciones y Stream',
        summary: 'Servir imágenes rápidas sin servidor de imágenes: originales en R2, redimensionadas y convertidas a AVIF o WebP bajo demanda, cacheadas en el edge, subidas directamente desde el navegador, y el vídeo delegado en Stream.',
        threats: ['Páginas lentas', 'Imágenes sobredimensionadas', 'Costes de salida (egress)', 'Cuellos de botella en subidas'],
        tags: ['R2', 'Transformaciones de imagen', 'AVIF / WebP', 'URLs prefirmadas', 'Stream', 'Reglas de caché'],
        readTime: 7,
        published: '2026-10-04',
    },
    {
        type: 'deploy',
        slug: 'desplegar-probar-lanzar-workers',
        title: 'Desplegar, probar y lanzar: publicar Workers sin miedo',
        summary: 'Un pipeline de publicación para funciones edge: ejecución local sobre el runtime real, tests con el pool de Vitest para Workers, entornos de staging y producción, despliegues graduales por porcentaje y rollback con un solo comando.',
        threats: ['Despliegues rotos', 'Deriva de configuración', 'Código edge sin pruebas', 'Reversiones lentas'],
        tags: ['Wrangler', 'Vitest', 'GitHub Actions', 'Entornos', 'Despliegues graduales', 'Reversión'],
        readTime: 8,
        published: '2026-10-04',
    },

    // --- Edge Serverless · crossovers: the platform offer ---
    {
        type: 'functions',
        crosses: ['routing', 'storage'],
        label: 'Funciones × PaaS de integración',
        slug: 'funciones-x-paas-integracion',
        title: 'Una plataforma de integración serverless: un conector por función',
        summary: 'Construir un PaaS de integración con funciones edge: un Worker por conector, credenciales en secretos, mapeos versionados en el código y un gateway compartido, de modo que añadir un sistema nuevo sea un despliegue, no un servidor.',
        threats: ['Dispersión de integraciones', 'Mantenimiento de servidores', 'Fugas de credenciales', 'Scripts punto a punto'],
        tags: ['PaaS de integración', 'Conectores', 'Service bindings', 'Secretos', 'Webhooks', 'Mapeos como código', 'Pasarela de API', 'KV', 'D1'],
        readTime: 8,
        published: '2026-10-04',
    },
    {
        type: 'routing',
        crosses: ['functions', 'storage'],
        label: 'Edge × IaaS (híbrido)',
        slug: 'edge-x-iaas-hibrido',
        title: 'Serverless delante de IaaS: modernizar sin reescribir',
        summary: 'Poner funciones edge delante de las VMs y bases de datos existentes, llegar a ellas de forma privada con Tunnel e Hyperdrive, y sacar rutas de los servidores una a una hasta que los servidores sean pequeños o desaparezcan.',
        threats: ['Servidores heredados', 'IP de origen expuesta', 'Migraciones de golpe', 'Límites de conexiones a la base de datos'],
        tags: ['IaaS', 'Patrón estrangulador', 'Cloudflare Tunnel', 'Hyperdrive', 'Nube híbrida', 'Migración ruta a ruta', 'Pasarela de API', 'Cloudflare Workers'],
        readTime: 8,
        published: '2026-10-04',
    },
    {
        type: 'observe',
        crosses: ['routing', 'storage'],
        label: 'Medición × SaaS multiinquilino',
        slug: 'medicion-x-saas-multiinquilino',
        title: 'SaaS multiinquilino en serverless: aislamiento, medición y facturación',
        summary: 'Operar una sola plataforma serverless para muchos clientes: resolución del inquilino en el edge, almacenamiento aislado por inquilino, límites por inquilino y medición de uso con Analytics Engine que alimenta directamente las facturas.',
        threats: ['Aislamiento de inquilinos', 'Facturación por uso', 'Vecinos ruidosos', 'Coste impredecible'],
        tags: ['Multiinquilino', 'Analytics Engine', 'Workers for Platforms', 'Nombres de host personalizados', 'Precios por uso', 'D1 por inquilino', 'D1'],
        readTime: 8,
        published: '2026-10-04',
    },

    // --- Workflow Automation ---
    {
        type: 'workflows-hub',
        slug: 'automatizacion-serverless-flujos',
        title: 'Conectar flujos de trabajo con lógica serverless',
        summary: 'Convertir pasos manuales (un formulario, una actualización del CRM, una factura, un email) en un flujo automatizado de webhooks, colas y pasos duraderos que resiste reintentos y caídas.',
        threats: ['Introducción manual de datos', 'Webhooks perdidos', 'Procesamiento duplicado', 'Caídas de terceros'],
        tags: ['Webhooks', 'Colas', 'Workflows', 'Claves de idempotencia', 'Reintentos', 'Cola de mensajes fallidos', 'HMAC'],
        readTime: 7,
        published: '2026-10-03',
    },
];

const seriesById = (id) => SERIES.find(s => s.id === id);
const typeById = (id) => ACADEMIA_TYPES.find(t => t.id === id);
const typeOf = (post) => typeById(post.type);
// The URL of every entry comes from its series and slug: /blog/ciberseguridad/<series>/<slug>/
const CIBER_BASE = '/blog/ciberseguridad/';
ACADEMIA_POSTS.forEach(p => { p.path = `${CIBER_BASE}${typeOf(p).series}/${p.slug}/`; });
const seriesOf = (post) => seriesById(typeOf(post).series);
const typesOfPost = (post) => [post.type, ...(post.crosses || [])];
const isCross = (post) => Boolean(post.crosses && post.crosses.length);
const postLabel = (post) => post.label || typeOf(post).label;
const stepLabel = (t) => `${seriesById(t.series).step} ${String(t.layer).padStart(2, '0')}`;
const formatDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
// Series order: by step, primary post before crossovers that share its step.
const byStep = (a, b) => (typeOf(a).layer - typeOf(b).layer) || (isCross(a) - isCross(b));

const linkClass = 'text-blue-600 font-bold hover:underline';

// --- FLOW DIAGRAM ---
// (The data block for tools/generar-blog.mjs ends at the marker above.)

// A native dropdown: the phone opens its own picker, desktop gets a compact select.
const FiltroSelect = ({ label, value, onChange, options }) => (
    <label className="block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1.5">{label}</span>
        <span className="relative block">
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className={`w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border bg-white text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors ${value !== 'all' && value !== 'layer' ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'}`}>
                {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
        </span>
    </label>
);

// The steps of a series as a dropdown menu (<details>): closed it names the current step, open it lists every step in order.
const StepsMenu = ({ series, active }) => {
    const s = seriesById(series);
    const activeIds = [].concat(active);
    const types = ACADEMIA_TYPES.filter(t => t.series === series);
    const current = types.find(t => activeIds.includes(t.id));
    return (
        <details className="group rounded-[1.5rem] border border-gray-100 bg-white/95 shadow-lg shadow-gray-200/40 open:shadow-xl">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 px-5 md:px-6 py-4">
                <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">{s.flowLabel} · {types.length} {s.typesLabel.toLowerCase()}</span>
                    <span className="block font-black text-gray-900 truncate">{current ? `${stepLabel(current)} · ${current.label}` : s.typesLabel}</span>
                </span>
                <span aria-hidden="true" className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-open:rotate-180">▾</span>
            </summary>
            <ol className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {types.map(t => {
                    const on = activeIds.includes(t.id);
                    return (
                        <li key={t.id}>
                            <a href={`${CIBER_BASE}?type=${t.id}`} aria-current={on ? 'step' : undefined}
                                className={`flex items-baseline gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${on ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
                                <span className={`text-[10px] uppercase tracking-[0.15em] flex-shrink-0 ${on ? 'text-blue-100' : 'text-blue-500'}`}>{stepLabel(t)}</span>
                                <span>{t.label}</span>
                            </a>
                        </li>
                    );
                })}
            </ol>
        </details>
    );
};

// --- DASHBOARD ---
const readParams = () => {
    const p = new URLSearchParams(window.location.search);
    const type = p.get('type') || 'all';
    const t = typeById(type);
    return {
        series: p.get('series') || (t ? t.series : 'all'),
        q: p.get('q') || '',
        type,
        zone: p.get('zone') || 'all',
        kind: p.get('kind') || 'all',
        threats: (p.get('threats') || '').split(',').filter(Boolean),
        sort: p.get('sort') || 'layer',
    };
};

const writeParams = (f) => {
    const p = new URLSearchParams();
    if (f.series !== 'all') p.set('series', f.series);
    if (f.q) p.set('q', f.q);
    if (f.type !== 'all') p.set('type', f.type);
    if (f.zone !== 'all') p.set('zone', f.zone);
    if (f.kind !== 'all') p.set('kind', f.kind);
    if (f.threats.length) p.set('threats', f.threats.join(','));
    if (f.sort !== 'layer') p.set('sort', f.sort);
    const qs = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
};

const KINDS = [
    { id: 'deep', label: 'A fondo', test: (p) => !isCross(p) },
    { id: 'cross', label: 'Cruces', test: isCross },
];

const Chip = ({ active, onClick, children, count }) => (
    <button
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${active
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600'}`}
    >
        {children}
        {count !== undefined && (
            <span className={`px-1.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
        )}
    </button>
);

const CrossBadges = ({ post }) => isCross(post) ? (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Cruza</span>
        {post.crosses.map(id => (
            <span key={id} className="px-2.5 py-1 rounded-full border border-blue-200 text-blue-600 text-[10px] font-bold">× {typeById(id).short}</span>
        ))}
    </div>
) : null;

const PostCard = ({ post }) => {
    const t = typeOf(post);
    return (
        <a
            href={post.path}
            className="group flex flex-col p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
        >
            <div className="flex items-center justify-between gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">{isCross(post) ? 'Cruce' : stepLabel(t)}</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">{t.short}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 flex-1">{post.summary}</p>
            <CrossBadges post={post} />
            <div className="flex flex-wrap gap-1.5 mb-6">
                {post.threats.map(th => (
                    <span key={th} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{th}</span>
                ))}
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>{formatDate(post.published)} · {post.readTime} min de lectura</span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">Leer →</span>
            </div>
        </a>
    );
};

// --- CAPAS (Blog · Ciberseguridad) ---
const SORTED_SERIES = [...SERIES].sort((a, b) => a.capa - b.capa);
const capaLabel = (s) => `Capa ${String(s.capa).padStart(2, '0')}`;

const BlogBreadcrumb = ({ items }) => (
    <nav aria-label="Ruta" className="pt-10 relative z-10 text-center">
        <ol className="inline-flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            {items.map(([label, href], i) => (
                <li key={label} className="flex items-center gap-2">
                    {i ? <span aria-hidden="true">/</span> : null}
                    {href ? <a href={href} className="hover:text-blue-600 transition-colors">{label}</a> : <span className="text-blue-600">{label}</span>}
                </li>
            ))}
        </ol>
    </nav>
);

// "Todas las capas" first, then one chip per capa in perimeter → inside order.
const CapaNav = ({ active, onSelect }) => (
    <>
        <BlogBreadcrumb items={[['Blog', '/blog/'], ['Ciberseguridad', active === 'all' ? null : CIBER_BASE]]} />
        <div className="md:hidden pt-6 relative z-10">
            <FiltroSelect label="Capa" value={active} onChange={onSelect}
                options={[['all', `Todas las capas (${ACADEMIA_POSTS.length})`], ...SORTED_SERIES.map(x => [x.id, `${capaLabel(x)} · ${x.label} (${ACADEMIA_POSTS.filter(p => typeOf(p).series === x.id).length})`])]} />
        </div>
        <nav className="hidden md:flex pt-6 flex-wrap justify-center gap-2 relative z-10" aria-label="Capas de ciberseguridad">
            <Chip active={active === 'all'} onClick={() => onSelect('all')} count={ACADEMIA_POSTS.length}>Todas las capas</Chip>
            {SORTED_SERIES.map(x => (
                <Chip key={x.id} active={x.id === active} onClick={() => onSelect(x.id)}
                    count={ACADEMIA_POSTS.filter(p => typeOf(p).series === x.id).length}>
                    {x.capa} · {x.label}
                </Chip>
            ))}
        </nav>
    </>
);

const CapasOverview = ({ q, setQ, onSelect }) => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const match = (post) => !words.length || words.every(w => [post.title, post.summary, ...post.tags, ...post.threats, seriesOf(post).label].join(' ').toLowerCase().includes(w));
    const total = ACADEMIA_POSTS.filter(match).length;
    return (
        <>
            <CapaNav active="all" onSelect={onSelect} />

            <section className="pt-8 md:pt-12 pb-8 md:pb-12 text-center relative z-10 animate-fade-in">
                <div className="inline-block mb-6 md:mb-8 px-4 md:px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.25em] md:tracking-[0.5em] uppercase bg-blue-50/50">
                    Ciberseguridad · Todas las capas
                </div>
                <h1 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter mb-6 md:mb-8 leading-[0.95]">
                    Seguridad por capas,<br/><span className="text-blue-600">del perímetro al núcleo</span>
                </h1>
                <p className="text-base md:text-xl text-gray-500 max-w-3xl mx-auto font-medium">
                    Cinco capas, {ACADEMIA_POSTS.length} artículos. Cada capa protege lo que la anterior deja pasar: primero el perímetro de la API,
                    después el edge, las integraciones, el núcleo de negocio y, por último, lo que el sistema expone al mundo.
                </p>
            </section>

            {/* All capas first */}
            <section className="max-w-5xl mx-auto mb-16 relative z-10" aria-labelledby="capas-title">
                <h2 id="capas-title" className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">Todas las capas · de fuera hacia dentro</h2>
                <ol className="space-y-3">
                    {SORTED_SERIES.map(x => {
                        const n = ACADEMIA_POSTS.filter(p => typeOf(p).series === x.id).length;
                        const steps = ACADEMIA_TYPES.filter(t => t.series === x.id);
                        return (
                            <li key={x.id} className="md:[margin-inline:var(--sangria)]" style={{ '--sangria': `${(x.capa - 1) * 2}%` }}>
                                <button onClick={() => onSelect(x.id)}
                                    className="group w-full text-left p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40 hover:border-blue-500 transition-all">
                                    <div className="flex items-start gap-4 md:gap-5">
                                        <span className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-blue-100">Capa</span>
                                            <span className="text-xl font-black leading-none">{x.capa}</span>
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500 mb-1">{x.capaShort}<span className="sm:hidden"> · {n} artículos</span></p>
                                            <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{x.label}</h3>
                                            <p className="text-sm text-gray-500 font-medium mt-1 mb-3">{x.capaRole}</p>
                                            <div className="hidden md:flex flex-wrap gap-1.5">
                                                {steps.map(t => <span key={t.id} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{t.short}</span>)}
                                            </div>
                                        </div>
                                        <span className="hidden sm:inline text-xs font-bold text-gray-400 whitespace-nowrap self-center">{n} artículos <span className="text-blue-600 group-hover:translate-x-1 inline-block transition-transform">→</span></span>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </section>

            {/* Then every article, grouped by capa */}
            <section className="max-w-7xl mx-auto pb-24 relative z-20" aria-labelledby="todas-title">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <h2 id="todas-title" className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Todos los artículos por capa</h2>
                    <div className="w-full md:w-80">
                        <label htmlFor="ciber-search" className="sr-only">Buscar en ciberseguridad</label>
                        <input id="ciber-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: DDoS, webhooks, JSON-LD…"
                            className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                        <p className="mt-2 text-xs font-bold text-gray-400" aria-live="polite">{total} {total === 1 ? 'artículo' : 'artículos'}</p>
                    </div>
                </div>
                {SORTED_SERIES.map(x => {
                    const list = ACADEMIA_POSTS.filter(p => typeOf(p).series === x.id && match(p)).sort(byStep);
                    if (!list.length) return null;
                    return (
                        <div key={x.id} className="mb-16">
                            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 pb-3 border-b border-gray-200">
                                <h3 className="text-2xl font-black text-gray-900"><span className="text-blue-600">{capaLabel(x)}</span> · {x.label}</h3>
                                <button onClick={() => onSelect(x.id)} className={linkClass + ' text-sm'}>Filtrar esta capa →</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {list.map(post => <PostCard key={post.path} post={post} />)}
                            </div>
                        </div>
                    );
                })}
                {!total ? (
                    <div className="p-16 rounded-[2rem] border border-dashed border-gray-300 text-center">
                        <p className="text-lg font-black text-gray-900 mb-2">Ningún artículo coincide</p>
                        <button onClick={() => setQ('')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full">Borrar búsqueda</button>
                    </div>
                ) : null}
            </section>

            <RegisterCTA title="¿Quieres blindar tu plataforma capa por capa?" text="Auditamos y desplegamos defensas del perímetro al núcleo para APIs, edge e integraciones." />
        </>
    );
};

const AcademiaDashboard = () => {
    const [filters, setFilters] = useState(readParams);
    const set = (patch) => setFilters(f => ({ ...f, ...patch }));
    const [openFilters, setOpenFilters] = useState(false);

    useEffect(() => writeParams(filters), [filters]);

    const switchSeries = (series) => setFilters(f => ({ ...f, series, q: '', type: 'all', zone: 'all', kind: 'all', threats: [] }));
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [filters.series]);

    // Default view: every capa first, then the entries grouped by capa.
    if (!seriesById(filters.series)) {
        return <CapasOverview q={filters.q} setQ={(q) => set({ q })} onSelect={switchSeries} />;
    }

    const s = seriesById(filters.series);
    const types = ACADEMIA_TYPES.filter(t => t.series === s.id);
    const zones = ZONES.filter(z => z.series === s.id);
    const posts = ACADEMIA_POSTS.filter(p => typeOf(p).series === s.id);
    const allThreats = [...new Set(posts.flatMap(p => p.threats))].sort();

    const matchesQuery = (post) => {
        const q = filters.q.trim().toLowerCase();
        if (!q) return true;
        const haystack = [post.title, post.summary, ...typesOfPost(post).map(id => typeById(id).label), ...post.tags, ...post.threats].join(' ').toLowerCase();
        return q.split(/\s+/).every(word => haystack.includes(word));
    };

    // Every filter except the one being counted, so chip counts show what clicking would yield.
    // A crossover matches the type and zone of every type it covers.
    const passes = (post, skip) =>
        matchesQuery(post) &&
        (skip === 'type' || filters.type === 'all' || typesOfPost(post).includes(filters.type)) &&
        (skip === 'zone' || filters.zone === 'all' || typesOfPost(post).some(id => typeById(id).zone === filters.zone)) &&
        (skip === 'kind' || filters.kind === 'all' || KINDS.find(k => k.id === filters.kind).test(post)) &&
        (skip === 'threats' || filters.threats.every(th => post.threats.includes(th)));

    const results = posts.filter(p => passes(p)).sort((a, b) => {
        if (filters.sort === 'title') return a.title.localeCompare(b.title);
        if (filters.sort === 'read') return a.readTime - b.readTime;
        return byStep(a, b);
    });

    const hasFilters = filters.q || filters.type !== 'all' || filters.zone !== 'all' || filters.kind !== 'all' || filters.threats.length;
    const reset = () => setFilters(f => ({ ...f, q: '', type: 'all', zone: 'all', kind: 'all', threats: [] }));
    const crossCount = posts.filter(isCross).length;
    const activeCount = [filters.type !== 'all', filters.zone !== 'all', filters.kind !== 'all', filters.threats.length > 0].filter(Boolean).length;

    return (
        <>
            <CapaNav active={s.id} onSelect={switchSeries} />

            {/* Hero */}
            <section className="pt-8 md:pt-12 pb-8 md:pb-12 text-center relative z-10">
                <div className="animate-fade-in" key={s.id}>
                    <div className="inline-block mb-6 md:mb-8 px-4 md:px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.25em] md:tracking-[0.5em] uppercase bg-blue-50/50">
                        {capaLabel(s)} · {s.label}
                    </div>
                    <h1 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter mb-6 md:mb-8 leading-[0.95]">
                        {s.title}<br/><span className="text-blue-600">{s.accent}</span>
                    </h1>
                    <p className="text-base md:text-xl text-gray-500 max-w-3xl mx-auto font-medium">{s.intro}</p>
                </div>
            </section>

            {/* Filters: every facet is a dropdown. Phones: folded behind «Filtros»; desktop: one row. */}
            <section className="max-w-7xl mx-auto mb-10 relative z-20" aria-label="Buscar y filtrar">
                <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl shadow-gray-200/40">
                    <div className="flex gap-3">
                        <label htmlFor="academia-search" className="sr-only">Buscar</label>
                        <input
                            id="academia-search"
                            type="search"
                            value={filters.q}
                            onChange={(e) => set({ q: e.target.value })}
                            placeholder={`Buscar · ${s.placeholder}`}
                            className="flex-1 min-w-0 px-4 md:px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button onClick={() => setOpenFilters(o => !o)} aria-expanded={openFilters} aria-controls="academia-filtros"
                            className="md:hidden flex-shrink-0 inline-flex items-center gap-2 px-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700">
                            Filtros{activeCount ? <span className="px-1.5 rounded-full bg-blue-600 text-white text-[10px]">{activeCount}</span> : null}
                            <span aria-hidden="true" className={`transition-transform ${openFilters ? 'rotate-180' : ''}`}>▾</span>
                        </button>
                    </div>

                    <div id="academia-filtros" className={`${openFilters ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 ${crossCount ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-3 mt-4`}>
                        <FiltroSelect label={s.typesLabel} value={filters.type} onChange={(type) => set({ type })}
                            options={[['all', `Cualquier ${s.step.toLowerCase()}`], ...types.map(t => [t.id, `${stepLabel(t)} · ${t.short} (${posts.filter(p => typesOfPost(p).includes(t.id) && passes(p, 'type')).length})`])]} />
                        <FiltroSelect label="Zona" value={filters.zone} onChange={(zone) => set({ zone })}
                            options={[['all', 'Todas las zonas'], ...zones.map(z => [z.id, `${z.label} (${posts.filter(p => typesOfPost(p).some(id => typeById(id).zone === z.id) && passes(p, 'zone')).length})`])]} />
                        {crossCount ? (
                            <FiltroSelect label="Formato" value={filters.kind} onChange={(kind) => set({ kind })}
                                options={[['all', 'Todos los formatos'], ...KINDS.map(k => [k.id, `${k.label} (${posts.filter(p => k.test(p) && passes(p, 'kind')).length})`])]} />
                        ) : null}
                        <FiltroSelect label={s.facet} value={filters.threats[0] || 'all'} onChange={(th) => set({ threats: th === 'all' ? [] : [th] })}
                            options={[['all', `Cualquier ${s.facet.toLowerCase()}`], ...allThreats.map(th => [th, `${th} (${posts.filter(p => p.threats.includes(th) && passes(p, 'threats')).length})`])]} />
                        <FiltroSelect label="Ordenar" value={filters.sort} onChange={(sort) => set({ sort })}
                            options={[['layer', `Por ${s.step.toLowerCase()}`], ['title', 'Título A–Z'], ['read', 'Lectura más corta']]} />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-5 px-1">
                    <p className="text-sm font-bold text-gray-500" aria-live="polite">{results.length} {results.length === 1 ? 'artículo' : 'artículos'}</p>
                    {hasFilters ? <button onClick={reset} className={linkClass + ' text-sm'}>Borrar filtros</button> : null}
                </div>
            </section>

            {/* Results */}
            <section className="max-w-7xl mx-auto pb-24 relative z-10" aria-labelledby="entradas-title">
                <h2 id="entradas-title" className="sr-only">Artículos de la capa</h2>
                {results.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {results.map(post => <PostCard key={post.path} post={post} />)}
                    </div>
                ) : (
                    <div className="p-10 md:p-16 rounded-[2rem] border border-dashed border-gray-300 text-center">
                        <p className="text-lg font-black text-gray-900 mb-2">Ningún artículo coincide con estos filtros</p>
                        <p className="text-sm text-gray-500 font-medium mb-6">Prueba a quitar un filtro o a borrar la búsqueda.</p>
                        <button onClick={reset} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all">Borrar filtros</button>
                    </div>
                )}
            </section>
        </>
    );
};

// --- ARTICLE BUILDING BLOCKS (used inside each post) ---
// Plain-text headings get an id, so sections can be linked to (and indexed) as /post/#section.
const slugify = (text) => typeof text === 'string' ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : undefined;
const H2 = ({ children }) => <h2 id={slugify(children)} className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-14 mb-5 scroll-mt-40">{children}</h2>;
const H3 = ({ children }) => <h3 className="text-xl font-black text-gray-900 tracking-tight mt-10 mb-4">{children}</h3>;
const P = ({ children }) => <p className="text-lg text-gray-600 leading-relaxed mb-5">{children}</p>;
const A = ({ href, children }) => <a href={href} className={linkClass}>{children}</a>;
const UL = ({ items }) => (
    <ul className="space-y-3 mb-6">
        {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-lg text-gray-600 leading-relaxed">
                <span className="mt-2.5 w-1.5 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span>{item}</span>
            </li>
        ))}
    </ul>
);
const Code = ({ children }) => <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[0.9em] font-semibold">{children}</code>;
const CodeBlock = ({ title, children }) => (
    <div className="my-8 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        {title && <div className="px-5 py-3 border-b border-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{title}</div>}
        <pre className="p-5 text-sm text-slate-200 overflow-x-auto leading-relaxed"><code>{children}</code></pre>
    </div>
);
const Callout = ({ title, children }) => (
    <div className="my-8 flex gap-4 p-6 rounded-2xl bg-blue-50 border border-blue-100">
        <span className="w-1 rounded-full bg-blue-500 flex-shrink-0"></span>
        <div>
            {title && <p className="font-black text-blue-900 mb-1">{title}</p>}
            <div className="text-blue-900/80 font-medium leading-relaxed">{children}</div>
        </div>
    </div>
);
// columns: [{ key, label, mono?, accent? }]; rows: objects with those keys.
const Table = ({ columns, rows }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                <tr>{columns.map(c => <th key={c.key} className="p-4 font-bold">{c.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                    <tr key={i}>
                        {columns.map(c => (
                            <td key={c.key} className={`p-4 ${c.mono ? 'font-mono text-xs font-bold text-gray-900 whitespace-nowrap' : c.accent ? 'font-bold text-blue-600 whitespace-nowrap' : 'text-gray-500 font-medium'}`}>{r[c.key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- ARTICLE TEMPLATE ---
const AcademiaPostLayout = ({ path, controls, children }) => {
    const post = ACADEMIA_POSTS.find(p => p.path === path);
    const t = typeOf(post);
    const s = seriesOf(post);
    const ordered = ACADEMIA_POSTS.filter(p => typeOf(p).series === s.id).sort(byStep);
    const i = ordered.indexOf(post);
    const prev = ordered[i - 1];
    const next = ordered[i + 1];
    // Same-series posts that share at least one type with this one: the crossovers.
    const related = ordered.filter(p => p !== post && typesOfPost(p).some(id => typesOfPost(post).includes(id)));

    useEffect(() => { document.title = `${postLabel(post)} - Blog Lameyer`; }, []);

    const NavCard = ({ p, dir }) => p ? (
        <a href={p.path} className={`group flex-1 p-6 rounded-[2rem] border border-gray-100 bg-white/90 shadow-lg shadow-gray-200/40 hover:border-blue-500 transition-all ${dir === 'next' ? 'text-right' : ''}`}>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 mb-2">
                {dir === 'next'
                    ? `Siguiente · ${isCross(p) ? 'Cruce' : stepLabel(typeOf(p))} →`
                    : `← Anterior · ${isCross(p) ? 'Cruce' : stepLabel(typeOf(p))}`}
            </span>
            <span className="block font-black text-gray-900 group-hover:text-blue-600 transition-colors">{postLabel(p)}</span>
        </a>
    ) : <div className="flex-1 hidden md:block"></div>;

    return (
        <>
            <header className="max-w-4xl mx-auto pt-10 md:pt-16 pb-8 md:pb-10 relative z-10 animate-fade-in">
                <a href={`${CIBER_BASE}?series=${s.id}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors mb-10">
                    ← Ciberseguridad · Capa {s.capa} · {s.label}
                </a>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.3em] uppercase bg-blue-50/50">{isCross(post) ? 'Cruce' : stepLabel(t)}</span>
                    {typesOfPost(post).map((id, n) => (
                        <a key={id} href={`${CIBER_BASE}?type=${id}`} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${n === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-blue-200 text-blue-600 hover:border-blue-500'}`}>
                            {n === 0 ? '' : '× '}{typeById(id).label}
                        </a>
                    ))}
                </div>
                <h1 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-6">{post.title}</h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed mb-6">{post.summary}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    <time dateTime={post.published}>{formatDate(post.published)}</time> · {post.readTime} min de lectura
                </p>
            </header>

            <section className="max-w-6xl mx-auto mb-8 relative z-30">
                <StepsMenu series={s.id} active={typesOfPost(post)} />
            </section>

            <section className="max-w-6xl mx-auto pb-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 relative z-20">
                <article className="p-8 md:p-12 rounded-[2.5rem] bg-white/95 border border-gray-100 shadow-xl shadow-gray-200/40 [&>*:first-child]:mt-0">
                    {children}
                </article>

                <aside className="lg:sticky lg:top-40 self-start space-y-6">
                    <div className="p-6 rounded-[2rem] bg-slate-900 text-white">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">{s.verb}</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.threats.map(th => (
                                <a key={th} href={`${CIBER_BASE}?series=${s.id}&threats=${encodeURIComponent(th)}`} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-300 transition-colors">{th}</a>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/95 border border-gray-100 shadow-lg shadow-gray-200/40">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Lista de control</h3>
                        <ul className="space-y-3">
                            {controls.map(c => (
                                <li key={c} className="flex gap-3 text-sm font-semibold text-gray-700 leading-snug">
                                    <span className="text-blue-600">✓</span>{c}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {related.length ? (
                        <div className="p-6 rounded-[2rem] bg-white/95 border border-gray-100 shadow-lg shadow-gray-200/40">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{isCross(post) ? 'Tratado a fondo' : 'Cruces'}</h3>
                            <ul className="space-y-3">
                                {related.map(p => (
                                    <li key={p.path}>
                                        <a href={p.path} className="group block text-sm font-bold text-gray-700 hover:text-blue-600 leading-snug transition-colors">
                                            <span className="block text-[10px] uppercase tracking-[0.2em] text-blue-500 mb-0.5">{isCross(p) ? 'Cruce' : stepLabel(typeOf(p))}</span>
                                            {postLabel(p)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </aside>
            </section>

            <nav className="max-w-6xl mx-auto pb-8 relative z-20" aria-label={`Más ${s.typesLabel.toLowerCase()}`}>
                <ul className="flex flex-col md:flex-row gap-6">
                    <li className="flex-1 flex"><NavCard p={prev} dir="prev" /></li>
                    <li className="flex-1 flex"><NavCard p={next} dir="next" /></li>
                </ul>
            </nav>

            <RegisterCTA title={s.cta.title} text={s.cta.text} />
        </>
    );
};

// Each entry page calls renderPost(CONTROLS, Content); the entry is found from the page URL.
const currentPath = () => window.location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');

const renderPost = (controls, Content) => {
    const path = currentPath();
    if (!ACADEMIA_POSTS.some(p => p.path === path)) {
        return renderPage(() => (
            <section className="max-w-3xl mx-auto py-32 text-center relative z-10">
                <h1 className="text-3xl font-black text-gray-900 mb-4">Esta entrada aún no está en ACADEMIA_POSTS</h1>
                <p className="text-gray-500 font-medium">Añade un objeto con <Code>{`slug: '${path.split('/').slice(-2, -1)[0]}'`}</Code> a ACADEMIA_POSTS en /js/academia.jsx.</p>
            </section>
        ));
    }
    renderPage(() => (
        <AcademiaPostLayout path={path} controls={controls}>
            <Content />
        </AcademiaPostLayout>
    ));
};
