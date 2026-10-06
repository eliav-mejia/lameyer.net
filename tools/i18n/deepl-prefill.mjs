#!/usr/bin/env node
// Pre-fills missing translations with DeepL before they are reviewed in the TMS (Tolgee or Crowdin).
// PENDING (1.0.5): the site has no locale files yet. It runs as soon as option A or B of
// _docs/src/v1.0.5.html creates them: one JSON file per page (namespace) per language.
//
//   locales/es/terminos.json   source (Spanish, the language the site is written in)
//   locales/en/terminos.json   target: only missing or empty keys are filled, nothing is overwritten
//
// Usage (Node 18+, no dependencies):
//   DEEPL_API_KEY=xxxx:fx node tools/i18n/deepl-prefill.mjs --target en
//   node tools/i18n/deepl-prefill.mjs --target en --dry-run           # list what would be translated
//   options: --src locales/es  --out locales  --ns terminos,blog  --keep "Lameyer,MC-SE"  --formality more
//
// Placeholders survive translation: {{name}} (react-i18next), {name} (next-intl / ICU) and the --keep terms
// are wrapped in <x> tags that DeepL is told to ignore. Every key filled by DeepL is listed in
// locales/<target>/_prefill.json so reviewers know which strings are machine translations.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
}, []));

const SRC = args.src || 'locales/es';
const OUT = args.out || 'locales';
const TARGET = args.target;
const DRY = Boolean(args['dry-run']);
const ONLY = args.ns ? String(args.ns).split(',') : null;
const KEEP = ['Lameyer', 'MC-SE', 'Modular Core', 'Serverless Edge', ...(args.keep ? String(args.keep).split(',') : [])].map(s => s.trim()).filter(Boolean);
// DeepL needs a regional variant for English and Portuguese targets.
const DEEPL_TARGET = { en: 'EN-GB', pt: 'PT-PT' }[TARGET] || String(TARGET || '').toUpperCase();
const KEY = process.env.DEEPL_API_KEY || '';
const API = process.env.DEEPL_API_URL || (KEY.endsWith(':fx') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate');
const BATCH = 50;   // DeepL accepts up to 50 texts per request

if (!TARGET) {
    console.error('Falta --target (por ejemplo --target en).');
    process.exit(1);
}
if (!DRY && !KEY) {
    console.error('Falta DEEPL_API_KEY. Usa --dry-run para ver qué se traduciría sin llamar a DeepL.');
    process.exit(1);
}

// { a: { b: 'x' } } <-> { 'a.b': 'x' }
const flatten = (obj, prefix = '') => Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v) ? { ...acc, ...flatten(v, key) } : { ...acc, [key]: v };
}, {});
const unflatten = (flat) => Object.entries(flat).reduce((acc, [key, v]) => {
    const parts = key.split('.');
    parts.reduce((node, part, i) => (node[part] = i === parts.length - 1 ? v : node[part] || {}), acc);
    return acc;
}, {});

const readJson = async (file) => {
    try { return JSON.parse(await readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return {}; throw new Error(`${file}: ${e.message}`); }
};

// Protect placeholders and kept terms as <x>…</x>; everything else is XML-escaped.
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unescapeXml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const PROTECT = new RegExp([
    '\\{\\{[^}]+\\}\\}',                    // {{name}}
    '\\{[^{}]+\\}',                          // {name} / ICU
    ...KEEP.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
].join('|'), 'g');
const protect = (text) => {
    let out = '', last = 0;
    for (const m of text.matchAll(PROTECT)) {
        out += escapeXml(text.slice(last, m.index)) + `<x>${escapeXml(m[0])}</x>`;
        last = m.index + m[0].length;
    }
    return out + escapeXml(text.slice(last));
};
const restore = (xml) => unescapeXml(xml.replace(/<x>([\s\S]*?)<\/x>/g, '$1'));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function translate(texts) {
    const body = {
        text: texts.map(protect),
        source_lang: 'ES',
        target_lang: DEEPL_TARGET,
        tag_handling: 'xml',
        ignore_tags: ['x'],
        preserve_formatting: true,
        ...(args.formality ? { formality: args.formality } : {}),
    };
    for (let attempt = 1; ; attempt++) {
        const res = await fetch(API, {
            method: 'POST',
            headers: { Authorization: `DeepL-Auth-Key ${KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) return (await res.json()).translations.map(t => restore(t.text));
        // 429 = too many requests, 456 = quota exceeded (free tier: 500,000 characters a month)
        if (res.status === 456) throw new Error('Cuota de DeepL agotada (456). El plan gratuito incluye 500.000 caracteres al mes.');
        if ((res.status === 429 || res.status >= 500) && attempt < 5) { await sleep(1000 * 2 ** attempt); continue; }
        throw new Error(`DeepL respondió ${res.status}: ${await res.text()}`);
    }
}

const files = (await readdir(SRC)).filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .filter(f => !ONLY || ONLY.includes(path.basename(f, '.json')));
if (!files.length) {
    console.error(`No hay namespaces en ${SRC}/ (se espera un .json por página).`);
    process.exit(1);
}

const outDir = path.join(OUT, TARGET);
const prefillFile = path.join(outDir, '_prefill.json');
const prefill = await readJson(prefillFile);
let totalKeys = 0, totalChars = 0;

for (const file of files) {
    const ns = path.basename(file, '.json');
    const source = flatten(await readJson(path.join(SRC, file)));
    const targetFile = path.join(outDir, file);
    const target = flatten(await readJson(targetFile));
    const missing = Object.keys(source).filter(k => typeof source[k] === 'string' && source[k].trim() && !(typeof target[k] === 'string' && target[k].trim()));
    const chars = missing.reduce((n, k) => n + source[k].length, 0);
    totalKeys += missing.length; totalChars += chars;
    console.log(`${ns}: ${missing.length} claves por traducir (${chars} caracteres)`);
    if (DRY || !missing.length) continue;

    for (let i = 0; i < missing.length; i += BATCH) {
        const keys = missing.slice(i, i + BATCH);
        const out = await translate(keys.map(k => source[k]));
        keys.forEach((k, j) => { target[k] = out[j]; });
    }
    // Same key order as the source file, so diffs stay readable; keys only present in the target are kept at the end.
    const ordered = Object.fromEntries([...Object.keys(source), ...Object.keys(target).filter(k => !(k in source))]
        .filter(k => k in target).map(k => [k, target[k]]));
    await mkdir(outDir, { recursive: true });
    await writeFile(targetFile, JSON.stringify(unflatten(ordered), null, 2) + '\n');
    prefill[ns] = [...new Set([...(prefill[ns] || []), ...missing])].sort();
}

if (!DRY && totalKeys) {
    await writeFile(prefillFile, JSON.stringify({ _note: 'Claves rellenadas por DeepL, pendientes de revisión en el TMS.', ...prefill }, null, 2) + '\n');
}
console.log(`${DRY ? 'Simulación: ' : ''}${totalKeys} claves, ${totalChars} caracteres${DRY ? '' : ` traducidos a ${DEEPL_TARGET}`}.`);
