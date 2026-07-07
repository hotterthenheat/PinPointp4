import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useMarketData } from '../context/MarketDataContext';
import Simulator from '../core/simulator';
import { buildSkyVision, makeSetup } from '../data/skyvision';
import { SCANNERS, type ScannerKey, type Setup } from '../types/skyvision';
import PageHeader from '../components/ui/PageHeader';
import TickerSearch from '../components/ui/TickerSearch';
import Panel from '../components/ui/Panel';
import SetupsFeed from '../components/skyvision/SetupsFeed';
import ContractChain, { type ChainSelection } from '../components/skyvision/ContractChain';
import SignalMonitor from '../components/skyvision/SignalMonitor';
import SamplePreview from '../components/skyvision/SamplePreview';
import ImpactLeaderboard from '../components/skyvision/ImpactLeaderboard';

interface MonitorTarget {
  ticker: string;
  strike: number;
  right: 'C' | 'P';
}

const SkysVision = () => {
  const { activeTicker, marketData, changeTicker } = useMarketData();
  const [scanner, setScanner] = useState<ScannerKey>('top-setups');

  // Phase 1 (browse): selectedSetup drives the SamplePreview card
  // Phase 2 (review): monitorTarget drives the SignalMonitor + ContractChain
  const [selectedSetup, setSelectedSetup] = useState<Setup | null>(null);
  const [monitorTarget, setMonitorTarget] = useState<MonitorTarget | null>(null);
  const [chainSel, setChainSel] = useState<ChainSelection | null>(null);

  // Ticker filter for browse mode — null means show all tickers
  const [tickerFilter, setTickerFilter] = useState<string | null>(null);
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);

  const inReviewMode = monitorTarget !== null;

  const data = useMemo(() => (marketData ? buildSkyVision(marketData, scanner) : null), [marketData, scanner]);

  // Rebuild the monitored setup live each tick from its identity so it stays current
  const monitoredSetup = useMemo(() => {
    if (!monitorTarget) return null;
    Simulator.ensureTicker(monitorTarget.ticker);
    const cfg = Simulator.TICKERS[monitorTarget.ticker];
    return makeSetup(monitorTarget.ticker, cfg.currentPrice, monitorTarget.strike, monitorTarget.right, scanner, cfg.iv);
  }, [monitorTarget, scanner]);

  // Also rebuild the selected preview setup live so metrics stay current
  const liveSelectedSetup = useMemo(() => {
    if (!selectedSetup) return null;
    Simulator.ensureTicker(selectedSetup.ticker);
    const cfg = Simulator.TICKERS[selectedSetup.ticker];
    return makeSetup(selectedSetup.ticker, cfg.currentPrice, selectedSetup.strike, selectedSetup.right, scanner, cfg.iv);
  }, [selectedSetup, scanner]);

  // Filtered groups for browse mode
  const filteredGroups = useMemo(() => {
    if (!data) return [];
    if (!tickerFilter) return data.groups;
    return data.groups.filter(g => g.ticker === tickerFilter);
  }, [data, tickerFilter]);

  // Compute counts per scanner tab
  const scannerCounts = useMemo(() => {
    if (!marketData) return {} as Record<ScannerKey, number>;
    const counts: Record<string, number> = {};
    let allCount = 0;
    for (const s of SCANNERS) {
      if (s.key === 'all') continue;
      const built = buildSkyVision(marketData, s.key);
      const count = built.groups.reduce((acc, g) => acc + g.found, 0);
      counts[s.key] = count;
      allCount += count;
    }
    counts['all'] = allCount;
    return counts as Record<ScannerKey, number>;
  }, [marketData]);

  // Collect unique tickers across the feed for the filter dropdown
  const feedTickers = useMemo(() => {
    if (!data) return [];
    return data.groups.map(g => g.ticker);
  }, [data]);

  const filteredShown = filteredGroups.reduce((a, g) => a + g.found, 0);

  const activeScanner = SCANNERS.find(s => s.key === scanner)!;

  const handleScanner = (next: ScannerKey) => {
    setScanner(next);
    setMonitorTarget(null);
    setSelectedSetup(null);
    setChainSel(null);
    setTickerFilter(null);
  };

  // Phase 1 → Phase 2: enter full review
  const handleReviewSetup = (setup: Setup) => {
    setMonitorTarget({ ticker: setup.ticker, strike: setup.strike, right: setup.right });
    setChainSel(null);
  };

  // Phase 2 → Phase 1: exit review, go back to browse
  const handleBackToBrowse = () => {
    setMonitorTarget(null);
    setChainSel(null);
  };

  const handleChainSelect = (sel: ChainSelection) => {
    setChainSel(sel);
    setMonitorTarget({ ticker: sel.ticker, strike: sel.strike, right: sel.right });
  };

  // When user clicks a setup in the feed, show it in SamplePreview
  const handleSelectSetup = (setup: Setup) => {
    setSelectedSetup(setup);
  };

  // Browse mode header — no ticker search
  const browseHeader = (
    <PageHeader
      breadcrumb={['Terminal', "Sky's Vision"]}
      title="Trade Cockpit"
      subtitle="Advisory signal engine — the terminal calls ENTER or EXIT; you never place the order"
    />
  );

  // Review mode header — ticker search in top-right
  const reviewHeader = (
    <PageHeader
      breadcrumb={['Terminal', "Sky's Vision"]}
      title="Trade Cockpit"
      subtitle="Advisory signal engine — the terminal calls ENTER or EXIT; you never place the order"
      actions={<TickerSearch value={activeTicker} onChange={changeTicker} />}
    />
  );

  if (!data || !marketData) {
    return (
      <>
        {browseHeader}
        <Panel className="h-64" bodyClassName="flex items-center justify-center">
          <span className="font-mono text-[11px] text-textMuted uppercase tracking-widest">
            Awaiting feed initialization…
          </span>
        </Panel>
      </>
    );
  }

  // Auto-select the first setup if nothing is selected yet
  const effectiveSelected = liveSelectedSetup ?? (filteredGroups[0]?.setups[0] ?? null);

  return (
    <>
      {inReviewMode ? reviewHeader : browseHeader}

      {/* Scanner tabs with counts */}
      <div className="flex items-center gap-1 flex-wrap">
        {SCANNERS.map(s => {
          const isActive = scanner === s.key;
          const count = scannerCounts[s.key] ?? 0;
          return (
            <button
              key={s.key}
              onClick={() => handleScanner(s.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] font-medium uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-white/[0.08] text-textPrimary border border-borderMuted'
                  : 'text-textMuted hover:text-textSecondary hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              {s.label}
              <span className={`font-mono text-[10px] tnum ${isActive ? 'text-textSecondary' : 'text-textMuted/60'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ticker filter + blurb row (browse mode only) */}
      {!inReviewMode && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] text-textMuted uppercase tracking-wider">{activeScanner.blurb}</span>
          <div className="ml-auto relative">
            <button
              onClick={() => setShowTickerDropdown(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-mono text-[10px] uppercase tracking-wider transition-colors ${
                tickerFilter
                  ? 'border-select/40 bg-select/[0.06] text-select'
                  : 'border-borderSubtle bg-white/[0.02] text-textMuted hover:text-textSecondary'
              }`}
            >
              <Filter className="w-3 h-3" />
              {tickerFilter ?? 'Filter by Ticker'}
            </button>
            {showTickerDropdown && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] border border-borderSubtle bg-panel rounded-md shadow-lg overflow-hidden animate-slide-in">
                <button
                  onClick={() => { setTickerFilter(null); setShowTickerDropdown(false); }}
                  className={`w-full text-left px-3 py-2 font-mono text-[11px] transition-colors ${
                    !tickerFilter ? 'text-select bg-select/[0.06]' : 'text-textSecondary hover:bg-white/[0.03]'
                  }`}
                >
                  All Tickers
                </button>
                {feedTickers.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTickerFilter(t); setShowTickerDropdown(false); }}
                    className={`w-full text-left px-3 py-2 font-mono text-[11px] transition-colors ${
                      tickerFilter === t ? 'text-select bg-select/[0.06]' : 'text-textSecondary hover:bg-white/[0.03]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanner blurb (review mode) */}
      {inReviewMode && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] text-textMuted uppercase tracking-wider">{activeScanner.blurb}</span>
        </div>
      )}

      {/* Feed / monitor + preview / chain */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-7 min-w-0">
          <div key={inReviewMode ? `mon-${monitoredSetup?.id}` : `feed-${scanner}`} className="animate-view-in">
            {inReviewMode && monitoredSetup ? (
              <SignalMonitor setup={monitoredSetup} onBack={handleBackToBrowse} />
            ) : (
              <SetupsFeed
                groups={filteredGroups}
                shown={filteredShown}
                total={data.totalFound}
                selectedSetupId={effectiveSelected?.id ?? null}
                onSelectSetup={handleSelectSetup}
                onOpenAnalysis={setup => handleReviewSetup(setup)}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-5 min-w-0">
          <div key={inReviewMode ? 'chain' : `preview-${effectiveSelected?.id}`} className="animate-view-in">
            {inReviewMode ? (
              <ContractChain data={data.chain} selected={chainSel} onSelect={handleChainSelect} />
            ) : effectiveSelected ? (
              <SamplePreview
                setup={effectiveSelected}
                scanner={scanner}
                onReviewSetup={() => handleReviewSetup(effectiveSelected)}
              />
            ) : (
              <Panel className="h-64" bodyClassName="flex items-center justify-center">
                <span className="font-mono text-[11px] text-textMuted uppercase tracking-widest">
                  Select a setup to preview
                </span>
              </Panel>
            )}
          </div>
        </div>
      </div>

      {/* Largest impact leaderboard */}
      <ImpactLeaderboard rows={data.impact} />
    </>
  );
};

export default SkysVision;
