# SEO — lameyer.net

Guía de referencia: `builds/seo/seo-guide.pdf` (estructura HTML, meta etiquetas, H1–H3, nav + ul, alt de imágenes).
Este documento resume cómo se aplica en lameyer.net. Versión 1.0.9 (2026-10-16).

## Estrategia

| Sección | Público | Búsquedas objetivo |
|---|---|---|
| Portada `/` | Empresas que buscan desarrollo web y datos | soluciones web, manejo de datos, serverless, Núcleo Modular + Edge Serverless (MC-SE) |
| `/academia/` (39 entradas) | Developers y equipos técnicos | edge serverless, Cloudflare Workers, seguridad de APIs, SEO técnico, búsqueda de código |
| `/pages/components/` (40 fichas) | Compradores en España / México | repuestos y componentes en Madrid: RAM, SSD, baterías, pantallas, redes |
| `/pages/development/`, `/community/`, `/stack/` | Clientes y comunidad | desarrollo de software, código abierto, stack tecnológico |
| `/pages/terminos/`, `/pages/contratos/` | Clientes | confianza: términos, marco legal |

La academia es el motor de tráfico orgánico: contenido técnico largo, enlazado entre series y hacia la portada.
Las fichas de producto captan búsquedas de cola larga ("batería iPhone 13", "SSD NVMe 2 TB PS5").

## Reglas para cada página

1. `<html lang="es">`, `charset`, `viewport`.
2. `<title>` de **50–60 caracteres**: palabra clave primero, marca al final (` - Lameyer`).
3. `<meta name="description">` de **150–160 caracteres**, única por página.
4. `<link rel="canonical">` con URL absoluta `https://lameyer.net/...` y **barra final**.
5. Open Graph + `twitter:card` (ver tabla de etiquetas).
6. JSON-LD en el `<head>` estático (no solo inyectado por React).
7. Un solo `<h1>` en la página renderizada; después `<h2>` y `<h3>` en orden, sin saltos.
8. React renderiza en el navegador: cada página lleva en `<div id="root">` un `<noscript>` con `<h1>`, resumen y enlaces.
9. Menús como `<nav>` + `<ul>`/`<li>` (`js/layout.jsx`), dentro de `<header>`.
10. Imágenes con `alt` descriptivo (o `alt=""` si son decorativas) y `width`/`height`.
11. Páginas privadas o de error: `<meta name="robots" content="noindex">` y fuera del sitemap.

## Etiquetas usadas

| Tipo de página | og:type | twitter:card | JSON-LD | Dónde se genera |
|---|---|---|---|---|
| Portada | website | summary | `Organization` + `WebSite` | a mano, `index.html` |
| Páginas `/pages/*` | website | summary | `BreadcrumbList` | a mano |
| Panel `/academia/` | website | summary | `CollectionPage` + `ItemList` + `BreadcrumbList` | `tools/generar-seo-academia.mjs` |
| Entrada de academia | article (+ `article:published_time`) | summary | `TechArticle` + `BreadcrumbList` | `tools/generar-seo-academia.mjs` |
| Ficha de producto | product | summary_large_image | `BreadcrumbList` (estático) + `Product` con precio y stock (inyectado por `js/tienda.jsx`) | `tools/generar-paginas-producto.py` |

Comunes: `og:site_name` = Lameyer, `og:locale` = es_ES, `og:image` = foto del producto o `https://lameyer.net/icon-512.png`.

## Archivos de rastreo

- `robots.txt`: todo permitido salvo `/tools/` y `/whatsapp-chat-snippet.html`; anuncia el sitemap.
- `sitemap.xml`: generado por `tools/generar-sitemap.py` (omite `_docs`, `_interno`, `tools`, `public`, `Workflows`, 404 y `noindex`).

## Mantenimiento

| Cambio | Ejecuta |
|---|---|
| Producto nuevo o editado | `python tools/generar-paginas-producto.py` y `python tools/generar-sitemap.py` |
| Entrada de academia nueva o editada | `node tools/generar-seo-academia.mjs` y `python tools/generar-sitemap.py` |
| Página nueva | reglas 1–11 a mano, luego `python tools/generar-sitemap.py` |

Tras publicar: enviar `https://lameyer.net/sitemap.xml` en Google Search Console y validar JSON-LD en
<https://search.google.com/test/rich-results>.

## Pendiente

- Las fichas de `/pages/components/` exigen iniciar sesión (`js/acceso.jsx`): Google ve el pop-up de acceso, no la tienda.
  Para posicionar productos, dejar visible al menos nombre, foto, precio y descripción sin cuenta.
- No hay imagen social propia (se usa el icono de 512 px); una imagen de 1200 × 630 px mejoraría las vistas previas.
- `/pages/development/Workflows/timeline/` es una herramienta interna sin `noindex`.
