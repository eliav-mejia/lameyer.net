LaMeyer.net
/* Sitio Web */

Static site on GitHub Pages (custom domain `lameyer.net`, proxied by Cloudflare).
No build step: pages use Tailwind, React and Babel from CDNs.

## Folder structure

Every page is a folder with an `index.html`, so URLs are clean (`/pages/stack/`, `/blog/security/rate-limiting/`)
and every page is added the same way: copy a folder, edit it.

```
lameyer.net/
├── CNAME                         custom domain for GitHub Pages
├── readme.md                     this file
├── index.html                    home page (/)
├── 404.html                      not-found page; redirects old blog URLs
│
├── css/
│   └── site.css                  ONE stylesheet for the whole site
│
├── js/
│   ├── layout.jsx                shared by EVERY page: header, footer, contact form,
│   │                             PageHero, RegisterCTA, tech stack, renderPage()
│   ├── blog.jsx                  blog only: SERIES, BLOG_TYPES, BLOG_POSTS, dashboard, article template
│   └── tienda.jsx                shop only: SELLER, RETURN_ADDRESSES, CURRENCIES, data layer (db, useCatalog),
│                                 cart, ProductCard, ProductPage, renderProduct()
│
├── public/
│   └── db/                       SIMULATED DATABASE (pre-launch, edited by hand) — see public/db/README.md
│       ├── categorias.json       categories
│       └── productos.json        products: price, stock, specs, compatibility, image + credit
│
├── img/
│   └── productos/                product photos <product-id>-400.webp / -800.webp
│
├── tools/
│   └── generar-paginas-producto.py   creates pages/components/<slug>/ from public/db/productos.json
│
├── pages/                        one folder per section, served at /pages/<name>/
│   ├── development/index.html    /pages/development/  (contact form -> Google Sheets)
│   ├── components/index.html     /pages/components/  shop: filters, search, cart -> WhatsApp
│   ├── components/<slug>/        /pages/components/<slug>/  one page per product (generated)
│   ├── terminos/index.html       /pages/terminos/    terms & conditions (linked in the footer)
│   ├── community/index.html      /pages/community/
│   └── stack/index.html          /pages/stack/
│
└── blog/
    ├── index.html                /blog/  filter dashboard (?series=core, ?series=security, ...)
    │
    ├── core/                     Modular Core
    │   ├── modular-core-architecture/        overview
    │   ├── domain-modules-boundaries/
    │   ├── contracts-typed-apis/
    │   ├── shared-packages-workspaces/
    │   ├── data-ownership-migrations/
    │   └── contract-testing-versioning/
    ├── serverless/               Serverless Edge
    │   ├── serverless-edge-architecture/     overview
    │   ├── edge-functions-workers/
    │   ├── routing-caching-auth-edge/
    │   ├── edge-storage-kv-d1-r2/
    │   ├── scheduled-jobs-cron-triggers/
    │   ├── logs-tracing-cost/
    │   ├── realtime-websockets-durable-objects/   step 06 · Real-time
    │   ├── ai-at-the-edge-workers-ai/             step 07 · Edge AI
    │   ├── images-media-at-the-edge/              step 08 · Media
    │   ├── deploy-test-rollout-workers/           step 09 · Deploy
    │   ├── serverless-integration-paas/      crossover
    │   ├── serverless-in-front-of-iaas/      crossover
    │   └── multi-tenant-saas-metering/       crossover
    ├── workflows/                Workflow Automation
    │   └── serverless-workflow-automation/
    ├── security/                 API Security
    │   ├── edge-layer-ddos-dns/
    │   ├── waf-bot-layer-layer-7/
    │   ├── api-endpoint-protection/
    │   ├── rate-limiting/
    │   └── cloudflare-tunnel/
    └── search/                   Code Search & Discoverability
        ├── code-search-repository-organization/
        ├── semantic-vector-search/
        ├── search-as-code-sac/
        ├── benchmark-curation-reap-harvest/
        ├── ssr-static-generation/
        ├── semantic-html-markup/
        ├── core-web-vitals-page-speed/
        ├── crawlability-indexing/
        ├── structured-data/
        ├── benchmarks-x-search-as-code/          crossover
        ├── static-generation-x-vector-search/    crossover
        ├── structured-data-x-repositories/       crossover
        ├── core-web-vitals-x-site-search/        crossover
        └── crawlability-x-faceted-search/        crossover
```

Naming rules (they keep everything searchable):

- Folder names are lowercase words joined by `-`: no spaces, `&`, `()` or capitals, so the URL is the folder name as is.
- A blog folder name is the entry's `slug` in `BLOG_POSTS`. Searching the slug finds both the folder and its registry entry.
- The series folder (`core`, `serverless`, `workflows`, `security`, `search`) is the series `id` in `SERIES`.

## What each page loads

| Page                       | css/site.css | js/layout.jsx | js/blog.jsx | js/tienda.jsx | GSAP |
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
| `blog/<series>/<slug>/`    | ✓            | ✓             | ✓           |               |      |

Order matters: `js/layout.jsx` always loads first, then `js/blog.jsx` (blog pages) or `js/tienda.jsx` (shop pages),
then the page's own inline script, which ends with `renderPage(MyPage)` (or `renderPost(...)` in blog entries).
Do not redeclare anything from `layout.jsx` in another file: the later copy silently replaces it.

## Common edits

- **Header links**: `NAV_LINKS` in `js/layout.jsx` (updates every page).
- **Contact form fields / Google Apps Script URL**: `ContactForm` and `FORM_ENDPOINT` in `js/layout.jsx`.
  Field names (`NOMBRE`, `ORGANIZACIÓN`, `TELÉFONO`, `EMAIL`, `TECNOLOGÍA`) must match the Google Sheet columns.
- **Email address**: `CONTACT_EMAIL` in `js/layout.jsx`.
- **Languages (flags in the header)**: `LOCALES` in `js/layout.jsx`. Spanish ↔ English only: US → English + USD,
  Spain → Spanish + EUR. Translation is Google Translate (automatic, machine translated):
  each page is translated from its own `<html lang>` (`es` for home/shop/terms, `en` for the blog). Wrap numbers or names
  that must not be translated in `translate="no"`. Google's bar and tooltips are hidden in `css/site.css`.
- **WhatsApp widget**: `NUMBER` and `STRINGS` in `index.html` (and `whatsapp-chat-snippet.html`). Spain only
  (+34 602 55 76 85), bilingual ES/EN support; no region picker.
- **Login / sign up pop-up**: `AuthModal` and `auth` in `js/layout.jsx`, opened from the header (and mobile menu).
  STAGING: accounts are stored only in the visitor's browser (`lm-users`, salted SHA-256; session in `lm-session`).
  Swap the `auth` functions for a real backend before launch. Pop-up text: `UI_TEXT` (follows the page's `<html lang>`).
- **Cookie pop-up**: `CookieConsent` in `js/layout.jsx`. Choice in `lm-cookies` / `window.LM_COOKIES`
  (`all` or `necessary`); load analytics only when `hasCookieConsent()` is true.
- **Tech stack**: `TECH_STACK` in `js/layout.jsx` (home page and `/pages/stack/`).
- **Styles**: `css/site.css`. Everything else is Tailwind classes in the markup.
  Palette (tokens at the top of `css/site.css`): 1 white `#ffffff` background · 2 blue `#2563eb` buttons, links, accents ·
  3 dark blue `#0a192f` headings, main text, top banner, dark sections, button hover · 4 grey `#64748b` captions.
  The end of `css/site.css` maps Tailwind classes to these (`text-gray-900` → dark blue, `text-gray-500` → grey,
  `bg-blue-600` → blue, `hover:bg-blue-700` → dark blue). Unlisted classes keep Tailwind's own light colours.
- **Home blog cards**: `BLOG_HIGHLIGHTS` in `index.html` (one card per series).
- **Shop catalogue (products, prices, stock, categories)**: `public/db/productos.json` and `public/db/categorias.json`.
  Schema and workflow in `public/db/README.md`. Price/stock/text changes need no other edit.
- **Product photos**: `img/productos/<product-id>-400.webp` and `-800.webp` (square, white background, WebP ~80 quality),
  referenced from the product's `image` object in `productos.json` together with its author and licence
  (Wikimedia Commons photos need them; they are listed under "Créditos de imágenes"). `"image": null` shows the category icon.
- **Seller data, return addresses, WhatsApp, currencies**: top of `js/tienda.jsx`. Unfilled `[...]` values show highlighted on the terms page.

## Add a page

1. Copy `pages/stack/` to `pages/<new-name>/` and edit its `index.html`.
2. Add `{ href: '/pages/<new-name>/', label: '...' }` to `NAV_LINKS` in `js/layout.jsx`.

## Add a product (pre-launch manual input)

1. Add an object to `public/db/productos.json` with a new `id`, `slug` and `sku` (fields in `public/db/README.md`).
2. Add `img/productos/<id>-400.webp` and `-800.webp`, or set `"image": null`.
3. Run `python tools/generar-paginas-producto.py` to create `pages/components/<slug>/index.html`
   (or copy an existing product folder and change its `<title>`, description and canonical URL).
4. Commit and push.

To hide a product set `"active": false`; to show it as sold out set `"stock": 0`.
Product folders whose slug is no longer in the database are listed by the script; delete them by hand
and add `'/pages/components/<old-slug>/': '/pages/components/'` to the `moved` list in `404.html`.

## Add a blog entry

1. Copy an entry folder inside its series, e.g. `blog/security/rate-limiting/` to `blog/security/my-new-entry/`.
2. In its `index.html` change `<title>`, the description, the canonical URL, `CONTROLS` and `Content`.
   The last line stays `renderPost(CONTROLS, Content);`: the page finds its entry from its own URL.
3. Add an object with `slug: 'my-new-entry'` and a `type` from `BLOG_TYPES` to `BLOG_POSTS` in `js/blog.jsx`.
   If you forget, the page tells you which slug is missing.

## Add a blog series

1. Add the series to `SERIES`, its steps to `BLOG_TYPES` and its zones to `ZONES` in `js/blog.jsx`.
2. Create `blog/<series-id>/` and add entries as above.
3. Add a card to `BLOG_HIGHLIGHTS` in `index.html`.

## Rename or move an entry

Change the folder name and the `slug`, then add `'/old/path/': '/new/path/'` to the `moved` list in `404.html`
so old links keep working.

Always link with a trailing slash (`/pages/stack/`, `/blog/security/rate-limiting/`).

## Versions

### 1.0.8 — 2026-10-04 · White theme + four-colour palette
- Back to a white site: white background, blue secondary, dark blue tertiary, grey for captions (`css/site.css`).
  Header banner, Stack section and chat header in dark blue; footer and mobile menu white again; chat widget light.
- Israeli shekel (ILS) removed from the shop currencies and the terms page; reference currencies are USD, MXN and GBP.

### 1.0.7 — 2026-10-04 · Login / sign up + cookie consent
- Login / sign up pop-up on every page (header button, mobile menu); staging accounts stored in the browser only.
- Cookie consent pop-up on the first visit ("Accept all" / "Necessary only"), remembered across pages.
- Languages limited to Spanish ↔ English (🇪🇸 / 🇺🇸); Mexico and Netherlands removed.
- WhatsApp widget: region picker code removed; Spain-only, bilingual ES/EN support.

### 1.0.6 — 2026-10-04 · Languages + WhatsApp Spain only
- Flags in the header of every page (desktop and mobile menu): 🇺🇸 English, 🇪🇸 Español (España), 🇲🇽 Español (México), 🇳🇱 Nederlands.
  Google Translate translates the whole site automatically; the choice is remembered across pages (`lm-locale`) and also sets
  the shop currency (USD, EUR, MXN, EUR). Google's script loads only when a translation is active.
- React guard in `js/layout.jsx` so Google's DOM changes can't crash the React pages; prices and counters in the shop are
  `translate="no"` so they keep updating.
- WhatsApp widget: Israel, US and Mexico removed; only the Spain number remains (region picker hidden).

### 1.0.5 — 2026-10-04 · Serverless Edge: four new categories
- Serverless series extended from 5 to 9 steps (`BLOG_TYPES` in `js/blog.jsx`), each with its own folder and `index.html`
  in `blog/serverless/` and an entry in `BLOG_POSTS`:
  06 Real-Time (WebSockets & Durable Objects), 07 AI at the Edge (Workers AI, Vectorize, AI Gateway),
  08 Images & Media at the Edge (R2, transformations, Stream), 09 Deploy, Test & Roll Out (Wrangler, Vitest, CI, gradual deployments).
- New zone `platform` ("Platform (ship & evolve)") for the deploy step; real-time sits in `state`, edge AI and media in `compute`.
- Articles chain with "Next step" links: 05 → 06 → 07 → 08 → 09 → back to the overview.

### 1.0.4 — 2026-10-03 · Product pages + simulated database · STAGING (pre-launch)
- Status: **staging / MVP pre-launch manual input test.** Catalogue data, prices, stock and specs are sample data to be
  checked by hand before launch; seller data and return addresses are still `[...]` placeholders.
- New `public/db/` simulated database: `categorias.json` and `productos.json` (id, slug, sku, category, compatibility,
  price, grade, stock, active, description, specs, image + credit). Documented in `public/db/README.md`.
- `js/tienda.jsx` gains the data layer (`db.catalog()`, `useCatalog()`): the only place to change when moving to a real database.
  Cart (`useCart`, synced across tabs), `ProductCard`, `CartDrawer`, `CartButton` and `ProductPage` move there too.
- 30 product pages at `/pages/components/<slug>/` (generated by `tools/generar-paginas-producto.py`): photo with credit,
  price in 5 currencies, stock status, quantity, add to cart / buy now, specs with SKU, compatible models,
  related products, links to returns/guarantee/shipping terms, schema.org `Product` data and Open Graph tags.
- Shop page reads from the database (loading skeleton and error state), searches compatible models and SKU,
  links every card to its product page and shows "Agotado" for `stock: 0` (sample: Dell Latitude hinges).
- `IMAGE_CREDITS` removed from the shop page: credits now live in each product's `image` object.

### 1.0.3 — 2026-10-03 · Product photos
- 29 product photos in `img/productos/` (`<product-id>-400.webp` / `-800.webp`): square, white background, ~8 KB / ~19 KB each.
- Cards load them responsively (`srcset`, 400w/800w), lazily (first row eager) and with fixed dimensions (no layout shift); the cart shows thumbnails.
- `IMAGE_CREDITS` in `pages/components/index.html` + "Créditos de imágenes" list at the bottom of the shop (required by CC BY / CC BY-SA).
- "Images are illustrative" notice in the shop and in the terms (Productos). Products without a photo keep their category icon.

### 1.0.2 — 2026-10-03 · Components shop + terms
- `/pages/components/` is now an e-commerce of spare parts (replaces the UI component library):
  categories Oficina, Estudiante, Dev, Redes, Gamer, Otros (`?cat=<id>`), search, sort, cart and checkout via WhatsApp (+34 602 55 76 85).
- Prices in EUR (VAT included) with reference conversion to USD, MXN, GBP, ILS using ECB daily rates (Frankfurter API, fallback rates in code).
- New `/pages/terminos/`: terms and conditions with a 30-day return policy (subject to inspection, returns to an address in Spain or in Madrid),
  14-day legal withdrawal, 3-year legal guarantee, data protection and withdrawal form. Linked from every product, the cart and the site footer.
- New `js/tienda.jsx` shared by both shop pages: `SELLER`, `RETURN_ADDRESSES`, `CURRENCIES`, `useCurrency()`.
- Pending before going live: seller data and both return addresses (`[...]` placeholders in `js/tienda.jsx`) and real catalogue prices.

### 1.0.1 — 2026-10-03 · WhatsApp chat widget
- Floating chat box before `</body>` in `index.html` (standalone copy in `whatsapp-chat-snippet.html`); "Iniciar chat" opens a `wa.me` link
  in a new tab with `rel="noopener noreferrer"`.
- Numbers in digits-only international format: MX `525610074750`, ES `34602557685`. US and IL slots exist but stay hidden until a number is set.
- Region preselected from the visitor's time zone; z-index 90 (above the page, below the mobile menu).
