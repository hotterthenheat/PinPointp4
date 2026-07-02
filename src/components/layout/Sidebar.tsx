import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NAV_ITEMS } from './nav';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-full border-r border-borderSubtle bg-inset transition-[width] duration-200 ease-out ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Logo / collapse toggle */}
      <div className="h-14 shrink-0 flex items-center px-3 border-b border-borderSubtle select-none">
        {!collapsed && (
          <span className="font-mono text-sm font-bold tracking-tight truncate">
            <span className="text-textMuted">&gt; </span>
            <span className="text-textPrimary">slayer_terminal</span>
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`text-textMuted hover:text-textPrimary transition-colors ${collapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto px-2 py-4">
        {!collapsed && (
          <div className="px-2.5 mb-2 font-mono text-[10px] uppercase tracking-widest text-textMuted select-none">
            Terminal
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-colors ${
                  collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2'
                } ${
                  isActive
                    ? 'bg-white/[0.06] text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-white/[0.03]'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto font-mono text-[9px] text-textMuted group-hover:text-textSecondary">
                    {item.code}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Status footer */}
      <div
        className={`shrink-0 py-3 border-t border-borderSubtle flex items-center select-none ${
          collapsed ? 'justify-center px-0' : 'justify-between px-4'
        }`}
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-textSecondary">
          <span className="w-1.5 h-1.5 rounded-full bg-bull custom-pulse" />
          {!collapsed && 'Sim Feed'}
        </span>
        {!collapsed && <span className="font-mono text-[10px] text-textMuted">v0.2.0</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
