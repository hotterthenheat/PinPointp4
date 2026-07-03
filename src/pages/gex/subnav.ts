/** Pinpoint GEX subpage registry — drives the sub-tab bar and command palette. */
export interface GexSubpage {
  path: string;
  label: string;
  subtitle: string;
}

export const GEX_SUBPAGES: GexSubpage[] = [
  {
    path: '/pinpoint-gex/flow-map',
    label: 'Flow Map',
    subtitle: 'Strike-level dealer exposure — walls, flip, king node & dark pool flow',
  },
  {
    path: '/pinpoint-gex/strike-profile',
    label: 'Strike Profile',
    subtitle: 'Call/put exposure breakdown & gamma zones, strike by strike',
  },
  {
    path: '/pinpoint-gex/vanna-charm',
    label: 'Vanna & Charm',
    subtitle: 'Where dealer exposure migrates as vol and time shift',
  },
  {
    path: '/pinpoint-gex/history',
    label: 'History & Replay',
    subtitle: 'Session timeline — how walls, flip and net GEX moved',
  },
];
