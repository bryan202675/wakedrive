import React from 'react';
import { Cpu, BellRing, Zap } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
      {/* CARD 1: Sensor de Inclinación SW-520D (Apple Neutral Card) */}
      <div className="squircle-card p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Cpu className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                  Sensor de Inclinación
                </span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  SW-520D en Casco
                </span>
              </div>
            </div>

            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 shrink-0 whitespace-nowrap">
              Pin 10 (D0)
            </span>
          </div>

          {/* Main Status Value: Clean typography with badge pill */}
          <div className="mt-4 mb-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`text-3xl lg:text-4xl font-bold tracking-tight ${
                isAlertActive
                  ? 'text-red-600 dark:text-red-400'
                  : filteredStatus === 'ERGUIDO'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {filteredStatus}
              </span>

              {/* Clean inline reading with subtle badge pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 border border-black/[0.05] dark:border-white/[0.06] text-xs font-mono text-zinc-600 dark:text-zinc-300 shrink-0 whitespace-nowrap">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  isAlertActive ? 'bg-red-500 animate-pulse' : rawReading === 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <span>D0: {rawReading === 0 ? 'LOW (Activo)' : 'HIGH (Reposo)'}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              {filteredStatus === 'ERGUIDO'
                ? 'Línea de visión adecuada, postura cefálica erguida y conductor atento.'
                : 'Inclinación cefálica detectada, ventana temporal de confirmación activa.'}
            </p>
          </div>
        </div>

        {/* Technical Specs Footer in Mono */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
          <span className="whitespace-nowrap">Anti-rebote: 300 ms</span>
          <span className="text-zinc-300 dark:text-zinc-700 font-sans">•</span>
          <span className="whitespace-nowrap">Muestreo: 20 ms</span>
        </div>
      </div>

      {/* CARD 2: Contramedidas en Cabina (Apple Neutral Card) */}
      <div className={`squircle-card p-5 md:p-6 flex flex-col justify-between transition-colors ${
        isAlertActive ? 'ring-1 ring-red-500/40' : ''
      }`}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BellRing className={`w-4 h-4 ${isAlertActive ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'} shrink-0`} strokeWidth={1.75} />
              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                  Contramedidas Activas
                </span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  Actuadores de Cabina
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onTriggerTestAlarm && (
                <button
                  onClick={onTriggerTestAlarm}
                  className="apple-button-secondary text-[11px] py-1 px-2.5 active:scale-95 flex items-center gap-1 shrink-0 whitespace-nowrap"
                  title="Emitir prueba a actuadores en cabina"
                >
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" strokeWidth={1.75} />
                  <span>Probar</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-medium shrink-0 whitespace-nowrap">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isAlertActive ? 'bg-red-500 animate-ping' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                <span className={isAlertActive ? 'text-red-500 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}>
                  {isAlertActive ? '¡Disparado!' : 'En espera'}
                </span>
              </div>
            </div>
          </div>

          {/* Trigger Window & Progress */}
          <div className="mt-4 mb-3">
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl lg:text-4xl font-bold tracking-tight ${
                isAlertActive
                  ? 'text-red-600 dark:text-red-400'
                  : confirmationProgress > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-900 dark:text-white'
              }`}>
                {isAlertActive ? 'Alerta Crítica' : '1.500 s'}
              </span>

              {confirmationProgress > 0 && !isAlertActive && (
                <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap">
                  {confirmationProgress}% ventana
                </span>
              )}
            </div>

            {/* Apple-style sleek progress track */}
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  isAlertActive
                    ? 'bg-red-500 w-full'
                    : confirmationProgress > 0
                    ? 'bg-amber-500'
                    : 'bg-zinc-300 dark:bg-zinc-700 w-0'
                }`}
                style={{ width: isAlertActive ? '100%' : `${confirmationProgress}%` }}
              />
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              {isAlertActive
                ? 'Emisión acústica (Buzzer) y háptica (Vibrador) activas en cabina.'
                : 'Filtro anti-falsos positivos: requiere inclinación continua mayor a 1.5s.'}
            </p>
          </div>
        </div>

        {/* Actuators Hardware Meta Footer in Mono */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
          <span className="whitespace-nowrap">Buzzer: Pin 8</span>
          <span className="text-zinc-300 dark:text-zinc-700 font-sans">•</span>
          <span className="whitespace-nowrap">Vibrador NPN: Pin 9</span>
        </div>
      </div>
    </div>
  );
};
