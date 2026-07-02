import { useEffect, useRef } from 'react';
import {
  createChart,
  AreaSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { TradePlan } from '../../types/market';

interface PriceChartProps {
  history: number[];
  plan: TradePlan | null;
  height?: number;
}

const LEGEND = [
  { label: 'Spot', className: 'bg-textPrimary' },
  { label: 'EMA 9', className: 'bg-white/45' },
  { label: 'EMA 21', className: 'bg-white/20' },
];

function computeEma(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  for (const v of values) {
    prev = v * k + prev * (1 - k);
    out.push(Number(prev.toFixed(2)));
  }
  return out;
}

/** Live price chart with EMA overlays and trade-plan level lines. */
const PriceChart = ({ history, plan, height = 320 }: PriceChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const spotSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const timesRef = useRef<number[]>([]);

  // Mount chart once
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
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      rightPriceScale: { borderColor: '#1c1c1c' },
      timeScale: {
        borderColor: '#1c1c1c',
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 2,
      },
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.25)', labelBackgroundColor: '#1c1c1c' },
        horzLine: { color: 'rgba(255,255,255,0.25)', labelBackgroundColor: '#1c1c1c' },
      },
      handleScroll: false,
      handleScale: false,
    });

    const spotSeries = chart.addSeries(AreaSeries, {
      lineColor: '#ededed',
      lineWidth: 2,
      topColor: 'rgba(237, 237, 237, 0.10)',
      bottomColor: 'rgba(237, 237, 237, 0)',
      priceLineVisible: false,
      lastValueVisible: true,
    });
    const ema9Series = chart.addSeries(LineSeries, {
      color: 'rgba(255, 255, 255, 0.45)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    const ema21Series = chart.addSeries(LineSeries, {
      color: 'rgba(255, 255, 255, 0.20)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    // Crosshair tooltip: one readout, every series (values via textContent)
    chart.subscribeCrosshairMove(param => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const spotPoint = param.seriesData.get(spotSeries) as { value?: number } | undefined;
      if (!param.point || !param.time || spotPoint?.value === undefined) {
        tooltip.style.display = 'none';
        return;
      }
      const ema9Point = param.seriesData.get(ema9Series) as { value?: number } | undefined;
      const ema21Point = param.seriesData.get(ema21Series) as { value?: number } | undefined;

      const [spotEl, ema9El, ema21El] = Array.from(tooltip.querySelectorAll('[data-value]'));
      if (spotEl) spotEl.textContent = `$${spotPoint.value.toFixed(2)}`;
      if (ema9El) ema9El.textContent = ema9Point?.value !== undefined ? `$${ema9Point.value.toFixed(2)}` : '--';
      if (ema21El) ema21El.textContent = ema21Point?.value !== undefined ? `$${ema21Point.value.toFixed(2)}` : '--';

      tooltip.style.display = 'block';
      const bounds = container.getBoundingClientRect();
      const left = Math.min(Math.max(param.point.x + 12, 4), bounds.width - 128);
      const top = Math.min(Math.max(param.point.y + 12, 4), bounds.height - 88);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    chartRef.current = chart;
    spotSeriesRef.current = spotSeries;
    ema9SeriesRef.current = ema9Series;
    ema21SeriesRef.current = ema21Series;

    return () => {
      chart.remove();
      chartRef.current = null;
      spotSeriesRef.current = null;
      ema9SeriesRef.current = null;
      ema21SeriesRef.current = null;
      priceLinesRef.current = [];
      timesRef.current = [];
    };
  }, []);

  // Push data on every tick
  useEffect(() => {
    const chart = chartRef.current;
    const spotSeries = spotSeriesRef.current;
    const ema9Series = ema9SeriesRef.current;
    const ema21Series = ema21SeriesRef.current;
    if (!chart || !spotSeries || !ema9Series || !ema21Series || history.length === 0) return;

    // Maintain a strictly-increasing wall-clock timeline aligned to the sliding window
    const nowSec = Math.floor(Date.now() / 1000);
    const times = timesRef.current;
    if (times.length === 0) {
      for (let i = 0; i < history.length; i++) {
        times.push(nowSec - (history.length - 1 - i) * 2);
      }
    } else {
      times.push(Math.max(times[times.length - 1] + 1, nowSec));
      while (times.length > history.length) times.shift();
      while (times.length < history.length) times.unshift(times[0] - 2);
    }

    const toPoints = (values: number[]) =>
      values.map((value, i) => ({ time: times[i] as UTCTimestamp, value }));

    const ema9 = computeEma(history, 9);
    const ema21 = computeEma(history, 21);

    spotSeries.setData(toPoints(history));
    ema9Series.setData(toPoints(ema9));
    ema21Series.setData(toPoints(ema21));
    chart.timeScale().fitContent();

    // Refresh plan level lines
    for (const line of priceLinesRef.current) spotSeries.removePriceLine(line);
    priceLinesRef.current = [];
    if (plan) {
      const mk = (price: number, color: string, title: string, style: LineStyle) =>
        spotSeries.createPriceLine({ price, color, lineWidth: 1, lineStyle: style, axisLabelVisible: true, title });
      priceLinesRef.current = [
        mk(plan.entry, 'rgba(255, 255, 255, 0.5)', 'ENTRY', LineStyle.Dashed),
        mk(plan.stopLoss, '#f43f5e', 'STOP', LineStyle.Dashed),
        mk(plan.target1, '#10b981', 'T1', LineStyle.Dashed),
        mk(plan.target2, '#10b981', 'T2', LineStyle.Dotted),
      ];
    }
  }, [history, plan]);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Legend — identity never rides on color alone */}
      <div className="flex items-center gap-4 px-1 select-none">
        {LEGEND.map(item => (
          <span key={item.label} className="flex items-center gap-1.5 font-mono text-[10px] text-textSecondary">
            <span className={`inline-block w-3 h-0.5 rounded-full ${item.className}`} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10px] text-textMuted uppercase tracking-wider">
          Live tick feed · plan levels on axis
        </span>
      </div>
      <div className="relative flex-grow border border-borderSubtle bg-inset rounded-md overflow-hidden" style={{ minHeight: height }}>
        <div ref={containerRef} className="absolute inset-0" />
        <div
          ref={tooltipRef}
          style={{ display: 'none' }}
          className="absolute z-10 pointer-events-none border border-borderMuted bg-[#0c0c0c]/95 rounded-md px-2.5 py-2 shadow-xl"
        >
          {LEGEND.map(item => (
            <div key={item.label} className="flex items-center gap-2 py-0.5">
              <span className={`inline-block w-2.5 h-0.5 rounded-full ${item.className}`} />
              <span data-value className="font-mono text-[11px] font-semibold text-textPrimary tnum" />
              <span className="font-mono text-[10px] text-textSecondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
