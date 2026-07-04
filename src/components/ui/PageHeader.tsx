import React from 'react';

interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ breadcrumb, title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-textMuted uppercase tracking-widest mb-1.5">
          {breadcrumb.map((part, i) => (
            <React.Fragment key={part}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-textSecondary' : ''}>{part}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-textPrimary leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-textSecondary mt-1.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
};

export default PageHeader;
