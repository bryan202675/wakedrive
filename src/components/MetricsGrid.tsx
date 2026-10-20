import React from 'react';
import { FilteredStatus } from '../types';
import { Clock, ShieldAlert, Cpu, Timer, Gauge } from 'lucide-react';

interface MetricsGridProps {
  rawReading: number;
  filteredStatus: FilteredStatus;
  confirmationProgress: number;
  alertCount: number;
  sessionTimeFormatted: string;
  isAlertActive: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  rawReading,
  filteredStatus,
  confirmationProgress,
  alertCount,
  sessionTimeFormatted,
  isAlertActive,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Raw Pin Metric */}
      <div className="squircle-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sensor D0</span>
          <Cpu className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              {rawReading}
            </span>
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${rawReading === 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {rawReading === 0 ? 'LOW' : 'HIGH'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            {rawReading === 0 ? 'Inclinación física detectada' : 'Posición vertical erguida'}
          </p>
        </div>
      </div>

      {/* 2. Filtered State */}
      <div className="squircle-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Filtro (300ms)</span>
          <Gauge className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold tracking-tight ${
              filteredStatus === 'ERGUIDO'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {filteredStatus}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            {filteredStatus === 'ERGUIDO' ? 'Estabilidad normal' : 'Cabeceo sostenido'}
          </p>
        </div>
      </div>

      {/* 3. Confirmation Progress (1500ms) */}
      <div className="squircle-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Ventana</span>
          <Timer className={`w-4 h-4 ${isAlertActive ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`} strokeWidth={1.75} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
              {confirmationProgress}%
            </span>
            <span className="text-xs font-mono text-zinc-400">
              1.5s
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isAlertActive
                  ? 'bg-red-500'
                  : confirmationProgress > 0
                  ? 'bg-amber-500'
                  : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
              style={{ width: `${confirmationProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Session Time & Incident Count */}
      <div className="squircle-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sesión</span>
          <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xl font-semibold font-mono text-zinc-900 dark:text-white tabular-nums">
              {sessionTimeFormatted}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold font-mono tabular-nums ${alertCount > 0 ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {alertCount} {alertCount === 1 ? 'alerta' : 'alertas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
