# Guía de Conexión del Motor de Vibración y Circuito Completo

Esta guía detalla paso a paso cómo conectar el **motor de vibración**, el **buzzer** y el **sensor de inclinación** a tu Arduino según el código que proporcionaste.

---

## 1. ¿Por qué NO conectar el motor de vibración directamente al Pin 9?

1. **Límite de corriente del Arduino:** Un pin digital de Arduino entrega un máximo seguro de **20 mA a 40 mA**. Un motor de vibración (incluso los pequeños de moneda) consume entre **60 mA y 120 mA** al arrancar. Si lo conectas directo, se quemará la salida del microcontrolador.
2. **Picos de voltaje inductivo (Back-EMF):** Al ser una bobina que gira, cuando el pin apaga el motor, se produce una corriente inversa de alto voltaje. Por eso se requiere un **diodo de protección (flyback)**.

Para solucionarlo, usamos un **transistor NPN** como interruptor y una **resistencia de 1 kΩ** en la base.

---

## 2. Componentes Necesarios para la Vibración

| Componente | Especificación / Modelo sugerido | Función |
| :--- | :--- | :--- |
| **Motor de vibración** | 3V o 5V (tipo moneda o encapsulado con 2 cables) | Emite la vibración táctil |
| **Transistor NPN** | **2N2222**, **BC547**, **BC548**, **2N3904** o **TIP120** | Actúa de interruptor de potencia |
| **Resistencia** | **1 kΩ** (Marrón, Negro, Rojo, Dorado) | Limita la corriente hacia la base del transistor |
| **Diodo** | **1N4001**, **1N4007** o **1N4148** | Protege contra picos de voltaje del motor |

---

## 3. Identificación de Patitas del Transistor NPN (Vista Plana de Frente)

Pon la cara plana del transistor mirando hacia ti:

### Si usas **2N2222** o **2N3904**:
```text
      _______
     | 2N2222|  (Cara plana de frente)
     |_______|
       | | |
       1 2 3
       | | |
       E B C
```
- **Pin 1 (Izquierda):** Emisor (E)
- **Pin 2 (Centro):** Base (B)
- **Pin 3 (Derecha):** Colector (C)

### Si usas **BC547** o **BC548**:
```text
      _______
     | BC547 |  (Cara plana de frente)
     |_______|
       | | |
       1 2 3
       | | |
       C B E
```
- **Pin 1 (Izquierda):** Colector (C)
- **Pin 2 (Centro):** Base (B)
- **Pin 3 (Derecha):** Emisor (E)

---

## 4. Diagrama Esquemático de Conexión del Motor

```text
                  +5V (o 3.3V de Arduino)
                     │
                     ├───┐
                     │   │
                   [+]   │
               ┌───────┐ │
               │ MOTOR │ │ [Diodo 1N4001]
               │ VIBR. │ │  (Cátodo / franja gris hacia +5V)
               └───────┘ │   ▲
                   [-]   │   │
                     │   │
                     ├───┘
                     │
                (C) Colector
                 ┌──────┐
 Arduino         │      │ Transistor NPN
 Pin 9 ──[ 1kΩ ]─┤ Base │ (2N2222 / BC547)
                 │      │
                 └──────┘
                (E) Emisor
                     │
                    GND (Tierra común de Arduino)
```

---

## 5. Paso a Paso para Conectar los Cables

1. **La Base (Señal de control):**
   - Conecta un cable desde el **Pin 9** del Arduino a una pata de la **resistencia de 1 kΩ**.
   - Conecta la otra pata de la resistencia a la **Base (B)** del transistor.
2. **El Emisor (Tierra):**
   - Conecta el **Emisor (E)** del transistor directamente al **GND** de Arduino.
3. **El Colector (Negativo del Motor):**
   - Conecta el **Colector (C)** del transistor al cable **negativo** (azul o negro) del motor de vibración.
4. **Alimentación del Motor (Positivo):**
   - Conecta el cable **positivo** (rojo) del motor al pin **5V** de Arduino (o a **3.3V** si tu motor es específicamente de 3V para no forzarlo).
5. **El Diodo de Protección (Muy importante):**
   - Coloca el diodo en paralelo con los 2 cables del motor:
     - El extremo con la **franja gris/blanca** (Cátodo) va al cable **Rojo (+)** del motor (a 5V).
     - El extremo **sin franja** (Ánodo) va al cable **Azul/Negro (-)** del motor (al Colector).

---

## 6. ¿Tienes un Módulo de Vibración ya armado (con plaquita PCB de 3 pines)?

Si compraste un módulo que ya viene en una placa pequeña con 3 pines marcados como `VCC`, `GND` e `IN` (o `SIG`):
- **VCC:** Conéctalo a **5V** (o 3.3V) de Arduino.
- **GND:** Conéctalo a **GND** de Arduino.
- **IN / SIG:** Conéctalo directo al **Pin 9** de Arduino. *(En estos módulos, el transistor y el diodo ya vienen soldados en la placa).*

---

## 7. Tabla Resumen de Todo el Circuito del Proyecto

| Dispositivo | Pin en Módulo | Conexión en Arduino |
| :--- | :--- | :--- |
| **Sensor de Inclinación (Tilt)** | VCC | 5V |
| | GND | GND |
| | D0 (Salida Digital) | **Pin 10** |
| **Buzzer Activo** | Positivo (+) | **Pin 8** |
| | Negativo (-) | GND |
| **Vibración** | Entrada Base (vía 1kΩ) | **Pin 9** |
| | Tierra de potencia | GND |
| | Alimentación motor | 5V / 3.3V |
