# 🛡️ WakeDrive — Fleet Safety & Fatigue Monitoring System

> Sistema telemétrico en tiempo real para detección de somnolencia, cabeceo postural y prevención de accidentes en ruta.

🌐 **Despliegue en producción:** [https://wakedrive.vercel.app/](https://wakedrive.vercel.app/)

---

## 🚀 Características Principales

* **Detección de Somnolencia en Tiempo Real:** Algoritmo de filtrado con umbral continuo de 1.5 s para prevención de microsueños y fatiga crítica.
* **Notificaciones Nativas del Navegador (Web Notifications API):** Emisión de alertas críticas del sistema operativo con foco automático a la cabina incluso con la pestaña en segundo plano.
* **Visualizador Biomecánico 3D:** Renderizado en Three.js con seguimiento de cabeceo (Pitch) y postura de cabina.
* **Integración Telemétrica Hardware:** Comunicación serial directa a 9600 Baud vía Web Serial API (Arduino Uno + Sensor de Inclinación SW-520D).
* **Contramedidas en Cabina:** Activación acústica (Buzzer) y háptica (Motor Vibrador NPN).
* **Bitácora Forense:** Registro en tiempo real de incidentes y restablecimientos de postura.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
* **3D & Gráficos:** Three.js, Lucide Icons
* **Hardware & Audio:** Web Serial API, Web Audio API, Web Notifications API
* **Cloud & Deploy:** Vercel

---

## 📦 Instalación y Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
