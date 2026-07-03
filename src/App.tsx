import { Routes, Route, Navigate } from 'react-router-dom';
import { MarketDataProvider } from './context/MarketDataContext';
import AppShell from './components/layout/AppShell';
import CommandCenter from './pages/CommandCenter';
import SkysVision from './pages/SkysVision';
import GexLayout from './pages/gex/GexLayout';
import FlowMap from './pages/gex/FlowMap';
import StrikeProfile from './pages/gex/StrikeProfile';
import VannaCharm from './pages/gex/VannaCharm';
import GexHistory from './pages/gex/GexHistory';
import LiquidityStructure from './pages/LiquidityStructure';
import AuditorLog from './pages/AuditorLog';

const App = () => {
  return (
    <MarketDataProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/skys-vision" element={<SkysVision />} />
          <Route path="/pinpoint-gex" element={<GexLayout />}>
            <Route index element={<Navigate to="/pinpoint-gex/flow-map" replace />} />
            <Route path="flow-map" element={<FlowMap />} />
            <Route path="strike-profile" element={<StrikeProfile />} />
            <Route path="vanna-charm" element={<VannaCharm />} />
            <Route path="history" element={<GexHistory />} />
          </Route>
          <Route path="/liquidity" element={<LiquidityStructure />} />
          <Route path="/auditor-log" element={<AuditorLog />} />
        </Route>
      </Routes>
    </MarketDataProvider>
  );
};

export default App;
