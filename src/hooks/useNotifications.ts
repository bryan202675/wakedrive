import { useState, useEffect, useCallback, useRef } from 'react';

const ALERT_ICON = '/alert-icon.svg';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const lastNotificationTime = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Register Service Worker for robust notification delivery
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            swRegistrationRef.current = reg;
          })
          .catch(() => {
            // Ignore SW registration error, fallback to new Notification()
          });
      }

      // Proactively request permission on first user gesture anywhere
      if (Notification.permission === 'default') {
        const handleFirstInteraction = () => {
          Notification.requestPermission()
            .then((res) => {
              setPermission(res);
            })
            .catch(() => {});
          window.removeEventListener('click', handleFirstInteraction);
          window.removeEventListener('keydown', handleFirstInteraction);
          window.removeEventListener('touchstart', handleFirstInteraction);
        };
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { once: true });
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Las notificaciones del sistema no están soportadas en este navegador.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Send a test confirmation notification
        const welcomeTitle = '🛡️ WakeDrive: Notificaciones Activas';
        const welcomeOptions: NotificationOptions = {
          body: 'Notificaciones en tiempo real habilitadas. Recibirás avisos ante cualquier detección de somnolencia.',
          icon: ALERT_ICON,
          badge: ALERT_ICON,
          tag: `wakedrive-welcome-${Date.now()}`
        };

        if (swRegistrationRef.current && 'showNotification' in swRegistrationRef.current) {
          swRegistrationRef.current.showNotification(welcomeTitle, welcomeOptions);
        } else {
          const notif = new Notification(welcomeTitle, welcomeOptions);
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al solicitar permiso de notificaciones:', err);
      return false;
    }
  }, []);

  const triggerAlertNotification = useCallback(
    async (title: string, body: string) => {
      const now = Date.now();
      // Throttle rapid repeated triggers to at least 2.5 seconds apart
      if (now - lastNotificationTime.current < 2500) return;
      lastNotificationTime.current = now;

      // Vibrate mobile device if hardware supports vibration
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([400, 150, 400, 150, 600]);
        } catch {
          // Ignore vibration errors
        }
      }

      if (typeof window === 'undefined' || !('Notification' in window)) return;

      let currentPerm = Notification.permission;
      if (currentPerm !== 'granted') {
        // If not yet granted, attempt requesting permission
        try {
          currentPerm = await Notification.requestPermission();
          setPermission(currentPerm);
        } catch {
          return;
        }
      }

      if (currentPerm === 'granted') {
        const uniqueTag = `wakedrive-drowsy-${Date.now()}`;
        const notificationOptions: NotificationOptions = {
          body,
          icon: ALERT_ICON,
          badge: ALERT_ICON,
          tag: uniqueTag,
          requireInteraction: true, // Remains on screen until user acknowledges
          silent: false
        };

        try {
          // Prefer Service Worker showNotification if active
          if (swRegistrationRef.current && 'showNotification' in swRegistrationRef.current) {
            await swRegistrationRef.current.showNotification(title, notificationOptions);
          } else {
            // Standard Web Notification API
            const notification = new Notification(title, notificationOptions);
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        } catch (err) {
          console.warn('Fallback al crear notificación nativa:', err);
          try {
            const fallbackNotif = new Notification(title, {
              body,
              tag: uniqueTag
            });
            fallbackNotif.onclick = () => {
              window.focus();
              fallbackNotif.close();
            };
          } catch (e) {
            console.error('Error emitiendo notificación nativa:', e);
          }
        }
      }
    },
    []
  );

  return {
    isSupported,
    permission,
    requestPermission,
    triggerAlertNotification
  };
}
