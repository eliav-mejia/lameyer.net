// Access pop-ups. Shared by EVERY page, loaded right after /js/layout.jsx:
//   <script type="text/babel" src="/js/layout.jsx"></script>
//   <script type="text/babel" src="/js/acceso.jsx"></script>
// Layout (js/layout.jsx) asks accessRuleFor(path) which rule applies and wraps the page in <AccessGate>.
// The login form itself is AuthModal (js/layout.jsx); this file only decides when it opens and whether it can be closed.

// First matching prefix wins. Pages without a rule (inicio, términos, comunidad...) open freely.
//   required: the page content is not rendered until the visitor logs in; the pop-up cannot be closed.
//   optional: the page renders normally; the pop-up opens once per browser session and can be dismissed.
const ACCESS_RULES = [
    { path: '/pages/components/', mode: 'required' },
    { path: '/academia/', mode: 'optional' },
];

const ACCESS_TXT = {
    requiredTitle: 'Acceso para clientes',
    requiredText: 'Inicia sesión o crea tu cuenta para ver la tienda de componentes.',
    optionalText: 'Inicia sesión o crea tu cuenta de Lameyer. También puedes seguir sin cuenta.',
    skip: 'Continuar sin cuenta',
    home: 'Volver al inicio',
    terms: 'Términos y condiciones',
};

const ACCESS_SKIP_KEY = 'lm-acceso-omitido';   // sessionStorage: optional pop-up dismissed in this session

const accessRuleFor = (path) => ACCESS_RULES.find(rule => path.startsWith(rule.path)) || null;

const readSkip = () => { try { return sessionStorage.getItem(ACCESS_SKIP_KEY) === '1'; } catch (e) { return false; } };
const writeSkip = () => { try { sessionStorage.setItem(ACCESS_SKIP_KEY, '1'); } catch (e) {} };

// Portal container for the pop-up: Layout's <main> creates its own stacking context, so the pop-up lives on <body>.
const useBodyContainer = () => {
    const [node] = useState(() => {
        const el = document.createElement('div');
        el.id = 'lm-acceso';
        return el;
    });
    useLayoutEffect(() => {
        document.body.appendChild(node);
        return () => node.remove();
    }, []);
    return node;
};

// Required mode: if the pop-up is removed or hidden from the page while still locked, reload the page.
// lockedRef is updated during render, so logging in (which removes the pop-up) never counts as tampering.
const useLockGuard = (node, locked) => {
    const lockedRef = useRef(locked);
    lockedRef.current = locked;
    useEffect(() => {
        if (!locked) return;
        const tampered = () => {
            if (!document.body.contains(node) || !node.firstElementChild) return true;
            const style = getComputedStyle(node.firstElementChild);
            return style.display === 'none' || style.visibility === 'hidden';
        };
        const check = () => { if (lockedRef.current && tampered()) window.location.reload(); };
        const observer = new MutationObserver(check);
        observer.observe(document.body, { childList: true });
        observer.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
        return () => observer.disconnect();
    }, [node, locked]);
};

const AccessGate = ({ rule, user, onUser, children }) => {
    const [mode, setMode] = useState('login');
    const [skipped, setSkipped] = useState(readSkip);
    const node = useBodyContainer();
    const locked = rule.mode === 'required' && !user;
    useLockGuard(node, locked);

    // A login or logout in another tab applies here too.
    useEffect(() => {
        const onStorage = (e) => { if (e.key === 'lm-session' || e.key === 'lm-users' || e.key === null) onUser(auth.current()); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const skip = () => { writeSkip(); setSkipped(true); };
    const open = !user && (locked || !skipped);

    return (
        <>
            {locked ? (
                <section className="max-w-xl mx-auto py-40 text-center relative z-10" aria-hidden="true">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{ACCESS_TXT.requiredTitle}</h1>
                </section>
            ) : children}
            {open && ReactDOM.createPortal(
                <AuthModal
                    mode={mode}
                    setMode={setMode}
                    user={null}
                    onUser={onUser}
                    locked={locked}
                    notice={locked ? ACCESS_TXT.requiredText : ACCESS_TXT.optionalText}
                    onClose={locked ? () => {} : skip}
                    footer={locked ? (
                        <p className="mt-4 text-center text-xs font-bold space-x-4">
                            <a href="/" className="text-gray-500 hover:text-blue-600">{ACCESS_TXT.home}</a>
                            <a href="/pages/terminos/" className="text-gray-500 hover:text-blue-600">{ACCESS_TXT.terms}</a>
                        </p>
                    ) : (
                        <button type="button" onClick={skip} className="mt-4 w-full py-3 rounded-full border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-500 font-black uppercase tracking-widest text-[11px] transition-colors">
                            {ACCESS_TXT.skip}
                        </button>
                    )}
                />,
                node
            )}
        </>
    );
};
