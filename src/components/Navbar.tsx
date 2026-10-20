import React from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Sun,
  Moon,
  FlaskConical,
  Radio,
  Usb,
  Power
} from 'lucide-react';

interface NavbarProps {
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
  isSimulationOpen: boolean;
  onToggleSimulation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
  isSimulationOpen,
  onToggleSimulation,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-lightCard/80 dark:bg-surface-darkCard/80 border-b border-surface-lightBorder dark:border-surface-darkBorder transition-colors px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                WAKEDRIVE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold">
                HUD 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              Sistema Activo de Telemetría y Prevención de Somnolencia
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-2.5">
          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border shadow-sm ${
              isSimulationOpen
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-surface-light dark:bg-surface-dark border-surface-lightBorder dark:border-surface-darkBorder text-slate-600 dark:text-slate-300 hover:border-amber-500/40'
            }`}
            title="Activar o desactivar banco de simulación sin hardware"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simulador</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl text-xs font-mono transition-all border shadow-sm ${
              soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                : 'bg-surface-light dark:bg-surface-dark border-surface-lightBorder dark:border-surface-darkBorder text-slate-400'
            }`}
            title={soundEnabled ? 'Silenciar alarma acústica' : 'Activar alarma acústica'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Browser Notifications Toggle */}
          <button
            onClick={onRequestNotifications}
            className={`p-2 rounded-xl text-xs font-mono transition-all border shadow-sm ${
              notificationPermission === 'granted'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-surface-light dark:bg-surface-dark border-surface-lightBorder dark:border-surface-darkBorder text-slate-400 hover:text-slate-200'
            }`}
            title={
              notificationPermission === 'granted'
                ? 'Notificaciones de navegador activas'
                : 'Habilitar notificaciones en el navegador'
            }
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-xs font-mono transition-all border border-surface-lightBorder dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-slate-700 dark:text-slate-300 hover:text-cyan-500 shadow-sm"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Serial Connection Primary Button */}
          {isConnected ? (
            <button
              onClick={onDisconnectSerial}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-red-500/15 text-emerald-600 hover:text-red-600 dark:text-emerald-400 dark:hover:text-red-400 border border-emerald-500/30 hover:border-red-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-red-400 animate-pulse"></span>
              <Usb className="w-3.5 h-3.5" />
              <span className="group-hover:hidden">COM 9600 OK</span>
              <span className="hidden group-hover:inline">Desconectar</span>
            </button>
          ) : (
            <button
              onClick={onConnectSerial}
              disabled={isConnecting}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
            >
              <Power className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
              <span>{isConnecting ? 'Conectando...' : 'Conectar Arduino'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
