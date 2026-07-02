import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarketData } from '../context/MarketDataContext';
import Simulator from '../core/simulator';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import MetricGrid from '../components/ui/MetricGrid';
import StatCard from '../components/ui/StatCard';
import SignalBadge from '../components/ui/SignalBadge';
import Panel from '../components/ui/Panel';
import AlertRow from '../components/ui/AlertRow';
import type { Tone } from '../components/ui/tones';

const TICKER_OPTIONS = Object.keys(Simulator.TICKERS).map(tk => ({ value: tk, label: tk }));

interface DerivedAlert {
  id: string;
  tone: Tone;
  title: string;
  detail: string;
}

const CommandCenter = () => {
  const { activeTicker, marketData, changeTicker } = useMarketData();

  const exposures = useMemo(() => {
    if (!marketData) return null;
    const { chain, spot, plan, indicators } = marketData;
    const netGex = chain.reduce((a, n) => a + n.netGex, 0) / 1e6;
    const netDex = chain.reduce((a, n) => a + n.netDex, 0) / 1e6;
    const netVex = chain.reduce((a, n) => a + n.netVex, 0) / 1e6;

    const alerts: DerivedAlert[] = [];
    if (indicators.squeeze) {
      alerts.push({
        id: 'squeeze',
        tone: 'warn',
        title: 'TTM squeeze building',
        detail: 'Bollinger inside Keltner — volatility expansion setup forming',
      });
    }
    if (indicators.rsi > 70) {
      alerts.push({
        id: 'rsi-hot',
        tone: 'bear',
        title: `RSI overbought at ${indicators.rsi.toFixed(0)}`,
        detail: 'Momentum stretched — fade risk elevated above 70',
      });
    } else if (indicators.rsi < 30) {
      alerts.push({
        id: 'rsi-cold',
        tone: 'bull',
        title: `RSI oversold at ${indicators.rsi.toFixed(0)}`,
        detail: 'Downside momentum stretched — bounce risk elevated below 30',
      });
    }
    const flipDist = ((spot - plan.flipZone) / spot) * 100;
    if (Math.abs(flipDist) < 0.2) {
      alerts.push({
        id: 'flip',
        tone: 'warn',
        title: 'Spot pressing the gamma flip',
        detail: `${Math.abs(flipDist).toFixed(2)}% from ${plan.flipZone.toFixed(2)} — regime change risk`,
      });
    }
    const wallDist = ((plan.resistanceWall - spot) / spot) * 100;
    if (wallDist > 0 && wallDist < 0.3) {
      alerts.push({
        id: 'wall',
        tone: 'neutral',
        title: 'Approaching call wall',
        detail: `${plan.resistanceWall.toFixed(2)} overhead — dealer supply likely to pin`,
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        id: 'calm',
        tone: 'neutral',
        title: 'No structural alerts',
        detail: 'All monitored thresholds inside normal bands',
      });
    }

    return { netGex, netDex, netVex, alerts };
  }, [marketData]);

  const header = (
    <PageHeader
      breadcrumb={['Terminal', 'Overview']}
      title="Command Center"
      subtitle="Market regime, dealer exposure & active signal state"
      actions={
        <SegmentedControl ariaLabel="Ticker" options={TICKER_OPTIONS} value={activeTicker} onChange={changeTicker} />
      }
    />
  );

  if (!marketData || !exposures) {
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

  const { spot, plan, indicators, changePercent } = marketData;
  const inPositiveGamma = spot > plan.flipZone;
  const bullish = plan.direction === 'BULLISH';
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });

  return (
    <>
      {header}

      <MetricGrid min="150px">
        <StatCard
          label="Spot"
          value={`$${spot.toFixed(2)}`}
          sub={
            <span className={changePercent >= 0 ? 'text-bull' : 'text-bear'}>
              {changePercent >= 0 ? '+' : ''}
              {changePercent.toFixed(2)}% session
            </span>
          }
        />
        <StatCard
          label="Net GEX"
          value={`${exposures.netGex.toFixed(1)}M`}
          tone={exposures.netGex >= 0 ? 'bull' : 'bear'}
          sub="gamma exposure"
        />
        <StatCard
          label="Net DEX"
          value={`${exposures.netDex.toFixed(1)}M`}
          tone={exposures.netDex >= 0 ? 'bull' : 'bear'}
          sub="delta exposure"
        />
        <StatCard
          label="Net VEX"
          value={`${exposures.netVex.toFixed(1)}M`}
          tone={exposures.netVex >= 0 ? 'bull' : 'bear'}
          sub="vega exposure"
        />
        <StatCard
          label="Gamma Flip"
          value={`$${plan.flipZone.toFixed(2)}`}
          sub={inPositiveGamma ? 'spot above — stabilizing' : 'spot below — accelerating'}
        />
        <StatCard label="Call Wall" value={`$${plan.resistanceWall.toFixed(2)}`} sub="primary resistance" />
        <StatCard label="Put Wall" value={`$${plan.supportWall.toFixed(2)}`} sub="primary support" />
        <StatCard
          label="Dealer Bias"
          value={
            <SignalBadge tone={inPositiveGamma ? 'bull' : 'bear'} className="text-xs">
              {inPositiveGamma ? 'STABILIZING' : 'MOMENTUM'}
            </SignalBadge>
          }
          sub={`RSI ${indicators.rsi.toFixed(0)} · ${indicators.squeeze ? 'squeeze on' : 'squeeze off'}`}
        />
      </MetricGrid>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <Panel title="Active Alerts" subtitle="derived thresholds" flush className="xl:col-span-7 w-full">
          <div>
            {exposures.alerts.map(alert => (
              <AlertRow key={alert.id} tone={alert.tone} title={alert.title} detail={alert.detail} time={time} />
            ))}
          </div>
        </Panel>

        <Panel title="Current Signal" subtitle="system verdict" className="xl:col-span-5 w-full">
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <SignalBadge tone={bullish ? 'bull' : 'bear'} dot>
                {plan.direction}
              </SignalBadge>
              <span className="font-mono text-[11px] text-textSecondary">
                Confidence <span className="text-textPrimary font-semibold tnum">{plan.confidence}%</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="border border-borderSubtle bg-inset rounded-md px-3 py-2">
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Entry</div>
                <div className="text-textPrimary font-semibold mt-0.5 tnum">${plan.entry.toFixed(2)}</div>
              </div>
              <div className="border border-borderSubtle bg-inset rounded-md px-3 py-2">
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Stop</div>
                <div className="text-bear font-semibold mt-0.5 tnum">${plan.stopLoss.toFixed(2)}</div>
              </div>
              <div className="border border-borderSubtle bg-inset rounded-md px-3 py-2">
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Target 1</div>
                <div className="text-bull font-semibold mt-0.5 tnum">${plan.target1.toFixed(2)}</div>
              </div>
              <div className="border border-borderSubtle bg-inset rounded-md px-3 py-2">
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Target 2</div>
                <div className="text-bull font-semibold mt-0.5 tnum">${plan.target2.toFixed(2)}</div>
              </div>
            </div>
            <Link
              to="/skys-vision"
              className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-borderSubtle hover:border-borderMuted bg-inset text-xs font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              Open trade cockpit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
};

export default CommandCenter;
