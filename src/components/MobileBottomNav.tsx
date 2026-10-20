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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-black/10 dark:border-white/10 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center rounded-2xl px-2 py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-black dark:text-white font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
