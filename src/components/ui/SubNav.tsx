import { NavLink } from 'react-router-dom';

export interface SubNavItem {
  path: string;
  label: string;
}

interface SubNavProps {
  items: SubNavItem[];
  ariaLabel?: string;
}

/** Route-driven sub-page tabs — same visual language as SegmentedControl. */
const SubNav = ({ items, ariaLabel }: SubNavProps) => {
  return (
    <nav
      aria-label={ariaLabel}
      className="inline-flex items-center border border-borderSubtle bg-panel rounded-md overflow-hidden"
    >
      {items.map((item, i) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap hover:bg-white hover:text-black ${
              i > 0 ? 'border-l border-borderSubtle' : ''
            } ${isActive ? 'bg-select/[0.08] text-select' : 'text-textSecondary'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default SubNav;
