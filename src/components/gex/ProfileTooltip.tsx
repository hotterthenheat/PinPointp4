import { fmtUsd } from '../../data/gex';
import type { ProfileRow } from '../../types/gex';

export interface ProfileHover {
  row: ProfileRow;
  x: number;
  y: number;
  /** Which side of the cursor to place the card on */
  side: 'left' | 'right';
}

const fmtOI = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0));

const rowTags = (row: ProfileRow): [string, string][] => {
  const t: [string, string][] = [];
  if (row.isSpot) t.push(['SPOT', 'text-select']);
  if (row.isKing) t.push(['KING', 'text-[#eab308]']);
  if (row.isCallWall) t.push(['CALL WALL', 'text-bull']);
  if (row.isPutWall) t.push(['PUT WALL', 'text-bear']);
  if (row.isFlip) t.push(['FLIP', 'text-warn']);
  return t;
};

interface ProfileTooltipProps {
  hover: ProfileHover;
  metricLabel: string;
}

/** Floating info card for a hovered strike — follows the cursor. */
const ProfileTooltip = ({ hover, metricLabel }: ProfileTooltipProps) => {
  const { row, x, y, side } = hover;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const W = 216;
  const H = 210;
  const OFFSET = 12;
  // Hug the cursor; put-dominant rows open to the left, call-dominant to the right
  let left = side === 'right' ? x + OFFSET : x - W - OFFSET;
  left = Math.max(8, Math.min(left, vw - W - 8));
  let top = y + OFFSET;
  if (top + H > vh) top = Math.max(8, y - H - OFFSET);
  const tags = rowTags(row);
  const callHeavy = Math.abs(row.call) >= Math.abs(row.put);

  const Line = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-textMuted uppercase tracking-wider text-[9px]">{label}</span>
      <span className={`tnum font-semibold ${tone ?? 'text-textPrimary'}`}>{value}</span>
    </div>
  );

  return (
    <div
      style={{ position: 'fixed', left, top, zIndex: 60 }}
      className="pointer-events-none w-[216px] border border-borderMuted bg-panel rounded-lg shadow-2xl shadow-black overflow-hidden animate-slide-in"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-borderSubtle bg-[#0c0c0c]">
        <span className="font-mono text-sm font-bold text-textPrimary tnum">
          {row.strike % 1 === 0 ? row.strike.toFixed(0) : row.strike.toFixed(2)}
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {tags.length === 0 ? (
            <span className="font-mono text-[8px] uppercase tracking-wider text-textMuted">strike</span>
          ) : (
            tags.map(([label, cls]) => (
              <span key={label} className={`font-mono text-[8px] font-bold uppercase tracking-wider ${cls}`}>
                {label}
              </span>
            ))
          )}
        </div>
      </div>
      <div className="px-3 py-2.5 space-y-1.5 font-mono text-[11px]">
        <Line label={`Net ${metricLabel}`} value={fmtUsd(row.net)} tone={row.net >= 0 ? 'text-bull' : 'text-bear'} />
        <div className="h-px bg-borderSubtle my-1.5" />
        <Line label={`Call ${metricLabel}`} value={fmtUsd(row.call)} tone="text-bull" />
        <Line label={`Put ${metricLabel}`} value={fmtUsd(row.put)} tone="text-bear" />
        <div className="h-px bg-borderSubtle my-1.5" />
        <Line label="Call OI" value={fmtOI(row.callOI)} />
        <Line label="Put OI" value={fmtOI(row.putOI)} />
        <div className="pt-1 flex items-center justify-between">
          <span className="text-textMuted uppercase tracking-wider text-[9px]">Dominant</span>
          <span className={`font-semibold uppercase text-[9px] tracking-wider ${callHeavy ? 'text-bull' : 'text-bear'}`}>
            {callHeavy ? 'Call side' : 'Put side'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileTooltip;
