import React, { useState, useEffect, useRef } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import TickerTape from '../components/TickerTape';
import Charts from '../core/charts';
import Simulator from '../core/simulator';
import { 
  TrendingUp, Activity, Compass, Check, ArrowRight, Shield, ChevronRight
} from 'lucide-react';

const Home = () => {
  const { 
    activeTicker, 
    marketData, 
    auditorState, 
    changeTicker, 
    executeTrade, 
    clearLedger,
    isConsoleLaunched,
    setIsConsoleLaunched
  } = useMarketData();

  const [activeTab, setActiveTab] = useState(1);
  const [landingActiveTab, setLandingActiveTab] = useState(1);

  // Canvas Refs
  const cockpitCanvasRef = useRef(null);
  const gexCanvasRef = useRef(null);
  const vannaCanvasRef = useRef(null);

  // Re-draw active tab charts on tick or tab change
  useEffect(() => {
    if (!isConsoleLaunched || !marketData) return;

    if (activeTab === 1 && cockpitCanvasRef.current) {
      Charts.updateCockpitChart(cockpitCanvasRef.current, marketData.priceHistory, marketData.plan);
    } else if (activeTab === 3 && vannaCanvasRef.current) {
      Charts.renderVannaHeatmap(vannaCanvasRef.current, marketData.spot, marketData.chain);
    } else if (activeTab === 4 && gexCanvasRef.current) {
      Charts.updateGexChart(gexCanvasRef.current, marketData.chain, marketData.spot);
    }

    // Clean up instances on toggle/tab change
    return () => {
      if (activeTab !== 1) Charts.clearInstances();
    };
  }, [isConsoleLaunched, activeTab, marketData]);

  // Handle active trade executing
  const handleExecuteTrade = () => {
    const res = executeTrade();
    if (res.success) {
      alert(`Hedge executed successfully! Transaction ID: ${res.trade.id}`);
    } else {
      alert(res.message);
    }
  };

  const handleLaunchConsole = () => {
    setIsConsoleLaunched(true);
    // Snappy scroll to console
    setTimeout(() => {
      const el = document.getElementById('console-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const getSqueezeClass = () => {
    if (!marketData || !marketData.indicators) return '';
    return marketData.indicators.squeeze 
      ? 'font-mono text-sm font-semibold text-gammaNeg' 
      : 'font-mono text-sm font-semibold text-gammaPos';
  };

  const getRsiClass = () => {
    if (!marketData || !marketData.indicators) return '';
    const rsi = marketData.indicators.rsi;
    if (rsi > 70) return 'font-mono text-sm font-semibold text-gammaNeg';
    if (rsi < 30) return 'font-mono text-sm font-semibold text-gammaPos';
    return 'font-mono text-sm font-semibold text-textPrimary';
  };

  const getRegimeDesc = () => {
    if (!marketData || !marketData.plan) return '';
    const score = marketData.plan.score;
    if (score >= 65) return 'ACCELERATING CALL FLOW';
    if (score > 50) return 'SUPPORTIVE DELTA REGIME';
    if (score > 35) return 'VOLATILITY DRIFT REGIME';
    return 'MOMENTUM SHORT SQUEEZE/HEDGE';
  };

  const getRegimeColorClass = () => {
    if (!marketData || !marketData.plan) return 'text-zinc-400';
    const score = marketData.plan.score;
    if (score >= 65) return 'text-white';
    if (score > 50) return 'text-zinc-300';
    if (score > 35) return 'text-zinc-400';
    return 'text-zinc-500';
  };

  return (
    <div className="flex-grow">
      
      {/* 1. MARKETING / LANDING VIEW */}
      {!isConsoleLaunched ? (
        <div className="animate-slide-in">
          
          {/* Hero Section */}
          <section className="max-w-6xl mx-auto pt-24 pb-16 text-center px-6 relative">
            {/* Top Diagnostic Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-borderSubtle rounded-full text-[10px] font-semibold text-secondary uppercase tracking-widest bg-panel/30 mb-10 select-none">
              <span className="w-1.5 h-1.5 bg-silver rounded-full animate-ping"></span>
              Dealer Hedging Diagnostic v4.2 Active
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-8 text-textPrimary max-w-4xl mx-auto select-none">
              The Structural Physics of Options Liquidity
            </h1>

            {/* Paragraph Subtitle */}
            <p className="text-base md:text-lg text-textSecondary max-w-3xl mx-auto mb-16 font-normal leading-relaxed select-none">
              The GEX platform you love, on the high-density quantitative dashboard built for professionals.<br />
              Track market-maker hedging boundaries and volatility gravity walls.
            </p>

            {/* Massive Interactive Mockup Dashboard */}
            <div className="relative group max-w-5xl mx-auto mb-16 px-4 md:px-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur opacity-25"></div>
              <div className="relative bg-panel border border-borderSubtle rounded-xl p-6 overflow-hidden shadow-2xl shadow-black/90">
                
                {/* Simulated cockpit controls */}
                <div className="flex items-center justify-between border-b border-borderSubtle pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-secondary rounded-full custom-pulse"></span>
                    <span className="font-mono text-xxs tracking-wider text-textSecondary uppercase font-bold">SLAYER // TERMINAL_ACTIVE</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] px-2.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">0DTE REPLAY MODE</span>
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] px-2.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">CALIBRATION: 99.1%</span>
                  </div>
                </div>
                
                {/* Mock grid layouts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[350px] relative">
                  
                  {/* Col 1: GEX Strike maps */}
                  <div className="bg-canvas border border-borderSubtle rounded p-4 flex flex-col justify-between">
                    <div className="text-left"><span className="text-[10px] text-textMuted uppercase font-bold font-mono">GEX Profile</span></div>
                    
                    <div className="flex flex-col gap-3 my-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono w-12 text-left text-textSecondary">$505.00</span>
                        <div className="h-3 bg-gammaPos/30 border border-gammaPos/50 w-24 rounded-sm"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono w-12 text-left text-textSecondary">$502.50</span>
                        <div className="h-3 bg-gammaPos/50 border border-gammaPos/70 w-36 rounded-sm"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono w-12 text-left text-textSecondary">$500.00</span>
                        <div className="h-3 bg-gammaNeg/40 border border-gammaNeg/60 w-28 rounded-sm"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono w-12 text-left text-textSecondary">$497.50</span>
                        <div className="h-3 bg-gammaNeg/60 border border-gammaNeg/80 w-40 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="text-left font-mono text-[10px] text-white border border-borderSubtle bg-zinc-950 p-2.5 rounded">
                      Gamma Flip Strike: $501.20
                    </div>
                  </div>
                  
                  {/* Col 2 & 3: Cockpit Chart Line */}
                  <div className="bg-canvas border border-borderSubtle rounded p-4 flex flex-col justify-between md:col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-textMuted uppercase font-bold font-mono">Sky's Vision Cockpit Chart</span>
                      <span className="text-[9px] font-mono text-gammaPos font-bold">SPY +1.4%</span>
                    </div>

                    <div className="flex-grow flex items-center justify-center relative min-h-[160px] md:min-h-0">
                      <svg className="w-full h-36 stroke-white fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d="M 0,25 Q 15,10 30,22 T 60,8 T 90,15 T 100,5" strokeWidth="1.5"></path>
                        <path d="M 0,25 Q 15,10 30,22 T 60,8 T 90,15 T 100,5 L 100,30 L 0,30 Z" className="fill-white/5 stroke-none"></path>
                        
                        {/* Trigger lines */}
                        <line x1="0" y1="8" x2="100" y2="8" stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="2,2"></line>
                        <line x1="0" y1="22" x2="100" y2="22" stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="2,2"></line>
                      </svg>
                      
                      {/* Floating callouts */}
                      <div className="absolute top-4 left-6 bg-black border border-zinc-800 text-[10px] px-2.5 py-1 rounded-full text-white shadow-lg flex items-center gap-1 font-mono select-none pointer-events-none">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Orbs & Projections
                      </div>
                      <div className="absolute bottom-10 right-10 bg-black border border-zinc-800 text-[10px] px-2.5 py-1 rounded-full text-white shadow-lg flex items-center gap-1 font-mono select-none pointer-events-none">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Dealer Walls
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-textMuted border-t border-borderSubtle pt-3">
                      <span>EMA9 Crossover: ACTIVE</span>
                      <span>TTM Squeeze: FIRE</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Hero CTA Button */}
            <div className="mb-24">
              <button 
                onClick={handleLaunchConsole}
                className="bg-white hover:bg-silver active:bg-zinc-300 text-black border border-white/10 text-sm font-semibold px-8 py-3 rounded-full transition-colors shadow-lg flex items-center justify-center gap-1.5 mx-auto hover:scale-[1.02] duration-300"
              >
                Get Atlas Demo <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Scrolling Ticker tape Marquee */}
          <TickerTape />

          {/* 2. QUANTITATIVE DIAGNOSTIC CONSOLE SECTION */}
          <section id="bento" className="max-w-6xl mx-auto my-32 px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xxs font-bold text-secondary uppercase tracking-widest block mb-3 font-mono">SYSTEMIC ADVANTAGE</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary">The Structural Mechanics of Options Imbalances</h2>
              <p className="text-textSecondary text-sm leading-relaxed mt-2">
                Instead of standard retail indicators, Slayer Terminal exposes the physics driving dealer hedging adjustments.
              </p>
            </div>

            {/* Split Console Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch border border-borderSubtle rounded-xl overflow-hidden bg-panel shadow-2xl shadow-black/80 relative z-10">
              
              {/* Left Column: Navigation controls */}
              <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-borderSubtle flex flex-col">
                <div className="px-6 py-4 border-b border-borderSubtle bg-zinc-950/50">
                  <span className="font-mono text-xxs tracking-wider text-textSecondary uppercase font-bold">Select Diagnostic Engine</span>
                </div>
                
                <div className="flex flex-col flex-grow divide-y divide-borderSubtle">
                  <button 
                    onClick={() => setLandingActiveTab(1)} 
                    className={`text-left p-6 hover:bg-zinc-900/10 transition-all border-l-2 focus:outline-none ${
                      landingActiveTab === 1 ? 'bg-zinc-900/40 border-l-white' : 'border-l-transparent'
                    }`}
                  >
                    <div className="font-mono text-xxxs text-zinc-500 mb-1">VECT_01</div>
                    <h4 className="text-sm font-bold text-white mb-1">Delta-Neutral Vectors</h4>
                    <p className="text-xxs text-textSecondary leading-relaxed">Dealer hedging constraints forcing market price moves.</p>
                  </button>

                  <button 
                    onClick={() => setLandingActiveTab(2)} 
                    className={`text-left p-6 hover:bg-zinc-900/10 transition-all border-l-2 focus:outline-none ${
                      landingActiveTab === 2 ? 'bg-zinc-900/40 border-l-white' : 'border-l-transparent'
                    }`}
                  >
                    <div className="font-mono text-xxxs text-zinc-500 mb-1">WALL_02</div>
                    <h4 className="text-sm font-bold text-white mb-1">Volatility Gravity Walls</h4>
                    <p className="text-xxs text-textSecondary leading-relaxed">Open interest nodes acting as structural price pins.</p>
                  </button>

                  <button 
                    onClick={() => setLandingActiveTab(3)} 
                    className={`text-left p-6 hover:bg-zinc-900/10 transition-all border-l-2 focus:outline-none ${
                      landingActiveTab === 3 ? 'bg-zinc-900/40 border-l-white' : 'border-l-transparent'
                    }`}
                  >
                    <div className="font-mono text-xxxs text-zinc-500 mb-1">MAP_03</div>
                    <h4 className="text-sm font-bold text-white mb-1">Vanna & Charm Migration</h4>
                    <p className="text-xxs text-textSecondary leading-relaxed">Tracking exposure relocation across time and vol shifts.</p>
                  </button>

                  <button 
                    onClick={() => setLandingActiveTab(4)} 
                    className={`text-left p-6 hover:bg-zinc-900/10 transition-all border-l-2 focus:outline-none ${
                      landingActiveTab === 4 ? 'bg-zinc-900/40 border-l-white' : 'border-l-transparent'
                    }`}
                  >
                    <div className="font-mono text-xxxs text-zinc-500 mb-1">AUDT_04</div>
                    <h4 className="text-sm font-bold text-white mb-1">Immutable Auditor Ledger</h4>
                    <p className="text-xxs text-textSecondary leading-relaxed">Verifying target calibration win-rate metrics.</p>
                  </button>

                  <button 
                    onClick={() => setLandingActiveTab(5)} 
                    className={`text-left p-6 hover:bg-zinc-900/10 transition-all border-l-2 focus:outline-none ${
                      landingActiveTab === 5 ? 'bg-zinc-900/40 border-l-white' : 'border-l-transparent'
                    }`}
                  >
                    <div className="font-mono text-xxxs text-zinc-500 mb-1">SCAN_05</div>
                    <h4 className="text-sm font-bold text-white mb-1">Sweep & Block Flow Tape</h4>
                    <p className="text-xxs text-textSecondary leading-relaxed">Filtering institutional block order sweeps in real-time.</p>
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Diagnostic Screen */}
              <div className="lg:col-span-2 flex flex-col bg-canvas p-6 justify-between min-h-[300px]">
                
                {/* Screen Header */}
                <div className="flex justify-between items-center border-b border-borderSubtle pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white custom-pulse"></span>
                    <span className="font-mono text-xxs text-textSecondary uppercase tracking-wider">DIAGNOSTIC DISPLAY // ONLINE</span>
                  </div>
                  <span className="font-mono text-xxxs text-textMuted">SYS_ENGINE_OK</span>
                </div>

                {/* Screen Content Pane */}
                <div className="flex-grow flex flex-col justify-center min-h-[220px] font-mono text-xxs text-textSecondary bg-zinc-950 border border-borderSubtle rounded p-4 relative overflow-hidden shadow-inner">
                  {/* Dot grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:12px_12px] pointer-events-none"></div>
                  
                  {/* TAB 1 */}
                  {landingActiveTab === 1 && (
                    <div className="flex flex-col gap-3 relative z-10 animate-slide-in">
                      <div className="text-white border-b border-borderSubtle/50 pb-2 mb-1">// DELTA HEDGING COEFFICIENTS (ACTIVE REGIME)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <span>SPOT PRICE</span><span className="text-white text-right">$502.40</span>
                        <span>NET DEALER DELTA</span><span className="text-white text-right">+15,480,200 SHS</span>
                        <span>INVENTORY IMBALANCE</span><span className="text-gammaNeg text-right font-bold">-4,289,100 SHS (Short Delta)</span>
                        <span>HEDGE EX. TARGET</span><span className="text-gammaPos text-right font-bold">+285,900 SHS per +0.10 spot move</span>
                      </div>
                      <div className="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-300">
                        [SYSTEM DIAG] Hedgers are forced to BUY spot price to cover short delta exposure on upward swings. Bullish drift pressure active.
                      </div>
                    </div>
                  )}

                  {/* TAB 2 */}
                  {landingActiveTab === 2 && (
                    <div className="flex flex-col gap-3 relative z-10 animate-slide-in">
                      <div className="text-white border-b border-borderSubtle/50 pb-2 mb-1">// VOLATILITY GRAVITY WALLS (ACTIVE CONTRACTS)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <span>PRIMARY RESISTANCE</span><span className="text-white text-right">STRIKE $505.00 (+1.2% | Call GEX +$8.4M)</span>
                        <span>PRIMARY SUPPORT</span><span className="text-white text-right">STRIKE $500.00 (-0.8% | Put GEX -$12.5M)</span>
                        <span>DEALER FLIP ZONE</span><span className="text-white text-right">STRIKE $501.20 (NET GEX ZERO)</span>
                        <span>MAGNET PIN PROB.</span><span className="text-gammaPos text-right font-bold">84% (High concentration)</span>
                      </div>
                      <div className="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-300">
                        [SYSTEM DIAG] Volatility walls act as magnetic pins pulling spot price near short-expiry closes, dampening spot movement.
                      </div>
                    </div>
                  )}

                  {/* TAB 3 */}
                  {landingActiveTab === 3 && (
                    <div className="flex flex-col gap-3 relative z-10 animate-slide-in">
                      <div className="text-white border-b border-borderSubtle/50 pb-2 mb-1">// VANNA & CHARM DECAY COEFFICIENTS</div>
                      <div className="grid grid-cols-2 gap-2">
                        <span>TIME TO EXPIRY (DTE)</span><span className="text-white text-right">0.003 (0DTE Mode Active)</span>
                        <span>CHARM DRIFT IMPACT</span><span className="text-white text-right">Delta decay accelerates 14% per hour</span>
                        <span>VANNA DRIFT IMPACT</span><span className="text-white text-right">Volatility drop expands call delta by 8%</span>
                        <span>ESTIMATED DRIFT DIRECTION</span><span className="text-gammaNeg text-right font-bold">Downwards drift near market close</span>
                      </div>
                      <div className="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-300">
                        [SYSTEM DIAG] Tracking time decay (Charm) and volatility shifts (Vanna) allows quants to forecast mechanical asset drift.
                      </div>
                    </div>
                  )}

                  {/* TAB 4 */}
                  {landingActiveTab === 4 && (
                    <div className="flex flex-col gap-3 relative z-10 animate-slide-in">
                      <div className="text-white border-b border-borderSubtle/50 pb-2 mb-1">// IMMUTABLE AUDITOR PERFORMANCE PROFILE</div>
                      <div className="grid grid-cols-2 gap-2">
                        <span>TOTAL TRIALS LOGGED</span><span className="text-white text-right">158 Closed Positions</span>
                        <span>AUDITED WIN RATE</span><span className="text-gammaPos text-right font-bold">76.5% Wins</span>
                        <span>PROFIT FACTOR</span><span className="text-white text-right">2.14 Gross Profit/Loss Ratio</span>
                        <span>CALIBRATION OFFSET</span><span className="text-white text-right">&plusmn;0.85% (Target vs Actual exit slippage)</span>
                      </div>
                      <div className="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-300">
                        [SYSTEM DIAG] Immutable ledger tracks each prediction and stop loss target, validating GEX physics model calibration against historical results.
                      </div>
                    </div>
                  )}

                  {/* TAB 5 */}
                  {landingActiveTab === 5 && (
                    <div className="flex flex-col gap-3 relative z-10 animate-slide-in">
                      <div className="text-white border-b border-borderSubtle/50 pb-2 mb-1">// REAL-TIME SWEEP & BLOCK SCANNER</div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between border-b border-borderSubtle/50 pb-1"><span>16:14:02 | SPY 505.00C</span><span className="text-gammaPos font-bold">SWEEP ASK</span><span className="text-white">120 Lots ($240K)</span></div>
                        <div className="flex justify-between border-b border-borderSubtle/50 pb-1"><span>16:14:15 | NVDA 125.00P</span><span className="text-gammaNeg font-bold">BLOCK BID</span><span className="text-white">85 Lots ($510K)</span></div>
                        <div className="flex justify-between border-b border-borderSubtle/50 pb-1"><span>16:14:32 | QQQ 440.00C</span><span className="text-gammaPos font-bold">SWEEP ASK</span><span className="text-white">240 Lots ($960K)</span></div>
                      </div>
                      <div className="mt-2 p-2 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-300">
                        [SYSTEM DIAG] Scanning institutional sweeps reveals block accumulation zones where dealers will accumulate the largest delta imbalances.
                      </div>
                    </div>
                  )}

                </div>

                {/* Screen Footer */}
                <div className="mt-6 flex justify-between items-center text-[10px] text-textMuted font-mono select-none">
                  <span>CTRL_PGM: sl_sys_v2.2.0</span>
                  <span className="text-zinc-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gammaPos rounded-full"></span> SYSTEM CORE SECURE</span>
                </div>
              </div>

            </div>
          </section>

          {/* 3. MULTIPLE MODULES SECTION (2 stacked on top of 2 with white boxes) */}
          <section id="features" className="max-w-6xl mx-auto my-32 px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xxs font-bold text-secondary uppercase tracking-widest block mb-3 font-mono">INSIDE THE PLATFORM</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary">Multiple Modules. One Edge.</h2>
              <p className="text-textSecondary text-sm leading-relaxed mt-2">
                Each engine is purpose-built for a specific dimension of dealer hedging metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1 */}
              <div className="group bg-panel border border-borderSubtle rounded-2xl p-8 flex flex-col justify-between hover:border-silver/45 hover:bg-panelHover hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden min-h-[520px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-zinc-900 border border-zinc-800 text-textPrimary text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">PINPOINT GEX</span>
                    <span className="text-xxs text-textMuted font-mono">0DTE IMMUNITY</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Trinity GEX Profile</h3>
                  <p className="text-textSecondary text-xs leading-relaxed mb-8">
                    Three-panel dealer exposure view across SPX, SPY, and QQQ. See exactly where dealers are forced to buy and sell in real-time, updated every single tick.
                  </p>
                </div>
                {/* Large white box placeholder */}
                <div className="w-full h-72 md:h-80 bg-white rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] overflow-hidden relative">
                </div>
              </div>

              {/* Card 2 */}
              <div className="group bg-panel border border-borderSubtle rounded-2xl p-8 flex flex-col justify-between hover:border-silver/45 hover:bg-panelHover hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden min-h-[520px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-zinc-900 border border-zinc-800 text-textPrimary text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">SWING INDICATOR</span>
                    <span className="text-xxs text-textMuted font-mono">DECAY VECTORS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Swing Vanna Matrix</h3>
                  <p className="text-textSecondary text-xs leading-relaxed mb-8">
                    Full dealer exposure heatmap across strikes and expiries. Identify where net dealer positioning is stacked to anticipate large multi-day moves.
                  </p>
                </div>
                {/* Large white box placeholder */}
                <div className="w-full h-72 md:h-80 bg-white rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] overflow-hidden relative">
                </div>
              </div>

              {/* Card 3 */}
              <div className="group bg-panel border border-borderSubtle rounded-2xl p-8 flex flex-col justify-between hover:border-silver/45 hover:bg-panelHover hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden min-h-[520px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-zinc-900 border border-zinc-800 text-textPrimary text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">FLOW MONITOR</span>
                    <span className="text-xxs text-textMuted font-mono">sweep streams</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Live Options Tape</h3>
                  <p className="text-textSecondary text-xs leading-relaxed mb-8">
                    Real-time institutional options flow tracking with advanced filtering. Pinpoint blocks, sweeps, and high-velocity unusual volume alerts before the momentum hits the screen.
                  </p>
                </div>
                {/* Large white box placeholder */}
                <div className="w-full h-72 md:h-80 bg-white rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] overflow-hidden relative">
                </div>
              </div>

              {/* Card 4 */}
              <div className="group bg-panel border border-borderSubtle rounded-2xl p-8 flex flex-col justify-between hover:border-silver/45 hover:bg-panelHover hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden min-h-[520px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-zinc-900 border border-zinc-800 text-textPrimary text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">AUDIT TRAIL</span>
                    <span className="text-xxs text-textMuted font-mono">ledger stores</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Self-Auditing Ledger</h3>
                  <p className="text-textSecondary text-xs leading-relaxed mb-8">
                    Drill into trade statistics. Win rates, calibration error percentages, and dynamic stop-loss adjustments—all recorded in an immutable ledger for review.
                  </p>
                </div>
                {/* Large white box placeholder */}
                <div className="w-full h-72 md:h-80 bg-white rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] overflow-hidden relative">
                </div>
              </div>
            </div>
          </section>

          {/* 4. PRICING PLANS */}
          <section id="pricing" className="max-w-6xl mx-auto mt-24 mb-32 px-6 border-t border-borderSubtle/50 pt-20 relative z-10">
            <h2 className="text-center text-3xl font-extrabold mb-16 tracking-tight text-white font-sans">Deploy Your Edge</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Plan 1 */}
              <div className="bg-panel border border-borderSubtle hover:border-silver/30 hover:-translate-y-1 rounded-xl p-8 flex flex-col relative transition-all duration-300 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">Discord Order Flow</h3>
                  <p className="text-textSecondary text-xs">For community traders looking for institutional alerts and GEX briefs.</p>
                </div>
                <div className="font-mono text-4xl font-bold text-white flex items-baseline mb-8">
                  $30<span className="font-sans text-sm text-textSecondary font-normal ml-1">/mo</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Real-time option sweep channels</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Daily pre-market SPX GEX report</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Alpha trader discussion lobby</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Live dev updates & Q&A</li>
                </ul>
                <button 
                  onClick={handleLaunchConsole}
                  className="group w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Join Community <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Plan 2: GEX Box */}
              <div className="bg-panel border border-white hover:bg-panelHover rounded-xl p-8 flex flex-col relative transition-all duration-300 shadow-lg shadow-white/5 hover:shadow-white/10 hover:-translate-y-2">
                <div className="absolute top-4 right-6 bg-white text-black text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Most Popular</div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">GEX Box (Pinpoint)</h3>
                  <p className="text-textSecondary text-xs">For serious retail traders seeking real-time strike GEX maps.</p>
                </div>
                <div className="font-mono text-4xl font-bold text-white flex items-baseline mb-8">
                  $125<span className="font-sans text-sm text-textSecondary font-normal ml-1">/mo</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Strike-by-strike GEX/DEX/VEX maps</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Gamma Flip Zone tracking</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Vanna/Charm migration heatmaps</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> 0DTE & short-expiry chains</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Access to all Discord channels</li>
                </ul>
                <button 
                  onClick={handleLaunchConsole}
                  className="group w-full py-2 bg-white hover:bg-zinc-200 text-black border border-white/10 text-xs font-semibold rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Plan 3: Prop Desk */}
              <div className="bg-panel border border-borderSubtle hover:border-silver/30 hover:-translate-y-1 rounded-xl p-8 flex flex-col relative transition-all duration-300 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">Prop Trading Desks</h3>
                  <p className="text-textSecondary text-xs">For institutions requiring low-latency API sockets and historical feeds.</p>
                </div>
                <div className="font-mono text-4xl font-bold text-white flex items-baseline mb-8">
                  $450<span className="font-sans text-sm text-textSecondary font-normal ml-1">/mo</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Low-latency JSON WebSockets</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Historical 0DTE GEX database access</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> Custom integration support engineer</li>
                  <li className="flex items-center gap-3 text-sm text-white"><Check className="text-gammaPos w-4 h-4 flex-shrink-0" /> SLA: 99.9% data delivery uptime</li>
                </ul>
                <button 
                  onClick={handleLaunchConsole}
                  className="group w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Go Pro <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

            </div>
          </section>

        </div>
      ) : null}

      {/* 2. DYNAMIC TERMINAL CONSOLE VIEW */}
      {isConsoleLaunched ? (
        <section id="console-section" className="max-w-6xl mx-auto my-12 px-6 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-in">
            <span className="text-xxs font-bold text-secondary uppercase tracking-widest block mb-3 font-mono">SYSTEMIC DIAGNOSTICS</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Dealer Hedging Console</h2>
            <p className="text-textSecondary text-sm leading-relaxed mt-2">
              Select ticker systems to analyze active exposure vectors and run automated flow hedges.
            </p>
          </div>

          {/* Split Console Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch border border-borderSubtle rounded-xl overflow-hidden bg-panel shadow-2xl shadow-black/80 relative z-10 animate-slide-in">
            
            {/* Left Column: Navigation controls */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-borderSubtle flex flex-col">
              <div className="px-6 py-4 border-b border-borderSubtle bg-zinc-950/50">
                <span className="font-mono text-xxs tracking-wider text-textSecondary uppercase font-bold">Select Diagnostic Engine</span>
              </div>
              
              <div className="flex flex-col flex-grow divide-y divide-borderSubtle">
                <button 
                  onClick={() => setActiveTab(1)} 
                  className={`text-left p-6 hover:bg-zinc-900/10 hover:text-white transition-all border-l-2 focus:outline-none ${
                    activeTab === 1 ? 'bg-zinc-900/40 border-silver' : 'border-transparent'
                  }`}
                >
                  <div className="font-mono text-xxxs text-zinc-500 mb-1">VECT_01</div>
                  <h4 className={`text-sm font-bold mb-1 ${activeTab === 1 ? 'text-white' : 'text-textPrimary hover:text-silver'}`}>Delta-Neutral Vectors</h4>
                  <p className="text-xxs text-textSecondary leading-relaxed">Dealer hedging constraints forcing market price moves.</p>
                </button>

                <button 
                  onClick={() => setActiveTab(2)} 
                  className={`text-left p-6 hover:bg-zinc-900/10 hover:text-white transition-all border-l-2 focus:outline-none ${
                    activeTab === 2 ? 'bg-zinc-900/40 border-silver' : 'border-transparent'
                  }`}
                >
                  <div className="font-mono text-xxxs text-zinc-500 mb-1">WALL_02</div>
                  <h4 className={`text-sm font-bold mb-1 ${activeTab === 2 ? 'text-white' : 'text-textPrimary hover:text-silver'}`}>Volatility Gravity Walls</h4>
                  <p className="text-xxs text-textSecondary leading-relaxed">Open interest nodes acting as structural price pins.</p>
                </button>

                <button 
                  onClick={() => setActiveTab(3)} 
                  className={`text-left p-6 hover:bg-zinc-900/10 hover:text-white transition-all border-l-2 focus:outline-none ${
                    activeTab === 3 ? 'bg-zinc-900/40 border-silver' : 'border-transparent'
                  }`}
                >
                  <div className="font-mono text-xxxs text-zinc-500 mb-1">MAP_03</div>
                  <h4 className={`text-sm font-bold mb-1 ${activeTab === 3 ? 'text-white' : 'text-textPrimary hover:text-silver'}`}>Vanna & Charm Migration</h4>
                  <p className="text-xxs text-textSecondary leading-relaxed">Tracking exposure relocation across time and vol shifts.</p>
                </button>

                <button 
                  onClick={() => setActiveTab(4)} 
                  className={`text-left p-6 hover:bg-zinc-900/10 hover:text-white transition-all border-l-2 focus:outline-none ${
                    activeTab === 4 ? 'bg-zinc-900/40 border-silver' : 'border-transparent'
                  }`}
                >
                  <div className="font-mono text-xxxs text-zinc-500 mb-1">MAP_04</div>
                  <h4 className={`text-sm font-bold mb-1 ${activeTab === 4 ? 'text-white' : 'text-textPrimary hover:text-silver'}`}>Pinpoint Strike GEX</h4>
                  <p className="text-xxs text-textSecondary leading-relaxed">Strike-by-strike dealer exposure profiles.</p>
                </button>

                <button 
                  onClick={() => setActiveTab(5)} 
                  className={`text-left p-6 hover:bg-zinc-900/10 hover:text-white transition-all border-l-2 focus:outline-none ${
                    activeTab === 5 ? 'bg-zinc-900/40 border-silver' : 'border-transparent'
                  }`}
                >
                  <div className="font-mono text-xxxs text-zinc-500 mb-1">TAPE_05</div>
                  <h4 className={`text-sm font-bold mb-1 ${activeTab === 5 ? 'text-white' : 'text-textPrimary hover:text-silver'}`}>Options Block Stream</h4>
                  <p className="text-xxs text-textSecondary leading-relaxed">Real-time sweep prints and blocks filtration.</p>
                </button>
              </div>
            </div>

            {/* Right Columns: Main Diagnostic Screen */}
            <div className="lg:col-span-2 flex flex-col justify-between min-h-[500px]">
              {/* Screen Top Bar */}
              <div className="px-6 py-3 border-b border-borderSubtle bg-zinc-950/40 flex justify-between items-center text-[10px] font-mono text-textSecondary">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 custom-pulse"></span>
                  STREAMING FEED: ACTIVE
                </span>
                <span>SYSTEM TIME: {marketData ? new Date().toLocaleTimeString() : '--'}</span>
              </div>

              {/* Ticker Selector Header */}
              <div className="p-6 border-b border-borderSubtle flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  {Object.keys(Simulator.TICKERS).map(tk => (
                    <button 
                      key={tk}
                      onClick={() => changeTicker(tk)}
                      className={tk === activeTicker 
                        ? 'bg-white hover:bg-silver text-black border border-white/10 px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-colors shadow-sm'
                        : 'bg-black hover:bg-zinc-900 border border-zinc-800 hover:border-silver/40 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-colors shadow-sm'
                      }
                    >
                      {tk}
                    </button>
                  ))}
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-semibold text-textMuted uppercase tracking-wider">Spot Price</div>
                  <div className="font-mono text-lg font-bold text-white" id="stat-spot">
                    {marketData ? `$${marketData.spot.toFixed(2)}` : '--'}
                  </div>
                </div>
              </div>

              {/* Screen Dynamic Inner Container */}
              <div className="p-6 flex-grow flex flex-col justify-center">
                
                {/* TAB 1: Delta-Neutral Vectors (Sky's Vision cockpit chart) */}
                {activeTab === 1 && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-textSecondary uppercase tracking-wider font-bold">Cockpit Price Feed vs Dealer Zones</span>
                      <span className="text-zinc-500">40 Ticks Window</span>
                    </div>
                    <div className="relative h-60 w-full border border-borderSubtle bg-zinc-950/30 rounded-lg p-2 overflow-hidden">
                      <canvas ref={cockpitCanvasRef} id="cockpit-chart" className="w-full h-full"></canvas>
                    </div>
                  </div>
                )}

                {/* TAB 2: Volatility Gravity Walls (Open interest table list) */}
                {activeTab === 2 && (
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-textSecondary uppercase tracking-wider font-bold">Active Open Interest Anchors</span>
                      <span className="text-zinc-500">Centered at Spot</span>
                    </div>
                    <div className="border border-borderSubtle rounded-lg overflow-hidden bg-zinc-950/20 text-xxs font-mono">
                      <div className="grid grid-cols-4 bg-zinc-950/60 p-2.5 text-textMuted uppercase border-b border-borderSubtle font-semibold">
                        <span>Strike Price</span>
                        <span className="text-right">Call Open Int</span>
                        <span className="text-right">Put Open Int</span>
                        <span className="text-right">Net Gamma Exp</span>
                      </div>
                      <div className="divide-y divide-borderSubtle max-h-56 overflow-y-auto">
                        {marketData && marketData.chain ? (
                          marketData.chain.slice(10, 18).map((node, i) => (
                            <div key={i} className="grid grid-cols-4 p-2.5 hover:bg-zinc-900/10">
                              <span className="text-white font-bold">${node.strike.toFixed(2)}</span>
                              <span className="text-right text-textSecondary">{node.callOI.toLocaleString()}</span>
                              <span className="text-right text-textSecondary">{node.putOI.toLocaleString()}</span>
                              <span className={`text-right font-bold ${node.netGex >= 0 ? 'text-gammaPos' : 'text-gammaNeg'}`}>
                                ${(node.netGex / 1000000).toFixed(2)}M
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-textMuted">Awaiting feed initialization...</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Vanna & Charm Migration (Heatmap canvas) */}
                {activeTab === 3 && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-textSecondary uppercase tracking-wider font-bold">Sensitivity Migration Matrix</span>
                      <span className="text-zinc-500">Spot Drift vs Expiry</span>
                    </div>
                    <div className="relative h-60 w-full border border-borderSubtle bg-zinc-950/30 rounded-lg p-1 overflow-hidden">
                      <canvas ref={vannaCanvasRef} id="vanna-heatmap" className="w-full h-full"></canvas>
                    </div>
                  </div>
                )}

                {/* TAB 4: Pinpoint Strike GEX (Strike exposure chart) */}
                {activeTab === 4 && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-textSecondary uppercase tracking-wider font-bold">GEX Profiler Chart</span>
                      <span className="text-zinc-500">Strike Net Exposure</span>
                    </div>
                    <div className="relative h-60 w-full border border-borderSubtle bg-zinc-950/30 rounded-lg p-2 overflow-hidden">
                      <canvas ref={gexCanvasRef} id="gex-chart" className="w-full h-full"></canvas>
                    </div>
                  </div>
                )}

                {/* TAB 5: Options Block Stream (Tape) */}
                {activeTab === 5 && (
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-textSecondary uppercase tracking-wider font-bold">Options Block and Sweep Prints</span>
                      <span className="text-zinc-500">Live Stream</span>
                    </div>
                    <div className="border border-borderSubtle rounded-lg bg-zinc-950/30 p-4 min-h-60 max-h-60 overflow-y-auto flex flex-col gap-2 font-mono text-xxs">
                      {marketData && marketData.tape && marketData.tape.length > 0 ? (
                        [...marketData.tape].reverse().map((order, i) => (
                          <div key={i} className="flex justify-between border-b border-borderSubtle/50 pb-1.5 text-textSecondary animate-slide-in">
                            <span>{order.time}</span>
                            <span className="text-white font-bold">{order.ticker}</span>
                            <span>${order.strike}</span>
                            <span className={order.type === 'C' ? 'text-gammaPos' : 'text-gammaNeg'}>{order.type}</span>
                            <span className="text-textMuted">{order.size} Lots</span>
                            <span className="font-semibold text-white">{order.orderType}</span>
                            <span className={order.side === 'ASK' ? 'text-gammaPos' : 'text-gammaNeg'}>{order.side}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-textMuted py-20">Awaiting block stream ticks...</div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Screen Bottom Indicators */}
              <div className="p-6 border-t border-borderSubtle bg-zinc-950/20 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="font-mono text-xxs text-textMuted uppercase tracking-wider">Dealer Flip</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5" id="stat-flip">
                    {marketData && marketData.plan ? `$${marketData.plan.flipZone.toFixed(2)}` : '--'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xxs text-textMuted uppercase tracking-wider">TTM Squeeze</div>
                  <div className={getSqueezeClass()} id="stat-squeeze">
                    {marketData && marketData.indicators ? (marketData.indicators.squeeze ? 'ON (BUILDA)' : 'RELEASED') : '--'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xxs text-textMuted uppercase tracking-wider">RSI (14)</div>
                  <div className={getRsiClass()} id="stat-rsi">
                    {marketData && marketData.indicators ? Math.round(marketData.indicators.rsi) : '--'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xxs text-textMuted uppercase tracking-wider">Gamma Regime</div>
                  <div className={`font-mono text-xxs font-bold mt-0.5 ${getRegimeColorClass()}`} id="regime-desc">
                    {getRegimeDesc() || '--'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      ) : null}

    </div>
  );
};

export default Home;
