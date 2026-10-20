import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Cpu,
  Sliders,
  FileSpreadsheet,
  Truck
} from 'lucide-react';

interface SidebarRailProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAlertActive: boolean;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ activeTab, onSelectTab, isAlertActive }) => {
  return (
    <aside className="hidden md:flex w-16 py-4 flex-col items-center justify-between h-full select-none shrink-0 z-20">
      {/* Top: Brand Symbol */}
      <div className="flex flex-col items-center gap-3">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="WakeDrive Fleet Control"
        >
          <div className="relative flex items-center justify-center">
            <Truck className="w-4 h-4" strokeWidth={1.75} />
            {isAlertActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </div>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          v2.0
        </span>
      </div>

      {/* Middle: Apple Minimalist Sidebar Navigation */}
      <nav aria-label="Navegación lateral de administración" className="flex flex-col items-center gap-2 bg-zinc-100/70 dark:bg-zinc-900/70 backdrop-blur-md p-1.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
        {/* 1. Dashboard Principal */}
        <button
          onClick={() => onSelectTab('dashboard')}
          aria-label="Panel General"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
            activeTab === 'dashboard'
              ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title="Panel General"
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* 2. Inspector 3D y Biometría */}
        <button
          onClick={() => onSelectTab('3d')}
          aria-label="Biometría 3D"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
            activeTab === '3d'
              ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title="Biometría 3D"
        >
          <Eye className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* 3. Hardware Arduino COM */}
        <button
          onClick={() => onSelectTab('hardware')}
          aria-label="Hardware"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
            activeTab === 'hardware'
              ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title="Telemetría de Hardware"
        >
          <Cpu className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* 4. Banco de Simulación */}
        <button
          onClick={() => onSelectTab('simulation')}
          aria-label="Simulador"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
            activeTab === 'simulation'
              ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title="Banco de Simulación"
        >
          <Sliders className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* 5. Bitácora Forense */}
        <button
          onClick={() => onSelectTab('history')}
          aria-label="Bitácora Forense"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
            activeTab === 'history'
              ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title="Bitácora Forense"
        >
          <FileSpreadsheet className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </nav>

      {/* Bottom: Discreet User Indicator */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold cursor-pointer"
          title="Supervisor de Flota: Bryan (Activo)"
        >
          BR
        </div>
      </div>
    </aside>
  );
};
