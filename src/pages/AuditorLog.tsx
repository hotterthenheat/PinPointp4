import { Trash2 } from 'lucide-react';
import { useMarketData } from '../context/MarketDataContext';
import PageHeader from '../components/ui/PageHeader';
import MetricGrid from '../components/ui/MetricGrid';
import StatCard from '../components/ui/StatCard';
import Panel from '../components/ui/Panel';
import SignalBadge from '../components/ui/SignalBadge';
import DataTable, { type Column } from '../components/ui/DataTable';
import type { TradeRecord } from '../types/market';

const CLOSED_COLUMNS: Column<TradeRecord>[] = [
  {
    key: 'ticker',
    header: 'Ticker',
    render: r => <span className="font-semibold text-textPrimary">{r.ticker}</span>,
  },
  {
    key: 'dir',
    header: 'Dir',
    render: r => (
      <span className={r.direction === 'BULLISH' ? 'text-bull' : 'text-bear'}>
        {r.direction === 'BULLISH' ? 'LONG' : 'SHORT'}
      </span>
    ),
  },
  {
    key: 'entry',
    header: 'Entry',
    align: 'right',
    sortValue: r => r.entryPrice,
    render: r => <span className="text-textSecondary">${r.entryPrice.toFixed(2)}</span>,
  },
  {
    key: 'exit',
    header: 'Exit',
    align: 'right',
    render: r => <span className="text-textSecondary">${r.exitPrice?.toFixed(2) ?? '--'}</span>,
  },
  {
    key: 'acc',
    header: 'Accuracy',
    align: 'right',
    sortValue: r => r.accuracy,
    render: r => <span className="text-textSecondary">{r.accuracy}%</span>,
  },
  {
    key: 'pnl',
    header: 'P&L',
    align: 'right',
    sortValue: r => r.pnl,
    render: r => (
      <span className={r.pnl >= 0 ? 'text-bull' : 'text-bear'}>
        {r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(2)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Result',
    align: 'right',
    sortValue: r => r.status,
    render: r => <SignalBadge tone={r.status === 'WIN' ? 'bull' : r.status === 'LOSS' ? 'bear' : 'neutral'}>{r.status}</SignalBadge>,
  },
  {
    key: 'time',
    header: 'Closed',
    align: 'right',
    render: r => <span className="text-textMuted">{r.time}</span>,
  },
];

const AuditorLog = () => {
  const { auditorState, clearLedger } = useMarketData();
  const { activeTrades, closedTrades, stats } = auditorState;

  const handleReset = () => {
    if (window.confirm('Reset performance ledger and history?')) clearLedger();
  };

  const totalPnLTone = stats.totalPnL >= 0 ? 'bull' : 'bear';

  return (
    <>
      <PageHeader
        breadcrumb={['Terminal', 'Auditor Log']}
        title="Trade History & Auditor"
        subtitle="Self-auditing prediction ledger & calibration accuracy"
        actions={
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 border border-borderSubtle hover:border-borderMuted bg-panel text-textSecondary hover:text-textPrimary rounded-md px-3 py-1.5 font-mono text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Ledger
          </button>
        }
      />

      <MetricGrid min="160px">
        <StatCard
          label="Win Rate"
          value={stats.count > 0 ? `${stats.winRate}%` : '--'}
          tone={stats.winRate >= 50 ? 'bull' : 'bear'}
          sub="calibration success"
        />
        <StatCard
          label="Profit Factor"
          value={stats.count > 0 ? stats.profitFactor.toFixed(2) : '--'}
          sub="gross gain / loss"
        />
        <StatCard
          label="Avg Accuracy"
          value={stats.count > 0 ? `${stats.avgAccuracy}%` : '--'}
          sub="exit vs target"
        />
        <StatCard
          label="Total P&L"
          value={stats.count > 0 ? `${stats.totalPnL >= 0 ? '+' : ''}$${stats.totalPnL.toFixed(0)}` : '--'}
          tone={totalPnLTone}
          sub={`${stats.count} closed`}
        />
      </MetricGrid>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <Panel title="Active Exposures" subtitle="open positions" flush className="xl:col-span-4 w-full">
          <div className="max-h-[420px] overflow-y-auto">
            {activeTrades.length === 0 ? (
              <div className="px-4 py-10 text-center font-mono text-[11px] text-textMuted">No active exposures</div>
            ) : (
              activeTrades.map(trade => (
                <div key={trade.id} className="px-4 py-3 border-b border-borderSubtle/60 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-textPrimary">{trade.ticker}</span>
                      <SignalBadge tone={trade.direction === 'BULLISH' ? 'bull' : 'bear'}>
                        {trade.direction}
                      </SignalBadge>
                    </span>
                    <span className={`font-mono text-xs font-semibold tnum ${trade.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 font-mono text-[10px] text-textMuted">
                    <span>
                      Ent ${trade.entryPrice.toFixed(2)} → Tgt ${trade.target.toFixed(2)}
                    </span>
                    <span>SL ${trade.stopLoss.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Historical Audit Log" subtitle={`${closedTrades.length} records`} flush className="xl:col-span-8 w-full">
          <DataTable
            columns={CLOSED_COLUMNS}
            rows={closedTrades}
            rowKey={r => r.id}
            initialSort={{ key: 'time', dir: 'desc' }}
            maxHeight="420px"
            emptyText="No logged trials"
          />
        </Panel>
      </div>
    </>
  );
};

export default AuditorLog;
