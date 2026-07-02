import Panel from '../ui/Panel';
import SignalBadge from '../ui/SignalBadge';
import type { TradePlan } from '../../types/market';
import type { ContractRow, VisionAssessment } from '../../types/vision';

interface TradePlanCardProps {
  plan: TradePlan;
  assessment: VisionAssessment;
  selectedContract?: ContractRow | null;
  onExecute: () => void;
}

interface LevelRowProps {
  label: string;
  value: number;
  toneClass?: string;
}

const LevelRow = ({ label, value, toneClass = 'text-textPrimary' }: LevelRowProps) => (
  <div className="flex items-center justify-between border-b border-dashed border-borderSubtle py-1.5 last:border-0">
    <span className="text-[11px] text-textSecondary">{label}</span>
    <span className={`font-mono text-xs font-semibold tnum ${toneClass}`}>${value.toFixed(2)}</span>
  </div>
);

const TradePlanCard = ({ plan, assessment, selectedContract, onExecute }: TradePlanCardProps) => {
  const bullish = plan.direction === 'BULLISH';
  const risk = Math.abs(plan.entry - plan.stopLoss);
  const reward = Math.abs(plan.target1 - plan.entry);
  const rr = risk > 0 ? reward / risk : 0;

  return (
    <Panel title="Trade Plan" subtitle={plan.ticker} className="w-full">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <SignalBadge tone={bullish ? 'bull' : 'bear'} dot>
            {plan.direction}
          </SignalBadge>
          <span className="font-mono text-[11px] text-textSecondary">
            Confidence <span className="text-textPrimary font-semibold tnum">{assessment.confidence}%</span>
          </span>
        </div>

        {selectedContract && (
          <div className="border border-borderSubtle bg-inset rounded-md px-3 py-2 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-textPrimary">{selectedContract.contract}</span>
            <span className="font-mono text-[10px] text-textSecondary uppercase">
              {selectedContract.dte} · grade {selectedContract.grade}
            </span>
          </div>
        )}

        <div className="flex flex-col">
          <LevelRow label="Entry trigger" value={plan.entry} />
          <LevelRow label="Stop loss" value={plan.stopLoss} toneClass="text-bear" />
          <LevelRow label="Target 1" value={plan.target1} toneClass="text-bull" />
          <LevelRow label="Target 2" value={plan.target2} toneClass="text-bull" />
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-textMuted uppercase tracking-wider">
          <span>
            Risk/share <span className="text-textSecondary tnum">${risk.toFixed(2)}</span>
          </span>
          <span>
            R:R <span className="text-textSecondary tnum">1 : {rr.toFixed(1)}</span>
          </span>
        </div>

        <button
          onClick={onExecute}
          className="mt-auto w-full py-2 rounded-md bg-textPrimary hover:bg-white text-black text-xs font-semibold transition-colors"
        >
          Execute Flow Hedge
        </button>
      </div>
    </Panel>
  );
};

export default TradePlanCard;
