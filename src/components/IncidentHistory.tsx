import React from 'react';
import { IncidentEvent } from '../types';
import { Trash2, FileSpreadsheet, CheckCircle2, Zap } from 'lucide-react';

interface IncidentHistoryProps {
  events: IncidentEvent[];
  onClear: () => void;
  onSimulateTest?: () => void;
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({ events, onClear, onSimulateTest }) => {
  return (
    <div className="squircle-card p-5 shadow-card flex flex-col justify-between h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Bitácora Forense
          </span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
            ({events.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition active:scale-95"
            title="Limpiar bitácora"
            aria-label="Limpiar registro forense"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Content Area with Fixed Scroll */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs py-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500/70 mb-1.5" strokeWidth={1.75} />
            <p className="font-medium text-zinc-600 dark:text-zinc-400">
              Conducción atenta y erguida. Cero incidentes registrados.
            </p>
            {onSimulateTest && (
              <button
                onClick={onSimulateTest}
                className="mt-2.5 px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium text-[11px] transition flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-500" strokeWidth={1.75} />
                <span>Simular cabeceo de prueba</span>
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-sm text-zinc-400 dark:text-zinc-500 text-[11px] font-medium border-b border-black/[0.04] dark:border-white/[0.04]">
              <tr>
                <th className="py-2 px-2.5 font-normal">Hora</th>
                <th className="py-2 px-2.5 font-normal">Evento</th>
                <th className="py-2 px-2.5 font-normal">Duración</th>
                <th className="py-2 px-2.5 font-normal">Respuesta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] font-mono text-xs">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                  <td className="py-2 px-2.5 text-zinc-500 tabular-nums whitespace-nowrap">{ev.time}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-sans font-medium text-zinc-900 dark:text-white">
                      <span className={`w-2 h-2 rounded-full ${
                        ev.severity === 'critical' ? 'bg-red-500' : 'bg-emerald-500'
                      }`} />
                      {ev.event}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-zinc-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">{ev.duration}</td>
                  <td className="py-2 px-2.5 text-zinc-500 font-sans text-xs truncate max-w-[150px]" title={ev.action}>{ev.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
