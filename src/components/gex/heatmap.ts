import type { CSSProperties } from 'react';

/*
  Heatmap cell coloring for the GEX matrix + ladders.

  'spectrum'  — diverging Coolors palette: positive glows through periwinkle
                → blue → cyan, negative through pale pink → plum, gray neutral
                at zero. Digit color flips by cell luminance.
  'hybrid'    — mono base, extreme cells pick up a whisper of emerald/rose.
  'mono'      — black↔white spectrum, gray neutral.
  'diverging' — emerald (+) / rose (−) washes.

  Flip HEAT_MODE to switch instantly.
*/
export type HeatMode = 'spectrum' | 'hybrid' | 'mono' | 'diverging';

// `as HeatMode` stops TS from narrowing to the literal so the other branches stay legal.
export const HEAT_MODE = 'spectrum' as HeatMode;

type RGB = [number, number, number];

const NEUTRAL: RGB = [42, 42, 42]; // dark gray — sits calmly on the panel surface

// Diverging ramp stops from neutral (t=0) → extreme (t=1), per the Coolors palette
const POS_STOPS: [number, RGB][] = [
  [0.0, NEUTRAL],
  [0.4, [137, 161, 239]], // 89A1EF · periwinkle
  [0.7, [0, 165, 224]], //   00A5E0 · fresh sky
  [1.0, [50, 203, 255]], //  32CBFF · sky aqua
];
const NEG_STOPS: [number, RGB][] = [
  [0.0, NEUTRAL],
  [0.4, [254, 206, 241]], // FECEF1 · petal frost
  [1.0, [239, 156, 218]], // EF9CDA · plum
];

function lerp(a: number, b: number, u: number): number {
  return Math.round(a + (b - a) * u);
}

function rampColor(stops: [number, RGB][], t: number): RGB {
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0 || 1);
      return [lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u), lerp(c0[2], c1[2], u)];
    }
  }
  return stops[stops.length - 1][1];
}

function perceivedLuminance([r, g, b]: RGB): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const EMERALD: RGB = [16, 185, 129];
const ROSE: RGB = [244, 63, 94];
const TINT_START = 0.78;
const TINT_MAX = 0.5;

export function heatCellStyle(value: number, maxAbs: number): CSSProperties {
  const t = Math.min(1, Math.abs(value) / (maxAbs || 1));

  if (HEAT_MODE === 'spectrum') {
    const rgb = rampColor(value >= 0 ? POS_STOPS : NEG_STOPS, t);
    return {
      backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`,
      color: perceivedLuminance(rgb) > 0.58 ? '#0a0a0a' : '#ededed',
    };
  }

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
    r = lerp(r, tint[0], weight);
    g = lerp(g, tint[1], weight);
    b = lerp(b, tint[2], weight);
  }

  return {
    backgroundColor: `rgb(${r},${g},${b})`,
    color: luminance > 0.52 ? '#0a0a0a' : '#ededed',
  };
}

export const heatScaleGradient: string =
  HEAT_MODE === 'spectrum'
    ? 'linear-gradient(to bottom, #32CBFF 0%, #00A5E0 18%, #89A1EF 38%, #2a2a2a 50%, #FECEF1 72%, #EF9CDA 100%)'
    : HEAT_MODE === 'diverging'
      ? 'linear-gradient(to bottom, rgba(16,185,129,0.85), rgba(16,185,129,0.12) 46%, rgba(20,20,20,1) 50%, rgba(244,63,94,0.12) 54%, rgba(244,63,94,0.85))'
      : HEAT_MODE === 'hybrid'
        ? 'linear-gradient(to bottom, rgb(126,210,180), rgb(235,235,235) 14%, rgb(61,61,61) 50%, rgb(5,5,5) 86%, rgb(122,32,47))'
        : 'linear-gradient(to bottom, rgb(235,235,235), rgb(61,61,61) 50%, rgb(5,5,5))';

/** Scale end-label classes (sign already carried by the printed values). */
export const heatScaleLabels =
  HEAT_MODE === 'diverging' ? { pos: 'text-bull', neg: 'text-bear' } : { pos: 'text-textPrimary', neg: 'text-textSecondary' };
