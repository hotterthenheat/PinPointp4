import { useEffect, useRef } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Charts from '../core/charts';
import Simulator from '../core/simulator';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import MetricGrid from '../components/ui/MetricGrid';

const TICKER_OPTIONS = Object.keys(Simulator.TICKERS).map(tk => ({ value: tk, label: tk }));

const PinpointGex = () => {
  const { activeTicker, marketData, changeTicker } = useMarketData();

  const gexCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vannaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!marketData) return;
    if (gexCanvasRef.current) {
      Charts.updateGexChart(gexCanvasRef.current, marketData.chain, marketData.spot);
    }
    if (vannaCanvasRef.current) {
      Charts.renderVannaHeatmap(vannaCanvasRef.current, marketData.spot, marketData.chain);
    }
  }, [marketData]);

  const emaTone = marketData && marketData.spot >= marketData.indicators.ema9 ? 'bull' : 'bear';

  return (
    <>
      <PageHeader
        breadcrumb={['Terminal', 'Pinpoint GEX']}
        title="Strike Exposure Profile"
        subtitle="Strike-by-strike dealer gamma, delta & vega exposure"
        actions={
          <SegmentedControl ariaLabel="Ticker" options={TICKER_OPTIONS} value={activeTicker} onChange={changeTicker} />
        }
      />

      <MetricGrid min="160px">
        <StatCard label="Active Ticker" value={activeTicker} sub="0DTE chain" />
        <StatCard label="Spot Price" value={marketData ? `$${marketData.spot.toFixed(2)}` : '--'} sub="live tick" />
        <StatCard
          label="EMA 9"
          value={marketData ? `$${marketData.indicators.ema9.toFixed(2)}` : '--'}
          tone={emaTone}
          sub="fast trend"
        />
        <StatCard
          label="Gamma Flip"
          value={marketData ? `$${marketData.plan.flipZone.toFixed(2)}` : '--'}
          sub="dealer regime pivot"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <Panel
          title="GEX Strike Profile"
          subtitle="net gamma ($M)"
          className="lg:col-span-2 w-full"
          bodyClassName="flex flex-col"
        >
          <div className="relative flex-grow min-h-[400px] border border-borderSubtle bg-inset rounded-md p-2 overflow-hidden">
            <canvas ref={gexCanvasRef} className="w-full h-full" />
          </div>
        </Panel>

        <Panel title="Vanna Migration" subtitle="drift × expiry" className="w-full" bodyClassName="flex flex-col">
          <div className="relative flex-grow min-h-[400px] border border-borderSubtle bg-inset rounded-md p-1 overflow-hidden">
            <canvas ref={vannaCanvasRef} className="w-full h-full" />
          </div>
        </Panel>
      </div>
    </>
  );
};

export default PinpointGex;
