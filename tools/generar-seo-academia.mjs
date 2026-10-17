// Escribe las etiquetas SEO estáticas de la academia a partir de SERIES y ACADEMIA_POSTS de js/academia.jsx.
//
// Uso (desde la raíz del repositorio):   node tools/generar-seo-academia.mjs
//
// En cada entrada /academia/<serie>/<slug>/index.html y en /academia/index.html:
//   - el bloque entre <!-- seo:inicio --> y <!-- seo:fin --> del <head>: Open Graph y JSON-LD
//     (TechArticle + BreadcrumbList en las entradas, CollectionPage + ItemList en el panel);
//   - el <noscript> dentro de <div id="root">: h1, resumen y enlaces para quien lee sin JavaScript.
// El <title>, la descripción y el contenido de cada página se escriben a mano y no se tocan.
// Vuelve a ejecutarlo tras añadir una entrada o cambiar su título, resumen o fecha.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://lameyer.net';
const IMAGE = `${SITE}/icon-512.png`;

// Los datos son literales de JavaScript (sin JSX) entre SERIES y el diagrama de flujo.
const src = fs.readFileSync(path.join(ROOT, 'js', 'academia.jsx'), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(
    src.slice(src.indexOf('const SERIES = ['), src.indexOf('// --- FLOW DIAGRAM ---')) +
    '\nglobalThis.data = { SERIES, ACADEMIA_POSTS, seriesOf };',
    ctx,
);
const { ACADEMIA_POSTS, seriesOf } = ctx.data;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
const publisher = { '@type': 'Organization', name: 'Lameyer', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: IMAGE } };

const metaDescription = (html) => {
    const m = html.slice(0, html.indexOf('</head>')).match(/<meta name="description" content="([^"]*)">/);
    return m ? m[1] : '';
};

const headBlock = ({ type, title, description, url, published, graph }) => [
    '    <!-- seo:inicio · generado por tools/generar-seo-academia.mjs; no editar a mano -->',
    `    <meta property="og:type" content="${type}">`,
    '    <meta property="og:site_name" content="Lameyer">',
    '    <meta property="og:locale" content="es_ES">',
    `    <meta property="og:title" content="${esc(title)}">`,
    `    <meta property="og:description" content="${description}">`,
    `    <meta property="og:url" content="${url}">`,
    `    <meta property="og:image" content="${IMAGE}">`,
    '    <meta name="twitter:card" content="summary">',
    ...(published ? [`    <meta property="article:published_time" content="${published}">`] : []),
    `    <script type="application/ld+json">${ld({ '@context': 'https://schema.org', '@graph': graph })}</script>`,
    '    <!-- seo:fin -->',
].join('\n');

const noscript = (inner) => `<div id="root">
        <noscript>
${inner}
        </noscript>
    </div>`;

// Solo se edita el <head> real: algunas entradas muestran <link rel="canonical"> o noindex en sus ejemplos de código.
const writePage = (file, url, block, fallback) => {
    const html = fs.readFileSync(file, 'utf8');
    const cut = html.indexOf('</head>');
    let head = html.slice(0, cut);
    let body = html.slice(cut);
    if (!head.includes('rel="canonical"')) {
        head = head.replace(/(<meta name="description" content="[^"]*">)/, `$1\n    <link rel="canonical" href="${url}">`);
    }
    head = head.replace(/\n    <!-- seo:inicio[\s\S]*?<!-- seo:fin -->/, '');
    head = head.replace(/(<link rel="canonical" href="[^"]*">)/, `$1\n${block}`);
    body = body.replace(/<div id="root">(?:\s*<noscript>[\s\S]*?<\/noscript>\s*)?<\/div>/, noscript(fallback));
    fs.writeFileSync(file, head + body);
};

const breadcrumb = (items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});

for (const post of ACADEMIA_POSTS) {
    const s = seriesOf(post);
    const url = `${SITE}${post.path}`;
    const file = path.join(ROOT, post.path, 'index.html');
    const description = metaDescription(fs.readFileSync(file, 'utf8')) || esc(post.summary);
    const graph = [
        {
            '@type': 'TechArticle',
            '@id': `${url}#articulo`,
            headline: post.title,
            description: post.summary,
            datePublished: post.published,
            dateModified: post.updated || post.published,
            inLanguage: 'es',
            url,
            mainEntityOfPage: url,
            image: IMAGE,
            keywords: [...(post.tags || []), ...(post.threats || [])].join(', '),
            articleSection: s.label,
            timeRequired: `PT${post.readTime}M`,
            author: publisher,
            publisher,
        },
        breadcrumb([['Inicio', `${SITE}/`], ['Academia', `${SITE}/academia/`], [s.label, `${SITE}/academia/?series=${s.id}`], [post.title, url]]),
    ];
    writePage(file, url, headBlock({ type: 'article', title: post.title, description, url, published: post.published, graph }), [
        `            <h1>${esc(post.title)}</h1>`,
        `            <p>${esc(post.summary)}</p>`,
        `            <p><a href="/academia/?series=${s.id}">Más entradas de ${esc(s.label)}</a> · <a href="/academia/">Academia Lameyer</a></p>`,
    ].join('\n'));
}

// Panel /academia/: lista de todas las entradas
{
    const url = `${SITE}/academia/`;
    const file = path.join(ROOT, 'academia', 'index.html');
    const description = metaDescription(fs.readFileSync(file, 'utf8'));
    const graph = [
        {
            '@type': 'CollectionPage',
            '@id': `${url}#panel`,
            name: 'Academia Lameyer',
            description,
            url,
            inLanguage: 'es',
            publisher,
            mainEntity: {
                '@type': 'ItemList',
                itemListElement: ACADEMIA_POSTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${p.path}`, name: p.title })),
            },
        },
        breadcrumb([['Inicio', `${SITE}/`], ['Academia', url]]),
    ];
    writePage(file, url, headBlock({ type: 'website', title: 'Academia Lameyer', description, url, graph }), [
        '            <h1>Academia Lameyer: casos y soluciones MC-SE</h1>',
        `            <p>${description}</p>`,
        '            <ul>',
        ...ACADEMIA_POSTS.map(p => `                <li><a href="${p.path}">${esc(p.title)}</a></li>`),
        '            </ul>',
    ].join('\n'));
}

console.log(`SEO estático escrito en ${ACADEMIA_POSTS.length} entradas y en /academia/`);
