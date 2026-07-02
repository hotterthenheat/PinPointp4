import { useMemo, useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Simulator from '../core/simulator';
import { buildSkyVision, makeSetup } from '../data/skyvision';
import { SCANNERS, type ScannerKey } from '../types/skyvision';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import Panel from '../components/ui/Panel';
import SetupsFeed from '../components/skyvision/SetupsFeed';
import ContractChain, { type ChainSelection } from '../components/skyvision/ContractChain';
import SignalMonitor from '../components/skyvision/SignalMonitor';
import ImpactLeaderboard from '../components/skyvision/ImpactLeaderboard';

const TICKER_OPTIONS = Object.keys(Simulator.TICKERS).map(tk => ({ value: tk, label: tk }));
const SCANNER_OPTIONS = SCANNERS.map(s => ({ value: s.key, label: s.label }));

interface MonitorTarget {
  ticker: string;
  strike: number;
  right: 'C' | 'P';
}

const SkysVision = () => {
  const { activeTicker, marketData, changeTicker } = useMarketData();
  const [scanner, setScanner] = useState<ScannerKey>('top-opportunity');
  const [monitorTarget, setMonitorTarget] = useState<MonitorTarget | null>(null);
  const [chainSel, setChainSel] = useState<ChainSelection | null>(null);

  const data = useMemo(() => (marketData ? buildSkyVision(marketData, scanner) : null), [marketData, scanner]);

  // Rebuild the monitored setup live each tick from its identity so it stays current
  const monitoredSetup = useMemo(() => {
    if (!monitorTarget) return null;
    const cfg = Simulator.TICKERS[monitorTarget.ticker as keyof typeof Simulator.TICKERS];
    if (!cfg) return null;
    return makeSetup(monitorTarget.ticker, cfg.currentPrice, monitorTarget.strike, monitorTarget.right, scanner, cfg.iv);
  }, [monitorTarget, scanner]);

  const activeScanner = SCANNERS.find(s => s.key === scanner)!;

  const handleScanner = (next: ScannerKey) => {
    setScanner(next);
    setMonitorTarget(null); // detail depends on scanner; return to feed
  };

  const handleChainSelect = (sel: ChainSelection) => {
    setChainSel(sel);
    setMonitorTarget({ ticker: sel.ticker, strike: sel.strike, right: sel.right });
  };

  const header = (
    <PageHeader
      breadcrumb={['Terminal', "Sky's Vision"]}
      title="Trade Cockpit"
      subtitle="Advisory signal engine — the terminal calls ENTER or EXIT; you never place the order"
      actions={
        <SegmentedControl ariaLabel="Ticker" options={TICKER_OPTIONS} value={activeTicker} onChange={changeTicker} />
      }
    />
  );

  if (!data || !marketData) {
    return (
      <>
        {header}
        <Panel className="h-64" bodyClassName="flex items-center justify-center">
          <span className="font-mono text-[11px] text-textMuted uppercase tracking-widest">
            Awaiting feed initialization…
          </span>
        </Panel>
      </>
    );
  }

  return (
    <>
      {header}

      {/* Scanner tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <SegmentedControl ariaLabel="Scanner" options={SCANNER_OPTIONS} value={scanner} onChange={handleScanner} />
        <span className="font-mono text-[10px] text-textMuted uppercase tracking-wider">{activeScanner.blurb}</span>
      </div>

      {/* Feed / monitor + contract chain */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-7 min-w-0">
          {monitoredSetup ? (
            <SignalMonitor setup={monitoredSetup} onBack={() => setMonitorTarget(null)} />
          ) : (
            <SetupsFeed
              groups={data.groups}
              shown={data.shown}
              total={30}
              onOpenAnalysis={setup =>
                setMonitorTarget({ ticker: setup.ticker, strike: setup.strike, right: setup.right })
              }
            />
          )}
        </div>

        <div className="xl:col-span-5 min-w-0">
          <ContractChain data={data.chain} selected={chainSel} onSelect={handleChainSelect} />
        </div>
      </div>

      {/* Largest impact leaderboard */}
      <ImpactLeaderboard rows={data.impact} />
    </>
  );
};

export default SkysVision;
