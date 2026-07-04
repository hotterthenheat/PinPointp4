import { fmtUsd } from '../../data/gex';
import { heatRgb } from './heatmap';
import type { ProfileRow } from '../../types/gex';

interface StrikeProfileChartProps {
  rows: ProfileRow[];
  maxAbs: number;
  /** GEX / VEX / GEX+VEX — labels the poles */
  metricLabel: string;
  selectedStrike: number | null;
  onSelect: (strike: number) => void;
}

const rgb = (v: number, max: number) => {
  const [r, g, b] = heatRgb(v, max);
  return `rgb(${r},${g},${b})`;
};

/**
 * Net dealer exposure as a diverging horizontal profile — one bar per strike,
 * stabilizing (+) to the right, accelerating (−) to the left. Same cyan/pink
 * polarity encoding as the rest of the GEX section; key levels are tagged.
 */
const StrikeProfileChart = ({ rows, maxAbs, metricLabel, selectedStrike, onSelect }: StrikeProfileChartProps) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Pole header */}
      <div className="flex items-center h-6 shrink-0 border-b border-borderSubtle select-none">
        <span className="w-[58px] shrink-0" />
        <div className="relative flex-grow px-2">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wider text-textMuted">
            − {metricLabel}
          </span>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[8px] text-textMuted">
            0
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wider text-textMuted">
            {metricLabel} +
          </span>
        </div>
        <span className="w-[64px] shrink-0 text-right pr-2 font-mono text-[9px] uppercase tracking-wider text-textMuted">
          net
        </span>
      </div>

      {/* Rows */}
      <div className="flex-grow overflow-y-auto min-h-0">
        {rows.map(row => {
          const pct = Math.min(1, Math.abs(row.net) / maxAbs) * 50;
          const pos = row.net >= 0;
          const selected = row.strike === selectedStrike;
          const tag = row.isSpot ? null : row.isCallWall ? 'CW' : row.isPutWall ? 'PW' : row.isFlip ? 'FLIP' : null;
          const tagColor = row.isCallWall ? 'text-bull' : row.isPutWall ? 'text-bear' : 'text-warn';
          return (
            <button
              key={row.strike}
              onClick={() => onSelect(row.strike)}
              title={`${row.strike} · net ${fmtUsd(row.net)} · call ${fmtUsd(row.call)} · put ${fmtUsd(row.put)}`}
              className={`w-full flex items-stretch border-b border-borderSubtle/30 text-left transition-colors hover:bg-white/[0.02] ${
                selected
                  ? 'bg-select/[0.06] shadow-[inset_2px_0_0_0_rgba(56,189,248,0.75)]'
                  : row.isSpot
                    ? 'shadow-[inset_2px_0_0_0_rgba(56,189,248,0.45)]'
                    : ''
              }`}
            >
              {/* Strike gutter — dark & separate */}
              <span
                className={`flex items-center gap-1 shrink-0 w-[58px] px-2 py-[5px] bg-[#0c0c0c] border-r border-borderSubtle font-mono text-[10px] tnum ${
                  row.isSpot ? 'text-select font-bold' : 'text-textPrimary font-semibold'
                }`}
              >
                {row.strike % 1 === 0 ? row.strike.toFixed(0) : row.strike.toFixed(2)}
                {row.isKing && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#eab308]" />}
              </span>

              {/* Diverging track */}
              <span className="relative flex-grow h-[22px] my-[2px]">
                <span className="absolute left-1/2 top-0 bottom-0 w-px bg-borderMuted" />
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-[13px] rounded-[3px]"
                  style={{
                    backgroundColor: rgb(row.net, maxAbs),
                    width: `${pct}%`,
                    ...(pos ? { left: '50%' } : { right: '50%' }),
                  }}
                />
                {tag && (
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 font-mono text-[8px] font-bold uppercase tracking-wider ${tagColor}`}
                    style={pos ? { right: '50%', marginRight: 4 } : { left: '50%', marginLeft: 4 }}
                  >
                    {tag}
                  </span>
                )}
              </span>

              {/* Net value */}
              <span className="flex items-center justify-end shrink-0 w-[64px] pr-2 font-mono text-[10px] tnum text-textSecondary">
                {fmtUsd(row.net)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StrikeProfileChart;
