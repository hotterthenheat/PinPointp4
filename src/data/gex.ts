/*
==================================================
  SLAYER TERMINAL - PINPOINT GEX MODEL (gex.ts)
  Derives chart levels/nodes, the strike×expiry
  matrix and the multi-ticker flow board from the
  simulator. Placeholder data contract — swaps for
  the real dealer-flow engine / ThetaData later.
==================================================
*/

import Simulator from '../core/simulator';
import type { MarketSnapshot, StrikeNode } from '../types/market';
import type {
  BoardTicker,
  DarkPoolPrint,
  GexMatrixData,
  GexMetric,
  GexView,
  KeyLevels,
  LadderRow,
  MatrixCell,
  NodeLevel,
  ProfileRow,
  StrikeProfileData,
  StrikeRange,
} from '../types/gex';

// ---- deterministic RNG ------------------------------------------------------
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function h01(seed: string): number {
  return (hash(seed) % 1000) / 1000;
}

// ---- formatting -------------------------------------------------------------
export function fmtUsd(v: number): string {
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1)}K`;
  return `${sign}$${a.toFixed(0)}`;
}

// ---- metric extraction ------------------------------------------------------
function metricValue(node: StrikeNode, metric: GexMetric): number {
  switch (metric) {
    case 'GEX':
      return node.netGex;
    case 'VEX':
      return node.netVex * 40; // scale VEX into a comparable dollar magnitude
    case 'GEX+VEX':
      return node.netGex * 0.7 + node.netVex * 28;
  }
}

// ---- levels & nodes ---------------------------------------------------------
function buildLevels(snapshot: MarketSnapshot): KeyLevels {
  const { chain, spot, plan } = snapshot;
  let king = spot;
  let maxAbs = 0;
  for (const node of chain) {
    if (Math.abs(node.netGex) > maxAbs) {
      maxAbs = Math.abs(node.netGex);
      king = node.strike;
    }
  }
  return {
    spot,
    callWall: plan.resistanceWall,
    putWall: plan.supportWall,
    flip: plan.flipZone,
    king,
  };
}

function buildNodes(snapshot: MarketSnapshot, metric: GexMetric, range: StrikeRange): { nodes: NodeLevel[]; maxAbs: number } {
  const { chain, spot } = snapshot;
  const sorted = [...chain].sort((a, b) => a.strike - b.strike);
  const spotIdx = Math.max(0, sorted.findIndex(n => n.strike >= spot));
  const half = range === 10 ? 10 : 15; // strikes per side (chain carries 15 max)
  const start = Math.max(0, spotIdx - half);
  const window = sorted.slice(start, start + half * 2 + 1);

  let maxAbs = 1;
  const nodes = window.map(n => {
    const value = metricValue(n, metric);
    maxAbs = Math.max(maxAbs, Math.abs(value));
    return { strike: n.strike, value };
  });
  return { nodes, maxAbs };
}

// ---- strike × expiry matrix ---------------------------------------------------
const MATRIX_EXPIRIES = [
  { label: '0DTE', t: 0.003, decay: 1 },
  { label: '1D', t: 0.008, decay: 0.52 },
  { label: '2D', t: 0.012, decay: 0.38 },
  { label: '5D', t: 0.024, decay: 0.22 },
  { label: '7D', t: 0.032, decay: 0.16 },
];

function buildMatrix(snapshot: MarketSnapshot, metric: GexMetric, range: StrikeRange, kingStrike: number): GexMatrixData {
  const { ticker, chain, spot, plan } = snapshot;
  const sorted = [...chain].sort((a, b) => b.strike - a.strike); // descending
  const spotIdx = Math.max(0, sorted.findIndex(n => n.strike <= spot));
  const half = range === 10 ? 10 : 15; // strikes per side (chain carries 15 max)
  const start = Math.max(0, spotIdx - half);
  const window = sorted.slice(start, start + half * 2 + 1);

  let maxAbs = 1;

  const cells: MatrixCell[][] = window.map(node => {
    const base = metricValue(node, metric);
    return MATRIX_EXPIRIES.map((exp, c) => {
      const noise = h01(`${ticker}-${node.strike}-${exp.label}`);
      // Farther expiries decay and occasionally flip sign (charm/vanna migration)
      const flip = c > 0 && noise > 0.86 ? -1 : 1;
      const value = base * exp.decay * (0.55 + noise * 0.9) * flip;
      const abs = Math.abs(value);
      if (abs > maxAbs) maxAbs = abs;
      // King crowns the 0DTE cell at the book's max-exposure strike (matches the chart level)
      return { value, king: c === 0 && node.strike === kingStrike };
    });
  });

  const strikes = window.map(n => n.strike);
  const nearest = (target: number) => {
    let best = -1;
    let bestDist = Infinity;
    strikes.forEach((s, i) => {
      const d = Math.abs(s - target);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  return {
    expiries: MATRIX_EXPIRIES.map(e => e.label),
    strikes,
    cells,
    maxAbs,
    spotRowIndex: nearest(spot) ?? -1,
    callWallIndex: nearest(plan.resistanceWall),
    putWallIndex: nearest(plan.supportWall),
  };
}

// ---- multi-ticker flow board ---------------------------------------------------
const BOARD_LADDER_DEPTH = 9; // strikes each side of spot

function buildLadder(ticker: string, spot: number, step: number): { ladder: LadderRow[]; maxAbs: number } {
  const rows: LadderRow[] = [];
  let maxAbs = 1;
  let kingIdx = 0;
  let kingAbs = 0;

  for (let i = BOARD_LADDER_DEPTH; i >= -BOARD_LADDER_DEPTH; i--) {
    const strike = Math.round((spot + i * step) / step) * step;
    const dist = Math.abs(strike - spot) / (spot * 0.012);
    const mass = Math.exp(-dist * dist);
    const noise = h01(`${ticker}-${strike}-ladder`);
    const sign = noise > (i >= 0 ? 0.35 : 0.6) ? 1 : -1; // calls-heavy above, puts-heavy below
    const value = sign * mass * spot * 45000 * (0.3 + noise);
    const abs = Math.abs(value);
    if (abs > maxAbs) maxAbs = abs;
    if (abs > kingAbs) {
      kingAbs = abs;
      kingIdx = rows.length;
    }
    rows.push({ strike, value });
  }

  rows[kingIdx] = { ...rows[kingIdx], king: true };
  return { ladder: rows, maxAbs };
}

function buildPrints(ticker: string, spot: number): DarkPoolPrint[] {
  const count = 2 + (hash(`${ticker}-dp-count`) % 2);
  const prints: DarkPoolPrint[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const n1 = h01(`${ticker}-dp-${i}-p`);
    const n2 = h01(`${ticker}-dp-${i}-n`);
    const daysAgo = 1 + (hash(`${ticker}-dp-${i}-d`) % 12);
    const when = new Date(now.getTime() - daysAgo * 86400000);
    prints.push({
      price: Number((spot * (0.995 + n1 * 0.01)).toFixed(2)),
      notional: Number((0.8 + n2 * 3.4).toFixed(2)),
      date: `${when.getMonth() + 1}/${when.getDate()}`,
    });
  }
  return prints;
}

/** Build the multi-ticker flow board for an arbitrary, user-chosen set of tickers. */
export function buildBoard(tickers: string[]): BoardTicker[] {
  return tickers.map(raw => {
    const ticker = Simulator.ensureTicker(raw);
    const cfg = Simulator.TICKERS[ticker];
    const { ladder, maxAbs } = buildLadder(ticker, cfg.currentPrice, cfg.step);
    return {
      ticker,
      spot: cfg.currentPrice,
      changePercent: ((cfg.currentPrice - cfg.basePrice) / cfg.basePrice) * 100,
      prints: buildPrints(ticker, cfg.currentPrice),
      ladder,
      ladderMaxAbs: maxAbs,
    };
  });
}

// ---- strike profile (horizontal bar view) --------------------------------------

/** Split a node into its net value and call/put components for a given metric. */
function profileParts(node: StrikeNode, metric: GexMetric): { net: number; call: number; put: number } {
  const oi = node.callOI + node.putOI || 1;
  switch (metric) {
    case 'GEX':
      // Real dealer gamma split — calls add gamma (+), short puts subtract it (−)
      return { net: node.netGex, call: node.callGex, put: node.putGex };
    case 'VEX': {
      // Vega exposure carries no per-side field in the chain — apportion by OI share
      const net = node.netVex * 40;
      return { net, call: net * (node.callOI / oi), put: net * (node.putOI / oi) };
    }
    case 'GEX+VEX': {
      const vex = node.netVex * 28;
      const net = node.netGex * 0.7 + vex;
      return {
        net,
        call: node.callGex * 0.7 + vex * (node.callOI / oi),
        put: node.putGex * 0.7 + vex * (node.putOI / oi),
      };
    }
  }
}

/** Horizontal strike profile: net diverging bars + a call/put split, windowed to the range. */
export function buildStrikeProfile(snapshot: MarketSnapshot, metric: GexMetric, range: StrikeRange): StrikeProfileData {
  const { chain, spot, plan } = snapshot;
  const levels = buildLevels(snapshot);

  const sorted = [...chain].sort((a, b) => b.strike - a.strike); // descending
  const spotIdx = Math.max(0, sorted.findIndex(n => n.strike <= spot));
  const half = range === 10 ? 10 : 15;
  const start = Math.max(0, spotIdx - half);
  const window = sorted.slice(start, start + half * 2 + 1);

  const nearest = (target: number) => {
    let best = 0;
    let bestDist = Infinity;
    window.forEach((n, i) => {
      const d = Math.abs(n.strike - target);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };
  const spotRowIndex = nearest(spot);
  const callWallIndex = nearest(plan.resistanceWall);
  const putWallIndex = nearest(plan.supportWall);
  const flipIndex = nearest(plan.flipZone);

  let netMaxAbs = 1;
  let splitMaxAbs = 1;
  let totalCall = 0;
  let totalPut = 0;
  let netSum = 0;
  let kingIndex = 0;
  let kingAbs = 0;

  const rows: ProfileRow[] = window.map((node, i) => {
    const { net, call, put } = profileParts(node, metric);
    netMaxAbs = Math.max(netMaxAbs, Math.abs(net));
    splitMaxAbs = Math.max(splitMaxAbs, Math.abs(call), Math.abs(put));
    totalCall += Math.abs(call);
    totalPut += Math.abs(put);
    netSum += net;
    const gAbs = Math.abs(node.netGex);
    if (gAbs > kingAbs) {
      kingAbs = gAbs;
      kingIndex = i;
    }
    return {
      strike: node.strike,
      net,
      call,
      put,
      callOI: node.callOI,
      putOI: node.putOI,
      isSpot: i === spotRowIndex,
      isCallWall: i === callWallIndex,
      isPutWall: i === putWallIndex,
      isFlip: i === flipIndex,
      isKing: false,
    };
  });
  if (rows[kingIndex]) rows[kingIndex].isKing = true;

  return { rows, netMaxAbs, splitMaxAbs, totalCall, totalPut, netSum, levels };
}

// ---- top-level assembly --------------------------------------------------------
export function buildGexView(snapshot: MarketSnapshot, metric: GexMetric, range: StrikeRange): GexView {
  const levels = buildLevels(snapshot);
  const { nodes, maxAbs } = buildNodes(snapshot, metric, range);
  return {
    levels,
    nodes,
    nodesMaxAbs: maxAbs,
    matrix: buildMatrix(snapshot, metric, range, levels.king),
  };
}
