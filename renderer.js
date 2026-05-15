let selectedSensor = null;
let hallLightningInterval = null;  
let _wfParticles = [];
let _wfAnimId    = null;
let _wfFromDeg   = 0;

function _wfSpawn(fromDeg) {
  return {
    t: 0,
    speed: 0.005 + Math.random() * 0.005,
    fromDeg: fromDeg,
    laneOffset: (Math.random() - 0.5) * 18,
    opacity: 0.55 + Math.random() * 0.45,
    wavePhase: Math.random() * Math.PI * 2,
    waveAmp: 2 + Math.random() * 3,
    waveFreq: 3 + Math.random() * 4,
    size: 2.8 + Math.random() * 1.8
  };
}

function _wfAnimate() {
  const container = document.getElementById('wave-particles');
  if (!container) return;

  if (Math.random() < 0.12) _wfParticles.push(_wfSpawn(_wfFromDeg));
  _wfParticles = _wfParticles.filter(p => p.t <= 1);

  let html = '';
  for (const p of _wfParticles) {
    p.t += p.speed;
    const t = p.t;
    if (t > 1) continue;

    const fromRad = (p.fromDeg - 90) * Math.PI / 180;
    const perpRad = fromRad + Math.PI / 2;

    const r = 58 * (1 - 2 * t);
    const ax = 65 + Math.cos(fromRad) * r;
    const ay = 65 + Math.sin(fromRad) * r;

    const lx = Math.cos(perpRad) * p.laneOffset;
    const ly = Math.sin(perpRad) * p.laneOffset;
    const wobble = Math.sin(p.wavePhase + t * p.waveFreq) * p.waveAmp;
    const wx = Math.cos(perpRad) * wobble;
    const wy = Math.sin(perpRad) * wobble;

    const bx = ax + lx + wx;
    const by = ay + ly + wy;

    let alpha = p.opacity;
    if (t < 0.1) alpha *= t / 0.1;
    if (t > 0.9) alpha *= (1 - t) / 0.1;

    const scale = 0.4 + 0.6 * Math.sin(t * Math.PI);
    const sz = p.size * scale;

    // arrow points in travel direction (fromRad + π = toRad)
    const travelRad = fromRad + Math.PI;
    const angleDeg = (travelRad * 180 / Math.PI);

    // chevron/arrow shape: two lines meeting at a point
    const aw = sz * 1.4;   // arrow half-width
    const ah = sz * 1.2;   // arrow depth

    // tip point (forward)
    const tipX = bx + Math.cos(travelRad) * ah;
    const tipY = by + Math.sin(travelRad) * ah;

    // left wing
    const lwx = bx + Math.cos(travelRad + Math.PI * 0.65) * aw;
    const lwy = by + Math.sin(travelRad + Math.PI * 0.65) * aw;

    // right wing
    const rwx = bx + Math.cos(travelRad - Math.PI * 0.65) * aw;
    const rwy = by + Math.sin(travelRad - Math.PI * 0.65) * aw;

    // tail stub (short line behind tip for > chevron feel)
    const tailX = bx - Math.cos(travelRad) * (ah * 1.4);
    const tailY = by - Math.sin(travelRad) * (ah * 1.4);

    html += `
      <g opacity="${alpha.toFixed(2)}">
        <polyline 
          points="${lwx.toFixed(1)},${lwy.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${rwx.toFixed(1)},${rwy.toFixed(1)}"
          fill="none" stroke="#60a5fa" stroke-width="${(sz * 0.9).toFixed(1)}"
          stroke-linecap="round" stroke-linejoin="round"/>
        <line 
          x1="${tipX.toFixed(1)}" y1="${tipY.toFixed(1)}"
          x2="${tailX.toFixed(1)}" y2="${tailY.toFixed(1)}"
          stroke="#93c5fd" stroke-width="${(sz * 0.5).toFixed(1)}"
          stroke-linecap="round" opacity="0.5"/>
      </g>`;
  }

  container.innerHTML = html;
  _wfAnimId = requestAnimationFrame(_wfAnimate);
}

function _wfStart() {
  if (_wfAnimId) { cancelAnimationFrame(_wfAnimId); _wfAnimId = null; }
  _wfParticles = [];
  for (let i = 0; i < 12; i++) {
    const p = _wfSpawn(_wfFromDeg);
    p.t = Math.random();
    _wfParticles.push(p);
  }
  _wfAnimate();
}

function _wfStop() {
  if (_wfAnimId) { cancelAnimationFrame(_wfAnimId); _wfAnimId = null; }
  _wfParticles = [];
  const c = document.getElementById('wave-particles');
  if (c) c.innerHTML = '';
}

function getCardinalFrom(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function updateWindFlowCard(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const from = getCardinalFrom(deg);
  const to = dirs[(dirs.indexOf(from) + 4) % 8];

  document.getElementById('flow-from').textContent = from;
  document.getElementById('flow-to').textContent   = to;
  document.getElementById('flow-label').textContent = `WIND BLOWING FROM ${from}`;
  document.getElementById('flow-degree').textContent = `${deg.toFixed(0)}°`;
  document.getElementById('flow-desc').textContent   = `Moving toward ${to}`;

  _wfFromDeg = deg;
  _wfStart();
}

// ── Wind Bubble Particle System ──
let _windBubbleInterval = null;
let _windBubbleActive = false;
let _windBubbleSpeed = 0;

function _startWindBubbles(speed) {
  // Always restart to apply new speed
  _stopWindBubbles();
  _windBubbleActive = true;
  _windBubbleSpeed = speed;

  const card = document.getElementById("wind-speed-card");
  if (!card) return;

  card.style.overflow = "hidden";
  card.style.position = "relative";

  // Speed-based spawn rate: slow=400ms, fast=40ms
  const spawnRate = speed >= 3
  ? Math.max(8, 120 - (speed - 3) * 40)
  : Math.max(350, 450 - speed * 20);

  const spawn = () => {
    if (!_windBubbleActive) return;
    const card = document.getElementById("wind-speed-card");
    if (!card) return;

    const currentSpeed = _windBubbleSpeed;

    // Size grows slightly with speed
    const size = 2 + Math.random() * (2 + (currentSpeed / 20) * 4);

    // Travel duration: fast wind = short duration
    const dur = currentSpeed >= 3
    ? Math.max(0.1, 0.8 - (currentSpeed - 3) * 0.1) + Math.random() * 0.08
    : Math.max(1.5, 2.5 - currentSpeed * 0.1) + Math.random() * 0.4;

    const startY = 5 + Math.random() * 88;
    const alpha  = 0.5 + Math.random() * 0.4;
    const driftY = (Math.random() - 0.5) * 40;

    const bubble = document.createElement("div");

    Object.assign(bubble.style, {
      position:      "absolute",
      width:         `${size}px`,
      height:        `${size}px`,
      borderRadius:  "50%",
      background:    `rgba(200, 225, 255, ${alpha})`,
      boxShadow:     `0 0 2px rgba(200, 225, 255, 0.5), inset 0 0 1px rgba(255,255,255,0.8)`,
      left:          "-10px",
      top:           `${startY}%`,
      pointerEvents: "none",
      zIndex:        "10",
      opacity:       "0",
    });

    card.appendChild(bubble);

    const cardW  = card.offsetWidth + 20;
    const start  = performance.now();

    const tick = (now) => {
      if (!_windBubbleActive) {
        if (bubble.parentNode) bubble.remove();
        return;
      }

      const t = Math.min((now - start) / 1000 / dur, 1);

      // Fade in 0→15%, hold 15→80%, fade out 80→100%
      let op;
      if      (t < 0.15) op = (t / 0.15) * alpha;
      else if (t > 0.80) op = ((1 - t) / 0.20) * alpha;
      else               op = alpha;

      const x = t * cardW;
      const y = driftY * Math.sin(t * Math.PI);

      bubble.style.opacity   = op;
      bubble.style.transform = `translate(${x}px, ${y}px)`;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        if (bubble.parentNode) bubble.remove();
      }
    };

    requestAnimationFrame(tick);
  };

  // Spawn immediately then on interval
  spawn();
  _windBubbleInterval = setInterval(spawn, spawnRate);
}

function _stopWindBubbles() {
  _windBubbleActive = false;
  _windBubbleSpeed = 0;

  if (_windBubbleInterval) {
    clearInterval(_windBubbleInterval);
    _windBubbleInterval = null;
  }

  const card = document.getElementById("wind-speed-card");
  if (card) {
    // Remove all bubbles that have no class (our dynamically created ones)
    Array.from(card.children).forEach(child => {
      if (!child.id && !child.className && child.tagName === "DIV") {
        child.remove();
      }
    });
  }
}

const selectedBackend = localStorage.getItem('selectedDevice'); // 'c' or 'python'
let isPythonBackend = selectedBackend === 'python';

const sensorProtocolMap = {
  "I2C": ["SHT40", "AHT20", "BME680", "STS30", "STTS751", "LIS3DH", "VEML7700", "TLV493D", "VL53L0X", "LTR390", "Weather Shield", "VCNL4040", "SEN66"],
  "RS485": ["MD02"],
  "RS232": ["Wind Sensor"],
  "SPI": [],
  "Analog": ["Hall Sensor", "IR Sensor"],
  "ADC": ["Rain Gauge"],
  "GPIO": ["Blinky", "Buzzer", "Relay"],
  "WEATHER": ["Weather Parameters"]
};
// Track sensor presence and data
let sensorStatus = {
  "I2C": { SHT40: false, AHT20: false, BME680: false, STS30: false, STTS751: false, LIS3DH: false, VEML7700: false, TLV493D: false, VL53L0X: false, LTR390: false, WeatherShield: false, SEN66: false },
  "RS485": { MD02: false },
  "RS232": { WindSensor: false },
  "SPI": {},
  "Analog": { Hall_Sensor: false, IR_Sensor: false },
  "ADC": { "Rain Gauge": false },
  "GPIO": { "Blinky": false, "Buzzer": false },
  "WEATHER": { "WeatherParameters": true }
};
let sensorData = {
  "I2C": {},
  "ADC": {},
  "RS232": {},
  "WEATHER": {},
  "RS485": {},
  "SPI": {},
  "Analog": {},
  "GPIO": {}
};
let currentTemperature = null;
let currentHumidity = null;
let currentPressure = null;
let currentLight = null;
let currentVCNLLux = null;        // ← ADD THIS
let currentVCNLProximity = null;  // ← ADD THIS (optional, if your firmware sends proximity)
let currentAccelX = null;
let currentAccelY = null;
let currentAccelZ = null;
let currentMagneticField = null;
let currentMagneticX = null;
let currentMagneticY = null;
let currentMagneticZ = null;
let currentDistance = null;
let currentUV = null;
let currentIR = null;
let currentRelayState = null;
let currentWindDirection = null;
let currentWindSpeed = null;
// ── SEN66 globals ──
let currentSEN66_PM1  = null;
let currentSEN66_PM25 = null;
let currentSEN66_PM4  = null;
let currentSEN66_PM10 = null;
let currentSEN66_Hum  = null;
let currentSEN66_Temp = null;
let currentSEN66_VOC  = null;
let currentSEN66_NOx  = null;
let currentSEN66_CO2  = null;

 
// ── SEN66 particle canvas state ──
let _sen66Canvas    = null;
let _sen66Ctx       = null;
let _sen66Particles = [];
let _sen66AnimFrame = null;
let _sen66PM25Level = 0;
let prevAzimuth = 0;
let prevPolar = 0;
let prevMagnitude = 0;
let prevScale = 1;
let isConnected = false;
let currentBaud = null;
let currentPort = null;

const MAX_LOG_LINES = 100;
let _logLineCount = 0;

function appendLog(html, cssClass = 'log-default') {
  const outputDiv = document.getElementById('output');
  if (!outputDiv) return;
  const span = document.createElement('span');
  span.className = `log-line ${cssClass}`;
  span.innerHTML = html;
  outputDiv.appendChild(span);
  outputDiv.appendChild(document.createElement('br'));
  _logLineCount++;
  if (_logLineCount > MAX_LOG_LINES) {
    const toRemove = (_logLineCount - MAX_LOG_LINES) * 2;
    for (let i = 0; i < toRemove && outputDiv.firstChild; i++) {
      outputDiv.removeChild(outputDiv.firstChild);
    }
    _logLineCount = MAX_LOG_LINES;
  }
  const distFromBottom = outputDiv.scrollHeight - outputDiv.scrollTop - outputDiv.clientHeight;
  if (distFromBottom < 100) outputDiv.scrollTop = outputDiv.scrollHeight;
}
// Update sensor UI
function updateSensorUI() {
  console.log('updateSensorUI called - selectedSensor:', selectedSensor);
  console.log('Current data - Temp:', currentTemperature, 'Humidity:', currentHumidity, 'Pressure:', currentPressure);
 
  const protocol = document.getElementById("sensor-select").value;
  const isWeatherMode = protocol === "WEATHER";
  const sensorDropdown = document.getElementById("sensor-dropdown");
  const sensorDataDiv = null; // element removed from HTML
 
  const thermometerContainer = document.getElementById("thermometer-container");
  const thermometerFContainer = document.getElementById("thermometer-f-container");
  const humidityContainer = document.getElementById("humidity-card");
  const pressureContainer = document.getElementById("pressure-card");
  const lightContainer = document.getElementById("light-card");
  const lis3dhContainer = document.getElementById("lis3dh-card");
  const hallContainer = document.getElementById("hall-card");
  const tlv493dContainer = document.getElementById("tlv493d-card");
  const tofContainer = document.getElementById("tof-card");
  const uvltrContainer = document.getElementById("uvltr-card");
  const irContainer = document.getElementById("ir-card");
  const rainGaugeCard = document.getElementById("rain-gauge-card");
 const windDirectionContainer = document.getElementById("wind-direction-card");
  const windSpeedContainer = document.getElementById("wind-speed-card");
  const windFlowContainer = document.getElementById("wind-flow-card");
  const windDirectionValue = document.getElementById("wind-direction-value");
  const windDirectionArrow = document.getElementById("wind-direction-arrow");
  const windSpeedValue = document.getElementById("wind-speed-value");
  const windSpeedCups = document.getElementById("anemometer-cups");
  const windSpeedBar = document.getElementById("wind-speed-bar");
  const thermometerFill = document.getElementById("thermometer-fill");
  const thermometerBulb = document.getElementById("thermometer-bulb");
  const thermometerValue = document.getElementById("thermometer-value");
  const humidityValue = document.getElementById("humidity-value");
  const wavePath = document.getElementById("wavePath");
  const waveColor1 = document.getElementById("waveColor1");
  const waveColor2 = document.getElementById("waveColor2");
  const pressureValue = document.getElementById("pressure-value");
  const pressureBar = document.getElementById("pressure-bar");
  const lightValue = document.getElementById("light-value");
  const sunCircle = document.getElementById("sun-circle");
  const glowFilter = document.getElementById("glow");
  const sunGradient = document.getElementById("sunGradient");
  const sparkles = document.getElementById("sparkles");
  const lis3dhXValue = document.getElementById("lis3dh-x-value");
  const lis3dhYValue = document.getElementById("lis3dh-y-value");
  const lis3dhZValue = document.getElementById("lis3dh-z-value");
  const hallValue = document.getElementById("hall-value");
  const hallArc = document.getElementById("hall-arc-path");
  const hallGlow = document.getElementById("hall-glow");
  const tlvLine = document.getElementById("vector-line");
  const tlvHead = document.getElementById("vector-head");
  const tlvZCircle = document.getElementById("z-axis-indicator");
  const tlvMagLabel = document.getElementById("mag-label");
  const tlvVecStops = document.querySelectorAll("#vecGradient stop");
  const vcnlLuxCard = document.getElementById("vcnl-lux-card");     // For VCNL4040
  const relayCard = document.getElementById("relay-card");         // For Relay
  const sen66Card             = document.getElementById("sen66-card");
  if (tlvLine && tlvHead && tlvZCircle) {
    tlvLine.style.transition = "opacity 0.2s ease";
    tlvHead.style.transition = "transform 0.3s ease, opacity 0.2s ease";
    tlvZCircle.style.transition = "transform 0.4s ease";
    tlvZCircle.style.transformOrigin = "50% 50%";
  }
  const tofValue = document.getElementById("tof-value");
  const tofPerson = document.getElementById("tof-person");
  const uvValue = document.getElementById("uv-value");
  const uvBar = document.getElementById("uv-bar");
  const uvSun = document.getElementById("uv-sun");
  const uvSunCircle = document.getElementById("uv-sun-circle");
  const uvRays = document.getElementById("uv-rays");
  const uvGlow = document.getElementById("uvGlow");
  const uvSunGradient = document.getElementById("uvSunGradient");
  const irValue = document.getElementById("ir-value");
  const irBulbCircle = document.getElementById("ir-bulb-circle");
  const irGlow = document.querySelector("#ir-glow feGaussianBlur");
  const rainGaugeValue = document.getElementById("rain-gauge-value");
  const blinkyCard = document.getElementById("blinky-card");
  const buzzerCard = document.getElementById("buzzer-card");
  sensorDropdown.innerHTML = '<option value="" disabled selected>Select a Sensor</option>';
  // Define which sensors support which parameters
  const sensorParameters = {
    "BME680": ["Temperature", "Humidity", "Pressure"],
    "SHT40": ["Temperature", "Humidity"],
    "AHT20": ["Temperature", "Humidity"],
    "SEN66": ["PM1.0", "PM2.5", "PM4", "PM10", "Temperature", "Humidity", "VOC", "NOx", "CO2"],
    "STTS751": ["Temperature"],
    "VEML7700": ["Lux"],
    "STS30": ["Temperature"],
    "LIS3DH": ["AccelerationX", "AccelerationY", "AccelerationZ"],
    "Hall Sensor": ["MagneticField"],
    "TLV493D": ["X", "Y", "Z"],
    "VL53L0X": ["Distance"],
    "LTR390": ["UV"],
    "IR Sensor": ["Infrared"],
    "MD02": ["Temperature", "Humidity"],
    "Rain Gauge": ["Rainfall"],
    "Wind Sensor": ["Direction", "Speed"]
  };
  if (protocol) {
    // Populate sensor dropdown
    const sensors = sensorProtocolMap[protocol] || [];
    sensors.forEach(sensor => {
      const isPresent = sensorStatus[protocol][sensor.replace(" ", "")];
      const option = document.createElement("option");
      option.value = sensor;
      option.textContent = `${sensor} ${isPresent ? '(Present)' : ''}`;
      if (selectedSensor === sensor) {
        option.selected = true;
      }
      sensorDropdown.appendChild(option);
    });

  let dataHtml = `
  <h4>Sensor Data</h4>
  <div class="sensor-scroll-container">
`;

if (selectedSensor && sensorData[protocol]) {
  if (selectedSensor === "Rain Gauge") {
    dataHtml += `
      <div class="sensor-data-item">
        <strong>Rainfall:</strong> ${sensorData[protocol]["Rainfall"] || "N/A"}
      </div>
    `;
  } else if (protocol === "WEATHER") {
    // Show ALL data in the WEATHER object
    const allKeys = Object.keys(sensorData[protocol]);
    if (allKeys.length > 0) {
      allKeys.forEach(key => {
        let value = sensorData[protocol][key];
        dataHtml += `
          <div class="sensor-data-item">
            <strong>${key}:</strong> ${value}
          </div>
        `;
      });
    } else {
      dataHtml += `<p>Waiting for weather data...</p>`;
    }
  } else {
    const sensorKeys = Object.keys(sensorData[protocol])
      .filter(key => key.startsWith(selectedSensor + " "));

    if (sensorKeys.length > 0) {
      sensorKeys.forEach(key => {
        let value = sensorData[protocol][key];

        if (!isNaN(parseFloat(value))) {
          value = parseFloat(value).toFixed(2);
        }

        dataHtml += `
          <div class="sensor-data-item">
            <strong>${key.replace(selectedSensor + " ", "")}:</strong> ${value}
          </div>
        `;
      });
    } else {
      dataHtml += `<p>No data available for ${selectedSensor}.</p>`;
    }
  }
} else {
  dataHtml += "<p>Please select a sensor to view data.</p>";
}

// sensorDataDiv removed from HTML — data shown in animation cards only
  
// === HIDE ALL CARDS FIRST ===
const allCards = [
  thermometerContainer, thermometerFContainer, humidityContainer, pressureContainer,
  lightContainer, uvltrContainer, lis3dhContainer, hallContainer,
  tlv493dContainer, tofContainer, irContainer,
  windDirectionContainer, windSpeedContainer, windFlowContainer,  // ← add windFlowContainer here
  rainGaugeCard,
  blinkyCard, buzzerCard,
  vcnlLuxCard,  
  relayCard,
  // SEN66 individual cards
      document.getElementById("sen66-pm1-card"),
      document.getElementById("sen66-pm25-card"),
      document.getElementById("sen66-pm4-card"),
      document.getElementById("sen66-pm10-card"),
      document.getElementById("sen66-voc-card"),
      document.getElementById("sen66-nox-card"),
      document.getElementById("sen66-co2-card"),
    ];

allCards.forEach(card => {
  if (card) {
    card.style.display = "none";
    card.classList.remove('sensor-card', 'show');
  }
});

  // Stop SEN66 particles if switching away (legacy cleanup – no-op now)
    if (selectedSensor !== "SEN66") {
      // nothing to stop
    }
const sensorCards = document.querySelector('.sensor-cards');
if (sensorCards) {
  sensorCards.classList.remove('weather-shield-grid');
  sensorCards.classList.remove('sen66-layout');
  sensorCards.classList.remove('weather-combined-grid');
}

// Toggle empty state vs sensor cards container
const emptyState = document.getElementById('empty-state-container');
const sensorCardsContainer = document.getElementById('sensor-cards-container');
if (protocol && selectedSensor) {
  // A sensor is selected — show the cards, hide the empty state
  if (emptyState) emptyState.style.display = 'none';
  if (sensorCardsContainer) sensorCardsContainer.style.display = 'flex';
} else {
  // No sensor selected — show empty state, hide cards
  if (emptyState) emptyState.style.display = 'flex';
  if (sensorCardsContainer) sensorCardsContainer.style.display = 'none';
}

// === NOW SHOW CARDS BASED ONLY ON PROTOCOL + SELECTED SENSOR (DATA NOT REQUIRED) ===
if (protocol && selectedSensor) {
  if (protocol === "WEATHER") {
    if (sensorCards) sensorCards.classList.add('weather-combined-grid');
    // Show ALL 8 Weather Cards
    const weatherCards = [
      thermometerContainer, humidityContainer, pressureContainer, lightContainer,
      rainGaugeCard, windDirectionContainer, windSpeedContainer, windFlowContainer
    ];
    weatherCards.forEach(card => {
      if (card) {
        card.style.display = "flex";
        card.classList.add('sensor-card');
      }
    });
    
    // Auto-select the first sub-sensor if none selected
    if (!selectedSensor) selectedSensor = "Weather Parameters";
    
    // Trigger gauge updates if we have data
    if (currentPressure !== null) updatePressureCard(currentPressure / 10);
    if (currentUV !== null) updateUVCard(currentUV);
    if (currentWindDirection !== null) updateWindFlowCard(currentWindDirection);
  }

  // Weather Shield special case - show multiple cards
  if (selectedSensor === "Weather Shield") {
  if (sensorCards) sensorCards.classList.add('weather-shield-grid');
  [thermometerContainer, humidityContainer, pressureContainer, lightContainer].forEach(card => {
    if (card) {
      card.style.display = "flex";
      card.classList.add('sensor-card');
    }
  });
}
  // Temperature sensors
  if (["BME680", "STTS751", "SHT40", "AHT20", "STS30", "Weather Shield"].includes(selectedSensor) && protocol === "I2C") {
    if (thermometerContainer) {
      thermometerContainer.style.display = "flex";
      thermometerContainer.classList.add('sensor-card');
    }
    if (selectedSensor === "STTS751" && thermometerFContainer) {
      thermometerFContainer.style.display = "flex";
    }
  }
  // Humidity
  if (["BME680", "SHT40", "AHT20", "Weather Shield"].includes(selectedSensor) && protocol === "I2C") {
    if (humidityContainer) {
      humidityContainer.style.display = "flex";
      humidityContainer.classList.add('sensor-card');
    }
  }
  // Pressure
  if (["BME680", "Weather Shield"].includes(selectedSensor) && protocol === "I2C") {
    if (pressureContainer) {
      pressureContainer.style.display = "flex";
      pressureContainer.classList.add('sensor-card');
    }
  }
  // Light
  if ((selectedSensor === "VEML7700" || selectedSensor === "Weather Shield") && protocol === "I2C") {
    if (lightContainer) {
      lightContainer.style.display = "flex";
      lightContainer.classList.add('sensor-card');
    }
  }
  // Acceleration
  if (selectedSensor === "LIS3DH" && protocol === "I2C") {
    if (lis3dhContainer) lis3dhContainer.style.display = "flex";
  }
  // Hall Sensor (Analog)
  if (selectedSensor === "Hall Sensor" && protocol === "Analog") {
    if (hallContainer) hallContainer.style.display = "flex";
  }
  // TLV493D
  if (selectedSensor === "TLV493D" && protocol === "I2C") {
    if (tlv493dContainer) tlv493dContainer.style.display = "flex";
  }
 // TOF Distance
  if (selectedSensor === "VL53L0X" && protocol === "I2C") {
    if (tofContainer) {
      tofContainer.style.display = "flex";
      tofContainer.classList.add("show");
    }
    
    // ⚠️ CRITICAL: Update animation with current distance value
    if (currentDistance !== null) {
      updateTOFAnimation(currentDistance);
    }
  }
  // UV Light
  if (selectedSensor === "LTR390" && protocol === "I2C") {
    if (uvltrContainer) {
      uvltrContainer.style.display = "flex";
      uvltrContainer.classList.add("show");
    }
  }
    // VCNL4040 Ambient Light
  if (selectedSensor === "VCNL4040" && protocol === "I2C") {
    if (vcnlLuxCard) {
      vcnlLuxCard.style.display = "flex";
      vcnlLuxCard.classList.add('sensor-card');
    }
  }
  // IR Sensor
  if (selectedSensor === "IR Sensor" && protocol === "Analog") {
    if (irContainer) irContainer.style.display = "flex";
  }
  // Wind Sensor
// Wind Sensor
  if (selectedSensor === "Wind Sensor" && protocol === "RS232") {
    if (windDirectionContainer) windDirectionContainer.style.display = "block";
    if (windSpeedContainer) windSpeedContainer.style.display = "flex";
    if (windFlowContainer) windFlowContainer.style.display = "flex";
  }
  // Rain Gauge
  if (selectedSensor === "Rain Gauge" && protocol === "ADC") {
    if (rainGaugeCard) rainGaugeCard.style.display = "flex";
  }

  
  // GPIO
  if (selectedSensor === "Blinky" && protocol === "GPIO") {
    if (blinkyCard) blinkyCard.style.display = "flex";
  }
  if (selectedSensor === "Buzzer" && protocol === "GPIO") {
    if (buzzerCard) buzzerCard.style.display = "flex";
  }
  if (selectedSensor === "Relay" && protocol === "GPIO") {
    if (relayCard) relayCard.style.display = "flex";
  }

 // ── SEN66 – show all 7 individual param cards + temp + humidity ──
      if (selectedSensor === "SEN66" && protocol === "I2C") {
        // Add SEN66 layout class to reorder cards
        if (sensorCards) sensorCards.classList.add('sen66-layout');
        
        // Thermometer (same as SHT40)
        if (thermometerContainer) {
          thermometerContainer.style.display = "flex";
          thermometerContainer.classList.add('sensor-card');
        }
        // Humidity wave (same as SHT40)
        if (humidityContainer) {
          humidityContainer.style.display = "flex";
          humidityContainer.classList.add('sensor-card');
        }
        // 7 individual PM / gas cards
        ["sen66-pm1-card","sen66-pm25-card","sen66-pm4-card","sen66-pm10-card",
         "sen66-voc-card","sen66-nox-card","sen66-co2-card"].forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.style.display = "flex"; el.classList.add('sensor-card'); }
        });
      }
 
    } // end if (protocol && selectedSensor)

    console.log('Card visibility for', selectedSensor, ':', {
      temp: currentTemperature,
      humidity: currentHumidity,
      pressure: currentPressure,
      light: currentLight,
      showTemp: thermometerContainer ? thermometerContainer.style.display : 'N/A',
      showHumidity: humidityContainer ? humidityContainer.style.display : 'N/A',
      showPressure: pressureContainer ? pressureContainer.style.display : 'N/A',
      showLight: lightContainer ? lightContainer.style.display : 'N/A'
    });
// === THERMOMETER UPDATE ===
if ((protocol === "I2C" || isWeatherMode) && (isWeatherMode || selectedSensor === "BME680" || selectedSensor === "SEN66" || selectedSensor === "STTS751" || selectedSensor === "SHT40" || selectedSensor === "AHT20" || selectedSensor === "STS30" || selectedSensor === "Weather Shield") && currentTemperature !== null) {
  const temp = parseFloat(currentTemperature);
  let fillColor;
  if (temp < 25) {
    fillColor = "#ffeb3b";
  } else if (temp >= 25 && temp <= 35) {
    fillColor = "#ff9800";
  } else {
    fillColor = "#f44336";
  }
 
  const maxTemp = 50;
  const minTemp = 0;
  const tubeHeight = 316;
  const fillHeight = Math.min(Math.max((temp - minTemp) / (maxTemp - minTemp) * tubeHeight, 0), tubeHeight);
  const fillY = 376 - fillHeight;
 
  // Update Celsius thermometer
  thermometerFill.setAttribute("y", fillY);
  thermometerFill.setAttribute("height", fillHeight);
  thermometerFill.setAttribute("fill", fillColor);
  thermometerBulb.setAttribute("fill", fillColor);
  thermometerValue.textContent = `${temp.toFixed(2)}°C`;
 
  // Update Fahrenheit thermometer for STTS751 - FIXED VARIABLE NAMES
  if (selectedSensor === "STTS751") {
    const tempF = (temp * 9/5) + 32;
    const thermometerFValue = document.getElementById("thermometer-f-value");
    const thermometerFFill = document.getElementById("thermometer-f-fill");
    const thermometerFBulb = document.getElementById("thermometer-f-bulb");
   
    if (thermometerFValue && thermometerFFill && thermometerFBulb) {
      thermometerFValue.textContent = `${tempF.toFixed(2)}°F`;
     
      // Use DIFFERENT variable names to avoid conflict
      const maxTempF = 122;
      const minTempF = 32;
      const tubeHeightF = 316;
      const fillHeightF = Math.min(Math.max((tempF - minTempF) / (maxTempF - minTempF) * tubeHeightF, 0), tubeHeightF);
      const fillYF = 376 - fillHeightF;
     
      thermometerFFill.setAttribute("y", fillYF);
      thermometerFFill.setAttribute("height", fillHeightF);
     
      // Use same color logic for Fahrenheit
      let fillColorF;
      if (tempF < 77) {
        fillColorF = "#ffeb3b";
      } else if (tempF >= 77 && tempF <= 95) {
        fillColorF = "#ff9800";
      } else {
        fillColorF = "#f44336";
      }
     
      thermometerFFill.setAttribute("fill", fillColorF);
      thermometerFBulb.setAttribute("fill", fillColorF);
    }
  }
} else {
  // Reset both thermometers to bottom position
  thermometerFill.setAttribute("y", 376);
  thermometerFill.setAttribute("height", 0);
  thermometerFill.setAttribute("fill", "#ffeb3b");
  thermometerBulb.setAttribute("fill", "#ffeb3b");
  thermometerValue.textContent = "0.00°C";
 
  // Reset Fahrenheit thermometer too
  const thermometerFFill = document.getElementById("thermometer-f-fill");
  const thermometerFBulb = document.getElementById("thermometer-f-bulb");
  if (thermometerFFill && thermometerFBulb) {
    thermometerFFill.setAttribute("y", 376);
    thermometerFFill.setAttribute("height", 0);
    thermometerFFill.setAttribute("fill", "#ffeb3b");
    thermometerFBulb.setAttribute("fill", "#ffeb3b");
  }
}
// === HUMIDITY WAVE UPDATE ===
if ((protocol === "I2C" || isWeatherMode) && (isWeatherMode || selectedSensor === "BME680" || selectedSensor === "SHT40" || selectedSensor === "Weather Shield" || selectedSensor === "SEN66")) {
  if (currentHumidity !== null) {
    const humidity = parseFloat(currentHumidity);
    humidityValue.textContent = `${humidity.toFixed(2)}%`;
   
    // Calculate wave height based on humidity (0-100%)
    const waveHeight = 100 - humidity; // 0% humidity = wave at bottom, 100% = wave at top
   
    // Update wave position
    wavePath.setAttribute("d", `M 0 ${waveHeight} Q 25 ${waveHeight + 5} 50 ${waveHeight} T 100 ${waveHeight} V 100 H 0 Z`);
   
    // Update colors based on humidity
    const t = Math.min(Math.max(humidity / 100, 0), 1);
    const lowColor = { r: 61, g: 142, b: 180 };
    const highColor = { r: 4, g: 116, b: 168 };
    const r = Math.round(lowColor.r + (highColor.r - lowColor.r) * t);
    const g = Math.round(lowColor.g + (highColor.g - lowColor.g) * t);
    const b = Math.round(lowColor.b + (highColor.b - lowColor.b) * t);
    const primaryColor = `rgb(${r}, ${g}, ${b})`;
   
    waveColor1.setAttribute("style", `stop-color: ${primaryColor}; stop-opacity: 0.5`);
    waveColor2.setAttribute("style", `stop-color: ${primaryColor}; stop-opacity: 1`);
  } else {
    humidityValue.textContent = "0.00%";
    // Default wave position (low humidity)
    wavePath.setAttribute("d", "M 0 80 Q 25 85 50 80 T 100 80 V 100 H 0 Z");
  }
} else {
  humidityValue.textContent = "0.00%";
  // Default wave position when not connected
  wavePath.setAttribute("d", "M 0 80 Q 25 85 50 80 T 100 80 V 100 H 0 Z");
}
// === PRESSURE CARD UPDATE ===
if ((protocol === "I2C" || isWeatherMode) && (isWeatherMode || selectedSensor === "BME680" || selectedSensor === "Weather Shield") && currentPressure !== null) {
  updatePressureCard(parseFloat(currentPressure));
} else {
  const pressureValue = document.getElementById('pressure-value');
  const pressureBar = document.getElementById('pressure-bar');
 
  if (pressureValue) pressureValue.textContent = '0.00 hPa';
  if (pressureBar) {
    pressureBar.style.width = '0%';
    pressureBar.style.backgroundColor = '#34d399';
  }
}

// === LIGHT INTENSITY ANIMATION WITH SUN/MOON TOGGLE + BETTER LOW-LIGHT GLOW ===
if ((protocol === "I2C" || isWeatherMode) && (isWeatherMode || selectedSensor === "VEML7700" || selectedSensor === "Weather Shield") && currentLight !== null) {
  const lux = parseFloat(currentLight);
  if (lightValue) lightValue.textContent = `${lux.toFixed(1)} lux`;

  const sunSvg = document.getElementById("light-sun");
  const moonSvg = document.getElementById("light-moon");
  const sunCircle = document.getElementById("sun-circle");
  const sunGradient = document.getElementById("sunGradient");
  const glowFilter = document.querySelector("#sunGlow feGaussianBlur"); // Correct selector for the blur element

  const isNight = lux < 10;

  if (isNight) {
    if (sunSvg) sunSvg.style.display = "none";
    if (moonSvg) moonSvg.style.display = "block";
  } else {
    if (sunSvg) sunSvg.style.display = "block";
    if (moonSvg) moonSvg.style.display = "none";

    // Improved intensity scaling - visible even at low lux
    let intensity = Math.min(lux / 5000, 1); // Scale based on 5000 lux max for better low-light response
    let color = lux > 1000 ? "#fbbf24" : lux > 100 ? "#fcd34d" : "#ffeb3b";

    if (sunCircle) {
      sunCircle.style.opacity = 0.5 + intensity * 0.5; // Minimum 0.5 opacity
      sunCircle.style.filter = `brightness(${1 + intensity * 0.8})`;
    }

    if (sunGradient) {
      const stops = sunGradient.querySelectorAll("stop");
      stops.forEach(stop => stop.setAttribute("stop-color", color));
    }

    // FIXED GLOW: Minimum blur of 4, scales up to 20
    if (glowFilter) {
      const blurAmount = 4 + (intensity * 16); // 4 (dim) → 20 (bright)
      glowFilter.setAttribute("stdDeviation", blurAmount);
    }
  }
} else {
  // No data → Moon + resety
  const sunSvg = document.getElementById("light-sun");
  const moonSvg = document.getElementById("light-moon");
  if (sunSvg) sunSvg.style.display = "none";
  if (moonSvg) moonSvg.style.display = "block";

  if (lightValue) lightValue.textContent = "0.0 lux";

  // Reset glow to minimum
  const glowFilter = document.querySelector("#sunGlow feGaussianBlur");
  if (glowFilter) glowFilter.setAttribute("stdDeviation", "4");
}

// === RAIN GAUGE — FIXED VERSION WITH INSTANT RESTART ===
if ((protocol === "ADC" || isWeatherMode) && (isWeatherMode || selectedSensor === "Rain Gauge")) {
  const rainValEl = document.getElementById("rain-value");
  const roof = document.getElementById("roof");
  const overlay = document.getElementById("rain-overlay");
  if (rainValEl && roof && overlay) {
    const rainStr = sensorData.ADC["Rainfall"];
   
    // === INITIALIZE STATE ===
    let state;
    if (roof.dataset.state) {
      state = JSON.parse(roof.dataset.state);
    } else {
      state = {
        lastRainfall: 0,
        lastTipCount: 0,
        lastTipTime: Date.now(),
        direction: 1,
        hasStarted: false,
        isRestarting: false,
        consecutiveZeros: 0
      };
    }
    // === HANDLE RESTART IMMEDIATELY ===
    if (rainStr) {
      const rainMm = parseFloat(rainStr.replace(" mm", ""));
     
      if (!isNaN(rainMm)) {
        // === IMPROVED RESTART DETECTION ===
        // Track consecutive zero readings
        if (rainMm <= 0.1) {
          state.consecutiveZeros++;
        } else {
          state.consecutiveZeros = 0;
        }
        // Detect significant drop (device restart)
        const significantDrop = (state.lastRainfall > 2.0 && rainMm < 0.5);
       
        // RESTART if: consecutive zeros after rain OR significant drop
        if ((state.consecutiveZeros >= 2 && state.lastRainfall > 0.5) || significantDrop) {
          console.log("Device restart detected - resetting everything");
         
          // IMMEDIATE RESET
          state.hasStarted = false;
          state.isRestarting = true;
          state.lastRainfall = 0;
          state.lastTipCount = 0;
          state.direction = 1;
          state.lastTipTime = Date.now();
          state.consecutiveZeros = 0;
         
          // INSTANT UI RESET
          rainValEl.textContent = "0.0 mm";
          roof.style.transform = `translateX(-50%) rotate(0deg)`;
          overlay.innerHTML = ''; // Clear all rain drops immediately
         
          roof.dataset.state = JSON.stringify(state);
          return; // Exit early, don't process further
        }
        // Normal processing
        rainValEl.textContent = `${rainMm.toFixed(1)} mm`;
        const currentTipCount = Math.round(rainMm / 0.5);
        const now = Date.now();
        const timeDiffSec = (now - state.lastTipTime) / 1000;
        let rainRatePerHour = 0;
       
        // Calculate rain rate if tipping occurred
        if (currentTipCount > state.lastTipCount && timeDiffSec > 0 && timeDiffSec < 3600) {
          const tips = currentTipCount - state.lastTipCount;
          rainRatePerHour = (tips * 0.5) / (timeDiffSec / 3600);
          state.lastTipTime = now;
        }
        // === RAIN ANIMATION CONTROL ===
        if (state.isRestarting) {
          // AFTER RESTART: KEEP RAIN STOPPED until first tilt
          overlay.innerHTML = ''; // Ensure no rain drops
        }
        else if (!state.hasStarted && currentTipCount > 0) {
          // FIRST TILT DETECTED - START RAIN
          state.hasStarted = true;
          console.log("First tilt detected - starting rain animation");
         
          const intensity = Math.min(rainRatePerHour > 0 ? rainRatePerHour : 15, 80);
          const dropCount = Math.min(Math.floor(intensity * 0.38), 32);
         
          // Create initial rain drops
          for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 1.6 + 's';
            drop.style.animationDuration = (0.8 + Math.random() * 0.7) + 's';
            overlay.appendChild(drop);
          }
        }
        else if (state.hasStarted) {
          // RAIN IS ACTIVE - ADJUST INTENSITY WITHOUT RESTARTING
          if (rainRatePerHour === 0 && timeDiffSec > 10) {
            // No rain for 10+ seconds - gradually stop
            if (overlay.children.length > 0) {
              overlay.removeChild(overlay.children[0]); // Remove one drop at a time
            }
          } else {
            // Adjust rain intensity smoothly
            const intensity = Math.min(rainRatePerHour > 0 ? rainRatePerHour : 15, 80);
            const targetDropCount = Math.min(Math.floor(intensity * 0.38), 32);
           
            // Add drops if needed (without clearing existing ones)
            for (let i = overlay.children.length; i < targetDropCount; i++) {
              const drop = document.createElement('div');
              drop.className = 'raindrop';
              drop.style.left = Math.random() * 100 + '%';
              drop.style.animationDelay = Math.random() * 1.6 + 's';
              drop.style.animationDuration = (0.8 + Math.random() * 0.7) + 's';
              overlay.appendChild(drop);
            }
           
            // Remove excess drops if intensity decreased
            if (overlay.children.length > targetDropCount) {
              const excess = overlay.children.length - targetDropCount;
              for (let i = 0; i < excess; i++) {
                if (overlay.children[0]) {
                  overlay.removeChild(overlay.children[0]);
                }
              }
            }
          }
        }
        // === TIPPING BUCKET ANIMATION ===
        if (currentTipCount > state.lastTipCount) {
          state.direction *= -1;
          const deg = state.direction > 0 ? 12 : -12;
          roof.style.transition = "transform 0.8s cubic-bezier(0.34,0.72,0.4,1.2)";
          roof.style.transform = `translateX(-50%) rotate(${deg}deg)`;
          // After restart: first tilt ends restart mode and IMMEDIATELY starts rain
          if (state.isRestarting) {
            state.isRestarting = false;
            state.hasStarted = true;
            console.log("First tilt after restart - rain animation started");
           
            // START RAIN IMMEDIATELY on first tip
            const intensity = Math.min(rainRatePerHour > 0 ? rainRatePerHour : 15, 80);
            const dropCount = Math.min(Math.floor(intensity * 0.38), 32);
           
            for (let i = 0; i < dropCount; i++) {
              const drop = document.createElement('div');
              drop.className = 'raindrop';
              drop.style.left = Math.random() * 100 + '%';
              drop.style.animationDelay = Math.random() * 1.6 + 's';
              drop.style.animationDuration = (0.8 + Math.random() * 0.7) + 's';
              overlay.appendChild(drop);
            }
          }
        }
        // Update state
        state.lastRainfall = rainMm;
        state.lastTipCount = currentTipCount;
        roof.dataset.state = JSON.stringify(state);
      }
    } else {
      // NO DATA - Show waiting state
      if (!state.isRestarting) {
        rainValEl.textContent = "0.0 mm";
        overlay.innerHTML = '';
      }
    }
  }
}

// ================================================
// VCNL4040 – Final, bullet-proof update block
// ================================================
if (selectedSensor === "VCNL4040") {  // ← Remove protocol check, it's redundant here
  console.log("[VCNL DEBUG] Update called | selectedSensor =", selectedSensor, "| currentVCNLLux =", currentVCNLLux);

  const card       = document.getElementById("vcnl-lux-card");
  const valueEl    = document.getElementById("vcnl-lux-value");
  const arcEl      = document.getElementById("vcnl-lux-arc");
  const levelEl    = document.getElementById("vcnl-lux-level");
  const sunGroup   = document.getElementById("vcnl-sun-group");

  // Force visibility EVERY single time (this fixes 99% of hiding issues)
  if (card) {
    card.style.display = "flex !important";
    card.style.opacity = "1";
    card.classList.add("sensor-card", "show");
    console.log("[VCNL] Card visibility FORCED ON");
  }

  // Handle no data
  if (currentVCNLLux == null || isNaN(currentVCNLLux)) {
    console.log("[VCNL] No valid data → reset to 0");
    if (valueEl) valueEl.textContent = "0.0 lux";
    if (arcEl) arcEl.setAttribute("d", "M 30 110 A 80 80 0 0 1 30 110");
    if (sunGroup) sunGroup.style.opacity = "0.25";
    if (levelEl) levelEl.textContent = "No data";
    return;
  }

  const lux = Number(currentVCNLLux);
  console.log("[VCNL] Rendering fresh value:", lux);

  // Update text
  if (valueEl) {
    valueEl.textContent = `${lux.toFixed(1)} lux`;
  }

  // Update arc (progress)
  const maxLux = 100000;
  const progress = Math.min(lux / maxLux, 1);
  const angle = progress * 180;
  const radians = (angle * Math.PI) / 180;
  const x = 110 + 80 * Math.sin(radians);
  const y = 110 - 80 * Math.cos(radians);
  const largeArc = angle > 90 ? 1 : 0;

  if (arcEl) {
    arcEl.setAttribute("d", `M 30 110 A 80 80 0 ${largeArc} 1 ${x} ${y}`);
    console.log("[VCNL] Arc updated to angle:", angle);
  }

  if (sunGroup) {
  sunGroup.style.opacity = intensity;
  sunGroup.style.filter = `brightness(${1 + intensity * 1.8}) drop-shadow(0 0 ${20 + intensity * 40}px #fef08a)`;
  sunGroup.setAttribute("transform", "translate(140,140)"); // force center every update
  }
  // Intensity & level
  let levelText = "Dark";
  let intensity = 0.25;

  if (lux > 50000) { levelText = "Direct Sun"; intensity = 1.0; }
  else if (lux > 10000) { levelText = "Very Bright"; intensity = 0.9; }
  else if (lux > 2000)  { levelText = "Bright Day"; intensity = 0.75; }
  else if (lux > 200)   { levelText = "Office"; intensity = 0.5; }
  else if (lux > 20)    { levelText = "Dim Room"; intensity = 0.35; }

  if (levelEl) levelEl.textContent = levelText;
  if (sunGroup) {
    sunGroup.style.opacity = intensity;
    sunGroup.style.filter = `brightness(${1 + intensity})`;
    console.log("[VCNL] Sun updated → opacity:", intensity);
  }
}

// === RELAY ANIMATION ===
if (protocol === "GPIO" && selectedSensor === "Relay") {
  const relayValue = document.getElementById("relay-value");
  const relayCoil = document.getElementById("relay-coil");
  const relayCore = document.getElementById("relay-core");
  const relaySpring = document.getElementById("relay-spring");
  const relayArm = document.getElementById("relay-arm");
  const relaySpark = document.getElementById("relay-spark");
  const bulbGlow = document.getElementById("bulb-glow");
  const bulbFilament = document.getElementById("bulb-filament");
  const lightRays = document.getElementById("light-rays");
  const wire1 = document.getElementById("wire-1");
  const wire2 = document.getElementById("wire-2");
  const wire3 = document.getElementById("wire-3");
  const energyParticles1 = document.getElementById("energy-particles-1");
  const energyParticles2 = document.getElementById("energy-particles-2");

  if (currentRelayState === "ON") {
    // === ON STATE ===
    relayValue.textContent = "ON";
    relayValue.style.color = "#34d399";
    relayValue.style.background = "rgba(52, 211, 153, 0.2)";
    relayValue.style.borderColor = "#34d399";
    relayValue.style.boxShadow = "0 0 20px rgba(52, 211, 153, 0.3)";
    relayValue.style.textShadow = "0 0 10px rgba(52, 211, 153, 0.5)";

    // Activate electromagnetic coil with glow
    relayCoil.style.filter = "url(#relayGlow)";
    relayCoil.style.opacity = "1";

    // Pull iron core down (electromagnet attraction)
    relayCore.setAttribute("y", "140");
    relayCore.setAttribute("height", "120");

    // Compress spring
    relaySpring.setAttribute("d", "M160 140 Q160 130 160 120 Q160 110 160 100");

    // Move arm to NO (Normally Open) contact - rotate upward
    relayArm.setAttribute("transform", "translate(300,140) rotate(-40)");

    // Show electrical spark at contact point
    relaySpark.style.opacity = "1";
    setTimeout(() => {
      relaySpark.style.opacity = "0";
    }, 600);

    // Activate bulb - full brightness
    if (bulbGlow) {
      bulbGlow.style.opacity = "1";
    }
    if (bulbFilament) {
      bulbFilament.setAttribute("stroke", "#FFD700");
      bulbFilament.setAttribute("stroke-width", "3");
    }
    if (lightRays) {
      lightRays.style.opacity = "1";
    }

    // Activate wires - show current flow
    if (wire1) {
      wire1.style.stroke = "#4CAF50";
      wire1.style.strokeWidth = "4";
    }
    if (wire2) {
      wire2.style.stroke = "#4CAF50";
      wire2.style.strokeWidth = "4";
    }
    if (wire3) {
      wire3.style.stroke = "#4CAF50";
      wire3.style.strokeWidth = "4";
    }

    // Show energy flow particles
    if (energyParticles1) {
      energyParticles1.style.opacity = "1";
    }
    if (energyParticles2) {
      energyParticles2.style.opacity = "1";
    }

  } else {
    // === OFF STATE ===
    relayValue.textContent = "OFF";
    relayValue.style.color = "#f87171";
    relayValue.style.background = "rgba(248, 113, 113, 0.15)";
    relayValue.style.borderColor = "#f87171";
    relayValue.style.boxShadow = "none";
    relayValue.style.textShadow = "0 0 10px rgba(248, 113, 113, 0.3)";

    // Deactivate coil - no magnetic field
    relayCoil.style.filter = "none";
    relayCoil.style.opacity = "0.7";

    // Release iron core - spring pushes it back up
    relayCore.setAttribute("y", "180");
    relayCore.setAttribute("height", "80");

    // Relax spring to normal position
    relaySpring.setAttribute("d", "M160 180 Q160 160 160 140 Q160 120 160 100");

    // Return arm to NC (Normally Closed) contact - horizontal position
    relayArm.setAttribute("transform", "translate(300,140) rotate(0)");

    // Deactivate bulb - no light
    if (bulbGlow) {
      bulbGlow.style.opacity = "0";
    }
    if (bulbFilament) {
      bulbFilament.setAttribute("stroke", "#FF9800");
      bulbFilament.setAttribute("stroke-width", "2.5");
    }
    if (lightRays) {
      lightRays.style.opacity = "0";
    }

    // Deactivate wires - no current
    if (wire1) {
      wire1.style.stroke = "#78909C";
      wire1.style.strokeWidth = "3";
    }
    if (wire2) {
      wire2.style.stroke = "#78909C";
      wire2.style.strokeWidth = "3";
    }
    if (wire3) {
      wire3.style.stroke = "#78909C";
      wire3.style.strokeWidth = "3";
    }

    // Hide energy flow particles
    if (energyParticles1) {
      energyParticles1.style.opacity = "0";
    }
    if (energyParticles2) {
      energyParticles2.style.opacity = "0";
    }
  }
}

// === BUZZER CARD UPDATE - ENHANCED ===
if (protocol === "GPIO" && selectedSensor === "Buzzer") {
  const buzzerValue = document.getElementById("buzzer-value");
  const soundWaves = document.getElementById("sound-waves");
  const glowRing = document.getElementById("buzzer-glow-ring");
  const vibrationLines = document.getElementById("vibration-lines");
  const speakerBody = document.getElementById("speaker-body");

  const isActive = sensorData.GPIO["Buzzer State"] === "Active";

  if (buzzerValue) {
    buzzerValue.textContent = isActive ? "Active" : "Inactive";
    buzzerValue.style.color = isActive ? "#60a5fa" : "#f87171";
  }

  // Activate animations when buzzer is on
  if (isActive) {
    soundWaves.style.opacity = "1";
    glowRing.style.opacity = "1";
    vibrationLines.style.opacity = "0.6";
    speakerBody.style.filter = "drop-shadow(0 0 20px #60a5fa)";
  } else {
    soundWaves.style.opacity = "0";
    glowRing.style.opacity = "0";
    vibrationLines.style.opacity = "0";
    speakerBody.style.filter = "none";
  }
}

// ===================================
// BLINKY (LED) ANIMATION
// ===================================
if (protocol === "GPIO" && selectedSensor === "Blinky") {
  const blinkyCard = document.getElementById("blinky-card");
  const blinkyValue = document.getElementById("blinky-value");

  // Get current state – should come from your parseSensorData logic
  const isOn = sensorData.GPIO?.["Blinky State"] === "ON";

  if (!blinkyCard || !blinkyValue) {
    console.warn("Blinky card or value element not found!");
    return;
  }

  // Update displayed text
  blinkyValue.textContent = isOn ? "ON" : "OFF";

  // Always clean both classes first (prevents many animation bugs)
  blinkyCard.classList.remove("blinky-on", "blinky-off");

  // Small timeout helps trigger CSS animations more reliably
  setTimeout(() => {
    if (isOn) {
      blinkyCard.classList.add("blinky-on");
      console.log("Blinky → ON (classes applied)");
    } else {
      blinkyCard.classList.add("blinky-off");
      console.log("Blinky → OFF (classes applied)");
    }
  }, 20);
}

// ===================================
// HALL SENSOR ANIMATION
// ===================================
if (protocol === "Analog" && selectedSensor === "Hall Sensor") {
  const hallValue = document.getElementById("hall-value");
  const hallMagnet = document.getElementById("hall-magnet");
  const magneticWaves = document.getElementById("hall-magnetic-waves");
  const poleLightning = document.getElementById("hall-pole-lightning");
  const statusDot = document.getElementById("hall-status-dot");
 
  if (currentMagneticField !== null && hallValue && hallMagnet) {
    const field = parseInt(currentMagneticField);
   
    // Update text display
    hallValue.textContent = field === 1 ? "High (Detected)" : "Low (Not Detected)";
    hallValue.style.color = field === 1 ? "#f87171" : "#6ee7b7";
   
    // Update status dot
    if (statusDot) {
      statusDot.className = field === 1
        ? "hall-status-dot status-active"
        : "hall-status-dot status-inactive";
    }
   
    // Toggle magnetic waves animation
    if (magneticWaves) {
      magneticWaves.style.opacity = field === 1 ? "1" : "0";
    }
   
    // Toggle pole lightning
    if (poleLightning) {
      poleLightning.style.opacity = field === 1 ? "1" : "0";
    }
   
    // Toggle magnet vibration and lightning bolts
    if (field === 1) {
      hallMagnet.classList.add("vibrate");
      startHallLightningBolts();
    } else {
      hallMagnet.classList.remove("vibrate");
      stopHallLightningBolts();
    }
  } else {
    // Reset to default state when no data
    hallValue.textContent = "Waiting for data…";
    hallValue.style.color = "#94a3b8";
   
    if (statusDot) {
      statusDot.className = "hall-status-dot status-inactive";
    }
   
    if (magneticWaves) {
      magneticWaves.style.opacity = "0";
    }
   
    if (poleLightning) {
      poleLightning.style.opacity = "0";
    }
   
    if (hallMagnet) {
      hallMagnet.classList.remove("vibrate");
    }
   
    stopHallLightningBolts();
  }
}

// Update LTR390 card (for I2C LTR390)
    if (protocol === "I2C" && selectedSensor === "LTR390" && currentUV !== null) {
      const uv = parseFloat(currentUV);
      const maxUV = 11;
      
      // Update UV value text
      if (uvValue) uvValue.textContent = `UV: ${uv.toFixed(2)}`;
      
      // Calculate pointer position (0-11+ maps to 0-100%)
      const pointerPosition = Math.min((uv / maxUV) * 100, 100);
      
      // Update pointer position
      const pointer = document.querySelector('.pointer');
      if (pointer) {
        pointer.style.left = `${pointerPosition}%`;
      }

      const uvRanges = [
        { range: [0, 1], label: "Low", color: "#f8c844" },
        { range: [2, 5], label: "Moderate", color: "#f6990dff" },
        { range: [6, 7], label: "High", color: "#fa6215ff" },
        { range: [8, 10], label: "Very High", color: "#fd1808ff" },
        { range: [11, Infinity], label: "Extreme", color: "#9e0f04ff" }
      ];

      let uvColor = "#f6990dff";
      let uvLabel = "Low";
      for (const range of uvRanges) {
        if (uv >= range.range[0] && uv <= range.range[1]) {
          uvColor = range.color;
          uvLabel = range.label;
          break;
        }
      }

      if (uvSunCircle) uvSunCircle.setAttribute("r", uv >= 3 ? 22 : 18);
      if (uvGlow) uvGlow.setAttribute("stdDeviation", uv >= 3 ? 5 : 3);
      if (uvSunGradient && uvSunGradient.children.length >= 3) {
        uvSunGradient.children[0].setAttribute("style", `stop-color:${uvColor}; stop-opacity:1`);
        uvSunGradient.children[1].setAttribute("style", `stop-color:${uvColor}; stop-opacity:0.8`);
        uvSunGradient.children[2].setAttribute("style", `stop-color:${uvColor}; stop-opacity:0.4`);
      }

      if (uvRays) {
        const rays = uvRays.querySelectorAll(".uv-ray");
        rays.forEach(ray => {
          ray.setAttribute("stroke", uvColor);
          ray.style.opacity = uv >= 3 ? 1 : 0;
          if (uv >= 3) {
            const animOpacity = ray.querySelector('animate[attributeName="opacity"]');
            const animX2 = ray.querySelector('animate[attributeName="x2"]');
            const animY2 = ray.querySelector('animate[attributeName="y2"]');
            if (animOpacity) {
              animOpacity.setAttribute("values", uv >= 8 ? "0;1;0" : "0;0.8;0");
              animOpacity.setAttribute("dur", uv >= 11 ? "1.5s" : "2s");
            }
            if (animX2) {
              animX2.setAttribute("values", uv >= 11 ? `${parseFloat(animX2.getAttribute("values").split(";")[0])*1.2};${parseFloat(animX2.getAttribute("values").split(";")[1])*1.2};${parseFloat(animX2.getAttribute("values").split(";")[0])*1.2}` : animX2.getAttribute("values"));
            }
            if (animY2) {
              animY2.setAttribute("values", uv >= 11 ? `${parseFloat(animY2.getAttribute("values").split(";")[0])*1.2};${parseFloat(animY2.getAttribute("values").split(";")[1])*1.2};${parseFloat(animY2.getAttribute("values").split(";")[0])*1.2}` : animY2.getAttribute("values"));
            }
          }
        });
      }

      if (uvValue) uvValue.textContent = `UV: ${uv.toFixed(2)} (${uvLabel})`;
    } else {
      if (uvValue) uvValue.textContent = "UV: 0.00";
      if (uvBar) {
        uvBar.style.width = "0%";
        uvBar.style.backgroundColor = "#6b8af7";
      }
      if (uvSunCircle) uvSunCircle.setAttribute("r", 18);
      if (uvGlow) uvGlow.setAttribute("stdDeviation", 3);
      if (uvSunGradient && uvSunGradient.children.length >= 3) {
        uvSunGradient.children[0].setAttribute("style", "stop-color:#ffeb3b; stop-opacity:1");
        uvSunGradient.children[1].setAttribute("style", "stop-color:#ff9800; stop-opacity:0.8");
        uvSunGradient.children[2].setAttribute("style", "stop-color:#ff6b00; stop-opacity:0.4");
      }
      if (uvRays) {
        const rays = uvRays.querySelectorAll(".uv-ray");
        rays.forEach(ray => {
          ray.setAttribute("stroke", "#ffeb3b");
          ray.style.opacity = 0;
        });
      }
    }


// ===================================
// HELPER FUNCTIONS FOR HALL SENSOR
// ===================================
function startHallLightningBolts() {
  stopHallLightningBolts(); // Clear any existing interval
 
  const lightningContainer = document.getElementById("hall-lightning-bolts");
  if (!lightningContainer) return;
 
  // Generate bolts immediately
  generateHallLightningBolt();
 
  // Generate new bolts every 1 second
  hallLightningInterval = setInterval(() => {
    generateHallLightningBolt();
  }, 1000);
}
/**
 * Stop generating lightning bolts
 */
function stopHallLightningBolts() {
  if (hallLightningInterval) {
    clearInterval(hallLightningInterval);
    hallLightningInterval = null;
  }
 
  const lightningContainer = document.getElementById("hall-lightning-bolts");
  if (lightningContainer) {
    lightningContainer.innerHTML = "";
  }
}
/**
 * Generate a single lightning bolt that animates toward the magnet
 */
function generateHallLightningBolt() {
  const lightningContainer = document.getElementById("hall-lightning-bolts");
  if (!lightningContainer) return;
 
  // Create 6 bolts in different directions
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) + (Math.random() * 20 - 10);
    const distance = 80 + Math.random() * 20;
    const delay = i * 0.15;
   
    const radians = (angle * Math.PI) / 180;
    const startX = 50 + Math.cos(radians) * distance;
    const startY = 50 + Math.sin(radians) * distance;
   
    const boltGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    boltGroup.classList.add("lightning-bolt");
    boltGroup.style.animationDelay = `${delay}s`;
   
    // Lightning bolt shape
    const boltPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    boltPath.setAttribute("d", `M ${startX - 2} ${startY - 5} L ${startX - 1} ${startY} L ${startX - 3} ${startY} L ${startX + 2} ${startY + 5} L ${startX + 1} ${startY + 1} L ${startX + 3} ${startY + 1} Z`);
    boltPath.setAttribute("fill", "#fbbf24");
    boltPath.setAttribute("stroke", "#f59e0b");
    boltPath.setAttribute("stroke-width", "0.5");
   
    // Glow effect
    const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glowPath.setAttribute("d", `M ${startX - 2} ${startY - 5} L ${startX - 1} ${startY} L ${startX - 3} ${startY} L ${startX + 2} ${startY + 5} L ${startX + 1} ${startY + 1} L ${startX + 3} ${startY + 1} Z`);
    glowPath.setAttribute("fill", "#fef3c7");
    glowPath.setAttribute("opacity", "0.6");
   
    boltGroup.appendChild(boltPath);
    boltGroup.appendChild(glowPath);
    lightningContainer.appendChild(boltGroup);
   
    // Remove bolt after animation completes
    setTimeout(() => {
      if (boltGroup.parentNode) {
        boltGroup.parentNode.removeChild(boltGroup);
      }
    }, 1000 + delay * 1000);
  }
}
// Update IR Sensor card with animation
    if (protocol === "Analog" && selectedSensor === "IR Sensor" && currentIR !== null) {
      const detected = parseInt(currentIR) === 1;
      const irValue = document.getElementById("ir-value");
      const irCard = document.getElementById("ir-card");
      const svg = irCard ? irCard.querySelector("svg") : null;
      const object = document.getElementById("detected-object");
      const objectLabel = document.getElementById("object-label");
      const diagonalPath = document.getElementById("diagonal-path");
     
      // Update text
      if (irValue) irValue.textContent = detected ? "Object Detected" : "No Object";
     
      // Always show IR transmission (red beam)
      if (svg) svg.classList.add("ir-active");
     
      if (detected) {
        // Object detected → show reflection
        if (svg) svg.classList.add("ir-detected");
        if (object) object.style.opacity = "1";
        if (objectLabel) objectLabel.style.opacity = "1";
        if (diagonalPath) diagonalPath.style.opacity = "0.3";
      } else {
        // No object detected
        if (svg) svg.classList.remove("ir-detected");
        if (object) object.style.opacity = "0";
        if (objectLabel) objectLabel.style.opacity = "0";
        if (diagonalPath) diagonalPath.style.opacity = "0";
      }
    } else {
      // Reset when not active
      const irCard = document.getElementById("ir-card");
      const svg = irCard ? irCard.querySelector("svg") : null;
      if (svg) {
        svg.classList.remove("ir-active", "ir-detected");
      }
      const object = document.getElementById("detected-object");
      const objectLabel = document.getElementById("object-label");
      const diagonalPath = document.getElementById("diagonal-path");
      if (object) object.style.opacity = "0";
      if (objectLabel) objectLabel.style.opacity = "0";
      if (diagonalPath) diagonalPath.style.opacity = "0";
      const irValue = document.getElementById("ir-value");
      if (irValue) irValue.textContent = "Waiting...";
    }
// ===================================
// TLV493D – SIMPLIFIED & WORKING VECTOR
// ===================================
if (protocol === "I2C" && selectedSensor === "TLV493D") {
  const xEl = document.getElementById("tlv493d-x-value");
  const yEl = document.getElementById("tlv493d-y-value");
  const zEl = document.getElementById("tlv493d-z-value");
  const line = document.getElementById("vector-line");
  const head = document.getElementById("vector-head");
  const zIndicator = document.getElementById("z-axis-indicator");
  const label = document.getElementById("mag-label");
  if (currentMagneticX !== null && currentMagneticY !== null && currentMagneticZ !== null) {
    const x = parseFloat(currentMagneticX);
    const y = parseFloat(currentMagneticY);
    const z = parseFloat(currentMagneticZ);
    // Update values
    if (xEl) xEl.textContent = `X: ${x.toFixed(2)} mT`;
    if (yEl) yEl.textContent = `Y: ${y.toFixed(2)} mT`;
    if (zEl) zEl.textContent = `Z: ${z.toFixed(2)} mT`;
    const absX = Math.abs(x), absY = Math.abs(y), absZ = Math.abs(z);
    const max = Math.max(absX, absY, absZ);
    // Scale to fit inside inner circle (radius 45px)
    const scale = 40 / (max || 1);
   
    // Calculate end point of vector
    // SVG: (0,0) is top-left, Y increases DOWNWARD
    const tx = 70 + x * scale;
    const ty = 70 + y * scale; // Add y (not subtract) because in your image, Y: -175.71 should point DOWN
    // Update vector line
    line.setAttribute("x2", tx);
    line.setAttribute("y2", ty);
   
    // Calculate angle from X-axis (0° = right, 90° = down, 180° = left, 270° = up)
    const angleRad = Math.atan2(y, x); // Using y directly (no negative)
    const angleDeg = angleRad * 180 / Math.PI;
   
    // Position arrow head at the end of the line
    head.setAttribute("transform", `translate(${tx},${ty}) rotate(${angleDeg})`);
    // Determine direction and set colors
    if (absZ > absX && absZ > absY) {
      // Z dominant - blue theme
      zIndicator.style.opacity = "1";
      line.style.opacity = "0.3";
      head.style.opacity = "0.3";
      line.style.stroke = "#60a5fa";
      head.style.fill = "#60a5fa";
      label.textContent = z > 0 ? "Z+" : "Z-";
      label.style.color = "#60a5fa";
    } else {
      zIndicator.style.opacity = "0";
      line.style.opacity = "1";
      head.style.opacity = "1";
     
      if (absX > absY) {
        // X dominant - red theme
        line.style.stroke = "#ff6b6b";
        head.style.fill = "#ff6b6b";
        label.textContent = x > 0 ? "East" : "West";
        label.style.color = "#ff6b6b";
      } else {
        // Y dominant - cyan theme
        line.style.stroke = "#6ee7ff";
        head.style.fill = "#6ee7ff";
        // For your data: Y = -175.71 (negative) should show "South" pointing DOWN
        label.textContent = y > 0 ? "North" : "South";
        label.style.color = "#6ee7ff";
      }
    }
   
    // Debug output
    console.log(`Vector: X=${x.toFixed(2)}, Y=${y.toFixed(2)}`);
    console.log(`End point: (${tx.toFixed(1)}, ${ty.toFixed(1)})`);
    console.log(`Angle: ${angleDeg.toFixed(1)}°`);
   
  } else {
    // No data – reset
    if (xEl) xEl.textContent = "X: 0.00 mT";
    if (yEl) yEl.textContent = "Y: 0.00 mT";
    if (zEl) zEl.textContent = "Z: 0.00 mT";
    line.setAttribute("x2", "70");
    line.setAttribute("y2", "70");
    head.setAttribute("transform", "translate(70,70) rotate(0)");
    line.style.stroke = "#6ee7ff";
    head.style.fill = "#6ee7ff";
    line.style.opacity = "0.5";
    head.style.opacity = "0.5";
    zIndicator.style.opacity = "0";
    label.textContent = "Waiting...";
    label.style.color = "#ffd43b";
  }
}


// === LIS3DH ACCELERATION VALUES + BALL UPDATE ===
if (protocol === "I2C" && selectedSensor === "LIS3DH") {
  const ball = document.getElementById("accel-ball");

  if (currentAccelX !== null && currentAccelY !== null && currentAccelZ !== null) {
    const accelX = parseFloat(currentAccelX);
    const accelY = parseFloat(currentAccelY);
    const accelZ = parseFloat(currentAccelZ);

    if (lis3dhXValue) lis3dhXValue.textContent = `X: ${accelX.toFixed(2)} m/s²`;
    if (lis3dhYValue) lis3dhYValue.textContent = `Y: ${accelY.toFixed(2)} m/s²`;
    if (lis3dhZValue) lis3dhZValue.textContent = `Z: ${accelZ.toFixed(2)} m/s²`;

    const scale = 75 / 12; // sensitivity - adjust if needed
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const ballX = clamp(accelX * scale, -67.5, 67.5);
    const ballY = clamp(-accelY * scale, -67.5, 67.5); // invert Y for correct direction

    if (ball) {
      ball.style.transform = `translate(-50%, -50%) translate3d(${ballX}px, ${ballY}px, 0px)`;
    }
  } else {
    // No data yet - show zeros
    if (lis3dhXValue) lis3dhXValue.textContent = "X: 0.00 m/s²";
    if (lis3dhYValue) lis3dhYValue.textContent = "Y: 0.00 m/s²";
    if (lis3dhZValue) lis3dhZValue.textContent = "Z: 0.00 m/s²";
    if (ball) ball.style.transform = "translate(-50%, -50%) translate3d(0px, 0px, 0px)";
  }
}

       // Updated Wind Direction rotation code (now centered perfectly with new needle size)
        if ((protocol === "RS232" || isWeatherMode) && (isWeatherMode || selectedSensor === "Wind Sensor") && currentWindDirection !== null) {
          const direction = parseFloat(currentWindDirection);
          const windDirectionArrow = document.getElementById('wind-direction-arrow');
          const windDirectionValue = document.getElementById('wind-direction-value');
          if (windDirectionArrow) {
            let currentRotation = 0;
            const currentTransform = windDirectionArrow.style.transform || '';
            const match = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
            if (match) currentRotation = parseFloat(match[1]);
            let diff = direction - currentRotation;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            const target = currentRotation + diff;
            windDirectionArrow.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            windDirectionArrow.style.transform = `rotate(${target}deg)`;

            // add this:
            updateWindFlowCard(direction);

            // Make value larger when wind is strong (like in your first picture)
            if (windDirectionValue) {
              windDirectionValue.textContent = `${direction.toFixed(0)}°`;
              windDirectionValue.style.fontSize = currentWindSpeed > 5 ? '2.8em' : '2.4em';
            }
          }
        }

if ((protocol === "RS232" || isWeatherMode) && (isWeatherMode || selectedSensor === "Wind Sensor") && currentWindSpeed !== null) {
  const speed = parseFloat(currentWindSpeed);
  if (windSpeedValue) windSpeedValue.textContent = `${speed.toFixed(1)} m/s`;

  const line1   = document.getElementById("wind-line-1");
  const line2   = document.getElementById("wind-line-2");
  const line3   = document.getElementById("wind-line-3");
  const windCard = document.getElementById("wind-speed-card");

  if (line1 && line2 && line3 && windCard) {
    if (speed > 0) {
      const dur = Math.max(0.4, 2.0 - (speed / 20) * 1.4) + Math.random() * 0.5;  // faster wind = faster travel
      windCard.style.setProperty('--wind-dur', `${dur}s`);
      windCard.classList.add("wind-blowing");

      [line1, line2, line3].forEach(l => {
        l.style.animation      = "";
        l.style.strokeDasharray = "";
        l.style.strokeDashoffset = "";
        const intensity  = Math.min(speed / 20, 1);
        const brightness = Math.round(180 + intensity * 75);
        l.style.stroke = `rgb(128, 163, 202)`;
        l.style.opacity  = "1";
      });

      // ← START BUBBLES (always restart so speed changes take effect)
      _startWindBubbles(speed);

    } else {
      windCard.classList.remove("wind-blowing");
      windCard.style.removeProperty('--wind-dur');
      [line1, line2, line3].forEach(l => {
        l.style.animation        = "none";
        l.style.strokeDasharray  = "none";
        l.style.strokeDashoffset = "0";
        l.style.opacity          = "0.25";
        l.style.stroke           = "var(--text-color)";
      });

      // ← STOP BUBBLES
      _stopWindBubbles();
    }
  }

  if (windSpeedBar) {
    const barWidth = Math.min((speed / 20) * 100, 100);
    windSpeedBar.style.width = `${barWidth}%`;
    if (speed < 5)       windSpeedBar.style.background = "linear-gradient(90deg, #10b981, #34d399)";
    else if (speed < 15) windSpeedBar.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
    else                 windSpeedBar.style.background = "linear-gradient(90deg, #ef4444, #f87171)";
  }

} else {
  const line1    = document.getElementById("wind-line-1");
  const line2    = document.getElementById("wind-line-2");
  const line3    = document.getElementById("wind-line-3");
  const windCard = document.getElementById("wind-speed-card");

  if (windCard) {
    windCard.classList.remove("wind-blowing");
    windCard.style.removeProperty('--wind-dur');
  }

  [line1, line2, line3].forEach(l => {
    if (l) {
      l.style.animation        = "none";
      l.style.strokeDasharray  = "none";
      l.style.strokeDashoffset = "0";
      l.style.opacity          = "0.25";
      l.style.stroke           = "var(--text-color)";
    }
  });

  // ← STOP BUBBLES
  _stopWindBubbles();

  if (windSpeedValue) windSpeedValue.textContent = "0.0 m/s";
  if (windSpeedBar) {
    windSpeedBar.style.width      = "0%";
    windSpeedBar.style.background = "linear-gradient(90deg, #10b981, #34d399)";
  }
}

   // ── SEN66 ──
if (protocol === "I2C" && selectedSensor === "SEN66") {
  _updateSEN66Card();
} else {
  _sen66StopParticles(); // Stop particles if SEN66 is NOT selected
}
    updateSensorVisualizationVisibility();
  } else {
    // No protocol selected
    sensorDropdown.innerHTML = '<option value="" disabled selected>No protocol selected</option>';
    sensorDataDiv.innerHTML  = "<p>No sensor data available.</p>";
 
   const hideList = [
    thermometerContainer, humidityContainer, pressureContainer, lightContainer,
    lis3dhContainer, hallContainer, tlv493dContainer, tofContainer, uvltrContainer,
    irContainer, rainGaugeCard, windDirectionContainer, windSpeedContainer,
    document.getElementById("sen66-pm1-card"),
    document.getElementById("sen66-pm25-card"),
    document.getElementById("sen66-pm4-card"),
    document.getElementById("sen66-pm10-card"),
    document.getElementById("sen66-voc-card"),
    document.getElementById("sen66-nox-card"),
    document.getElementById("sen66-co2-card"),
    vcnlLuxCard, relayCard, blinkyCard, buzzerCard,
  ];
    hideList.forEach(el => { if (el) el.style.display = "none"; });
    // Reset all values
    if (thermometerValue) thermometerValue.textContent = "";
    if (humidityValue) humidityValue.textContent = "";
    if (pressureValue) pressureValue.textContent = "";
    if (lightValue) lightValue.textContent = "";
    if (lis3dhXValue) lis3dhXValue.textContent = "X: 0.00 m/s²";
    if (lis3dhYValue) lis3dhYValue.textContent = "Y: 0.00 m/s²";
    if (lis3dhZValue) lis3dhZValue.textContent = "Z: 0.00 m/s²";
    if (hallValue) hallValue.textContent = "";
    if (tlv493dXValue) tlv493dXValue.textContent = "X: 0.00 mT";
    if (tlv493dYValue) tlv493dYValue.textContent = "Y: 0.00 mT";
    if (tlv493dZValue) tlv493dZValue.textContent = "Z: 0.00 mT";
    if (tofValue) tofValue.textContent = "";
    if (uvValue) uvValue.textContent = "UV: 0.00";
    if (irValue) irValue.textContent = "";
    if (windDirectionValue) windDirectionValue.textContent = "0°";
    if (windSpeedValue) windSpeedValue.textContent = "0.0 m/s";
     _sen66StopParticles();
   
    updateSensorVisualizationVisibility();
  }
}
function selectSensor(sensor) {
  // If switching away from SEN66, restore original thermometer/humidity titles
  if (selectedSensor === "SEN66" && sensor !== "SEN66") {
    const thermoTitle = document.querySelector("#thermometer-container h4");
    if (thermoTitle) thermoTitle.innerHTML = '<i class="fas fa-temperature-half"></i> Temperature';
    const humTitle = document.querySelector("#humidity-card h4");
    if (humTitle) humTitle.innerHTML = '<i class="fas fa-droplet"></i> Humidity';
    // Clear shared globals so they don't bleed into other sensors
    currentTemperature = null;
    currentHumidity    = null;
  }
  selectedSensor = sensor;
  updateSensorUI();
}
/* =========================================================
   VL53L0X  –  parse incoming line  +  drive TOF animation
   ========================================================= */
function updateTOFAnimation(distance) {
  console.log('[TOF ANIMATE] Called with distance:', distance);
  
  const tofValue        = document.getElementById('tof-value');
  const tofPerson       = document.getElementById('tof-person');
  const tofDistanceLine = document.getElementById('tof-distance-line');
  const tofWave         = document.getElementById('tof-wave');

  if (!tofValue || !tofPerson || !tofDistanceLine || !tofWave) {
    console.error('TOF animation elements missing!');
    return;
  }

  /* ---------- invalid / out-of-range ---------- */
  if (distance <= 0 || distance > 850 || isNaN(distance)) {
    tofValue.textContent = '– cm';
    tofPerson.setAttribute('transform', 'translate(20,0)');
    tofDistanceLine.setAttribute('x2', '25');
    tofDistanceLine.setAttribute('stroke', '#4a90e2');
    tofValue.style.color  = '#4a90e2';
    tofWave.style.animation = 'none';
    tofWave.style.opacity = '0';
    return;
  }

  /* ---------- valid distance ---------- */
  tofValue.textContent = distance.toFixed(1) + ' cm';

  // FIXED CALCULATION - person moves from LEFT (close) to RIGHT (far)
  const maxDistance = 850;  // Maximum distance sensor can measure
  const minX = 20;          // Starting X position (left side)
  const maxX = 200;         // Ending X position (right side)
  
  // Calculate position: close distance = left (20), far distance = right (200)
  let personX = minX + (distance / maxDistance) * (maxX - minX);
  personX = Math.max(minX, Math.min(maxX, personX)); // clamp to valid range
  
  console.log(`[TOF] distance=${distance}cm → personX=${personX.toFixed(1)}`);

  tofPerson.setAttribute('transform', `translate(${personX},0)`);
  tofDistanceLine.setAttribute('x2', personX + 5);

  /* ---------- colour coding ---------- */
  let color = '#4a90e2';
  if (distance < 100)       color = '#FF6B6B';     // Red - very close
  else if (distance < 300)  color = '#FFA500';     // Orange - close
  else if (distance < 500)  color = '#4CAF50';     // Green - medium
  // else stays blue for far distances

  tofDistanceLine.setAttribute('stroke', color);
  tofValue.style.color = color;

  /* ---------- proximity wave ---------- */
  if (distance < 300) {
    tofWave.setAttribute('stroke', color);
    tofWave.style.opacity = '1';
    tofWave.style.animation = 'waveExpand 1.5s ease-out infinite';
  } else {
    tofWave.style.animation = 'none';
    tofWave.style.opacity = '0';
  }
}
function updatePressureCard(hpa) {
  const card = document.getElementById('pressure-card');
  const topVal = document.getElementById('pressure-value');
  const midVal = document.getElementById('pressure-value-inner');
  const fill = document.getElementById('gauge-fill');

  if (card) card.style.display = 'flex';

  if (hpa === null || isNaN(hpa)) {
    if (topVal) topVal.textContent = '– hPa';
    if (midVal) midVal.textContent = '–';
    if (fill) fill.style.strokeDasharray = '0 565.48';
    return;
  }

  // Use hPa directly for display
  const txt = hpa.toFixed(1);

  if (topVal) topVal.textContent = `${txt} hPa`;
  if (midVal) midVal.textContent = txt;

  // Update range for hPa (Standard range: 300 hPa to 1100 hPa)
  const minP = 300;
  const maxP = 1100;

  const t = Math.min(Math.max((hpa - minP) / (maxP - minP), 0), 1);

  const circumference = 2 * Math.PI * 90;

  if (fill) {
    fill.style.strokeDasharray = `${t * circumference} ${(1 - t) * circumference}`;
  }

  if (card) {
    card.classList.remove('update-pulse');
    void card.offsetWidth;
    card.classList.add('update-pulse');
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SEN66 – FIXED _updateSEN66Card()
// In renderer.js, find and REPLACE the entire _updateSEN66Card function
// with this version.
// ─────────────────────────────────────────────────────────────────────────────
function _updateSEN66Card() {
  if (selectedSensor !== "SEN66") {
    ["sen66-pm1-card","sen66-pm25-card","sen66-pm4-card","sen66-pm10-card",
     "sen66-voc-card","sen66-nox-card","sen66-co2-card"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    return;
  }
  // ── Update shared card titles ──
  const thermoTitle = document.querySelector("#thermometer-container h4");
  if (thermoTitle) thermoTitle.innerHTML = '<i class="fas fa-temperature-half"></i> Temperature';
  const humTitle = document.querySelector("#humidity-card h4");
  if (humTitle) humTitle.innerHTML = '<i class="fas fa-droplet"></i> Humidity';

  function setArc(arcId, value, maxVal) {
  const el = document.getElementById(arcId);
  if (!el) return;
  const C      = 314.16;                          // 2π × r=50
  const ratio  = Math.min(Math.max(value / maxVal, 0), 1);
  const filled = +(ratio * C).toFixed(2);
  const empty  = +(C - filled).toFixed(2);
  // dasharray controls how much is drawn
  // dashoffset = C/4 = 78.54 shifts start point to 12 o'clock
  el.style.strokeDasharray  = `${filled} ${empty}`;
  el.style.strokeDashoffset = "78.54";            // ← never changes
}

  // ── Helper: update text element ──
  function setVal(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function pulseCard(id) {
    // const el = document.getElementById(id);
    // if (!el) return;
    // el.classList.remove("updated");
    // void el.offsetWidth; // force reflow to restart animation
    // el.classList.add("updated");
  }

  // ── PM1.0 ──
  if (currentSEN66_PM1 !== null) {
    setVal("sen66-pm1-val", `${currentSEN66_PM1.toFixed(1)} µg/m³`);
    setVal("sen66-pm1-big", currentSEN66_PM1.toFixed(1));
    setArc("sen66-pm1-arc", currentSEN66_PM1, 50);
   
    pulseCard("sen66-pm1-card");
  }

  // ── PM2.5 ──
  if (currentSEN66_PM25 !== null) {
    setVal("sen66-pm25-val", `${currentSEN66_PM25.toFixed(1)} µg/m³`);
    setVal("sen66-pm25-big", currentSEN66_PM25.toFixed(1));
    setArc("sen66-pm25-arc", currentSEN66_PM25, 50);
    
    pulseCard("sen66-pm25-card");
  }

  // ── PM4 ──
  if (currentSEN66_PM4 !== null) {
    setVal("sen66-pm4-val", `${currentSEN66_PM4.toFixed(1)} µg/m³`);
    setVal("sen66-pm4-big", currentSEN66_PM4.toFixed(1));
    setArc("sen66-pm4-arc", currentSEN66_PM4, 75);
   
    pulseCard("sen66-pm4-card");
  }

  // ── PM10 ──
  if (currentSEN66_PM10 !== null) {
    setVal("sen66-pm10-val", `${currentSEN66_PM10.toFixed(1)} µg/m³`);
    setVal("sen66-pm10-big", currentSEN66_PM10.toFixed(1));
    setArc("sen66-pm10-arc", currentSEN66_PM10, 100);
  
    pulseCard("sen66-pm10-card");
  }

  // ── VOC ──
  if (currentSEN66_VOC !== null) {
    setVal("sen66-voc-val", currentSEN66_VOC.toFixed(0));
    setVal("sen66-voc-big", currentSEN66_VOC.toFixed(0));
    setArc("sen66-voc-arc", currentSEN66_VOC, 500);
  
    pulseCard("sen66-voc-card");
  }

  // ── NOx ──
  if (currentSEN66_NOx !== null) {
    setVal("sen66-nox-val", currentSEN66_NOx.toFixed(0));
    setVal("sen66-nox-big", currentSEN66_NOx.toFixed(0));
    setArc("sen66-nox-arc", currentSEN66_NOx, 500);
   
    pulseCard("sen66-nox-card");
  }

  // ── CO2 ──
  if (currentSEN66_CO2 !== null) {
    setVal("sen66-co2-val", `${currentSEN66_CO2.toFixed(0)} ppm`);
    setVal("sen66-co2-big", currentSEN66_CO2.toFixed(0));
    setArc("sen66-co2-arc", currentSEN66_CO2, 2000);
   
    pulseCard("sen66-co2-card");
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// SEN66 – PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function _sen66StartParticles() {
  // Only start if SEN66 is actually selected and I2C protocol is active
  const protocol = document.getElementById("sensor-select")?.value;
  if (protocol !== "I2C" || selectedSensor !== "SEN66") {
    return;
  }
  if (_sen66AnimFrame) return; // already running
  _sen66Canvas = document.getElementById("sen66-canvas");
  if (!_sen66Canvas) return;
  _sen66Ctx = _sen66Canvas.getContext("2d");
  _sen66SeedParticles();
  _sen66AnimFrame = requestAnimationFrame(_sen66AnimLoop);
}
 
function _sen66SeedParticles() {
  const count = Math.min(Math.max(Math.floor(_sen66PM25Level * 1.6 + 5), 5), 80);
  _sen66Particles = [];
  for (let i = 0; i < count; i++) _sen66Particles.push(_sen66NewParticle());
}
 
function _sen66NewParticle() {
  const pm = _sen66PM25Level;
  let color;
  if      (pm <= 12) color = "rgba(52,211,153,";
  else if (pm <= 35) color = "rgba(251,191,36,";
  else if (pm <= 55) color = "rgba(249,115,22,";
  else               color = "rgba(239,68,68,";
  const radius = 0.8 + Math.random() * 2.2;
  return {
    x:     Math.random() * 340,
    y:     Math.random() * 130,
    vx:    (Math.random() - 0.5) * 0.5,
    vy:    -0.2 - Math.random() * 0.5,
    r:     radius,
    alpha: 0.25 + Math.random() * 0.55,
    color: color,
    life:  60 + Math.random() * 120,
    age:   0,
  };
}
 
function _sen66AnimLoop() {
  if (!_sen66Canvas || !_sen66Ctx) return;
  const w = _sen66Canvas.width;
  const h = _sen66Canvas.height;
  _sen66Ctx.clearRect(0, 0, w, h);
 
  const targetCount = Math.min(Math.max(Math.floor(_sen66PM25Level * 1.6 + 5), 5), 80);
  while (_sen66Particles.length < targetCount) _sen66Particles.push(_sen66NewParticle());
  if (_sen66Particles.length > targetCount + 10)
    _sen66Particles.splice(0, _sen66Particles.length - targetCount);
 
  for (let i = _sen66Particles.length - 1; i >= 0; i--) {
    const p = _sen66Particles[i];
    p.x += p.vx; p.y += p.vy; p.age += 1;
    const lifeRatio = p.age / p.life;
    const alpha = lifeRatio < 0.15
      ? (lifeRatio / 0.15) * p.alpha
      : lifeRatio > 0.75
        ? ((1 - lifeRatio) / 0.25) * p.alpha
        : p.alpha;
    _sen66Ctx.beginPath();
    _sen66Ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    _sen66Ctx.fillStyle = p.color + alpha + ")";
    _sen66Ctx.fill();
    if (p.age >= p.life || p.y < -5 || p.x < -5 || p.x > w + 5) {
      _sen66Particles[i] = _sen66NewParticle();
      _sen66Particles[i].y = h + 5;
    }
  }
  _sen66AnimFrame = requestAnimationFrame(_sen66AnimLoop);
}
 
function _sen66StopParticles() {
  if (_sen66AnimFrame) { cancelAnimationFrame(_sen66AnimFrame); _sen66AnimFrame = null; }
  if (_sen66Ctx && _sen66Canvas) _sen66Ctx.clearRect(0, 0, _sen66Canvas.width, _sen66Canvas.height);
  _sen66Particles = [];
}
 
function _resetSEN66() {
  currentSEN66_PM1 = currentSEN66_PM25 = currentSEN66_PM4 = currentSEN66_PM10 = null;
  currentSEN66_Hum = currentSEN66_Temp = currentSEN66_VOC = currentSEN66_NOx  = null;
  currentSEN66_CO2 = currentSEN66_Up   = null;
  _sen66PM25Level = 0;
 
  // Reset all 7 individual cards
  const resetMap = [
    ["sen66-pm1-val","— µg/m³"],["sen66-pm25-val","— µg/m³"],
    ["sen66-pm4-val","— µg/m³"],["sen66-pm10-val","— µg/m³"],
    ["sen66-voc-val","—"],["sen66-nox-val","—"],["sen66-co2-val","— ppm"],
    ["sen66-pm1-big","—"],["sen66-pm25-big","—"],["sen66-pm4-big","—"],
    ["sen66-pm10-big","—"],["sen66-voc-big","—"],["sen66-nox-big","—"],["sen66-co2-big","—"],
  ];
  resetMap.forEach(([id, txt]) => { const el = document.getElementById(id); if (el) el.textContent = txt; });
 
  // Reset arcs
  ["sen66-pm1-arc","sen66-pm25-arc","sen66-pm4-arc","sen66-pm10-arc",
   "sen66-voc-arc","sen66-nox-arc","sen66-co2-arc"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.strokeDasharray = "0 314.16";
  });
 
 
}
 
/* ------------------------------------------------------------------ */
/* INTERVAL INPUT HANDLING */
/* ------------------------------------------------------------------ */
const intervalInput = document.getElementById('interval');
if (intervalInput) {
  intervalInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  intervalInput.addEventListener('keydown', function(event) {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'
    ];
    if (allowedKeys.includes(event.key) || /^[0-9]$/.test(event.key)) {
      return;
    }
    event.preventDefault();
  });
}
// Set interval function
async function setDeviceInterval() {
  const v = parseInt(document.getElementById("interval").value);
  if (isNaN(v) || v <= 0) {
    document.getElementById("output").innerHTML += `<span style="color: red;">Please enter a valid interval (positive seconds).</span><br>`;
    return;
  }
  const res = await window.electronAPI.setInterval(v);
  if (res.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${res.error}</span><br>`;
  } else {
    document.getElementById("output").innerHTML += `<span style="color: green;">${res}</span><br>`;
  }
}
// Update sensor visualization visibility
function updateSensorVisualizationVisibility() {
  const visualizationSection = document.querySelector('.sensor-visualization');
  if (visualizationSection) {
    const hasVisibleCards = Array.from(visualizationSection.children).some(child =>
      child.style.display !== 'none' && child.style.display !== ''
    );
    visualizationSection.style.display = hasVisibleCards ? 'grid' : 'none';
  }
}
function parseSensorData(data) {
  const protocol = document.getElementById("sensor-select").value;
  const isWeatherMode = protocol === "WEATHER";
  if (!protocol) {
    return data;
  }
  console.log('=== parseSensorData called ===');
  console.log('Protocol:', protocol);
  console.log('Raw data:', data);
  console.log('Selected sensor before parsing:', selectedSensor);

  const lines = data.split("\n").map(line => line.trim()).filter(line => line);
  let autoSelected = false;
  let dataParsed = false;  // ✅ CRITICAL FIX: Declared OUTSIDE the forEach loop

  lines.forEach(line => {
    // STS30 format
    const sts30Match = line.match(/Temp:\s*([\d.]+)\s*°?C/i);
    if (sts30Match && protocol === "I2C") {
      const temp = parseFloat(sts30Match[1]);
      sensorStatus[protocol]["STS30"] = true;
      if (!selectedSensor && !autoSelected) {
        selectedSensor = "STS30";
        autoSelected = true;
        const sensorDropdown = document.getElementById("sensor-dropdown");
        if (sensorDropdown) sensorDropdown.value = "STS30";
      }
      sensorData[protocol]["STS30 Temperature"] = temp.toFixed(2);
      currentTemperature = temp;
      console.log('STS30 Data parsed:', { temp });
      if (selectedSensor === "STS30") updateSensorUI();
      dataParsed = true;
    }

    try {
      // BME680
      const bme680Match = line.match(/Temperature:\s*([+-]?\d+\.?\d*)\s*[°]?C\s*,\s*Humidity:\s*(\d+\.?\d*)\s*%RH\s*,\s*Pressure:\s*(\d+\.?\d*)\s*kPa/i);
      if (bme680Match && protocol === "I2C") {
        const temp = parseFloat(bme680Match[1]);
        const humidity = parseFloat(bme680Match[2]);
        const pressure = parseFloat(bme680Match[3]);
        sensorStatus[protocol]["BME680"] = true;
        if (!selectedSensor && !autoSelected) {
          selectedSensor = "BME680";
          autoSelected = true;
          const dropdown = document.getElementById("sensor-dropdown");
          if (dropdown) dropdown.value = "BME680";
        }
        sensorData[protocol]["BME680 Temperature"] = temp.toFixed(2);
        sensorData[protocol]["BME680 Humidity"] = humidity.toFixed(2);
        sensorData[protocol]["BME680 Pressure"] = pressure.toFixed(2);
        currentTemperature = temp;
        currentHumidity = humidity;
        currentPressure = pressure * 10;
        console.log('BME680 parsed:', { temp, humidity, pressure });
        if (selectedSensor === "BME680") updateSensorUI();
        dataParsed = true;
      }
      
      // SHT40
      const SHTMatch = line.match(/SHT40:\s*Temperature:\s*([\d.]+)°?C\s*,\s*Humidity:\s*([\d.]+)%/i);
      if (SHTMatch && protocol === "I2C") {
        const [, tempStr, humStr] = SHTMatch;
        const temp = parseFloat(tempStr);
        const humidity = parseFloat(humStr);
        if (!isNaN(temp) && !isNaN(humidity)) {
          sensorStatus[protocol]["SHT40"] = true;
          if (!selectedSensor && !autoSelected) {
            selectedSensor = "SHT40";
            autoSelected = true;
            const dropdown = document.getElementById("sensor-dropdown");
            if (dropdown) dropdown.value = "SHT40";
          }
          sensorData[protocol] = sensorData[protocol] || {};
          sensorData[protocol]["SHT40 Temperature"] = temp.toFixed(2);
          sensorData[protocol]["SHT40 Humidity"] = humidity.toFixed(2);
          currentTemperature = temp;
          currentHumidity = humidity;
          console.log('SHT40 parsed:', { temp, humidity });
          if (selectedSensor === "SHT40") updateSensorUI();
          dataParsed = true;
        }
      }

      // AHT20 — format: "AHT20 Sensor: Temperature = XX.XX C, Humidity = XX.XX %"
      const aht20Match = line.match(/AHT20\s*Sensor\s*:\s*Temperature\s*=\s*([\d.]+)\s*C\s*,\s*Humidity\s*=\s*([\d.]+)\s*%/i);
      if (aht20Match && protocol === "I2C") {
        const temp = parseFloat(aht20Match[1]);
        const humidity = parseFloat(aht20Match[2]);
        if (!isNaN(temp) && !isNaN(humidity)) {
          sensorStatus[protocol]["AHT20"] = true;
          if (!selectedSensor && !autoSelected) {
            selectedSensor = "AHT20";
            autoSelected = true;
            const dropdown = document.getElementById("sensor-dropdown");
            if (dropdown) dropdown.value = "AHT20";
          }
          sensorData[protocol] = sensorData[protocol] || {};
          sensorData[protocol]["AHT20 Temperature"] = temp.toFixed(2);
          sensorData[protocol]["AHT20 Humidity"] = humidity.toFixed(2);
          currentTemperature = temp;
          currentHumidity = humidity;
          console.log('AHT20 parsed:', { temp, humidity });
          if (selectedSensor === "AHT20") updateSensorUI();
          dataParsed = true;
        }
      }

      // SEN66
      if (protocol === "I2C") {
        let sen66Matched = false;
        const pm1Match = line.match(/PM1\.0\s*:\s*([\d.]+)/i);
        const pm25Match = line.match(/PM2\.5\s*:\s*([\d.]+)/i);
        const pm4Match = line.match(/PM4\s*:\s*([\d.]+)/i);
        const pm10Match = line.match(/PM10\s*:\s*([\d.]+)/i);
        const sen66HumMatch = line.match(/Relative\s*Humidity\s*:\s*([\d.]+)/i);
        const sen66TempMatch = line.match(/Temperature\s*:\s*([\d.]+)\s*°?C/i);
        const vocMatch = line.match(/VOC\s*:\s*([\d.]+)/i);
        const noxMatch = line.match(/NOx\s*:\s*([\d.]+)/i);
        const co2Match = line.match(/CO2\s*:\s*([\d.]+)/i);
        const upMatch = line.match(/UPtime\s*:\s*([\d.]+)/i);

        if (pm1Match) { currentSEN66_PM1 = parseFloat(pm1Match[1]); sensorData[protocol]["SEN66 PM1.0"] = currentSEN66_PM1.toFixed(1) + " µg/m³"; sen66Matched = true; }
        if (pm25Match) { currentSEN66_PM25 = parseFloat(pm25Match[1]); sensorData[protocol]["SEN66 PM2.5"] = currentSEN66_PM25.toFixed(1) + " µg/m³"; sen66Matched = true; }
        if (pm4Match) { currentSEN66_PM4 = parseFloat(pm4Match[1]); sensorData[protocol]["SEN66 PM4"] = currentSEN66_PM4.toFixed(1) + " µg/m³"; sen66Matched = true; }
        if (pm10Match) { currentSEN66_PM10 = parseFloat(pm10Match[1]); sensorData[protocol]["SEN66 PM10"] = currentSEN66_PM10.toFixed(1) + " µg/m³"; sen66Matched = true; }
        if (sen66HumMatch) {
          currentSEN66_Hum = parseFloat(sen66HumMatch[1]);
          currentHumidity = currentSEN66_Hum;
          sensorData[protocol]["SEN66 Humidity"] = currentSEN66_Hum.toFixed(1) + " %";
          sen66Matched = true;
        }
        if (sen66TempMatch) {
          currentSEN66_Temp = parseFloat(sen66TempMatch[1]);
          currentTemperature = currentSEN66_Temp;
          sensorData[protocol]["SEN66 Temperature"] = currentSEN66_Temp.toFixed(2) + " °C";
          sen66Matched = true;
        }
        if (vocMatch) { currentSEN66_VOC = parseFloat(vocMatch[1]); sensorData[protocol]["SEN66 VOC"] = currentSEN66_VOC.toString(); sen66Matched = true; }
        if (noxMatch) { currentSEN66_NOx = parseFloat(noxMatch[1]); sensorData[protocol]["SEN66 NOx"] = currentSEN66_NOx.toString(); sen66Matched = true; }
        if (co2Match) { currentSEN66_CO2 = parseFloat(co2Match[1]); sensorData[protocol]["SEN66 CO2"] = currentSEN66_CO2.toFixed(0) + " ppm"; sen66Matched = true; }

        if (sen66Matched) {
          sensorStatus[protocol]["SEN66"] = true;
          if (!selectedSensor && !autoSelected) {
            selectedSensor = "SEN66";
            autoSelected = true;
            const dd = document.getElementById("sensor-dropdown");
            if (dd) dd.value = "SEN66";
          }
          if (selectedSensor === "SEN66") updateSensorUI();
          dataParsed = true;
        }
      }

      // GPIO Blinky
      if (protocol === "GPIO") {
        const blinkyMatch = line.match(/LED\s*(?:[:=]?\s*)?(ON|OFF|1|0)/i);
        if (blinkyMatch) {
          sensorStatus[protocol]["Blinky"] = true;
          const captured = blinkyMatch[1].toUpperCase();
          const state = (captured === "ON" || captured === "1") ? "ON" : "OFF";
          console.log("Blinky state updated:", state);
          sensorData[protocol]["Blinky State"] = state;
          if (!selectedSensor || selectedSensor === "" || selectedSensor === "default") {
            selectedSensor = "Blinky";
            const dropdown = document.getElementById("sensor-dropdown");
            if (dropdown) dropdown.value = "Blinky";
          }
          updateSensorUI();
          dataParsed = true;
        }
        
        const buzzerMatch = line.match(/Buzzer[\s:]*\s*(ACTIVE|INACTIVE|1|0)/i);
        if (buzzerMatch) {
          sensorStatus[protocol]["Buzzer"] = true;
          const captured = buzzerMatch[1].toUpperCase();
          const state = (captured === "ACTIVE" || captured === "1") ? "Active" : "Inactive";
          sensorData[protocol]["Buzzer State"] = state;
          if (!selectedSensor || selectedSensor === "" || selectedSensor === "default") {
            selectedSensor = "Buzzer";
            const dropdown = document.getElementById("sensor-dropdown");
            if (dropdown) dropdown.value = "Buzzer";
          }
          updateSensorUI();
          dataParsed = true;
        }
      }

      // Relay
      const relayMatch = line.match(/Relay[\s:]*\s*(ON|OFF|1|0)/i);
      if (relayMatch && protocol === "GPIO") {
        sensorStatus[protocol]["Relay"] = true;
        const captured = relayMatch[1].toUpperCase();
        const state = (captured === "ON" || captured === "1") ? "ON" : "OFF";
        sensorData[protocol]["Relay State"] = state;
        currentRelayState = state;
        if (!selectedSensor && !autoSelected) {
          selectedSensor = "Relay";
          autoSelected = true;
          const sensorDropdown = document.getElementById("sensor-dropdown");
          if (sensorDropdown) sensorDropdown.value = "Relay";
        }
        if (selectedSensor === "Relay") updateSensorUI();
        dataParsed = true;
      }

      // IR Sensor
      const irMatch = line.match(/IR Sensor:\s*Infrared\s*=\s*(1|0)/i);
      if (irMatch && protocol === "Analog") {
        const value = parseInt(irMatch[1]);
        currentIR = value;
        sensorStatus[protocol]["IR Sensor"] = true;
        sensorData[protocol]["IR Sensor State"] = value === 1 ? "Detected" : "Not Detected";
        if (!selectedSensor || selectedSensor === "" || selectedSensor === "default") {
          selectedSensor = "IR Sensor";
          const dropdown = document.getElementById("sensor-dropdown");
          if (dropdown) dropdown.value = "IR Sensor";
        }
        updateSensorUI();
        console.log("IR Sensor parsed:", { value });
        dataParsed = true;
      }

      // Hall Sensor
      const hallOutputMatch = line.match(/Hall Sensor Output:\s*(\d+)/);
      if (hallOutputMatch) {
        const value = parseInt(hallOutputMatch[1]);
        currentMagneticField = value;
        sensorStatus["Analog"]["Hall_Sensor"] = true;
        if (!selectedSensor) {
          selectedSensor = "Hall Sensor";
          document.getElementById("sensor-dropdown").value = "Hall Sensor";
        }
        updateSensorUI();
        dataParsed = true;
      }

      // Wind Sensor
      const windMatch = line.match(/Wind speed:\s*([\d.]+),\s*Wind direction:\s*([\d.]+)/);
      if (windMatch && (protocol === "RS232" || isWeatherMode)) {
        const [, speed, direction] = windMatch;
        const targetProtocol = isWeatherMode ? "WEATHER" : protocol;
        sensorStatus[targetProtocol]["WindSensor"] = true;
        if (!selectedSensor && !autoSelected && !isWeatherMode) {
          selectedSensor = "Wind Sensor";
          autoSelected = true;
          const sensorDropdown = document.getElementById("sensor-dropdown");
          if (sensorDropdown) sensorDropdown.value = "Wind Sensor";
        }
        sensorData[targetProtocol]["Wind Sensor Direction"] = parseFloat(direction).toFixed(1);
        sensorData[targetProtocol]["Wind Sensor Speed"] = parseFloat(speed).toFixed(1);
        currentWindDirection = parseFloat(direction);
        currentWindSpeed = parseFloat(speed);
        console.log('Wind Sensor parsed:', { direction, speed });
        if (selectedSensor === "Wind Sensor" || isWeatherMode) updateSensorUI();
        dataParsed = true;
      }

      // VCNL4040
      const vcnlMatch = line.match(/VCNL4040\s*:\s*Lux\s*=\s*([\d.]+)/i);
      if (vcnlMatch && protocol === "I2C") {
        const luxValue = parseFloat(vcnlMatch[1]);
        if (!isNaN(luxValue)) {
          sensorStatus[protocol]["VCNL4040"] = true;
          currentVCNLLux = luxValue;
          sensorData[protocol]["VCNL4040 Lux"] = luxValue.toFixed(1);
          if (!selectedSensor) {
            selectedSensor = "VCNL4040";
            const dropdown = document.getElementById("sensor-dropdown");
            if (dropdown) dropdown.value = "VCNL4040";
          }
          updateSensorUI();
          console.log(`VCNL4040 parsed: Lux = ${luxValue}`);
          dataParsed = true;
        }
      }

      // VL53L0X TOF
      const tofMatch = line.match(/distance is\s*([\d.]+)\s*(m|cm)/i);
      if (tofMatch && protocol === "I2C") {
        const [, valueStr, unit] = tofMatch;
        let distanceCm = parseFloat(valueStr);
        if (!isNaN(distanceCm)) {
          if (unit.toLowerCase() === "m") distanceCm *= 100;
          if (distanceCm >= 0 && distanceCm <= 1200) {
            sensorStatus.I2C.VL53L0X = true;
            if (!selectedSensor && !autoSelected) {
              selectedSensor = "VL53L0X";
              autoSelected = true;
              const dd = document.getElementById("sensor-dropdown");
              if (dd) dd.value = "VL53L0X";
            }
            currentDistance = distanceCm;
            sensorData.I2C["VL53L0X Distance"] = distanceCm.toFixed(1) + " cm";
            if (selectedSensor === "VL53L0X") updateTOFAnimation(distanceCm);
            console.log(`[TOF] Parsed: ${distanceCm.toFixed(1)} cm`);
            updateSensorConnectionStatus();
            dataParsed = true;
          }
        }
      }

      // LTR390 UV
      const ltr390UVMatch = line.match(/UV\s*(?:Index)?:?\s*([\d.]+)/i);
      if (ltr390UVMatch && protocol === "I2C") {
        const uv = parseFloat(ltr390UVMatch[1]);
        sensorStatus[protocol]["LTR390"] = true;
        if (!selectedSensor && !autoSelected) {
          selectedSensor = "LTR390";
          autoSelected = true;
          const sensorDropdown = document.getElementById("sensor-dropdown");
          if (sensorDropdown) sensorDropdown.value = "LTR390";
        }
        sensorData[protocol]["LTR390 UV Index"] = uv.toFixed(1);
        currentUV = uv;
        if (selectedSensor === "LTR390") updateSensorUI();
        dataParsed = true;
      }

      // LIS3DH
      const lis3dhMatch = line.match(/(?:#?\d+\s*@\s*\d+\s*ms:\s*)?x\s*([\d.-]+)\s*,\s*y\s*([\d.-]+)\s*,\s*z\s*([\d.-]+)/i);
      if (lis3dhMatch && protocol === "I2C") {
        const [, xStr, yStr, zStr] = lis3dhMatch;
        const accelX = parseFloat(xStr);
        const accelY = parseFloat(yStr);
        const accelZ = parseFloat(zStr);
        if (!isNaN(accelX) && !isNaN(accelY) && !isNaN(accelZ)) {
          sensorStatus[protocol] = sensorStatus[protocol] || {};
          sensorStatus[protocol]["LIS3DH"] = true;
          sensorData[protocol] = sensorData[protocol] || {};
          sensorData[protocol]["LIS3DH X"] = accelX.toFixed(2);
          sensorData[protocol]["LIS3DH Y"] = accelY.toFixed(2);
          sensorData[protocol]["LIS3DH Z"] = accelZ.toFixed(2);
          currentAccelX = accelX;
          currentAccelY = accelY;
          currentAccelZ = accelZ;
          console.log('LIS3DH parsed:', { x: accelX, y: accelY, z: accelZ });
          if (!selectedSensor && !autoSelected) {
            selectedSensor = "LIS3DH";
            autoSelected = true;
            const dropdown = document.getElementById("sensor-dropdown");
            if (dropdown) dropdown.value = "LIS3DH";
          }
          if (selectedSensor === "LIS3DH") updateSensorUI();
          dataParsed = true;
        }
      }

      // STTS751
      const stts751Match = line.match(/STTS751\s*:\s*Temperature\s*:\s*([\d.-]+)\s*°?C\s*\|\s*([\d.-]+)\s*°?F/i);
      if (stts751Match && protocol === "I2C") {
        const tempC = parseFloat(stts751Match[1]);
        const tempF = parseFloat(stts751Match[2]);
        sensorStatus[protocol]["STTS751"] = true;
        if (!selectedSensor && !autoSelected) {
          selectedSensor = "STTS751";
          autoSelected = true;
          const dropdown = document.getElementById("sensor-dropdown");
          if (dropdown) dropdown.value = "STTS751";
        }
        currentTemperature = tempC;
        sensorData[protocol]["STTS751 Temperature"] = tempC.toFixed(2) + " °C";
        sensorData[protocol]["STTS751 Temperature (Fahrenheit)"] = tempF.toFixed(2) + " °F";
        console.log("STTS751 parsed:", { celsius: tempC, fahrenheit: tempF });
        if (selectedSensor === "STTS751") updateSensorUI();
        dataParsed = true;
      }

      // === STANDALONE VEML7700 PARSER ===
      const vemlMatch = line.match(/VEML7700\s*(?:->|-&gt;)\s*Light:\s*([\d.]+)\s*lux/i);
      if (vemlMatch && protocol === "I2C") {
        const lux = parseFloat(vemlMatch[1]);
        currentLight = lux;
        if (!sensorStatus[protocol]) sensorStatus[protocol] = {};
        if (!sensorData[protocol]) sensorData[protocol] = {};
        sensorStatus[protocol]["VEML7700"] = true;
        sensorData[protocol]["VEML7700 Lux"] = lux.toFixed(1);
        if (!selectedSensor && !autoSelected) {
          selectedSensor = "VEML7700";
          autoSelected = true;
          const dropdown = document.getElementById("sensor-dropdown");
          if (dropdown) dropdown.value = "VEML7700";
        }
        if (selectedSensor === "VEML7700") updateSensorUI();
        console.log('✅ VEML7700 parsed:', { lux });
        dataParsed = true;
      }

      // === WEATHER SHIELD PARSING ===
      let wsTemp = null, wsHum = null, wsPress = null, wsLux = null;
      let wsDataFound = false;
      
      const weatherShieldMatch = line.match(/T:([\d.]+),H:([\d.]+),P:([\d.]+),L:([\d.]+)/);
      if (weatherShieldMatch && (protocol === "I2C" || isWeatherMode)) {
        wsTemp = parseFloat(weatherShieldMatch[1]);
        wsHum = parseFloat(weatherShieldMatch[2]);
        wsPress = parseFloat(weatherShieldMatch[3]);
        wsLux = parseFloat(weatherShieldMatch[4]);
        wsDataFound = true;
      }
      
      const bmeSeparateMatch = line.match(/BME680\s*(?:->|-&gt;)\s*Temp:\s*([\d.]+)\s*C\s*\|\s*Hum:\s*([\d.]+)\s*%RH\s*\|\s*Pressure:\s*([\d.]+)\s*hPa/i);
      if (bmeSeparateMatch && protocol === "I2C") {
        wsTemp = parseFloat(bmeSeparateMatch[1]);
        wsHum = parseFloat(bmeSeparateMatch[2]);
        wsPress = parseFloat(bmeSeparateMatch[3]);
        wsDataFound = true;
      }
      
      const combinedMatch = line.match(/(?:BME680\s*\+\s*VEML7700|BME680.*VEML7700).*Temp:\s*([\d.]+)\s*C\s*\|\s*Hum:\s*([\d.]+)\s*%RH\s*\|\s*Pressure:\s*([\d.]+)\s*hPa\s*\|\s*Light:\s*([\d.]+)\s*lux/i);
      if (combinedMatch && protocol === "I2C") {
        wsTemp = parseFloat(combinedMatch[1]);
        wsHum = parseFloat(combinedMatch[2]);
        wsPress = parseFloat(combinedMatch[3]);
        wsLux = parseFloat(combinedMatch[4]);
        wsDataFound = true;
      }
      
      if (wsDataFound) {
        const targetProtocol = isWeatherMode ? "WEATHER" : "I2C";
        if (!sensorStatus[targetProtocol]) sensorStatus[targetProtocol] = {};
        sensorStatus[targetProtocol]["WeatherShield"] = true;
        if (wsTemp !== null) currentTemperature = wsTemp;
        if (wsHum !== null) currentHumidity = wsHum;
        if (wsPress !== null) currentPressure = wsPress;
        if (wsLux !== null) currentLight = wsLux;
        if (wsTemp !== null) sensorData[targetProtocol]["Weather Shield Temperature"] = wsTemp.toFixed(2);
        if (wsHum !== null) sensorData[targetProtocol]["Weather Shield Humidity"] = wsHum.toFixed(2);
        if (wsPress !== null) sensorData[targetProtocol]["Weather Shield Pressure"] = wsPress.toFixed(2);
        if (wsLux !== null) sensorData[targetProtocol]["Weather Shield Lux"] = wsLux.toFixed(1);
        console.log('Weather Shield parsed:', { temp: wsTemp, hum: wsHum, press: wsPress, lux: wsLux });
        if ((!selectedSensor || selectedSensor !== "Weather Shield") && !isWeatherMode) {
          selectedSensor = "Weather Shield";
          const dropdown = document.getElementById("sensor-dropdown");
          if (dropdown) dropdown.value = "Weather Shield";
          autoSelected = true;
        }
        updateSensorUI();
        dataParsed = true;
      }

      // Rain Gauge
      const rainMatch = line.match(/^Rain Tip Detected!\s*Rainfall:\s*(\d+)/);
      if (rainMatch && (protocol === "ADC" || isWeatherMode)) {
        const targetProtocol = isWeatherMode ? "WEATHER" : protocol;
        if (!sensorStatus[targetProtocol]) sensorStatus[targetProtocol] = {};
        if (!sensorData[targetProtocol]) sensorData[targetProtocol] = {};
        sensorStatus[targetProtocol]["Rain Gauge"] = true;
        const Tips = parseInt(rainMatch[1]);
        sensorData[targetProtocol]["Rainfall"] = `${(Tips * 0.5).toFixed(2)} mm`;
        if (!selectedSensor && !autoSelected) {
          selectedSensor = "Rain Gauge";
          autoSelected = true;
          const sensorDropdown = document.getElementById("sensor-dropdown");
          if (sensorDropdown) sensorDropdown.value = "Rain Gauge";
        }
        if (selectedSensor === "Rain Gauge") updateSensorUI();
        dataParsed = true;
      }

    } catch (error) {
      console.error('Parsing error:', error);
      document.getElementById("output").innerHTML += `<span class="log-error">Parsing error: ${error.message}</span><br>`;
    }
  });

  // Final updates - after all lines are processed
  if (autoSelected || dataParsed) {
    updateSensorUI();
  }
  if (protocol === "GPIO") {
    updateSensorUI();
  }
  updateSensorConnectionStatus();
  return data;
}

function resetSensorData() {
  currentTemperature = null;
  currentHumidity = null;
  currentPressure = null;
  currentLight = null;
  currentAccelX = null;
  currentAccelY = null;
  currentAccelZ = null;
  currentMagneticField = null;
  currentMagneticX = null;
  currentMagneticY = null;
  currentMagneticZ = null;
  currentDistance = null;
  currentUV = null;
  currentIR = null;
_resetSEN66();
  
  // ADD THESE:
  currentWindDirection = null;
  currentWindSpeed = null;
  sensorData = {
    "I2C": {},
    "ADC": {},
    "RS232": {},
    "WEATHER": {},
    "RS485": {},
    "SPI": {},
    "Analog": {},
  };
  sensorStatus = {
    "I2C": { SHT40: false, AHT20: false, BME680: false, STS30: false, STTS751: false, SEN66: false, LIS3DH: false, VEML7700: false, TLV493D: false, VL53L0X: false, LTR390: false },
    "RS485": { MD02: false },
    "RS232": { WindSensor: false },
    "WEATHER": { "WeatherParameters": true },
    "SPI": {},
    "Analog": { Hall_Sensor: false, IR_Sensor: false },
    "ADC": { "Rain Gauge": false },
  };
  selectedSensor = null;
  updateSensorUI();
  updateSensorConnectionStatus();
}

async function listPorts() {
  const result = await window.electronAPI.listPorts();
  const select = document.getElementById("ports");
  const current = select.value;
  select.innerHTML = "";
  if (result.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
    return;
  }
  result.forEach((p) => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    if (p === current) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}
async function connectPort() {
  const portName = document.getElementById("ports").value;
  const baudRate = parseInt(document.getElementById("baud-rate").value);
  
  console.log(`connectPort called with port: ${portName}, baudRate: ${baudRate}, isConnected: ${isConnected}, currentPort: ${currentPort}, currentBaud: ${currentBaud}`);

  if (!portName) {
    document.getElementById("output").innerHTML += `<span style="color: red;">Please select a port.</span><br>`;
    return;
  }

  if (!baudRate || isNaN(baudRate) || baudRate <= 0) {
    document.getElementById("output").innerHTML += `<span style="color: red;">Please select a valid baud rate.</span><br>`;
    return;
  }

  // If already connected but settings changed → disconnect first
  if (isConnected && (baudRate !== currentBaud || portName !== currentPort)) {
    console.log(`Settings changed (port: ${currentPort} → ${portName}, baud: ${currentBaud} → ${baudRate}), disconnecting first...`);
    const disconnectResult = await window.electronAPI.disconnectPort();
    
    if (disconnectResult.error) {
      document.getElementById("output").innerHTML += `<span style="color: red;">Failed to disconnect previous connection: ${disconnectResult.error}</span><br>`;
      console.error(`Disconnect error: ${disconnectResult.error}`);
      return;
    }

    document.getElementById("output").innerHTML += `<span style="color: green;">Disconnected from previous connection (port: ${currentPort}, baud: ${currentBaud}). Reconnecting with new settings...</span><br>`;
    resetSensorData();
    isConnected = false;
    currentBaud = null;
    currentPort = null;
    updateSensorConnectionStatus();
  }

  // Now attempt to connect (or reconnect)
  if (!isConnected) {
    const result = await window.electronAPI.connectPort(portName, baudRate);
    
    if (result.error) {
      document.getElementById("output").innerHTML += `<span style="color: red;">Connection failed: ${result.error}</span><br>`;
      console.error(`Connect error: ${result.error}`);
      return;
    }

    document.getElementById("output").innerHTML += `<span style="color: green;">${result}</span><br>`;
    isConnected = true;
    currentBaud = baudRate;
    currentPort = portName;
    updateSensorConnectionStatus();  // Update status immediately
    console.log(`Connected successfully → isConnected: ${isConnected}, port: ${currentPort}, baud: ${currentBaud}`);
  } else {
    document.getElementById("output").innerHTML += `<span style="color: orange;">Already connected to port ${currentPort} at ${currentBaud} baud.</span><br>`;
  }
}

async function disconnectPort() {
  console.log(`disconnectPort called → currentPort: ${currentPort}, currentBaud: ${currentBaud}, isConnected: ${isConnected}`);
  
  if (!isConnected) {
    document.getElementById("output").innerHTML += `<span style="color: orange;">Not connected — nothing to disconnect.</span><br>`;
    return;
  }

  isConnected = false; // Set this first so UI updates correctly
  const result = await window.electronAPI.disconnectPort();
  
  if (result.error) {
    isConnected = true; // Rollback if it failed
    document.getElementById("output").innerHTML += `<span style="color: red;">Disconnect failed: ${result.error}</span><br>`;
    console.error(`Disconnect error: ${result.error}`);
    return;
  }

  document.getElementById("output").innerHTML += `<span style="color: green;">${result}</span><br>`;
  resetSensorData();
  currentBaud = null;
  currentPort = null;

  
  console.log(`Disconnected successfully → isConnected: ${isConnected}, currentPort: ${currentPort}, currentBaud: ${currentBaud}`);
  
  await listPorts();
  updateSensorConnectionStatus();  // Update status immediately
}
async function sendCommand(cmd) {
  if (!cmd) return;
  const result = await window.electronAPI.sendData(cmd);
  if (result.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
    return;
  }
  document.getElementById("output").innerHTML += result + "<br>";
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
window.electronAPI.onSerialData((data) => {
  if (data) {
    const sanitizedData = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Only auto-connect if it's not a disconnect or error message
    const isDisconnectMsg = sanitizedData.includes("disconnected") || sanitizedData.includes("cable unplug");
    const isErrorMsg = sanitizedData.includes("Error") || sanitizedData.includes("error") || sanitizedData.includes("failed");

    if (!isConnected && !isDisconnectMsg && !isErrorMsg) {
      isConnected = true;
      console.log('Auto-set isConnected=true on data receipt');
      updateSensorConnectionStatus();
    }

    const outputDiv = document.getElementById("output");
    let logClass = "log-default";
    
    // === HANDLE C/NRF BACKEND DATA (existing code) ===
    if (sanitizedData.includes("Port disconnected due to cable unplug.")) {
      console.log("Cable unplugged detected, resetting data and state");
      resetSensorData();
      isConnected = false;
      currentBaud = null;
      currentPort = null;
      logClass = "log-error";
      listPorts();
    }

    if (sanitizedData.includes("Error") || sanitizedData.includes("error") || sanitizedData.includes("failed") || sanitizedData.includes("ENOENT") || sanitizedData.includes("Invalid")) {
      logClass = "log-error";
    } else if (
      sanitizedData.includes("Successfully") ||
      sanitizedData.includes("saved OK") ||
      sanitizedData.includes("Directory created") ||
      sanitizedData.includes("Connected to") ||
      sanitizedData.includes("Device ID set") ||
      sanitizedData.includes("Interval updated")
    ) {
      logClass = "log-success";
    } else if (sanitizedData.includes("/usr contents") || sanitizedData.includes("LIST_FILES") || sanitizedData.includes("Device ID:")) {
      logClass = "log-info";
    }

    // Show raw data for C backend
  appendLog(sanitizedData, logClass);

    // Parse and animate C backend data
    parseSensorData(sanitizedData);
    updateSensorConnectionStatus();
  }
});
window.addEventListener("DOMContentLoaded", () => {
  listPorts();
  updateSensorUI();
 
  // Initialize UV card with default value
  updateUVCard(0);
  const baudRateInput = document.getElementById("baud-rate");
  if (baudRateInput) {
    baudRateInput.addEventListener("change", async (event) => {
      const newBaudRate = parseInt(event.target.value);
      console.log(`Baud rate changed to: ${newBaudRate}`);
      if (isConnected && newBaudRate !== currentBaud) {
        console.log(`Baud rate changed from ${currentBaud} to ${newBaudRate}, disconnecting...`);
        const disconnectResult = await window.electronAPI.disconnectPort();
        if (!disconnectResult.error) {
          document.getElementById("output").innerHTML += `<span style="color: green;">Disconnected from port at ${currentBaud} baud. Please reconnect with the new baud rate.</span><br>`;
          resetSensorData();
          isConnected = false;
          currentBaud = null;
          currentPort = null;
        } else {
          document.getElementById("output").innerHTML += `<span style="color: red;">Failed to disconnect: ${disconnectResult.error}</span><br>`;
          console.error(`Disconnect error: ${disconnectResult.error}`);
        }
      }
    });
  }
  const portsSelect = document.getElementById("ports");
  if (portsSelect) {
    portsSelect.addEventListener("focus", async () => {
      await listPorts();
    });
    portsSelect.addEventListener("change", async (event) => {
      const newPort = event.target.value;
      console.log(`Port changed to: ${newPort}`);
      if (isConnected && newPort !== currentPort) {
        console.log(`Port changed from ${currentPort} to ${newPort}, disconnecting...`);
        const disconnectResult = await window.electronAPI.disconnectPort();
        if (!disconnectResult.error) {
          document.getElementById("output").innerHTML += `<span style="color: green;">Disconnected from previous port ${currentPort}. Please connect to the new port.</span><br>`;
          resetSensorData();
          isConnected = false;
          currentBaud = null;
          currentPort = null;
        } else {
          document.getElementById("output").innerHTML += `<span style="color: red;">Failed to disconnect: ${disconnectResult.error}</span><br>`;
          console.error(`Disconnect error: ${disconnectResult.error}`);
        }
      }
    });
  }
  const sensorDropdown = document.getElementById("sensor-dropdown");
  if (sensorDropdown) {
    sensorDropdown.addEventListener("change", (event) => {
      selectSensor(event.target.value);
    });
  }
  let isDragging = false;
  let previousX = 0;
  let previousY = 0;
  let rotateX = 0;
  let rotateY = 0;
  const cubeWrapper = document.getElementById('accel-cube-wrapper');
  const cube = document.getElementById('accel-cube');
  if (cubeWrapper && cube) {
    cubeWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousX = e.clientX;
      previousY = e.clientY;
      cube.style.transition = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousX;
        const deltaY = e.clientY - previousY;
        rotateY += deltaX * 0.5;
        rotateX -= deltaY * 0.5;
        cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        previousX = e.clientX;
        previousY = e.clientY;
      }
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      cube.style.transition = 'transform 0.3s ease';
      updateSensorConnectionStatus();
    });
    cubeWrapper.addEventListener('dragstart', (e) => e.preventDefault());
  }
});
function updateSensorConnectionStatus() {
  const hasRealData = 
    currentTemperature !== null ||
    currentHumidity !== null ||
    currentPressure !== null ||
    currentLight !== null ||
    currentAccelX !== null ||
    currentAccelY !== null ||
    currentAccelZ !== null ||
    currentMagneticField !== null ||
    currentMagneticX !== null ||
    currentMagneticY !== null ||
    currentMagneticZ !== null ||
    currentDistance !== null ||
    currentUV !== null ||
    currentIR !== null ||
    currentWindDirection !== null ||
    currentWindSpeed !== null ||
    currentSEN66_PM1 !== null || currentSEN66_PM25 !== null || currentSEN66_CO2 !== null ||
    (sensorData.ADC && sensorData.ADC["Rainfall"] !== undefined) ||
    Object.values(sensorData).some(protocolData =>
      protocolData && typeof protocolData === 'object' && Object.keys(protocolData).length > 0
    );

  const statusText = document.getElementById('status-text');
  const statusBox = document.getElementById('status-box');
  const statusDot = document.getElementById('status-dot');
  
  const btnConnect = document.getElementById('btn-connect-main');
  const btnDisconnect = document.getElementById('btn-disconnect-main');

  if (!statusText || !statusBox) return;

  // Update Connect/Disconnect buttons
  if (isConnected || hasRealData) {
    statusText.textContent = 'CONNECTED';
    document.body.classList.add('sensors-connected');
    document.body.classList.remove('sensors-disconnected');
    
    statusBox.classList.add('connected');
    statusBox.classList.remove('disconnected');
    
    if (btnConnect) {
      btnConnect.classList.add('btn-dim');
      btnConnect.classList.remove('btn-highlight');
    }
    if (btnDisconnect) {
      btnDisconnect.classList.add('btn-highlight');
      btnDisconnect.classList.remove('btn-dim');
    }
  } else {
    statusText.textContent = 'NOT CONNECTED';
    document.body.classList.remove('sensors-connected');
    document.body.classList.add('sensors-disconnected');
    
    statusBox.classList.add('disconnected');
    statusBox.classList.remove('connected');
    
    if (btnConnect) {
      btnConnect.classList.remove('btn-dim', 'btn-highlight');
    }
    if (btnDisconnect) {
      btnDisconnect.classList.remove('btn-dim', 'btn-highlight');
    }
  }

  console.log('[Status Debug]', { hasRealData, isConnected, currentUV, sensorDataKeys: Object.keys(sensorData.I2C || {}) });
}