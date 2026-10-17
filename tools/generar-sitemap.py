"""Crea sitemap.xml con cada página pública del sitio (cada carpeta con index.html).

Uso (desde la raíz del repositorio):   python tools/generar-sitemap.py

Se omiten las carpetas internas (_docs, _interno, tools, public, Workflows), el 404 y las páginas con
<meta name="robots" content="noindex">. La fecha <lastmod> sale de article:published_time cuando existe.
Vuelve a ejecutarlo tras añadir o quitar páginas (después de generar-paginas-producto.py y
generar-seo-academia.mjs).
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://lameyer.net'
SKIP = {'_docs', '_interno', 'tools', 'public', 'Workflows', 'node_modules'}


def pages():
    for page in sorted(ROOT.rglob('index.html')):
        rel = page.relative_to(ROOT)
        if SKIP & set(rel.parts):
            continue
        html = page.read_text(encoding='utf-8').split('</head>', 1)[0]  # los ejemplos de código del body pueden mostrar noindex
        if re.search(r'<meta name="robots" content="[^"]*noindex', html):
            continue
        published = re.search(r'<meta property="article:published_time" content="([^"]+)">', html)
        path = '/' + rel.parent.as_posix() + '/' if rel.parent.parts else '/'
        yield path, published.group(1) if published else None


def main():
    rows = []
    for path, lastmod in pages():
        rows.append(f'  <url><loc>{SITE}{path}</loc>' + (f'<lastmod>{lastmod}</lastmod>' if lastmod else '') + '</url>')
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(rows) + '\n</urlset>\n')
    (ROOT / 'sitemap.xml').write_text(xml, encoding='utf-8', newline='\n')
    print(f'sitemap.xml: {len(rows)} URLs')


if __name__ == '__main__':
    main()
