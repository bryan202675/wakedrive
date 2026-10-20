import React from 'react';
import { Siren, Volume2, BellRing, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  isActive: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="w-full rounded-[24px] bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 md:p-5 border-2 border-white/80 animate-siren transition-all duration-300 select-none">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Siren Icon & Alert Message */}
        <div className="flex items-center gap-3.5">
          {/* Glowing Siren Badge */}
          <div className="relative p-3 rounded-2xl bg-black/25 border border-white/30 backdrop-blur-md shadow-inner shrink-0">
            <Siren className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-black/40 border border-white/20 text-[10px] font-mono tracking-widest uppercase font-extrabold text-white">
                ALERTA DE SEGURIDAD EN RUTA &bull; UNIDAD #04
              </span>
              <span className="text-[10px] font-mono text-rose-200 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                UMBRAL &gt; 1.5s
              </span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>¡CABECEO CRÍTICO DETECTADO! CONDUCTOR EN RIESGO DE DORMIR</span>
            </h2>

            <p className="text-xs text-rose-100 font-medium mt-0.5">
              Inclinación cefálica sostenida detectada por el sensor D0. Actuadores de cabina disparados automáticamente.
            </p>
          </div>
        </div>

        {/* Right: Active Actuators Status Badges with Polished Icons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end lg:self-center">
          {/* Buzzer Badge */}
          <div className="px-3.5 py-2 rounded-2xl bg-black/35 border border-white/25 backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold text-white shadow-sm">
            <div className="p-1 rounded-lg bg-amber-400 text-black">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <span className="block text-[9px] text-amber-200/80 uppercase font-sans font-semibold -mb-0.5">Actuador Acústico</span>
              <span>Buzzer Pin 8 (200ms)</span>
            </div>
          </div>

          {/* Motor Vibrator Badge */}
          <div className="px-3.5 py-2 rounded-2xl bg-black/35 border border-white/25 backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold text-white shadow-sm">
            <div className="p-1 rounded-lg bg-yellow-400 text-black">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div>
              <span className="block text-[9px] text-yellow-200/80 uppercase font-sans font-semibold -mb-0.5">Actuador Háptico</span>
              <span>Vibrador Pin 9 (NPN)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
