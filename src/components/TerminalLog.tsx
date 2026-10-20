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
    <div className="squircle-card p-5 shadow-card flex flex-col justify-between h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Monitor Serie COM
          </span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
            9600 Baud ({lines.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
              autoScroll
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
            }`}
            title="Desplazamiento automático"
            aria-label="Alternar auto-scroll del monitor serie"
          >
            <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          <button
            onClick={handleCopy}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition active:scale-95"
            title="Copiar flujo serial"
            aria-label="Copiar líneas de terminal serial al portapapeles"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.75} />
            ) : (
              <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
          </button>

          <button
            onClick={onClear}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition active:scale-95"
            title="Limpiar buffer"
            aria-label="Limpiar terminal serial"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Terminal Viewport (Apple Terminal macOS styling) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed p-3 rounded-xl bg-zinc-950 text-zinc-300 space-y-1 border border-zinc-800/80 shadow-inner"
      >
        {lines.length === 0 ? (
          <div className="text-zinc-500 italic py-6 text-center text-xs">
            Sin paquetes telemétricos en buffer. Conecta el puerto USB o inicia el simulador.
          </div>
        ) : (
          lines.map((line, index) => {
            let textColor = 'text-zinc-400';
            if (line.includes('INCLINADO') || line.includes('Error')) {
              textColor = 'text-amber-400';
            }
            if (line.includes('Alerta') || line.includes('DISPARADO') || line.includes('Crítica') || line.includes('Umbral')) {
              textColor = 'text-red-400 font-semibold';
            }
            if (line.includes('ERGUIDO') || line.includes('Conectado')) {
              textColor = 'text-emerald-400';
            }
            return (
              <div key={index} className="flex gap-2.5">
                <span className="text-zinc-600 select-none tabular-nums shrink-0">{String(index + 1).padStart(3, '0')}</span>
                <span className={`${textColor} break-all`}>{line}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
