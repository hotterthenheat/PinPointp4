import { useMemo } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import PageHeader from '../components/ui/PageHeader';
import TickerSearch from '../components/ui/TickerSearch';
import Panel from '../components/ui/Panel';
import DataTable, { type Column } from '../components/ui/DataTable';
import type { StrikeNode } from '../types/market';

interface WallRow {
  strike: number;
  side: 'ABOVE' | 'BELOW';
  netGex: number;
  totalOI: number;
}

const WALL_COLUMNS: Column<WallRow>[] = [
  {
    key: 'strike',
    header: 'Strike',
    sortValue: r => r.strike,
    render: r => <span className="font-semibold text-textPrimary">${r.strike.toFixed(2)}</span>,
  },
  {
    key: 'side',
    header: 'Side',
    render: r => (
      <span className={r.side === 'ABOVE' ? 'text-bear' : 'text-bull'}>
        {r.side === 'ABOVE' ? 'RESISTANCE' : 'SUPPORT'}
      </span>
    ),
  },
  {
    key: 'gex',
    header: 'Net GEX',
    align: 'right',
    sortValue: r => Math.abs(r.netGex),
    render: r => (
      <span className={r.netGex >= 0 ? 'text-bull' : 'text-bear'}>{(r.netGex / 1e6).toFixed(1)}M</span>
    ),
  },
  {
    key: 'oi',
    header: 'Total OI',
    align: 'right',
    sortValue: r => r.totalOI,
    render: r => <span className="text-textSecondary">{r.totalOI.toLocaleString()}</span>,
  },
];

const PENDING_MODULES = [
  { title: 'Volatility Gravity Zones', code: 'GRAV_02' },
  { title: 'Options-Derived S/R Levels', code: 'LVLS_03' },
  { title: 'Dealer Hedging Pressure Map', code: 'PRSS_04' },
];

const LiquidityStructure = () => {
  const { activeTicker, marketData, changeTicker } = useMarketData();

  const walls = useMemo<WallRow[]>(() => {
    if (!marketData) return [];
    const { chain, spot } = marketData;
    const ranked = (nodes: StrikeNode[], side: 'ABOVE' | 'BELOW') =>
      nodes
        .sort((a, b) => Math.abs(b.netGex) - Math.abs(a.netGex))
        .slice(0, 4)
        .map(n => ({ strike: n.strike, side, netGex: n.netGex, totalOI: n.callOI + n.putOI }));
    return [
      ...ranked(chain.filter(n => n.strike > spot), 'ABOVE'),
      ...ranked(chain.filter(n => n.strike < spot), 'BELOW'),
    ];
  }, [marketData]);

  return (
    <>
      <PageHeader
        breadcrumb={['Terminal', 'Liquidity & Structure']}
        title="Market Structure"
        subtitle="Liquidity walls, gravity zones & dealer hedging pressure"
        actions={
          <TickerSearch value={activeTicker} onChange={changeTicker} />
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <Panel title="Liquidity Walls" subtitle="ranked by |net GEX|" flush className="xl:col-span-6 w-full">
          <DataTable
            columns={WALL_COLUMNS}
            rows={walls}
            rowKey={r => `${r.side}-${r.strike}`}
            initialSort={{ key: 'gex', dir: 'desc' }}
            maxHeight="380px"
            emptyText="Awaiting feed initialization…"
          />
        </Panel>

        <div className="xl:col-span-6 grid grid-cols-1 gap-4">
          {PENDING_MODULES.map(mod => (
            <Panel key={mod.code} title={mod.title} subtitle={mod.code} className="w-full">
              <div className="h-20 flex items-center justify-center border border-dashed border-borderSubtle rounded-md">
                <span className="font-mono text-[10px] text-textMuted uppercase tracking-widest">
                  Module scheduled — build phase 3
                </span>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </>
  );
};

export default LiquidityStructure;
