import { useState } from 'react';
import SignalBadge from '../ui/SignalBadge';
import Sparkline from './Sparkline';
import SetupCard from './SetupCard';
import type { Setup, SetupGroup } from '../../types/skyvision';

interface SetupsFeedProps {
  groups: SetupGroup[];
  shown: number;
  total: number;
  onOpenAnalysis: (setup: Setup) => void;
}

const SetupsFeed = ({ groups, shown, total, onOpenAnalysis }: SetupsFeedProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-textMuted px-0.5">
        Showing {shown} of {total} setups
      </div>

      {groups.map(group => {
        const up = group.changePct >= 0;
        return (
          <div key={group.ticker} className="border border-borderSubtle bg-panel rounded-lg overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-3 px-3 h-11 border-b border-borderSubtle">
              <span className="font-mono text-xs font-bold text-textPrimary tracking-wide">{group.ticker}</span>
              <SignalBadge tone="select">{group.found} found</SignalBadge>
              <Sparkline data={group.sparkline} up={up} />
              <span className="font-mono text-xs font-semibold text-textPrimary tnum">
                ${group.spot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="ml-auto font-mono text-[9px] text-textMuted uppercase tracking-widest">
                Strongest → Weakest
              </span>
            </div>

            {/* Setup cards */}
            <div className="p-2.5 flex flex-col gap-2">
              {group.setups.map(setup => (
                <SetupCard
                  key={setup.id}
                  setup={setup}
                  expanded={expandedId === setup.id}
                  onToggle={() => setExpandedId(prev => (prev === setup.id ? null : setup.id))}
                  onOpenAnalysis={() => onOpenAnalysis(setup)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {groups.length === 0 && (
        <div className="border border-borderSubtle bg-panel rounded-lg py-12 text-center font-mono text-[11px] text-textMuted">
          No setups meet this scanner's threshold right now
        </div>
      )}
    </div>
  );
};

export default SetupsFeed;
