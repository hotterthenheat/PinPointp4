import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './nav';

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 h-full border-r border-borderSubtle bg-inset">
      {/* Logo */}
      <div className="h-14 shrink-0 flex items-center px-4 border-b border-borderSubtle select-none">
        <span className="font-mono text-sm font-bold tracking-tight">
          <span className="text-textMuted">&gt; </span>
          <span className="text-textPrimary">slayer_terminal</span>
        </span>
        <span className="w-1.5 h-3.5 bg-textPrimary ml-1.5 custom-pulse" />
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto px-2 py-4">
        <div className="px-2.5 mb-2 font-mono text-[10px] uppercase tracking-widest text-textMuted select-none">
          Terminal
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white/[0.06] text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-white/[0.03]'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto font-mono text-[9px] text-textMuted group-hover:text-textSecondary">
                {item.code}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Status footer */}
      <div className="shrink-0 px-4 py-3 border-t border-borderSubtle flex items-center justify-between select-none">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-textSecondary">
          <span className="w-1.5 h-1.5 rounded-full bg-bull custom-pulse" />
          Sim Feed
        </span>
        <span className="font-mono text-[10px] text-textMuted">v0.2.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
