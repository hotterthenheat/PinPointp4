import { useMemo, useState } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { buildStrikeProfile, fmtUsd } from '../../data/gex';
import Panel from '../../components/ui/Panel';
import SegmentedControl from '../../components/ui/SegmentedControl';
import MetricGrid from '../../components/ui/MetricGrid';
import StatCard from '../../components/ui/StatCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StrikeProfileChart from '../../components/gex/StrikeProfileChart';
import CallPutProfile from '../../components/gex/CallPutProfile';
import { heatCellStyle } from '../../components/gex/heatmap';
import type { GexMetric, ProfileRow, StrikeRange } from '../../types/gex';

const METRIC_OPTIONS = [
  { value: 'GEX', label: 'GEX' },
  { value: 'VEX', label: 'VEX' },
  { value: 'GEX+VEX', label: 'GEX+VEX' },
] as const;

const RANGE_OPTIONS = [
  { value: '10', label: '±10' },
  { value: '20', label: '±20' },
] as const;

const fmtOI = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0));

const StrikeProfile = () => {
  const { activeTicker, marketData } = useMarketData();
  const [metric, setMetric] = useState<GexMetric>('GEX');
  const [rangeKey, setRangeKey] = useState<'10' | '20'>('10');
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);

  const profile = useMemo(
    () => (marketData ? buildStrikeProfile(marketData, metric, Number(rangeKey) as StrikeRange) : null),
    [marketData, metric, rangeKey]
  );

  const columns = useMemo<Column<ProfileRow>[]>(
    () => [
      {
        key: 'strike',
        header: 'Strike',
        sortValue: r => r.strike,
        render: r => (
          <span className="inline-flex items-center gap-1.5">
            <span className={r.isSpot ? 'text-select font-bold' : 'text-textPrimary'}>
              {r.strike % 1 === 0 ? r.strike.toFixed(0) : r.strike.toFixed(2)}
            </span>
            {r.isKing && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#eab308]" />}
            {r.isSpot && <span className="text-[8px] font-bold uppercase tracking-wider text-select">spot</span>}
            {r.isCallWall && !r.isSpot && <span className="text-[8px] font-bold uppercase tracking-wider text-bull">cw</span>}
            {r.isPutWall && !r.isSpot && <span className="text-[8px] font-bold uppercase tracking-wider text-bear">pw</span>}
            {r.isFlip && !r.isSpot && <span className="text-[8px] font-bold uppercase tracking-wider text-warn">flip</span>}
          </span>
        ),
      },
      { key: 'callOI', header: 'Call OI', align: 'right', accent: 'bull', sortValue: r => r.callOI, render: r => <span className="text-textSecondary">{fmtOI(r.callOI)}</span> },
      { key: 'putOI', header: 'Put OI', align: 'right', accent: 'bear', sortValue: r => r.putOI, render: r => <span className="text-textSecondary">{fmtOI(r.putOI)}</span> },
      { key: 'call', header: `Call ${metric}`, align: 'right', accent: 'bull', sortValue: r => r.call, render: r => <span className="text-textSecondary">{fmtUsd(r.call)}</span> },
      { key: 'put', header: `Put ${metric}`, align: 'right', accent: 'bear', sortValue: r => r.put, render: r => <span className="text-textSecondary">{fmtUsd(r.put)}</span> },
      {
        key: 'net',
        header: `Net ${metric}`,
        align: 'right',
        sortValue: r => r.net,
        render: r => (
          <span
            className="inline-block px-1.5 py-0.5 rounded font-semibold"
            style={heatCellStyle(r.net, profile?.netMaxAbs ?? 1, 'emerald-rose')}
          >
            {fmtUsd(r.net)}
          </span>
        ),
      },
    ],
    [metric, profile?.netMaxAbs]
  );

  if (!profile || !marketData) {
    return (
      <Panel className="h-64" bodyClassName="flex items-center justify-center">
        <span className="font-mono text-[11px] text-textMuted uppercase tracking-widest">Awaiting feed initialization…</span>
      </Panel>
    );
  }

  const { rows, netMaxAbs, splitMaxAbs, totalCall, totalPut, netSum, levels } = profile;
  const callShare = totalCall + totalPut > 0 ? totalCall / (totalCall + totalPut) : 0.5;
  const callHeavy = callShare >= 0.5;
  const select = (strike: number) => setSelectedStrike(prev => (prev === strike ? null : strike));

  return (
    <>
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <SegmentedControl ariaLabel="Metric" options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
        <SegmentedControl ariaLabel="Strike range" options={RANGE_OPTIONS} value={rangeKey} onChange={setRangeKey} />
        <span className="font-mono text-[10px] text-textMuted uppercase tracking-wider">
          {activeTicker} · {rows.length} strikes · spot ${levels.spot.toFixed(2)}
        </span>
      </div>

      {/* Structural summary */}
      <MetricGrid min="150px">
        <StatCard label={`Net ${metric}`} value={fmtUsd(netSum)} tone={netSum >= 0 ? 'bull' : 'bear'} sub={`${rows.length} strikes · window net`} />
        <StatCard label="Gamma Flip" value={levels.flip.toFixed(2)} tone="warn" sub="regime pivot" />
        <StatCard label="Call Wall" value={levels.callWall.toFixed(2)} tone="bull" sub="upside resistance" />
        <StatCard label="Put Wall" value={levels.putWall.toFixed(2)} tone="bear" sub="downside support" />
        <StatCard
          label="Call / Put Skew"
          value={`${callHeavy ? 'Calls' : 'Puts'} ${Math.round((callHeavy ? callShare : 1 - callShare) * 100)}%`}
          tone={callHeavy ? 'bull' : 'bear'}
          sub={`of Σ|${metric}| exposure`}
        />
      </MetricGrid>

      {/* Profiles */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <Panel
          title={`Net ${metric} Profile`}
          subtitle="stabilizing (+) vs accelerating (−), strike by strike"
          flush
          className="xl:col-span-7 w-full"
          bodyClassName="h-[540px] p-2"
        >
          <StrikeProfileChart
            rows={rows}
            maxAbs={netMaxAbs}
            metricLabel={metric}
            selectedStrike={selectedStrike}
            onSelect={select}
          />
        </Panel>

        <Panel
          title={`Call vs Put — ${metric}`}
          subtitle="per-strike composition"
          flush
          className="xl:col-span-5 w-full"
          bodyClassName="h-[540px] p-2"
        >
          <CallPutProfile rows={rows} maxAbs={splitMaxAbs} selectedStrike={selectedStrike} onSelect={select} />
        </Panel>
      </div>

      {/* Detail table */}
      <Panel title="Strike Detail" subtitle="open interest & exposure — sortable" flush className="w-full" bodyClassName="p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={r => String(r.strike)}
          selectedKey={selectedStrike !== null ? String(selectedStrike) : null}
          onRowClick={r => select(r.strike)}
          initialSort={{ key: 'strike', dir: 'desc' }}
          maxHeight="420px"
        />
      </Panel>
    </>
  );
};

export default StrikeProfile;
