import React from 'react';
import { useMarketData } from '../context/MarketDataContext';
import { TrendingUp, BarChart2, Activity, Trash2 } from 'lucide-react';

const AuditorLog = () => {
  const { auditorState, clearLedger } = useMarketData();
  const { activeTrades, closedTrades, stats } = auditorState;

  const handleResetLedger = () => {
    if (window.confirm("Reset performance ledger and history?")) {
      clearLedger();
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 relative z-10 flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xxs font-mono text-textSecondary uppercase tracking-widest">
        <span>Platform</span>
        <span>/</span>
        <span className="text-white">Performance Auditor Log</span>
      </div>

      {/* Top Metrics Overview (Tremor style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xxs font-mono text-textSecondary uppercase tracking-wider font-bold">
            <span>Success Calibration Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-gammaPos" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white" id="stat-winrate">
              {stats.count > 0 ? `${stats.winRate}%` : '--'}
            </span>
            <span className="text-xxs text-textSecondary font-medium">accuracy zones</span>
          </div>
        </div>
        <div className="border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xxs font-mono text-textSecondary uppercase tracking-wider font-bold">
            <span>Profit Factor Ratio</span>
            <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white" id="stat-profitfactor">
              {stats.count > 0 ? stats.profitFactor.toFixed(2) : '--'}
            </span>
            <span className="text-xxs text-textSecondary font-medium">gross gains/losses</span>
          </div>
        </div>
        <div className="border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xxs font-mono text-textSecondary uppercase tracking-wider font-bold">
            <span>Average Accuracy Alignment</span>
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white" id="stat-avgaccuracy">
              {stats.count > 0 ? `${stats.avgAccuracy}%` : '--'}
            </span>
            <span className="text-xxs text-textSecondary font-medium">spot calibration</span>
          </div>
        </div>
      </div>

      {/* Main Auditor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Active exposures */}
        <div className="lg:col-span-1 border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-borderSubtle pb-2.5 flex justify-between items-center text-white">
            <span>Active Exposures</span>
            <span className="text-[10px] text-textMuted uppercase font-normal">unexpired</span>
          </h3>
          
          <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[400px]" id="open-positions-list">
            {activeTrades.length === 0 ? (
              <div className="text-[10px] text-textMuted text-center py-8">
                No active exposures.
              </div>
            ) : (
              activeTrades.map((trade) => {
                const pnlClass = trade.pnl >= 0 ? 'text-gammaPos' : 'text-gammaNeg';
                const dirBadge = trade.direction === 'BULLISH'
                  ? 'bg-emerald-500/10 text-gammaPos'
                  : 'bg-rose-500/10 text-gammaNeg';

                return (
                  <div key={trade.id} className="bg-zinc-950 border border-borderSubtle rounded p-3 flex flex-col gap-1.5 text-xs animate-slide-in">
                    <div className="flex justify-between font-mono font-semibold">
                      <span className="text-white">
                        {trade.ticker} 
                        <span className={`text-[9px] px-1 py-0.2 rounded uppercase font-bold ml-1.5 ${dirBadge}`}>
                          {trade.direction}
                        </span>
                      </span>
                      <span className={pnlClass}>${trade.pnl.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-textSecondary text-[10px]">
                      <span>Ent: ${trade.entryPrice.toFixed(2)} &rarr; Tgt: ${trade.target.toFixed(2)}</span>
                      <span>SL: ${trade.stopLoss.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Closed transactions ledger table */}
        <div className="lg:col-span-2 border border-borderSubtle bg-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-2.5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Historical Audit Log</h3>
            <button 
              onClick={handleResetLedger}
              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xxs font-mono font-semibold px-3 py-1.5 rounded transition-all flex items-center gap-1.5 focus:outline-none"
            >
              <Trash2 className="w-3 h-3" /> Reset Ledger
            </button>
          </div>

          <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[400px] pr-2" id="auditor-ledger-list">
            {closedTrades.length === 0 ? (
              <div className="text-[10px] text-textMuted text-center py-16">
                No logged trials.
              </div>
            ) : (
              closedTrades.map((trade, idx) => {
                const outcomeBadge = trade.status === 'WIN' 
                  ? 'bg-emerald-500/10 text-gammaPos' 
                  : 'bg-rose-500/10 text-gammaNeg';
                const pnlClass = trade.pnl >= 0 ? 'text-gammaPos' : 'text-gammaNeg';

                return (
                  <div key={`${trade.id}-${idx}`} className="bg-zinc-950 border border-borderSubtle rounded p-3 flex flex-col gap-1.5 text-xs animate-slide-in">
                    <div className="flex justify-between font-mono font-semibold">
                      <span className="text-white">
                        {trade.ticker} 
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ml-1.5 ${outcomeBadge}`}>
                          {trade.status}
                        </span>
                      </span>
                      <span className={pnlClass}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-textSecondary text-[10px]">
                      <span>Exit: ${trade.exitPrice.toFixed(2)} (Acc: {trade.accuracy}%)</span>
                      <span>{trade.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuditorLog;
