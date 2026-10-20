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
    <header className="w-full flex items-center justify-between gap-3 py-2 px-1 select-none z-20">
      {/* 1. Mobile Top Bar (< md): Single sleek Apple-style navigation row */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
            <Truck className="w-3.5 h-3.5 text-white dark:text-zinc-900" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-white">
              WakeDrive
            </span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-medium">
              #04
            </span>
          </div>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-95 border border-black/[0.04] dark:border-white/[0.06]"
            title={soundEnabled ? 'Silenciar alarma' : 'Activar sonido'}
            aria-label="Alternar sonido"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
            )}
          </button>

          <button
            onClick={onToggleDarkMode}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-95 border border-black/[0.04] dark:border-white/[0.06]"
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            aria-label="Alternar tema"
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700" strokeWidth={1.75} />
            )}
          </button>

          {isConnected ? (
            <button
              onClick={onDisconnectSerial}
              className="h-8 px-2.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border border-black/[0.04] dark:border-white/[0.06] text-xs font-medium flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px]">Conectado</span>
            </button>
          ) : (
            <button
              onClick={onConnectSerial}
              disabled={isConnecting}
              className="h-8 px-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Usb className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              <span className="text-[11px]">{isConnecting ? '...' : 'Conectar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Desktop Apple-Style Segmented Control (>= md) */}
      <nav aria-label="Secciones del sistema" className="hidden md:flex items-center gap-0.5 bg-zinc-200/50 dark:bg-zinc-800/60 backdrop-blur-xl p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
        {/* 1. Centro de Control */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span><span className="hidden xl:inline">Centro de </span>Control</span>
        </button>

        {/* 2. Inspector 3D */}
        <button
          onClick={() => onSelectTab('3d')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === '3d'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span><span className="hidden xl:inline">Biometría </span>3D</span>
        </button>

        {/* 3. Arduino COM */}
        <button
          onClick={() => onSelectTab('hardware')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'hardware'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span>Hardware</span>
          {isConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          )}
        </button>

        {/* 4. Simulador */}
        <button
          onClick={() => onSelectTab('simulation')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'simulation'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span>Simulador</span>
        </button>

        {/* 5. Bitácora Forense */}
        <button
          onClick={() => onSelectTab('history')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'history'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span>Bitácora</span>
        </button>
      </nav>

      {/* 3. Desktop Right Controls (>= md) */}
      <div className="hidden md:flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5">
          {/* Live Baud Tag */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-xs font-mono text-zinc-600 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>9600 Baud</span>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-95 border border-black/[0.04] dark:border-white/[0.06]"
            title={soundEnabled ? 'Silenciar alarma acústica' : 'Activar sonido de alarma'}
            aria-label="Alternar sonido"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
            )}
          </button>

          {/* Notifications Toggle */}
          <button
            onClick={onRequestNotifications}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-95 border border-black/[0.04] dark:border-white/[0.06]"
            title={notificationPermission === 'granted' ? 'Notificaciones activadas' : 'Habilitar notificaciones'}
            aria-label="Habilitar notificaciones"
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4 text-zinc-900 dark:text-white" strokeWidth={1.75} />
            ) : (
              <BellOff className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
            )}
          </button>

          {/* Dark/Light Mode */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-95 border border-black/[0.04] dark:border-white/[0.06]"
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            aria-label="Alternar tema claro y oscuro"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Serial Connect Button: Apple Primary / Active Button */}
        {isConnected ? (
          <button
            onClick={onDisconnectSerial}
            className="h-9 px-4 rounded-full bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-950/40 dark:text-zinc-200 dark:hover:text-red-400 border border-black/[0.04] dark:border-white/[0.06] text-xs font-medium transition-all flex items-center gap-1.5 group shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-red-500"></span>
            <span className="group-hover:hidden">Conectado</span>
            <span className="hidden group-hover:inline">Desconectar</span>
          </button>
        ) : (
          <button
            onClick={onConnectSerial}
            disabled={isConnecting}
            className="h-9 px-4 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
          >
            <Usb className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            <span>{isConnecting ? 'Conectando...' : 'Conectar'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
