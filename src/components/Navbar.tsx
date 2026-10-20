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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-b border-black/[0.06] dark:border-white/[0.06] transition-colors px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-sm">
            <Radio className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">
                WakeDrive
              </span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-medium">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-0.5 hidden sm:block">
              Prevención de Fatiga y Somnolencia
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSimulationOpen
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            }`}
            title="Activar o desactivar banco de simulación"
          >
            <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden md:inline">Simulador</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-all active:scale-95"
            title={soundEnabled ? 'Silenciar alarma acústica' : 'Activar alarma acústica'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
            )}
          </button>

          {/* Browser Notifications Toggle */}
          <button
            onClick={onRequestNotifications}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-all active:scale-95"
            title={
              notificationPermission === 'granted'
                ? 'Notificaciones activas'
                : 'Habilitar notificaciones'
            }
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-3.5 h-3.5 text-zinc-900 dark:text-white" strokeWidth={1.75} />
            ) : (
              <BellOff className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-all active:scale-95"
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700" strokeWidth={1.75} />
            )}
          </button>

          {/* Serial Connection Primary Button */}
          {isConnected ? (
            <button
              onClick={onDisconnectSerial}
              className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-950/40 dark:text-zinc-200 dark:hover:text-red-400 text-xs font-medium transition-all flex items-center gap-1.5 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-red-500"></span>
              <span className="group-hover:hidden">Conectado</span>
              <span className="hidden group-hover:inline">Desconectar</span>
            </button>
          ) : (
            <button
              onClick={onConnectSerial}
              disabled={isConnecting}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Usb className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              <span>{isConnecting ? 'Conectando...' : 'Conectar'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
