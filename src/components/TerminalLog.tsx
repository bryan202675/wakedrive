import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, ArrowDown, Copy, Check } from 'lucide-react';

interface TerminalLogProps {
  lines: string[];
  onClear: () => void;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ lines, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const handleCopy = () => {
    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="squircle-card p-4 shadow-card flex flex-col justify-between h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
            Monitor Serie COM &bull; 9600 Baud
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 tabular-nums">
            {lines.length} líneas
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg text-xs font-mono transition active:scale-95 focus:ring-1 focus:ring-slate-400 focus:outline-none ${
              autoScroll
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
            title="Desplazamiento automático"
            aria-label="Alternar auto-scroll del monitor serie"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95 focus:ring-1 focus:ring-slate-400 focus:outline-none"
            title="Copiar flujo serial"
            aria-label="Copiar líneas de terminal serial al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95 focus:ring-1 focus:ring-slate-400 focus:outline-none"
            title="Limpiar buffer"
            aria-label="Limpiar terminal serial"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed p-2.5 rounded-xl bg-[#07090e] text-slate-300 space-y-0.5 border border-slate-800"
      >
        {lines.length === 0 ? (
          <div className="text-slate-500 italic py-6 text-center text-xs">
            Sin paquetes telemétricos en buffer. Conecta el puerto USB o inicia el simulador.
          </div>
        ) : (
          lines.map((line, index) => {
            let textColor = 'text-slate-400';
            if (line.includes('INCLINADO') || line.includes('Error')) {
              textColor = 'text-amber-400';
            }
            if (line.includes('Alerta') || line.includes('DISPARADO') || line.includes('Crítica') || line.includes('Umbral')) {
              textColor = 'text-red-400 font-bold';
            }
            if (line.includes('ERGUIDO') || line.includes('Conectado')) {
              textColor = 'text-emerald-400';
            }
            return (
              <div key={index} className="flex gap-2">
                <span className="text-slate-600 select-none tabular-nums">{String(index + 1).padStart(3, '0')}</span>
                <span className={textColor}>{line}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
