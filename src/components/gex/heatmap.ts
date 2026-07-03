import type { CSSProperties } from 'react';

/*
  Heatmap cell coloring for the GEX matrix + ladders.
  'mono'      — black↔white spectrum, gray neutral: positive glows toward
                white, negative sinks toward black; digit color flips by
                cell luminance so text never matches its box.
  'diverging' — emerald (+) / rose (−) washes on the dark surface.
  Flip HEAT_MODE to revert instantly.
*/
export type HeatMode = 'mono' | 'diverging';

export const HEAT_MODE: HeatMode = 'mono';

export function heatCellStyle(value: number, maxAbs: number): CSSProperties {
  const t = Math.min(1, Math.abs(value) / (maxAbs || 1));

  if (HEAT_MODE === 'diverging') {
    const alpha = 0.05 + t * 0.5;
    return {
      backgroundColor:
        value >= 0 ? `rgba(16,185,129,${alpha.toFixed(3)})` : `rgba(244,63,94,${alpha.toFixed(3)})`,
      color: '#ededed',
    };
  }

  // mono: neutral gray (t=0) → white for positive, black for negative
  const luminance = value >= 0 ? 0.24 + t * 0.68 : 0.24 - t * 0.22;
  const channel = Math.round(luminance * 255);
  return {
    backgroundColor: `rgb(${channel},${channel},${channel})`,
    color: luminance > 0.52 ? '#0a0a0a' : '#ededed',
  };
}

export const heatScaleGradient: string =
  HEAT_MODE === 'mono'
    ? 'linear-gradient(to bottom, rgb(235,235,235), rgb(61,61,61) 50%, rgb(5,5,5))'
    : 'linear-gradient(to bottom, rgba(16,185,129,0.85), rgba(16,185,129,0.12) 46%, rgba(20,20,20,1) 50%, rgba(244,63,94,0.12) 54%, rgba(244,63,94,0.85))';

/** Scale end-label classes (sign already carried by the printed values). */
export const heatScaleLabels =
  HEAT_MODE === 'mono'
    ? { pos: 'text-textPrimary', neg: 'text-textSecondary' }
    : { pos: 'text-bull', neg: 'text-bear' };
