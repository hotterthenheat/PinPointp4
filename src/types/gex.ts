/*
==================================================
  SLAYER TERMINAL - PINPOINT GEX TYPES (gex.ts)
  Strike chart overlays, strike×expiry matrix,
  multi-ticker flow board & dark pool prints
==================================================
*/

export type GexMetric = 'GEX' | 'VEX' | 'GEX+VEX';

export type OverlayMode = 'NODES' | 'LEVELS' | 'BOTH';

export type StrikeRange = 10 | 20;

/** Key dealer-structure price levels drawn on the strike chart. */
export interface KeyLevels {
  spot: number;
  callWall: number;
  putWall: number;
  flip: number;
  /** Strike holding the largest absolute exposure */
  king: number;
}

/** One horizontal exposure node on the price axis. */
export interface NodeLevel {
  strike: number;
  /** Signed metric value in dollars */
  value: number;
}

export interface MatrixCell {
  value: number;
  king?: boolean;
}

export interface GexMatrixData {
  /** Column labels, nearest expiry first (e.g. 0DTE, 1D, …) */
  expiries: string[];
  /** Row strikes, descending */
  strikes: number[];
  /** cells[rowIndex][colIndex] */
  cells: MatrixCell[][];
  maxAbs: number;
  spotRowIndex: number;
  callWallIndex: number;
  putWallIndex: number;
}

export interface DarkPoolPrint {
  price: number;
  /** Notional in $B */
  notional: number;
  date: string;
}

export interface LadderRow {
  strike: number;
  value: number;
  king?: boolean;
}

export interface BoardTicker {
  ticker: string;
  spot: number;
  changePercent: number;
  prints: DarkPoolPrint[];
  ladder: LadderRow[];
  ladderMaxAbs: number;
}

export interface GexView {
  levels: KeyLevels;
  nodes: NodeLevel[];
  nodesMaxAbs: number;
  matrix: GexMatrixData;
}

/** One strike row of the Strike Profile — net exposure plus its call/put split. */
export interface ProfileRow {
  strike: number;
  /** Signed net metric ($) */
  net: number;
  /** Call-side component ($, typically positive) */
  call: number;
  /** Put-side component ($, typically negative) */
  put: number;
  callOI: number;
  putOI: number;
  isSpot: boolean;
  isCallWall: boolean;
  isPutWall: boolean;
  isFlip: boolean;
  isKing: boolean;
}

export interface StrikeProfileData {
  /** Descending strike order (high strike first) */
  rows: ProfileRow[];
  /** Max |net| across rows — normalizes the diverging profile */
  netMaxAbs: number;
  /** Max of |call| and |put| across rows — normalizes the split */
  splitMaxAbs: number;
  /** Σ|call| and Σ|put| for the skew readout */
  totalCall: number;
  totalPut: number;
  /** Σ net across the window */
  netSum: number;
  levels: KeyLevels;
}
