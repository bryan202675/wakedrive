/*
 * ==============================================================
 * PROYECTO: WAKEDRIVE - DETECTOR DE SOMNOLENCIA (ARDUINO)
 * ==============================================================
 * Hardware:
 *   - Pin 10: Sensor de inclinación / tilt (D0)
 *   - Pin 8:  Buzzer activo (+)
 *   - Pin 9:  Motor de vibración (a través de transistor NPN con resistencia 1k)
 *
 * Salida Serial a 9600 baudios compatible con la interfaz web:
 *   "Crudo: [0|1]   Filtrado: [INCLINADO|ERGUIDO]"
 */

const int sensorPin = 10;  // D0 del módulo de inclinación
const int buzzerPin = 8;   // buzzer activo (+)
const int motorPin  = 9;   // base del transistor (con resistencia de 1k)

// Con true:  inclinado = 1 (HIGH), erguido = 0 (LOW)
// Con false: inclinado = 0 (LOW),  erguido = 1 (HIGH)
const bool ACTIVO_EN_HIGH = false;

const unsigned long tiempoEstable      = 300;  // ms que debe mantenerse una lectura (filtro anti-rebote)
const unsigned long tiempoConfirmacion = 1500; // ms inclinado antes de alertar (1.5 segundos)
const unsigned long intervaloPulso     = 200;  // ms de cada pulso de vibración y sonido

bool estadoFiltrado = false;
bool ultimaLectura = false;
unsigned long inicioCambio = 0;
unsigned long inicioInclinacion = 0;

void setup() {
  pinMode(sensorPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(motorPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lectura = digitalRead(sensorPin);
  bool lecturaActiva = (lectura == (ACTIVO_EN_HIGH ? HIGH : LOW));

  // Filtro anti-rebote: la lectura debe mantenerse antes de aceptarla
  if (lecturaActiva != ultimaLectura) {
    ultimaLectura = lecturaActiva;
    inicioCambio = millis();
  }
  if (millis() - inicioCambio >= tiempoEstable && estadoFiltrado != ultimaLectura) {
    estadoFiltrado = ultimaLectura;
    if (estadoFiltrado) inicioInclinacion = millis();
  }

  // Salida serial para la interfaz web y monitor serial
  Serial.print("Crudo: ");
  Serial.print(lectura);
  Serial.print("   Filtrado: ");
  Serial.println(estadoFiltrado ? "INCLINADO" : "ERGUIDO");

  // Alerta solo si se mantiene inclinado por más del tiempo de confirmación
  bool alerta = estadoFiltrado && (millis() - inicioInclinacion >= tiempoConfirmacion);

  if (alerta) {
    // Genera pulsos intermitentes cada 200 ms
    bool encendido = ((millis() / intervaloPulso) % 2 == 0);
    digitalWrite(buzzerPin, encendido);
    digitalWrite(motorPin, encendido);
  } else {
    digitalWrite(buzzerPin, LOW);
    digitalWrite(motorPin, LOW);
  }

  delay(20);
}
