// Shared by /blog/ (dashboard) and every /blog/<Entry>/ page.
// Everything the blog needs lives in the /blog folder: blog.css, blog.jsx and one folder per entry.
//
// HOW TO ADD AN ENTRY
//   1. Copy an existing entry folder, e.g. /blog/Rate_Limiting/ -> /blog/My_New_Entry/
//   2. Edit its index.html: CONTROLS (checklist), the Content, and the path passed to renderPost()
//   3. Add a matching object to BLOG_POSTS below (same path). The dashboard lists it automatically.
//      For a crossover, also give it `crosses: [...]` (other type ids) and a short `label`.
//   4. A new series needs one entry in SERIES plus its BLOG_TYPES and ZONES.
const { useState, useEffect, useRef } = React;

// --- HEADER / FOOTER (same as the main index.html; links go back to its hash routes) ---
const NAV_LINKS = [
    { href: '/#/development', label: 'Development' },
    { href: '/#/components', label: 'Components' },
    { href: '/#/community', label: 'Community' },
    { href: '/#/stack', label: 'Stack' },
    { href: '/blog/', label: 'Blog' },
];

const isActive = (href) => href.startsWith('/blog') && window.location.pathname.startsWith('/blog');

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(prev => !prev);

    // The contact form lives on the main page
    const handleRegisterClick = () => {
        window.location.href = '/#form-section';
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Circuit Pattern */}
            <div className="circuit-bg"></div>

            {/* Top Banner */}
            <div className="fixed top-0 w-full h-10 bg-[#0f172a] z-[60] flex items-center justify-between px-8 overflow-hidden">
                <span className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2">
                    SUSTENTABILIDAD CORPORATIVA & ESG
                </span>
                <div className="flex items-center space-x-4 md:space-x-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto no-scrollbar">
                    {['ODS 6', 'ODS 11', 'ODS 13', 'AGENDA 2030', 'ESG COMPLIANT'].map((cert, index) => (
                        <div key={index} className="flex items-center space-x-1 flex-shrink-0">
                            <div className="w-1 h-3 bg-blue-500"></div>
                            <span className="text-[9px] font-bold text-white tracking-widest uppercase">{cert}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`fixed left-0 w-full z-[70] px-6 md:px-8 py-4 flex justify-between items-center glass shadow-sm transition-all top-[40px] ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <a href="/#/" className="block z-50">
                    <img src="https://raw.githubusercontent.com/cypher-the-meyer/themeyer.eu/main/themeyerlogo" alt="Lameyer Logo" className="h-10 md:h-12 w-auto object-contain" />
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex space-x-8 text-sm font-semibold tracking-widest uppercase">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? 'page' : undefined}
                            className={`transition-colors hover:text-blue-600 ${isActive(link.href) ? 'text-blue-600' : 'opacity-60 hover:opacity-100'}`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleRegisterClick}
                        className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-md"
                    >
                        REGISTER
                    </button>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-gray-900 focus:outline-none"
                        aria-label="Abrir menú"
                    >
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] md:hidden flex flex-col items-center justify-center space-y-8 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>

                {/* Close Button */}
                <button
                    onClick={toggleMenu}
                    className="absolute top-10 right-8 p-4 text-gray-900 hover:text-blue-600 transition-colors focus:outline-none z-[110]"
                    aria-label="Cerrar menú"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {NAV_LINKS.map(link => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-3xl font-black tracking-tight hover:text-blue-600 transition-colors ${isActive(link.href) ? 'text-blue-600' : 'text-gray-900'}`}
                    >
                        {link.label}
                    </a>
                ))}
                <button
                    onClick={handleRegisterClick}
                    className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl mt-4"
                >
                    REGISTER
                </button>
            </div>

            <main className="pt-32 px-4 md:px-8">
                {children}
            </main>

            <footer className="py-12 border-t border-gray-200 text-center text-gray-400 text-sm font-semibold tracking-widest bg-white relative z-20">
                &copy; 2026 LAMEYER® EU. TODOS LOS DERECHOS RESERVADOS.
            </footer>
        </div>
    );
};

// Call to action at the bottom of blog pages
const RegisterCTA = ({ title, text }) => (
    <section className="py-24 px-4 relative z-20">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-slate-900 p-12 md:p-20 text-center shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">{title}</h2>
            <p className="text-slate-400 text-lg font-medium mb-10 max-w-xl mx-auto">{text}</p>
            <a
                href="/#form-section"
                className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs"
            >
                Register
            </a>
        </div>
    </section>
);

const renderPage = (Page) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <Layout>
            <Page />
        </Layout>
    );
};

// --- BLOG ---

// The blog is split into series. Each series has its own types (shown as an ordered flow),
// zones, facet name and call to action. A post belongs to one type and may also `cross` others.
const SERIES = [
    {
        id: 'security',
        label: 'API Security',
        eyebrow: 'BLOG · API SECURITY',
        title: 'Layered Defense',
        accent: 'for Headless APIs',
        intro: "A headless API with no frontend exposes keys and data to scraping, brute force and direct origin attacks. Explore each layer of Cloudflare's defense model, from the edge to your origin.",
        step: 'Layer',
        from: 'Client',
        to: 'Origin',
        flowLabel: 'Request path',
        typesLabel: 'Defense layers',
        facet: 'Threat',
        facetsLabel: 'Threats covered',
        verb: 'Stops',
        placeholder: 'e.g. SQL injection, mTLS, 429',
        cta: { title: 'Need help hardening your API?', text: 'We design and deploy layered Cloudflare defenses for headless APIs.' },
    },
    {
        id: 'search',
        label: 'Code Search & Discoverability',
        eyebrow: 'BLOG · CODE SEARCH & DISCOVERABILITY',
        title: 'Findable Code,',
        accent: 'Findable Pages',
        intro: 'Organizing, filtering and semantically searching code and repositories, then publishing what you build so crawlers, search engines and AI systems can find it. Each stage, plus the crossovers where stages meet.',
        step: 'Stage',
        from: 'Repository',
        to: 'Results',
        flowLabel: 'Discovery path',
        typesLabel: 'Stages',
        facet: 'Problem',
        facetsLabel: 'Problems covered',
        verb: 'Solves',
        placeholder: 'e.g. embeddings, LCP, JSON-LD',
        cta: { title: 'Need your code and docs to be found?', text: 'We build semantic code search and fast, crawlable, structured documentation sites.' },
    },
];

const BLOG_TYPES = [
    // API Security: the five layers of the Cloudflare defense model, in the order a request crosses them.
    { id: 'edge', series: 'security', layer: 1, label: 'Edge Layer (DDoS & DNS)', short: 'Edge', zone: 'network' },
    { id: 'waf', series: 'security', layer: 2, label: 'WAF & Bot Layer (Layer 7)', short: 'WAF & Bot', zone: 'application' },
    { id: 'api', series: 'security', layer: 3, label: 'API Endpoint Protection', short: 'API Shield', zone: 'application' },
    { id: 'rate', series: 'security', layer: 4, label: 'Rate Limiting', short: 'Rate Limit', zone: 'application' },
    { id: 'tunnel', series: 'security', layer: 5, label: 'Cloudflare Tunnel', short: 'Tunnel', zone: 'origin' },

    // Code Search & Discoverability: from organizing a repository to being found on the open web.
    { id: 'hub', series: 'search', layer: 0, label: 'Code Search & Repository Organization', short: 'Overview', zone: 'retrieval' },
    { id: 'semantic', series: 'search', layer: 1, label: 'Semantic & Vector Search', short: 'Vector Search', zone: 'retrieval' },
    { id: 'sac', series: 'search', layer: 2, label: 'Search as Code (SaC)', short: 'Search as Code', zone: 'retrieval' },
    { id: 'bench', series: 'search', layer: 3, label: 'Benchmark Curation (REAP / Harvest)', short: 'Benchmarks', zone: 'retrieval' },
    { id: 'ssr', series: 'search', layer: 4, label: 'SSR & Static Generation', short: 'SSR / SSG', zone: 'discovery' },
    { id: 'html', series: 'search', layer: 5, label: 'Semantic HTML Markup', short: 'Semantic HTML', zone: 'discovery' },
    { id: 'cwv', series: 'search', layer: 6, label: 'Core Web Vitals & Page Speed', short: 'Web Vitals', zone: 'discovery' },
    { id: 'crawl', series: 'search', layer: 7, label: 'Crawlability & Indexing', short: 'Crawl & Index', zone: 'discovery' },
    { id: 'sd', series: 'search', layer: 8, label: 'Structured Data', short: 'Structured Data', zone: 'discovery' },
];

const ZONES = [
    { id: 'network', series: 'security', label: 'Network (L3/L4 + DNS)' },
    { id: 'application', series: 'security', label: 'Application (L7)' },
    { id: 'origin', series: 'security', label: 'Origin' },
    { id: 'retrieval', series: 'search', label: 'Retrieval (code & repos)' },
    { id: 'discovery', series: 'search', label: 'Discovery (web & crawlers)' },
];

// `threats` holds the facet values for any series (threats for security, problems for search).
// `crosses` lists other types a crossover post also covers; `label` names a crossover in titles and nav.
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

    // --- Code Search & Discoverability ---
    {
        type: 'hub',
        path: '/blog/Code_Search_&_Repository_Organization/',
        title: 'Organizing, Filtering and Semantically Searching Code',
        summary: 'A map of the whole series: structure repositories so filters work, add semantic search on top, measure it, and publish pages people and crawlers can find.',
        threats: ['Repository sprawl', 'Unfindable code', 'Keyword-only search'],
        tags: ['Monorepo', 'CODEOWNERS', 'Topics', 'Qualifiers', 'Metadata', 'Code search'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'semantic',
        path: '/blog/Semantic_&_Vector_Search/',
        title: 'Semantic & Vector Search over Code Repositories',
        summary: 'Chunking code along syntax boundaries, embedding it, and combining vector similarity with keyword search so "where do we retry payments?" finds the right function.',
        threats: ['Keyword-only search', 'Vocabulary mismatch', 'Unfindable code'],
        tags: ['Embeddings', 'HNSW', 'pgvector', 'Hybrid search', 'BM25', 'RRF', 'tree-sitter', 'Chunking'],
        readTime: 8,
        published: '2026-10-02',
    },
    {
        type: 'sac',
        path: '/blog/Search_as_Code_(SaC)/',
        title: 'Search as Code: Versioning Queries, Filters and Ranking',
        summary: 'Treating search configuration like infrastructure: analyzers, synonyms, boosts and saved queries live in git, are reviewed in pull requests and deployed by CI.',
        threats: ['Config drift', 'Silent ranking regressions', 'Repository sprawl'],
        tags: ['GitOps', 'Synonyms', 'Boosts', 'Saved searches', 'Qualifiers', 'CI'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'bench',
        path: '/blog/Benchmark_Curation_(REAP_&_Harvest)/',
        title: 'Benchmark Curation: Harvesting and Reaping Real Search Tasks',
        summary: 'Mining queries and tasks from repository history (Harvest), then filtering them into a trustworthy benchmark (REAP) to measure code search with Recall@k, MRR and nDCG.',
        threats: ['Untested relevance', 'Benchmark contamination', 'Silent ranking regressions'],
        tags: ['Harvest', 'REAP', 'Recall@k', 'MRR', 'nDCG', 'Gold labels', 'Deduplication'],
        readTime: 8,
        published: '2026-10-02',
    },
    {
        type: 'ssr',
        path: '/blog/SSR_&_Static_Generation/',
        title: 'SSR & Static Generation: Shipping HTML Crawlers Can Read',
        summary: 'Why pages rendered only in the browser are fragile for search and AI crawlers, and how prerendering at build time or rendering on the server fixes it.',
        threats: ['Empty initial HTML', 'Delayed indexing', 'Invisible content'],
        tags: ['SSR', 'SSG', 'Prerendering', 'Hydration', 'renderToString', 'Rendering queue'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'html',
        path: '/blog/Semantic_HTML_Markup/',
        title: 'Semantic HTML: Markup That Machines Understand',
        summary: 'Using landmarks, a real heading outline, <time>, <code> and real links so browsers, screen readers, crawlers and chunkers all read the page the same way.',
        threats: ['Div soup', 'Broken outline', 'Inaccessible navigation'],
        tags: ['Landmarks', 'Headings', '<article>', '<time>', '<pre><code>', 'Accessibility'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'cwv',
        path: '/blog/Core_Web_Vitals_&_Page_Speed/',
        title: 'Core Web Vitals & Page Speed for Documentation Sites',
        summary: 'What LCP, INP and CLS measure, the thresholds to hit at the 75th percentile, and the usual causes of slow, janky developer sites.',
        threats: ['Slow LCP', 'Poor INP', 'Layout shift'],
        tags: ['LCP', 'INP', 'CLS', 'CrUX', 'Lighthouse', 'Field data', 'Render-blocking'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'crawl',
        path: '/blog/Crawlability_&_Indexing/',
        title: 'Crawlability & Indexing: Getting Every Page Discovered',
        summary: 'robots.txt, sitemaps, canonical URLs, status codes and real links: the plumbing that decides whether a page can be found, fetched and kept in the index.',
        threats: ['Orphan pages', 'Hash-only routes', 'Duplicate URLs', 'Soft 404s'],
        tags: ['robots.txt', 'sitemap.xml', 'Canonical', 'noindex', 'Search Console', 'Internal links'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'sd',
        path: '/blog/Structured_Data/',
        title: 'Structured Data: Describing Pages with JSON-LD',
        summary: 'Adding schema.org BlogPosting, BreadcrumbList and TechArticle markup so search engines understand what a page is, who wrote it and where it sits.',
        threats: ['Ambiguous content', 'Missing rich results', 'Unattributed content'],
        tags: ['JSON-LD', 'schema.org', 'BlogPosting', 'TechArticle', 'BreadcrumbList', 'Rich Results Test'],
        readTime: 6,
        published: '2026-10-02',
    },

    // --- Crossovers ---
    {
        type: 'bench',
        crosses: ['sac', 'semantic'],
        label: 'Benchmarks × Search as Code',
        path: '/blog/Benchmarks_x_Search_as_Code/',
        title: 'Benchmarks as Regression Tests for Search as Code',
        summary: 'Running the curated benchmark in CI on every search-config pull request, so a synonym or a new embedding model cannot ship if relevance drops.',
        threats: ['Silent ranking regressions', 'Config drift', 'Untested relevance'],
        tags: ['CI', 'GitHub Actions', 'nDCG', 'Thresholds', 'Embeddings', 'Pull requests'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'ssr',
        crosses: ['html', 'semantic'],
        label: 'Static Generation × Vector Search',
        path: '/blog/Static_Generation_x_Vector_Search/',
        title: 'One Build, Two Audiences: Static Pages and a Vector Index',
        summary: 'Using the static build step to emit crawlable HTML and, from the same semantic headings, the chunks that feed a vector index.',
        threats: ['Empty initial HTML', 'Vocabulary mismatch', 'Stale search index'],
        tags: ['SSG', 'Chunking', 'Headings', 'Embeddings', 'Content hash', 'Incremental builds'],
        readTime: 7,
        published: '2026-10-02',
    },
    {
        type: 'sd',
        crosses: ['crawl', 'hub'],
        label: 'Structured Data × Repositories',
        path: '/blog/Structured_Data_x_Repositories/',
        title: 'Making Repositories Machine-Readable: SoftwareSourceCode and CodeMeta',
        summary: 'Describing code projects with schema.org SoftwareSourceCode on their landing pages and codemeta.json in the repository, so both crawlers and code-search tools can filter by them.',
        threats: ['Ambiguous content', 'Repository sprawl', 'Unattributed content'],
        tags: ['SoftwareSourceCode', 'codemeta.json', 'JSON-LD', 'Topics', 'License', 'Metadata'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'cwv',
        crosses: ['semantic', 'html'],
        label: 'Core Web Vitals × Site Search',
        path: '/blog/Core_Web_Vitals_x_Site_Search/',
        title: 'Search Boxes That Don\'t Hurt Core Web Vitals',
        summary: 'Loading a search index on demand, keeping typing responsive for INP, and reserving space for results so client-side search never shifts the layout.',
        threats: ['Poor INP', 'Layout shift', 'Slow LCP'],
        tags: ['INP', 'CLS', 'Web Worker', 'Debounce', 'Lazy loading', '<search>'],
        readTime: 6,
        published: '2026-10-02',
    },
    {
        type: 'crawl',
        crosses: ['sac', 'ssr'],
        label: 'Crawlability × Faceted Search',
        path: '/blog/Crawlability_x_Faceted_Search/',
        title: 'Faceted Filters without Crawl Traps',
        summary: 'Filter URLs like ?type=…&threats=… multiply fast. Decide in code which facets deserve indexable pages, and keep the rest out of the crawl.',
        threats: ['Duplicate URLs', 'Crawl budget waste', 'Orphan pages'],
        tags: ['Facets', 'Query parameters', 'Canonical', 'robots.txt', 'Landing pages', 'Sitemaps'],
        readTime: 6,
        published: '2026-10-02',
    },
];

const seriesById = (id) => SERIES.find(s => s.id === id);
const typeById = (id) => BLOG_TYPES.find(t => t.id === id);
const typeOf = (post) => typeById(post.type);
const seriesOf = (post) => seriesById(typeOf(post).series);
const typesOfPost = (post) => [post.type, ...(post.crosses || [])];
const isCross = (post) => Boolean(post.crosses && post.crosses.length);
const postLabel = (post) => post.label || typeOf(post).label;
const stepLabel = (t) => `${seriesById(t.series).step} ${String(t.layer).padStart(2, '0')}`;
const formatDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
// Series order: by step, primary post before crossovers that share its step.
const byStep = (a, b) => (typeOf(a).layer - typeOf(b).layer) || (isCross(a) - isCross(b));

const linkClass = 'text-blue-600 font-bold hover:underline';

// --- FLOW DIAGRAM ---
// Start -> the series' types -> end. Highlights `active` (one id or a list); clickable when `onSelect` is given.
const LayerFlow = ({ series, active, onSelect, dark }) => {
    const s = seriesById(series);
    const activeIds = [].concat(active);
    const types = BLOG_TYPES.filter(t => t.series === series);
    const compact = types.length > 6;
    const node = (t) => {
        const isOn = activeIds.includes(t.id);
        const base = `flex-1 ${compact ? 'min-w-[92px] p-3' : 'min-w-[120px] p-4'} rounded-2xl border text-left transition-all duration-300`;
        const tone = isOn
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
            : dark
                ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-blue-500/60'
                : 'bg-white/90 border-gray-200 text-gray-700 hover:border-blue-500';
        const content = (
            <>
                <span className={`block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isOn ? 'text-blue-100' : 'text-blue-500'}`}>{stepLabel(t)}</span>
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
        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-2 px-1" aria-label={`${s.flowLabel} from ${s.from} to ${s.to}`}>
            {endpoint(s.from)}
            {types.map(node)}
            {endpoint(s.to)}
        </div>
    );
};

// --- DASHBOARD ---
const readParams = () => {
    const p = new URLSearchParams(window.location.search);
    const type = p.get('type') || 'all';
    const t = typeById(type);
    return {
        series: p.get('series') || (t ? t.series : SERIES[0].id),
        q: p.get('q') || '',
        type,
        zone: p.get('zone') || 'all',
        kind: p.get('kind') || 'all',
        threats: (p.get('threats') || '').split(',').filter(Boolean),
        sort: p.get('sort') || 'layer',
    };
};

const writeParams = (f) => {
    const p = new URLSearchParams();
    if (f.series !== SERIES[0].id) p.set('series', f.series);
    if (f.q) p.set('q', f.q);
    if (f.type !== 'all') p.set('type', f.type);
    if (f.zone !== 'all') p.set('zone', f.zone);
    if (f.kind !== 'all') p.set('kind', f.kind);
    if (f.threats.length) p.set('threats', f.threats.join(','));
    if (f.sort !== 'layer') p.set('sort', f.sort);
    const qs = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
};

const KINDS = [
    { id: 'deep', label: 'Deep dives', test: (p) => !isCross(p) },
    { id: 'cross', label: 'Crossovers', test: isCross },
];

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

const CrossBadges = ({ post }) => isCross(post) ? (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Crosses</span>
        {post.crosses.map(id => (
            <span key={id} className="px-2.5 py-1 rounded-full border border-blue-200 text-blue-600 text-[10px] font-bold">× {typeById(id).short}</span>
        ))}
    </div>
) : null;

const PostCard = ({ post }) => {
    const t = typeOf(post);
    return (
        <a
            href={post.path}
            className="group flex flex-col p-8 rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
        >
            <div className="flex items-center justify-between gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">{isCross(post) ? 'Crossover' : stepLabel(t)}</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest">{t.short}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 flex-1">{post.summary}</p>
            <CrossBadges post={post} />
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

    const s = seriesById(filters.series);
    const types = BLOG_TYPES.filter(t => t.series === s.id);
    const zones = ZONES.filter(z => z.series === s.id);
    const posts = BLOG_POSTS.filter(p => typeOf(p).series === s.id);
    const allThreats = [...new Set(posts.flatMap(p => p.threats))].sort();

    const switchSeries = (series) => setFilters(f => ({ ...f, series, q: '', type: 'all', zone: 'all', kind: 'all', threats: [] }));

    const toggleThreat = (th) => set({
        threats: filters.threats.includes(th) ? filters.threats.filter(x => x !== th) : [...filters.threats, th],
    });

    const matchesQuery = (post) => {
        const q = filters.q.trim().toLowerCase();
        if (!q) return true;
        const haystack = [post.title, post.summary, ...typesOfPost(post).map(id => typeById(id).label), ...post.tags, ...post.threats].join(' ').toLowerCase();
        return q.split(/\s+/).every(word => haystack.includes(word));
    };

    // Every filter except the one being counted, so chip counts show what clicking would yield.
    // A crossover matches the type and zone of every type it covers.
    const passes = (post, skip) =>
        matchesQuery(post) &&
        (skip === 'type' || filters.type === 'all' || typesOfPost(post).includes(filters.type)) &&
        (skip === 'zone' || filters.zone === 'all' || typesOfPost(post).some(id => typeById(id).zone === filters.zone)) &&
        (skip === 'kind' || filters.kind === 'all' || KINDS.find(k => k.id === filters.kind).test(post)) &&
        (skip === 'threats' || filters.threats.every(th => post.threats.includes(th)));

    const results = posts.filter(p => passes(p)).sort((a, b) => {
        if (filters.sort === 'title') return a.title.localeCompare(b.title);
        if (filters.sort === 'read') return a.readTime - b.readTime;
        return byStep(a, b);
    });

    const hasFilters = filters.q || filters.type !== 'all' || filters.zone !== 'all' || filters.kind !== 'all' || filters.threats.length;
    const reset = () => setFilters(f => ({ ...f, q: '', type: 'all', zone: 'all', kind: 'all', threats: [] }));
    const crossCount = posts.filter(isCross).length;

    return (
        <>
            {/* Series switch */}
            <nav className="pt-12 flex flex-wrap justify-center gap-2 relative z-10" aria-label="Blog series">
                {SERIES.map(x => (
                    <Chip key={x.id} active={x.id === s.id} onClick={() => switchSeries(x.id)}
                        count={BLOG_POSTS.filter(p => typeOf(p).series === x.id).length}>
                        {x.label}
                    </Chip>
                ))}
            </nav>

            {/* Hero */}
            <section className="pt-12 pb-12 text-center relative z-10">
                <div className="animate-fade-in" key={s.id}>
                    <div className="inline-block mb-8 px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.5em] uppercase bg-blue-50/50">
                        {s.eyebrow}
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9]">
                        {s.title}<br/><span className="text-blue-600">{s.accent}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto font-medium">{s.intro}</p>
                </div>
            </section>

            {/* Flow (click a step to filter) */}
            <section className="max-w-6xl mx-auto mb-12 relative z-10">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{s.flowLabel} · click a {s.step.toLowerCase()} to filter</p>
                <LayerFlow series={s.id} active={filters.type} onSelect={(type) => set({ type })} />
            </section>

            {/* Stats */}
            <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 relative z-10">
                <StatTile value={posts.length} label="Articles" />
                <StatTile value={types.length} label={s.typesLabel} />
                {crossCount
                    ? <StatTile value={crossCount} label="Crossovers" />
                    : <StatTile value={allThreats.length} label={s.facetsLabel} />}
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
                        placeholder={s.placeholder}
                        className="w-full px-5 py-3 mb-8 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />

                    <FilterGroup title="Type">
                        <Chip active={filters.type === 'all'} onClick={() => set({ type: 'all' })}>All</Chip>
                        {types.map(t => (
                            <Chip key={t.id} active={filters.type === t.id} onClick={() => set({ type: t.id })}
                                count={posts.filter(p => typesOfPost(p).includes(t.id) && passes(p, 'type')).length}>
                                {t.label}
                            </Chip>
                        ))}
                    </FilterGroup>

                    <FilterGroup title="Zone">
                        <Chip active={filters.zone === 'all'} onClick={() => set({ zone: 'all' })}>All</Chip>
                        {zones.map(z => (
                            <Chip key={z.id} active={filters.zone === z.id} onClick={() => set({ zone: z.id })}
                                count={posts.filter(p => typesOfPost(p).some(id => typeById(id).zone === z.id) && passes(p, 'zone')).length}>
                                {z.label}
                            </Chip>
                        ))}
                    </FilterGroup>

                    {crossCount ? (
                        <FilterGroup title="Format">
                            <Chip active={filters.kind === 'all'} onClick={() => set({ kind: 'all' })}>All</Chip>
                            {KINDS.map(k => (
                                <Chip key={k.id} active={filters.kind === k.id} onClick={() => set({ kind: k.id })}
                                    count={posts.filter(p => k.test(p) && passes(p, 'kind')).length}>
                                    {k.label}
                                </Chip>
                            ))}
                        </FilterGroup>
                    ) : null}

                    <FilterGroup title={s.facet}>
                        {allThreats.map(th => (
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
                                <option value="layer">{s.step} order</option>
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
                            <p className="text-sm text-gray-500 font-medium mb-6">Try removing a {s.facet.toLowerCase()} or clearing the search.</p>
                            <button onClick={reset} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all">Clear filters</button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

// --- ARTICLE BUILDING BLOCKS (used inside each post) ---
// Plain-text headings get an id, so sections can be linked to (and indexed) as /post/#section.
const slugify = (text) => typeof text === 'string' ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : undefined;
const H2 = ({ children }) => <h2 id={slugify(children)} className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-14 mb-5 scroll-mt-40">{children}</h2>;
const H3 = ({ children }) => <h3 className="text-xl font-black text-gray-900 tracking-tight mt-10 mb-4">{children}</h3>;
const P = ({ children }) => <p className="text-lg text-gray-600 leading-relaxed mb-5">{children}</p>;
const A = ({ href, children }) => <a href={href} className={linkClass}>{children}</a>;
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
// columns: [{ key, label, mono?, accent? }]; rows: objects with those keys.
const Table = ({ columns, rows }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                <tr>{columns.map(c => <th key={c.key} className="p-4 font-bold">{c.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                    <tr key={i}>
                        {columns.map(c => (
                            <td key={c.key} className={`p-4 ${c.mono ? 'font-mono text-xs font-bold text-gray-900 whitespace-nowrap' : c.accent ? 'font-bold text-blue-600 whitespace-nowrap' : 'text-gray-500 font-medium'}`}>{r[c.key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- ARTICLE TEMPLATE ---
const BlogPostLayout = ({ path, controls, children }) => {
    const post = BLOG_POSTS.find(p => p.path === path);
    const t = typeOf(post);
    const s = seriesOf(post);
    const ordered = BLOG_POSTS.filter(p => typeOf(p).series === s.id).sort(byStep);
    const i = ordered.indexOf(post);
    const prev = ordered[i - 1];
    const next = ordered[i + 1];
    // Same-series posts that share at least one type with this one: the crossovers.
    const related = ordered.filter(p => p !== post && typesOfPost(p).some(id => typesOfPost(post).includes(id)));

    useEffect(() => { document.title = `${postLabel(post)} - Lameyer Blog`; }, []);

    const NavCard = ({ p, dir }) => p ? (
        <a href={p.path} className={`group flex-1 p-6 rounded-[2rem] border border-gray-100 bg-white/90 shadow-lg shadow-gray-200/40 hover:border-blue-500 transition-all ${dir === 'next' ? 'text-right' : ''}`}>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 mb-2">
                {dir === 'next'
                    ? `Next · ${isCross(p) ? 'Crossover' : stepLabel(typeOf(p))} →`
                    : `← Previous · ${isCross(p) ? 'Crossover' : stepLabel(typeOf(p))}`}
            </span>
            <span className="block font-black text-gray-900 group-hover:text-blue-600 transition-colors">{postLabel(p)}</span>
        </a>
    ) : <div className="flex-1 hidden md:block"></div>;

    return (
        <>
            <header className="max-w-4xl mx-auto pt-16 pb-10 relative z-10 animate-fade-in">
                <a href={`/blog/?series=${s.id}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors mb-10">
                    ← Blog dashboard · {s.label}
                </a>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.3em] uppercase bg-blue-50/50">{isCross(post) ? 'Crossover' : stepLabel(t)}</span>
                    {typesOfPost(post).map((id, n) => (
                        <a key={id} href={`/blog/?type=${id}`} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${n === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-blue-200 text-blue-600 hover:border-blue-500'}`}>
                            {n === 0 ? '' : '× '}{typeById(id).label}
                        </a>
                    ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-6">{post.title}</h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed mb-6">{post.summary}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    <time dateTime={post.published}>{formatDate(post.published)}</time> · {post.readTime} min read
                </p>
            </header>

            <section className="max-w-6xl mx-auto mb-12 relative z-10">
                <LayerFlow series={s.id} active={typesOfPost(post)} />
            </section>

            <section className="max-w-6xl mx-auto pb-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 relative z-20">
                <article className="p-8 md:p-12 rounded-[2.5rem] bg-white/95 border border-gray-100 shadow-xl shadow-gray-200/40 [&>*:first-child]:mt-0">
                    {children}
                </article>

                <aside className="lg:sticky lg:top-40 self-start space-y-6">
                    <div className="p-6 rounded-[2rem] bg-slate-900 text-white">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">{s.verb}</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.threats.map(th => (
                                <a key={th} href={`/blog/?series=${s.id}&threats=${encodeURIComponent(th)}`} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-300 transition-colors">{th}</a>
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
                    {related.length ? (
                        <div className="p-6 rounded-[2rem] bg-white/95 border border-gray-100 shadow-lg shadow-gray-200/40">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{isCross(post) ? 'Covered in depth' : 'Crossovers'}</h3>
                            <ul className="space-y-3">
                                {related.map(p => (
                                    <li key={p.path}>
                                        <a href={p.path} className="group block text-sm font-bold text-gray-700 hover:text-blue-600 leading-snug transition-colors">
                                            <span className="block text-[10px] uppercase tracking-[0.2em] text-blue-500 mb-0.5">{isCross(p) ? 'Crossover' : stepLabel(typeOf(p))}</span>
                                            {postLabel(p)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </aside>
            </section>

            <nav className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 pb-8 relative z-20" aria-label={`Other ${s.typesLabel.toLowerCase()}`}>
                <NavCard p={prev} dir="prev" />
                <NavCard p={next} dir="next" />
            </nav>

            <RegisterCTA title={s.cta.title} text={s.cta.text} />
        </>
    );
};

const renderPost = (path, controls, Content) =>
    renderPage(() => (
        <BlogPostLayout path={path} controls={controls}>
            <Content />
        </BlogPostLayout>
    ));
