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
