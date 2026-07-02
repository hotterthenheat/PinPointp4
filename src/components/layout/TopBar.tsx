import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useMarketData } from '../../context/MarketDataContext';
import SignalBadge from '../ui/SignalBadge';

interface TopBarProps {
  onOpenPalette: () => void;
}

const TopBar = ({ onOpenPalette }: TopBarProps) => {
  const { activeTicker, marketData } = useMarketData();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);

  const changeUp = (marketData?.changePercent ?? 0) >= 0;

  return (
    <header className="h-14 shrink-0 border-b border-borderSubtle bg-canvas/90 backdrop-blur flex items-center gap-4 px-4">
      {/* Command / search trigger */}
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 w-full max-w-sm border border-borderSubtle bg-panel hover:border-borderMuted rounded-md px-3 py-1.5 text-xs text-textMuted transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-grow text-left">Search or jump to…</span>
        <kbd className="font-mono text-[10px] border border-borderSubtle rounded px-1 py-0.5 text-textMuted bg-inset">
          ⌘K
        </kbd>
      </button>

      {/* Right cluster: live context */}
      <div className="ml-auto flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
          <span className="text-textSecondary font-semibold">{activeTicker}</span>
          <span className="text-textPrimary font-semibold tnum">
            {marketData ? `$${marketData.spot.toFixed(2)}` : '--'}
          </span>
          {marketData && (
            <span className={`tnum text-[11px] ${changeUp ? 'text-bull' : 'text-bear'}`}>
              {changeUp ? '+' : ''}
              {marketData.changePercent.toFixed(2)}%
            </span>
          )}
        </div>
        <SignalBadge tone="warn">Sim</SignalBadge>
        <span className="hidden md:block font-mono text-xs text-textSecondary tnum select-none">{clock}</span>
      </div>
    </header>
  );
};

export default TopBar;
