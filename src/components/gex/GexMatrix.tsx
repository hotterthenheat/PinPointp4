import { fmtUsd } from '../../data/gex';
import type { GexMatrixData } from '../../types/gex';

interface GexMatrixProps {
  data: GexMatrixData;
  spot: number;
}

/**
 * Strike × expiry exposure heatmap. Diverging palette: emerald (+) ↔ rose (−)
 * over the dark surface — matching the terminal's directional accents — with
 * intensity carrying magnitude. Values stay printed in every cell, so color is
 * never the only channel.
 */
const cellBg = (value: number, maxAbs: number): string => {
  const t = Math.min(1, Math.abs(value) / maxAbs);
  const alpha = 0.05 + t * 0.5;
  return value >= 0 ? `rgba(16,185,129,${alpha.toFixed(3)})` : `rgba(244,63,94,${alpha.toFixed(3)})`;
};

const GexMatrix = ({ data, spot }: GexMatrixProps) => {
  const { expiries, strikes, cells, maxAbs, spotRowIndex, callWallIndex, putWallIndex } = data;

  return (
    <div className="flex gap-2 h-full min-h-0">
      <div className="flex-grow overflow-auto min-w-0">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#0c0c0c]">
              <th className="px-2 py-1.5 text-left font-mono text-[9px] font-semibold uppercase tracking-widest text-textMuted border-b border-borderSubtle">
                Strike
              </th>
              {expiries.map((exp, i) => (
                <th
                  key={exp}
                  className={`px-2 py-1.5 text-right font-mono text-[9px] font-semibold uppercase tracking-widest border-b border-borderSubtle ${
                    i === 0 ? 'text-warn' : 'text-textMuted'
                  }`}
                >
                  {exp}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strikes.map((strike, r) => {
              const isSpot = r === spotRowIndex;
              const isCallWall = r === callWallIndex;
              const isPutWall = r === putWallIndex;
              return (
                <tr
                  key={strike}
                  className={`border-b border-borderSubtle/40 last:border-0 ${
                    isSpot ? 'shadow-[inset_2px_0_0_0_rgba(56,189,248,0.8)]' : ''
                  }`}
                >
                  <td className="px-2 py-1 font-mono text-[11px] whitespace-nowrap">
                    <span className={isSpot ? 'text-select font-bold' : 'text-textPrimary font-semibold'}>
                      {strike % 1 === 0 ? strike.toFixed(0) : strike.toFixed(2)}
                    </span>
                    {isSpot && (
                      <span className="ml-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-select">
                        spot
                      </span>
                    )}
                    {isCallWall && !isSpot && (
                      <span className="ml-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-bull">
                        cw
                      </span>
                    )}
                    {isPutWall && !isSpot && (
                      <span className="ml-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-bear">
                        pw
                      </span>
                    )}
                  </td>
                  {cells[r].map((cell, c) => (
                    <td
                      key={c}
                      style={{ backgroundColor: cellBg(cell.value, maxAbs) }}
                      className={`px-2 py-1 text-right font-mono text-[10px] tnum whitespace-nowrap text-textPrimary ${
                        cell.king ? 'shadow-[inset_0_0_0_1px_#eab308]' : ''
                      }`}
                    >
                      {cell.king && <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-[#eab308]" />}
                      {fmtUsd(cell.value)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Diverging color scale */}
      <div className="shrink-0 w-9 flex flex-col items-center py-1 select-none">
        <span className="font-mono text-[9px] text-bull tnum">+{fmtUsd(maxAbs).replace('$', '')}</span>
        <div
          className="flex-grow w-2.5 my-1.5 rounded-full border border-borderSubtle"
          style={{
            background:
              'linear-gradient(to bottom, rgba(16,185,129,0.85), rgba(16,185,129,0.12) 46%, rgba(20,20,20,1) 50%, rgba(244,63,94,0.12) 54%, rgba(244,63,94,0.85))',
          }}
        />
        <span className="font-mono text-[9px] text-bear tnum">−{fmtUsd(maxAbs).replace('$', '')}</span>
        <span className="mt-1 font-mono text-[8px] text-textMuted uppercase">gex</span>
      </div>
    </div>
  );
};

export default GexMatrix;
