import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Cpu,
  Sliders,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Sun,
  Moon,
  CheckCircle2,
  Usb,
  Truck
} from 'lucide-react';

interface TopPillNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  onConnectSerial: () => void;
  onDisconnectSerial: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotifications: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAlertActive: boolean;
}

export const TopPillNav: React.FC<TopPillNavProps> = ({
  activeTab,
  onSelectTab,
  isConnected,
  isConnecting,
  onConnectSerial,
  onDisconnectSerial,
  soundEnabled,
  onToggleSound,
  notificationPermission,
  onRequestNotifications,
  isDarkMode,
  onToggleDarkMode,
  isAlertActive,
}) => {
  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-3 py-2 px-1 select-none z-20">
      {/* Mobile Branding Bar (< md) */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10 flex items-center justify-center">
            <Truck className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <div>
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white block">
              WakeDrive
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              Control Flota #04
            </span>
          </div>
        </div>

        {/* Mobile Status Dot & Baud */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-black/5 dark:border-white/10 text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-700 dark:text-slate-200 font-semibold">9600</span>
        </div>
      </div>

      {/* Desktop Horizontal Pill Navigation Menu (>= md) */}
      <div className="hidden md:flex items-center flex-wrap gap-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-full border border-black/5 dark:border-white/10 shadow-sm">
        {/* 1. Centro de Control */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'dashboard'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Centro de Control</span>
        </button>

        {/* 2. Inspector 3D */}
        <button
          onClick={() => onSelectTab('3d')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
            activeTab === '3d'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Biometría 3D</span>
        </button>

        {/* 3. Arduino COM */}
        <button
          onClick={() => onSelectTab('hardware')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
            activeTab === 'hardware'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Pines Hardware</span>
          {isConnected ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600"></span>
          )}
        </button>

        {/* 4. Simulador */}
        <button
          onClick={() => onSelectTab('simulation')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
            activeTab === 'simulation'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulador de Cabina</span>
        </button>

        {/* 5. Bitácora Forense */}
        <button
          onClick={() => onSelectTab('history')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
            activeTab === 'history'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Registro Forense</span>
        </button>
      </div>

      {/* Right Controls: Real-time Telemetry & Actions (Responsive & >= 44px touch targets on mobile) */}
      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fleet Transmission Live Tag (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-black/5 dark:border-white/10 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold">9600 Baud</span>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white shadow-sm transition active:scale-95"
            title={soundEnabled ? 'Silenciar alarma acústica' : 'Activar sonido de alarma'}
            aria-label="Alternar sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Notifications Toggle */}
          <button
            onClick={onRequestNotifications}
            className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white shadow-sm transition active:scale-95"
            title={notificationPermission === 'granted' ? 'Notificaciones de alerta activadas' : 'Habilitar notificaciones en navegador'}
            aria-label="Habilitar notificaciones"
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4 text-cyan-500" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Dark/Light Mode */}
          <button
            onClick={onToggleDarkMode}
            className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white shadow-sm transition active:scale-95"
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            aria-label="Alternar tema claro y oscuro"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>

        {/* Serial Connect Button */}
        {isConnected ? (
          <button
            onClick={onDisconnectSerial}
            className="h-10 md:h-9 px-3.5 sm:px-4 rounded-full bg-emerald-50 hover:bg-red-50 text-emerald-700 hover:text-red-700 dark:bg-emerald-950/40 dark:hover:bg-red-950/40 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm group shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:hidden" />
            <span className="group-hover:hidden">Arduino Conectado</span>
            <span className="hidden group-hover:inline">Desconectar</span>
          </button>
        ) : (
          <button
            onClick={onConnectSerial}
            disabled={isConnecting}
            className="h-10 md:h-9 px-3.5 sm:px-4 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
          >
            <Usb className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Conectando...' : 'Conectar Arduino'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
