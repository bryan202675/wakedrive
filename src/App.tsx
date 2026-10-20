import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilteredStatus, TelemetryPoint, IncidentEvent } from './types';
import { useSoundAlarm } from './hooks/useSoundAlarm';
import { useNotifications } from './hooks/useNotifications';
import { useWebSerial } from './hooks/useWebSerial';
import { SidebarRail } from './components/SidebarRail';
import { TopPillNav } from './components/TopPillNav';
import { HeroScoreCard } from './components/HeroScoreCard';
import { GradientCards } from './components/GradientCards';
import { RightSideWidgets } from './components/RightSideWidgets';
import { Driver3DView } from './components/Driver3DView';
import { TelemetryChart } from './components/TelemetryChart';
import { SimulationPanel } from './components/SimulationPanel';
import { TerminalLog } from './components/TerminalLog';
import { IncidentHistory } from './components/IncidentHistory';
import { AlertBanner } from './components/AlertBanner';
import { MobileBottomNav } from './components/MobileBottomNav';

export const App: React.FC = () => {
  // Theme state: default to Light Mode matching reference image or URL search param
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    if (themeParam === 'dark') return true;
    if (themeParam === 'light') return false;
    const saved = localStorage.getItem('wakedrive_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wakedrive_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wakedrive_theme', 'light');
    }
  }, [isDarkMode]);

  // Tab navigation state
  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    return (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab')) || 'dashboard';
  });

  // Telemetry & Hardware State (Arduino Uno 9600 baud protocol)
  const simParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sim') : null;
  const isInitialAlert = simParam === 'alerta';
  const isInitialInclinado = simParam === 'inclinado';

  const [rawReading, setRawReading] = useState<number>(() => (isInitialAlert || isInitialInclinado ? 0 : 1));
  const [filteredStatus, setFilteredStatus] = useState<FilteredStatus>(() => (isInitialAlert || isInitialInclinado ? 'INCLINADO' : 'ERGUIDO'));
  const [tiltStartTime, setTiltStartTime] = useState<number | null>(() => (isInitialAlert ? Date.now() - 1600 : isInitialInclinado ? Date.now() - 600 : null));
  const [confirmationProgress, setConfirmationProgress] = useState<number>(() => (isInitialAlert ? 100 : isInitialInclinado ? 40 : 0));
  const [isAlertActive, setIsAlertActive] = useState<boolean>(() => isInitialAlert);
  const [alertCount, setAlertCount] = useState<number>(() => (isInitialAlert ? 1 : 0));
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [sessionTimeFormatted, setSessionTimeFormatted] = useState<string>('00:00:00');

  // Logs & Telemetry buffer
  const [dataPoints, setDataPoints] = useState<TelemetryPoint[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>(() =>
    isInitialAlert
      ? [
          '> Baud: 9600   Sensor: SW-520D (Pin 10)',
          'Crudo: 0   Filtrado: INCLINADO',
          '⚠️ UMBRAL SUPERADO: 1.500 s sostenido',
          '🚨 ALERTA EMITIDA: Buzzer Pin 8 = HIGH, Vibrador Pin 9 = HIGH'
        ]
      : isInitialInclinado
      ? [
          '> Baud: 9600   Sensor: SW-520D (Pin 10)',
          'Crudo: 0   Filtrado: INCLINADO',
          '⏱️ Ventana de confirmación activa (600ms / 1500ms)...'
        ]
      : []
  );
  const [events, setEvents] = useState<IncidentEvent[]>(() =>
    isInitialAlert
      ? [
          {
            id: 'evt-init-1',
            timestamp: new Date().toLocaleTimeString('es-SV', { hour12: false }),
            anomalyType: 'Somnolencia Sostenida',
            duration: 'Activa',
            countermeasures: 'Buzzer (Pin 8) + Vibrador (Pin 9)',
            severity: 'critical'
          }
        ]
      : []
  );

  // Stable references
  const incidentActiveRef = useRef<boolean>(false);
  const incidentStartRef = useRef<number>(0);

  // Audio and Notifications hooks
  const { soundEnabled, toggleSound, startAlarm, stopAlarm, playTone } = useSoundAlarm();
  const { permission, requestPermission, triggerAlertNotification } = useNotifications();

  // Terminal Line logger
  const addTerminalLine = useCallback((line: string) => {
    setTerminalLines((prev) => {
      const next = [...prev, line];
      return next.length > 200 ? next.slice(next.length - 200) : next;
    });
  }, []);

  // Incident Event logger
  const addIncidentEvent = useCallback((event: string, duration: string, action: string, severity: 'low' | 'warning' | 'critical') => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const newEvent: IncidentEvent = {
      id: Math.random().toString(36).substring(2, 9),
      time,
      event,
      duration,
      action,
      severity
    };
    setEvents((prev) => [newEvent, ...prev]);
  }, []);

  // Process incoming line logic (same for physical Arduino and simulation)
  const handleDataParsed = useCallback((raw: number, filtered: FilteredStatus) => {
    setRawReading(raw);
    setFilteredStatus((prevFiltered) => {
      if (filtered === 'INCLINADO' && prevFiltered !== 'INCLINADO') {
        setTiltStartTime(Date.now());
      } else if (filtered === 'ERGUIDO') {
        setTiltStartTime(null);
      }
      return filtered;
    });
  }, []);

  // Web Serial API hook
  const { isConnected, isConnecting, connectSerial, disconnectSerial } = useWebSerial({
    onDataParsed: handleDataParsed,
    onRawLine: addTerminalLine
  });

  // Clock & Confirmation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Session clock
      const elapsedTotalSec = Math.floor((Date.now() - sessionStartTime) / 1000);
      const hh = String(Math.floor(elapsedTotalSec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((elapsedTotalSec % 3600) / 60)).padStart(2, '0');
      const ss = String(elapsedTotalSec % 60).padStart(2, '0');
      setSessionTimeFormatted(`${hh}:${mm}:${ss}`);

      // 2. Evaluate Confirmation Progress (1500ms threshold)
      if (filteredStatus === 'INCLINADO' && tiltStartTime !== null) {
        const elapsedTilt = Date.now() - tiltStartTime;
        const progress = Math.min(100, Math.round((elapsedTilt / 1500) * 100));
        setConfirmationProgress(progress);

        if (elapsedTilt >= 1500) {
          setIsAlertActive(true);
          startAlarm();
          triggerAlertNotification(
            '⚠️ ¡WAKEDRIVE: CABECEO SOSTENIDO DETECTADO!',
            'El conductor de la Unidad #04 presenta somnolencia crítica (>1.5s). Actuadores activados en cabina.'
          );

          if (!incidentActiveRef.current) {
            incidentActiveRef.current = true;
            incidentStartRef.current = Date.now();
            setAlertCount((c) => c + 1);
            addIncidentEvent('Somnolencia', 'Activa', 'Buzzer (Pin 8) + Motor (Pin 9)', 'critical');
          }
        }
      } else {
        setConfirmationProgress(0);
        setIsAlertActive(false);
        stopAlarm();

        if (incidentActiveRef.current) {
          const duration = ((Date.now() - incidentStartRef.current) / 1000).toFixed(1);
          addIncidentEvent('Reincorporación', `${duration} s`, 'Postura Restablecida', 'low');
          incidentActiveRef.current = false;
        }
      }

      // 3. Telemetry Stream
      setDataPoints((prev) => {
        const newPt: TelemetryPoint = {
          time: Date.now(),
          raw: rawReading,
          filtered: filteredStatus,
          isAlert: isAlertActive
        };
        const next = [...prev, newPt];
        return next.length > 80 ? next.slice(next.length - 80) : next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [
    sessionStartTime,
    filteredStatus,
    tiltStartTime,
    isAlertActive,
    rawReading,
    startAlarm,
    stopAlarm,
    triggerAlertNotification,
    addIncidentEvent
  ]);

  // Dynamic Browser Tab Title Flashing (Visible when user is in another tab)
  useEffect(() => {
    let interval: number;
    if (isAlertActive) {
      let toggle = false;
      interval = window.setInterval(() => {
        document.title = toggle
          ? '🚨 ¡CABECEO DETECTADO! - UNIDAD #04'
          : '⚠️ ¡ALERTA CRÍTICA WAKEDRIVE!';
        toggle = !toggle;
      }, 600);
    } else {
      document.title = 'WakeDrive Fleet Control | Supervisor de Cabina';
    }
    return () => {
      clearInterval(interval);
      document.title = 'WakeDrive Fleet Control | Supervisor de Cabina';
    };
  }, [isAlertActive]);

  // Simulation handlers
  const simulateErguido = useCallback(() => {
    addTerminalLine('> Simulación: Crudo: 1   Filtrado: ERGUIDO');
    handleDataParsed(1, 'ERGUIDO');
    playTone(520, 0.08);
  }, [addTerminalLine, handleDataParsed, playTone]);

  const simulateInclinado = useCallback(() => {
    addTerminalLine('> Simulación: Crudo: 0   Filtrado: INCLINADO');
    handleDataParsed(0, 'INCLINADO');
    playTone(440, 0.08);
  }, [addTerminalLine, handleDataParsed, playTone]);

  const simulateAlertaInmediata = useCallback(() => {
    addTerminalLine('> Simulación: Crudo: 0   Filtrado: INCLINADO (Umbral > 1.5s Forzado)');
    setTiltStartTime(Date.now() - 1600);
    setRawReading(0);
    setFilteredStatus('INCLINADO');
  }, [addTerminalLine]);

  const resetStats = useCallback(() => {
    setAlertCount(0);
    setEvents([]);
    addTerminalLine('// Contador y bitácora de incidentes reiniciados.');
    playTone(600, 0.05);
  }, [addTerminalLine, playTone]);

  // Support direct URL query simulation testing (?sim=inclinado or ?sim=alerta)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sim = params.get('sim');
    if (sim === 'inclinado') {
      const timer = setTimeout(() => simulateInclinado(), 300);
      return () => clearTimeout(timer);
    } else if (sim === 'alerta') {
      const timer = setTimeout(() => simulateAlertaInmediata(), 300);
      return () => clearTimeout(timer);
    }
  }, [simulateInclinado, simulateAlertaInmediata]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-ambient-dark' : 'bg-ambient-light'} transition-colors duration-300 flex justify-center text-slate-800 dark:text-zinc-100 overflow-x-hidden selection:bg-lime-400 selection:text-black`}>
      <div className="w-full max-w-[1680px] flex min-h-screen">
        {/* 1. Left Slim Sidebar Rail (Desktop md+) */}
        <SidebarRail
          activeTab={activeNavTab}
          onSelectTab={setActiveNavTab}
          isAlertActive={isAlertActive}
        />

        {/* 2. Main Supervisor Dashboard Canvas */}
        <div className="flex-1 flex flex-col min-w-0 px-2 sm:px-4 md:pr-6 py-2 sm:py-4 pb-24 md:pb-8">
        {/* Top Floating Pill Navigation Bar */}
        <TopPillNav
          activeTab={activeNavTab}
          onSelectTab={setActiveNavTab}
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnectSerial={connectSerial}
          onDisconnectSerial={disconnectSerial}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          notificationPermission={permission}
          onRequestNotifications={requestPermission}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isAlertActive={isAlertActive}
        />

        {/* Emergency Alert Banner (With Siren Pulse Glow) */}
        <div className="px-1 mt-2">
          <AlertBanner isActive={isAlertActive} />
        </div>

        {/* Proactive Notification Permission Bar if in 'default' state */}
        {permission === 'default' && (
          <div className="mx-1 mt-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>
                <strong>Supervisión en Segundo Plano:</strong> Permite las notificaciones del navegador para recibir avisos de emergencia reales si estás en otra pestaña.
              </span>
            </div>
            <button
              onClick={requestPermission}
              className="px-3.5 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm shrink-0"
            >
              Habilitar Notificaciones
            </button>
          </div>
        )}

        {/* Main Content Area (Uniform 12-Column Grid with 24px Gaps) */}
        <main className="flex-1 px-1 pt-3 pb-8 space-y-6">
          {activeNavTab === 'simulation' ? (
            /* Dedicated Simulation Workbench */
            <div className="space-y-6">
              <SimulationPanel
                onSimulateErguido={simulateErguido}
                onSimulateInclinado={simulateInclinado}
                onSimulateAlerta={simulateAlertaInmediata}
                onResetStats={resetStats}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6 h-[400px]">
                  <Driver3DView
                    filteredStatus={filteredStatus}
                    isAlertActive={isAlertActive}
                    confirmationProgress={confirmationProgress}
                  />
                </div>
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <TelemetryChart
                    dataPoints={dataPoints}
                    isAlertActive={isAlertActive}
                  />
                  <div className="mt-4">
                    <IncidentHistory
                      events={events}
                      onClear={() => setEvents([])}
                      onSimulateTest={simulateAlertaInmediata}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeNavTab === 'history' ? (
            /* Dedicated History View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IncidentHistory events={events} onClear={() => setEvents([])} onSimulateTest={simulateAlertaInmediata} />
              <TerminalLog lines={terminalLines} onClear={() => setTerminalLines([])} />
            </div>
          ) : activeNavTab === 'hardware' ? (
            /* Dedicated Hardware View */
            <div className="space-y-6">
              <GradientCards
                rawReading={rawReading}
                filteredStatus={filteredStatus}
                confirmationProgress={confirmationProgress}
                isAlertActive={isAlertActive}
                onTriggerTestAlarm={simulateAlertaInmediata}
              />
              <TerminalLog lines={terminalLines} onClear={() => setTerminalLines([])} />
            </div>
          ) : activeNavTab === '3d' ? (
            /* Dedicated 3D Biometrics View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 h-[480px]">
                  <Driver3DView
                    filteredStatus={filteredStatus}
                    isAlertActive={isAlertActive}
                    confirmationProgress={confirmationProgress}
                  />
                </div>
                <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                  <TelemetryChart
                    dataPoints={dataPoints}
                    isAlertActive={isAlertActive}
                  />
                  <GradientCards
                    rawReading={rawReading}
                    filteredStatus={filteredStatus}
                    confirmationProgress={confirmationProgress}
                    isAlertActive={isAlertActive}
                    onTriggerTestAlarm={simulateAlertaInmediata}
                  />
                </div>
              </div>

              {/* Full-Width Biometric Attention Curve & Route Metrics */}
              <RightSideWidgets
                sessionTimeFormatted={sessionTimeFormatted}
                filteredStatus={filteredStatus}
                isAlertActive={isAlertActive}
                confirmationProgress={confirmationProgress}
                alertCount={alertCount}
              />
            </div>
          ) : (
            /* PRIMARY UNIFIED DASHBOARD: Harmonious, Clean, Matched Row Heights */
            <div className="space-y-6">
              {/* ROW 1: Hero Score Card (7 cols) & 3D Procedural Driver Cabin (5 cols) - Matched 420px */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 flex flex-col">
                  <div className="squircle-card p-5 md:p-6 shadow-card h-full flex flex-col justify-between min-h-[420px]">
                    <HeroScoreCard
                      filteredStatus={filteredStatus}
                      isAlertActive={isAlertActive}
                      confirmationProgress={confirmationProgress}
                      alertCount={alertCount}
                    />
                  </div>
                </div>

                {/* Right 5 Cols: High-Precision 3D Driver Model */}
                <div className="lg:col-span-5 flex flex-col h-full min-h-[420px]">
                  <Driver3DView
                    filteredStatus={filteredStatus}
                    isAlertActive={isAlertActive}
                    confirmationProgress={confirmationProgress}
                  />
                </div>
              </div>

              {/* ROW 2: Sensor de Inclinación (6 cols) & Contramedidas Activas (6 cols) */}
              <GradientCards
                rawReading={rawReading}
                filteredStatus={filteredStatus}
                confirmationProgress={confirmationProgress}
                isAlertActive={isAlertActive}
                onTriggerTestAlarm={simulateAlertaInmediata}
              />

              {/* ROW 2: Hours in Route & Full-Width Spline Attention Curve */}
              <RightSideWidgets
                sessionTimeFormatted={sessionTimeFormatted}
                filteredStatus={filteredStatus}
                isAlertActive={isAlertActive}
                confirmationProgress={confirmationProgress}
                alertCount={alertCount}
              />

              {/* ROW 3: Telemetry Oscilloscope (6 cols) & Cabin Simulator (6 cols) - Matched 210px */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6">
                  <TelemetryChart
                    dataPoints={dataPoints}
                    isAlertActive={isAlertActive}
                  />
                </div>
                <div className="lg:col-span-6">
                  <SimulationPanel
                    onSimulateErguido={simulateErguido}
                    onSimulateInclinado={simulateInclinado}
                    onSimulateAlerta={simulateAlertaInmediata}
                    onResetStats={resetStats}
                  />
                </div>
              </div>

              {/* ROW 4: Forensic Anomaly History (6 cols) & Serial COM Monitor (6 cols) - Matched 260px */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6">
                  <IncidentHistory
                    events={events}
                    onClear={() => setEvents([])}
                    onSimulateTest={simulateAlertaInmediata}
                  />
                </div>
                <div className="lg:col-span-6">
                  <TerminalLog
                    lines={terminalLines}
                    onClear={() => setTerminalLines([])}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        activeTab={activeNavTab}
        onSelectTab={setActiveNavTab}
        isAlertActive={isAlertActive}
      />
    </div>
  );
};
