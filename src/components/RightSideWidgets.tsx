import React, { useRef, useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, Activity, AlertCircle, Compass } from 'lucide-react';
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
  const padLeft = 12;
  const padRight = 56; // Room for threshold labels on the right
  const padTop = 18;
  const padBottom = 22;

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* CARD 1: Jornada Continua en Ruta (5 cols) */}
      <div className="lg:col-span-5 squircle-card p-5 md:p-6 flex flex-col justify-between shadow-card transition-all">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Tiempo en Ruta
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Jornada Continua
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Turno Activo
            </span>
          </div>

          {/* Time Display */}
          <div className="mt-2">
            <div className="text-xs text-slate-500">Tiempo ininterrumpido de conducción</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                {sessionTimeFormatted}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                / 5h 00m Límite
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              Protocolo de seguridad: Parada obligatoria de descanso al completar 5 horas continuas.
            </p>
          </div>
        </div>

        {/* Fatigue Status Indicator Dots */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5" title="Progresión de fatiga acumulada">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-zinc-700"></span>
            <span className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-zinc-600"></span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
            {alertCount === 0 ? 'Sin micro-sueños en turno' : `${alertCount} anomalías registradas`}
          </span>
        </div>
      </div>

      {/* CARD 2: Curva de Atención y Fatiga en Ruta (7 cols) - ZERO DEFORMATION */}
      <div className="lg:col-span-7 squircle-card p-5 md:p-6 flex flex-col justify-between shadow-card transition-all">
        {/* Header with Title and Legend in Distinct Dedicated Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Curva de Atención en Ruta
              </span>
              <span className="text-xs text-slate-400">
                Monitoreo cefálico continuo con umbrales normativos
              </span>
            </div>
          </div>

          {/* Clean Legend (Distinct from X-Axis labels) */}
          <div className="flex items-center gap-3 text-xs font-sans">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2.5 h-1 rounded-full bg-emerald-500 inline-block"></span>
              En Vivo
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400 inline-block"></span>
              Histórico
            </span>
          </div>
        </div>

        {/* Dynamic Real-Pixel SVG Container (Strictly NO preserveAspectRatio="none") */}
        <div ref={chartContainerRef} className="relative w-full h-36 my-1">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
          >
            <defs>
              <linearGradient id="attentionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isAlertActive ? '#ef4444' : '#10b981'}
                  stopOpacity="0.22"
                />
                <stop
                  offset="100%"
                  stopColor={isAlertActive ? '#ef4444' : '#10b981'}
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            {/* Zone Shading: Óptimo (>690) */}
            <rect
              x={padLeft}
              y={padTop}
              width={chartW}
              height={Math.max(0, y690 - padTop)}
              fill="#10b981"
              fillOpacity="0.04"
            />
            {/* Zone Shading: Normal / Cabeceo (300 - 690) */}
            <rect
              x={padLeft}
              y={y690}
              width={chartW}
              height={Math.max(0, y300 - y690)}
              fill="#f59e0b"
              fillOpacity="0.03"
            />
            {/* Zone Shading: Crítico (<300) */}
            <rect
              x={padLeft}
              y={y300}
              width={chartW}
              height={Math.max(0, padTop + chartH - y300)}
              fill="#ef4444"
              fillOpacity="0.05"
            />

            {/* Threshold Line at 690 (Norm / Óptimo) */}
            <line
              x1={padLeft}
              y1={y690}
              x2={currentX}
              y2={y690}
              stroke="#84cc16"
              strokeOpacity="0.45"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Threshold Line at 300 (Crítico) */}
            <line
              x1={padLeft}
              y1={y300}
              x2={currentX}
              y2={y300}
              stroke="#ef4444"
              strokeOpacity="0.45"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Area under curve */}
            <path
              d={areaPath}
              fill="url(#attentionAreaGrad)"
            />

            {/* Historical Faint Spline */}
            <path
              d={histPath}
              fill="none"
              stroke="currentColor"
              className="text-slate-300 dark:text-zinc-700"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Main Attention Spline Curve */}
            <path
              d={splinePath}
              fill="none"
              stroke={isAlertActive ? '#ef4444' : '#10b981'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Vertical Guide Line to Apex Marker */}
            <line
              x1={currentX}
              y1={currentY}
              x2={currentX}
              y2={padTop + chartH}
              stroke="currentColor"
              className="text-slate-300 dark:text-zinc-700"
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            {/* Fixed Real-Pixel Circular Marker at Apex (Never an oval!) */}
            <circle
              cx={currentX}
              cy={currentY}
              r="7"
              fill={isAlertActive ? '#ef4444' : '#10b981'}
              className="animate-ping opacity-75"
            />
            <circle
              cx={currentX}
              cy={currentY}
              r="5"
              fill={isAlertActive ? '#ef4444' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Floating Score Tooltip Badge in Real Pixels */}
            <g transform={`translate(${currentX - 22}, ${Math.max(padTop - 4, currentY - 14)})`}>
              <rect
                x="0"
                y="-10"
                width="44"
                height="18"
                rx="9"
                fill={isAlertActive ? '#ef4444' : '#10b981'}
                className="shadow-sm"
              />
              <text
                x="22"
                y="3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                fontFamily="'JetBrains Mono', monospace"
              >
                {currentScore}
              </text>
            </g>

            {/* Outside Threshold Labels at Right Border (Never overlapping the line) */}
            <text
              x={currentX + 8}
              y={y690 + 3}
              fill="#84cc16"
              fontSize="9"
              fontWeight="bold"
              fontFamily="'JetBrains Mono', monospace"
            >
              690
            </text>
            <text
              x={currentX + 8}
              y={y300 + 3}
              fill="#ef4444"
              fontSize="9"
              fontWeight="bold"
              fontFamily="'JetBrains Mono', monospace"
            >
              300
            </text>
          </svg>
        </div>

        {/* Dedicated Separate X-Axis Time Row (Spacing >= 72px, Never colliding with legends) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1 border-t border-black/5 dark:border-white/10 select-none">
          <span>-30 min</span>
          <span className="hidden sm:inline">-20 min</span>
          <span>-10 min</span>
          <span className="hidden sm:inline">-5 min</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">Ahora (En Vivo)</span>
        </div>
      </div>
    </div>
  );
};
