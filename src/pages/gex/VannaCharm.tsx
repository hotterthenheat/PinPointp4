import Panel from '../../components/ui/Panel';

const PLANNED = [
  { title: 'Vanna Migration Heatmap', code: 'VANN_01', detail: 'Spot drift × expiry — where vol shifts push dealer hedging' },
  { title: 'Charm Decay Pressure', code: 'CHRM_02', detail: 'Delta decay by strike into the close — mechanical drift read' },
  { title: 'Migration Narrative', code: 'NARR_03', detail: 'System explanation of the dominant vanna/charm flow' },
];

const VannaCharm = () => {
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

export default VannaCharm;
