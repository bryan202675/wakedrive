import React from 'react';
import { ArrowUpRight, Cpu, BellRing, Activity, Radio, ShieldCheck, Zap } from 'lucide-react';
import { FilteredStatus } from '../types';

interface GradientCardsProps {
  rawReading: number;
  filteredStatus: FilteredStatus;
  confirmationProgress: number;
  isAlertActive: boolean;
  onOpenSensorDetail?: () => void;
  onTriggerTestAlarm?: () => void;
}

export const GradientCards: React.FC<GradientCardsProps> = ({
  rawReading,
  filteredStatus,
  confirmationProgress,
  isAlertActive,
  onOpenSensorDetail,
  onTriggerTestAlarm,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
      {/* CARD 1: Sensor de Inclinación SW-520D (Clean Neutral Surface with Emerald Accent) */}
      <div className="squircle-card p-5 md:p-6 flex flex-col justify-between shadow-card border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.12] transition-all">
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sensor de Inclinación
                </span>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  SW-520D en Casco
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-semibold border border-black/5 dark:border-white/10">
              Pin 10 (D0)
            </span>
          </div>

          {/* Main Status Value */}
          <div className="mt-2 mb-3">
            <div className="flex items-baseline gap-2.5">
              <span className={`text-3xl lg:text-4xl font-black tracking-tight font-sans ${
                filteredStatus === 'ERGUIDO'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {filteredStatus === 'ERGUIDO' ? 'ERGUIDO' : 'INCLINADO'}
              </span>

              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border tabular-nums ${
                rawReading === 0
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
              }`}>
                D0: {rawReading === 0 ? 'LOW (Activo)' : 'HIGH (Reposo)'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {filteredStatus === 'ERGUIDO'
                ? 'Línea de visión adecuada, conductor atento.'
                : 'Inclinación cefálica detectada, evaluando ventana.'}
            </p>
          </div>
        </div>

        {/* Technical Specs Footer in Mono */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500 tabular-nums">
          <span>Anti-rebote: 300 ms</span>
          <span>Muestreo: 20 ms</span>
        </div>
      </div>

      {/* CARD 2: Contramedidas en Cabina (Clean Neutral Surface with Rose/Amber Accent) */}
      <div className={`squircle-card p-5 md:p-6 flex flex-col justify-between shadow-card border transition-all ${
        isAlertActive
          ? 'border-red-500/40 bg-red-500/[0.06] dark:bg-red-950/[0.2]'
          : 'border-rose-500/20 bg-rose-500/[0.03] dark:bg-rose-950/[0.12]'
      }`}>
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm ${
                isAlertActive
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}>
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contramedidas Activas
                </span>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  Actuadores de Cabina
                </span>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${
              isAlertActive
                ? 'bg-red-500 text-white border-red-600 shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-black/5 dark:border-white/10'
            }`}>
              {isAlertActive ? '¡ACTIVO!' : 'Standby'}
            </span>
          </div>

          {/* Confirmation Window / Triggered State */}
          <div className="mt-2 mb-3">
            <div className="flex items-baseline gap-2.5">
              <span className={`text-3xl lg:text-4xl font-black tracking-tight font-sans ${
                isAlertActive
                  ? 'text-red-600 dark:text-red-400 animate-pulse'
                  : confirmationProgress > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {isAlertActive ? '¡DISPARADO!' : '1.500 s'}
              </span>

              {confirmationProgress > 0 && !isAlertActive && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 tabular-nums">
                  {confirmationProgress}% ventana
                </span>
              )}
            </div>

            {/* Progress Bar for Confirmation Window */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full transition-all duration-100 ${
                  isAlertActive
                    ? 'bg-red-500 w-full'
                    : confirmationProgress > 0
                    ? 'bg-amber-500'
                    : 'bg-slate-300 dark:bg-zinc-700 w-0'
                }`}
                style={{ width: isAlertActive ? '100%' : `${confirmationProgress}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              {isAlertActive
                ? 'Pulsos acústicos y hápticos emitidos simultáneamente.'
                : 'Filtro anti-falsos positivos: requiere 1.5s de cabeceo continuo.'}
            </p>
          </div>
        </div>

        {/* Actuators Hardware Meta Footer in Mono */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500 tabular-nums">
          <span>Buzzer: Pin 8</span>
          <span>Vibrador NPN: Pin 9</span>
        </div>
      </div>
    </div>
  );
};
