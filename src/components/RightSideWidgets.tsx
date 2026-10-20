import React, { useRef, useState, useEffect } from 'react';
import { Clock, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { FilteredStatus } from '../types';

interface RightSideWidgetsProps {
  sessionTimeFormatted: string;
  filteredStatus: FilteredStatus;
  isAlertActive: boolean;
  confirmationProgress: number;
  alertCount: number;
}

export const RightSideWidgets: React.FC<RightSideWidgetsProps> = ({
  sessionTimeFormatted,
  filteredStatus,
  isAlertActive,
  confirmationProgress,
  alertCount,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 140,
  });

  // Measure container dimensions dynamically to eliminate SVG deformation
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 140;
      setDimensions({ width: w, height: h });
    };

    updateDimensions();
    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Score dynamics for curve rendering
  let currentScore = 820;
  if (isAlertActive) {
    currentScore = 210;
  } else if (filteredStatus === 'INCLINADO') {
    const penalty = Math.round(confirmationProgress * 3.8);
    currentScore = Math.max(320, 820 - penalty);
  }

  const { width, height } = dimensions;

  // Chart padding
  const padLeft = 8;
  const padRight = 50; // Room for threshold labels on the right
  const padTop = 16;
  const padBottom = 20;

  const chartW = Math.max(100, width - padLeft - padRight);
  const chartH = Math.max(60, height - padTop - padBottom);

  // Map 0-1000 score to actual pixel Y-coordinates
  const scoreToY = (s: number) => {
    const clamped = Math.max(0, Math.min(1000, s));
    return padTop + chartH - (clamped / 1000) * chartH;
  };

  const currentY = scoreToY(currentScore);
  const currentX = padLeft + chartW;

  const y690 = scoreToY(690);
  const y300 = scoreToY(300);

  // Calculate smooth cubic bezier path in real pixels
  const startY = scoreToY(currentScore > 600 ? 760 : 420);
  const cp1x = padLeft + chartW * 0.28;
  const cp1y = scoreToY(840);
  const cp2x = padLeft + chartW * 0.65;
  const cp2y = scoreToY(currentScore > 500 ? 810 : 380);

  const splinePath = `M ${padLeft},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currentX},${currentY}`;
  const areaPath = `${splinePath} L ${currentX},${padTop + chartH} L ${padLeft},${padTop + chartH} Z`;

  // Historical dashed curve
  const histCp1y = scoreToY(790);
  const histCp2y = scoreToY(750);
  const histEndY = scoreToY(780);
  const histPath = `M ${padLeft},${scoreToY(720)} C ${cp1x},${histCp1y} ${cp2x},${histCp2y} ${currentX},${histEndY}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* CARD 1: Jornada Continua en Ruta (5 cols) - Minimalist Apple Card without colorful boxes */}
      <div className="lg:col-span-5 squircle-card p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* Header without nested colorful boxes */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
              <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                Tiempo en Ruta
              </span>
            </div>

            {/* Clean Apple-style status: subtle dot + monochrome text (NO pastel green badge container!) */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Turno activo</span>
            </div>
          </div>

          {/* Time Display */}
          <div className="mt-4">
            <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Duración ininterrumpida
            </div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white font-mono tabular-nums">
                {sessionTimeFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Progress Bar & Status Footer */}
        <div className="pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span>Progreso de turno</span>
            <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300 font-medium">
              {alertCount === 0 ? 'Sin micro-sueños' : `${alertCount} anomalías`}
            </span>
          </div>
          {(() => {
            const parts = sessionTimeFormatted.split(':').map(Number);
            const totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
            const pct = Math.min(100, Math.max(1, Math.round((totalSec / 18000) * 100)));
            return (
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    alertCount > 0 ? 'bg-amber-500' : 'bg-zinc-900 dark:bg-zinc-300'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* CARD 2: Curva de Atención en Ruta (7 cols) - Clean Apple Charts */}
      <div className="lg:col-span-7 squircle-card p-5 md:p-6 flex flex-col justify-between">
        {/* Header with Clean Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
            <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
              Curva de Atención
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">
              &bull; Monitoreo cefálico
            </span>
          </div>

          {/* Clean Legend: subtle dots and calm typography */}
          <div className="flex items-center gap-3.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${isAlertActive ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              En vivo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-b border-dashed border-zinc-400 dark:border-zinc-600"></span>
              Histórico
            </span>
          </div>
        </div>

        {/* Dynamic Real-Pixel SVG Container (Apple Health style) */}
        <div ref={chartContainerRef} className="relative w-full h-36 my-2">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
          >
            <defs>
              <linearGradient id="appleAttentionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isAlertActive ? '#ef4444' : '#10b981'}
                  stopOpacity="0.14"
                />
                <stop
                  offset="100%"
                  stopColor={isAlertActive ? '#ef4444' : '#10b981'}
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            {/* Threshold Line at 690 (Norm / Óptimo) */}
            <line
              x1={padLeft}
              y1={y690}
              x2={currentX}
              y2={y690}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Threshold Line at 300 (Crítico) */}
            <line
              x1={padLeft}
              y1={y300}
              x2={currentX}
              y2={y300}
              stroke="#ef4444"
              strokeOpacity="0.25"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Area under curve */}
            <path
              d={areaPath}
              fill="url(#appleAttentionAreaGrad)"
            />

            {/* Historical Faint Spline */}
            <path
              d={histPath}
              fill="none"
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Main Attention Spline Curve */}
            <path
              d={splinePath}
              fill="none"
              stroke={isAlertActive ? '#ef4444' : '#10b981'}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Fixed Real-Pixel Circular Marker at Apex */}
            <circle
              cx={currentX}
              cy={currentY}
              r="4.5"
              fill={isAlertActive ? '#ef4444' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Clean Numeric Tooltip at Apex */}
            <text
              x={currentX - 6}
              y={Math.max(padTop + 2, currentY - 8)}
              textAnchor="end"
              fill={isAlertActive ? '#ef4444' : 'currentColor'}
              className="text-zinc-900 dark:text-white"
              fontSize="11"
              fontWeight="600"
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Mono', monospace"
            >
              {currentScore} pts
            </text>

            {/* Outside Threshold Labels at Right Border */}
            <text
              x={currentX + 8}
              y={y690 + 3}
              className="text-zinc-400 dark:text-zinc-600"
              fill="currentColor"
              fontSize="9"
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Mono', monospace"
            >
              690
            </text>
            <text
              x={currentX + 8}
              y={y300 + 3}
              fill="#ef4444"
              opacity="0.8"
              fontSize="9"
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Mono', monospace"
            >
              300
            </text>
          </svg>
        </div>

        {/* Dedicated Separate X-Axis Time Row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500 pt-2 border-t border-black/[0.06] dark:border-white/[0.06] select-none">
          <span>-30 min</span>
          <span className="hidden sm:inline">-20 min</span>
          <span>-10 min</span>
          <span className="hidden sm:inline">-5 min</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Ahora (En vivo)</span>
        </div>
      </div>
    </div>
  );
};
