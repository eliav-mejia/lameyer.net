// Shared by every page: header, footer and reusable sections.
// Loaded with <script type="text/babel" src="/assets/layout.jsx"></script> before each page's own script.
const { useState, useEffect, useLayoutEffect, useRef } = React;

// Change this to the address that should receive the contact form messages.
const CONTACT_EMAIL = 'contacto@lameyer.net';

const NAV_LINKS = [
    { href: '/pages/development', label: 'Development' },
    { href: '/pages/components', label: 'Components' },
    { href: '/pages/community', label: 'Community' },
    { href: '/pages/stack', label: 'Stack' },
    { href: '/blog', label: 'Blog' },
];

const isActive = (href) => window.location.pathname.replace(/\/$/, '').startsWith(href);

// --- LAYOUT ---
const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(prev => !prev);

    const handleRegisterClick = () => {
        const formElement = document.getElementById('form-section');

        if (formElement) {
            // We are on the page with the form
            formElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            // The form lives on the home page
            window.location.href = '/#form-section';
        }

        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
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
                <a href="/" className="block z-50">
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

// --- SHARED BUILDING BLOCKS ---

// Hero at the top of each inner page
const PageHero = ({ eyebrow, title, accent, intro }) => (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center relative z-10">
        <div className="animate-fade-in">
            <div className="inline-block mb-8 px-5 py-1.5 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-full tracking-[0.5em] uppercase bg-blue-50/50">
                {eyebrow}
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9]">
                {title}<br/><span className="text-blue-600">{accent}</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium">
                {intro}
            </p>
        </div>
    </section>
);

const SectionTitle = ({ kicker, children, dark }) => (
    <div className="mb-16 text-center">
        {kicker && (
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-4">{kicker}</p>
        )}
        <h2 className={`text-4xl md:text-6xl font-black tracking-tighter ${dark ? 'text-white' : 'text-gray-900'}`}>
            {children}
        </h2>
    </div>
);

// Call to action at the bottom of inner pages
const RegisterCTA = ({ title = '¿Listo para construir?', text = 'Cuéntenos su proyecto y le responderemos por correo.' }) => (
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

// --- TECH STACK (used on home and /pages/stack) ---
const TECH_STACK = [
    { name: 'JavaScript', slug: 'javascript', category: 'frontend' },
    { name: 'React', slug: 'react', category: 'frontend' },
    { name: 'Tailwind', slug: 'tailwindcss', category: 'frontend' },
    { name: 'HTML5', slug: 'html5', category: 'frontend' },
    { name: 'CSS3', slug: 'css', category: 'frontend' },
    { name: 'Python', slug: 'python', category: 'backend' },
    { name: 'Django', slug: 'django', category: 'backend' },
    { name: 'Java', slug: 'openjdk', category: 'backend' },
    { name: 'Docker', slug: 'docker', category: 'cloud' },
    { name: 'AWS', slug: null, short: 'AWS', category: 'cloud' },   // Simple Icons no longer ships an AWS logo -> text badge
    { name: 'Google Cloud', slug: 'googlecloud', category: 'cloud' },
    { name: 'Vercel', slug: 'vercel', category: 'cloud' },
    { name: 'Gemini', slug: 'googlegemini', category: 'ai' },
    { name: 'Claude Code', slug: 'claude', category: 'ai' },
    { name: 'Figma', slug: 'figma', category: 'design' },
];

// Grey icon by default, white on hover. If an icon fails to load (or has no slug),
// a text badge is shown instead of a broken image.
const TechIcon = ({ tech }) => {
    const [failed, setFailed] = useState(!tech.slug);

    if (failed) {
        return (
            <div className="w-14 h-14 rounded-2xl border border-slate-600 flex items-center justify-center text-sm font-black tracking-tight text-slate-400 group-hover:text-white group-hover:border-blue-500/60 transition-colors duration-500">
                {tech.short || tech.name.slice(0, 3)}
            </div>
        );
    }

    return (
        <div className="relative w-14 h-14">
            {/* Grey baseline icon */}
            <img
                src={`https://cdn.simpleicons.org/${tech.slug}/94a3b8`}
                alt=""
                onError={() => setFailed(true)}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 group-hover:opacity-0"
            />
            {/* Highlighted icon (appears on hover) */}
            <img
                src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`}
                alt={`${tech.name} logo`}
                className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
        </div>
    );
};

const TechTile = ({ tech }) => (
    <div className="group p-8 bg-slate-800/50 border border-slate-700 rounded-3xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 flex flex-col items-center justify-center gap-4">
        <TechIcon tech={tech} />
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
            {tech.name}
        </span>
    </div>
);

const StackSection = () => (
    <section className="py-40 bg-slate-900 px-4 relative z-20">
        <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-20">
                Stack Tecnológico
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {TECH_STACK.map((tech) => <TechTile key={tech.name} tech={tech} />)}
            </div>
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
