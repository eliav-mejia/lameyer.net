// Genera el blog estático a partir de los datos de js/academia.jsx (Ciberseguridad) y js/desarrollo-datos.js (Desarrollo).
//
// Uso (desde la raíz del repositorio):   node tools/generar-blog.mjs   y después   python tools/generar-sitemap.py
//
// Ciberseguridad · /blog/ciberseguridad/<serie>/<slug>/  (páginas escritas a mano: contenido JSX propio)
//   - reescribe el bloque <!-- seo:inicio --> … <!-- seo:fin --> (Open Graph + JSON-LD) y el <noscript> del #root.
//   - el <title>, la descripción y el contenido de cada entrada no se tocan.
// Desarrollo · /blog/desarrollo/<nivel-N>/<slug>/ y /blog/desarrollo/introduccion/<slug>/
//   - páginas GENERADAS por completo (no editar a mano): head, SEO, texto completo en <noscript> y renderDesarrolloPost().
// Índices: /blog/ y /blog/desarrollo/ se generan por completo; /blog/ciberseguridad/ solo recibe SEO y <noscript>.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://lameyer.net';
const IMAGE = `${SITE}/icon-512.png`;

// --- datos ---
const ctx = {};
vm.createContext(ctx);
const academia = fs.readFileSync(path.join(ROOT, 'js', 'academia.jsx'), 'utf8');
vm.runInContext(
    academia.slice(academia.indexOf('const SERIES = ['), academia.indexOf('// --- FLOW DIAGRAM ---')) +
    '\nglobalThis.ciber = { SERIES, ACADEMIA_POSTS, seriesOf };',
    ctx,
);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'desarrollo-datos.js'), 'utf8') +
    '\nglobalThis.dev = { NIVELES, DESARROLLO_INTRO, DESARROLLO_POSTS, nivelById };', ctx);
const { SERIES, ACADEMIA_POSTS, seriesOf } = ctx.ciber;
const { NIVELES, DESARROLLO_INTRO, DESARROLLO_POSTS, nivelById } = ctx.dev;
const SORTED = [...SERIES].sort((a, b) => a.capa - b.capa);

// --- utilidades ---
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
const publisher = { '@type': 'Organization', name: 'Lameyer', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: IMAGE } };
const breadcrumb = (items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
const metaDescription = (html) => {
    const m = html.slice(0, html.indexOf('</head>')).match(/<meta name="description" content="([^"]*)">/);
    return m ? m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '';
};

const headBlock = ({ type, title, description, url, published, graph }) => [
    '    <!-- seo:inicio · generado por tools/generar-blog.mjs; no editar a mano -->',
    `    <meta property="og:type" content="${type}">`,
    '    <meta property="og:site_name" content="Lameyer">',
    '    <meta property="og:locale" content="es_ES">',
    `    <meta property="og:title" content="${esc(title)}">`,
    `    <meta property="og:description" content="${esc(description)}">`,
    `    <meta property="og:url" content="${url}">`,
    `    <meta property="og:image" content="${IMAGE}">`,
    '    <meta name="twitter:card" content="summary">',
    ...(published ? [`    <meta property="article:published_time" content="${published}">`] : []),
    `    <script type="application/ld+json">${ld({ '@context': 'https://schema.org', '@graph': graph })}</script>`,
    '    <!-- seo:fin -->',
].join('\n');

// #root lleva el texto en <noscript> (sin JavaScript) y, justo después, una copia visible de respaldo:
// si React no llega a montar la página (abierta desde el disco con file://, CDN bloqueado, error de script),
// el guardián la muestra en lugar de dejar la página en blanco. Desde el disco, los enlaces /… se vuelven relativos.
const RESPALDO_CSS = 'body{margin:0}#respaldo{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1a202c;background:#fff;max-width:760px;margin:0 auto;padding:32px 16px 64px;line-height:1.6}'
    + '#respaldo h1{font-size:2rem;line-height:1.15;margin:.5em 0}#respaldo h2{font-size:1.3rem;margin:1.6em 0 .4em}#respaldo a{color:#2563eb;font-weight:600}'
    + '#respaldo .aviso{font-size:.85rem;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;color:#1e3a8a}';
const noscript = (inner, url) => {
    const depth = url.slice(SITE.length).split('/').filter(Boolean).length;
    const raiz = '../'.repeat(depth) || './';
    return `<div id="root">
        <noscript>
${inner}
        </noscript>
    </div>
    <!-- respaldo:inicio · generado por tools/generar-blog.mjs -->
    <style>${RESPALDO_CSS}</style>
    <div id="respaldo" hidden data-raiz="${raiz}">
        <p class="aviso">Vista simplificada: el diseño completo no pudo cargarse. <a href="https://lameyer.net${url.slice(SITE.length)}">Abrir en lameyer.net</a></p>
${inner}
    </div>
    <script>
        (function () {
            var root = document.getElementById('root'), f = document.getElementById('respaldo');
            var montado = function () { for (var c = root.firstElementChild; c; c = c.nextElementSibling) if (c.tagName !== 'NOSCRIPT') return true; return false; };
            var mostrar = function () {
                if (montado() || !f.hidden) return;
                if (location.protocol === 'file:') {
                    var raiz = f.getAttribute('data-raiz');
                    Array.prototype.forEach.call(f.querySelectorAll('a[href^="/"]'), function (a) {
                        var h = a.getAttribute('href'), q = h.search(/[?#]/), ruta = q < 0 ? h : h.slice(0, q);
                        a.setAttribute('href', raiz + ruta.slice(1) + (ruta.charAt(ruta.length - 1) === '/' ? 'index.html' : '') + (q < 0 ? '' : h.slice(q)));
                    });
                }
                f.hidden = false;
            };
            if (window.MutationObserver) new MutationObserver(function () { if (montado()) f.hidden = true; }).observe(root, { childList: true });
            if (location.protocol === 'file:') return mostrar();
            window.addEventListener('error', function () { setTimeout(mostrar, 1500); });
            setTimeout(mostrar, 8000);
        })();
    </script>
    <!-- respaldo:fin -->`;
};

// Páginas escritas a mano: solo se cambian el bloque SEO del <head> real y el <noscript>.
const patchPage = (file, url, block, fallback) => {
    const html = fs.readFileSync(file, 'utf8');
    const cut = html.indexOf('</head>');
    let head = html.slice(0, cut);
    let body = html.slice(cut);
    if (!head.includes('rel="canonical"')) {
        head = head.replace(/(<meta name="description" content="[^"]*">)/, `$1\n    <link rel="canonical" href="${url}">`);
    }
    head = head.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
    head = head.replace(/\n    <!-- seo:inicio[\s\S]*?<!-- seo:fin -->/, '');
    head = head.replace(/(<link rel="canonical" href="[^"]*">)/, `$1\n${block}`);
    body = body.replace(/\n    <!-- respaldo:inicio[\s\S]*?<!-- respaldo:fin -->/, '');
    body = body.replace(/<div id="root">(?:\s*<noscript>[\s\S]*?<\/noscript>\s*)?<\/div>/, noscript(fallback, url));
    fs.writeFileSync(file, head + body);
};

// Páginas generadas por completo.
const fullPage = ({ title, description, url, block, fallback, scripts, boot }) => `<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Página generada por tools/generar-blog.mjs: edita js/desarrollo-datos.js o js/blog.jsx, no este archivo. -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${url}">
${block}

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/site.css">

    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
</head>
<body>

    ${noscript(fallback, url)}

    <script type="text/babel" src="/js/layout.jsx"></script>
    <script type="text/babel" src="/js/acceso.jsx"></script>
    <script src="/js/desarrollo-datos.js"></script>
${scripts.map(s => `    <script type="text/babel" src="${s}"></script>`).join('\n')}
    <script type="text/babel">
        ${boot}
    </script>
</body>
</html>
`;

const write = (rel, html) => {
    const file = path.join(ROOT, rel, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
};

const collection = (url, name, description, items, crumbs) => [
    {
        '@type': 'CollectionPage', '@id': `${url}#coleccion`, name, description, url, inLanguage: 'es', publisher,
        mainEntity: { '@type': 'ItemList', itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${p.path}`, name: p.title })) },
    },
    breadcrumb(crumbs),
];

// --- 1. Ciberseguridad: entradas ---
for (const post of ACADEMIA_POSTS) {
    const s = seriesOf(post);
    const url = `${SITE}${post.path}`;
    const file = path.join(ROOT, post.path, 'index.html');
    const description = metaDescription(fs.readFileSync(file, 'utf8')) || post.summary;
    const capa = `Capa ${s.capa} · ${s.label}`;
    const graph = [
        {
            '@type': 'TechArticle', '@id': `${url}#articulo`, headline: post.title, description: post.summary,
            datePublished: post.published, dateModified: post.updated || post.published, inLanguage: 'es', url, mainEntityOfPage: url, image: IMAGE,
            keywords: [...(post.tags || []), ...(post.threats || [])].join(', '),
            articleSection: `Ciberseguridad · ${capa}`, timeRequired: `PT${post.readTime}M`, author: publisher, publisher,
        },
        breadcrumb([['Inicio', `${SITE}/`], ['Blog', `${SITE}/blog/`], ['Ciberseguridad', `${SITE}/blog/ciberseguridad/`], [capa, `${SITE}/blog/ciberseguridad/?series=${s.id}`], [post.title, url]]),
    ];
    patchPage(file, url, headBlock({ type: 'article', title: post.title, description, url, published: post.published, graph }), [
        `            <h1>${esc(post.title)}</h1>`,
        `            <p>${esc(post.summary)}</p>`,
        `            <p><a href="/blog/ciberseguridad/?series=${s.id}">Más artículos de la ${esc(capa)}</a> · <a href="/blog/ciberseguridad/">Ciberseguridad</a> · <a href="/blog/">Blog Lameyer</a></p>`,
    ].join('\n'));
}

// --- 2. Ciberseguridad: índice (todas las capas primero) ---
{
    const url = `${SITE}/blog/ciberseguridad/`;
    const file = path.join(ROOT, 'blog', 'ciberseguridad', 'index.html');
    const description = metaDescription(fs.readFileSync(file, 'utf8'));
    const ordered = SORTED.flatMap(s => ACADEMIA_POSTS.filter(p => seriesOf(p).id === s.id));
    patchPage(file, url,
        headBlock({ type: 'website', title: 'Ciberseguridad por capas · Blog Lameyer', description, url,
            graph: collection(url, 'Ciberseguridad por capas', description, ordered, [['Inicio', `${SITE}/`], ['Blog', `${SITE}/blog/`], ['Ciberseguridad', url]]) }),
        [
            '            <h1>Ciberseguridad por capas, del perímetro al núcleo</h1>',
            `            <p>${esc(description)}</p>`,
            '            <h2>Todas las capas</h2>',
            '            <ol>',
            ...SORTED.map(s => `                <li><a href="/blog/ciberseguridad/?series=${s.id}">Capa ${s.capa} · ${esc(s.label)}</a>: ${esc(s.capaRole)}</li>`),
            '            </ol>',
            ...SORTED.flatMap(s => [
                `            <h2>Capa ${s.capa} · ${esc(s.label)}</h2>`,
                '            <ul>',
                ...ACADEMIA_POSTS.filter(p => seriesOf(p).id === s.id).map(p => `                <li><a href="${p.path}">${esc(p.title)}</a></li>`),
                '            </ul>',
            ]),
        ].join('\n'));
}

// --- 3. Desarrollo: artículos (generados) ---
const devPosts = [DESARROLLO_INTRO, ...DESARROLLO_POSTS];
for (const post of devPosts) {
    const url = `${SITE}${post.path}`;
    const intro = post.nivel === 0;
    const n = intro ? null : nivelById(post.nivel);
    const section = intro ? 'Introducción' : `Nivel ${n.n} · ${n.nombre}`;
    const crumbs = [['Inicio', `${SITE}/`], ['Blog', `${SITE}/blog/`], ['Desarrollo', `${SITE}/blog/desarrollo/`],
        ...(intro ? [] : [[section, `${SITE}/blog/desarrollo/?nivel=${n.n}`]]), [post.title, url]];
    const graph = [
        {
            '@type': 'Article', '@id': `${url}#articulo`, headline: post.title, description: post.summary,
            datePublished: post.published, dateModified: post.updated || post.published, inLanguage: 'es', url, mainEntityOfPage: url, image: IMAGE,
            keywords: post.tags.join(', '), articleSection: `Desarrollo · ${section}`, timeRequired: `PT${post.readTime}M`, author: publisher, publisher,
        },
        breadcrumb(crumbs),
    ];
    const body = intro
        ? post.secciones.flatMap(sec => [
            `            <h2>${esc(sec.h)}</h2>`,
            ...(sec.p || []).map(t => `            <p>${esc(t)}</p>`),
            ...(sec.ul ? ['            <ul>', ...sec.ul.map(t => `                <li>${esc(t)}</li>`), '            </ul>'] : []),
        ])
        : [
            '            <h2>Qué es</h2>', `            <p>${esc(post.que)}</p>`,
            '            <h2>Por qué importa</h2>', `            <p>${esc(post.porque)}</p>`,
            '            <h2>Qué sabrás hacer al terminar</h2>', '            <ul>', ...post.aprendes.map(t => `                <li>${esc(t)}</li>`), '            </ul>',
            '            <h2>Dónde encaja en la ruta</h2>', `            <p>${esc(post.encaja)}</p>`,
        ];
    write(post.path, fullPage({
        title: `${post.title} - Blog Lameyer`, description: post.summary, url,
        block: headBlock({ type: 'article', title: post.title, description: post.summary, url, published: post.published, graph }),
        fallback: [
            `            <p><a href="/blog/">Blog</a> / <a href="/blog/desarrollo/">Desarrollo</a> / ${esc(section)}</p>`,
            `            <h1>${esc(post.title)}</h1>`,
            `            <p>${esc(post.summary)}</p>`,
            ...body,
            `            <p><strong>La regla:</strong> ${esc(post.regla)}</p>`,
        ].join('\n'),
        scripts: ['/js/blog.jsx'],
        boot: 'renderDesarrolloPost();',
    }));
}

// --- 4. Desarrollo: índice (todos los niveles primero) ---
{
    const url = `${SITE}/blog/desarrollo/`;
    const description = 'La ruta de la Academia Lameyer en seis niveles: lanzamiento, visibilidad, operaciones, nube y datos, publicidad y agentes de IA. Un artículo por módulo.';
    write('blog/desarrollo', fullPage({
        title: 'Desarrollo por niveles - Blog Lameyer', description, url,
        block: headBlock({ type: 'website', title: 'Desarrollo por niveles · Blog Lameyer', description, url,
            graph: collection(url, 'Desarrollo por niveles', description, devPosts, [['Inicio', `${SITE}/`], ['Blog', `${SITE}/blog/`], ['Desarrollo', url]]) }),
        fallback: [
            '            <h1>Desarrollo: seis niveles, un módulo a la vez</h1>',
            `            <p>${esc(description)}</p>`,
            '            <h2>Todos los niveles</h2>',
            '            <ol>',
            ...NIVELES.map(x => `                <li><a href="/blog/desarrollo/?nivel=${x.n}">Nivel ${x.n} · ${esc(x.nombre)}</a>: ${esc(x.objetivo)}</li>`),
            '            </ol>',
            `            <p><a href="${DESARROLLO_INTRO.path}">${esc(DESARROLLO_INTRO.title)}</a></p>`,
            ...NIVELES.flatMap(x => [
                `            <h2>Nivel ${x.n} · ${esc(x.nombre)}</h2>`,
                '            <ul>',
                ...DESARROLLO_POSTS.filter(p => p.nivel === x.n).map(p => `                <li><a href="${p.path}">${esc(p.title)}</a></li>`),
                '            </ul>',
            ]),
        ].join('\n'),
        scripts: ['/js/blog.jsx'],
        boot: 'renderPage(DesarrolloIndex);',
    }));
}

// --- 5. Portada del blog ---
{
    const url = `${SITE}/blog/`;
    const description = 'Blog de Lameyer y su Academia: Ciberseguridad ordenada por capas y Desarrollo ordenado por los seis niveles de la Academia.';
    write('blog', fullPage({
        title: 'Blog Lameyer: ciberseguridad y desarrollo', description, url,
        block: headBlock({ type: 'website', title: 'Blog Lameyer', description, url,
            graph: [
                { '@type': 'Blog', '@id': `${url}#blog`, name: 'Blog Lameyer', description, url, inLanguage: 'es', publisher },
                breadcrumb([['Inicio', `${SITE}/`], ['Blog', url]]),
            ] }),
        fallback: [
            '            <h1>Blog Lameyer</h1>',
            `            <p>${esc(description)}</p>`,
            '            <ul>',
            `                <li><a href="/blog/ciberseguridad/">Ciberseguridad</a>: ${ACADEMIA_POSTS.length} artículos en ${SERIES.length} capas</li>`,
            `                <li><a href="/blog/desarrollo/">Desarrollo</a>: ${devPosts.length} artículos en ${NIVELES.length} niveles</li>`,
            '            </ul>',
        ].join('\n'),
        scripts: ['/js/academia.jsx', '/js/blog.jsx'],
        boot: 'renderPage(BlogHome);',
    }));
}

console.log(`Blog: ${ACADEMIA_POSTS.length} entradas de Ciberseguridad (SEO), ${devPosts.length} artículos de Desarrollo generados, índices /blog/, /blog/ciberseguridad/ y /blog/desarrollo/.`);
