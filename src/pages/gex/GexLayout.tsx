import { Outlet, useLocation } from 'react-router-dom';
import { useMarketData } from '../../context/MarketDataContext';
import PageHeader from '../../components/ui/PageHeader';
import TickerSearch from '../../components/ui/TickerSearch';
import SubNav from '../../components/ui/SubNav';
import { GEX_SUBPAGES } from './subnav';

/** Section shell for Pinpoint GEX — header, ticker context and subpage tabs. */
const GexLayout = () => {
  const { activeTicker, changeTicker } = useMarketData();
  const location = useLocation();

  const active = GEX_SUBPAGES.find(page => location.pathname.startsWith(page.path)) ?? GEX_SUBPAGES[0];

  return (
    <>
      <PageHeader
        breadcrumb={['Terminal', 'Pinpoint GEX', active.label]}
        title="Pinpoint GEX"
        subtitle={active.subtitle}
        actions={<TickerSearch value={activeTicker} onChange={changeTicker} />}
      />
      <SubNav ariaLabel="Pinpoint GEX subpages" items={GEX_SUBPAGES} />
      <Outlet />
    </>
  );
};

export default GexLayout;
