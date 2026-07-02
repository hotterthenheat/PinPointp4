import React, { useEffect, useRef } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Charts from '../core/charts';
import Simulator from '../core/simulator';
import { BarChart2, Shield } from 'lucide-react';

const PinpointGex = () => {
  const { activeTicker, marketData, changeTicker } = useMarketData();

  const gexCanvasRef = useRef(null);
  const vannaCanvasRef = useRef(null);

  useEffect(() => {
    if (!marketData) return;

    // Draw GEX Chart and Vanna Heatmap on tick
    if (gexCanvasRef.current) {
      Charts.updateGexChart(gexCanvasRef.current, marketData.chain, marketData.spot);
    }
    if (vannaCanvasRef.current) {
      Charts.renderVannaHeatmap(vannaCanvasRef.current, marketData.spot, marketData.chain);
    }
  }, [marketData]);

  const getEmaColorClass = () => {
    if (!marketData || !marketData.indicators) return 'text-white';
    return marketData.spot >= marketData.indicators.ema9 ? 'text-gammaPos' : 'text-gammaNeg';
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 relative z-10 flex flex-col gap-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xxs font-mono text-textSecondary uppercase tracking-widest">
          <span>Platform</span>
          <span>/</span>
          <span className="text-white">Pinpoint (GEX) Strike Map</span>
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

      {/* Main GEX Grids Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Column 1 & 2 (Main block): Strike GEX profile bar chart */}
        <div className="lg:col-span-2 border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-2.5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <BarChart2 className="w-3.5 h-3.5" /> GEX strike exposure profile
            </h3>
            <span className="text-xxxs font-mono text-textMuted uppercase">Net Gamma ($Millions)</span>
          </div>

          {/* Chart Wrapper */}
          <div className="relative flex-grow min-h-[400px] w-full border border-borderSubtle bg-zinc-950/20 rounded-lg p-2 overflow-hidden">
            <canvas ref={gexCanvasRef} id="gex-chart" className="w-full h-full"></canvas>
          </div>
        </div>

        {/* Column 3 (Right Sidebar): Spot details + Vanna migration heatmap */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Ticker spot stats card */}
          <div className="border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-borderSubtle pb-2.5 text-white">
              GEX Calibration Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4 font-mono text-xxs">
              <div>
                <span className="text-textSecondary uppercase">Active Ticker</span>
                <span className="text-sm font-bold text-white mt-1 block uppercase" id="ticker-lbl">{activeTicker}</span>
              </div>
              <div>
                <span className="text-textSecondary uppercase">Spot Price</span>
                <span className="text-sm font-bold text-white mt-1 block" id="ticker-price-lbl">
                  {marketData ? `$${marketData.spot.toFixed(2)}` : '--'}
                </span>
              </div>
              <div>
                <span className="text-textSecondary uppercase">EMA 9 Indicator</span>
                <span className={`text-sm font-bold mt-1 block ${getEmaColorClass()}`} id="ticker-ema-val">
                  {marketData ? `$${marketData.indicators.ema9.toFixed(2)}` : '--'}
                </span>
              </div>
              <div>
                <span className="text-textSecondary uppercase">Dealer Flip Zone</span>
                <span className="text-sm font-bold text-white mt-1 block" id="stat-flip-zone">
                  {marketData && marketData.plan ? `$${marketData.plan.flipZone.toFixed(2)}` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Vanna matrix heatmap card */}
          <div className="border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4 flex-grow">
            <div className="flex justify-between items-center border-b border-borderSubtle pb-2.5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
                <Shield className="w-3.5 h-3.5" /> Vanna Exposure Heatmap
              </h3>
              <span className="text-xxxs font-mono text-textMuted uppercase">Migration</span>
            </div>
            
            {/* Heatmap canvas */}
            <div className="relative flex-grow min-h-[220px] w-full border border-borderSubtle bg-zinc-950/20 rounded-lg p-1 overflow-hidden">
              <canvas ref={vannaCanvasRef} id="vanna-heatmap" className="w-full h-full"></canvas>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PinpointGex;
