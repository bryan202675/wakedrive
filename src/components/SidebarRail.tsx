import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Cpu,
  Sliders,
  FileSpreadsheet,
  AlertOctagon,
  Headphones,
  Truck,
  ShieldCheck
} from 'lucide-react';

interface SidebarRailProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAlertActive: boolean;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ activeTab, onSelectTab, isAlertActive }) => {
  return (
    <aside className="hidden md:flex w-16 md:w-20 py-4 flex-col items-center justify-between h-full select-none shrink-0 z-20">
      {/* Top: WakeDrive Admin Logo */}
      <div className="flex flex-col items-center gap-4">
        {/* Curved Stylized Logo */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10 flex items-center justify-center cursor-pointer transition hover:scale-105 group"
          title="WakeDrive Fleet Control"
        >
          <div className="relative flex items-center justify-center">
            <Truck className="w-5 h-5 text-black dark:text-white group-hover:text-cyan-500 transition-colors" />
            {isAlertActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            )}
          </div>
        </div>

        {/* Supervisor Status Indicator */}
        <div className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          ADMIN
        </div>
      </div>

      {/* Middle: Admin Navigation Icons */}
      <div className="flex flex-col items-center gap-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
        {/* 1. Dashboard Principal */}
        <button
          onClick={() => onSelectTab('dashboard')}
          aria-label="Panel General de Monitoreo"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            activeTab === 'dashboard'
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md ring-2 ring-cyan-500/30'
              : 'text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Panel General de Monitoreo"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>

        {/* 2. Inspector 3D y Biometría */}
        <button
          onClick={() => onSelectTab('3d')}
          aria-label="Telemetría Biometría 3D"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            activeTab === '3d'
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md ring-2 ring-cyan-500/30'
              : 'text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Telemetría Biometría 3D"
        >
          <Eye className="w-5 h-5" />
        </button>

        {/* 3. Hardware Arduino COM */}
        <button
          onClick={() => onSelectTab('hardware')}
          aria-label="Telemetría Arduino (Pines 10, 8, 9)"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            activeTab === 'hardware'
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md ring-2 ring-cyan-500/30'
              : 'text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Telemetría Arduino (Pines 10, 8, 9)"
        >
          <Cpu className="w-5 h-5" />
        </button>

        {/* 4. Banco de Simulación */}
        <button
          onClick={() => onSelectTab('simulation')}
          aria-label="Laboratorio de Pruebas de Anomalías"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            activeTab === 'simulation'
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md ring-2 ring-cyan-500/30'
              : 'text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Laboratorio de Pruebas de Anomalías"
        >
          <Sliders className="w-5 h-5" />
        </button>

        {/* 5. Bitácora Forense */}
        <button
          onClick={() => onSelectTab('history')}
          aria-label="Bitácora Forense de Somnolencia"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            activeTab === 'history'
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md ring-2 ring-cyan-500/30'
              : 'text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Bitácora Forense de Somnolencia"
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom: Admin Supervisor Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group cursor-pointer" title="Supervisor de Flota: Bryan (Activo)">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 dark:border-white shadow-sm transition-transform group-hover:scale-105 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            ADM
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
        </div>
      </div>
    </aside>
  );
};
