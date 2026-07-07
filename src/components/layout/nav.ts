import { LayoutDashboard, Crosshair, Compass, Layers, ClipboardCheck, Bookmark, type LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  code: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Command Center',
    code: '01',
    icon: LayoutDashboard,
    description: 'Market regime, net exposures & active signals',
  },
  {
    path: '/pinpoint-gex',
    label: 'Pinpoint GEX',
    code: '02',
    icon: Crosshair,
    description: 'Strike-by-strike dealer exposure profile',
  },
  {
    path: '/skys-vision',
    label: "Sky's Vision",
    code: '03',
    icon: Compass,
    description: 'Trade cockpit — grading, plans & reasoning',
  },
  {
    path: '/liquidity',
    label: 'Liquidity & Structure',
    code: '04',
    icon: Layers,
    description: 'Walls, gravity zones & hedging pressure',
  },
  {
    path: '/auditor-log',
    label: 'Auditor Log',
    code: '05',
    icon: ClipboardCheck,
    description: 'Prediction ledger & calibration accuracy',
  },
  {
    path: '/tracker',
    label: 'Tracker',
    code: '06',
    icon: Bookmark,
    description: 'Bookmarked setups — live monitoring & tracking',
  },
];

