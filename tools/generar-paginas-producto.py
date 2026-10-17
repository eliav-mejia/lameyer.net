"""Crea /pages/components/<slug>/index.html para cada producto de public/db/productos.json.

Uso (desde la raíz del repositorio):   python tools/generar-paginas-producto.py

Cada página generada es una carcasa pequeña: título, descripción, URL canónica e imagen social para
los buscadores; después renderProduct() de js/tienda.jsx carga el producto desde la base de datos.
Vuelve a ejecutarlo tras añadir un producto o cambiar un slug, name, compat, description o image.
Las carpetas de productos que ya no existen se listan, nunca se borran.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB = ROOT / 'public' / 'db' / 'productos.json'
PAGES = ROOT / 'pages' / 'components'
SITE = 'https://lameyer.net'
TITLE_MAX = 60         # lo que Google muestra del <title>
DESCRIPTION_MAX = 160  # lo que Google muestra de la descripción


def page_title(p):
    # Nombre y compatibilidad si caben; si no, solo el nombre.
    full = f"{p['name']} · {p['compat']} - Lameyer"
    return full if len(full) <= TITLE_MAX else f"{p['name']} - Lameyer"


def page_description(p, price):
    # Frases completas de la descripción que quepan junto al precio y la devolución.
    tail = f"{price} € IVA incluido. Devolución en 30 días."
    room = DESCRIPTION_MAX - len(tail) - 1
    text = ''
    for sentence in re.split(r'(?<=\.) ', p['description']):
        if len(text) + len(sentence) + 1 > room:
            break
        text = f'{text} {sentence}'.strip()
    if not text:
        text = p['description'][:room - 1].rsplit(' ', 1)[0].rstrip(',;:') + '…'
    return f'{text} {tail}'

TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <!-- Generado por tools/generar-paginas-producto.py a partir de public/db/productos.json. No editar a mano. -->
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{url}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="Lameyer">
    <meta property="og:locale" content="es_ES">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{url}">
{og_image}
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">{breadcrumb}</script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/site.css">

    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
</head>
<body>

    <div id="root">
        <noscript>
            <h1>{h1}</h1>
            <p>{description}</p>
            <nav aria-label="Ruta">
                <ul>
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/pages/components/">Ver el catálogo de componentes</a></li>
                </ul>
            </nav>
        </noscript>
    </div>

    <script type="text/babel" src="/js/layout.jsx"></script>
    <script type="text/babel" src="/js/acceso.jsx"></script>
    <script type="text/babel" src="/js/tienda.jsx"></script>
    <script type="text/babel">
        renderProduct();
    </script>
</body>
</html>
"""


def main():
    products = [p for p in json.loads(DB.read_text(encoding='utf-8'))['products'] if p.get('active', True)]
    slugs = [p['slug'] for p in products]
    dupes = {s for s in slugs if slugs.count(s) > 1}
    if dupes:
        raise SystemExit(f'Slugs repetidos en productos.json: {", ".join(sorted(dupes))}')

    for p in products:
        e = lambda s: html.escape(s, quote=True)
        url = f"{SITE}/pages/components/{p['slug']}/"
        image = p.get('image')
        price = f"{p['price_eur']:.2f}".replace('.', ',')
        breadcrumb = json.dumps({
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': f'{SITE}/'},
                {'@type': 'ListItem', 'position': 2, 'name': 'Componentes', 'item': f'{SITE}/pages/components/'},
                {'@type': 'ListItem', 'position': 3, 'name': p['name'], 'item': url},
            ],
        }, ensure_ascii=False).replace('<', '\\u003c')
        page = TEMPLATE.format(
            title=e(page_title(p)),
            h1=e(f"{p['name']} compatible con {p['compat']}"),
            description=e(page_description(p, price)),
            url=url,
            breadcrumb=breadcrumb,
            og_image=f'    <meta property="og:image" content="{SITE}{image["src_800"] if image else "/icon-512.png"}">',
        )
        folder = PAGES / p['slug']
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'index.html').write_text(page, encoding='utf-8', newline='\n')

    stale = sorted(d.name for d in PAGES.iterdir() if d.is_dir() and d.name not in slugs)
    print(f'{len(products)} páginas de producto generadas en pages/components/<slug>/')
    if stale:
        print('Carpetas sin producto activo (revísalas o bórralas a mano):', ', '.join(stale))


if __name__ == '__main__':
    main()
