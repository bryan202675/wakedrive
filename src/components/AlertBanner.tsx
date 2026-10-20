import React, { useState, useEffect, useRef } from 'react';
import { Siren, Volume2, BellRing, X } from 'lucide-react';

export interface AlertBannerProps {
  isActive: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  isActive,
  onDismiss,
  className = ''
}) => {
  const [isRendered, setIsRendered] = useState<boolean>(isActive);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevActiveRef = useRef<boolean>(isActive);
  const isDismissedRef = useRef<boolean>(false);
  isDismissedRef.current = isDismissed;

  useEffect(() => {
    const wasActive = prevActiveRef.current;
    prevActiveRef.current = isActive;

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (isActive) {
      // If entering a new alert cycle from inactive, reset dismiss state
      if (!wasActive) {
        setIsDismissed(false);
        isDismissedRef.current = false;
      }
      if (!isDismissedRef.current) {
        setIsRendered(true);
        setIsLeaving(false);
      }
    } else {
      // Alert ended
      setIsDismissed(false);
      isDismissedRef.current = false;
      setIsRendered((currentlyRendered) => {
        if (currentlyRendered) {
          setIsLeaving(true);
          exitTimerRef.current = setTimeout(() => {
            setIsRendered(false);
            setIsLeaving(false);
            exitTimerRef.current = null;
          }, 280);
        }
        return currentlyRendered;
      });
    }

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, [isActive]);

  const handleDismiss = () => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setIsLeaving(true);
    exitTimerRef.current = setTimeout(() => {
      setIsDismissed(true);
      isDismissedRef.current = true;
      setIsRendered(false);
      setIsLeaving(false);
      exitTimerRef.current = null;
      onDismiss?.();
    }, 280);
  };

  if (!isRendered || isDismissed) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[440px] select-none ${
        isLeaving ? 'animate-toast-exit pointer-events-none' : 'animate-toast-enter pointer-events-auto'
      } ${className}`}
    >
      <div className="w-full rounded-2xl bg-red-600/95 dark:bg-red-700/95 text-white p-4 sm:p-4.5 border border-red-300/40 dark:border-red-400/30 shadow-[0_12px_36px_rgba(220,38,38,0.38),0_4px_16px_rgba(0,0,0,0.18)] backdrop-blur-xl animate-siren transition-all duration-300">
        {/* Header row: Status tag, pill indicator, dismiss button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative p-1.5 rounded-lg bg-white/20 border border-white/25 backdrop-blur-md shrink-0">
              <Siren className="w-4 h-4 text-white animate-pulse" strokeWidth={2} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-red-100">
              Alerta de Seguridad &bull; Unidad #04
            </span>
            <span className="text-[10px] font-mono text-red-200/90 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/15">
              &gt; 1.5s
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 -mr-1 -mt-0.5 rounded-full hover:bg-white/20 active:scale-95 text-red-100 hover:text-white transition-all shrink-0 cursor-pointer"
            aria-label="Cerrar notificación"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Content: Title and message */}
        <div className="mb-3">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
            ¡Cabeceo Crítico Detectado!
          </h2>
          <p className="text-xs text-red-100/90 font-normal mt-1 leading-relaxed">
            Inclinación cefálica sostenida detectada por el sensor D0. Actuadores de cabina activados automáticamente.
          </p>
        </div>

        {/* Footer: Actuator status badges */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-white/15">
          <span className="text-[10px] uppercase font-mono tracking-wide text-red-200 font-semibold shrink-0">
            Actuadores:
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Buzzer Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 backdrop-blur-md flex items-center gap-1.5 text-[11px] font-medium text-white shadow-sm">
              <Volume2 className="w-3 h-3 text-white animate-pulse" strokeWidth={2} />
              <span>Buzzer (Pin 8)</span>
            </div>

            {/* Motor Vibrator Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 backdrop-blur-md flex items-center gap-1.5 text-[11px] font-medium text-white shadow-sm">
              <BellRing className="w-3 h-3 text-white animate-bounce" strokeWidth={2} />
              <span>Vibrador (Pin 9)</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
