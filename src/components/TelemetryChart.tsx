import React, { useRef, useEffect } from 'react';
import { TelemetryPoint } from '../types';
import { Activity, Zap } from 'lucide-react';

interface TelemetryChartProps {
  dataPoints: TelemetryPoint[];
  maxPoints?: number;
  isAlertActive: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  dataPoints,
  maxPoints = 80,
  isAlertActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idleTickRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Subtle Oscilloscope Grid
      ctx.strokeStyle = '#1e2638';
      ctx.lineWidth = 0.8;

      for (let y = 16; y < h; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      for (let x = 0; x < w; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Threshold guideline at 1.5s warning height (Red dashed line)
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.46);
      ctx.lineTo(w, h * 0.46);
      ctx.stroke();
      ctx.restore();

      idleTickRef.current += 0.05;

      // When points are few, draw live baseline trace with subtle electrical noise (Reposo: 5V HIGH)
      if (dataPoints.length < 3) {
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x += 3) {
          const noise = Math.sin(x * 0.08 + idleTickRef.current) * 1.5 + (Math.random() - 0.5) * 0.9;
          const y = h * 0.74 + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Traza viva en reposo (HIGH: 5V)', w - 10, h * 0.74 - 8);
        return;
      }

      const step = w / (maxPoints - 1);

      // Red danger wash for active alert zones
      for (let i = 0; i < dataPoints.length; i++) {
        if (dataPoints[i].isAlert) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fillRect(i * step, 0, step + 1, h);
        }
      }

      // 1. RAW Sensor Trace (Dashed Grey)
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      dataPoints.forEach((pt, i) => {
        const x = i * step;
        const y = pt.raw === 0 ? h * 0.22 : h * 0.74;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      // 2. FILTERED 300ms Signal Trace (Solid Green / Amber / Red)
      ctx.beginPath();
      ctx.strokeStyle = isAlertActive ? '#ef4444' : dataPoints[dataPoints.length - 1]?.filtered === 'INCLINADO' ? '#f59e0b' : '#10b981';
      ctx.lineWidth = 2.4;
      dataPoints.forEach((pt, i) => {
        const x = i * step;
        const y = pt.filtered === 'INCLINADO' ? h * 0.22 : h * 0.74;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Pulsing head point on the latest reading
      const lastX = (dataPoints.length - 1) * step;
      const lastY = dataPoints[dataPoints.length - 1]?.filtered === 'INCLINADO' ? h * 0.22 : h * 0.74;

      ctx.fillStyle = isAlertActive ? '#ef4444' : dataPoints[dataPoints.length - 1]?.filtered === 'INCLINADO' ? '#f59e0b' : '#10b981';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
      ctx.fill();
    };

    render();
    animId = requestAnimationFrame(function loop() {
      render();
      animId = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animId);
  }, [dataPoints, maxPoints, isAlertActive]);

  return (
    <div className="squircle-card p-5 md:p-6 flex flex-col justify-between h-[240px] shadow-card transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Osciloscopio Señal D0 (Pin 10)
            </span>
            <span className="text-xs text-slate-400">
              Captura en tiempo real a 20 ms
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400 inline-block"></span>
            Crudo (D0)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span>
            Filtrado (300ms)
          </span>
        </div>
      </div>

      {/* Canvas Display with Y-Axis and Guidelines */}
      <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex">
        {/* Y-Axis Labels */}
        <div className="w-12 h-full flex flex-col justify-between py-2 pl-2 text-[9px] font-mono text-slate-500 select-none border-r border-slate-800/60 bg-slate-950/80">
          <span>0V (Low)</span>
          <span className="text-red-400 font-semibold">1.5s</span>
          <span>5V (High)</span>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="relative flex-1 h-full">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Ventana temporal: 1.6 s (80 muestras)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Traza en Vivo</span>
      </div>
    </div>
  );
};
