import { fmtUsd } from '../../data/gex';
import { heatRgb } from './heatmap';
import type { ProfileRow } from '../../types/gex';

interface CallPutProfileProps {
  rows: ProfileRow[];
  maxAbs: number;
  selectedStrike: number | null;
  onSelect: (strike: number) => void;
}

const rgb = (v: number, max: number) => {
  const [r, g, b] = heatRgb(v, max);
  return `rgb(${r},${g},${b})`;
};

/**
 * Per-strike composition — put-side exposure to the left of center, call-side
 * to the right. Colors follow the section's polarity ramp (call ≈ +, put ≈ −);
 * side + labels carry identity so it never relies on hue alone.
 */
const CallPutProfile = ({ rows, maxAbs, selectedStrike, onSelect }: CallPutProfileProps) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Legend */}
      <div className="flex items-center h-6 shrink-0 border-b border-borderSubtle select-none px-2 font-mono text-[9px] uppercase tracking-wider">
        <span className="w-[50px] shrink-0" />
        <span className="flex-grow flex items-center justify-between">
          <span className="flex items-center gap-1 text-textMuted">
            <span className="inline-block w-2 h-2 rounded-[2px]" style={{ backgroundColor: rgb(-maxAbs, maxAbs) }} />
            put side
          </span>
          <span className="flex items-center gap-1 text-textMuted">
            call side
            <span className="inline-block w-2 h-2 rounded-[2px]" style={{ backgroundColor: rgb(maxAbs, maxAbs) }} />
          </span>
        </span>
      </div>

      {/* Rows */}
      <div className="flex-grow overflow-y-auto min-h-0">
        {rows.map(row => {
          const callPct = Math.min(1, Math.abs(row.call) / maxAbs) * 50;
          const putPct = Math.min(1, Math.abs(row.put) / maxAbs) * 50;
          const selected = row.strike === selectedStrike;
          return (
            <button
              key={row.strike}
              onClick={() => onSelect(row.strike)}
              title={`${row.strike} · call ${fmtUsd(row.call)} · put ${fmtUsd(row.put)}`}
              className={`w-full flex items-stretch border-b border-borderSubtle/30 text-left transition-colors hover:bg-white/[0.02] ${
                selected
                  ? 'bg-select/[0.06] shadow-[inset_2px_0_0_0_rgba(56,189,248,0.75)]'
                  : row.isSpot
                    ? 'shadow-[inset_2px_0_0_0_rgba(56,189,248,0.45)]'
                    : ''
              }`}
            >
              <span
                className={`flex items-center shrink-0 w-[50px] px-2 py-[5px] bg-[#0c0c0c] border-r border-borderSubtle font-mono text-[10px] tnum ${
                  row.isSpot ? 'text-select font-bold' : 'text-textPrimary font-semibold'
                }`}
              >
                {row.strike % 1 === 0 ? row.strike.toFixed(0) : row.strike.toFixed(2)}
              </span>

              <span className="relative flex-grow h-[22px] my-[2px]">
                <span className="absolute left-1/2 top-0 bottom-0 w-px bg-borderMuted" />
                {/* put — extends left */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-[13px] rounded-[3px]"
                  style={{ backgroundColor: rgb(-Math.abs(row.put), maxAbs), width: `${putPct}%`, right: '50%' }}
                />
                {/* call — extends right */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-[13px] rounded-[3px]"
                  style={{ backgroundColor: rgb(Math.abs(row.call), maxAbs), width: `${callPct}%`, left: '50%' }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CallPutProfile;
