import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MarketDataProvider } from './context/MarketDataContext';
import Header from './components/Header';
import Home from './pages/Home';
import SkysVision from './pages/SkysVision';
import PinpointGex from './pages/PinpointGex';
import AuditorLog from './pages/AuditorLog';

const App = () => {
  return (
    <MarketDataProvider>
      <div className="text-textPrimary min-h-screen flex flex-col relative overflow-x-hidden bg-canvas">
        {/* Background Grid Mesh Overlay */}
        <div className="grid-overlay"></div>

        {/* Global Header Navigation */}
        <Header />

        {/* Main Content Router */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/skys-vision" element={<SkysVision />} />
            <Route path="/pinpoint-gex" element={<PinpointGex />} />
            <Route path="/auditor-log" element={<AuditorLog />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-borderSubtle py-8 text-center text-xs text-textSecondary relative z-10">
          <p>
            &copy; 2026 Slayer Terminal. All rights reserved. Quantitative trading involves high risk. Past performance does not guarantee future results.
          </p>
        </footer>
      </div>
    </MarketDataProvider>
  );
};

export default App;
