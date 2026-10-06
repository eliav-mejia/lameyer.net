# public/db — base de datos simulada de la tienda (MVP prelanzamiento)

Estado: **staging / prueba de entrada manual**. Estos archivos JSON sustituyen a una base de datos real hasta el lanzamiento.
Son públicos (se sirven en `https://lameyer.net/public/db/…`), así que nunca pongas aquí datos privados
(costes, proveedores, datos de clientes).

La tienda los lee a través de la capa de datos de `js/tienda.jsx` (`db.catalog()`, `DB_BASE = '/public/db'`).
Pasar a una base de datos real (Supabase, Firestore, una API…) significa cambiar solo ese cargador;
mantén los mismos nombres de campo y no cambia nada más.

## Archivos

| Archivo           | «Tabla»      | Lo usa                                               |
|-------------------|--------------|------------------------------------------------------|
| `categorias.json` | `groups`, `categories` | filtro en acordeón de la tienda, ruta de navegación de los productos |
| `productos.json`  | `products`   | cuadrícula de la tienda, fichas de producto, carrito, créditos de imágenes |

Ambos archivos llevan `_schema`, `_note` y `updated_at` al principio: actualiza `updated_at` cuando los edites.

## groups

Secciones del filtro en acordeón de la tienda: `componentes` (Componentes del PC), `redes` (Redes),
`equipo` (Equipo básico: monitores, teclados, auriculares, mandos) y `herramientas`.

| Campo        | Tipo   | Notas                          |
|--------------|--------|--------------------------------|
| `id`         | string | clave que usa `categories.group_id` |
| `label`      | string | título de la sección del acordeón |
| `sort_order` | number | orden de las secciones         |

## categories

| Campo         | Tipo   | Notas                                              |
|---------------|--------|----------------------------------------------------|
| `id`          | string | clave que usan `products.category_id` y `?cat=<id>` |
| `group_id`    | string | uno de `groups.id`                                 |
| `label`       | string | se muestra en los filtros                          |
| `icon`        | string | un emoji; también es la imagen de respaldo         |
| `description` | string | subtítulo bajo el encabezado de la categoría       |
| `sort_order`  | number | orden de los chips de filtro                       |

## products

| Campo               | Tipo            | Notas                                                                          |
|---------------------|-----------------|--------------------------------------------------------------------------------|
| `id`                | string          | clave permanente (carrito, nombres de las imágenes). Nunca la reutilices ni la cambies. |
| `slug`              | string          | URL: `/pages/components/<slug>/`. Palabras en minúsculas unidas por `-`.        |
| `sku`               | string          | se muestra en la ficha de producto y en el pedido por WhatsApp                 |
| `category_id`       | string          | uno de `categories.id`                                                         |
| `name`              | string          | nombre del producto sin el dispositivo («Batería 72 Wh»)                       |
| `compat`            | string          | línea corta de compatibilidad («Lenovo ThinkPad T480 / T470»)                  |
| `compatible_models` | string[]        | lista completa en la ficha de producto; también se puede buscar                |
| `price_eur`         | number          | EUR, IVA incluido, punto como separador decimal (`49.9`). Con la bandera de México se muestra también en MXN (orientativo). |
| `grade`             | string          | `estandar` o `premium`                                                         |
| `edition`           | string          | `estandar` (cuadrícula de la tienda con foto, 8 por página) o `especial` (unidades limitadas, lista «Edición especial» sin foto) |
| `stock`             | number          | `0` = Agotado, gris (no se puede añadir al carrito) · `1` = «Última unidad», granate · `2` = «Solo 2 en stock», azul · `3+` = En stock. El carrito nunca guarda más que el stock. |
| `active`            | boolean         | `false` oculta el producto en todas partes (la página muestra «Producto no encontrado») |
| `description`       | string          | ficha de producto y meta descripción                                           |
| `specs`             | object          | `{ "Etiqueta": "valor" }`, se muestra en este orden                            |
| `image`             | object \| null  | `null` muestra el icono de la categoría                                        |
| `image.src_400`     | string          | `/img/productos/<id>-400.webp` (cuadrada, fondo blanco)                        |
| `image.src_800`     | string          | `/img/productos/<id>-800.webp`                                                 |
| `image.author`, `image.license`, `image.license_url`, `image.source` | string | crédito; obligatorio en fotos CC BY / CC BY-SA. Para fotos propias usa autor `Lameyer`, licencia `Todos los derechos reservados`, `license_url: null` y `source` = la ficha de producto. |

## Prueba de entrada manual: añadir o editar un producto

1. Edita `productos.json` (copia un objeto existente y dale un `id`, `slug` y `sku` nuevos). Mantén el JSON válido:
   comas entre objetos y sin coma tras el último. Un validador de JSON o VS Code muestran los errores.
2. Añade las fotos como `img/productos/<id>-400.webp` y `-800.webp`, o pon `"image": null`.
3. Crea la carpeta de la ficha de producto:
   `python tools/generar-paginas-producto.py` (crea/actualiza `pages/components/<slug>/index.html` para cada producto activo).
   Sin Python: copia cualquier carpeta de `pages/components/`, renómbrala con el nuevo slug y cambia su `<title>`,
   descripción y URL canónica.
4. Los cambios de precio, stock, descripción o especificaciones **no** necesitan regenerar las páginas: las páginas leen el JSON al cargar.
   Regenera solo tras añadir un producto o cambiar `slug`, `name`, `compat`, `description` o `image`
   (se copian en el `<head>` de la página para los buscadores).
5. Haz commit y push. GitHub Pages + Cloudflare pueden tardar unos minutos; la tienda pide el JSON con `no-cache`.
