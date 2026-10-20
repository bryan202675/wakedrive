import { useState, useRef, useCallback } from 'react';
import { FilteredStatus } from '../types';

interface UseWebSerialProps {
  onDataParsed: (raw: number, filtered: FilteredStatus) => void;
  onRawLine: (line: string) => void;
}

export function useWebSerial({ onDataParsed, onRawLine }: UseWebSerialProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readerRef = useRef<any>(null);
  const lineBufferRef = useRef('');

  const regexSerialLine = /Crudo:\s*([01])\s+Filtrado:\s*(INCLINADO|ERGUIDO)/i;

  const disconnectSerial = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      if (portRef.current) {
        await portRef.current.close();
      }
    } catch (err) {
      console.warn('Error al cerrar puerto serial:', err);
    } finally {
      portRef.current = null;
      readerRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      onRawLine('--- Puerto Serie COM desconectado ---');
    }
  }, [onRawLine]);

  const connectSerial = useCallback(async () => {
    if (!('serial' in navigator)) {
      alert('La Web Serial API no está disponible en este navegador.\n\nAbre WakeDrive en Google Chrome, Microsoft Edge, Opera o Brave.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const navSerial = (navigator as any).serial;
      const port = await navSerial.requestPort();
      // Arduino configuration: 9600 baud, 8N1
      await port.open({ baudRate: 9600 });

      portRef.current = port;
      setIsConnected(true);
      setIsConnecting(false);
      onRawLine('--- Conectado por puerto COM a 9600 baudios ---');

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable).catch((e: Error) => {
        console.warn('Stream pipe cerrado:', e);
      });
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      readLoop(reader);
    } catch (err: unknown) {
      setIsConnecting(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      onRawLine(`Error de conexión: ${errMsg}`);
      console.error('Error al conectar puerto serial:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRawLine]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readLoop = async (reader: any) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          lineBufferRef.current += value;
          const lines = lineBufferRef.current.split('\n');
          lineBufferRef.current = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            onRawLine(trimmed);

            const match = trimmed.match(regexSerialLine);
            if (match) {
              const raw = parseInt(match[1], 10);
              const filtered = match[2].toUpperCase() as FilteredStatus;
              onDataParsed(raw, filtered);
            }
          }
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      onRawLine(`Desconexión serial: ${errMsg}`);
    } finally {
      if (reader) {
        try {
          reader.releaseLock();
        } catch {
          // Ignore release lock error
        }
      }
      setIsConnected(false);
    }
  };

  return {
    isConnected,
    isConnecting,
    error,
    connectSerial,
    disconnectSerial
  };
}
