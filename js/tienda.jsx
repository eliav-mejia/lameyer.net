// Shop only: /pages/components/ (store) and /pages/terminos/ (terms).
// Load it after layout.jsx:  <script type="text/babel" src="/js/tienda.jsx"></script>

// --- SELLER & ADDRESSES (shown on the terms page) ---
// Replace every [ ... ] before publishing.
const SELLER = {
    name: '[Razón social]',
    nif: '[NIF / CIF]',
    address: '[Domicilio fiscal completo]',
    email: CONTACT_EMAIL,
    whatsapp: '34602557685',      // digits only, international format
    whatsappLabel: '+34 602 55 76 85',
};

// Returns go to either address; the customer picks the one that suits them.
const RETURN_ADDRESSES = [
    {
        id: 'espana',
        label: 'Centro de devoluciones · España',
        lines: ['Lameyer — Devoluciones', '[Calle y número]', '[Código postal] [Ciudad], [Provincia]', 'España'],
    },
    {
        id: 'madrid',
        label: 'Punto de devolución · Madrid',
        lines: ['Lameyer — Devoluciones Madrid', '[Calle y número]', '[Código postal] Madrid', 'España'],
    },
];

const RETURN_DAYS = 30;
const TERMS_URL = '/pages/terminos/';
const TERMS_UPDATED = '3 de octubre de 2026';

// --- CURRENCIES ---
// Prices are stored and charged in EUR. Other currencies are shown for reference
// using the European Central Bank daily rates (Frankfurter API), with these fallbacks.
const CURRENCIES = [
    { code: 'EUR', label: 'Euro', locale: 'es-ES', rate: 1 },
    { code: 'USD', label: 'Dólar EE. UU.', locale: 'en-US', rate: 1.1225 },
    { code: 'MXN', label: 'Peso mexicano', locale: 'es-MX', rate: 20.5806 },
    { code: 'GBP', label: 'Libra esterlina', locale: 'en-GB', rate: 0.85033 },
    { code: 'ILS', label: 'Nuevo séquel', locale: 'en-IL', rate: 3.4408 },
];
const RATES_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=' +
    CURRENCIES.filter(c => c.code !== 'EUR').map(c => c.code).join(',');

// localStorage can be missing or throw (private mode, blocked storage): never rely on it.
const store = {
    get(key, fallback) {
        try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    },
};

// Selected currency + live rates. Returns { currency, setCurrency, format, ratesDate }.
const useCurrency = () => {
    const [code, setCode] = useState(() => {
        const saved = store.get('lm-currency', 'EUR');
        return CURRENCIES.some(c => c.code === saved) ? saved : 'EUR';
    });
    const [rates, setRates] = useState(() => Object.fromEntries(CURRENCIES.map(c => [c.code, c.rate])));
    const [ratesDate, setRatesDate] = useState(null);

    useEffect(() => {
        let alive = true;
        fetch(RATES_URL)
            .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(data => {
                if (!alive || !data || !data.rates) return;
                setRates(prev => ({ ...prev, ...data.rates, EUR: 1 }));
                setRatesDate(data.date);
            })
            .catch(() => {}); // keep fallback rates
        return () => { alive = false; };
    }, []);

    const setCurrency = (next) => { setCode(next); store.set('lm-currency', next); };
    const currency = CURRENCIES.find(c => c.code === code);

    const format = (eur, target = code) => {
        const c = CURRENCIES.find(x => x.code === target);
        // "MXN 821.17" instead of "$821.17", so pesos and dollars can't be confused.
        const display = c.code === 'EUR' ? 'symbol' : 'code';
        return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code, currencyDisplay: display }).format(eur * rates[c.code]);
    };

    return { currency, setCurrency, format, ratesDate };
};

const CurrencySelect = ({ value, onChange, className = '' }) => (
    <label className={`relative inline-flex items-center ${className}`}>
        <span className="sr-only">Divisa</span>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="appearance-none cursor-pointer pl-5 pr-10 py-3 rounded-full border border-gray-200 bg-white text-xs font-bold uppercase tracking-widest text-gray-700 hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} · {c.label}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-4 w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l4 4 4-4" /></svg>
    </label>
);

// --- DATA LAYER ---
// Pre-launch: the "database" is two JSON files in /public/db/ edited by hand (see public/db/README.md).
// To move to a real database, change only these two loaders; the rest of the shop uses db.* .
const DB_BASE = '/public/db';
const SHOP_URL = '/pages/components/';

const loadJson = (name) =>
    fetch(`${DB_BASE}/${name}.json`, { cache: 'no-cache' })   // revalidate so manual edits show up at once
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(`${name}.json: HTTP ${r.status}`))));

let catalogPromise = null;
const db = {
    // { categories, products } with inactive products filtered out. Loaded once per page.
    catalog() {
        if (!catalogPromise) {
            catalogPromise = Promise.all([loadJson('categorias'), loadJson('productos')]).then(([c, p]) => ({
                categories: [...c.categories].sort((a, b) => a.sort_order - b.sort_order),
                products: p.products.filter(x => x.active !== false),
            }));
        }
        return catalogPromise;
    },
};

// Catalogue state for components: { status: 'loading' | 'ready' | 'error', categories, products, byId, bySlug, category }
const useCatalog = () => {
    const [state, setState] = useState({ status: 'loading', categories: [], products: [] });
    useEffect(() => {
        let alive = true;
        db.catalog()
            .then(data => alive && setState({ status: 'ready', ...data }))
            .catch(error => { console.error('[tienda] No se pudo cargar el catálogo:', error); alive && setState(s => ({ ...s, status: 'error' })); });
        return () => { alive = false; };
    }, []);
    return {
        ...state,
        byId: (id) => state.products.find(p => p.id === id),
        bySlug: (slug) => state.products.find(p => p.slug === slug),
        category: (id) => state.categories.find(c => c.id === id) || { id, label: id, icon: '📦', description: '' },
    };
};

const productUrl = (product) => `${SHOP_URL}${product.slug}/`;
const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

// Grades: 'estandar' = compatible part, tested; 'premium' = OEM-grade components.
const GRADES = {
    estandar: { label: 'Estándar', className: 'bg-gray-100 text-gray-600' },
    premium: { label: 'Calidad premium', className: 'bg-blue-50 text-blue-600' },
};

const stockInfo = (stock) =>
    stock <= 0 ? { label: 'Agotado', className: 'bg-red-50 text-red-600', canBuy: false }
    : stock <= 3 ? { label: `Últimas ${stock} unidades`, className: 'bg-amber-50 text-amber-700', canBuy: true }
    : { label: 'En stock', className: 'bg-emerald-50 text-emerald-700', canBuy: true };

// --- CART (localStorage, shared by the shop and every product page) ---
const useCart = (catalog) => {
    const [cart, setCart] = useState(() => store.get('lm-cart', {}) || {});
    const [open, setOpen] = useState(false);

    useEffect(() => { store.set('lm-cart', cart); }, [cart]);
    // Keep tabs in sync (product page in one tab, shop in another)
    useEffect(() => {
        const onStorage = (e) => { if (e.key === 'lm-cart') setCart(store.get('lm-cart', {}) || {}); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const setQty = (id, qty) => setCart(prev => {
        const next = { ...prev };
        if (qty > 0) next[id] = Math.min(qty, 99); else delete next[id];
        return next;
    });
    const add = (id, n = 1) => setCart(prev => ({ ...prev, [id]: Math.min((prev[id] || 0) + n, 99) }));

    // Drop ids that no longer exist (or are inactive) once the catalogue is loaded
    const lines = catalog.status === 'ready'
        ? Object.entries(cart).map(([id, qty]) => ({ product: catalog.byId(id), qty })).filter(l => l.product && l.qty > 0)
        : [];
    const count = lines.reduce((a, l) => a + l.qty, 0);

    return { cart, lines, count, add, setQty, open, setOpen };
};

// --- SHARED PIECES ---
const ProductImage = ({ product, catalog, size = 'card', eager = false }) => {
    const cat = catalog.category(product.category_id);
    const img = product.image;
    if (!img) {
        return size === 'thumb'
            ? <div className="w-14 h-14 flex-none rounded-xl bg-gray-100 flex items-center justify-center text-xl" aria-hidden="true">{cat.icon}</div>
            : <div className="aspect-square w-full rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-7xl" aria-hidden="true">{cat.icon}</div>;
    }
    if (size === 'thumb') {
        return <img src={img.src_400} width="56" height="56" loading="lazy" decoding="async" alt="" className="w-14 h-14 flex-none rounded-xl bg-white border border-gray-100 object-contain" />;
    }
    return (
        <img
            src={img.src_400}
            srcSet={`${img.src_400} 400w, ${img.src_800} 800w`}
            sizes={size === 'hero' ? '(min-width: 1024px) 560px, 92vw' : '(min-width: 1024px) 340px, (min-width: 640px) 45vw, 90vw'}
            width="400"
            height="400"
            loading={eager ? 'eager' : 'lazy'}
            fetchpriority={eager ? 'high' : undefined}
            decoding="async"
            alt={`${product.name} compatible con ${product.compat}`}
            className="aspect-square w-full rounded-[1.5rem] bg-white object-contain transition-transform duration-500 group-hover:scale-105"
        />
    );
};

const ProductCard = ({ product, catalog, money, onAdd, inCart, eager }) => {
    const cat = catalog.category(product.category_id);
    const grade = GRADES[product.grade] || GRADES.estandar;
    const stock = stockInfo(product.stock);
    const foreign = money.currency.code !== 'EUR';
    const url = productUrl(product);

    return (
        <article className="group flex flex-col rounded-[2rem] border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/40 hover:border-blue-500 hover:shadow-blue-500/10 transition-all duration-300">
            <a href={url} className="relative mb-5 overflow-hidden rounded-[1.5rem] block" tabIndex="-1" aria-hidden="true">
                <ProductImage product={product} catalog={catalog} eager={eager} />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${grade.className}`}>{grade.label}</span>
                {!stock.canBuy && <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${stock.className}`}>{stock.label}</span>}
            </a>

            <div className="flex flex-col flex-1 px-2 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 mb-2">{cat.label}</p>
                <h3 className="text-lg font-black text-gray-900 leading-snug mb-1">
                    <a href={url} className="hover:text-blue-600 transition-colors">{product.name}</a>
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-6 flex-1">Compatible con {product.compat}</p>

                <div className="mb-5">
                    <p translate="no" className="text-2xl font-black text-gray-900 tracking-tight">{foreign && '≈ '}{money.format(product.price_eur)}</p>
                    <p className="text-[11px] text-gray-400 font-semibold">
                        {foreign ? `Se cobra ${eur(product.price_eur)} · IVA incl.` : 'IVA incluido'}
                    </p>
                </div>

                <button
                    onClick={() => onAdd(product.id)}
                    disabled={!stock.canBuy}
                    className={`w-full py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${stock.canBuy ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                    {!stock.canBuy ? 'Agotado' : inCart ? `Añadir otro (${inCart} en el carrito)` : 'Añadir al carrito'}
                </button>
                <div className="mt-3 flex justify-center gap-3 text-[11px] font-semibold text-gray-400">
                    <a href={url} className="hover:text-blue-600 transition-colors">Ver ficha</a>
                    <span aria-hidden="true">·</span>
                    <a href={`${TERMS_URL}#devoluciones`} className="hover:text-blue-600 transition-colors">Devolución {RETURN_DAYS} días</a>
                </div>
            </div>
        </article>
    );
};

// Cart drawer with WhatsApp checkout
const CartDrawer = ({ cartState, catalog, money }) => {
    const { lines, setQty, open, setOpen } = cartState;
    const onClose = () => setOpen(false);
    const [name, setName] = useState('');
    const [delivery, setDelivery] = useState('envio');
    const [postal, setPostal] = useState('');
    const [accepted, setAccepted] = useState(false);
    const closeRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        closeRef.current && closeRef.current.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const total = lines.reduce((sum, l) => sum + l.product.price_eur * l.qty, 0);
    const foreign = money.currency.code !== 'EUR';
    const validPostal = /^\d{5}$/.test(postal.trim());
    const ready = lines.length > 0 && accepted && name.trim() && (delivery === 'recogida' || validPostal);

    const message = [
        'Hola Lameyer, quiero hacer este pedido:',
        '',
        ...lines.map(l => `• ${l.qty} × ${l.product.name} (${l.product.compat}) [${l.product.sku}] — ${eur(l.product.price_eur * l.qty)}`),
        '',
        `Total: ${eur(total)} (IVA incluido)` + (foreign ? ` · ≈ ${money.format(total)}` : ''),
        `Nombre: ${name.trim()}`,
        delivery === 'envio' ? `Entrega: envío a domicilio · CP ${postal.trim()}` : 'Entrega: recogida en Madrid',
        '',
        `He leído y acepto los Términos y Condiciones: https://lameyer.net${TERMS_URL}`,
    ].join('\n');
    const href = `https://wa.me/${SELLER.whatsapp}?text=${encodeURIComponent(message)}`;

    const inputClass = 'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

    return (
        <div className={`fixed inset-0 z-[95] ${open ? '' : 'pointer-events-none invisible'}`}>
            <div onClick={onClose} className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}></div>
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-title"
                className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-6 py-5 bg-slate-900 text-white">
                    <h2 id="cart-title" className="text-lg font-black tracking-tight">Tu carrito</h2>
                    <button ref={closeRef} onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10" aria-label="Cerrar carrito">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {lines.length === 0 ? (
                        <p className="text-sm text-gray-500 font-medium text-center py-16">Tu carrito está vacío.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 mb-6">
                            {lines.map(({ product, qty }) => (
                                <li key={product.id} className="py-4 flex gap-4">
                                    <ProductImage product={product} catalog={catalog} size="thumb" />
                                    <div className="flex-1 min-w-0">
                                        <a href={productUrl(product)} className="block text-sm font-bold text-gray-900 leading-snug hover:text-blue-600">{product.name}</a>
                                        <p className="text-xs text-gray-400 font-medium truncate">{product.compat}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button onClick={() => setQty(product.id, qty - 1)} className="w-7 h-7 rounded-full border border-gray-200 hover:border-blue-500 text-sm font-bold" aria-label={`Quitar uno: ${product.name}`}>−</button>
                                            <span translate="no" className="w-6 text-center text-sm font-bold">{qty}</span>
                                            <button onClick={() => setQty(product.id, qty + 1)} className="w-7 h-7 rounded-full border border-gray-200 hover:border-blue-500 text-sm font-bold" aria-label={`Añadir uno: ${product.name}`}>+</button>
                                            <button onClick={() => setQty(product.id, 0)} className="ml-auto text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600">Quitar</button>
                                        </div>
                                    </div>
                                    <p translate="no" className="text-sm font-black text-gray-900 whitespace-nowrap">{money.format(product.price_eur * qty)}</p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {lines.length > 0 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="co-name" className="block text-xs font-bold text-gray-700 mb-1.5">Nombre *</label>
                                <input id="co-name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" className={inputClass} />
                            </div>
                            <fieldset>
                                <legend className="block text-xs font-bold text-gray-700 mb-1.5">Entrega *</legend>
                                <div className="grid grid-cols-2 gap-2">
                                    {[['envio', 'Envío en España'], ['recogida', 'Recogida en Madrid']].map(([id, label]) => (
                                        <label key={id} className={`cursor-pointer px-3 py-3 rounded-2xl border text-xs font-bold text-center transition-colors focus-within:ring-2 focus-within:ring-blue-500/40 ${delivery === id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-500'}`}>
                                            <input type="radio" name="delivery" value={id} checked={delivery === id} onChange={() => setDelivery(id)} className="sr-only" />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            {delivery === 'envio' && (
                                <div>
                                    <label htmlFor="co-cp" className="block text-xs font-bold text-gray-700 mb-1.5">Código postal *</label>
                                    <input id="co-cp" value={postal} onChange={e => setPostal(e.target.value.replace(/\D/g, ''))} inputMode="numeric" autoComplete="postal-code" maxLength="5" placeholder="28001" className={inputClass} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {lines.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
                        <div className="flex items-baseline justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total</span>
                            <span translate="no" className="text-2xl font-black text-gray-900">{foreign && '≈ '}{money.format(total)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            {foreign ? `Se cobra ${eur(total)} (IVA incluido). El importe en ${money.currency.code} es orientativo. ` : 'IVA incluido. '}
                            Los gastos de envío se confirman por WhatsApp antes del pago.
                        </p>
                        <label className="flex items-start gap-3 text-xs text-gray-600 font-medium cursor-pointer">
                            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
                            <span>He leído y acepto los <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">Términos y Condiciones</a> y la <a href={`${TERMS_URL}#devoluciones`} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">política de devoluciones</a>.</span>
                        </label>
                        <a
                            href={ready ? href : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-disabled={!ready}
                            className={`flex items-center justify-center gap-2 w-full py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${ready ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:scale-[1.01]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            Enviar pedido por WhatsApp
                        </a>
                        {!ready && (
                            <p className="text-[11px] text-center text-gray-400 font-medium">Completa los datos y acepta los términos para continuar.</p>
                        )}
                    </div>
                )}
            </aside>
        </div>
    );
};

const CartButton = ({ cartState }) => (
    <button
        onClick={() => cartState.setOpen(true)}
        className="fixed right-6 bottom-6 z-[80] flex items-center gap-3 pl-5 pr-6 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/40 hover:scale-105 transition-all"
        aria-label={`Abrir carrito, ${cartState.count} artículos`}
    >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>
        Carrito
        <span translate="no" className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-white text-blue-600 flex items-center justify-center">{cartState.count}</span>
    </button>
);

const CatalogStatus = ({ status }) => (
    status === 'error' ? (
        <div className="text-center py-20 rounded-[2.5rem] border border-dashed border-red-200 bg-white/70">
            <p className="text-gray-700 font-bold mb-2">No se pudo cargar el catálogo.</p>
            <p className="text-gray-500 font-medium mb-6">Inténtalo de nuevo en unos segundos o escríbenos por WhatsApp.</p>
            <a href={`https://wa.me/${SELLER.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-md transition-colors">WhatsApp</a>
        </div>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Cargando catálogo">
            {[0, 1, 2].map(i => (
                <div key={i} className="rounded-[2rem] border border-gray-100 bg-white p-4 animate-pulse">
                    <div className="aspect-square rounded-[1.5rem] bg-gray-100 mb-5"></div>
                    <div className="h-3 w-20 bg-gray-100 rounded mb-3"></div>
                    <div className="h-5 w-3/4 bg-gray-100 rounded mb-6"></div>
                    <div className="h-10 bg-gray-100 rounded-full"></div>
                </div>
            ))}
        </div>
    )
);

// --- PRODUCT PAGE: /pages/components/<slug>/ ---
// Every product folder holds the same small index.html that ends with renderProduct();
// the page finds its product from its own URL, like blog entries do.
const slugFromUrl = () => window.location.pathname.replace(/\/+$/, '').split('/').pop();

const ProductPage = () => {
    const catalog = useCatalog();
    const money = useCurrency();
    const cartState = useCart(catalog);
    const [qty, setQty] = useState(1);
    const slug = slugFromUrl();
    const product = catalog.status === 'ready' ? catalog.bySlug(slug) : null;

    // Title + schema.org Product data for search engines
    useEffect(() => {
        if (!product) return;
        document.title = `${product.name} · ${product.compat} - Lameyer`;
        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.textContent = JSON.stringify({
            '@context': 'https://schema.org', '@type': 'Product',
            name: `${product.name} compatible con ${product.compat}`, sku: product.sku, description: product.description,
            image: product.image ? `https://lameyer.net${product.image.src_800}` : undefined,
            offers: {
                '@type': 'Offer', priceCurrency: 'EUR', price: product.price_eur.toFixed(2), url: `https://lameyer.net${productUrl(product)}`,
                availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/NewCondition',
            },
        });
        document.head.appendChild(ld);
        return () => ld.remove();
    }, [product && product.id]);

    if (catalog.status !== 'ready') {
        return <section className="max-w-6xl mx-auto py-24 relative z-20"><CatalogStatus status={catalog.status} /></section>;
    }

    if (!product) {
        return (
            <section className="max-w-3xl mx-auto py-32 text-center relative z-20">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-4">404</p>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6">Producto no encontrado</h1>
                <p className="text-gray-500 font-medium mb-10">Puede que ya no esté disponible o que el enlace haya cambiado.</p>
                <a href={SHOP_URL} className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full shadow-xl uppercase tracking-widest text-xs">Ver todo el catálogo</a>
            </section>
        );
    }

    const cat = catalog.category(product.category_id);
    const grade = GRADES[product.grade] || GRADES.estandar;
    const stock = stockInfo(product.stock);
    const foreign = money.currency.code !== 'EUR';
    const maxQty = Math.max(1, Math.min(product.stock, 99));
    const related = catalog.products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 3);
    const img = product.image;

    const addToCart = (openCart) => {
        cartState.add(product.id, qty);
        if (openCart) cartState.setOpen(true);
    };

    return (
        <>
            <div className="max-w-6xl mx-auto pt-12 pb-32 relative z-20">
                {/* Breadcrumb */}
                <nav className="mb-8 text-xs font-bold uppercase tracking-widest text-gray-400" aria-label="Ruta">
                    <a href={SHOP_URL} className="hover:text-blue-600">Componentes</a>
                    <span className="mx-2" aria-hidden="true">/</span>
                    <a href={`${SHOP_URL}?cat=${cat.id}`} className="hover:text-blue-600">{cat.label}</a>
                    <span className="mx-2" aria-hidden="true">/</span>
                    <span className="text-gray-600">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-10 items-start">
                    {/* Image */}
                    <div>
                        <div className="group relative rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 overflow-hidden">
                            <ProductImage product={product} catalog={catalog} size="hero" eager />
                            <span className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${grade.className}`}>{grade.label}</span>
                        </div>
                        {img && (
                            <p className="mt-3 text-[11px] text-gray-400 font-medium">
                                Imagen ilustrativa: <a href={img.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{img.author}</a>,{' '}
                                {img.license_url ? <a href={img.license_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{img.license}</a> : img.license}, vía Wikimedia Commons.
                            </p>
                        )}
                    </div>

                    {/* Buy box */}
                    <div className="lg:sticky lg:top-[140px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-3"><span aria-hidden="true">{cat.icon}</span> {cat.label}</p>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-3">{product.name}</h1>
                        <p className="text-lg text-gray-500 font-medium mb-6">Compatible con {product.compat}</p>

                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${stock.className}`}>{stock.label}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SKU {product.sku}</span>
                        </div>

                        <div className="p-6 md:p-8 rounded-[2rem] glass shadow-xl mb-6">
                            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                                <div>
                                    <p translate="no" className="text-4xl font-black text-gray-900 tracking-tight">{foreign && '≈ '}{money.format(product.price_eur)}</p>
                                    <p className="text-xs text-gray-400 font-semibold mt-1">
                                        {foreign ? `Se cobra ${eur(product.price_eur)} · IVA incluido` : 'IVA incluido · envío no incluido'}
                                    </p>
                                </div>
                                <CurrencySelect value={money.currency.code} onChange={money.setCurrency} />
                            </div>

                            {stock.canBuy ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex items-center justify-between sm:justify-start gap-2 px-2 py-2 rounded-full border border-gray-200 bg-white">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full hover:bg-gray-100 font-black" aria-label="Menos">−</button>
                                        <span translate="no" className="w-8 text-center font-black" aria-live="polite">{qty}</span>
                                        <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="w-9 h-9 rounded-full hover:bg-gray-100 font-black" aria-label="Más">+</button>
                                    </div>
                                    <button onClick={() => addToCart(false)} className="flex-1 py-4 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-black uppercase tracking-widest transition-colors">
                                        Añadir al carrito
                                    </button>
                                    <button onClick={() => addToCart(true)} className="flex-1 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                                        Comprar ahora
                                    </button>
                                </div>
                            ) : (
                                <a
                                    href={`https://wa.me/${SELLER.whatsapp}?text=${encodeURIComponent(`Hola Lameyer, ¿cuándo volveréis a tener ${product.name} (${product.compat}) [${product.sku}]?`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest transition-colors"
                                >
                                    Avísame por WhatsApp
                                </a>
                            )}
                        </div>

                        <ul className="grid sm:grid-cols-3 gap-3 text-xs">
                            {[
                                ['↩️', `Devolución ${RETURN_DAYS} días`, `${TERMS_URL}#devoluciones`],
                                ['🛡️', 'Garantía legal 3 años', `${TERMS_URL}#garantia`],
                                ['📦', 'Envío desde Madrid', `${TERMS_URL}#envios`],
                            ].map(([icon, label, href]) => (
                                <li key={label}>
                                    <a href={href} className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors">
                                        <span aria-hidden="true">{icon}</span>{label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Details */}
                <div className="mt-16 grid lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/40">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Descripción</h2>
                        <p className="text-gray-600 font-medium leading-relaxed mb-10">{product.description}</p>

                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Especificaciones</h2>
                        <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                            {[['SKU', product.sku], ['Calidad', grade.label], ...Object.entries(product.specs || {})].map(([k, v]) => (
                                <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3 text-sm even:bg-gray-50/60">
                                    <dt className="font-bold text-gray-500">{k}</dt>
                                    <dd className="font-semibold text-gray-900">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
                        <h2 className="text-2xl font-black tracking-tight mb-4">Compatibilidad</h2>
                        <ul className="space-y-2 mb-6">
                            {(product.compatible_models || [product.compat]).map(m => (
                                <li key={m} className="flex gap-3 text-sm font-semibold text-slate-200">
                                    <span className="mt-1.5 w-1.5 h-1.5 flex-none rounded-full bg-blue-400"></span>{m}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                            Comprueba el modelo exacto de tu dispositivo antes de comprar. Las marcas se citan solo para indicar compatibilidad; salvo indicación expresa, el repuesto no es original del fabricante.
                        </p>
                        <a
                            href={`https://wa.me/${SELLER.whatsapp}?text=${encodeURIComponent(`Hola Lameyer, ¿es compatible ${product.name} [${product.sku}] con mi dispositivo? Modelo: `)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Consultar compatibilidad
                        </a>
                    </section>
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <section className="mt-20">
                        <div className="flex items-end justify-between gap-4 mb-8">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">Más en {cat.label}</h2>
                            <a href={`${SHOP_URL}?cat=${cat.id}`} className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline">Ver todo</a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {related.map(p => <ProductCard key={p.id} product={p} catalog={catalog} money={money} onAdd={cartState.add} inCart={cartState.cart[p.id]} />)}
                        </div>
                    </section>
                )}

                <p className="mt-16 text-[11px] text-gray-400 font-medium text-center">
                    Precios en EUR con IVA; otras divisas, orientativas. Consulta los <a href={TERMS_URL} className="font-bold text-blue-600 hover:underline">Términos y Condiciones</a>.
                </p>
            </div>

            <CartButton cartState={cartState} />
            <CartDrawer cartState={cartState} catalog={catalog} money={money} />
        </>
    );
};

const renderProduct = () => renderPage(ProductPage);
