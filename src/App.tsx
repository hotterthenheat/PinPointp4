import { Routes, Route } from 'react-router-dom';
import { MarketDataProvider } from './context/MarketDataContext';
import AppShell from './components/layout/AppShell';
import CommandCenter from './pages/CommandCenter';
import SkysVision from './pages/SkysVision';
import PinpointGex from './pages/PinpointGex';
import LiquidityStructure from './pages/LiquidityStructure';
import AuditorLog from './pages/AuditorLog';

const App = () => {
  return (
    <MarketDataProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/skys-vision" element={<SkysVision />} />
          <Route path="/pinpoint-gex" element={<PinpointGex />} />
          <Route path="/liquidity" element={<LiquidityStructure />} />
          <Route path="/auditor-log" element={<AuditorLog />} />
        </Route>
      </Routes>
    </MarketDataProvider>
  );
};

export default App;
