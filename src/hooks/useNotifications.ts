import { useState, useEffect, useCallback, useRef } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const lastNotificationTime = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // If permission is default, ask proactively on first user click anywhere
      if (Notification.permission === 'default') {
        const handleFirstInteraction = () => {
          Notification.requestPermission().then((res) => {
            setPermission(res);
          }).catch(() => {});
          window.removeEventListener('click', handleFirstInteraction);
        };
        window.addEventListener('click', handleFirstInteraction, { once: true });
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Las notificaciones del sistema no están soportadas en este navegador.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        const notif = new Notification('🛡️ WakeDrive: Sistema de Flota Activo', {
          body: 'Notificaciones en segundo plano habilitadas. Recibirás alertas reales si cambias de pestaña.',
          icon: '/favicon.ico',
          tag: 'wakedrive-welcome',
          silent: false
        });
        notif.onclick = () => {
          window.focus();
        };
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al solicitar permiso de notificaciones:', err);
      return false;
    }
  }, []);

  const triggerAlertNotification = useCallback(async (title: string, body: string) => {
    const now = Date.now();
    // Throttle notifications to at least 3.5 seconds apart
    if (now - lastNotificationTime.current < 3500) return;
    lastNotificationTime.current = now;

    // Vibrate device / phone if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([400, 150, 400, 150, 600]);
      } catch {
        // Ignore vibration error
      }
    }

    if (!('Notification' in window)) return;

    let currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      try {
        currentPerm = await Notification.requestPermission();
        setPermission(currentPerm);
      } catch {
        // Fallback
      }
    }

    if (currentPerm === 'granted') {
      try {
        // Send actual native OS / browser notification
        const notification = new Notification(title, {
          body,
          tag: 'wakedrive-critical-alert',
          requireInteraction: true, // Keep notification on screen until user clicks
          silent: false
        });

        // Clicking the notification brings the user back to the tab
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('Error enviando notificación nativa del navegador:', err);
      }
    }
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    triggerAlertNotification
  };
}
