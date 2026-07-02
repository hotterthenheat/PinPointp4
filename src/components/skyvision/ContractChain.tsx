import Panel from '../ui/Panel';
import { toneText, type Tone } from '../ui/tones';
import type { ChainAction, ChainSide, ContractChain as ContractChainData, Momentum, OptionRight } from '../../types/skyvision';

export interface ChainSelection {
  ticker: string;
  strike: number;
  right: OptionRight;
}

interface ContractChainProps {
  data: ContractChainData;
  selected: ChainSelection | null;
  onSelect: (sel: ChainSelection) => void;
}

const momentumTone: Record<Momentum, Tone> = {
  STRENGTHENING: 'bull',
  NEUTRAL: 'neutral',
  WEAKENING: 'bear',
};

const actionStyle: Record<ChainAction, string> = {
  HOLD: 'border-borderMuted text-textSecondary',
  REDUCE: 'border-warn/30 text-warn bg-warn/5',
  SELL: 'border-bear/30 text-bear bg-bear/5',
};

const healthTone = (h: number): Tone => (h >= 62 ? 'bull' : h >= 45 ? 'neutral' : 'bear');

interface CellProps {
  side: ChainSide;
  right: OptionRight;
  strike: number;
  ticker: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ChainCell = ({ side, right, strike, ticker, isSelected, onSelect }: CellProps) => {
  const label = `${ticker} ${strike % 1 === 0 ? strike.toFixed(0) : strike.toFixed(2)}${right}`;
  const changeTone = right === 'C' ? 'text-bull' : 'text-bear';
  const premTone = right === 'C' ? 'text-textPrimary' : 'text-bear';

  return (
    <button
      onClick={onSelect}
      className={`text-left px-2.5 py-2 transition-colors ${
        isSelected ? 'bg-select/[0.07] shadow-[inset_0_0_0_1px_rgba(56,189,248,0.5)]' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-textPrimary">{label}</span>
        <span className="text-right leading-tight">
          <span className={`block font-mono text-[11px] font-semibold tnum ${premTone}`}>${side.premium.toFixed(2)}</span>
          <span className={`block font-mono text-[9px] tnum ${changeTone}`}>+{side.changePct}%</span>
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-textMuted uppercase tracking-wide">
          Health <span className={toneText[healthTone(side.health)]}>{side.health}</span>
        </span>
        <span className={`font-mono text-[9px] uppercase tracking-wide ${toneText[momentumTone[side.momentum]]}`}>
          {side.momentum}
        </span>
        <span
          className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase ${actionStyle[side.action]}`}
        >
          {side.action}
        </span>
      </div>
    </button>
  );
};

const ContractChain = ({ data, selected, onSelect }: ContractChainProps) => {
  const { ticker, spot, rows } = data;

  // Find where the live price sits so the marker embeds between strikes
  let spotRowIndex = rows.findIndex(r => r.strike > spot) - 1;
  if (spotRowIndex < -1) spotRowIndex = rows.length - 1; // spot above all strikes

  return (
    <Panel
      title="Contract Chain"
      subtitle="health · momentum · premium"
      flush
      className="w-full"
      bodyClassName="flex flex-col"
    >
      {/* Column headers */}
      <div className="grid grid-cols-2 border-b border-borderSubtle">
        <div className="px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-bull border-r border-borderSubtle">
          Calls
        </div>
        <div className="px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-bear">Puts</div>
      </div>

      <div className="overflow-y-auto max-h-[560px]">
        {rows.map((row, i) => (
          <div key={row.strike}>
            <div className="grid grid-cols-2 border-b border-borderSubtle/50 divide-x divide-borderSubtle">
              <ChainCell
                side={row.call}
                right="C"
                strike={row.strike}
                ticker={ticker}
                isSelected={selected?.strike === row.strike && selected?.right === 'C'}
                onSelect={() => onSelect({ ticker, strike: row.strike, right: 'C' })}
              />
              <ChainCell
                side={row.put}
                right="P"
                strike={row.strike}
                ticker={ticker}
                isSelected={selected?.strike === row.strike && selected?.right === 'P'}
                onSelect={() => onSelect({ ticker, strike: row.strike, right: 'P' })}
              />
            </div>

            {/* Embedded live-price marker — slides to sit under the strike it just crossed */}
            {i === spotRowIndex && (
              <div className="relative flex items-center gap-2 px-3 py-1 bg-select/[0.06] border-y border-select/30">
                <span className="h-px flex-grow bg-select/40" />
                <span className="font-mono text-[10px] font-semibold text-select tnum whitespace-nowrap">
                  ▸ {ticker} ${spot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="h-px flex-grow bg-select/40" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected footer */}
      <div className="px-3 py-2 border-t border-borderSubtle font-mono text-[10px] uppercase tracking-widest text-textMuted">
        Selected:{' '}
        <span className="text-textPrimary">
          {selected ? `${selected.ticker} ${selected.strike}${selected.right}` : '—'}
        </span>
      </div>
    </Panel>
  );
};

export default ContractChain;
