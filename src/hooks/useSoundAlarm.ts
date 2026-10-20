import { useRef, useState, useEffect, useCallback } from 'react';

export function useSoundAlarm() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('wakedrive_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq = 780, duration = 0.12, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.warn('Audio tone error:', err);
    }
  }, [soundEnabled, initAudio]);

  const startAlarm = useCallback(() => {
    if (alarmIntervalRef.current !== null) return;
    if (!soundEnabled) return;

    // Immediate tone
    playTone(880, 0.15, 'triangle');
    // Repeating rapid pulse
    alarmIntervalRef.current = window.setInterval(() => {
      playTone(880, 0.15, 'triangle');
    }, 280);
  }, [soundEnabled, playTone]);

  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current !== null) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('wakedrive_sound', JSON.stringify(next));
      if (!next) {
        stopAlarm();
      } else {
        setTimeout(() => playTone(600, 0.1), 50);
      }
      return next;
    });
  }, [stopAlarm, playTone]);

  useEffect(() => {
    return () => {
      stopAlarm();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAlarm]);

  return {
    soundEnabled,
    toggleSound,
    initAudio,
    playTone,
    startAlarm,
    stopAlarm
  };
}
