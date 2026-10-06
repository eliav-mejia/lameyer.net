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

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB = ROOT / 'public' / 'db' / 'productos.json'
PAGES = ROOT / 'pages' / 'components'
SITE = 'https://lameyer.net'

TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Generado por tools/generar-paginas-producto.py a partir de public/db/productos.json. No editar a mano. -->
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{url}">
    <meta property="og:type" content="product">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{url}">
{og_image}
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
            <p><a href="/pages/components/">Ver el catálogo</a></p>
        </noscript>
    </div>

    <script type="text/babel" src="/js/layout.jsx"></script>
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
        page = TEMPLATE.format(
            title=e(f"{p['name']} · {p['compat']} - Lameyer"),
            h1=e(f"{p['name']} compatible con {p['compat']}"),
            description=e(f"{p['description']} {price} € IVA incluido. Devolución en 30 días."[:300]),
            url=url,
            og_image=f'    <meta property="og:image" content="{SITE}{image["src_800"]}">' if image else '',
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
