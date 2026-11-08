// /cuenta/ · account settings (Supabase Auth). Loaded after /js/layout.jsx, which provides auth, AuthModal, SUPABASE_URL…
// Every email link (confirm, recover, change email) and every Google/Microsoft return lands here: supabase-js exchanges
// ?code= for a session (PKCE) when the client loads. What a user may read or change is enforced by RLS on
// public.profiles (supabase/migrations/); deleting the account goes through the Edge Function «eliminar-cuenta».

const CUENTA = {
    title: 'Mi cuenta', intro: 'Datos de acceso y ajustes de tu cuenta de Lameyer.',
    loading: 'Cargando tu cuenta…',
    outTitle: 'Inicia sesión', outText: 'Entra o crea tu cuenta para ver y cambiar tus ajustes.',
    confirmedText: 'Tu email está confirmado. Inicia sesión para continuar.',
    linkError: 'El enlace no es válido o ya caducó. Pide uno nuevo.',
    recoveryTitle: 'Elige una contraseña nueva', recoveryText: 'Entraste con un enlace de recuperación. Cambia tu contraseña ahora.',
    back: 'Volver a donde estabas',
    profile: 'Perfil', name: 'Nombre', save: 'Guardar', saved: 'Guardado.',
    email: 'Email', newEmail: 'Nuevo email', changeEmail: 'Cambiar email',
    emailSent: 'Te enviamos un enlace a tu email actual y otro al nuevo. El cambio se aplica al confirmar en ambos.',
    password: 'Contraseña', newPassword: 'Nueva contraseña', repeat: 'Repite la contraseña', changePassword: 'Cambiar contraseña',
    passwordHint: 'Mínimo 12 caracteres, con mayúsculas, minúsculas, números y símbolos. Si entras con Google o Microsoft, así añades también acceso por email.',
    passwordSaved: 'Contraseña actualizada.', mismatch: 'Las contraseñas no coinciden.',
    methods: 'Métodos de acceso', methodsHint: 'Una cuenta puede entrar con varios métodos si usan el mismo email verificado.',
    since: 'desde',
    sessions: 'Sesiones', sessionsText: 'Cierra la sesión en todos tus dispositivos (por ejemplo, si perdiste uno).',
    logoutAll: 'Cerrar sesión en todos los dispositivos', logout: 'Cerrar sesión',
    danger: 'Eliminar cuenta', dangerText: 'Borra tu cuenta y tu perfil para siempre. Escribe ELIMINAR para confirmar.',
    deleteBtn: 'Eliminar mi cuenta', deleteFail: 'No se pudo eliminar la cuenta. Inténtalo más tarde o escríbenos.',
    working: 'Procesando…', error: 'No se pudo guardar. Inténtalo de nuevo.',
};
const PROVIDER_LABEL = { email: 'Email y contraseña', google: 'Google', azure: 'Microsoft', apple: 'Apple', github: 'GitHub' };
const RECOVERY_MAX_MS = 60 * 60 * 1000;   // a reset link requested in this browser in the last hour

const readReturn = () => {
    try {
        const v = sessionStorage.getItem(RETURN_KEY);
        return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(ACCOUNT_PATH) ? v : null;   // internal paths only
    } catch (e) { return null; }
};
const recoveryPending = () => {
    try { const t = Number(localStorage.getItem(RECOVERY_KEY)); return t > 0 && Date.now() - t < RECOVERY_MAX_MS; } catch (e) { return false; }
};
const clearRecovery = () => { try { localStorage.removeItem(RECOVERY_KEY); } catch (e) {} };

const inputCls = "w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
const btnCls = "px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full uppercase tracking-widest text-xs transition-all disabled:opacity-60";
const ghostCls = "px-8 py-3.5 rounded-full border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-500 font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-60";

const Card = ({ title, children, tone = '' }) => (
    <section className={`bg-white border rounded-[2rem] p-8 shadow-sm ${tone || 'border-gray-200'}`}>
        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">{title}</h2>
        {children}
    </section>
);
const Note = ({ msg }) => msg ? <p role={msg.ok ? 'status' : 'alert'} className={`mt-3 text-sm font-bold ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p> : null;

// One small form = one action. `run` returns the success text or throws.
const useAction = () => {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const go = async (run) => {
        setBusy(true); setMsg(null);
        try { setMsg({ ok: true, text: await run() }); } catch (err) { setMsg({ ok: false, text: err.message || CUENTA.error }); }
        setBusy(false);
    };
    return { busy, msg, go };
};

const ProfileCard = ({ sb, user, nombre, setNombre }) => {
    const a = useAction();
    const submit = (e) => {
        e.preventDefault();
        const value = new FormData(e.target).get('nombre').trim().slice(0, 80);
        a.go(async () => {
            const { error } = await sb.from('profiles').update({ nombre: value }).eq('id', user.id);   // RLS: own row only
            if (error) throw authError(error);
            await sb.auth.updateUser({ data: { full_name: value } });                              // header name
            setNombre(value);
            return CUENTA.saved;
        });
    };
    return (
        <Card title={CUENTA.profile}>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                    <label htmlFor="c-nombre" className="block text-sm font-bold text-gray-700 mb-2">{CUENTA.name}</label>
                    <input id="c-nombre" name="nombre" required maxLength={80} defaultValue={nombre} autoComplete="name" className={inputCls} />
                </div>
                <button disabled={a.busy} className={btnCls}>{a.busy ? CUENTA.working : CUENTA.save}</button>
            </form>
            <Note msg={a.msg} />
        </Card>
    );
};

const EmailCard = ({ sb, user }) => {
    const a = useAction();
    const submit = (e) => {
        e.preventDefault();
        const email = new FormData(e.target).get('email').trim().toLowerCase();
        a.go(async () => {
            const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: accountUrl() });
            if (error) throw authError(error);
            return CUENTA.emailSent;
        });
    };
    return (
        <Card title={CUENTA.email}>
            <p className="text-gray-900 font-bold mb-4 break-all">{user.email}</p>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                    <label htmlFor="c-email" className="block text-sm font-bold text-gray-700 mb-2">{CUENTA.newEmail}</label>
                    <input id="c-email" name="email" type="email" required autoComplete="email" className={inputCls} />
                </div>
                <button disabled={a.busy} className={btnCls}>{a.busy ? CUENTA.working : CUENTA.changeEmail}</button>
            </form>
            <Note msg={a.msg} />
        </Card>
    );
};

const PasswordCard = ({ sb, recovery, onDone }) => {
    const a = useAction();
    const ref = useRef(null);
    useEffect(() => { if (recovery && ref.current) { ref.current.scrollIntoView({ block: 'center' }); ref.current.focus(); } }, [recovery]);
    const submit = (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        const password = f.get('password');
        a.go(async () => {
            if (password !== f.get('repeat')) throw new Error(CUENTA.mismatch);
            const { error } = await sb.auth.updateUser({ password });
            if (error) throw authError(error);
            e.target.reset();
            onDone();
            return CUENTA.passwordSaved;
        });
    };
    return (
        <Card title={recovery ? CUENTA.recoveryTitle : CUENTA.password} tone={recovery ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}>
            {recovery && <p className="text-sm text-gray-600 font-medium mb-4">{CUENTA.recoveryText}</p>}
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="c-pass" className="block text-sm font-bold text-gray-700 mb-2">{CUENTA.newPassword}</label>
                    <input ref={ref} id="c-pass" name="password" type="password" required minLength={12} autoComplete="new-password" className={inputCls} />
                </div>
                <div>
                    <label htmlFor="c-pass2" className="block text-sm font-bold text-gray-700 mb-2">{CUENTA.repeat}</label>
                    <input id="c-pass2" name="repeat" type="password" required minLength={12} autoComplete="new-password" className={inputCls} />
                </div>
                <p className="sm:col-span-2 text-xs text-gray-500 font-medium">{CUENTA.passwordHint}</p>
                <div className="sm:col-span-2"><button disabled={a.busy} className={btnCls}>{a.busy ? CUENTA.working : CUENTA.changePassword}</button></div>
            </form>
            <Note msg={a.msg} />
        </Card>
    );
};

const MethodsCard = ({ identities }) => (
    <Card title={CUENTA.methods}>
        <ul className="space-y-2 mb-3">
            {identities.map(i => (
                <li key={i.identity_id || i.id} className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50">
                    <span className="font-bold text-gray-900">{PROVIDER_LABEL[i.provider] || i.provider}</span>
                    <span className="text-xs text-gray-500 font-medium">{CUENTA.since} {new Date(i.created_at).toLocaleDateString('es')}</span>
                </li>
            ))}
        </ul>
        <p className="text-xs text-gray-500 font-medium">{CUENTA.methodsHint}</p>
    </Card>
);

const SessionsCard = () => {
    const a = useAction();
    return (
        <Card title={CUENTA.sessions}>
            <p className="text-sm text-gray-600 font-medium mb-4">{CUENTA.sessionsText}</p>
            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={async () => { await auth.logout('local'); window.location.assign('/'); }} className={ghostCls}>{CUENTA.logout}</button>
                <button type="button" disabled={a.busy} onClick={() => a.go(async () => { await auth.logout('global'); window.location.assign('/'); return ''; })} className={ghostCls}>
                    {a.busy ? CUENTA.working : CUENTA.logoutAll}
                </button>
            </div>
        </Card>
    );
};

const DeleteCard = ({ sb }) => {
    const a = useAction();
    const [typed, setTyped] = useState('');
    const submit = (e) => {
        e.preventDefault();
        a.go(async () => {
            const { data } = await sb.auth.getSession();
            const token = data.session && data.session.access_token;
            const res = await fetch(`${SUPABASE_URL}/functions/v1/eliminar-cuenta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
                body: JSON.stringify({ confirmar: 'ELIMINAR' }),
            }).catch(() => null);
            if (!res || !res.ok) throw new Error(CUENTA.deleteFail);
            await auth.logout('local');
            window.location.assign('/');
            return '';
        });
    };
    return (
        <Card title={CUENTA.danger} tone="border-red-200">
            <p className="text-sm text-gray-600 font-medium mb-4">{CUENTA.dangerText}</p>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input aria-label="ELIMINAR" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" className={`${inputCls} sm:max-w-[12rem]`} />
                <button disabled={a.busy || typed !== 'ELIMINAR'} className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-full uppercase tracking-widest text-xs transition-all disabled:opacity-40">
                    {a.busy ? CUENTA.working : CUENTA.deleteBtn}
                </button>
            </form>
            <Note msg={a.msg} />
        </Card>
    );
};

const CuentaPage = () => {
    const [state, setState] = useState({ loading: true });
    const [nombre, setNombre] = useState('');
    const [authMode, setAuthMode] = useState(null);
    const [recovery, setRecovery] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromLink = params.has('code') || params.has('token_hash');
        const linkError = params.get('error_description');
        let alive = true;
        (async () => {
            let sb;
            try { sb = await auth.client(); } catch (err) { if (alive) setState({ loading: false, error: err.message }); return; }
            const { data } = await sb.auth.getUser();                       // after the client finished reading ?code=
            if (window.location.search) history.replaceState(null, '', ACCOUNT_PATH);   // no code left in history or analytics
            const user = data && data.user;
            if (!alive) return;
            if (!user) {
                setState({ loading: false, sb, notice: linkError ? CUENTA.linkError : fromLink ? CUENTA.confirmedText : null });
                return;
            }
            const isRecovery = recoveryPending();
            const back = readReturn();
            if (fromLink && back && !isRecovery) { try { sessionStorage.removeItem(RETURN_KEY); } catch (e) {} window.location.replace(back); return; }
            const [{ data: profile }, { data: ids }] = await Promise.all([
                sb.from('profiles').select('nombre').eq('id', user.id).maybeSingle(),
                sb.auth.getUserIdentities(),
            ]);
            if (!alive) return;
            setNombre((profile && profile.nombre) || toUser(user).name);
            setRecovery(isRecovery);
            setState({ loading: false, sb, user, identities: (ids && ids.identities) || [], back });
        })();
        return () => { alive = false; };
    }, []);

    if (state.loading) return <p className="max-w-3xl mx-auto py-32 text-center text-gray-500 font-bold">{CUENTA.loading}</p>;

    if (!state.user) return (
        <section className="max-w-xl mx-auto py-24 text-center">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{CUENTA.outTitle}</h1>
            <p className="text-gray-600 font-medium mb-8">{state.error || state.notice || CUENTA.outText}</p>
            <div className="flex justify-center gap-3">
                <button type="button" onClick={() => setAuthMode('login')} className={btnCls}>{TXT.login}</button>
                <button type="button" onClick={() => setAuthMode('signup')} className={ghostCls}>{TXT.signup}</button>
            </div>
            {authMode && <AuthModal mode={authMode} setMode={setAuthMode} user={null} onUser={() => window.location.reload()} onClose={() => setAuthMode(null)} />}
        </section>
    );

    const { sb, user, identities, back } = state;
    return (
        <div className="max-w-3xl mx-auto pb-24">
            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">{CUENTA.title}</h1>
                <p className="text-gray-600 font-medium">{CUENTA.intro}</p>
                {back && <a href={back} className="inline-block mt-4 text-sm font-bold text-blue-600 hover:underline">← {CUENTA.back}</a>}
            </header>
            <div className="space-y-6">
                {recovery && <PasswordCard sb={sb} recovery onDone={() => { clearRecovery(); setRecovery(false); }} />}
                <ProfileCard sb={sb} user={user} nombre={nombre} setNombre={setNombre} />
                <EmailCard sb={sb} user={user} />
                {!recovery && <PasswordCard sb={sb} recovery={false} onDone={clearRecovery} />}
                <MethodsCard identities={identities} />
                <SessionsCard />
                <DeleteCard sb={sb} />
            </div>
        </div>
    );
};

renderPage(CuentaPage);
