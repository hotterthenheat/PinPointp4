import { Check, Minus, X } from 'lucide-react';
import Panel from '../ui/Panel';
import { toneBar } from '../ui/tones';
import type { ReasoningFactor } from '../../types/vision';

interface ReasoningPanelProps {
  factors: ReasoningFactor[];
  summary: string;
}

const verdictIcon = {
  pass: <Check className="w-3.5 h-3.5 text-bull" />,
  fail: <X className="w-3.5 h-3.5 text-bear" />,
  neutral: <Minus className="w-3.5 h-3.5 text-textMuted" />,
};

const verdictBar = {
  pass: toneBar.bull,
  fail: toneBar.bear,
  neutral: toneBar.neutral,
};

const ReasoningPanel = ({ factors, summary }: ReasoningPanelProps) => {
  const maxWeight = Math.max(...factors.map(f => f.weight), 1);

  return (
    <Panel title="Grading Rationale" subtitle="factor engine" flush className="w-full">
      <div className="px-4 py-3 border-b border-borderSubtle text-xs text-textSecondary leading-relaxed">
        {summary}
      </div>
      <div>
        {factors.map(factor => (
          <div
            key={factor.key}
            className="grid grid-cols-[16px_170px_1fr_72px_44px] items-center gap-3 px-4 py-2.5 border-b border-borderSubtle/60 last:border-0"
          >
            <span>{verdictIcon[factor.verdict]}</span>
            <span className="text-xs font-medium text-textPrimary truncate">{factor.label}</span>
            <span className="text-[11px] text-textSecondary truncate" title={factor.detail}>
              {factor.detail}
            </span>
            <span className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <span
                className={`block h-full rounded-full ${verdictBar[factor.verdict]}`}
                style={{ width: `${(factor.weight / maxWeight) * 100}%` }}
              />
            </span>
            <span
              className={`font-mono text-[11px] font-semibold text-right tnum ${
                factor.contribution > 0 ? 'text-bull' : factor.contribution < 0 ? 'text-bear' : 'text-textMuted'
              }`}
            >
              {factor.contribution > 0 ? '+' : ''}
              {factor.contribution}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default ReasoningPanel;
