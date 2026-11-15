// Blog Lameyer: portada (/blog/), categoría Desarrollo (/blog/desarrollo/) y plantilla de sus artículos.
// Carga: /js/layout.jsx → /js/acceso.jsx → /js/desarrollo-datos.js (datos, JS plano) → [/js/academia.jsx solo en /blog/] → /js/blog.jsx
// La categoría Ciberseguridad (/blog/ciberseguridad/) vive en /js/academia.jsx (las capas).

const BLOG_CATEGORIAS = [
    {
        id: 'ciberseguridad', href: '/blog/ciberseguridad/', nombre: 'Ciberseguridad', orden: 'por capas',
        texto: 'Defensa en capas, del perímetro al núcleo: APIs, edge serverless, integraciones, núcleo modular y lo que el sistema expone.',
    },
    {
        id: 'desarrollo', href: '/blog/desarrollo/', nombre: 'Desarrollo', orden: 'por niveles',
        texto: 'La ruta de la Academia Lameyer en seis niveles: un artículo por módulo para saber qué aprenderás y por qué importa.',
    },
];

const ESTADOS = {
    guia: { label: 'Instructivo disponible', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    video: { label: 'Grabación disponible', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
    proximamente: { label: 'Próximamente', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const blogDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
const nivelLabel = (n) => n === 0 ? 'Introducción' : `Nivel ${n}`;
const postsDeNivel = (n) => DESARROLLO_POSTS.filter(p => p.nivel === n);

const Crumbs = ({ items }) => (
    <nav aria-label="Ruta" className="pt-10 relative z-10">
        <ol className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            {items.map(([label, href], i) => (
                <li key={label} className="flex items-center gap-2">
                    {i ? <span aria-hidden="true">/</span> : null}
                    {href ? <a href={href} className="hover:text-blue-600 transition-colors">{label}</a> : <span className="text-blue-600">{label}</span>}
                </li>
            ))}
        </ol>
    </nav>
);

const Pill = ({ active, onClick, children, count }) => (
    <button onClick={onClick} aria-pressed={active}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${active
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600'}`}>
        {children}
        {count !== undefined && <span className={`px-1.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
    </button>
);

const NivelSelect = ({ label, value, onChange, options }) => (
    <label className="block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1.5">{label}</span>
        <span className="relative block">
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className={`w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border bg-white text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${value !== 'all' ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'}`}>
                {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
        </span>
    </label>
);

// The modules of a level as a dropdown menu: closed it names the current module, open it lists the level in order.
const ModulosMenu = ({ nivel, actual }) => {
    const list = postsDeNivel(nivel.n);
    const i = list.indexOf(actual);
    return (
        <details className="group rounded-[1.5rem] border border-gray-100 bg-white/95 shadow-lg shadow-gray-200/40 open:shadow-xl">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 px-5 md:px-6 py-4">
                <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Nivel {nivel.n} · {nivel.nombre} · módulo {i + 1} de {list.length}</span>
                    <span className="block font-black text-gray-900 truncate">{actual.modulo}</span>
                </span>
                <span aria-hidden="true" className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-open:rotate-180">▾</span>
            </summary>
            <ol className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {list.map((p, k) => (
                    <li key={p.slug}>
                        <a href={p.path} aria-current={p === actual ? 'page' : undefined}
                            className={`flex items-baseline gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${p === actual ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
                            <span className={`text-[10px] uppercase tracking-[0.15em] flex-shrink-0 ${p === actual ? 'text-blue-100' : 'text-blue-500'}`}>{String(k + 1).padStart(2, '0')}</span>
                            <span>{p.modulo}</span>
                        </a>
                    </li>
                ))}
            </ol>
        </details>
    );
};

const EstadoBadge = ({ estado }) => (
    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${ESTADOS[estado].tone}`}>{ESTADOS[estado].label}</span>
);

const ModuloCard = ({ post }) => (
    <a href={post.path}
        className="group flex flex-col p-6 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 animate-fade-in">
        <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">{nivelLabel(post.nivel)} · Módulo</span>
            <EstadoBadge estado={post.estado} />
        </div>
        <h3 className="text-lg font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-5 flex-1">{post.summary}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.slice(0, 4).map(t => <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{t}</span>)}
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>{post.readTime} min de lectura</span>
            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">Leer →</span>
        </div>
    </a>
);

const IntroCard = () => (
    <a href={DESARROLLO_INTRO.path}
        className="group block p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 text-white shadow-2xl hover:-translate-y-1 transition-all">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-3">Empieza aquí · Introducción</p>
        <h3 className="text-2xl md:text-3xl font-black leading-tight mb-3 group-hover:text-blue-300 transition-colors">{DESARROLLO_INTRO.title}</h3>
        <p className="text-slate-300 font-medium leading-relaxed max-w-3xl">{DESARROLLO_INTRO.summary}</p>
        <p className="mt-6 text-sm font-bold text-blue-400">Leer la introducción →</p>
    </a>
);

// --- /blog/ ---
const BlogHome = () => {
    const ciber = typeof ACADEMIA_POSTS !== 'undefined' ? ACADEMIA_POSTS.length : 0;
    const counts = { ciberseguridad: `${ciber} artículos · 5 capas`, desarrollo: `${DESARROLLO_POSTS.length + 1} artículos · ${NIVELES.length} niveles` };
    return (
        <>
            <section className="pt-12 md:pt-24 pb-10 md:pb-14 text-center relative z-10 animate-fade-in">
                <div className="inline-block mb-6 md:mb-8 px-4 md:px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.25em] md:tracking-[0.5em] uppercase bg-blue-50/50">Blog · Academia Lameyer</div>
                <h1 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter mb-6 md:mb-8 leading-[0.95]">Aprende a construir<br/><span className="text-blue-600">y a proteger</span></h1>
                <p className="text-base md:text-xl text-gray-500 max-w-3xl mx-auto font-medium">Dos categorías: Ciberseguridad, ordenada por capas, y Desarrollo, ordenado por los niveles de la Academia.</p>
            </section>
            <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-16 relative z-10" aria-label="Categorías">
                {BLOG_CATEGORIAS.map(c => (
                    <a key={c.id} href={c.href} className="group p-7 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40 hover:border-blue-500 hover:-translate-y-1 transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 mb-4">Categoría · {c.orden}</p>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4 group-hover:text-blue-600 transition-colors">{c.nombre}</h2>
                        <p className="text-gray-500 font-medium leading-relaxed mb-8">{c.texto}</p>
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-gray-400 uppercase tracking-widest">{counts[c.id]}</span>
                            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">Entrar →</span>
                        </div>
                    </a>
                ))}
            </section>
            <section className="max-w-6xl mx-auto pb-24 relative z-10"><IntroCard /></section>
        </>
    );
};

// --- /blog/desarrollo/ ---
const readNivel = () => {
    const n = parseInt(new URLSearchParams(window.location.search).get('nivel'), 10);
    return NIVELES.some(x => x.n === n) ? n : 'all';
};

const DesarrolloIndex = () => {
    const [nivel, setNivel] = useState(readNivel);
    const [q, setQ] = useState('');
    useEffect(() => {
        const qs = nivel === 'all' ? '' : `?nivel=${nivel}`;
        window.history.replaceState(null, '', window.location.pathname + qs);
    }, [nivel]);

    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const match = (p) => !words.length || words.every(w => [p.title, p.summary, p.modulo, ...p.tags].join(' ').toLowerCase().includes(w));
    const visibles = NIVELES.filter(x => nivel === 'all' || x.n === nivel);
    const total = visibles.reduce((sum, x) => sum + postsDeNivel(x.n).filter(match).length, 0);

    return (
        <>
            <div className="max-w-7xl mx-auto"><Crumbs items={[['Blog', '/blog/'], ['Desarrollo', null]]} /></div>

            <section className="pt-8 md:pt-10 pb-8 md:pb-10 text-center relative z-10 animate-fade-in">
                <div className="inline-block mb-6 md:mb-8 px-4 md:px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.25em] md:tracking-[0.5em] uppercase bg-blue-50/50">Blog · Desarrollo · Por niveles</div>
                <h1 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter mb-6 md:mb-8 leading-[0.95]">Seis niveles,<br/><span className="text-blue-600">un módulo a la vez</span></h1>
                <p className="text-base md:text-xl text-gray-500 max-w-3xl mx-auto font-medium">
                    La ruta de la Academia Lameyer, de publicar tu primer sitio a operar un negocio con agentes de IA. Un artículo por módulo:
                    qué es, por qué importa y qué sabrás hacer. Los instructivos paso a paso se quedan dentro de la Academia.
                </p>
            </section>

            <div className="md:hidden mb-8 relative z-10">
                <NivelSelect label="Nivel" value={String(nivel)} onChange={(v) => setNivel(v === 'all' ? 'all' : Number(v))}
                    options={[['all', `Todos los niveles (${DESARROLLO_POSTS.length})`], ...NIVELES.map(x => [String(x.n), `Nivel ${x.n} · ${x.nombre} (${postsDeNivel(x.n).length})`])]} />
            </div>
            <nav className="hidden md:flex flex-wrap justify-center gap-2 mb-12 relative z-10" aria-label="Niveles">
                <Pill active={nivel === 'all'} onClick={() => setNivel('all')} count={DESARROLLO_POSTS.length}>Todos los niveles</Pill>
                {NIVELES.map(x => (
                    <Pill key={x.n} active={nivel === x.n} onClick={() => setNivel(x.n)} count={postsDeNivel(x.n).length}>{x.n} · {x.nombre}</Pill>
                ))}
            </nav>

            {/* All levels first */}
            {nivel === 'all' ? (
                <section className="max-w-7xl mx-auto mb-16 relative z-10" aria-labelledby="niveles-title">
                    <h2 id="niveles-title" className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">Todos los niveles · en orden</h2>
                    <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {NIVELES.map(x => (
                            <li key={x.n}>
                                <button onClick={() => setNivel(x.n)} className="group w-full h-full text-left p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 bg-white/90 shadow-xl shadow-gray-200/40 hover:border-blue-500 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">{x.n}</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Nivel {x.n} · {x.corto}</p>
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{x.nombre}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">{x.objetivo}</p>
                                    <ul className="hidden md:flex flex-wrap gap-1.5 mb-4">
                                        {postsDeNivel(x.n).map(p => <li key={p.slug} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{p.modulo}</li>)}
                                    </ul>
                                    <p className="text-xs font-bold text-gray-400">{postsDeNivel(x.n).length} módulos <span className="text-blue-600">→</span></p>
                                </button>
                            </li>
                        ))}
                    </ol>
                </section>
            ) : null}

            <section className="max-w-7xl mx-auto mb-16 relative z-10"><IntroCard /></section>

            {/* Then one article per module, grouped by level */}
            <section className="max-w-7xl mx-auto pb-24 relative z-20" aria-labelledby="modulos-title">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <h2 id="modulos-title" className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{nivel === 'all' ? 'Todos los módulos por nivel' : `Módulos del Nivel ${nivel}`}</h2>
                    <div className="w-full md:w-80">
                        <label htmlFor="dev-search" className="sr-only">Buscar en desarrollo</label>
                        <input id="dev-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: Stripe, Odoo, DNS…"
                            className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                        <p className="mt-2 text-xs font-bold text-gray-400" aria-live="polite">{total} {total === 1 ? 'artículo' : 'artículos'}</p>
                    </div>
                </div>
                {visibles.map(x => {
                    const list = postsDeNivel(x.n).filter(match);
                    if (!list.length) return null;
                    return (
                        <div key={x.n} className="mb-16">
                            <div className="mb-6 pb-3 border-b border-gray-200">
                                <h3 className="text-2xl font-black text-gray-900"><span className="text-blue-600">Nivel {x.n}</span> · {x.nombre}</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Al terminar: {x.resultado}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {list.map(p => <ModuloCard key={p.slug} post={p} />)}
                            </div>
                        </div>
                    );
                })}
                {!total ? <p className="p-16 rounded-[2rem] border border-dashed border-gray-300 text-center font-bold text-gray-500">Ningún módulo coincide con la búsqueda.</p> : null}
            </section>

            <RegisterCTA title="¿Quieres entrar en la Academia?" text="Los instructivos completos, con ejercicios y casos reales, se comparten con quienes forman parte de la Academia Lameyer." />
        </>
    );
};

// --- /blog/desarrollo/<nivel>/<slug>/ ---
const DesarrolloArticle = ({ post }) => {
    const intro = post.nivel === 0;
    const n = intro ? null : nivelById(post.nivel);
    const lista = [DESARROLLO_INTRO, ...DESARROLLO_POSTS];
    const i = lista.indexOf(post);
    const prev = lista[i - 1];
    const next = lista[i + 1];
    useEffect(() => { document.title = `${post.title} - Blog Lameyer`; }, []);

    const Sec = ({ h, children }) => (
        <>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-12 mb-5">{h}</h2>
            {children}
        </>
    );
    const Para = ({ children }) => <p className="text-lg text-gray-600 leading-relaxed mb-5">{children}</p>;
    const List = ({ items }) => (
        <ul className="space-y-3 mb-6">
            {items.map((it, k) => (
                <li key={k} className="flex gap-3 text-lg text-gray-600 leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-3 rounded-full bg-blue-500 flex-shrink-0"></span><span>{it}</span>
                </li>
            ))}
        </ul>
    );

    const NavCard = ({ p, dir }) => p ? (
        <a href={p.path} className={`group flex-1 p-6 rounded-[2rem] border border-gray-100 bg-white/90 shadow-lg shadow-gray-200/40 hover:border-blue-500 transition-all ${dir === 'next' ? 'text-right' : ''}`}>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 mb-2">{dir === 'next' ? `Siguiente · ${nivelLabel(p.nivel)} →` : `← Anterior · ${nivelLabel(p.nivel)}`}</span>
            <span className="block font-black text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</span>
        </a>
    ) : <div className="flex-1 hidden md:block"></div>;

    return (
        <>
            <header className="max-w-4xl mx-auto pb-10 relative z-10 animate-fade-in">
                <Crumbs items={[['Blog', '/blog/'], ['Desarrollo', '/blog/desarrollo/'], [intro ? 'Introducción' : `Nivel ${n.n} · ${n.nombre}`, intro ? null : `/blog/desarrollo/?nivel=${n.n}`]].filter(Boolean)} />
                <div className="flex flex-wrap items-center gap-3 mt-10 mb-6">
                    <span className="px-4 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.3em] uppercase bg-blue-50/50">{intro ? 'Introducción' : `Nivel ${n.n} · Módulo`}</span>
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest">{post.modulo}</span>
                    <EstadoBadge estado={post.estado} />
                </div>
                <h1 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-6">{post.title}</h1>
                <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-6">{post.summary}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400"><time dateTime={post.published}>{blogDate(post.published)}</time> · {post.readTime} min de lectura</p>
            </header>

            {intro ? null : <section className="max-w-6xl mx-auto mb-8 relative z-30"><ModulosMenu nivel={n} actual={post} /></section>}

            <section className="max-w-6xl mx-auto pb-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 md:gap-12 relative z-20">
                <article className="p-6 md:p-12 rounded-[2.5rem] bg-white/95 border border-gray-100 shadow-xl shadow-gray-200/40 [&>h2:first-child]:mt-0">
                    {intro ? post.secciones.map(sec => (
                        <Sec key={sec.h} h={sec.h}>
                            {(sec.p || []).map((t, k) => <Para key={k}>{t}</Para>)}
                            {sec.ul ? <List items={sec.ul} /> : null}
                        </Sec>
                    )) : (
                        <>
                            <Sec h="Qué es"><Para>{post.que}</Para></Sec>
                            <Sec h="Por qué importa"><Para>{post.porque}</Para></Sec>
                            <Sec h="Qué sabrás hacer al terminar"><List items={post.aprendes} /></Sec>
                            <Sec h="Dónde encaja en la ruta"><Para>{post.encaja}</Para></Sec>
                        </>
                    )}
                    <div className="mt-10 flex gap-4 p-6 rounded-2xl bg-blue-50 border border-blue-100">
                        <span className="w-1 rounded-full bg-blue-500 flex-shrink-0"></span>
                        <div>
                            <p className="font-black text-blue-900 mb-1">La regla {intro ? 'de la Academia' : 'del módulo'}</p>
                            <p className="text-blue-900/80 font-medium leading-relaxed">{post.regla}</p>
                        </div>
                    </div>
                </article>

                <aside className="lg:sticky lg:top-40 self-start space-y-6">
                    {intro ? null : (
                        <div className="p-6 rounded-[2rem] bg-slate-900 text-white">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-2">Nivel {n.n} · {n.nombre}</h3>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">{n.objetivo}</p>
                            <a href={`/blog/desarrollo/?nivel=${n.n}`} className="text-sm font-bold text-blue-400 hover:text-blue-300">Ver los {postsDeNivel(n.n).length} módulos del nivel →</a>
                        </div>
                    )}
                    <div className="p-6 rounded-[2rem] bg-white/95 border border-gray-100 shadow-lg shadow-gray-200/40">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Temas</h3>
                        <div className="flex flex-wrap gap-2">{post.tags.map(t => <span key={t} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{t}</span>)}</div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/95 border border-gray-100 shadow-lg shadow-gray-200/40">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Sobre este artículo</h3>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">Es un resumen del módulo. El instructivo paso a paso, con ejercicios y casos reales, forma parte de la Academia Lameyer.</p>
                    </div>
                </aside>
            </section>

            <nav className="max-w-6xl mx-auto pb-8 relative z-20" aria-label="Más módulos">
                <ul className="flex flex-col md:flex-row gap-6">
                    <li className="flex-1 flex"><NavCard p={prev} dir="prev" /></li>
                    <li className="flex-1 flex"><NavCard p={next} dir="next" /></li>
                </ul>
            </nav>

            <RegisterCTA title="¿Quieres el instructivo completo?" text="Únete a la Academia Lameyer y aprende cada módulo con casos reales y acompañamiento." />
        </>
    );
};

// Cada artículo llama a renderDesarrolloPost(); el artículo se encuentra por la URL de la página.
const renderDesarrolloPost = () => {
    const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
    const post = [DESARROLLO_INTRO, ...DESARROLLO_POSTS].find(p => p.path === path);
    renderPage(post ? () => <DesarrolloArticle post={post} /> : () => (
        <section className="max-w-3xl mx-auto py-32 text-center relative z-10">
            <h1 className="text-3xl font-black text-gray-900 mb-4">Este artículo no está en DESARROLLO_POSTS</h1>
            <p className="text-gray-500 font-medium">Añádelo en /js/desarrollo-datos.js y ejecuta node tools/generar-blog.mjs.</p>
        </section>
    ));
};
