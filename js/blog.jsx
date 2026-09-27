// Shared by /blog (dashboard) and every /blog/<post>/ page.
// Load after /assets/layout.jsx.
//
// To add a post: create /blog/<Folder_Name>/index.html (copy an existing post),
// then add an entry to BLOG_POSTS below. The dashboard picks it up automatically.

// The five layers of the Cloudflare defense model, in the order a request crosses them.
const BLOG_TYPES = [
    { id: 'edge', layer: 1, label: 'Edge Layer (DDoS & DNS)', short: 'Edge', zone: 'network' },
    { id: 'waf', layer: 2, label: 'WAF & Bot Layer (Layer 7)', short: 'WAF & Bot', zone: 'application' },
    { id: 'api', layer: 3, label: 'API Endpoint Protection', short: 'API Shield', zone: 'application' },
    { id: 'rate', layer: 4, label: 'Rate Limiting', short: 'Rate Limit', zone: 'application' },
    { id: 'tunnel', layer: 5, label: 'Cloudflare Tunnel', short: 'Tunnel', zone: 'origin' },
];

const ZONES = [
    { id: 'network', label: 'Network (L3/L4 + DNS)' },
    { id: 'application', label: 'Application (L7)' },
    { id: 'origin', label: 'Origin' },
];

const BLOG_POSTS = [
    {
        type: 'edge',
        path: '/blog/Edge_Layer_(DDoS_&_DNS)/',
        title: 'Edge Layer: Absorbing DDoS and DNS Floods at the Perimeter',
        summary: "How Cloudflare's global Anycast network soaks up volumetric Layer 3/4 attacks and DNS query floods before they ever reach your API.",
        threats: ['DDoS', 'DNS floods', 'Origin IP exposure'],
        tags: ['Anycast', 'SYN flood', 'UDP flood', 'DNSSEC', 'Proxied DNS'],
        readTime: 6,
        published: '2026-09-26',
    },
    {
        type: 'waf',
        path: '/blog/WAF_&_Bot_Layer_(Layer_7)/',
        title: 'WAF & Bot Layer: Filtering Malicious Requests at Layer 7',
        summary: 'Blocking SQL injection, XSS and automated scraping of a headless API with managed rulesets, custom rules and bot signals.',
        threats: ['SQL injection', 'XSS', 'Scraping', 'Credential stuffing'],
        tags: ['WAF', 'Managed rules', 'OWASP', 'Bot Management', 'Custom rules'],
        readTime: 7,
        published: '2026-09-26',
    },
    {
        type: 'api',
        path: '/blog/API_Endpoint_Protection/',
        title: 'API Endpoint Protection with API Shield',
        summary: 'Discovering shadow APIs, enforcing schema validation and authenticating clients with mTLS to protect API business logic.',
        threats: ['Shadow APIs', 'Malformed payloads', 'Data exfiltration', 'Key abuse'],
        tags: ['API Shield', 'Schema validation', 'OpenAPI', 'mTLS', 'API discovery'],
        readTime: 7,
        published: '2026-09-26',
    },
    {
        type: 'rate',
        path: '/blog/Rate_Limiting/',
        title: 'Rate Limiting: Stopping Brute Force and API Abuse',
        summary: 'Capping how many requests each client can make per time window, keyed by IP, API key, cookie or header.',
        threats: ['Brute force', 'Credential stuffing', 'Scraping', 'Key abuse'],
        tags: ['Rate limiting rules', '429', 'Thresholds', 'API keys'],
        readTime: 5,
        published: '2026-09-26',
    },
    {
        type: 'tunnel',
        path: '/blog/Cloudflare_Tunnel/',
        title: 'Cloudflare Tunnel: Hiding the Origin and Closing Inbound Ports',
        summary: 'Securing the last mile with an outbound-only connection from your backend to Cloudflare, so attackers cannot bypass the other layers.',
        threats: ['Origin IP exposure', 'Direct origin attacks', 'DDoS'],
        tags: ['cloudflared', 'Zero Trust', 'Access', 'Service tokens', 'Firewall'],
        readTime: 6,
        published: '2026-09-26',
    },
];

const typeOf = (post) => BLOG_TYPES.find(t => t.id === post.type);
const layerLabel = (n) => `Layer ${String(n).padStart(2, '0')}`;
const formatDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// --- LAYER FLOW DIAGRAM ---
// Client -> 5 layers -> Origin. Highlights `active`; clickable when `onSelect` is given.
const LayerFlow = ({ active, onSelect, dark }) => {
    const node = (t) => {
        const isOn = active === t.id;
        const base = `flex-1 min-w-[120px] p-4 rounded-2xl border text-left transition-all duration-300`;
        const tone = isOn
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
            : dark
                ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-blue-500/60'
                : 'bg-white/90 border-gray-200 text-gray-700 hover:border-blue-500';
        const content = (
            <>
                <span className={`block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isOn ? 'text-blue-100' : 'text-blue-500'}`}>{layerLabel(t.layer)}</span>
                <span className="block text-sm font-black leading-tight">{t.short}</span>
            </>
        );
        return onSelect ? (
            <button key={t.id} onClick={() => onSelect(isOn ? 'all' : t.id)} aria-pressed={isOn} className={base + ' ' + tone}>{content}</button>
        ) : (
            <div key={t.id} className={base + ' ' + tone} aria-current={isOn ? 'step' : undefined}>{content}</div>
        );
    };

    const endpoint = (label) => (
        <div className={`hidden md:flex items-center justify-center px-4 rounded-2xl border border-dashed text-[10px] font-bold uppercase tracking-[0.2em] ${dark ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-400'}`}>
            {label}
        </div>
    );

    return (
        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-2 px-1" aria-label="Request path from client to origin">
            {endpoint('Client')}
            {BLOG_TYPES.map(node)}
            {endpoint('Origin')}
        </div>
    );
};

// --- DASHBOARD ---
const readParams = () => {
    const p = new URLSearchParams(window.location.search);
    return {
        q: p.get('q') || '',
        type: p.get('type') || 'all',
        zone: p.get('zone') || 'all',
        threats: (p.get('threats') || '').split(',').filter(Boolean),
        sort: p.get('sort') || 'layer',
    };
};

const writeParams = (f) => {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.type !== 'all') p.set('type', f.type);
    if (f.zone !== 'all') p.set('zone', f.zone);
    if (f.threats.length) p.set('threats', f.threats.join(','));
    if (f.sort !== 'layer') p.set('sort', f.sort);
    const qs = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
};

const ALL_THREATS = [...new Set(BLOG_POSTS.flatMap(p => p.threats))].sort();

const Chip = ({ active, onClick, children, count }) => (
    <button
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${active
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600'}`}
    >
        {children}
        {count !== undefined && (
            <span className={`px-1.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
        )}
    </button>
);

const FilterGroup = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const PostCard = ({ post }) => {
    const t = typeOf(post);
    return (
        <a
            href={post.path}
            className="group flex flex-col p-8 rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
        >
            <div className="flex items-center justify-between gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">{layerLabel(t.layer)}</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">{t.short}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 flex-1">{post.summary}</p>
            <div className="flex flex-wrap gap-1.5 mb-6">
                {post.threats.map(th => (
                    <span key={th} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{th}</span>
                ))}
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>{formatDate(post.published)} · {post.readTime} min read</span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">Read →</span>
            </div>
        </a>
    );
};

const StatTile = ({ value, label }) => (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 flex items-center gap-4">
        <div className="min-w-10 h-10 px-2 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{value}</div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
    </div>
);

const BlogDashboard = () => {
    const [filters, setFilters] = useState(readParams);
    const set = (patch) => setFilters(f => ({ ...f, ...patch }));

    useEffect(() => writeParams(filters), [filters]);

    const toggleThreat = (th) => set({
        threats: filters.threats.includes(th) ? filters.threats.filter(x => x !== th) : [...filters.threats, th],
    });

    const matchesQuery = (post) => {
        const q = filters.q.trim().toLowerCase();
        if (!q) return true;
        const haystack = [post.title, post.summary, typeOf(post).label, ...post.tags, ...post.threats].join(' ').toLowerCase();
        return q.split(/\s+/).every(word => haystack.includes(word));
    };

    // Every filter except the one being counted, so chip counts show what clicking would yield.
    const passes = (post, skip) =>
        matchesQuery(post) &&
        (skip === 'type' || filters.type === 'all' || post.type === filters.type) &&
        (skip === 'zone' || filters.zone === 'all' || typeOf(post).zone === filters.zone) &&
        (skip === 'threats' || filters.threats.every(th => post.threats.includes(th)));

    const results = BLOG_POSTS.filter(p => passes(p)).sort((a, b) => {
        if (filters.sort === 'title') return a.title.localeCompare(b.title);
        if (filters.sort === 'read') return a.readTime - b.readTime;
        return typeOf(a).layer - typeOf(b).layer;
    });

    const hasFilters = filters.q || filters.type !== 'all' || filters.zone !== 'all' || filters.threats.length;
    const reset = () => setFilters({ q: '', type: 'all', zone: 'all', threats: [], sort: filters.sort });

    return (
        <>
            {/* Hero */}
            <section className="pt-20 pb-12 text-center relative z-10">
                <div className="animate-fade-in">
                    <div className="inline-block mb-8 px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.5em] uppercase bg-blue-50/50">
                        BLOG · API SECURITY
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9]">
                        Layered Defense<br/><span className="text-blue-600">for Headless APIs</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto font-medium">
                        A headless API with no frontend exposes keys and data to scraping, brute force and direct origin attacks.
                        Explore each layer of Cloudflare's defense model, from the edge to your origin.
                    </p>
                </div>
            </section>

            {/* Layer flow (click a layer to filter) */}
            <section className="max-w-6xl mx-auto mb-12 relative z-10">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Request path · click a layer to filter</p>
                <LayerFlow active={filters.type} onSelect={(type) => set({ type })} />
            </section>

            {/* Stats */}
            <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 relative z-10">
                <StatTile value={BLOG_POSTS.length} label="Articles" />
                <StatTile value={BLOG_TYPES.length} label="Defense layers" />
                <StatTile value={ALL_THREATS.length} label="Threats covered" />
                <StatTile value={results.length} label="Matching now" />
            </section>

            {/* Filters + results */}
            <section className="max-w-7xl mx-auto pb-24 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 relative z-20">
                <aside className="lg:sticky lg:top-40 self-start p-8 rounded-[2rem] bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl shadow-gray-200/40">
                    <label htmlFor="blog-search" className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Search</label>
                    <input
                        id="blog-search"
                        type="search"
                        value={filters.q}
                        onChange={(e) => set({ q: e.target.value })}
                        placeholder="e.g. SQL injection, mTLS, 429"
                        className="w-full px-5 py-3 mb-8 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />

                    <FilterGroup title="Type">
                        <Chip active={filters.type === 'all'} onClick={() => set({ type: 'all' })}>All</Chip>
                        {BLOG_TYPES.map(t => (
                            <Chip key={t.id} active={filters.type === t.id} onClick={() => set({ type: t.id })}
                                count={BLOG_POSTS.filter(p => p.type === t.id && passes(p, 'type')).length}>
                                {t.label}
                            </Chip>
                        ))}
                    </FilterGroup>

                    <FilterGroup title="Zone">
                        <Chip active={filters.zone === 'all'} onClick={() => set({ zone: 'all' })}>All</Chip>
                        {ZONES.map(z => (
                            <Chip key={z.id} active={filters.zone === z.id} onClick={() => set({ zone: z.id })}
                                count={BLOG_POSTS.filter(p => typeOf(p).zone === z.id && passes(p, 'zone')).length}>
                                {z.label}
                            </Chip>
                        ))}
                    </FilterGroup>

                    <FilterGroup title="Threat">
                        {ALL_THREATS.map(th => (
                            <Chip key={th} active={filters.threats.includes(th)} onClick={() => toggleThreat(th)}>{th}</Chip>
                        ))}
                    </FilterGroup>

                    {hasFilters ? (
                        <button onClick={reset} className="w-full py-3 rounded-full border border-gray-200 hover:border-blue-500 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-blue-600 transition-colors">
                            Clear filters
                        </button>
                    ) : null}
                </aside>

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <p className="text-sm font-bold text-gray-500" aria-live="polite">
                            {results.length} {results.length === 1 ? 'article' : 'articles'}
                        </p>
                        <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                            Sort
                            <select
                                value={filters.sort}
                                onChange={(e) => set({ sort: e.target.value })}
                                className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 normal-case tracking-normal text-sm font-bold focus:outline-none focus:border-blue-500"
                            >
                                <option value="layer">Layer order</option>
                                <option value="title">Title A–Z</option>
                                <option value="read">Shortest read</option>
                            </select>
                        </label>
                    </div>

                    {results.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map(post => <PostCard key={post.path} post={post} />)}
                        </div>
                    ) : (
                        <div className="p-16 rounded-[2rem] border border-dashed border-gray-300 text-center">
                            <p className="text-lg font-black text-gray-900 mb-2">No articles match these filters</p>
                            <p className="text-sm text-gray-500 font-medium mb-6">Try removing a threat or clearing the search.</p>
                            <button onClick={reset} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all">Clear filters</button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

// --- ARTICLE BUILDING BLOCKS (used inside each post) ---
const H2 = ({ children }) => <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-14 mb-5">{children}</h2>;
const P = ({ children }) => <p className="text-lg text-gray-600 leading-relaxed mb-5">{children}</p>;
const UL = ({ items }) => (
    <ul className="space-y-3 mb-6">
        {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-lg text-gray-600 leading-relaxed">
                <span className="mt-2.5 w-1.5 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span>{item}</span>
            </li>
        ))}
    </ul>
);
const Code = ({ children }) => <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[0.9em] font-semibold">{children}</code>;
const CodeBlock = ({ title, children }) => (
    <div className="my-8 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        {title && <div className="px-5 py-3 border-b border-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{title}</div>}
        <pre className="p-5 text-sm text-slate-200 overflow-x-auto leading-relaxed"><code>{children}</code></pre>
    </div>
);
const Callout = ({ title, children }) => (
    <div className="my-8 flex gap-4 p-6 rounded-2xl bg-blue-50 border border-blue-100">
        <span className="w-1 rounded-full bg-blue-500 flex-shrink-0"></span>
        <div>
            {title && <p className="font-black text-blue-900 mb-1">{title}</p>}
            <div className="text-blue-900/80 font-medium leading-relaxed">{children}</div>
        </div>
    </div>
);

// --- ARTICLE TEMPLATE ---
const BlogPostLayout = ({ path, controls, children }) => {
    const post = BLOG_POSTS.find(p => p.path === path);
    const t = typeOf(post);
    const ordered = [...BLOG_POSTS].sort((a, b) => typeOf(a).layer - typeOf(b).layer);
    const i = ordered.indexOf(post);
    const prev = ordered[i - 1];
    const next = ordered[i + 1];

    useEffect(() => { document.title = `${t.label} - Lameyer Blog`; }, []);

    const NavCard = ({ p, dir }) => p ? (
        <a href={p.path} className={`group flex-1 p-6 rounded-[2rem] border border-gray-100 bg-white/90 shadow-lg shadow-gray-200/40 hover:border-blue-500 transition-all ${dir === 'next' ? 'text-right' : ''}`}>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 mb-2">
                {dir === 'next' ? `Next · ${layerLabel(typeOf(p).layer)} →` : `← Previous · ${layerLabel(typeOf(p).layer)}`}
            </span>
            <span className="block font-black text-gray-900 group-hover:text-blue-600 transition-colors">{typeOf(p).label}</span>
        </a>
    ) : <div className="flex-1 hidden md:block"></div>;

    return (
        <>
            <header className="max-w-4xl mx-auto pt-16 pb-10 relative z-10 animate-fade-in">
                <a href="/blog/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors mb-10">
                    ← Blog dashboard
                </a>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.3em] uppercase bg-blue-50/50">{layerLabel(t.layer)}</span>
                    <a href={`/blog/?type=${t.id}`} className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">{t.label}</a>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-6">{post.title}</h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed mb-6">{post.summary}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{formatDate(post.published)} · {post.readTime} min read</p>
            </header>

            <section className="max-w-6xl mx-auto mb-12 relative z-10">
                <LayerFlow active={t.id} />
            </section>

            <section className="max-w-6xl mx-auto pb-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 relative z-20">
                <article className="p-8 md:p-12 rounded-[2.5rem] bg-white/95 border border-gray-100 shadow-xl shadow-gray-200/40 [&>*:first-child]:mt-0">
                    {children}
                </article>

                <aside className="lg:sticky lg:top-40 self-start space-y-6">
                    <div className="p-6 rounded-[2rem] bg-slate-900 text-white">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">Stops</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.threats.map(th => (
                                <a key={th} href={`/blog/?threats=${encodeURIComponent(th)}`} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-300 transition-colors">{th}</a>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/95 border border-gray-100 shadow-lg shadow-gray-200/40">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Checklist</h3>
                        <ul className="space-y-3">
                            {controls.map(c => (
                                <li key={c} className="flex gap-3 text-sm font-semibold text-gray-700 leading-snug">
                                    <span className="text-blue-600">✓</span>{c}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </section>

            <nav className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 pb-8 relative z-20" aria-label="Other layers">
                <NavCard p={prev} dir="prev" />
                <NavCard p={next} dir="next" />
            </nav>

            <RegisterCTA title="Need help hardening your API?" text="We design and deploy layered Cloudflare defenses for headless APIs." />
        </>
    );
};

const renderPost = (path, controls, Content) =>
    renderPage(() => (
        <BlogPostLayout path={path} controls={controls}>
            <Content />
        </BlogPostLayout>
    ));
