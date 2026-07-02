import React from 'react';

interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Remove body padding (dense tables bleed to the edges) */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** The base dark surface every widget sits in. */
const Panel = ({ title, subtitle, actions, flush = false, className = '', bodyClassName = '', children }: PanelProps) => {
  return (
    <section className={`border border-borderSubtle bg-panel rounded-lg flex flex-col min-w-0 ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 h-10 border-b border-borderSubtle shrink-0">
          <div className="flex items-baseline gap-2 min-w-0">
            {title && (
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-textPrimary truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="font-mono text-[10px] text-textMuted uppercase tracking-wider truncate">{subtitle}</span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`${flush ? '' : 'p-4'} flex-grow min-h-0 ${bodyClassName}`}>{children}</div>
    </section>
  );
};

export default Panel;
