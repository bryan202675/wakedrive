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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* 1. Raw Pin Metric */}
      <div className="rounded-2xl bg-surface-lightCard dark:bg-surface-darkCard border border-surface-lightBorder dark:border-surface-darkBorder p-4 shadow-lg transition-all hover:border-cyan-500/40 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Sensor D0 Crudo</span>
          <Cpu className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono text-slate-800 dark:text-slate-100">
            {rawReading}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            rawReading === 0
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}>
            {rawReading === 0 ? 'LOW (Activo)' : 'HIGH (Reposo)'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
          {rawReading === 0 ? 'Detección física de inclinación' : 'Posición vertical erguida'}
        </p>
      </div>

      {/* 2. Filtered State */}
      <div className="rounded-2xl bg-surface-lightCard dark:bg-surface-darkCard border border-surface-lightBorder dark:border-surface-darkBorder p-4 shadow-lg transition-all hover:border-emerald-500/40 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Filtro Anti-Rebote</span>
          <Gauge className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-black tracking-tight ${
            filteredStatus === 'ERGUIDO'
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-amber-500 dark:text-amber-400'
          }`}>
            {filteredStatus}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          {filteredStatus === 'ERGUIDO' ? 'Estabilidad confirmada (300ms)' : 'Cabeceo sostenido en progreso'}
        </p>
      </div>

      {/* 3. Confirmation Progress (1500ms) */}
      <div className={`rounded-2xl bg-surface-lightCard dark:bg-surface-darkCard border p-4 shadow-lg transition-all relative overflow-hidden ${
        isAlertActive
          ? 'border-red-500/80 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : 'border-surface-lightBorder dark:border-surface-darkBorder'
      }`}>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Ventana de Confirmación</span>
          <Timer className={`w-4 h-4 ${isAlertActive ? 'text-red-500 animate-spin' : 'text-amber-500'}`} />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
            {confirmationProgress}%
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            1.5s Umbral
          </span>
        </div>
        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-100 rounded-full ${
              isAlertActive
                ? 'bg-red-500'
                : confirmationProgress > 0
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${confirmationProgress}%` }}
          />
        </div>
      </div>

      {/* 4. Session Time & Incident Count */}
      <div className="rounded-2xl bg-surface-lightCard dark:bg-surface-darkCard border border-surface-lightBorder dark:border-surface-darkBorder p-4 shadow-lg transition-all hover:border-purple-500/40 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Sesión y Alertas</span>
          <Clock className="w-4 h-4 text-purple-500" />
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
              {sessionTimeFormatted}
            </span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Tiempo Activo</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <ShieldAlert className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
              <span className={`text-xl font-extrabold font-mono ${alertCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {alertCount}
              </span>
            </div>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Incidentes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
