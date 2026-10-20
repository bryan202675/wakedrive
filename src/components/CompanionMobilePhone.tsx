import React from 'react';
import { Check, Shield, Bell, X, Sparkles, AlertOctagon } from 'lucide-react';
import { FilteredStatus } from '../types';

interface CompanionMobilePhoneProps {
  isOpen: boolean;
  onClose: () => void;
  filteredStatus: FilteredStatus;
  isAlertActive: boolean;
  confirmationProgress: number;
  onSimulateAlerta: () => void;
  onSilenciarAlarma: () => void;
}

export const CompanionMobilePhone: React.FC<CompanionMobilePhoneProps> = ({
  isOpen,
  onClose,
  filteredStatus,
  isAlertActive,
  confirmationProgress,
  onSimulateAlerta,
  onSilenciarAlarma,
}) => {
  if (!isOpen) return null;

  return (
    <div className="relative w-72 lg:w-80 shrink-0 select-none animate-fadeIn">
      {/* Smartphone Outer Chassis with Curved Corners like reference */}
      <div className="relative rounded-[42px] p-3 bg-gradient-to-b from-[#2b251d] via-[#1f1d19] to-[#12110e] border-[3px] border-[#4a3f32] shadow-2xl overflow-hidden text-white">
        {/* Dynamic Island / Speaker Notch */}
        <div className="flex items-center justify-between px-3 pt-1 pb-3">
          <div className="text-[10px] font-mono text-amber-100/60 font-semibold">9:41</div>
          <div className="w-16 h-4 bg-black/80 rounded-full border border-white/10 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
            title="Ocultar vista móvil"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Smartphone Screen Body */}
        <div className="space-y-4 px-2 pb-2">
          {/* Top Title: TD Bank / WakeDrive Mobile */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Shield className="w-3.5 h-3.5 text-lime-300" />
            </div>
            <span className="text-xs font-bold tracking-tight text-white/90">
              WakeDrive Mobile
            </span>
          </div>

          {/* Paid Amount / Main Figure like reference */}
          <div>
            <div className="text-[10px] text-amber-100/60 uppercase tracking-wider font-medium">
              Puntaje de Conducción
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1 mt-0.5">
              <span>98.4</span>
              <span className="text-xs font-normal text-lime-300 font-mono">/ 100</span>
            </div>
            <div className="text-[10px] text-amber-200/70 font-mono mt-0.5">
              {isAlertActive ? 'Alerta acústica activa' : 'Postura erguida estable'}
            </div>
          </div>

          {/* Radar circle with glowing green core (matches reference) */}
          <div className="relative w-full py-3 flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-lime-400/40 flex items-center justify-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isAlertActive ? 'bg-red-500 animate-ping' : 'bg-lime-400 shadow-[0_0_15px_#a3e635]'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-lime-200/80 mt-2">
              Sensor D0: {rawReadingLabel(filteredStatus)}
            </div>
          </div>

          {/* Month Checkmark Grid (2023 / 2024 with glowing lime checkmarks like reference!) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-100/80">
              <span>Año 2024 (Registro Cero Sueño)</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'].map((month, i) => (
                <div
                  key={month}
                  className="rounded-xl p-2 bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-[9px] font-mono text-white/60">{month}</span>
                  <div className="w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center shadow-[0_0_8px_rgba(163,230,53,0.5)]">
                    <Check className="w-3 h-3 text-black stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Floating Action Button ("Make a Payment" style in reference) */}
          <div className="pt-2">
            {isAlertActive ? (
              <button
                onClick={onSilenciarAlarma}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Restablecer Alerta</span>
              </button>
            ) : (
              <button
                onClick={onSimulateAlerta}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <Bell className="w-3.5 h-3.5 text-black" />
                <span>Disparar Test de Alarma</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function rawReadingLabel(status: FilteredStatus) {
  return status === 'ERGUIDO' ? 'Erguido (Normal)' : 'Inclinado (1.5s)';
}
