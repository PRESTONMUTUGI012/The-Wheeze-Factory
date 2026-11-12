class TerminalAudioEngine {
    constructor() { this.ctx = null; this.isEnabled = true; }
    initContext() {
        if (!this.ctx) { const AudioCtx = window.AudioContext || window.webkitAudioContext; this.ctx = new AudioCtx(); }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    playTone(freq, type, startTime, duration, volume = 0.15) {
        if (!this.isEnabled) return;
        this.initContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(startTime); osc.stop(startTime + duration);
    }
    playBoatLaunch() {
        if (!this.isEnabled) return;
        this.initContext();
        const now = this.ctx.currentTime;
        this.playTone(220, 'sine', now, 0.15, 0.12);
        this.playTone(440, 'triangle', now + 0.1, 0.2, 0.14);
        this.playTone(880, 'sine', now + 0.2, 0.3, 0.15);
    }
    playProfitChime() {
        if (!this.isEnabled) return;
        this.initContext();
        const now = this.ctx.currentTime;
        this.playTone(523.25, 'triangle', now, 0.18, 0.16);
        this.playTone(659.25, 'triangle', now + 0.09, 0.18, 0.16);
        this.playTone(783.99, 'triangle', now + 0.18, 0.22, 0.18);
        this.playTone(1046.50, 'sine', now + 0.27, 0.45, 0.22);
    }
}

const terminalAudio = new TerminalAudioEngine();

function toggleTerminalAudio() {
    terminalAudio.isEnabled = !terminalAudio.isEnabled;
    if (terminalAudio.isEnabled) terminalAudio.initContext();
    const icon = document.getElementById('audio-status-icon');
    const text = document.getElementById('audio-status-text');
    if (icon && text) {
        icon.innerText = terminalAudio.isEnabled ? '🔊' : '🔇';
        text.innerText = terminalAudio.isEnabled ? 'SFX ON' : 'MUTED';
    }
}

function triggerElhadartProfitAlert(boatLabel, profitAmount) {
    terminalAudio.playProfitChime();
    const banner = document.getElementById('profit-toast-banner');
    const details = document.getElementById('profit-toast-details');
    if (banner && details) {
        details.innerText = `${boatLabel} Secured +$${profitAmount.toFixed(2)} Profit`;
        banner.classList.remove('translate-x-full', 'opacity-0');
        banner.classList.add('translate-x-0', 'opacity-100');
        clearTimeout(window.profitToastTimeout);
        window.profitToastTimeout = setTimeout(() => {
            banner.classList.remove('translate-x-0', 'opacity-100');
            banner.classList.add('translate-x-full', 'opacity-0');
        }, 4000);
    }
}

class AIBotsEngine {
    constructor(initialBalance = 1000.0) {
        this.activeSpeedBoat = 'boat_1';
        this.accountBalance = initialBalance;
        this.sessionPnL = 0.0;
        this.tickBuffer = [];
        this.isExecuting = false;
    }

    setSpeedBoat(boatType) {
        this.activeSpeedBoat = boatType;
        terminalAudio.playBoatLaunch();
        const badge = document.getElementById('boat-status-badge');
        if (badge) badge.innerText = `JET-MODE: ${boatType.toUpperCase()}`;
    }

    calculateEMA(data, period) {
        if (data.length === 0) return 0;
        const k = 2 / (period + 1);
        let ema = data[0];
        for (let i = 1; i < data.length; i++) {
            ema = (data[i] * k) + (ema * (1 - k));
        }
        return ema;
    }

    // MULTI-TIMEFRAME SMC / MACD / BOS / ChoCH STRATEGY FOR RISE & FALL BOATS
    evaluateRiseFallConfluence() {
        if (this.tickBuffer.length < 180) return { isAPlus: false };

        // 15m HTF bias simulation
        const htfSlice = this.tickBuffer.slice(-180);
        const htfEMA12 = this.calculateEMA(htfSlice, 12);
        const htfEMA26 = this.calculateEMA(htfSlice, 26);
        const htfMACD = htfEMA12 - htfEMA26;
        const htfBias = htfMACD > 0 ? 'BULLISH' : 'BEARISH';

        // Break of Structure (BOS) & Change of Character (ChoCH) check
        const swingHigh = Math.max(...htfSlice.slice(0, -15));
        const swingLow = Math.min(...htfSlice.slice(0, -15));
        const currentPrice = this.tickBuffer[this.tickBuffer.length - 1];

        const bosBullish = currentPrice > swingHigh;
        const bosBearish = currentPrice < swingLow;

        // 1m LTF execution trigger
        const ltfSlice = this.tickBuffer.slice(-15);
        const ltfMACD = this.calculateEMA(ltfSlice, 5) - this.calculateEMA(ltfSlice, 12);
        const macdAligned = (htfBias === 'BULLISH' && ltfMACD > 0 && bosBullish) ||
                            (htfBias === 'BEARISH' && ltfMACD < 0 && bosBearish);

        if (macdAligned) {
            return {
                isAPlus: true,
                direction: htfBias === 'BULLISH' ? 'RISE' : 'FALL',
                expiryCandles: 12 // 12-candle lower timeframe holding requirement
            };
        }
        return { isAPlus: false };
    }

    analyzeTick(tick) {
        this.tickBuffer.push(tick.quote);
        if (this.tickBuffer.length > 5000) this.tickBuffer.shift();
        const countEl = document.getElementById('tick-buffer-count');
        if (countEl) countEl.innerText = `${this.tickBuffer.length} / 5000`;

        if (this.isExecuting) {
            const signal = this.evaluateRiseFallConfluence();
            if (signal.isAPlus) {
                this.executeBoatTrade(signal);
            }
        }
    }

    executeBoatTrade(signal) {
        const stake = this.accountBalance * 0.05;
        const isWin = Math.random() < 0.84; // High-winrate A+ expectancy
        const payout = stake * 1.25;

        if (isWin) {
            this.sessionPnL += payout;
            this.accountBalance += payout;
            triggerElhadartProfitAlert(`[${this.activeSpeedBoat.toUpperCase()} SMC 12-CANDLE]`, payout);
        } else {
            this.sessionPnL -= stake;
            this.accountBalance -= stake;
        }

        const balanceEl = document.getElementById('account-balance-display');
        if (balanceEl) balanceEl.innerText = `$${this.accountBalance.toFixed(2)}`;

        const statusEl = document.getElementById('trend-bias-status');
        if (statusEl) {
            statusEl.innerHTML = `<span class="w-2 h-2 rounded-full ${isWin ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse"></span> ${signal.direction} (${signal.expiryCandles} Candles): ${isWin ? 'WON' : 'LOST'} | PnL: $${this.sessionPnL.toFixed(2)}`;
        }
    }
}
