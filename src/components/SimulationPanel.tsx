import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Zap, Pause, Sliders, Radio } from 'lucide-react';

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
    <div className="squircle-card p-5 md:p-6 flex flex-col justify-between h-[240px] shadow-card transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
            <Sliders className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Banco de Simulación de Cabina
            </span>
            <span className="text-xs text-slate-400">
              Inyección de tramas seriales a 9600 Baud
            </span>
          </div>
        </div>

        {/* Reset Counter Button */}
        <button
          onClick={onResetStats}
          className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-medium transition flex items-center gap-1.5 border border-black/5 dark:border-white/10 active:scale-95"
          title="Reiniciar contador de incidentes"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* 2x2 Grid of Simulation Actions with Rich Subtitles */}
      <div className="grid grid-cols-2 gap-2.5 flex-1 my-1">
        {/* 1. Erguido */}
        <button
          onClick={onSimulateErguido}
          className="p-2.5 rounded-xl bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] dark:bg-emerald-950/[0.2] dark:hover:bg-emerald-950/[0.35] border border-emerald-500/20 text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Erguido
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono truncate">
              D0: HIGH &bull; Postura normal
            </span>
          </div>
        </button>

        {/* 2. Cabeceo */}
        <button
          onClick={onSimulateInclinado}
          className="p-2.5 rounded-xl bg-amber-500/[0.06] hover:bg-amber-500/[0.12] dark:bg-amber-950/[0.2] dark:hover:bg-amber-950/[0.35] border border-amber-500/20 text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Cabeceo (1.5s)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono truncate">
              D0: LOW &bull; Ventana activa
            </span>
          </div>
        </button>

        {/* 3. Alerta Inmediata */}
        <button
          onClick={onSimulateAlerta}
          className="p-2.5 rounded-xl bg-red-500/[0.06] hover:bg-red-500/[0.12] dark:bg-red-950/[0.2] dark:hover:bg-red-950/[0.35] border border-red-500/20 text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <div className="p-1.5 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Alerta Inmediata
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono truncate">
              Buzzer 8 + Motor 9
            </span>
          </div>
        </button>

        {/* 4. Ciclo Demo Automático */}
        <button
          onClick={isAutoLooping ? stopAutoLoop : startAutoLoop}
          className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 group active:scale-[0.98] focus:ring-2 focus:ring-purple-500 focus:outline-none ${
            isAutoLooping
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-purple-500/[0.06] hover:bg-purple-500/[0.12] dark:bg-purple-950/[0.2] dark:hover:bg-purple-950/[0.35] border-purple-500/20'
          }`}
        >
          <div className={`p-1.5 rounded-lg shrink-0 ${isAutoLooping ? 'bg-white/20 text-white' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'}`}>
            {isAutoLooping ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className={`text-xs font-bold block truncate ${isAutoLooping ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {isAutoLooping ? 'Detener Demo' : 'Ciclo Demo'}
            </span>
            <span className={`text-[11px] block font-mono truncate ${isAutoLooping ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
              {isAutoLooping ? 'Bucle en ejecución' : 'Secuencia automática'}
            </span>
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono text-[11px]">Protocolo: Crudo [0|1] Filtrado [INCLINADO|ERGUIDO]</span>
        <span className="font-semibold text-purple-600 dark:text-purple-400">Listo para prueba</span>
      </div>
    </div>
  );
};
