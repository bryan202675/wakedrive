import React from 'react';
import { FilteredStatus } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown } from 'lucide-react';

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
  let scoreDiff = '+12';
  let scoreLabel = 'Atención Óptima';
  let isPositive = true;

  if (isAlertActive) {
    score = 210;
    scoreDiff = '-240';
    scoreLabel = 'Somnolencia Crítica';
    isPositive = false;
  } else if (filteredStatus === 'INCLINADO') {
    const penalty = Math.round(confirmationProgress * 3.8);
    score = Math.max(320, 820 - penalty);
    scoreDiff = `-${penalty}`;
    scoreLabel = 'Cabeceo en Evaluación';
    isPositive = false;
  }

  // Exact proportional needle percentage on 0-1000 scale
  const needlePercent = Math.min(100, Math.max(0, (score / 1000) * 100));

  return (
    <div className="flex flex-col justify-between h-full gap-5 select-none">
      {/* 1. Header: Clean Apple Hierarchy without superfluous badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
              Control de Flota
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
              Unidad #04
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Supervisión Telemétrica en Ruta
          </h1>
        </div>

        {/* Clean Driver Status Row: No nested card containers */}
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 dark:text-zinc-500">Postura:</span>
            <span className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
              <span className={`w-2 h-2 rounded-full ${
                isAlertActive ? 'bg-red-500 animate-pulse' : filteredStatus === 'INCLINADO' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span className="capitalize">{filteredStatus.toLowerCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 dark:text-zinc-500">Incidentes:</span>
            <span className={`font-mono tabular-nums ${alertCount > 0 ? 'text-red-500 font-semibold' : 'text-zinc-800 dark:text-zinc-200'}`}>
              {alertCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Numeric Score & Refined State: Clean typography, no colored candy boxes */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">
            Índice de Atención en Cabina (0 – 1000)
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
              {score}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold flex items-center gap-0.5 tabular-nums ${
                  isAlertActive
                    ? 'text-red-500'
                    : filteredStatus === 'INCLINADO'
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{scoreDiff} pts</span>
                </span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {scoreLabel}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                {isAlertActive ? 'Alerta crítica emitida a cabina' : 'Conducción estable sin inclinación anómala'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Apple Health style continuous zone gauge */}
      <div className="relative pt-6 pb-2 w-full">
        {/* Needle Marker with Edge Clamping */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20 transition-all duration-300 ease-out"
          style={{ left: `clamp(18px, ${needlePercent}%, calc(100% - 18px))` }}
        >
          <div className="px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-mono font-semibold shadow-sm">
            {score}
          </div>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-zinc-900 dark:border-t-white"></div>
          <div className="w-[1.5px] h-4 bg-zinc-900 dark:bg-white rounded-full mt-0.5"></div>
        </div>

        {/* Continuous Bar with 4 subtle zones */}
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.06]">
          {/* Crítico: 0–300 (30%) */}
          <div style={{ width: '30%' }} className="h-full bg-red-500/70" title="0–300: Crítico" />
          {/* Cabeceo: 300–630 (33%) */}
          <div style={{ width: '33%' }} className="h-full bg-amber-400/70 border-l border-white/20 dark:border-black/20" title="300–630: Cabeceo" />
          {/* Normal: 630–690 (6%) */}
          <div style={{ width: '6%' }} className="h-full bg-lime-400/80 border-l border-white/20 dark:border-black/20" title="630–690: Normal" />
          {/* Óptimo: 690–1000 (31%) */}
          <div style={{ width: '31%' }} className="h-full bg-emerald-500/80 border-l border-white/20 dark:border-black/20" title="690–1000: Óptimo" />
        </div>

        {/* Zone Labels: Clean, responsive, collision-free */}
        <div className="grid grid-cols-4 gap-1 text-center text-xs mt-2 select-none">
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">Crítico</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">Cabeceo</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0"></span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">Normal</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">Óptimo</span>
          </div>
        </div>

        {/* Clean boundary scale limits without colliding numbers */}
        <div className="relative w-full h-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 select-none mt-0.5">
          <span className="absolute left-0">0</span>
          <span className="absolute -translate-x-1/2" style={{ left: '30%' }}>300</span>
          <span className="absolute -translate-x-1/2" style={{ left: '69%' }}>690</span>
          <span className="absolute right-0 font-medium text-zinc-600 dark:text-zinc-400">1000</span>
        </div>
      </div>
    </div>
  );
};
