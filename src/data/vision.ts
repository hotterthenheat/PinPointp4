/*
==================================================
  SLAYER TERMINAL - SKY'S VISION MODEL (vision.ts)
  Derives scanner rows, setup grading & reasoning
  from a market snapshot. Placeholder data contract:
  swaps for the real quant engine / ThetaData later.
==================================================
*/

import type { MarketSnapshot } from '../types/market';
import type {
  ContractRow,
  DealerFlowState,
  ExpiryKey,
  OptionRight,
  ReasoningFactor,
  SetupGrade,
  VisionModel,
} from '../types/vision';

// Deterministic per-contract noise so rows stay stable across ticks
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function toGrade(quality: number): SetupGrade {
  if (quality >= 85) return 'A+';
  if (quality >= 75) return 'A';
  if (quality >= 65) return 'B+';
  if (quality >= 55) return 'B';
  if (quality >= 45) return 'C';
  return 'D';
}

const EXPIRY_META: Record<ExpiryKey, { dte: string; dampen: number }> = {
  '0DTE': { dte: '0DTE', dampen: 1 },
  '1DTE': { dte: '1DTE', dampen: 0.94 },
  '1W': { dte: '5DTE', dampen: 0.86 },
  '1M': { dte: '21DTE', dampen: 0.76 },
};

export function buildVisionModel(snapshot: MarketSnapshot, expiry: ExpiryKey): VisionModel {
  const { ticker, spot, chain, indicators, plan, tape } = snapshot;
  const step = chain.length > 1 ? Math.abs(chain[1].strike - chain[0].strike) : 1;

  // --- Factor engine -------------------------------------------------------
  const factors: ReasoningFactor[] = [];

  const emaAligned = indicators.ema9 > indicators.ema21 && indicators.ema21 > indicators.ema50;
  const emaBearish = indicators.ema9 < indicators.ema21 && indicators.ema21 < indicators.ema50;
  factors.push({
    key: 'ema',
    label: 'EMA trend alignment',
    verdict: emaAligned ? 'pass' : emaBearish ? 'fail' : 'neutral',
    weight: 20,
    contribution: emaAligned ? 20 : emaBearish ? -20 : 0,
    detail: emaAligned
      ? `9 > 21 > 50 stack (${indicators.ema9.toFixed(2)} / ${indicators.ema21.toFixed(2)} / ${indicators.ema50.toFixed(2)}) — trend regime constructive`
      : emaBearish
        ? `9 < 21 < 50 inversion (${indicators.ema9.toFixed(2)} / ${indicators.ema21.toFixed(2)} / ${indicators.ema50.toFixed(2)}) — trend regime deteriorating`
        : `EMA stack mixed (${indicators.ema9.toFixed(2)} / ${indicators.ema21.toFixed(2)} / ${indicators.ema50.toFixed(2)}) — no directional edge`,
  });

  const rsi = indicators.rsi;
  factors.push({
    key: 'rsi',
    label: 'RSI momentum (14)',
    verdict: rsi > 60 ? 'pass' : rsi < 40 ? 'fail' : 'neutral',
    weight: 15,
    contribution: rsi > 60 ? 15 : rsi < 40 ? -15 : 0,
    detail:
      rsi > 60
        ? `RSI ${rsi.toFixed(1)} — buyers in control above the 60 threshold`
        : rsi < 40
          ? `RSI ${rsi.toFixed(1)} — sellers pressing below the 40 threshold`
          : `RSI ${rsi.toFixed(1)} — neutral band, momentum not confirming`,
  });

  const inPositiveGamma = spot > plan.flipZone;
  factors.push({
    key: 'gamma',
    label: 'Gamma regime',
    verdict: inPositiveGamma ? 'pass' : 'fail',
    weight: 15,
    contribution: inPositiveGamma ? 15 : -15,
    detail: inPositiveGamma
      ? `Spot ${spot.toFixed(2)} above flip ${plan.flipZone.toFixed(2)} — dealer hedging dampens moves`
      : `Spot ${spot.toFixed(2)} below flip ${plan.flipZone.toFixed(2)} — dealer hedging accelerates moves`,
  });

  const netGexSum = chain.reduce((acc, node) => acc + node.netGex, 0);
  const grossGex = chain.reduce((acc, node) => acc + Math.abs(node.netGex), 0);
  const dealerFlow: DealerFlowState =
    grossGex > 0 && Math.abs(netGexSum) / grossGex < 0.08
      ? 'NEUTRAL'
      : netGexSum > 0
        ? 'SUPPORTIVE'
        : 'OPPOSED';
  factors.push({
    key: 'dealerflow',
    label: 'Dealer flow confirmation',
    verdict: dealerFlow === 'SUPPORTIVE' ? 'pass' : dealerFlow === 'OPPOSED' ? 'fail' : 'neutral',
    weight: 15,
    contribution: dealerFlow === 'SUPPORTIVE' ? 15 : dealerFlow === 'OPPOSED' ? -15 : 0,
    detail: `Net book GEX ${(netGexSum / 1e6).toFixed(1)}M vs ${(grossGex / 1e6).toFixed(1)}M gross — dealer inventory ${dealerFlow.toLowerCase()}`,
  });

  const avgTapeSize = tape.length > 0 ? tape.reduce((a, o) => a + o.size, 0) / tape.length : 125;
  const volumeVelocity = clamp(Number((avgTapeSize / 125).toFixed(1)), 0.3, 2.5);
  factors.push({
    key: 'velocity',
    label: 'Volume velocity',
    verdict: volumeVelocity > 1.2 ? 'pass' : volumeVelocity < 0.8 ? 'fail' : 'neutral',
    weight: 10,
    contribution: volumeVelocity > 1.2 ? 10 : volumeVelocity < 0.8 ? -10 : 0,
    detail:
      volumeVelocity > 1.2
        ? `${volumeVelocity.toFixed(1)}x relative print size — participation expanding`
        : volumeVelocity < 0.8
          ? `${volumeVelocity.toFixed(1)}x relative print size — participation thinning`
          : `${volumeVelocity.toFixed(1)}x relative print size — baseline participation`,
  });

  factors.push({
    key: 'squeeze',
    label: 'TTM squeeze',
    verdict: indicators.squeeze ? 'pass' : 'neutral',
    weight: 10,
    contribution: indicators.squeeze ? 10 : 0,
    detail: indicators.squeeze
      ? 'Bollinger inside Keltner — compression building, expansion likely'
      : 'Squeeze released — volatility already expanding',
  });

  // --- Composite score -----------------------------------------------------
  const score = clamp(50 + factors.reduce((a, f) => a + f.contribution, 0), 5, 95);
  const direction = score >= 50 ? 'BULLISH' : 'BEARISH';
  const confidence = Math.min(98, Math.round(Math.abs(score - 50) * 2 + 50));
  const quality = Math.max(score, 100 - score);
  const grade = toGrade(quality);

  const emaContribution = factors[0].contribution;
  const rsiContribution = factors[1].contribution;
  const trendScore = clamp(Math.round(50 + emaContribution * 2 + rsiContribution), 0, 100);

  // --- Contract scanner ----------------------------------------------------
  // Row score is the contract's conviction FOR the assessed direction, so grade
  // and score move together: a contract aligned with the setup (puts when bearish,
  // calls when bullish) sitting near the money grades highest.
  const { dte, dampen } = EXPIRY_META[expiry];
  const conviction = Math.max(score, 100 - score); // setup strength, either direction
  const contracts: ContractRow[] = [];
  const offsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  for (const offset of offsets) {
    const strike = Math.round((spot + offset * step) / step) * step;
    const rights: OptionRight[] = offset >= -1 && offset <= 1 ? ['C', 'P'] : offset > 1 ? ['C'] : ['P'];

    for (const right of rights) {
      const seed = `${ticker}-${strike.toFixed(2)}-${right}-${expiry}`;
      const noise = hash01(seed);
      const proximity = 1 - Math.min(1, Math.abs(strike - spot) / (step * 5)) * 0.4;
      const aligned = direction === 'BULLISH' ? right === 'C' : right === 'P';
      const alignment = aligned ? 1 : 0.42; // opposed contracts score materially lower

      const rowScore = clamp(
        Math.round(conviction * proximity * dampen * alignment + (noise - 0.5) * 6),
        5,
        98
      );

      contracts.push({
        id: seed,
        contract: `${ticker} ${strike % 1 === 0 ? strike.toFixed(0) : strike.toFixed(2)}${right}`,
        right,
        strike,
        dte,
        volumeVelocity: Number(clamp(0.5 + noise * 1.6 * proximity + (volumeVelocity - 1) * 0.5, 0.2, 3.2).toFixed(1)),
        flowScore: clamp(Math.round(rowScore * 0.7 + noise * 28), 5, 99),
        score: rowScore,
        grade: toGrade(rowScore),
      });
    }
  }

  contracts.sort((a, b) => b.score - a.score);

  // --- Narrative summary ---------------------------------------------------
  const passes = factors.filter(f => f.verdict === 'pass').length;
  const fails = factors.filter(f => f.verdict === 'fail').length;
  const dominant = [...factors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))[0];
  const summary =
    `${passes} of ${factors.length} factors aligned ${direction === 'BULLISH' ? 'long' : 'short'}, ` +
    `${fails} opposed. Dominant driver: ${dominant.label.toLowerCase()} — ${dominant.detail.split('—')[1]?.trim() ?? dominant.detail}. ` +
    `Composite ${score}/100 grades this a ${grade} ${direction.toLowerCase()} setup at ${confidence}% confidence.`;

  return {
    assessment: { direction, confidence, grade, score, trendScore, volumeVelocity, dealerFlow },
    factors,
    contracts,
    plan,
    summary,
  };
}
