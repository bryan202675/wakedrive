import React from 'react';
import { LayoutDashboard, Eye, Cpu, Sliders, FileSpreadsheet } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAlertActive: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  isAlertActive,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Control', icon: LayoutDashboard },
    { id: '3d', label: 'Busto 3D', icon: Eye },
    { id: 'hardware', label: 'Hardware', icon: Cpu },
    { id: 'simulation', label: 'Simulador', icon: Sliders },
    { id: 'history', label: 'Bitácora', icon: FileSpreadsheet },
  ];

  return (
    <nav
      aria-label="Navegación Móvil Inferior"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/80 dark:bg-zinc-900/85 backdrop-blur-2xl border-t border-black/[0.06] dark:border-white/[0.06] px-2 py-1 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-zinc-900 dark:text-white font-semibold'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2 : 1.75} />
                {isAlertActive && (tab.id === 'dashboard' || tab.id === '3d') && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
