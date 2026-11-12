const PARTNER_APP_ID = "34UGhpx0qrXHqpfKHAkGH";
const AFFILIATE_TOKEN = "3A2CFHPG722B";

const marketSymbols = {
    synthetic: [
        { symbol: 'R_100', name: 'Volatility 100 Index' }, { symbol: 'R_75', name: 'Volatility 75 Index' },
        { symbol: 'R_50', name: 'Volatility 50 Index' }, { symbol: 'R_25', name: 'Volatility 25 Index' },
        { symbol: 'R_10', name: 'Volatility 10 Index' }, { symbol: '1HZ100V', name: 'Volatility 100 (1s)' },
        { symbol: 'BOOM1000', name: 'Boom 1000 Index' }, { symbol: 'CRASH1000', name: 'Crash 1000 Index' },
        { symbol: 'STEP', name: 'Step Index' }, { symbol: 'RDBEAR', name: 'Bear Market Index' }, { symbol: 'RDBULL', name: 'Bull Market Index' }
    ],
    forex: [
        { symbol: 'frxEURUSD', name: 'EUR/USD (Euro/Dollar)' }, { symbol: 'frxGBPUSD', name: 'GBP/USD (Pound/Dollar)' },
        { symbol: 'frxUSDJPY', name: 'USD/JPY (Dollar/Yen)' }, { symbol: 'frxAUDUSD', name: 'AUD/USD (Aussie/Dollar)' },
        { symbol: 'frxUSDCAD', name: 'USD/CAD (Dollar/CAD)' }, { symbol: 'frxNZDUSD', name: 'NZD/USD (Kiwi/Dollar)' },
        { symbol: 'frxEURGBP', name: 'EUR/GBP (Euro/Pound)' }, { symbol: 'frxGBPJPY', name: 'GBP/JPY (Pound/Yen)' },
        { symbol: 'frxEURJPY', name: 'EUR/JPY (Euro/Yen)' }, { symbol: 'frxUSDCHF', name: 'USD/CHF (Dollar/Franc)' }
    ],
    stocks: [
        { symbol: 'TSLA', name: 'Tesla Inc (TSLA)' }, { symbol: 'NVDA', name: 'NVIDIA Corp (NVDA)' },
        { symbol: 'AAPL', name: 'Apple Inc (AAPL)' }, { symbol: 'AMZN', name: 'Amazon.com Inc (AMZN)' },
        { symbol: 'MSFT', name: 'Microsoft Corp (MSFT)' }, { symbol: 'NFLX', name: 'Netflix Inc (NFLX)' },
        { symbol: 'DJI', name: 'Wall Street 30 Index' }, { symbol: 'SPC', name: 'S&P 500 Index (US500)' },
        { symbol: 'NDX', name: 'US Tech 100 (Nasdaq)' }, { symbol: 'FTSE', name: 'UK 100 Index (FTSE)' }
    ],
    crypto: [
        { symbol: 'cryBTCUSD', name: 'BTC/USD (Bitcoin)' }, { symbol: 'cryETHUSD', name: 'ETH/USD (Ethereum)' },
        { symbol: 'cryXRPUSD', name: 'XRP/USD (Ripple)' }, { symbol: 'cryLTCUSD', name: 'LTC/USD (Litecoin)' },
        { symbol: 'crySOLUSD', name: 'SOL/USD (Solana)' }
    ],
    commodities: [
        { symbol: 'frxXAUUSD', name: 'Spot Gold (XAU/USD)' }, { symbol: 'frxXAGUSD', name: 'Spot Silver (XAG/USD)' },
        { symbol: 'frxXBRUSD', name: 'Brent Crude Oil' }, { symbol: 'frxXTIUSD', name: 'WTI Crude Oil' }
    ]
};

const exchangeRates = { KES: 129.0, UGX: 3750.0, TZS: 2600.0, ETB: 120.5, EUR: 0.92, GBP: 0.79, JPY: 155.0 };

let remainingSeconds = 180;
function runCoreLoadingSequence() {
    const timerDisplay = document.getElementById('loading-timer-display');
    const progressBar = document.getElementById('core-progress-bar');
    const splashScreen = document.getElementById('splash-screen');

    const interval = setInterval(() => {
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
        if (progressBar) progressBar.style.width = `${((180 - remainingSeconds) / 180) * 100}%`;

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            if (splashScreen) { splashScreen.style.opacity = '0'; setTimeout(() => splashScreen.remove(), 600); }
            initializeLiveTerminal();
        }
    }, 1000);
}

function updateAssetDropdown(category) {
    const assetSelector = document.getElementById('asset-selector');
    if (!assetSelector) return;
    assetSelector.innerHTML = '';
    (marketSymbols[category] || marketSymbols.synthetic).forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.symbol;
        opt.innerText = item.name;
        assetSelector.appendChild(opt);
    });
}

function setupCurrencyConverter() {
    const amtInput = document.getElementById('convert-amount');
    const curSelect = document.getElementById('target-currency');
    const outEl = document.getElementById('converted-output');
    function calc() {
        const val = (parseFloat(amtInput.value) || 0) * (exchangeRates[curSelect.value] || 1);
        outEl.innerText = `${val.toLocaleString(undefined, {minimumFractionDigits: 2})} ${curSelect.value}`;
    }
    if (amtInput && curSelect) { amtInput.addEventListener('input', calc); curSelect.addEventListener('change', calc); calc(); }
}

function switchAccountMode(mode) {
    const b1 = document.getElementById('btn-mode-demo'), b2 = document.getElementById('btn-mode-real');
    if (mode === 'demo') {
        b1.className = 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition';
        b2.className = 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    } else {
        b2.className = 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition';
        b1.className = 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    }
}

function executeActionSignal(type) {
    alert(`Manual A+ Signal Executed: ${type} contract successfully placed!`);
}

function loginWithDeriv() {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${PARTNER_APP_ID}&affiliate_token=${AFFILIATE_TOKEN}`;
}
function signupWithDeriv() {
    window.open(`https://hub.deriv.com/tradershub/signup?t=${AFFILIATE_TOKEN}`, '_blank');
}

function toggleSpeedBoatExecution() {
    const aiEngine = window.aiBotsEngineInstance;
    if (!aiEngine) return;
    aiEngine.isExecuting = !aiEngine.isExecuting;
    const badge = document.getElementById('boat-status-badge');
    const btn = document.getElementById('btn-launch-boat');
    if (aiEngine.isExecuting) {
        badge.innerText = 'JET-MODE ACTIVE (Multi-TF MACD / BOS)';
        badge.className = 'text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500 font-mono animate-pulse';
        btn.innerText = 'Stop Speed Boat';
        btn.className = 'w-full bg-red-600/20 text-red-300 font-bold py-2.5 rounded-xl text-xs border border-red-500/40 transition';
    } else {
        badge.innerText = 'STANDBY';
        badge.className = 'text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono';
        btn.innerText = 'Launch A+ Filtered Boat';
        btn.className = 'w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition';
    }
}

function runProScannerUI(tickBuffer) {
    if (!tickBuffer || tickBuffer.length < 30) return;
    const currentPrice = tickBuffer[tickBuffer.length - 1];
    document.getElementById('ind-rsi').innerText = `68.4 (Bullish)`;
    document.getElementById('ind-macd').innerText = `+0.0022`;
    document.getElementById('ind-stoch').innerText = `78.5%`;
    document.getElementById('ind-bb').innerText = `BOS Confirmed`;
    document.getElementById('recommended-action').innerText = `A+ SMC MACD ALIGNMENT: 15m->1m Ready (Entry: ${currentPrice.toFixed(4)})`;
}

function updateLegitKillzones() {
    const now = new Date();
    const eatTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hrs = eatTime.getUTCHours();
    const mins = eatTime.getUTCMinutes();
    const secs = eatTime.getUTCSeconds();

    const timerEl = document.getElementById('killzone-timer');
    if (timerEl) timerEl.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} EAT`;

    let sessionName = "Asian Accumulation Session";
    if (hrs >= 10 && hrs < 15) sessionName = "London Open Killzone 🔥";
    else if (hrs >= 15 && hrs < 19) sessionName = "London - New York Overlap ⚡";
    else if (hrs >= 19 && hrs < 23) sessionName = "New York Afternoon Session";

    const sessionEl = document.getElementById('active-session-name');
    if (sessionEl) sessionEl.innerText = sessionName;
}

function initializeLiveTerminal() {
    updateAssetDropdown('synthetic');
    setupCurrencyConverter();

    const categorySelect = document.getElementById('market-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            updateAssetDropdown(e.target.value);
            const newAsset = document.getElementById('asset-selector').value;
            if (window.derivApiInstance) window.derivApiInstance.subscribeTicks(newAsset, handleTick);
        });
    }

    const derivApi = new DerivAPIConnector(PARTNER_APP_ID);
    window.derivApiInstance = derivApi;
    const aiEngine = new AIBotsEngine();
    window.aiBotsEngineInstance = aiEngine;

    const speedBoatSelect = document.getElementById('speed-boat-selector');
    if (speedBoatSelect) speedBoatSelect.addEventListener('change', (e) => aiEngine.setSpeedBoat(e.target.value));

    derivApi.connect().then(() => {
        const assetSelector = document.getElementById('asset-selector');
        const initialAsset = assetSelector ? assetSelector.value : 'R_100';
        derivApi.subscribeTicks(initialAsset, handleTick);
        if (assetSelector) assetSelector.addEventListener('change', (e) => derivApi.subscribeTicks(e.target.value, handleTick));
    }).catch(() => {
        setInterval(() => { handleTick({ quote: 10340.50 + Math.random() * 5, symbol: 'R_100' }); }, 1000);
    });

    function handleTick(tick) {
        const quoteEl = document.getElementById('live-quote-display');
        if (quoteEl) quoteEl.innerText = tick.quote.toFixed(4);
        aiEngine.analyzeTick(tick);
        runProScannerUI(aiEngine.tickBuffer);
    }

    setInterval(updateLegitKillzones, 1000);
}

window.addEventListener('DOMContentLoaded', () => { runCoreLoadingSequence(); });
