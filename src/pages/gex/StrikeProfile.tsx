import Panel from '../../components/ui/Panel';

const PLANNED = [
  { title: 'GEX Bar Profile', code: 'PROF_01', detail: 'Horizontal strike-by-strike bars with gamma zones & flip line' },
  { title: 'Call / Put Breakdown', code: 'PROF_02', detail: 'Split exposure per strike with GEX / DEX / VEX toggle' },
  { title: 'Strike Detail Table', code: 'PROF_03', detail: 'OI, call GEX, put GEX and net — dense & sortable' },
];

const StrikeProfile = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {PLANNED.map(mod => (
        <Panel key={mod.code} title={mod.title} subtitle={mod.code} className="w-full">
          <div className="h-32 flex flex-col items-center justify-center gap-2 border border-dashed border-borderSubtle rounded-md px-4 text-center">
            <span className="font-mono text-[10px] text-textMuted uppercase tracking-widest">
              Module scheduled — next build
            </span>
            <span className="text-[11px] text-textSecondary leading-snug">{mod.detail}</span>
          </div>
        </Panel>
      ))}
    </div>
  );
};

export default StrikeProfile;
