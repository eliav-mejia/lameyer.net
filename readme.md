LaMeyer.net
/* Sitio Web */

## Bienvenido a Lameyer.net

Lameyer.net es el punto de encuentro entre Lameyer y quienes construyen software. Somos una empresa global que trabaja con
total transparencia, y queremos que cada desarrollador que llegue aquí se sienta acompañado por un socio de confianza: alguien
que explica lo que hace, cómo lo hace y por qué.

Por eso publicamos nuestra documentación en este mismo sitio. Cada versión deja constancia de lo que cambió, de las decisiones
que tomamos y de lo que aún está pendiente, para que puedas ver cómo hemos crecido a tu lado. No eres un visitante: formas parte
activa de este proyecto, y lo que construimos responde a lo que tú necesitas.

En Lameyer.net puedes:

- **Encontrar la mejor oferta en componentes.** La [tienda](https://lameyer.net/pages/components/) reúne componentes del PC, redes,
  equipo básico y herramientas, con precios en euros o pesos mexicanos según tu país, devolución en 30 días y garantía de 3 años.
- **Aprender a diseñar, programar, desplegar y mantener tu propio software.** El [blog](https://lameyer.net/blog/) recorre paso a
  paso cinco series: Modular Core, Serverless Edge, automatización de flujos, seguridad de APIs y búsqueda de código y visibilidad.
- **Construir con el respaldo de la infraestructura de Lameyer.** En [Desarrollo](https://lameyer.net/pages/development/) y
  [Stack](https://lameyer.net/pages/stack/) te contamos con qué trabajamos y cómo podemos acompañar tu proyecto, y en
  [Comunidad](https://lameyer.net/pages/community/) encontrarás código abierto, talleres y formas de colaborar.
- **Comprar con reglas claras.** Los [términos y condiciones](https://lameyer.net/pages/terminos/) se muestran según tu región,
  España o México.

Documentación publicada, versión a versión:

| Versión | Contenido | Documento |
|---------|-----------|-----------|
| 1.0.1 | Widget de chat de WhatsApp | [PDF](https://lameyer.net/_docs/Lameyer-v1.0.1.pdf) |
| 1.0.2 | Tienda de componentes y términos | [PDF](https://lameyer.net/_docs/Lameyer-v1.0.2.pdf) |
| 1.0.3 | Fotos de producto | [PDF](https://lameyer.net/_docs/Lameyer-v1.0.3.pdf) |
| 1.0.5 | Versión consolidada: blog, tienda, España y México, sitio en español, términos por región | [PDF](https://lameyer.net/_docs/Lameyer-v1.0.5.pdf) |
| 1.0.6 | Medidas de seguridad (borrador en curso) | [PDF](https://lameyer.net/_docs/Lameyer-v1.0.6.pdf) |

Estamos construyendo para ti. Si tienes una idea, una duda o quieres colaborar, escríbenos a contacto@lameyer.net.

---

## Notas técnicas

Sitio estático en GitHub Pages (dominio propio `lameyer.net`; DNS en Namecheap, todavía **sin** proxy de Cloudflare: ver 1.0.6).
Sin paso de build: las páginas usan Tailwind, React y Babel desde CDNs.

## Estructura de carpetas

Cada página es una carpeta con un `index.html`, así las URLs quedan limpias (`/pages/stack/`, `/blog/security/rate-limiting/`)
y todas las páginas se añaden igual: copiar una carpeta y editarla.

```
lameyer.net/
├── CNAME                         dominio propio para GitHub Pages
├── .nojekyll                     vacío: GitHub Pages sirve el repositorio tal cual (sin él, Jekyll ocultaría _docs/)
├── readme.md                     este archivo
├── index.html                    página de inicio (/)
├── 404.html                      página no encontrada; redirige las URLs antiguas del blog
│
├── css/
│   └── site.css                  UNA hoja de estilos para todo el sitio
│
├── js/
│   ├── layout.jsx                compartido por TODAS las páginas: cabecera, banderas (país y divisa), pie,
│   │                             formulario de contacto, PageHero, RegisterCTA, stack tecnológico, renderPage()
│   ├── blog.jsx                  solo blog: SERIES, BLOG_TYPES, BLOG_POSTS, panel, plantilla de artículo
│   └── tienda.jsx                solo tienda: SELLER, RETURN_ADDRESSES, CURRENCIES, capa de datos (db, useCatalog),
│                                 carrito, ProductCard, ProductPage, renderProduct()
│
├── public/
│   └── db/                       BASE DE DATOS SIMULADA (prelanzamiento, editada a mano) — ver public/db/README.md
│       ├── categorias.json       grupos de categorías + categorías
│       └── productos.json        productos: precio, stock, especificaciones, compatibilidad, imagen + crédito
│
├── img/
│   └── productos/                fotos de producto <id-producto>-400.webp / -800.webp
│
├── tools/
│   ├── generar-paginas-producto.py   crea pages/components/<slug>/ a partir de public/db/productos.json
│   └── i18n/deepl-prefill.mjs        pre-traduce con DeepL las claves que faltan (PENDIENTE: aún no hay locales/)
│
├── _docs/                        documentos de versión (PDF) y su fuente HTML en _docs/src/: v1.0.1–v1.0.5, v1.0.6 (en curso)
│
├── pages/                        una carpeta por sección, servida en /pages/<nombre>/
│   ├── development/index.html    /pages/development/  (formulario de contacto -> Google Sheets)
│   ├── components/index.html     /pages/components/  tienda: filtros, búsqueda, carrito -> WhatsApp
│   ├── components/<slug>/        /pages/components/<slug>/  una página por producto (generada)
│   ├── terminos/index.html       /pages/terminos/    términos y condiciones por región, España / México (enlazados en el pie)
│   ├── community/index.html      /pages/community/
│   └── stack/index.html          /pages/stack/
│
└── blog/
    ├── index.html                /blog/  panel de filtros (?series=core, ?series=security, ...)
    │
    ├── core/                     Modular Core
    │   ├── modular-core-architecture/        visión general
    │   ├── domain-modules-boundaries/
    │   ├── contracts-typed-apis/
    │   ├── shared-packages-workspaces/
    │   ├── data-ownership-migrations/
    │   └── contract-testing-versioning/
    ├── serverless/               Serverless Edge
    │   ├── serverless-edge-architecture/     visión general
    │   ├── edge-functions-workers/
    │   ├── routing-caching-auth-edge/
    │   ├── edge-storage-kv-d1-r2/
    │   ├── scheduled-jobs-cron-triggers/
    │   ├── logs-tracing-cost/
    │   ├── realtime-websockets-durable-objects/   paso 06 · Tiempo real
    │   ├── ai-at-the-edge-workers-ai/             paso 07 · IA en el edge
    │   ├── images-media-at-the-edge/              paso 08 · Multimedia
    │   ├── deploy-test-rollout-workers/           paso 09 · Despliegue
    │   ├── serverless-integration-paas/      cruce
    │   ├── serverless-in-front-of-iaas/      cruce
    │   └── multi-tenant-saas-metering/       cruce
    ├── workflows/                Automatización de flujos
    │   └── serverless-workflow-automation/
    ├── security/                 Seguridad de APIs
    │   ├── edge-layer-ddos-dns/
    │   ├── waf-bot-layer-layer-7/
    │   ├── api-endpoint-protection/
    │   ├── rate-limiting/
    │   └── cloudflare-tunnel/
    └── search/                   Búsqueda de código y visibilidad
        ├── code-search-repository-organization/
        ├── semantic-vector-search/
        ├── search-as-code-sac/
        ├── benchmark-curation-reap-harvest/
        ├── ssr-static-generation/
        ├── semantic-html-markup/
        ├── core-web-vitals-page-speed/
        ├── crawlability-indexing/
        ├── structured-data/
        ├── benchmarks-x-search-as-code/          cruce
        ├── static-generation-x-vector-search/    cruce
        ├── structured-data-x-repositories/       cruce
        ├── core-web-vitals-x-site-search/        cruce
        └── crawlability-x-faceted-search/        cruce
```

Reglas de nombres (mantienen todo localizable):

- Los nombres de carpeta son palabras en minúsculas unidas por `-`: sin espacios, `&`, `()` ni mayúsculas, así la URL es el nombre de la carpeta tal cual.
- El nombre de una carpeta del blog es el `slug` de la entrada en `BLOG_POSTS`. Buscar el slug encuentra tanto la carpeta como su registro.
- La carpeta de la serie (`core`, `serverless`, `workflows`, `security`, `search`) es el `id` de la serie en `SERIES`.
- Las carpetas y los slugs siguen en inglés para no romper los enlaces existentes; el contenido de las páginas está en español.

## Qué carga cada página

| Página                     | css/site.css | js/layout.jsx | js/blog.jsx | js/tienda.jsx | GSAP |
|----------------------------|:------------:|:-------------:|:-----------:|:-------------:|:----:|
| `index.html`               | ✓            | ✓             |             |               | ✓    |
| `404.html`                 | ✓            | ✓             |             |               |      |
| `pages/development/`       | ✓            | ✓             |             |               | ✓    |
| `pages/components/`        | ✓            | ✓             |             | ✓             |      |
| `pages/components/<slug>/` | ✓            | ✓             |             | ✓             |      |
| `pages/terminos/`          | ✓            | ✓             |             | ✓             |      |
| `pages/community/`         | ✓            | ✓             |             |               |      |
| `pages/stack/`             | ✓            | ✓             |             |               |      |
| `blog/`                    | ✓            | ✓             | ✓           |               |      |
| `blog/<serie>/<slug>/`     | ✓            | ✓             | ✓           |               |      |

El orden importa: `js/layout.jsx` siempre se carga primero, después `js/blog.jsx` (páginas del blog) o `js/tienda.jsx` (páginas de la tienda)
y luego el script propio de la página, que termina con `renderPage(MiPagina)` (o `renderPost(...)` en las entradas del blog).
No vuelvas a declarar en otro archivo nada de `layout.jsx`: la copia posterior lo sustituye sin avisar.

## Cambios habituales

- **Enlaces de la cabecera**: `NAV_LINKS` en `js/layout.jsx` (actualiza todas las páginas).
- **Campos del formulario de contacto / URL de Google Apps Script**: `ContactForm` y `FORM_ENDPOINT` en `js/layout.jsx`.
  Los nombres de campo (`NOMBRE`, `ORGANIZACIÓN`, `TELÉFONO`, `EMAIL`, `TECNOLOGÍA`) deben coincidir con las columnas de la hoja de Google.
- **Dirección de email**: `CONTACT_EMAIL` en `js/layout.jsx`.
- **Banderas de la cabecera (país y divisa)**: `LOCALES` en `js/layout.jsx`. Solo España y México, ambas en español:
  España → EUR, México → MXN. Todo el sitio está escrito en español; ya no se usa Google Translate.
  Mientras el visitante no pulsa una bandera, se elige el país disponible más cercano: primero por la zona horaria del navegador
  (América y Pacífico → México, resto → España) y después se corrige con una consulta de geolocalización por IP
  (`GEO_URL`, GeoJS; si el país es ES o MX se usa tal cual, si no, el más cercano por distancia a Madrid / Ciudad de México).
  El resultado se guarda en `lm-geo`; la bandera pulsada se guarda en `lm-locale` y siempre manda. `useLocale()` devuelve el país actual
  y se actualiza al momento, sin recargar la página.
- **Widget de WhatsApp**: `NUMBER` y `STRINGS` en `index.html` (y `whatsapp-chat-snippet.html`). Solo España
  (+34 602 55 76 85), atención en español e inglés; sin selector de región.
- **Pop-up de acceso / registro**: `AuthModal` y `auth` en `js/layout.jsx`, se abre desde la cabecera (y el menú móvil).
  STAGING: las cuentas se guardan solo en el navegador del visitante (`lm-users`, SHA-256 con sal; sesión en `lm-session`).
  Sustituye las funciones de `auth` por un backend real antes del lanzamiento. Textos del pop-up: `TXT`.
- **Pop-up de cookies**: `CookieConsent` en `js/layout.jsx`. Elección en `lm-cookies` / `window.LM_COOKIES`
  (`all` o `necessary`); carga analíticas solo cuando `hasCookieConsent()` sea true.
- **Stack tecnológico**: `TECH_STACK` en `js/layout.jsx` (página de inicio y `/pages/stack/`).
- **Estilos**: `css/site.css`. Todo lo demás son clases de Tailwind en el marcado.
  Paleta (tokens al principio de `css/site.css`): 1 blanco `#ffffff` fondo · 2 azul `#2563eb` botones, enlaces, acentos ·
  3 azul oscuro `#0a192f` encabezados, texto principal, banner superior, secciones oscuras, hover de botones · 4 gris `#64748b` pies de texto.
  El final de `css/site.css` asigna clases de Tailwind a estos colores (`text-gray-900` → azul oscuro, `text-gray-500` → gris,
  `bg-blue-600` → azul, `hover:bg-blue-700` → azul oscuro). Las clases no listadas conservan los colores claros de Tailwind.
- **Tarjetas del blog en el inicio**: `BLOG_HIGHLIGHTS` en `index.html` (una tarjeta por serie).
- **Catálogo de la tienda (productos, precios, stock, categorías)**: `public/db/productos.json` y `public/db/categorias.json`.
  Esquema y procedimiento en `public/db/README.md`. Los cambios de precio, stock o texto no necesitan ninguna otra edición.
- **Fotos de producto**: `img/productos/<id-producto>-400.webp` y `-800.webp` (cuadradas, fondo blanco, WebP calidad ~80),
  referenciadas desde el objeto `image` del producto en `productos.json` junto con su autor y licencia
  (las fotos de Wikimedia Commons los necesitan; se listan en «Créditos de imágenes»). `"image": null` muestra el icono de la categoría.
- **Datos del vendedor, direcciones de devolución, WhatsApp, divisas**: al principio de `js/tienda.jsx`. Los valores `[...]` sin rellenar se ven resaltados en la página de términos.
- **Términos por región**: `pages/terminos/index.html`. `SECTIONS` es el índice (`regions: ['ES']` limita una cláusula a una región;
  `title` puede ser `{ ES, MX }`) y `CLAUSES` asigna a cada id un componente común o uno por región (`{ ES: GarantiaES, MX: GarantiaMX }`).
  La pestaña activa es la bandera de la cabecera; pulsar una pestaña cambia la bandera y la divisa. Mantén los mismos ids en ambas
  regiones: las fichas y el carrito enlazan a `#devoluciones`, `#garantia`, `#envios` y `#precios`. Fecha: `TERMS_UPDATED` en `js/tienda.jsx`.

## Añadir una página

1. Copia `pages/stack/` en `pages/<nombre-nuevo>/` y edita su `index.html`.
2. Añade `{ href: '/pages/<nombre-nuevo>/', label: '...' }` a `NAV_LINKS` en `js/layout.jsx`.

## Añadir un producto (entrada manual de prelanzamiento)

1. Añade un objeto a `public/db/productos.json` con un `id`, `slug` y `sku` nuevos (campos en `public/db/README.md`).
2. Añade `img/productos/<id>-400.webp` y `-800.webp`, o pon `"image": null`.
3. Ejecuta `python tools/generar-paginas-producto.py` para crear `pages/components/<slug>/index.html`
   (o copia la carpeta de un producto existente y cambia su `<title>`, descripción y URL canónica).
4. Haz commit y push.

Para ocultar un producto pon `"active": false`; para mostrarlo agotado pon `"stock": 0`.
El script lista las carpetas de producto cuyo slug ya no está en la base de datos; bórralas a mano
y añade `'/pages/components/<slug-antiguo>/': '/pages/components/'` a la lista `moved` de `404.html`.

## Añadir una entrada al blog

1. Copia la carpeta de una entrada dentro de su serie, p. ej. `blog/security/rate-limiting/` en `blog/security/mi-nueva-entrada/`.
2. En su `index.html` cambia `<title>`, la descripción, la URL canónica, `CONTROLS` y `Content`.
   La última línea sigue siendo `renderPost(CONTROLS, Content);`: la página encuentra su entrada a partir de su propia URL.
3. Añade a `BLOG_POSTS` en `js/blog.jsx` un objeto con `slug: 'mi-nueva-entrada'` y un `type` de `BLOG_TYPES`.
   Si se te olvida, la página te dice qué slug falta.

## Añadir una serie al blog

1. Añade la serie a `SERIES`, sus pasos a `BLOG_TYPES` y sus zonas a `ZONES` en `js/blog.jsx`.
2. Crea `blog/<id-serie>/` y añade entradas como se indica arriba.
3. Añade una tarjeta a `BLOG_HIGHLIGHTS` en `index.html`.

## Renombrar o mover una entrada

Cambia el nombre de la carpeta y el `slug`, y después añade `'/ruta/antigua/': '/ruta/nueva/'` a la lista `moved` de `404.html`
para que los enlaces antiguos sigan funcionando.

Enlaza siempre con barra final (`/pages/stack/`, `/blog/security/rate-limiting/`).

## Pendiente: traducción y CMS headless

Detalle, código de ejemplo y comparativa en `_docs/src/v1.0.5.html`, §11–15 (PDF: `_docs/Lameyer-v1.0.5.pdf`). Ninguna opción está implementada.

| Opción | Pila | Rutas | Estado |
|--------|------|-------|--------|
| A | Vite + react-i18next, un namespace por página (`locales/<idioma>/<página>.json`) cargado de forma diferida con `import()` | sin prefijo, como hoy | pendiente |
| B | Next.js + next-intl, generación estática (`output: 'export'`) | `/es/…` (`localePrefix: 'always'`), `hreflang`, redirecciones 301 desde las URLs actuales | pendiente · recomendada |

Común a ambas: TMS en plan gratuito (**Tolgee** o **Crowdin**, por decidir) con el español como idioma de origen, y DeepL para pre-rellenar:

```
node tools/i18n/deepl-prefill.mjs --target en --dry-run          # cuenta claves y caracteres
DEEPL_API_KEY=xxxx:fx node tools/i18n/deepl-prefill.mjs --target en
```

Solo rellena claves vacías o ausentes, protege `{{var}}`, `{var}` y los nombres de marca, y anota lo pre-traducido en
`locales/<idioma>/_prefill.json` para revisarlo en el TMS. Pasos pendientes: elegir A o B, elegir TMS, extraer cadenas a
`locales/es/` (empezar por `common` y `terminos`), guardar `DEEPL_API_KEY` como secreto de CI y, solo en B, las redirecciones a `/es/`.

## Versiones

### 1.0.6 — en preparación · Medidas de seguridad
- Documento de versión **en curso**: `_docs/src/v1.0.6.html` (+ PDF). Parte del documento 5 (`_docs/src/v5-dev-security.html`:
  agente de IA, Dev Container, hooks de Git, reglas del servidor) y añade las medidas del propio sitio.
- Hallazgos ya comprobados en producción: el dominio **no** pasa por el proxy de Cloudflare (DNS en Namecheap, registros A directos
  a GitHub Pages), sin DNSSEC ni registro CAA, y ninguna cabecera de seguridad (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`).
- Nada de esta versión está implementado todavía; es la puerta previa al alta en Supabase y a las reglas de IAM.

### 1.0.5 — 2026-10-03 → 2026-10-05 · Versión consolidada (todo lo posterior a 1.0.4)
Agrupa los cambios publicados antes como 1.0.5 a 1.0.11 (commits `b2af7c1` … `59a81ca`; 111 archivos, +7.419 / −2.930 líneas).
Se describe el estado final; los pasos intermedios que luego se retiraron (Google Translate, banderas de EE. UU. y Países Bajos,
divisas USD, GBP e ILS) ya no forman parte del sitio. Detalle en `_docs/src/v1.0.5.html` (+ PDF).
- **Blog · Serverless Edge:** la serie pasa de 5 a 9 pasos (06 Tiempo real, 07 IA en el edge, 08 Imágenes y multimedia,
  09 Desplegar, probar y lanzar) más 3 cruces, con la zona nueva `platform` y enlaces «Siguiente paso» encadenados.
- **Cuentas y cookies:** pop-up de acceso / registro en todas las páginas (cuentas de staging solo en el navegador:
  `lm-users`, `lm-session`) y pop-up de consentimiento de cookies (`lm-cookies`, «Aceptar todas» / «Solo necesarias»).
- **Diseño:** tema blanco con paleta de cuatro colores (blanco, azul, azul oscuro, gris) en `css/site.css`.
- **Tienda:** filtro en acordeón con 4 grupos y 13 categorías por tipo de pieza, opción «Solo productos en stock», tarjetas
  compactas (8 por página), lista «Edición especial» en filas de una línea con colores de stock (1 granate, 2 azul, agotado gris),
  cantidades del carrito limitadas al stock.
- **Banderas, país y divisa:** solo 🇪🇸 España (EUR) y 🇲🇽 México (MXN), ambas en español. País propuesto por zona horaria y
  geolocalización por IP (GeoJS, `lm-geo`), la bandera pulsada manda (`lm-locale`); el cambio es inmediato. `CURRENCIES` = EUR y MXN,
  `CurrencyBadge` sustituye al selector. Sin Google Translate.
- **Todo en español:** blog (panel, 38 artículos, series, facetas, etiquetas), navegación, botones, formulario, readme y
  `public/db/README.md`. Fechas en formato español; ids de encabezado sin tildes.
- **Términos por región:** pestañas España / México sincronizadas con la bandera. España: política estándar española de comercio
  electrónico para electrónica, con cláusula nueva de residuos electrónicos y pilas (RAEE). México: cláusulas de la LFPC y aviso de
  revocación. Mismos anclajes en ambas regiones. Pendiente de revisión legal; marcador nuevo `[Nº de registro RII-AEE]`.
- **WhatsApp:** solo el número de España, atención en español e inglés, sin selector de región.
- **i18n y CMS headless (pendiente):** opciones A (Vite + react-i18next) y B (Next.js + next-intl, `/es/`), TMS Tolgee o Crowdin y
  `tools/i18n/deepl-prefill.mjs` para pre-rellenar con DeepL. Ver «Pendiente: traducción y CMS headless».

### 1.0.4 — 2026-10-03 · Fichas de producto + base de datos simulada · STAGING (prelanzamiento)
- Estado: **staging / prueba de entrada manual de MVP prelanzamiento.** Los datos del catálogo, precios, stock y especificaciones son de ejemplo y deben
  revisarse a mano antes del lanzamiento; los datos del vendedor y las direcciones de devolución siguen como marcadores `[...]`.
- Nueva base de datos simulada `public/db/`: `categorias.json` y `productos.json` (id, slug, sku, categoría, compatibilidad,
  precio, calidad, stock, activo, descripción, especificaciones, imagen + crédito). Documentada en `public/db/README.md`.
- `js/tienda.jsx` incorpora la capa de datos (`db.catalog()`, `useCatalog()`): el único lugar que cambiar al pasar a una base de datos real.
  El carrito (`useCart`, sincronizado entre pestañas), `ProductCard`, `CartDrawer`, `CartButton` y `ProductPage` también pasan allí.
- 30 fichas de producto en `/pages/components/<slug>/` (generadas por `tools/generar-paginas-producto.py`): foto con crédito,
  precio en 5 divisas, estado del stock, cantidad, añadir al carrito / comprar ahora, especificaciones con SKU, modelos compatibles,
  productos relacionados, enlaces a los términos de devoluciones/garantía/envíos, datos schema.org `Product` y etiquetas Open Graph.
- La tienda lee de la base de datos (esqueleto de carga y estado de error), busca en modelos compatibles y SKU,
  enlaza cada tarjeta a su ficha y muestra «Agotado» con `stock: 0` (ejemplo: bisagras Dell Latitude).
- Se elimina `IMAGE_CREDITS` de la página de la tienda: los créditos viven ahora en el objeto `image` de cada producto.

### 1.0.3 — 2026-10-03 · Fotos de producto
- 29 fotos de producto en `img/productos/` (`<id-producto>-400.webp` / `-800.webp`): cuadradas, fondo blanco, ~8 KB / ~19 KB cada una.
- Las tarjetas las cargan de forma responsive (`srcset`, 400w/800w), diferida (la primera fila sin diferir) y con dimensiones fijas (sin saltos de diseño); el carrito muestra miniaturas.
- `IMAGE_CREDITS` en `pages/components/index.html` + lista «Créditos de imágenes» al final de la tienda (exigida por CC BY / CC BY-SA).
- Aviso «Las imágenes son ilustrativas» en la tienda y en los términos (Productos). Los productos sin foto mantienen el icono de su categoría.

### 1.0.2 — 2026-10-03 · Tienda de componentes + términos
- `/pages/components/` pasa a ser una tienda online de repuestos (sustituye a la biblioteca de componentes de UI):
  categorías Oficina, Estudiante, Dev, Redes, Gamer, Otros (`?cat=<id>`), búsqueda, orden, carrito y pedido por WhatsApp (+34 602 55 76 85).
- Precios en EUR (IVA incluido) con conversión orientativa a USD, MXN, GBP, ILS usando los tipos diarios del BCE (API Frankfurter, tipos de respaldo en el código).
- Nueva `/pages/terminos/`: términos y condiciones con política de devolución de 30 días (sujeta a revisión, devoluciones a una dirección en España o en Madrid),
  desistimiento legal de 14 días, garantía legal de 3 años, protección de datos y formulario de desistimiento. Enlazada desde cada producto, el carrito y el pie del sitio.
- Nuevo `js/tienda.jsx` compartido por las dos páginas de la tienda: `SELLER`, `RETURN_ADDRESSES`, `CURRENCIES`, `useCurrency()`.
- Pendiente antes de publicar: datos del vendedor y ambas direcciones de devolución (marcadores `[...]` en `js/tienda.jsx`) y precios reales del catálogo.

### 1.0.1 — 2026-10-03 · Widget de chat de WhatsApp
- Caja de chat flotante antes de `</body>` en `index.html` (copia independiente en `whatsapp-chat-snippet.html`); «Iniciar chat» abre un enlace `wa.me`
  en una pestaña nueva con `rel="noopener noreferrer"`.
- Números en formato internacional solo con dígitos: MX `525610074750`, ES `34602557685`. Los huecos de EE. UU. e IL existen pero siguen ocultos hasta que se configure un número.
- Región preseleccionada según la zona horaria del visitante; z-index 90 (por encima de la página, por debajo del menú móvil).
