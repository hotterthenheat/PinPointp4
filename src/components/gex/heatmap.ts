import type { CSSProperties } from 'react';

/*
  Heatmap cell coloring for the GEX matrix + ladders.
  'mono'      — black↔white spectrum, gray neutral: positive glows toward
                white, negative sinks toward black; digit color flips by
                cell luminance so text never matches its box.
  'hybrid'    — mono base, but the extreme cells (top ~20% magnitude ramp)
                pick up a whisper of emerald (+) / rose (−) so the biggest
                walls announce their sign at a glance.
  'diverging' — emerald (+) / rose (−) washes on the dark surface.
  Flip HEAT_MODE to switch instantly.
*/
export type HeatMode = 'mono' | 'hybrid' | 'diverging';

// `as HeatMode` keeps TS from narrowing to the literal, so the dead-branch
// comparisons below stay legal when you flip modes.
export const HEAT_MODE = 'hybrid' as HeatMode;

const EMERALD: [number, number, number] = [16, 185, 129];
const ROSE: [number, number, number] = [244, 63, 94];
const TINT_START = 0.78; // magnitude ratio where the tint begins
const TINT_MAX = 0.5; // blend weight at full magnitude

function mixChannel(base: number, tint: number, weight: number): number {
  return Math.round(base * (1 - weight) + tint * weight);
}

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

  // mono base: neutral gray (t=0) → white for positive, black for negative
  const luminance = value >= 0 ? 0.24 + t * 0.68 : 0.24 - t * 0.22;
  const channel = Math.round(luminance * 255);
  let r = channel;
  let g = channel;
  let b = channel;

  if (HEAT_MODE === 'hybrid' && t > TINT_START) {
    const weight = ((t - TINT_START) / (1 - TINT_START)) * TINT_MAX;
    const tint = value >= 0 ? EMERALD : ROSE;
    r = mixChannel(r, tint[0], weight);
    g = mixChannel(g, tint[1], weight);
    b = mixChannel(b, tint[2], weight);
  }

  return {
    backgroundColor: `rgb(${r},${g},${b})`,
    color: luminance > 0.52 ? '#0a0a0a' : '#ededed',
  };
}

export const heatScaleGradient: string =
  HEAT_MODE === 'diverging'
    ? 'linear-gradient(to bottom, rgba(16,185,129,0.85), rgba(16,185,129,0.12) 46%, rgba(20,20,20,1) 50%, rgba(244,63,94,0.12) 54%, rgba(244,63,94,0.85))'
    : HEAT_MODE === 'hybrid'
      ? 'linear-gradient(to bottom, rgb(126,210,180), rgb(235,235,235) 14%, rgb(61,61,61) 50%, rgb(5,5,5) 86%, rgb(122,32,47))'
      : 'linear-gradient(to bottom, rgb(235,235,235), rgb(61,61,61) 50%, rgb(5,5,5))';

/** Scale end-label classes (sign already carried by the printed values). */
export const heatScaleLabels =
  HEAT_MODE === 'diverging'
    ? { pos: 'text-bull', neg: 'text-bear' }
    : { pos: 'text-textPrimary', neg: 'text-textSecondary' };
