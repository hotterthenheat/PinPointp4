import React, { useState, useEffect, useRef } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Charts from '../core/charts';
import Simulator from '../core/simulator';
import { Play, TrendingUp, Sliders, Activity } from 'lucide-react';

const SkysVision = () => {
  const { activeTicker, marketData, changeTicker, executeTrade } = useMarketData();
  const cockpitCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parameter State Sliders
  const [emaThreshold, setEmaThreshold] = useState(1.2);
  const [squeezeThreshold, setSqueezeThreshold] = useState(8.5);

  useEffect(() => {
    if (!marketData) return;
    
    // Draw Cockpit Chart on mount/tick
    if (cockpitCanvasRef.current) {
      Charts.updateCockpitChart(cockpitCanvasRef.current, marketData.priceHistory, marketData.plan);
    }
  }, [marketData]);

  const handleExecuteHedge = () => {
    const res = executeTrade();
    if (res.success && res.trade) {
      alert(`Hedge executed successfully! Transaction ID: ${res.trade.id}`);
    } else {
      alert(res.message ?? 'Trade execution failed');
    }
  };

  const getSqueezeClass = () => {
    if (!marketData || !marketData.indicators) return 'text-zinc-500';
    return marketData.indicators.squeeze ? 'text-gammaNeg' : 'text-gammaPos';
  };

  const getRsiClass = () => {
    if (!marketData || !marketData.indicators) return 'text-zinc-500';
    const rsi = marketData.indicators.rsi;
    if (rsi > 70) return 'text-gammaNeg';
    if (rsi < 30) return 'text-gammaPos';
    return 'text-white';
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 relative z-10 flex flex-col gap-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xxs font-mono text-textSecondary uppercase tracking-widest">
          <span>Platform</span>
          <span>/</span>
          <span className="text-white">Sky's Vision Cockpit</span>
        </div>
        
        {/* Ticker Selector */}
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
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Column 1 (Left Sidebar): Parameter settings */}
        <div className="lg:col-span-1 border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-6">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-borderSubtle pb-2.5 flex items-center gap-2 text-white">
              <Sliders className="w-3.5 h-3.5" /> Parameter Engine
            </h3>
            
            {/* Live Spot Tracker */}
            <div className="mt-4 bg-black border border-borderSubtle rounded-lg p-4 font-mono text-center">
              <span className="text-xxxs text-textSecondary uppercase tracking-wider block">Live Spot price</span>
              <span className="text-sm font-bold text-white mt-1 block" id="ticker-price-lbl">
                {marketData ? `$${marketData.spot.toFixed(2)} (${marketData.changePercent >= 0 ? '+' : ''}${marketData.changePercent.toFixed(2)}%)` : '--'}
              </span>
            </div>
          </div>

          {/* Indicators list */}
          <div className="flex flex-col gap-3 font-mono text-xxs border-b border-borderSubtle pb-6">
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">EMA 9 Zone</span>
              <span className="font-bold text-white" id="ticker-ema-val">
                {marketData ? `$${marketData.indicators.ema9.toFixed(2)}` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Dealer Flip Zone</span>
              <span className="font-bold text-white" id="stat-flip-zone">
                {marketData && marketData.plan ? `$${marketData.plan.flipZone.toFixed(2)}` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">TTM Squeeze</span>
              <span className={`font-bold uppercase ${getSqueezeClass()}`} id="stat-squeeze">
                {marketData && marketData.indicators ? (marketData.indicators.squeeze ? 'ON (BUILDA)' : 'RELEASED') : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">RSI (14)</span>
              <span className={`font-bold ${getRsiClass()}`} id="stat-rsi">
                {marketData && marketData.indicators ? Math.round(marketData.indicators.rsi) : '--'}
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xxs font-bold text-white uppercase tracking-wider">Calibration Tweak</h4>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xxxs text-textSecondary font-mono uppercase">
                <span>EMA Crossover</span>
                <span>{emaThreshold.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1" 
                value={emaThreshold}
                onChange={(e) => setEmaThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xxxs text-textSecondary font-mono uppercase">
                <span>Squeeze Sens</span>
                <span>{squeezeThreshold.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="15.0" 
                step="0.5" 
                value={squeezeThreshold}
                onChange={(e) => setSqueezeThreshold(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" 
              />
            </div>
          </div>
        </div>

        {/* Column 2 & 3 (Center): Chart view */}
        <div className="lg:col-span-2 border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-2.5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <Activity className="w-3.5 h-3.5" /> Cockpit Projections
            </h3>
            <span className="text-xxxs font-mono text-textMuted uppercase">40 Ticks Vector</span>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative flex-grow min-h-[350px] w-full border border-borderSubtle bg-zinc-950/20 rounded-lg p-2 overflow-hidden">
            <canvas ref={cockpitCanvasRef} id="cockpit-chart" className="w-full h-full"></canvas>
          </div>
        </div>

        {/* Column 4 (Right Sidebar): Trade Planner */}
        <div className="lg:col-span-1 border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-borderSubtle pb-2.5 flex items-center gap-2 text-white">
              <Play className="w-3.5 h-3.5" /> Flow Planner
            </h3>
            
            {marketData && marketData.plan ? (
              <div className="flex flex-col gap-4 animate-slide-in">
                <div className="flex justify-between items-center">
                  <span className={`text-xxs font-semibold px-2 py-0.5 rounded uppercase ${
                    marketData.plan.direction === 'BULLISH' 
                      ? 'bg-emerald-500/10 text-gammaPos border border-gammaPos/20' 
                      : 'bg-rose-500/10 text-gammaNeg border border-gammaNeg/20'
                  }`}>
                    {marketData.plan.direction}
                  </span>
                  <span className="text-xxs text-textSecondary font-medium">Confidence: {marketData.plan.confidence}%</span>
                </div>
                <div className="flex justify-between text-xs border-b border-dashed border-borderSubtle pb-1.5">
                  <span className="text-textSecondary">Trigger Entry</span>
                  <span className="font-mono font-semibold text-gammaPos">${marketData.plan.entry.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-dashed border-borderSubtle pb-1.5">
                  <span className="text-textSecondary">GEX Target (TP)</span>
                  <span className="font-mono font-semibold text-gammaPos">${marketData.plan.target1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-dashed border-borderSubtle pb-1.5">
                  <span className="text-textSecondary">Dealer Flip (SL)</span>
                  <span className="font-mono font-semibold text-gammaNeg">${marketData.plan.stopLoss.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-textMuted py-8 font-mono text-xxs">Loading trade calculations...</div>
            )}
          </div>

          <button 
            onClick={handleExecuteHedge}
            className="w-full bg-white hover:bg-silver text-black rounded-md py-2.5 text-xs font-semibold transition-colors border border-white/10 shadow-sm uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            Execute Flow Hedge
          </button>
        </div>

      </div>

      {/* Crossover Log Table */}
      <div className="border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-borderSubtle pb-2.5 text-white">
          Calibration Signal Log
        </h3>
        <div className="border border-borderSubtle rounded-lg overflow-hidden bg-zinc-950/20 text-xxs font-mono">
          <div className="grid grid-cols-4 bg-zinc-950/60 p-2.5 text-textMuted uppercase border-b border-borderSubtle font-semibold">
            <span>Timestamp</span>
            <span>Signal Type</span>
            <span>Trigger Price</span>
            <span className="text-right">Calibration Accuracy</span>
          </div>
          <div className="divide-y divide-borderSubtle max-h-48 overflow-y-auto">
            {marketData && marketData.plan ? (
              <>
                <div className="grid grid-cols-4 p-2.5 hover:bg-zinc-900/10">
                  <span className="text-textSecondary">{new Date().toLocaleTimeString()}</span>
                  <span className="text-white font-bold">CROSSOVER UPPER</span>
                  <span className="text-white">${marketData.plan.resistanceWall.toFixed(2)}</span>
                  <span className="text-right text-gammaPos">98.4%</span>
                </div>
                <div className="grid grid-cols-4 p-2.5 hover:bg-zinc-900/10">
                  <span className="text-textSecondary">10:14:02 AM</span>
                  <span className="text-white font-bold">CROSSOVER LOWER</span>
                  <span className="text-white">${marketData.plan.supportWall.toFixed(2)}</span>
                  <span className="text-right text-gammaPos">99.1%</span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-textMuted">No signals logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkysVision;
