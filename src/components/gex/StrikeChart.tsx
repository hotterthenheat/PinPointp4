import { useCallback, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type UTCTimestamp,
} from 'lightweight-charts';
import Simulator from '../../core/simulator';
import type { KeyLevels, NodeLevel, OverlayMode } from '../../types/gex';

interface StrikeChartProps {
  ticker: string;
  /** Bumped every simulator tick so the chart folds in the newest bar */
  revision: number;
  levels: KeyLevels;
  nodes: NodeLevel[];
  nodesMaxAbs: number;
  overlay: OverlayMode;
  height?: number;
}

const UP = '#10b981';
const DOWN = '#f43f5e';

/**
 * TradingView-grade candlestick chart with dealer-structure overlays.
 * Smoothness contract: the chart is created exactly once; ticks arrive as
 * series.update() on the last bar; full setData + fitContent only on ticker
 * change. Pan/zoom is never fought — no per-tick fitContent.
 */
const StrikeChart = ({ ticker, revision, levels, nodes, nodesMaxAbs, overlay, height = 460 }: StrikeChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const levelLinesRef = useRef<IPriceLine[]>([]);
  const nodeLinesRef = useRef<IPriceLine[]>([]);
  const loadedRef = useRef<{ ticker: string; length: number }>({ ticker: '', length: 0 });

  /** Recenter after the user gets lost panning/zooming: re-enable autoscale + fit data. */
  const resetView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.priceScale('right').applyOptions({ autoScale: true });
    chart.timeScale().fitContent();
  }, []);

  // Mount once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' },
        textColor: '#6b6b6b',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      rightPriceScale: { borderColor: '#1c1c1c' },
      timeScale: {
        borderColor: '#1c1c1c',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: 7,
      },
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.3)', labelBackgroundColor: '#262626' },
        horzLine: { color: 'rgba(255,255,255,0.3)', labelBackgroundColor: '#262626' },
      },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineVisible: true,
      priceLineColor: 'rgba(237,237,237,0.4)',
      priceLineStyle: LineStyle.Dotted,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: 'vol',
      priceFormat: { type: 'volume' },
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } });

    chartRef.current = chart;
    candleSeriesRef.current = candles;
    volumeSeriesRef.current = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      levelLinesRef.current = [];
      nodeLinesRef.current = [];
      loadedRef.current = { ticker: '', length: 0 };
    };
  }, []);

  // Candle data: full load on ticker change, incremental update per tick
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!chart || !candleSeries || !volumeSeries) return;

    const bars = Simulator.getCandles(ticker);
    if (!bars || bars.length === 0) return;

    const toCandle = (b: (typeof bars)[number]) => ({
      time: b.time as UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    });
    const toVolume = (b: (typeof bars)[number]) => ({
      time: b.time as UTCTimestamp,
      value: b.volume,
      color: b.close >= b.open ? 'rgba(16,185,129,0.28)' : 'rgba(244,63,94,0.28)',
    });

    const loaded = loadedRef.current;
    const tickerChanged = loaded.ticker !== ticker;
    const rolled = Math.abs(bars.length - loaded.length) > 1; // shift/seed happened

    if (tickerChanged || rolled) {
      candleSeries.setData(bars.map(toCandle));
      volumeSeries.setData(bars.map(toVolume));
      if (tickerChanged) chart.timeScale().fitContent();
      loadedRef.current = { ticker, length: bars.length };
    } else {
      // Incremental: update the live bar (also handles a single new bar roll)
      const last = bars[bars.length - 1];
      candleSeries.update(toCandle(last));
      volumeSeries.update(toVolume(last));
      loaded.length = bars.length;
    }
  }, [ticker, revision]);

  // Overlay lines: key levels + exposure nodes
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    if (!candleSeries) return;

    for (const line of levelLinesRef.current) candleSeries.removePriceLine(line);
    for (const line of nodeLinesRef.current) candleSeries.removePriceLine(line);
    levelLinesRef.current = [];
    nodeLinesRef.current = [];

    const showLevels = overlay === 'LEVELS' || overlay === 'BOTH';
    const showNodes = overlay === 'NODES' || overlay === 'BOTH';

    if (showLevels) {
      const mk = (price: number, color: string, title: string, style: LineStyle, width: 1 | 2 = 1) =>
        candleSeries.createPriceLine({ price, color, title, lineStyle: style, lineWidth: width, axisLabelVisible: true });
      levelLinesRef.current = [
        mk(levels.callWall, UP, 'CALL WALL', LineStyle.Solid),
        mk(levels.putWall, DOWN, 'PUT WALL', LineStyle.Solid),
        mk(levels.flip, '#f59e0b', 'FLIP', LineStyle.Dashed),
        mk(levels.king, '#eab308', 'KING', LineStyle.Solid, 2),
      ];
    }

    if (showNodes) {
      nodeLinesRef.current = nodes.map(node => {
        const intensity = 0.12 + 0.45 * (Math.abs(node.value) / nodesMaxAbs);
        const color =
          node.value >= 0 ? `rgba(16,185,129,${intensity.toFixed(2)})` : `rgba(244,63,94,${intensity.toFixed(2)})`;
        return candleSeries.createPriceLine({
          price: node.strike,
          color,
          title: '',
          lineStyle: LineStyle.Dotted,
          lineWidth: 1,
          axisLabelVisible: false,
        });
      });
    }
  }, [levels, nodes, nodesMaxAbs, overlay]);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Legend — identity never rides on color alone */}
      <div className="flex items-center gap-3.5 px-1 flex-wrap select-none">
        {[
          { label: 'Call Wall', cls: 'bg-bull' },
          { label: 'Put Wall', cls: 'bg-bear' },
          { label: 'Flip', cls: 'bg-warn' },
          { label: 'King', cls: 'bg-[#eab308]' },
          { label: '+GEX node', cls: 'bg-bull/40' },
          { label: '−GEX node', cls: 'bg-bear/40' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1.5 font-mono text-[10px] text-textSecondary">
            <span className={`inline-block w-3 h-0.5 rounded-full ${item.cls}`} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10px] text-textMuted uppercase tracking-wider">
          scroll to zoom · drag to pan · double-click to reset
        </span>
        <button
          onClick={resetView}
          title="Reset view (or double-click the chart)"
          className="inline-flex items-center gap-1.5 border border-borderSubtle hover:border-borderMuted bg-panel rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-textSecondary hover:text-textPrimary transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <div
        className="relative flex-grow border border-borderSubtle bg-inset rounded-md overflow-hidden"
        style={{ minHeight: height }}
        onDoubleClick={resetView}
      >
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default StrikeChart;
