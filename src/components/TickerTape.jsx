import React from 'react';
import { useMarketData } from '../context/MarketDataContext';

const TickerTape = () => {
  const { marketData } = useMarketData();

  // Spot prices fallback if simulator hasn't ticked yet
  const getTickerPrice = (ticker, fallback) => {
    if (marketData && marketData.ticker === ticker) {
      return `$${marketData.spot.toFixed(2)}`;
    }
    return fallback;
  };

  const getTickerChange = (ticker, fallback, isPositive) => {
    if (marketData && marketData.ticker === ticker && marketData.changePercent !== undefined) {
      return `${marketData.changePercent >= 0 ? '+' : ''}${marketData.changePercent.toFixed(2)}%`;
    }
    return fallback;
  };

  const isTickerPositive = (ticker, fallbackBool) => {
    if (marketData && marketData.ticker === ticker && marketData.changePercent !== undefined) {
      return marketData.changePercent >= 0;
    }
    return fallbackBool;
  };

  const tickersList = [
    { name: 'SPY', price: getTickerPrice('SPY', '$502.40'), change: getTickerChange('SPY', '+1.42%'), positive: isTickerPositive('SPY', true) },
    { name: 'QQQ', price: getTickerPrice('QQQ', '$438.10'), change: getTickerChange('QQQ', '+1.85%'), positive: isTickerPositive('QQQ', true) },
    { name: 'AAPL', price: getTickerPrice('AAPL', '$189.45'), change: getTickerChange('AAPL', '-0.35%'), positive: isTickerPositive('AAPL', false) },
    { name: 'NVDA', price: getTickerPrice('NVDA', '$122.20'), change: getTickerChange('NVDA', '+4.80%'), positive: isTickerPositive('NVDA', true) },
    { name: 'TSLA', price: '$177.90', change: '-2.15%', positive: false },
    { name: 'MSFT', price: '$421.90', change: '+0.95%', positive: true },
    { name: 'AMD', price: '$160.50', change: '+3.20%', positive: true },
    { name: 'META', price: '$485.30', change: '+2.10%', positive: true },
    { name: 'AMZN', price: '$182.10', change: '+1.15%', positive: true },
    { name: 'NFLX', price: '$610.80', change: '-0.85%', positive: false },
    { name: 'IWM', price: '$201.20', change: '+0.45%', positive: true },
    { name: 'VIX', price: '$13.20', change: '-5.40%', positive: false }
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-borderSubtle bg-zinc-950/40 py-4 select-none z-10 my-16">
      {/* Mask gradients for fade effects on sides (Vercel style) */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent pointer-events-none z-20"></div>
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent pointer-events-none z-20"></div>

      <div className="animate-marquee flex gap-12 text-xs font-mono font-bold tracking-wider items-center">
        {/* Set 1 */}
        {tickersList.map((t, idx) => (
          <div key={`set1-${idx}`} className="flex items-center gap-2">
            <span className="text-white">{t.name}</span>
            <span className={t.positive ? 'text-gammaPos' : 'text-gammaNeg'}>
              {t.positive ? '▲' : '▼'}
            </span>
            <span className="text-zinc-400">{t.price}</span>
            <span className={t.positive ? 'text-gammaPos' : 'text-gammaNeg'}>{t.change}</span>
          </div>
        ))}
        
        {/* Set 2 (Duplicate for seamless marquee loop) */}
        {tickersList.map((t, idx) => (
          <div key={`set2-${idx}`} className="flex items-center gap-2">
            <span className="text-white">{t.name}</span>
            <span className={t.positive ? 'text-gammaPos' : 'text-gammaNeg'}>
              {t.positive ? '▲' : '▼'}
            </span>
            <span className="text-zinc-400">{t.price}</span>
            <span className={t.positive ? 'text-gammaPos' : 'text-gammaNeg'}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;
