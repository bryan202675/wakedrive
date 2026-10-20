import React from 'react';
import { UserCheck, Truck, ShieldAlert, CheckCircle2, ChevronDown, Activity } from 'lucide-react';
import { FilteredStatus } from '../types';

interface HeroScoreCardProps {
  filteredStatus: FilteredStatus;
  isAlertActive: boolean;
  confirmationProgress: number;
  alertCount: number;
}

export const HeroScoreCard: React.FC<HeroScoreCardProps> = ({
  filteredStatus,
  isAlertActive,
  confirmationProgress,
  alertCount,
}) => {
  // Score dynamics: 820 normal, drops when inclined, drops to 210 when alert triggers
  let score = 820;
  let scoreDiff = '+12 pts';
  let scoreLabel = 'Atención Óptima';

  if (isAlertActive) {
    score = 210;
    scoreDiff = '-240 pts';
    scoreLabel = 'Somnolencia Crítica';
  } else if (filteredStatus === 'INCLINADO') {
    const penalty = Math.round(confirmationProgress * 3.8);
    score = Math.max(320, 820 - penalty);
    scoreDiff = `-${penalty} pts`;
    scoreLabel = 'Cabeceo en Evaluación';
  }

  // Exact proportional needle percentage on 0-1000 scale
  const needlePercent = Math.min(100, Math.max(0, (score / 1000) * 100));

  return (
    <div className="flex flex-col justify-between h-full gap-4 select-none">
      {/* 1. Header & Assigned Driver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-[11px] font-semibold tracking-wide uppercase">
              Centro de Control de Flota
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">Unidad #04</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight break-words">
            Monitoreo de Anomalías en Ruta
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mt-0.5 leading-relaxed">
            Supervisión telemétrica de fatiga y cabeceo para prevención de accidentes.
          </p>
        </div>
      </div>

      {/* 2. Numeric Score & Quick Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
            Índice de Atención en Cabina (0 – 1000)
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl md:text-6xl font-black tracking-tight text-slate-950 dark:text-white font-sans tabular-nums">
              {score}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md tabular-nums ${
                  isAlertActive
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : filteredStatus === 'INCLINADO'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {scoreDiff}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {scoreLabel}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {isAlertActive ? 'Alerta crítica emitida a cabina' : 'Conducción estable sin cabeceo'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Driver Status Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 text-xs shadow-sm">
            <span className="text-slate-400">Postura: </span>
            <span className={`font-bold font-mono ${
              isAlertActive ? 'text-red-500' : filteredStatus === 'INCLINADO' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {filteredStatus}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 text-xs shadow-sm">
            <span className="text-slate-400">Incidentes: </span>
            <span className={`font-bold font-mono tabular-nums ${alertCount > 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
              {alertCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CONTINUOUS SINGLE BAR (4 Proportional Zones: 0-300: 30%, 300-630: 33%, 630-690: 6%, 690-1000: 31%) */}
      <div className="relative pt-7 pb-1 w-full">
        {/* Animated Needle Marker strictly at real value with smooth cubic easing */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20 transition-all duration-400 ease-out"
          style={{ left: `${needlePercent}%` }}
        >
          {/* Numerical Value Chip */}
          <div className="px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-mono font-bold shadow-md">
            {score}
          </div>
          {/* Downward Indicator Arrow */}
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-900 dark:border-t-white"></div>
          {/* Needle Spine */}
          <div className="w-[2px] h-6 bg-slate-900 dark:bg-white rounded-full mt-0.5 shadow-sm"></div>
        </div>

        {/* ONE SINGLE CONTINUOUS BAR WITH 4 REAL PROPORTIONAL ZONES */}
        <div className="h-4 w-full rounded-full overflow-hidden flex border border-black/10 dark:border-white/10 shadow-inner bg-slate-200 dark:bg-zinc-800">
          {/* Crítico: 0–300 (30%) */}
          <div
            style={{ width: '30%' }}
            className="h-full bg-red-500/80 transition-colors"
            title="0–300: Crítico"
          />
          {/* Cabeceo: 300–630 (33%) */}
          <div
            style={{ width: '33%' }}
            className="h-full bg-amber-400/85 transition-colors border-l border-white/20"
            title="300–630: Cabeceo"
          />
          {/* Normal: 630–690 (6%) */}
          <div
            style={{ width: '6%' }}
            className="h-full bg-lime-400/90 transition-colors border-l border-white/20"
            title="630–690: Normal"
          />
          {/* Óptimo: 690–1000 (31%) */}
          <div
            style={{ width: '31%' }}
            className="h-full bg-emerald-500/85 transition-colors border-l border-white/20"
            title="690–1000: Óptimo"
          />
        </div>

        {/* ZONE LABELS OUTSIDE THE BAR, CENTERED BELOW EACH ZONE */}
        <div className="relative w-full h-5 text-xs font-semibold mt-1.5 select-none">
          {/* Crítico: center at 15% */}
          <div className="absolute -translate-x-1/2 flex items-center gap-1" style={{ left: '15%' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span className="text-[11px] text-red-600 dark:text-red-400">Crítico</span>
          </div>
          {/* Cabeceo: center at 46.5% */}
          <div className="absolute -translate-x-1/2 flex items-center gap-1" style={{ left: '46.5%' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">Cabeceo</span>
          </div>
          {/* Normal: center at 66% (short label with tooltip) */}
          <div className="absolute -translate-x-1/2 flex items-center gap-1 cursor-help" style={{ left: '66%' }} title="630–690: Fatiga Normal">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
            <span className="text-[11px] text-lime-700 dark:text-lime-400 font-mono">Norm.</span>
          </div>
          {/* Óptimo: center at 84.5% */}
          <div className="absolute -translate-x-1/2 flex items-center gap-1" style={{ left: '84.5%' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Óptimo</span>
          </div>
        </div>

        {/* NUMERICAL SCALE LIMITS EXACTLY UNDER BOUNDARIES */}
        <div className="relative w-full h-3 text-[10px] font-mono text-slate-400 dark:text-slate-500 select-none">
          <span className="absolute left-0">0</span>
          <span className="absolute -translate-x-1/2" style={{ left: '30%' }}>300</span>
          <span className="absolute -translate-x-1/2" style={{ left: '63%' }}>630</span>
          <span className="absolute -translate-x-1/2" style={{ left: '69%' }}>690</span>
          <span className="absolute right-0 font-bold text-slate-700 dark:text-slate-300">1000</span>
        </div>
      </div>
    </div>
  );
};
