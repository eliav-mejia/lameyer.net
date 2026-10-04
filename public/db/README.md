# public/db — simulated shop database (MVP pre-launch)

Status: **staging / manual input test**. These JSON files stand in for a real database until launch.
They are public (served at `https://lameyer.net/public/db/…`), so never put private data here
(costs, suppliers, customer data).

The shop reads them through the data layer in `js/tienda.jsx` (`db.catalog()`, `DB_BASE = '/public/db'`).
Moving to a real database (Supabase, Firestore, an API…) means changing only that loader;
keep the same field names and nothing else changes.

## Files

| File              | "Table"      | Used by                                              |
|-------------------|--------------|------------------------------------------------------|
| `categorias.json` | `categories` | shop filters, product breadcrumbs                    |
| `productos.json`  | `products`   | shop grid, product pages, cart, image credits        |

Both files carry `_schema`, `_note` and `updated_at` at the top: update `updated_at` when you edit.

## categories

| Field         | Type   | Notes                                              |
|---------------|--------|----------------------------------------------------|
| `id`          | string | key used by `products.category_id` and `?cat=<id>` |
| `label`       | string | shown in the filters                               |
| `icon`        | string | one emoji; also the fallback image                 |
| `description` | string | subtitle under the category heading                |
| `sort_order`  | number | order of the filter chips                          |

## products

| Field               | Type            | Notes                                                                          |
|---------------------|-----------------|--------------------------------------------------------------------------------|
| `id`                | string          | permanent key (cart, image file names). Never reuse or change it.              |
| `slug`              | string          | URL: `/pages/components/<slug>/`. Lowercase words joined by `-`.               |
| `sku`               | string          | shown on the product page and in the WhatsApp order                            |
| `category_id`       | string          | one of `categories.id`                                                         |
| `name`              | string          | product name without the device ("Batería 72 Wh")                              |
| `compat`            | string          | short compatibility line ("Lenovo ThinkPad T480 / T470")                       |
| `compatible_models` | string[]        | full list on the product page; also searchable                                 |
| `price_eur`         | number          | EUR, VAT included, dot as decimal separator (`49.9`)                           |
| `grade`             | string          | `estandar` or `premium`                                                        |
| `stock`             | number          | `0` = Agotado (no add to cart), `1–3` = "Últimas unidades"                     |
| `active`            | boolean         | `false` hides the product everywhere (page shows "Producto no encontrado")     |
| `description`       | string          | product page and meta description                                              |
| `specs`             | object          | `{ "Label": "value" }`, shown in this order                                    |
| `image`             | object \| null  | `null` shows the category icon                                                 |
| `image.src_400`     | string          | `/img/productos/<id>-400.webp` (square, white background)                      |
| `image.src_800`     | string          | `/img/productos/<id>-800.webp`                                                 |
| `image.author`, `image.license`, `image.license_url`, `image.source` | string | credit; required for CC BY / CC BY-SA photos. For your own photos use author `Lameyer`, license `Todos los derechos reservados`, `license_url: null`, `source` = the product page. |

## Manual input test: add or edit a product

1. Edit `productos.json` (copy an existing object, give it a new `id`, `slug` and `sku`). Keep the JSON valid:
   commas between objects, no trailing comma after the last one. A JSON validator or VS Code shows errors.
2. Add the photos as `img/productos/<id>-400.webp` and `-800.webp`, or set `"image": null`.
3. Create the product page folder:
   `python tools/generar-paginas-producto.py` (creates/updates `pages/components/<slug>/index.html` for every active product).
   Without Python: copy any folder in `pages/components/`, rename it to the new slug and change its `<title>`,
   description and canonical URL.
4. Price, stock, description or specs changes need **no** page regeneration: the pages read the JSON on load.
   Regenerate only after adding a product or changing `slug`, `name`, `compat`, `description` or `image`
   (they are copied into the page `<head>` for search engines).
5. Commit and push. GitHub Pages + Cloudflare can take a few minutes; the shop requests the JSON with `no-cache`.
