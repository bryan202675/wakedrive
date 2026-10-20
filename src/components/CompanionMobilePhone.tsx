import React from 'react';
import { Check, Shield, Bell, X, AlertOctagon } from 'lucide-react';
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
      {/* Smartphone Outer Chassis - Apple Titanium aesthetic */}
      <div className="relative rounded-[44px] p-3.5 bg-zinc-950 border-[3px] border-zinc-700/80 shadow-2xl overflow-hidden text-white">
        {/* Dynamic Island / Speaker Notch */}
        <div className="flex items-center justify-between px-3 pt-1 pb-3">
          <div className="text-[11px] font-mono text-zinc-400 font-semibold">9:41</div>
          <div className="w-16 h-4 bg-black rounded-full border border-zinc-800 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 transition"
            title="Ocultar vista móvil"
          >
            <X className="w-3 h-3" strokeWidth={1.75} />
          </button>
        </div>

        {/* Smartphone Screen Body */}
        <div className="space-y-4 px-2 pb-2">
          {/* Top Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Shield className="w-3.5 h-3.5 text-zinc-200" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-semibold tracking-tight text-white">
              WakeDrive Mobile
            </span>
          </div>

          {/* Main Figure */}
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
              Puntaje de Conducción
            </div>
            <div className="text-3xl font-bold tracking-tight text-white flex items-baseline gap-1 mt-0.5">
              <span>98.4</span>
              <span className="text-xs font-normal text-zinc-400 font-mono">/ 100</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {isAlertActive ? 'Alerta acústica activa' : 'Postura erguida estable'}
            </div>
          </div>

          {/* Biometrics Status */}
          <div className="relative w-full py-4 flex flex-col items-center justify-center rounded-2xl bg-zinc-900/80 border border-white/[0.08]">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isAlertActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-2">
              Sensor D0: {rawReadingLabel(filteredStatus)}
            </div>
          </div>

          {/* Month Checkmark Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-300">
              <span>Registro de Atención 2024</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'].map((month) => (
                <div
                  key={month}
                  className="rounded-xl p-2 bg-zinc-900/60 border border-white/[0.06] flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-[9px] font-mono text-zinc-400">{month}</span>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Floating Action Button */}
          <div className="pt-2">
            {isAlertActive ? (
              <button
                onClick={onSilenciarAlarma}
                className="w-full py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
              >
                <AlertOctagon className="w-4 h-4" strokeWidth={1.75} />
                <span>Restablecer Alerta</span>
              </button>
            ) : (
              <button
                onClick={onSimulateAlerta}
                className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
              >
                <Bell className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Probar Alerta</span>
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
