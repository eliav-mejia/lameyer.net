// Shared by EVERY page of the site (home, /pages/*, /blog/*).
// Load it first:  <script type="text/babel" src="/js/layout.jsx"></script>
// Then the page's own script calls renderPage(MyPage).
const { useState, useEffect, useLayoutEffect, useRef } = React;

// Change this to the address that should receive direct emails (CV, community, newsletter).
const CONTACT_EMAIL = 'contacto@lameyer.net';

// Google Apps Script that stores contact form submissions in Google Sheets.
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzaqYJQIIWYBcbq0FCo38ulhTuYxGZxVVUOv1CklQ9mEJ_hheLsjvL3CYG9YUdfRDYl/exec';

// Header links. Every page lives in its own folder with an index.html.
const NAV_LINKS = [
    { href: '/pages/development/', label: 'Development' },
    { href: '/pages/components/', label: 'Components' },
    { href: '/pages/community/', label: 'Community' },
    { href: '/pages/stack/', label: 'Stack' },
    { href: '/blog/', label: 'Blog' },
];

const isActive = (href) => window.location.pathname.startsWith(href.replace(/\/$/, ''));

// --- LAYOUT: top banner, header, mobile menu, footer ---
const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(prev => !prev);

    const handleRegisterClick = () => {
        const formElement = document.getElementById('form-section');

        if (formElement) {
            // This page has the contact form
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

// --- CONTACT FORM (Google Sheets via Apps Script, with a honeypot against bots) ---
const ContactForm = () => {
    const [status, setStatus] = useState({ loading: false, submitted: false, error: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Bots fill the hidden field; pretend success and send nothing
        if (formData.get('telefono_secundario')) {
            setStatus({ loading: false, submitted: true, error: false });
            return;
        }

        setStatus({ loading: true, submitted: false, error: false });
        try {
            await fetch(FORM_ENDPOINT, { method: 'POST', body: new URLSearchParams(formData), mode: 'no-cors' });
            setStatus({ loading: false, submitted: true, error: false });
            e.target.reset();
        } catch (error) {
            setStatus({ loading: false, submitted: false, error: true });
        }
    };

    if (status.submitted) {
        return (
            <div className="p-12 text-center bg-white/80 rounded-3xl max-w-2xl mx-auto border border-green-100 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">¡RECIBIDO!</h3>
                <p className="text-gray-500 font-medium">Nos pondremos en contacto con usted a la brevedad.</p>
                <button onClick={() => setStatus({ ...status, submitted: false })} className="mt-8 text-blue-600 font-bold hover:underline">Enviar otro mensaje</button>
            </div>
        );
    }

    // Field names must stay exactly as they are: the Google Sheet columns use them.
    const FIELDS = [
        { label: 'NOMBRE', name: 'NOMBRE', type: 'text', placeholder: 'Nombre completo' },
        { label: 'ORGANIZACIÓN', name: 'ORGANIZACIÓN', type: 'text', placeholder: 'Nombre de su empresa' },
        { label: 'TELÉFONO', name: 'TELÉFONO', type: 'tel', placeholder: '+52...' },
        { label: 'EMAIL', name: 'EMAIL', type: 'email', placeholder: 'correo@ejemplo.com' },
    ];
    const TECHNOLOGIES = [
        'ENTRETENIMIENTO INTERACTIVO',
        'CRM & DATA MANAGEMENT',
        'CYBERSECURITY',
        'React Development',
        'API Cloud Integrations',
        'SQL DB',
        'System Technology Consulting',
    ];
    const inputClass = "w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 text-left">
            {/* Honeypot: hidden from people, visible to bots */}
            <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
                <input type="text" name="telefono_secundario" tabIndex="-1" autoComplete="off" />
            </div>

            {FIELDS.map(f => (
                <div key={f.name}>
                    <label htmlFor={`field-${f.type}-${f.name.length}`} className="block text-sm font-bold text-gray-700 mb-2">{f.label} *</label>
                    <input id={`field-${f.type}-${f.name.length}`} type={f.type} name={f.name} placeholder={f.placeholder} required className={inputClass} />
                </div>
            ))}

            <div className="md:col-span-2">
                <label htmlFor="field-tecnologia" className="block text-sm font-bold text-gray-700 mb-2">TECNOLOGÍA *</label>
                <select id="field-tecnologia" name="TECNOLOGÍA" required defaultValue="" className={inputClass + ' appearance-none cursor-pointer'}>
                    <option value="" disabled>Seleccione una opción...</option>
                    {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {status.error && (
                <p className="md:col-span-2 text-sm font-bold text-red-600">No se pudo enviar. Inténtelo de nuevo o escríbanos a {CONTACT_EMAIL}.</p>
            )}

            <div className="md:col-span-2 mt-2">
                <button
                    type="submit"
                    disabled={status.loading}
                    className={`w-full py-5 text-white font-black rounded-full shadow-xl transition-all ${status.loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01]'}`}
                >
                    {status.loading ? 'PROCESANDO...' : 'SOLICITAR INFORMACIÓN'}
                </button>
            </div>
        </form>
    );
};

// Section with id="form-section": the target of every REGISTER button.
const ContactSection = ({ title = 'Hablemos de su proyecto', text = 'Complete el formulario y nuestro equipo de expertos se pondrá en contacto con usted.' }) => (
    <section id="form-section" className="scroll-mt-32 py-32 px-2 md:px-8 relative z-20">
        <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter text-center mb-4">{title}</h2>
            <p className="text-gray-500 font-medium text-center mb-10 max-w-xl mx-auto">{text}</p>
            <ContactForm />
        </div>
    </section>
);

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

// Call to action at the bottom of pages without a form
const RegisterCTA = ({ title = '¿Listo para construir?', text = 'Cuéntenos su proyecto y le responderemos a la brevedad.' }) => (
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

// --- TECH STACK (home page and /pages/stack/) ---
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
