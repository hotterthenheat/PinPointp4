import { useMemo, useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import { buildVisionModel } from '../data/vision';
import Simulator from '../core/simulator';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import MetricGrid from '../components/ui/MetricGrid';
import StatCard from '../components/ui/StatCard';
import SignalBadge from '../components/ui/SignalBadge';
import Panel from '../components/ui/Panel';
import DataTable, { type Column } from '../components/ui/DataTable';
import PriceChart from '../components/charts/PriceChart';
import TradePlanCard from '../components/trade/TradePlanCard';
import ReasoningPanel from '../components/trade/ReasoningPanel';
import type { ContractRow, ExpiryKey } from '../types/vision';

const EXPIRY_OPTIONS = [
  { value: '0DTE', label: '0DTE' },
  { value: '1DTE', label: '1DTE' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
] as const;

const TICKER_OPTIONS = Object.keys(Simulator.TICKERS).map(tk => ({ value: tk, label: tk }));

const gradeTone = (grade: string) =>
  grade.startsWith('A') ? 'bull' : grade === 'D' ? 'bear' : grade.startsWith('B') ? 'neutral' : 'warn';

const CONTRACT_COLUMNS: Column<ContractRow>[] = [
  {
    key: 'contract',
    header: 'Contract',
    render: row => (
      <span className="font-semibold text-textPrimary">
        {row.contract}
        <span className={`ml-1.5 text-[10px] ${row.right === 'C' ? 'text-bull' : 'text-bear'}`}>
          {row.right === 'C' ? 'CALL' : 'PUT'}
        </span>
      </span>
    ),
    sortValue: row => row.strike,
  },
  { key: 'dte', header: 'DTE', render: row => <span className="text-textSecondary">{row.dte}</span> },
  {
    key: 'velocity',
    header: 'Vol Vel',
    align: 'right',
    sortValue: row => row.volumeVelocity,
    render: row => (
      <span className={row.volumeVelocity >= 1.5 ? 'text-warn' : 'text-textSecondary'}>
        {row.volumeVelocity.toFixed(1)}x
      </span>
    ),
  },
  {
    key: 'flow',
    header: 'Flow',
    align: 'right',
    sortValue: row => row.flowScore,
    render: row => <span className="text-textSecondary">{row.flowScore}</span>,
  },
  {
    key: 'grade',
    header: 'Grade',
    align: 'right',
    sortValue: row => row.score,
    render: row => <SignalBadge tone={gradeTone(row.grade)}>{row.grade}</SignalBadge>,
  },
  {
    key: 'score',
    header: 'Score',
    align: 'right',
    sortValue: row => row.score,
    render: row => <span className="font-semibold text-textPrimary">{row.score}</span>,
  },
];

const SkysVision = () => {
  const { activeTicker, marketData, changeTicker, executeTrade } = useMarketData();
  const [expiry, setExpiry] = useState<ExpiryKey>('0DTE');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const model = useMemo(
    () => (marketData ? buildVisionModel(marketData, expiry) : null),
    [marketData, expiry]
  );

  const selectedContract =
    model?.contracts.find(c => c.id === selectedId) ?? model?.contracts[0] ?? null;

  const handleExecute = () => {
    const res = executeTrade();
    if (res.success && res.trade) {
      alert(`Hedge executed. Transaction ID: ${res.trade.id}`);
    } else {
      alert(res.message ?? 'Trade execution failed');
    }
  };

  const header = (
    <PageHeader
      breadcrumb={['Terminal', "Sky's Vision"]}
      title="Trade Cockpit"
      subtitle="Multi-factor contract grading with dealer-flow confirmation"
      actions={
        <>
          <SegmentedControl
            ariaLabel="Ticker"
            options={TICKER_OPTIONS}
            value={activeTicker}
            onChange={changeTicker}
          />
          <SegmentedControl
            ariaLabel="Expiry"
            options={EXPIRY_OPTIONS}
            value={expiry}
            onChange={setExpiry}
          />
        </>
      }
    />
  );

  if (!model) {
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

  const { assessment, factors, contracts, plan, summary } = model;
  const bullish = assessment.direction === 'BULLISH';

  return (
    <>
      {header}

      {/* Band 1 — verdict strip */}
      <MetricGrid min="160px">
        <StatCard
          label="Direction"
          value={
            <SignalBadge tone={bullish ? 'bull' : 'bear'} dot className="text-xs">
              {assessment.direction}
            </SignalBadge>
          }
          sub={`composite ${assessment.score}/100`}
        />
        <StatCard
          label="Confidence"
          value={`${assessment.confidence}%`}
          tone={assessment.confidence >= 70 ? 'bull' : 'neutral'}
          sub="model calibration"
        />
        <StatCard label="Setup Grade" value={assessment.grade} tone={gradeTone(assessment.grade)} sub="A+ through D scale" />
        <StatCard
          label="Trend Regime"
          value={`${assessment.trendScore}`}
          tone={assessment.trendScore >= 60 ? 'bull' : assessment.trendScore <= 40 ? 'bear' : 'neutral'}
          sub="EMA + RSI composite"
        />
        <StatCard
          label="Volume Velocity"
          value={`${assessment.volumeVelocity.toFixed(1)}x`}
          tone={assessment.volumeVelocity >= 1.5 ? 'warn' : 'neutral'}
          sub="vs baseline prints"
        />
        <StatCard
          label="Dealer Flow"
          value={
            <SignalBadge
              tone={assessment.dealerFlow === 'SUPPORTIVE' ? 'bull' : assessment.dealerFlow === 'OPPOSED' ? 'bear' : 'neutral'}
              className="text-xs"
            >
              {assessment.dealerFlow}
            </SignalBadge>
          }
          sub="net gamma inventory"
        />
      </MetricGrid>

      {/* Band 2 — scanner + chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <Panel
          title="Contract Scanner"
          subtitle={`${contracts.length} contracts`}
          flush
          className="xl:col-span-5"
          bodyClassName="flex flex-col"
        >
          <DataTable
            columns={CONTRACT_COLUMNS}
            rows={contracts}
            rowKey={row => row.id}
            selectedKey={selectedContract?.id ?? null}
            onRowClick={row => setSelectedId(row.id)}
            initialSort={{ key: 'score', dir: 'desc' }}
            maxHeight="424px"
          />
        </Panel>

        <Panel
          title="Price Structure"
          subtitle={`${plan.ticker} · spot $${marketData!.spot.toFixed(2)}`}
          className="xl:col-span-7"
          bodyClassName="flex flex-col"
        >
          <PriceChart history={marketData!.priceHistory} plan={plan} height={360} />
        </Panel>
      </div>

      {/* Band 3 — plan + reasoning */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-4 flex">
          <TradePlanCard
            plan={plan}
            assessment={assessment}
            selectedContract={selectedContract}
            onExecute={handleExecute}
          />
        </div>
        <div className="xl:col-span-8 flex">
          <ReasoningPanel factors={factors} summary={summary} />
        </div>
      </div>
    </>
  );
};

export default SkysVision;
