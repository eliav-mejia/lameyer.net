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
│   └── tienda.jsx                shop only: SELLER, RETURN_ADDRESSES, CURRENCIES, useCurrency()
│
├── pages/                        one folder per section, served at /pages/<name>/
│   ├── development/index.html    /pages/development/  (contact form -> Google Sheets)
│   ├── components/index.html     /pages/components/  shop: CATEGORIES, PRODUCTS, cart -> WhatsApp
│   ├── terminos/index.html       /pages/terminos/    terms & conditions (linked in the footer)
│   ├── community/index.html      /pages/community/
│   └── stack/index.html          /pages/stack/
│
└── blog/
    ├── index.html                /blog/  filter dashboard (?series=core, ?series=security, ...)
    │
    ├── core/                     Modular Core
    │   └── modular-core-architecture/
    ├── serverless/               Serverless Edge
    │   └── serverless-edge-architecture/
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
- **Tech stack**: `TECH_STACK` in `js/layout.jsx` (home page and `/pages/stack/`).
- **Styles**: `css/site.css`. Everything else is Tailwind classes in the markup.
- **Home blog cards**: `BLOG_HIGHLIGHTS` in `index.html` (one card per series).
- **Shop catalogue**: `PRODUCTS` and `CATEGORIES` in `pages/components/index.html` (prices in EUR, VAT included).
- **Product photos**: `img/productos/<product-id>-400.webp` and `-800.webp` (square, white background, WebP ~80 quality).
  Add the matching entry to `IMAGE_CREDITS` in `pages/components/index.html`; without one the card shows the category icon.
  Photos from Wikimedia Commons need their author and licence in `IMAGE_CREDITS` (listed under "Créditos de imágenes").
- **Seller data, return addresses, WhatsApp, currencies**: top of `js/tienda.jsx`. Unfilled `[...]` values show highlighted on the terms page.

## Add a page

1. Copy `pages/stack/` to `pages/<new-name>/` and edit its `index.html`.
2. Add `{ href: '/pages/<new-name>/', label: '...' }` to `NAV_LINKS` in `js/layout.jsx`.

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
