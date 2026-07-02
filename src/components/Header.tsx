import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMarketData } from '../context/MarketDataContext';
import { ChevronDown, Compass, BarChart2, CheckSquare, ArrowRight } from 'lucide-react';

const Header = () => {
  const { isConsoleLaunched, setIsConsoleLaunched } = useMarketData();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogoClick = () => {
    setIsConsoleLaunched(false);
  };

  const handleHeaderBtnClick = () => {
    if (location.pathname === '/') {
      setIsConsoleLaunched(!isConsoleLaunched);
    } else {
      setIsConsoleLaunched(false);
    }
  };

  return (
    <header className="border-b border-borderSubtle bg-canvas/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex items-center font-mono text-lg font-bold tracking-tight select-none"
        >
          <span className="text-zinc-500 mr-1">&gt;</span>
          <span className="text-white">slayer_terminal</span>
          <span className="w-2 h-4.5 bg-white ml-1.5 custom-pulse shadow-[0_0_8px_#ffffff]"></span>
        </Link>
        
        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          {/* Dropdown link */}
          <div className="relative group py-2">
            <button className="text-textSecondary hover:text-textPrimary text-sm font-medium transition-colors flex items-center gap-1 focus:outline-none">
              Features <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </button>
            {/* Dropdown Menu Container (with contiguous hover bridge) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 hidden group-hover:block z-50">
              {/* Actual Styled Menu Panel */}
              <div className="bg-panel border border-borderSubtle rounded-lg shadow-2xl p-2 flex flex-col gap-1 w-full animate-slide-in">
                <Link 
                  to="/skys-vision" 
                  onClick={handleLogoClick}
                  className={`flex flex-col p-3 rounded-md transition-all border border-transparent hover:border-silver/20 group/item ${
                    isActive('/skys-vision') ? 'bg-zinc-900/40 border-silver/20' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Compass className={`w-4 h-4 ${isActive('/skys-vision') ? 'text-silver' : 'text-zinc-400 group-hover/item:text-silver'}`} />
                      Sky's Vision
                    </span>
                    <ArrowRight className={`w-3 h-3 transition-transform -translate-x-1 ${isActive('/skys-vision') ? 'text-silver' : 'text-transparent group-hover/item:text-silver group-hover/item:translate-x-0'}`} />
                  </span>
                  <span className="text-[10px] text-textSecondary mt-0.5 leading-relaxed">Quantitative indicators & calibration parameters.</span>
                </Link>

                <Link 
                  to="/pinpoint-gex" 
                  onClick={handleLogoClick}
                  className={`flex flex-col p-3 rounded-md transition-all border border-transparent hover:border-silver/20 group/item ${
                    isActive('/pinpoint-gex') ? 'bg-zinc-900/40 border-silver/20' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart2 className={`w-4 h-4 ${isActive('/pinpoint-gex') ? 'text-silver' : 'text-zinc-400 group-hover/item:text-silver'}`} />
                      Pinpoint (GEX)
                    </span>
                    <ArrowRight className={`w-3 h-3 transition-transform -translate-x-1 ${isActive('/pinpoint-gex') ? 'text-silver' : 'text-transparent group-hover/item:text-silver group-hover/item:translate-x-0'}`} />
                  </span>
                  <span className="text-[10px] text-textSecondary mt-0.5 leading-relaxed">Options strike-by-strike GEX exposure profiles.</span>
                </Link>

                <Link 
                  to="/auditor-log" 
                  onClick={handleLogoClick}
                  className={`flex flex-col p-3 rounded-md transition-all border border-transparent hover:border-silver/20 group/item ${
                    isActive('/auditor-log') ? 'bg-zinc-900/40 border-silver/20' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckSquare className={`w-4 h-4 ${isActive('/auditor-log') ? 'text-silver' : 'text-zinc-400 group-hover/item:text-silver'}`} />
                      Trade History / Auditor Log
                    </span>
                    <ArrowRight className={`w-3 h-3 transition-transform -translate-x-1 ${isActive('/auditor-log') ? 'text-silver' : 'text-transparent group-hover/item:text-silver group-hover/item:translate-x-0'}`} />
                  </span>
                  <span className="text-[10px] text-textSecondary mt-0.5 leading-relaxed">Immutable ledger metrics & performance stats.</span>
                </Link>
              </div>
            </div>
          </div>
          
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="text-textSecondary hover:text-textPrimary text-sm font-medium transition-colors"
          >
            Platform
          </Link>
          <a href="#pricing" className="text-textSecondary hover:text-textPrimary text-sm font-medium transition-colors">Pricing</a>
          <a href="https://discord.gg/" target="_blank" rel="noreferrer" className="text-textSecondary hover:text-textPrimary text-sm font-medium transition-colors">Discord</a>
        </div>
        
        {/* Dynamic Launch Console / Home View Button */}
        <div className="flex items-center gap-4">
          {location.pathname === '/' ? (
            <button 
              onClick={handleHeaderBtnClick}
              className="bg-white hover:bg-silver text-black border border-white/10 text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
            >
              {isConsoleLaunched ? 'Home View' : 'Launch Console'}
            </button>
          ) : (
            <Link 
              to="/" 
              onClick={handleHeaderBtnClick}
              className="bg-white hover:bg-silver text-black border border-white/10 text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm text-center"
            >
              Home View
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
