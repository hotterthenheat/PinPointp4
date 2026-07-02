/*
==================================================
  SLAYER TERMINAL - SKY'S VISION TYPES (vision.ts)
  Contract scanner, setup grading & reasoning models
==================================================
*/

import type { TradeDirection, TradePlan } from './market';

export type SetupGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

export type ExpiryKey = '0DTE' | '1DTE' | '1W' | '1M';

export type OptionRight = 'C' | 'P';

export type FactorVerdict = 'pass' | 'fail' | 'neutral';

export type DealerFlowState = 'SUPPORTIVE' | 'OPPOSED' | 'NEUTRAL';

export interface ContractRow {
  id: string;
  contract: string;
  right: OptionRight;
  strike: number;
  dte: string;
  volumeVelocity: number;
  flowScore: number;
  score: number;
  grade: SetupGrade;
}

export interface ReasoningFactor {
  key: string;
  label: string;
  verdict: FactorVerdict;
  /** Absolute weight of this factor in the composite score */
  weight: number;
  /** Signed contribution actually applied (-weight..+weight) */
  contribution: number;
  detail: string;
}

export interface VisionAssessment {
  direction: TradeDirection;
  confidence: number;
  grade: SetupGrade;
  score: number;
  trendScore: number;
  volumeVelocity: number;
  dealerFlow: DealerFlowState;
}

export interface VisionModel {
  assessment: VisionAssessment;
  factors: ReasoningFactor[];
  contracts: ContractRow[];
  plan: TradePlan;
  summary: string;
}
