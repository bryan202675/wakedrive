import React, { useRef, useEffect } from 'react';
import { TelemetryPoint } from '../types';
import { Activity } from 'lucide-react';

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
      const w = rect.width;
      const h = rect.height;
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Subtle Precision Grid (Apple Instruments style)
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 0.7;

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
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
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
          const noise = Math.sin(x * 0.08 + idleTickRef.current) * 1.5 + (Math.random() - 0.5) * 0.8;
          const y = h * 0.74 + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#71717a';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "SF Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Traza viva en reposo (HIGH: 5V)', w - 10, h * 0.74 - 8);
        ctx.restore();
        return;
      }

      const step = w / (maxPoints - 1);

      // Red hazard tint for active alert zones
      for (let i = 0; i < dataPoints.length; i++) {
        if (dataPoints[i].isAlert) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
          ctx.fillRect(i * step, 0, step + 1, h);
        }
      }

      // 1. RAW Sensor Trace (Dashed Zinc)
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#71717a';
      ctx.setLineDash([2, 3]);
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
      ctx.lineWidth = 2.2;
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
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    render();
    animId = requestAnimationFrame(function loop() {
      render();
      animId = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animId);
  }, [dataPoints, maxPoints, isAlertActive]);

  return (
    <div className="squircle-card p-5 md:p-6 flex flex-col justify-between h-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Osciloscopio D0 (Pin 10)
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Captura en tiempo real a 20 ms
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-b border-dashed border-zinc-400 inline-block"></span>
            Crudo
          </span>
          <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Filtrado
          </span>
        </div>
      </div>

      {/* Canvas Display with Y-Axis and Guidelines */}
      <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 flex my-1.5 shadow-inner">
        {/* Y-Axis Labels */}
        <div className="w-12 h-full flex flex-col justify-between py-2 pl-2 text-[9px] font-mono text-zinc-500 select-none border-r border-zinc-800/60 bg-zinc-950">
          <span>0V (Low)</span>
          <span className="text-red-400/80">1.5s</span>
          <span>5V (High)</span>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="relative flex-1 h-full">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500">
        <span>Ventana: 1.6 s (80 pts)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">En vivo</span>
      </div>
    </div>
  );
};
