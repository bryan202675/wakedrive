import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Zap, Pause, Sliders } from 'lucide-react';

interface SimulationPanelProps {
  onSimulateErguido: () => void;
  onSimulateInclinado: () => void;
  onSimulateAlerta: () => void;
  onResetStats: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  onSimulateErguido,
  onSimulateInclinado,
  onSimulateAlerta,
  onResetStats,
}) => {
  const [isAutoLooping, setIsAutoLooping] = useState(false);
  const loopTimerRef = useRef<number | null>(null);

  const stopAutoLoop = () => {
    if (loopTimerRef.current !== null) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    setIsAutoLooping(false);
  };

  const startAutoLoop = () => {
    setIsAutoLooping(true);
    const runStep = (step: number) => {
      if (step === 0) {
        onSimulateErguido();
        loopTimerRef.current = window.setTimeout(() => runStep(1), 3200);
      } else if (step === 1) {
        onSimulateInclinado();
        loopTimerRef.current = window.setTimeout(() => runStep(2), 2200);
      } else if (step === 2) {
        onSimulateAlerta();
        loopTimerRef.current = window.setTimeout(() => runStep(3), 3500);
      } else {
        onSimulateErguido();
        loopTimerRef.current = window.setTimeout(() => runStep(0), 4000);
      }
    };
    runStep(0);
  };

  useEffect(() => {
    return () => {
      stopAutoLoop();
    };
  }, []);

  return (
    <div className="squircle-card p-5 md:p-6 flex flex-col justify-between min-h-[240px] h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Simulador de Cabina
            </span>
          </div>
        </div>

        {/* Reset Counter Button - Apple Secondary Button */}
        <button
          onClick={onResetStats}
          className="apple-button-secondary text-xs active:scale-95"
          title="Reiniciar contador de incidentes"
        >
          <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* 2x2 Grid of Simulation Actions - Clean Apple Control Tiles (NO rainbow boxes) */}
      <div className="grid grid-cols-2 gap-2.5 flex-1 my-2">
        {/* 1. Erguido */}
        <button
          onClick={onSimulateErguido}
          className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-white/[0.06] text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:outline-none"
        >
          <ShieldCheck className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white block truncate">
              Erguido
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-mono truncate">
              D0: HIGH &bull; 5V
            </span>
          </div>
        </button>

        {/* 2. Cabeceo */}
        <button
          onClick={onSimulateInclinado}
          className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-white/[0.06] text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:outline-none"
        >
          <AlertTriangle className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-500 transition-colors shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white block truncate">
              Cabeceo (1.5s)
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-mono truncate">
              D0: LOW &bull; 0V
            </span>
          </div>
        </button>

        {/* 3. Alerta Inmediata */}
        <button
          onClick={onSimulateAlerta}
          className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-black/[0.04] dark:border-white/[0.06] text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:outline-none"
        >
          <Zap className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-red-500 transition-colors shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white block truncate">
              Alerta Inmediata
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-mono truncate">
              Pin 8 + Pin 9
            </span>
          </div>
        </button>

        {/* 4. Ciclo Demo Automático */}
        <button
          onClick={isAutoLooping ? stopAutoLoop : startAutoLoop}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:outline-none ${
            isAutoLooping
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
              : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border-black/[0.04] dark:border-white/[0.06]'
          }`}
        >
          {isAutoLooping ? (
            <Pause className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
          ) : (
            <Play className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white shrink-0 mt-0.5" strokeWidth={1.75} />
          )}
          <div className="min-w-0">
            <span className={`text-xs font-semibold block truncate ${isAutoLooping ? '' : 'text-zinc-900 dark:text-white'}`}>
              {isAutoLooping ? 'Detener Demo' : 'Ciclo Demo'}
            </span>
            <span className={`text-[11px] block font-mono truncate ${isAutoLooping ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500'}`}>
              {isAutoLooping ? 'En ejecución' : 'Auto secuencia'}
            </span>
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <span className="font-mono text-[11px]">Protocolo: Crudo [0|1] &bull; Filtrado [INCLINADO|ERGUIDO]</span>
        <span className="font-medium text-zinc-600 dark:text-zinc-400">Listo</span>
      </div>
    </div>
  );
};
