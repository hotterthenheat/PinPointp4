/*
==================================================
  SLAYER TERMINAL - CHARTING ENGINE (charts.js)
  Vercel Monochrome Layout Configuration
==================================================
*/

const Charts = (() => {
  let gexChartInstance = null;
  let cockpitChartInstance = null;

  // Vercel-inspired monochrome color scheme with essential status colors
  const COLOR_POS = '#10b981';
  const COLOR_NEG = '#f43f5e';
  const COLOR_PRIMARY = '#ffffff';
  const COLOR_SECONDARY = '#ffffff';
  const COLOR_TEXT = '#888888';
  const COLOR_BORDER = '#1f1f1f';

  // 1. PINPOINT GEX BAR CHART
  function updateGexChart(canvasElement, chain, spotPrice) {
    if (!canvasElement) return;
    
    // Resolve Chart from global window object
    const Chart = window.Chart;
    if (!Chart) return;

    const sortedChain = [...chain].sort((a, b) => a.strike - b.strike);
    const spotIndex = sortedChain.findIndex(node => node.strike >= spotPrice);
    
    let sliceStart = Math.max(0, spotIndex - 8);
    let sliceEnd = Math.min(sortedChain.length, spotIndex + 9);
    const displayChain = sortedChain.slice(sliceStart, sliceEnd);

    const labels = displayChain.map(n => `$${n.strike.toFixed(2)}`);
    const gexData = displayChain.map(n => n.netGex / 1000000); // Millions ($M)
    const backgroundColors = gexData.map(val => val >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)');
    const borderColors = gexData.map(val => val >= 0 ? COLOR_POS : COLOR_NEG);

    const data = {
      labels: labels,
      datasets: [{
        label: 'Net GEX ($M)',
        data: gexData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 2,
        barPercentage: 0.85
      }]
    };

    if (gexChartInstance) {
      gexChartInstance.data = data;
      gexChartInstance.options.plugins.customSpot.spotPrice = spotPrice;
      gexChartInstance.options.plugins.customSpot.displayChain = displayChain;
      gexChartInstance.update('none');
    } else {
      const customSpotPlugin = {
        id: 'customSpot',
        spotPrice: spotPrice,
        displayChain: displayChain,
        afterDraw: (chart) => {
          const { ctx, chartArea: { left, right, top, bottom }, scales: { y } } = chart;
          const spot = chart.options.plugins.customSpot.spotPrice;
          const chainSlice = chart.options.plugins.customSpot.displayChain;
          
          if (!chainSlice || chainSlice.length === 0) return;

          let yVal = -1;
          for (let i = 0; i < chainSlice.length - 1; i++) {
            const s1 = chainSlice[i].strike;
            const s2 = chainSlice[i + 1].strike;
            if (spot >= s1 && spot <= s2) {
              const ratio = (spot - s1) / (s2 - s1);
              const y1 = y.getPixelForValue(i);
              const y2 = y.getPixelForValue(i + 1);
              yVal = y1 + ratio * (y2 - y1);
              break;
            }
          }

          if (yVal === -1) {
            if (spot < chainSlice[0].strike) yVal = y.getPixelForValue(0);
            else yVal = y.getPixelForValue(chainSlice.length - 1);
          }

          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.25;
          ctx.setLineDash([3, 3]);
          
          ctx.beginPath();
          ctx.moveTo(left, yVal);
          ctx.lineTo(right, yVal);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '10px JetBrains Mono';
          ctx.fillText(`SPOT: $${spot.toFixed(2)}`, right - 85, yVal - 5);
          ctx.restore();
        }
      };

      gexChartInstance = new Chart(canvasElement, {
        type: 'bar',
        data: data,
        plugins: [customSpotPlugin],
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { 
                color: COLOR_TEXT, 
                font: { family: 'JetBrains Mono', size: 9 },
                callback: function(value) { return value.toFixed(1) + 'M'; }
              }
            },
            y: {
              grid: { display: false },
              ticks: { color: COLOR_TEXT, font: { family: 'JetBrains Mono', size: 10 } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#000000',
              titleColor: '#fff',
              bodyColor: COLOR_TEXT,
              borderColor: COLOR_BORDER,
              borderWidth: 1,
              titleFont: { family: 'Inter', weight: 'bold' },
              bodyFont: { family: 'JetBrains Mono' },
              callbacks: {
                label: function(context) {
                  return ` GEX: ${context.parsed.x.toFixed(2)} M`;
                }
              }
            },
            customSpot: {
              spotPrice: spotPrice,
              displayChain: displayChain
            }
          }
        }
      });
    }
  }

  // 2. SKY'S VISION COCKPIT PRICE CHART
  function updateCockpitChart(canvasElement, priceHistory, plan) {
    if (!canvasElement) return;

    const Chart = window.Chart;
    if (!Chart) return;

    const dataSlice = priceHistory.slice(-40);
    const indices = Array.from({ length: dataSlice.length }, (_, i) => i);
    
    const ema9 = [];
    const ema21 = [];
    let k9 = 2 / 10;
    let k21 = 2 / 22;
    
    let val9 = dataSlice[0];
    let val21 = dataSlice[0];
    
    dataSlice.forEach(p => {
      val9 = p * k9 + val9 * (1 - k9);
      val21 = p * k21 + val21 * (1 - k21);
      ema9.push(Number(val9.toFixed(2)));
      ema21.push(Number(val21.toFixed(2)));
    });

    const dataset = {
      labels: indices.map(() => ''),
      datasets: [
        {
          label: 'Spot Price',
          data: dataSlice,
          borderColor: COLOR_SECONDARY,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: 'EMA 9',
          data: ema9,
          borderColor: 'rgba(255, 255, 255, 0.45)',
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [2, 2],
          fill: false
        },
        {
          label: 'EMA 21',
          data: ema21,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [2, 2],
          fill: false
        }
      ]
    };

    if (cockpitChartInstance) {
      cockpitChartInstance.data = dataset;
      cockpitChartInstance.options.plugins.planOverlays.plan = plan;
      cockpitChartInstance.update('none');
    } else {
      const planOverlaysPlugin = {
        id: 'planOverlays',
        plan: plan,
        afterDraw: (chart) => {
          const { ctx, chartArea: { left, right }, scales: { y } } = chart;
          const activePlan = chart.options.plugins.planOverlays.plan;
          if (!activePlan) return;

          const drawHorizontalLine = (val, color, text, side = 'right') => {
            const yPixel = y.getPixelForValue(val);
            if (yPixel < chart.chartArea.top || yPixel > chart.chartArea.bottom) return;

            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);

            ctx.beginPath();
            ctx.moveTo(left, yPixel);
            ctx.lineTo(right, yPixel);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.font = '9px JetBrains Mono';
            if (side === 'right') {
              ctx.fillText(`${text}: $${val.toFixed(2)}`, right - 95, yPixel - 4);
            } else {
              ctx.fillText(`${text}: $${val.toFixed(2)}`, left + 10, yPixel - 4);
            }
            ctx.restore();
          };

          drawHorizontalLine(activePlan.entry, 'rgba(255, 255, 255, 0.4)', 'ENTRY', 'left');
          drawHorizontalLine(activePlan.stopLoss, COLOR_NEG, 'STOP LOSS', 'right');
          drawHorizontalLine(activePlan.target1, COLOR_POS, 'TP TARGET', 'right');
        }
      };

      cockpitChartInstance = new Chart(canvasElement, {
        type: 'line',
        data: dataset,
        plugins: [planOverlaysPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: { display: false },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: COLOR_TEXT, font: { family: 'JetBrains Mono', size: 9 } }
            }
          },
          plugins: {
            legend: { display: false },
            planOverlays: { plan: plan }
          }
        }
      });
    }
  }

  // 3. VANNA/CHARM MIGRATION HEATMAP (Custom HTML5 Canvas Renderer)
  function renderVannaHeatmap(canvasElement, spotPrice, chain) {
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    const width = canvasElement.clientWidth;
    const height = canvasElement.clientHeight;
    
    canvasElement.width = width;
    canvasElement.height = height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const gridCols = 15;
    const gridRows = 10;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const cellWidth = plotWidth / gridCols;
    const cellHeight = plotHeight / gridRows;

    const netVannaBase = chain.reduce((acc, c) => acc + Math.abs(c.vanna), 0) / chain.length;
    
    ctx.save();
    for (let r = 0; r < gridRows; r++) {
      const dteFactor = (gridRows - r) / gridRows; 
      
      for (let c = 0; c < gridCols; c++) {
        const spotDrift = ((c - (gridCols / 2)) / (gridCols / 2)) * 0.015;
        
        const distanceVal = Math.exp(-Math.pow(spotDrift * 80, 2));
        const decayVal = Math.sqrt(dteFactor);
        const cellValue = netVannaBase * distanceVal * decayVal * 3000;
        
        const sign = spotDrift >= 0 ? 1 : -1;
        const score = cellValue * sign;

        let colorStr = '';
        if (score >= 0) {
          const intensity = Math.min(0.7, score * 1.3);
          colorStr = `rgba(16, 185, 129, ${intensity.toFixed(2)})`;
        } else {
          const intensity = Math.min(0.7, Math.abs(score) * 1.3);
          colorStr = `rgba(244, 63, 94, ${intensity.toFixed(2)})`;
        }

        const xPos = paddingLeft + c * cellWidth;
        const yPos = paddingTop + r * cellHeight;

        ctx.fillStyle = colorStr;
        ctx.fillRect(xPos + 0.5, yPos + 0.5, cellWidth - 1, cellHeight - 1);
      }
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1;
    ctx.strokeRect(paddingLeft, paddingTop, plotWidth, plotHeight);

    ctx.fillStyle = '#666666';
    ctx.font = '8px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('-1.5%', paddingLeft + 5, height - 8);
    ctx.fillText('SPOT', paddingLeft + plotWidth / 2, height - 8);
    ctx.fillText('+1.5%', paddingLeft + plotWidth - 10, height - 8);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('7D', paddingLeft - 5, paddingTop + 5);
    ctx.fillText('0D', paddingLeft - 5, paddingTop + plotHeight - 5);
    ctx.restore();
  }

  function clearInstances() {
    if (gexChartInstance) {
      gexChartInstance.destroy();
      gexChartInstance = null;
    }
    if (cockpitChartInstance) {
      cockpitChartInstance.destroy();
      cockpitChartInstance = null;
    }
  }

  return {
    updateGexChart,
    updateCockpitChart,
    renderVannaHeatmap,
    clearInstances
  };
})();

export default Charts;
