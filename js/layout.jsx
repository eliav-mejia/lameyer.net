// Shared by EVERY page of the site (home, /pages/*, /academia/*).
// Load it first:  <script type="text/babel" src="/js/layout.jsx"></script>
// Then the page's own script calls renderPage(MyPage).
const { useState, useEffect, useLayoutEffect, useRef } = React;

// Change this to the address that should receive direct emails (CV, community, newsletter).
const CONTACT_EMAIL = 'contacto@lameyer.net';

// Google Apps Script that stores contact form submissions in Google Sheets.
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzaqYJQIIWYBcbq0FCo38ulhTuYxGZxVVUOv1CklQ9mEJ_hheLsjvL3CYG9YUdfRDYl/exec';

// Header links. Every page lives in its own folder with an index.html.
// /pages/stack/ is not in the menu: it is part of Comunidad (Canales), so `also` keeps Comunidad highlighted there.
const NAV_LINKS = [
    { href: '/pages/development/', label: 'Desarrollo' },
    { href: '/pages/components/', label: 'Componentes' },
    { href: '/pages/community/', label: 'Comunidad', also: ['/pages/stack/'] },
    { href: '/academia/', label: 'Academia' },
];

const isActive = (link) => [link.href, ...(link.also || [])].some(href => window.location.pathname.startsWith(href.replace(/\/$/, '')));

// --- COUNTRY (flags in the header): Spain or Mexico, both in Spanish ---
// The flag picks the shop currency (EUR or MXN, read by useCurrency in js/tienda.jsx).
// Until the visitor clicks a flag, the closest available country is guessed: first from the browser's time zone
// (instant, offline), then corrected with an IP geo-location lookup that is cached in localStorage ('lm-geo').
// A clicked flag is remembered in 'lm-locale' and always wins over the guess.
const FlagES = () => (
    <svg viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#aa151b" />
        <rect y="5" width="30" height="10" fill="#f1bf00" />
    </svg>
);
const FlagMX = () => (
    <svg viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#fff" />
        <rect width="10" height="20" fill="#006847" />
        <rect x="20" width="10" height="20" fill="#ce1126" />
        <ellipse cx="15" cy="10" rx="2.6" ry="2.9" fill="#8c6d2c" />
        <path d="M12.4 11.6q2.6 2.2 5.2 0" fill="none" stroke="#006847" strokeWidth="0.8" />
    </svg>
);
const LOCALES = [
    { id: 'es-ES', country: 'ES', currency: 'EUR', label: 'España', Flag: FlagES, point: [40.42, -3.70] },    // Madrid
    { id: 'es-MX', country: 'MX', currency: 'MXN', label: 'México', Flag: FlagMX, point: [19.43, -99.13] },   // Mexico City
];
const LOCALE_KEY = 'lm-locale';
const GEO_KEY = 'lm-geo';
const GEO_URL = 'https://get.geojs.io/v1/ip/geo.json';

const localeById = (id) => LOCALES.find(l => l.id === id) || null;
const readKey = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };
const writeKey = (key, value) => { try { localStorage.setItem(key, value); } catch (e) {} };

// Great-circle distance in km between two [lat, lon] points.
const distanceKm = ([lat1, lon1], [lat2, lon2]) => {
    const rad = (d) => d * Math.PI / 180;
    const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
};
const closestLocale = (point) => LOCALES.reduce((best, l) => (distanceKm(point, l.point) < distanceKm(point, best.point) ? l : best));

// Offline first guess: the Americas and the Pacific are closer to Mexico, the rest of the world to Spain.
const guessFromTimeZone = () => {
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return localeById(/^(America|Pacific)\//.test(tz) ? 'es-MX' : 'es-ES');
};

let currentLocale = localeById(readKey(LOCALE_KEY)) || localeById(readKey(GEO_KEY)) || guessFromTimeZone();

const setLocale = (locale) => {
    currentLocale = locale;
    window.dispatchEvent(new CustomEvent('lm-locale', { detail: locale }));
};

// Clicking a flag: remember it and update every component on the page (no reload needed).
const chooseLocale = (locale) => {
    writeKey(LOCALE_KEY, locale.id);
    setLocale(locale);
};

// Current country; re-renders when a flag is clicked here or in another tab, or when geo-location corrects the guess.
const useLocale = () => {
    const [locale, set] = useState(currentLocale);
    useEffect(() => {
        const onLocale = (e) => set(e.detail);
        const onStorage = (e) => { if (e.key === LOCALE_KEY && localeById(e.newValue)) setLocale(localeById(e.newValue)); };
        window.addEventListener('lm-locale', onLocale);
        window.addEventListener('storage', onStorage);
        set(currentLocale);
        return () => { window.removeEventListener('lm-locale', onLocale); window.removeEventListener('storage', onStorage); };
    }, []);
    return locale;
};

// Runs once per page load: geo-locate only when no flag was clicked and no earlier lookup is cached.
(() => {
    // The site used to offer English through Google Translate; drop its leftover cookie so no page gets translated.
    const host = window.location.hostname;
    [`; path=/`, host.includes('.') ? `; path=/; domain=.${host.replace(/^www\./, '')}` : null]
        .filter(Boolean)
        .forEach(scope => { document.cookie = `googtrans=${scope}; expires=Thu, 01 Jan 1970 00:00:00 GMT`; });

    if (localeById(readKey(LOCALE_KEY)) || localeById(readKey(GEO_KEY))) return;
    fetch(GEO_URL)
        .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(geo => {
            const lat = parseFloat(geo.latitude), lon = parseFloat(geo.longitude);
            const locale = LOCALES.find(l => l.country === geo.country_code)
                || (Number.isFinite(lat) && Number.isFinite(lon) ? closestLocale([lat, lon]) : null);
            if (!locale) return;
            writeKey(GEO_KEY, locale.id);
            if (!localeById(readKey(LOCALE_KEY)) && locale.id !== currentLocale.id) setLocale(locale);
        })
        .catch(() => {}); // keep the time-zone guess
})();

const LanguageSwitcher = ({ withLabels = false }) => {
    const current = useLocale();
    return (
        <div className={`flex items-center ${withLabels ? 'flex-wrap justify-center gap-3' : 'gap-1.5'}`} role="group" aria-label="País y divisa">
            {LOCALES.map(locale => {
                const active = current.id === locale.id;
                return (
                    <button
                        key={locale.id}
                        onClick={() => !active && chooseLocale(locale)}
                        aria-pressed={active}
                        title={`${locale.label} · ${locale.currency}`}
                        aria-label={`${locale.label} (${locale.currency})`}
                        className={withLabels
                            ? `flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-colors ${active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-500'}`
                            : `p-0.5 rounded-md transition-all ${active ? 'ring-2 ring-blue-600 ring-offset-1' : 'opacity-60 hover:opacity-100'}`}
                    >
                        <span className="block w-6 h-4 rounded-[3px] overflow-hidden shadow-sm border border-black/10 [&>svg]:w-full [&>svg]:h-full"><locale.Flag /></span>
                        {withLabels && `${locale.label} · ${locale.currency}`}
                    </button>
                );
            })}
        </div>
    );
};

// --- POP-UP TEXT ---
const TXT = {
    login: 'Iniciar sesión', signup: 'Crear cuenta', account: 'Mi cuenta', logout: 'Cerrar sesión', close: 'Cerrar',
    name: 'Nombre', email: 'Email', password: 'Contraseña', passwordHint: 'Mínimo 8 caracteres',
    loginIntro: 'Accede a tu cuenta de Lameyer.', signupIntro: 'Crea tu cuenta para guardar tus pedidos y proyectos.',
    noAccount: '¿No tienes cuenta?', haveAccount: '¿Ya tienes cuenta?', loggedInAs: 'Has iniciado sesión como',
    errWrong: 'Email o contraseña incorrectos.', errExists: 'Ya existe una cuenta con ese email.', errShort: 'La contraseña debe tener al menos 8 caracteres.',
    errStorage: 'Tu navegador bloquea el almacenamiento local; no se puede iniciar sesión.', errCrypto: 'Abre la web por https para iniciar sesión.',
    working: 'Procesando...',
    cookiesTitle: 'Usamos cookies',
    cookiesText: 'Usamos cookies necesarias para que la web funcione (país, carrito, sesión). Con tu permiso, también usaremos cookies para medir y mejorar la web.',
    cookiesAccept: 'Aceptar todas', cookiesReject: 'Solo necesarias', cookiesMore: 'Más información',
};

// --- ACCOUNTS (login / sign up) ---
// STAGING: there is no server yet, so accounts live only in this browser's localStorage ('lm-users'), with salted
// SHA-256 password hashes, and the session in 'lm-session'. Replace the three functions in `auth` with calls to a real
// backend (Workers + D1, Supabase...) before launch; the pop-up does not need to change.
const authStore = {
    read: (key, fallback) => { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    write: (key, value) => { localStorage.setItem(key, JSON.stringify(value)); },   // throws if storage is blocked
};

const hashPassword = async (password, salt) => {
    if (!window.crypto || !crypto.subtle) throw new Error(TXT.errCrypto);
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
    return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
};

const auth = {
    current: () => {
        const email = authStore.read('lm-session', null);
        const user = email && authStore.read('lm-users', {})[email];
        return user ? { name: user.name, email } : null;
    },
    signup: async ({ name, email, password }) => {
        if (password.length < 8) throw new Error(TXT.errShort);
        const users = authStore.read('lm-users', {});
        if (users[email]) throw new Error(TXT.errExists);
        const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
        users[email] = { name, salt, hash: await hashPassword(password, salt), created: new Date().toISOString() };
        try { authStore.write('lm-users', users); authStore.write('lm-session', email); } catch (e) { throw new Error(TXT.errStorage); }
        return { name, email };
    },
    login: async ({ email, password }) => {
        const user = authStore.read('lm-users', {})[email];
        if (!user || user.hash !== await hashPassword(password, user.salt)) throw new Error(TXT.errWrong);
        try { authStore.write('lm-session', email); } catch (e) { throw new Error(TXT.errStorage); }
        return { name: user.name, email };
    },
    logout: () => { try { localStorage.removeItem('lm-session'); } catch (e) {} },
};

const UserIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
);

// Pop-up window with "Log in" and "Sign up" tabs; shows the account (and Log out) once logged in.
const AuthModal = ({ mode, setMode, user, onUser, onClose }) => {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const dialogRef = useRef(null);

    useEffect(() => {
        const opener = document.activeElement;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key !== 'Tab' || !dialogRef.current) return;
            // Keep keyboard focus inside the pop-up
            const items = dialogRef.current.querySelectorAll('button, input, a[href]');
            const first = items[0], last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
            if (opener && opener.focus) opener.focus();
        };
    }, []);

    useEffect(() => { setError(''); }, [mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = {
            name: (form.get('name') || '').trim(),
            email: (form.get('email') || '').trim().toLowerCase(),
            password: form.get('password') || '',
        };
        setBusy(true);
        setError('');
        try {
            onUser(mode === 'signup' ? await auth.signup(data) : await auth.login(data));
            onClose();
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    const inputClass = "w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
    const tabClass = (on) => `flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${on ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-blue-600'}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a192f]/60 backdrop-blur-sm animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-white border border-gray-200 rounded-[2rem] shadow-2xl p-8">
                <button type="button" onClick={onClose} aria-label={TXT.close} className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>

                {user ? (
                    <div className="text-center pt-2">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 id="auth-title" className="text-2xl font-black text-gray-900 tracking-tight mb-2">{TXT.account}</h2>
                        <p className="text-sm text-gray-500 font-medium mb-1">{TXT.loggedInAs}</p>
                        <p className="text-gray-900 font-bold mb-8 break-all">{user.name} · {user.email}</p>
                        <button type="button" autoFocus onClick={() => { auth.logout(); onUser(null); onClose(); }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full uppercase tracking-widest text-xs transition-all">
                            {TXT.logout}
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 id="auth-title" className="text-2xl font-black text-gray-900 tracking-tight mb-2 pr-10">{mode === 'signup' ? TXT.signup : TXT.login}</h2>
                        <p className="text-sm text-gray-500 font-medium mb-6">{mode === 'signup' ? TXT.signupIntro : TXT.loginIntro}</p>

                        <div className="flex gap-1 p-1 mb-6 rounded-full border border-gray-200" role="tablist">
                            <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')} className={tabClass(mode === 'login')}>{TXT.login}</button>
                            <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')} className={tabClass(mode === 'signup')}>{TXT.signup}</button>
                        </div>

                        <form key={mode} onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'signup' && (
                                <div>
                                    <label htmlFor="auth-name" className="block text-sm font-bold text-gray-700 mb-2">{TXT.name}</label>
                                    <input id="auth-name" name="name" type="text" required autoComplete="name" autoFocus className={inputClass} />
                                </div>
                            )}
                            <div>
                                <label htmlFor="auth-email" className="block text-sm font-bold text-gray-700 mb-2">{TXT.email}</label>
                                <input id="auth-email" name="email" type="email" required autoComplete="email" autoFocus={mode === 'login'} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="auth-password" className="block text-sm font-bold text-gray-700 mb-2">{TXT.password}</label>
                                <input id="auth-password" name="password" type="password" required minLength={mode === 'signup' ? 8 : undefined}
                                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={inputClass} />
                                {mode === 'signup' && <p className="mt-2 text-xs text-gray-500 font-medium">{TXT.passwordHint}</p>}
                            </div>

                            {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}

                            <button type="submit" disabled={busy} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full uppercase tracking-widest text-xs transition-all disabled:opacity-60">
                                {busy ? TXT.working : (mode === 'signup' ? TXT.signup : TXT.login)}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500 font-medium">
                            {mode === 'signup' ? TXT.haveAccount : TXT.noAccount}{' '}
                            <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="font-bold text-blue-600 hover:underline">
                                {mode === 'signup' ? TXT.login : TXT.signup}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

// --- COOKIE CONSENT ---
// Pop-up on the first visit to any page. The choice is stored in localStorage 'lm-cookies' ("all" or "necessary")
// and in window.LM_COOKIES. Load any analytics/marketing script only when hasCookieConsent() is true.
const COOKIE_KEY = 'lm-cookies';
const readCookieChoice = () => { try { return JSON.parse(localStorage.getItem(COOKIE_KEY)); } catch (e) { return null; } };
window.LM_COOKIES = (readCookieChoice() || {}).choice || null;
const hasCookieConsent = () => window.LM_COOKIES === 'all';

const CookieConsent = () => {
    const [open, setOpen] = useState(!window.LM_COOKIES);
    if (!open) return null;

    const choose = (choice) => {
        window.LM_COOKIES = choice;
        try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice, date: new Date().toISOString() })); } catch (e) {}
        window.dispatchEvent(new CustomEvent('lm-cookies', { detail: choice }));
        setOpen(false);
    };

    return (
        <div role="dialog" aria-modal="false" aria-labelledby="cookies-title" aria-describedby="cookies-text"
            className="fixed z-[95] left-4 right-4 bottom-4 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-md bg-white border border-gray-200 rounded-[2rem] shadow-2xl p-6 animate-fade-in">
            <h2 id="cookies-title" className="text-lg font-black text-gray-900 tracking-tight mb-2">{TXT.cookiesTitle}</h2>
            <p id="cookies-text" className="text-sm text-gray-500 font-medium leading-relaxed mb-5">
                {TXT.cookiesText}{' '}
                <a href="/pages/terminos/" className="font-bold text-blue-600 hover:underline">{TXT.cookiesMore}</a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => choose('necessary')} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-500 font-black uppercase tracking-widest text-[11px] transition-colors">
                    {TXT.cookiesReject}
                </button>
                <button type="button" onClick={() => choose('all')} className="flex-1 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] transition-all">
                    {TXT.cookiesAccept}
                </button>
            </div>
        </div>
    );
};

// Decorative particles rising behind the content: [left %, size px, duration s, delay s]
const PARTICLES = [
    [6, 2, 18, 0], [14, 3, 24, 6], [23, 2, 20, 12], [31, 2, 26, 3], [42, 3, 22, 9],
    [51, 2, 19, 15], [60, 2, 25, 4], [68, 3, 21, 11], [77, 2, 23, 7], [86, 2, 27, 1], [94, 3, 20, 13],
];

const Particles = () => (
    <div className="particles" aria-hidden="true">
        {PARTICLES.map(([left, size, duration, delay]) => (
            <span
                key={left}
                className="particle"
                style={{ left: `${left}%`, width: size, height: size, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
            />
        ))}
    </div>
);

// --- LAYOUT: top banner, header, mobile menu, footer ---
const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(auth.current);
    const [authMode, setAuthMode] = useState(null);   // null (closed), 'login' or 'signup'

    const openAuth = (mode = 'login') => {
        setAuthMode(mode);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

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
            <Particles />

            {/* Top Banner */}
            <div className="fixed top-0 w-full h-10 bg-[#0a192f] border-b border-white/5 z-[60] flex items-center justify-between px-8 overflow-hidden">
                <span className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2">
                    SUSTENTABILIDAD CORPORATIVA & ESG
                </span>
                <div className="flex items-center space-x-4 md:space-x-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto no-scrollbar">
                    {['ODS 6', 'ODS 11', 'ODS 13', 'AGENDA 2030', 'CUMPLIMIENTO ESG'].map((cert, index) => (
                        <div key={index} className="flex items-center space-x-1 flex-shrink-0">
                            <div className="w-1 h-3 bg-blue-500"></div>
                            <span className="text-[9px] font-bold text-white tracking-widest uppercase">{cert}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`fixed left-0 w-full z-[70] px-6 md:px-8 py-4 flex justify-between items-center glass shadow-sm transition-all top-[40px] ${isMobileMenuOpen ? 'menu-open' : ''}`}>
                <a href="/" className="block z-50">
                    <img src="https://raw.githubusercontent.com/cypher-the-meyer/themeyer.eu/main/themeyerlogo" alt="Logo de Lameyer" className="h-10 md:h-12 w-auto object-contain" />
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex space-x-8 text-sm font-semibold tracking-widest uppercase">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link) ? 'page' : undefined}
                            className={`transition-colors hover:text-blue-600 ${isActive(link) ? 'text-blue-600' : 'opacity-60 hover:opacity-100'}`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center space-x-3 md:space-x-4">
                    <LanguageSwitcher />
                    <button
                        onClick={() => openAuth()}
                        aria-label={user ? `${TXT.account}: ${user.name}` : TXT.login}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:text-blue-600 hover:border-blue-500 transition-colors"
                    >
                        <UserIcon />
                        <span className="hidden xl:inline max-w-[8rem] truncate">{user ? user.name.split(' ')[0] : TXT.login.toUpperCase()}</span>
                    </button>
                    <button
                        onClick={handleRegisterClick}
                        className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-md"
                    >
                        REGISTRO
                    </button>

                    {/* Mobile Hamburger Button: its three lines morph into an X while the menu is open */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-3 focus:outline-none"
                        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <span className="hamburger" aria-hidden="true"><span></span><span></span><span></span></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu: off-canvas panel sliding in from the right, under the header so the X stays visible */}
            <div id="mobile-menu" className={`mobile-menu fixed inset-0 pt-36 pb-12 bg-white/95 backdrop-blur-xl z-[65] md:hidden flex flex-col items-center justify-center space-y-8 overflow-y-auto no-scrollbar ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>

                {NAV_LINKS.map(link => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-3xl font-black tracking-tight hover:text-blue-600 transition-colors ${isActive(link) ? 'text-blue-600' : 'text-gray-900'}`}
                    >
                        {link.label}
                    </a>
                ))}
                <button
                    onClick={handleRegisterClick}
                    className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl mt-4"
                >
                    REGISTRO
                </button>
                <button
                    onClick={() => openAuth()}
                    className="flex items-center gap-2 px-8 py-3 rounded-full border border-gray-200 text-lg font-bold text-gray-700 hover:text-blue-600 transition-colors"
                >
                    <UserIcon className="w-5 h-5" />
                    {user ? user.name.split(' ')[0] : `${TXT.login} / ${TXT.signup}`}
                </button>
                <LanguageSwitcher withLabels />
            </div>

            <main className="relative z-[2] pt-32 px-4 md:px-8">
                {children}
            </main>

            <footer className="py-12 border-t border-gray-200 text-center text-gray-400 text-sm font-semibold tracking-widest bg-white relative z-20">
                &copy; 2026 LAMEYER® EU. TODOS LOS DERECHOS RESERVADOS.
                <a href="/pages/terminos/" className="block mt-3 text-xs hover:text-blue-600 transition-colors">TÉRMINOS Y CONDICIONES</a>
            </footer>

            {authMode && <AuthModal mode={authMode} setMode={setAuthMode} user={user} onUser={setUser} onClose={() => setAuthMode(null)} />}
            <CookieConsent />
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
        'CRM Y GESTIÓN DE DATOS',
        'CIBERSEGURIDAD',
        'Desarrollo con React',
        'Integraciones de API en la nube',
        'Bases de datos SQL',
        'Consultoría tecnológica de sistemas',
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
                Registro
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
                alt={`Logo de ${tech.name}`}
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
