import React from 'react';
import { IncidentEvent } from '../types';
import { Download, Trash2, FileSpreadsheet, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

interface IncidentHistoryProps {
  events: IncidentEvent[];
  onClear: () => void;
  onSimulateTest?: () => void;
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({ events, onClear, onSimulateTest }) => {
  const exportCSV = () => {
    if (events.length === 0) {
      alert('No hay incidentes registrados para exportar.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Hora,Evento,Duracion,Contramedida,Severidad\n";
    events.forEach(ev => {
      csvContent += `"${ev.time}","${ev.event}","${ev.duration}","${ev.action}","${ev.severity}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wakedrive_flota_registro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="squircle-card p-4 shadow-card flex flex-col justify-between h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
            Bitácora Forense de Anomalías
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full tabular-nums ${
            events.length > 0
              ? 'bg-red-500 text-white font-bold'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
          }`}>
            {events.length} incidentes
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={exportCSV}
            className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium transition flex items-center gap-1 active:scale-95 focus:ring-1 focus:ring-slate-400 focus:outline-none"
            title="Exportar archivo CSV de auditoría"
            aria-label="Exportar registro forense en formato CSV"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95 focus:ring-1 focus:ring-slate-400 focus:outline-none"
            title="Limpiar bitácora"
            aria-label="Limpiar registro forense"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area with Fixed Scroll */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-2 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-500/60 mb-1" />
            <p className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
              Conducción atenta y erguida. Cero anomalías en este turno.
            </p>
            {onSimulateTest && (
              <button
                onClick={onSimulateTest}
                className="mt-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] transition flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Simular cabeceo de prueba</span>
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-900 text-slate-500 text-[10px] uppercase">
              <tr>
                <th className="py-1.5 px-2">Hora</th>
                <th className="py-1.5 px-2">Evento</th>
                <th className="py-1.5 px-2">Duración</th>
                <th className="py-1.5 px-2">Contramedida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <td className="py-1.5 px-2 text-slate-500 whitespace-nowrap tabular-nums">{ev.time}</td>
                  <td className="py-1.5 px-2 font-medium whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      ev.severity === 'critical'
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {ev.severity === 'critical' && <ShieldAlert className="w-3 h-3" />}
                      {ev.event}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-slate-800 dark:text-slate-200 whitespace-nowrap tabular-nums">{ev.duration}</td>
                  <td className="py-1.5 px-2 text-slate-500 text-[11px] truncate max-w-[140px]">{ev.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
