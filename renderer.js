let selectedSensor = null;

// Sensor protocol to sensor mapping
const sensorProtocolMap = {
  "I2C": ["SHT40", "BME680", "STS30","STTS751", "LIS3DH", "Lux Sensor", "TLV493D", "TOFVL53L0X", "LTR390"],
  "RS485": ["MD-02"],
  "SPI": [""],
  "Analog": ["Hall Sensor", "IR Sensor"],
};

// Track sensor presence and data
let sensorStatus = {
  "I2C": { SHT40: false, BME680: false ,STS30: false,STTS751: false, LIS3DH: false, LuxSensor: false, TLV493D: false, TOFVL53L0X: false, LTR390: false },
  "RS485": { MD02: false },
  "SPI": { },
  "Analog": { Hall_Sensor: false, IR_Sensor: false }
};

let sensorData = {
  "I2C": {},
  "ADC": {},
  "RS232": {},
  "RS485": {},
  "SPI": {},
  "Analog": {}
};
let currentTemperature = null;
let currentHumidity = null;
let currentPressure = null;
let currentLight = null;
let currentAccelX = null;
let currentAccelY = null;
let currentAccelZ = null;
let currentMagneticField = null; // Hall Sensor (0 or 1)
let currentMagneticX = null; // TLV493D
let currentMagneticY = null;
let currentMagneticZ = null;
let currentDistance = null; // TOFVL53L0X
let currentUV = null; // UVLTR390
let currentAmbient = null;
let currentIR = null; // IR Sensor

// Update sensor UI
function updateSensorUI() {
  const protocol = document.getElementById("sensor-select").value;
  const sensorDropdown = document.getElementById("sensor-dropdown");
  const sensorDataDiv = document.getElementById("sensor-data");
  
  const thermometerContainer = document.getElementById("thermometer-container");
  const humidityContainer = document.getElementById("humidity-card");
  const pressureContainer = document.getElementById("pressure-card");
  const lightContainer = document.getElementById("light-card");
  const lis3dhContainer = document.getElementById("lis3dh-card");
  const hallContainer = document.getElementById("hall-card");
  const tlv493dContainer = document.getElementById("tlv493d-card");
  const tofContainer = document.getElementById("tof-card");
  const uvltrContainer = document.getElementById("uvltr-card");
  const irContainer = document.getElementById("ir-card");

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
  const hallIcon = document.getElementById("hall-icon");
  const tlv493dXValue = document.getElementById("tlv493d-x-value");
  const tlv493dYValue = document.getElementById("tlv493d-y-value");
  const tlv493dZValue = document.getElementById("tlv493d-z-value");
  const tlv493dXBar = document.getElementById("tlv493d-x-bar");
  const tlv493dYBar = document.getElementById("tlv493d-y-bar");
  const tlv493dZBar = document.getElementById("tlv493d-z-bar");
  const tofValue = document.getElementById("tof-value");
  const tofBar = document.getElementById("tof-bar");
  const uvValue = document.getElementById("uv-value");
  const uvBar = document.getElementById("uv-bar");
  const ambientValue = document.getElementById("ambient-value");
  const ambientBar = document.getElementById("ambient-bar");
  const irValue = document.getElementById("ir-value");
  const irFlame = document.getElementById("ir-flame");
  const irGlow = document.querySelector("#ir-glow feGaussianBlur");

  sensorDropdown.innerHTML = '<option value="" disabled selected>Select a Sensor</option>';
  sensorDataDiv.innerHTML = "";

  // Define which sensors support which parameters
  const sensorParameters = {
    "BME680": ["Temperature", "Humidity", "Pressure"],
    "SHT40": ["Temperature", "Humidity"],
    "STTS751": ["Temperature"],
    "Lux Sensor": ["LightIntensity"],
    "STS30": ["Temperature"],
    "LIS3DH": ["AccelerationX", "AccelerationY", "AccelerationZ"],
    "Hall Sensor": ["MagneticField"],
    "TLV493D": ["MagneticX", "MagneticY", "MagneticZ"],
    "TOFVL53L0X": ["Distance"],
    "LTR390": ["UV", "AmbientLight"],
    "IR Sensor": ["Infrared"]
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

    // Display sensor data for selected sensor
    let dataHtml = "<h4>Sensor Data</h4>";
    if (selectedSensor && sensorData[protocol]) {
      const sensorKeys = Object.keys(sensorData[protocol]).filter(key => key.startsWith(selectedSensor));
      if (sensorKeys.length > 0) {
        sensorKeys.forEach(key => {
          let value = sensorData[protocol][key];
          // Format numeric values to two decimal places
          if (!isNaN(parseFloat(value))) {
            value = parseFloat(value).toFixed(2);
          }
          dataHtml += `<div class="sensor-data-item"><strong>${key.replace(selectedSensor + " ", "")}:</strong> ${value}</div>`;
        });
      } else {
        dataHtml += `<p>No data available for ${selectedSensor}.</p>`;
      }
    } else {
      dataHtml += "<p>Please select a sensor to view data.</p>";
    }
    sensorDataDiv.innerHTML = dataHtml;

    // Toggle visibility of sensor cards based on selected sensor and available data
    if (selectedSensor && sensorParameters[selectedSensor]) {
      const supportedParams = sensorParameters[selectedSensor];
      thermometerContainer.style.display = supportedParams.includes("Temperature") && currentTemperature !== null ? "block" : "none";
      humidityContainer.style.display = supportedParams.includes("Humidity") && currentHumidity !== null ? "block" : "none";
      pressureContainer.style.display = supportedParams.includes("Pressure") && currentPressure !== null ? "block" : "none";
      lightContainer.style.display = supportedParams.includes("LightIntensity") && currentLight !== null ? "block" : "none";
      lis3dhContainer.style.display = supportedParams.includes("AccelerationX") && currentAccelX !== null ? "block" : "none";
      hallContainer.style.display = supportedParams.includes("MagneticField") && currentMagneticField !== null ? "block" : "none";
      tlv493dContainer.style.display = supportedParams.includes("MagneticX") && currentMagneticX !== null ? "block" : "none";
      tofContainer.style.display = supportedParams.includes("Distance") && currentDistance !== null ? "block" : "none";
      uvltrContainer.style.display = supportedParams.includes("UV") && currentUV !== null ? "block" : "none";
      irContainer.style.display = supportedParams.includes("Infrared") && currentIR !== null ? "block" : "none";
    } else {
      thermometerContainer.style.display = "none";
      humidityContainer.style.display = "none";
      pressureContainer.style.display = "none";
      lightContainer.style.display = "none";
      lis3dhContainer.style.display = "none";
      hallContainer.style.display = "none";
      tlv493dContainer.style.display = "none";
      tofContainer.style.display = "none";
      uvltrContainer.style.display = "none";
      irContainer.style.display = "none";
    }

    // Update thermometer (for I2C BME680 or SHT40 or STTS751 or STS30)
    if (protocol === "I2C" && (selectedSensor === "BME680" || selectedSensor === "STTS751" || selectedSensor === "SHT40" || selectedSensor === "STS30") && currentTemperature !== null) {
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
      const maxHeight = 160;
      const fillHeight = Math.min(Math.max((temp - minTemp) / (maxTemp - minTemp) * maxHeight, 0), maxHeight);
      thermometerFill.setAttribute("y", 180 - fillHeight);
      thermometerFill.setAttribute("height", fillHeight);
      thermometerFill.setAttribute("fill", fillColor);
      thermometerBulb.setAttribute("fill", fillColor);
      thermometerValue.textContent = `${temp.toFixed(2)}°C`;
    } else {
      thermometerFill.setAttribute("y", 180);
      thermometerFill.setAttribute("height", 0);
      thermometerFill.setAttribute("fill", "#ffeb3b");
      thermometerBulb.setAttribute("fill", "#ffeb3b");
      thermometerValue.textContent = "";
    }

    // Update humidity wave (for I2C BME680 or SHT40)
    if (protocol === "I2C" && (selectedSensor === "BME680" || selectedSensor === "SHT40") && currentHumidity !== null) {
      const humidity = parseFloat(currentHumidity);
      humidityValue.textContent = `${humidity.toFixed(2)}%`;
      const t = Math.min(Math.max(humidity / 100, 0), 1);
      const lowColor = { r: 61, g: 142, b: 180 };
      const highColor = { r: 4, g: 116, b: 168 };
      const r = Math.round(lowColor.r + (highColor.r - lowColor.r) * t);
      const g = Math.round(lowColor.g + (highColor.g - lowColor.g) * t);
      const b = Math.round(lowColor.b + (highColor.b - lowColor.b) * t);
      const primaryColor = `rgb(${r}, ${g}, ${b})`;
      waveColor1.setAttribute("style", `stop-color: ${primaryColor}; stop-opacity: 0.5`);
      waveColor2.setAttribute("style", `stop-color: ${primaryColor}; stop-opacity: 1`);
      const waveHeight = 100 - (humidity * 100 / 100);
      const waveAnimation = `
        @keyframes waveAnimation {
          0% { d: "M 0 ${waveHeight} Q 25 ${waveHeight + 5} 50 ${waveHeight} T 100 ${waveHeight} V 100 H 0 Z"; }
          50% { d: "M 0 ${waveHeight + 2} Q 25 ${waveHeight + 7} 50 ${waveHeight + 2} T 100 ${waveHeight + 2} V 100 H 0 Z"; }
          100% { d: "M 0 ${waveHeight} Q 25 ${waveHeight + 5} 50 ${waveHeight} T 100 ${waveHeight} V 100 H 0 Z"; }
        }
      `;
      const styleSheet = document.styleSheets[0];
      styleSheet.insertRule(waveAnimation, styleSheet.cssRules.length);
      wavePath.style.animation = "waveAnimation 8s ease-in-out infinite";
      wavePath.setAttribute("d", `M 0 ${waveHeight} Q 25 ${waveHeight + 5} 50 ${waveHeight} T 100 ${waveHeight} V 100 H 0 Z`);
    } else {
      humidityValue.textContent = "";
      waveColor1.setAttribute("style", `stop-color: #3d8eb4; stop-opacity: 0.5`);
      waveColor2.setAttribute("style", `stop-color: #0474a8; stop-opacity: 1`);
      wavePath.style.animation = "";
      wavePath.setAttribute("d", "M 0 100 V 100 H 100 V 100 Z");
    }

    // Update pressure card (only for I2C BME680)
    if (protocol === "I2C" && selectedSensor === "BME680" && currentPressure !== null) {
      const pressure = parseFloat(currentPressure);
      let barColor;
      if (pressure >= 950 && pressure <= 1050) {
        barColor = "#34d399";
      } else if ((pressure >= 900 && pressure < 950) || (pressure > 1050 && pressure <= 1100)) {
        barColor = "#ffeb3b";
      } else {
        barColor = "#f87171";
      }
      const barWidth = Math.min(Math.max((pressure - 300) / (1100 - 300) * 100, 0), 100);
      pressureValue.textContent = `${pressure.toFixed(2)} hPa`;
      pressureBar.style.width = `${barWidth}%`;
      pressureBar.style.backgroundColor = barColor;
    } else {
      pressureValue.textContent = "";
      pressureBar.style.width = "0%";
      pressureBar.style.backgroundColor = "#34d399";
    }

   // Update light intensity card (only for I2C Lux Sensor)
    if (protocol === "I2C" && selectedSensor === "Lux Sensor" && currentLight !== null) {
      const light = parseFloat(currentLight);
      const maxLight = 120000;
      const brightness = Math.min(Math.max(light / maxLight, 0), 1);

      sunCircle.setAttribute("r", 20 + 10 * brightness);
      glowFilter.setAttribute("stdDeviation", 5 + 5 * brightness);

      const lowColor = { r: 255, g: 215, b: 0 };
      const highColor = { r: 255, g: 140, b: 0 };
      const r = Math.round(lowColor.r + (highColor.r - lowColor.r) * brightness);
      const g = Math.round(lowColor.g + (highColor.g - lowColor.g) * brightness);
      const b = Math.round(lowColor.b + (highColor.b - lowColor.b) * brightness);
      const sunColor = `rgb(${r}, ${g}, ${b})`;

      sunGradient.children[0].setAttribute("style", `stop-color:${sunColor}; stop-opacity:0.9`);
      sunGradient.children[1].setAttribute("style", `stop-color:${sunColor}; stop-opacity:0.4`);
      sunGradient.children[2].setAttribute("style", `stop-color:${sunColor}; stop-opacity:0`);

      const backgroundBrightness = 0.8 + 0.2 * Math.sin(Date.now() / 300);
      lightContainer.querySelector("rect").style.filter = `brightness(${backgroundBrightness})`;
      sparkles.style.opacity = brightness * 0.7;

      lightValue.textContent = `${light.toFixed(2)} lux`;
    } else {
      lightValue.textContent = "";
      sunCircle.setAttribute("r", 20);
      glowFilter.setAttribute("stdDeviation", 5);
      sunGradient.children[0].setAttribute("style", "stop-color:#ffd700; stop-opacity:0.9");
      sunGradient.children[1].setAttribute("style", "stop-color:#ff8c00; stop-opacity:0.4");
      sunGradient.children[2].setAttribute("style", "stop-color:#ff4500; stop-opacity:0");
      lightContainer.querySelector("rect").style.filter = "brightness(1)";
      sparkles.style.opacity = 0;
    }


  // Update LIS3DH acceleration card (only for I2C LIS3DH) - 3D cube with moving ball and rotation
if (protocol === "I2C" && selectedSensor === "LIS3DH" && currentAccelX !== null && currentAccelY !== null && currentAccelZ !== null) {
  const accelX = parseFloat(currentAccelX);
  const accelY = parseFloat(currentAccelY);
  const accelZ = parseFloat(currentAccelZ);
  lis3dhXValue.textContent = `X: ${accelX.toFixed(2)} m/s²`;
  lis3dhYValue.textContent = `Y: ${accelY.toFixed(2)} m/s²`;
  lis3dhZValue.textContent = `Z: ${accelZ.toFixed(2)} m/s²`;

  // Translate the ball based on acceleration values
  const scale = 3; // Reduced scale for smaller cube (px per m/s²; adjust as needed)
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const ballX = clamp(accelX * scale, -67.5, 67.5); // Adjusted for 150px cube (75px half)
  const ballY = clamp(-accelY * scale, -67.5, 67.5); // -accelY for +Y up convention
  const ballZ = clamp(accelZ * scale, -67.5, 67.5);

  // Apply translation to the ball within the rotated cube
  const ball = document.getElementById("accel-ball");
  if (ball) {
    ball.style.transform = `translate(-50%, -50%) translate3d(${ballX}px, ${ballY}px, ${ballZ}px)`;
  }
} else {
  lis3dhXValue.textContent = "X: 0.00 m/s²";
  lis3dhYValue.textContent = "Y: 0.00 m/s²";
  lis3dhZValue.textContent = "Z: 0.00 m/s²";
  const ball = document.getElementById("accel-ball");
  if (ball) {
    ball.style.transform = `translate(-50%, -50%) translate3d(0px, 0px, 0px)`;
  }
}

    // Update Hall Sensor card (for Analog Hall Sensor)
    if (protocol === "Analog" && selectedSensor === "Hall Sensor" && currentMagneticField !== null) {
      const field = parseInt(currentMagneticField);
      hallValue.textContent = field === 1 ? "High (Detected)" : "Low (Not Detected)";
      hallArc.style.stroke = field === 1 ? "#f44336" : "#34d399";
      hallGlow.setAttribute("stdDeviation", field === 1 ? 5 : 0);
      hallArc.setAttribute("filter", field === 1 ? "url(#hall-glow)" : "");
    } else {
      hallValue.textContent = "";
      hallArc.style.stroke = "#34d399";
      hallGlow.setAttribute("stdDeviation", 0);
      hallArc.removeAttribute("filter");
    }


    // Update TLV493D magnetic field card (for I2C TLV493D)
    if (protocol === "I2C" && selectedSensor === "TLV493D" && currentMagneticX !== null && currentMagneticY !== null && currentMagneticZ !== null) {
      const magX = parseFloat(currentMagneticX);
      const magY = parseFloat(currentMagneticY);
      const magZ = parseFloat(currentMagneticZ);
      const maxMag = 200; // Assuming ±200 mT range, adjust as needed
      const minMag = -200;
      const barColor = "#6b8af7";
      const barWidthX = Math.min(Math.max(((magX - minMag) / (maxMag - minMag)) * 100, 0), 100);
      const barWidthY = Math.min(Math.max(((magY - minMag) / (maxMag - minMag)) * 100, 0), 100);
      const barWidthZ = Math.min(Math.max(((magZ - minMag) / (maxMag - minMag)) * 100, 0), 100);
      tlv493dXValue.textContent = `X: ${magX.toFixed(2)} mT`;
      tlv493dYValue.textContent = `Y: ${magY.toFixed(2)} mT`;
      tlv493dZValue.textContent = `Z: ${magZ.toFixed(2)} mT`;
      tlv493dXBar.style.width = `${barWidthX}%`;
      tlv493dYBar.style.width = `${barWidthY}%`;
      tlv493dZBar.style.width = `${barWidthZ}%`;
      tlv493dXBar.style.backgroundColor = barColor;
      tlv493dYBar.style.backgroundColor = barColor;
      tlv493dZBar.style.backgroundColor = barColor;
    } else {
      tlv493dXValue.textContent = "X: 0.00 mT";
      tlv493dYValue.textContent = "Y: 0.00 mT";
      tlv493dZValue.textContent = "Z: 0.00 mT";
      tlv493dXBar.style.width = "0%";
      tlv493dYBar.style.width = "0%";
      tlv493dZBar.style.width = "0%";
      tlv493dXBar.style.backgroundColor = "#6b8af7";
      tlv493dYBar.style.backgroundColor = "#6b8af7";
      tlv493dZBar.style.backgroundColor = "#6b8af7";
    }

    // Update TOFVL53L0X distance card (for I2C TOFVL53L0X)
    if (protocol === "I2C" && selectedSensor === "TOFVL53L0X" && currentDistance !== null) {
      const distance = parseFloat(currentDistance);
      const maxDist = 2000; // Assuming max 2000 mm
      const barColor = "#34d399";
      const barWidth = Math.min(Math.max((distance / maxDist) * 100, 0), 100);
      tofValue.textContent = `${distance.toFixed(2)} mm`;
      tofBar.style.width = `${barWidth}%`;
      tofBar.style.backgroundColor = barColor;
    } else {
      tofValue.textContent = "";
      tofBar.style.width = "0%";
      tofBar.style.backgroundColor = "#34d399";
    }

    // Update UVLTR390 card (for I2C UVLTR390)
    if (protocol === "I2C" && selectedSensor === "LTR390" && currentUV !== null && currentAmbient !== null) {
      const uv = parseFloat(currentUV);
      const ambient = parseFloat(currentAmbient);
      const maxUV = 100; // Arbitrary max for UV index
      const maxAmbient = 120000; // Similar to light
      const barColor = "#6b8af7";
      const barWidthUV = Math.min(Math.max((uv / maxUV) * 100, 0), 100);
      const barWidthAmbient = Math.min(Math.max((ambient / maxAmbient) * 100, 0), 100);
      uvValue.textContent = `UV: ${uv.toFixed(2)}`;
      ambientValue.textContent = `Ambient: ${ambient.toFixed(2)} lux`;
      uvBar.style.width = `${barWidthUV}%`;
      ambientBar.style.width = `${barWidthAmbient}%`;
      uvBar.style.backgroundColor = barColor;
      ambientBar.style.backgroundColor = barColor;
    } else {
      uvValue.textContent = "UV: 0.00";
      ambientValue.textContent = "Ambient: 0.00 lux";
      uvBar.style.width = "0%";
      ambientBar.style.width = "0%";
      uvBar.style.backgroundColor = "#6b8af7";
      ambientBar.style.backgroundColor = "#6b8af7";
    }

    // Update IR Sensor card (for Analog IR Sensor)
    if (protocol === "Analog" && selectedSensor === "IR Sensor" && currentIR !== null) {
      const ir = parseFloat(currentIR);
      let flameColor1 = "#ffeb3b";
      let flameColor2 = "#ff9800";
      let flameColor3 = "#f44336";
      let glowStd = 0;
      if (ir <= 50) {
        glowStd = 2;
      } else if (ir > 50 && ir <= 100) {
        glowStd = 5;
      } else {
        glowStd = 8;
      }
      const brightness = Math.min(Math.max(ir / 200, 0), 1); // Arbitrary scaling
      const flamePaths = irFlame.querySelectorAll("path");
      flamePaths[0].setAttribute("fill", flameColor1);
      flamePaths[1].setAttribute("fill", flameColor2);
      flamePaths[2].setAttribute("fill", flameColor3);
      irGlow.setAttribute("stdDeviation", glowStd * brightness);
      irFlame.setAttribute("filter", "url(#ir-glow)");
      irValue.textContent = `${ir.toFixed(2)}`;
    } else {
      irValue.textContent = "";
      const flamePaths = irFlame.querySelectorAll("path");
      flamePaths[0].setAttribute("fill", "#ffeb3b");
      flamePaths[1].setAttribute("fill", "#ff9800");
      flamePaths[2].setAttribute("fill", "#f44336");
      irGlow.setAttribute("stdDeviation", 0);
      irFlame.removeAttribute("filter");
    }

    // Update visualization section visibility
    updateSensorVisualizationVisibility();
  } else {
    sensorDropdown.innerHTML = '<option value="" disabled selected>No protocol selected</option>';
    sensorDataDiv.innerHTML = "<p>No sensor data available.</p>";
    thermometerContainer.style.display = "none";
    humidityContainer.style.display = "none";
    pressureContainer.style.display = "none";
    lightContainer.style.display = "none";
    lis3dhContainer.style.display = "none";
    hallContainer.style.display = "none";
    tlv493dContainer.style.display = "none";
    tofContainer.style.display = "none";
    uvltrContainer.style.display = "none";
    irContainer.style.display = "none";
    thermometerFill.setAttribute("y", 180);
    thermometerFill.setAttribute("height", 0);
    thermometerFill.setAttribute("fill", "#ffeb3b");
    thermometerBulb.setAttribute("fill", "#ffeb3b");
    thermometerValue.textContent = "";
    humidityValue.textContent = "";
    waveColor1.setAttribute("style", `stop-color: #3d8eb4; stop-opacity: 0.5`);
    waveColor2.setAttribute("style", `stop-color: #0474a8; stop-opacity: 1`);
    wavePath.style.animation = "";
    wavePath.setAttribute("d", "M 0 100 V 100 H 100 V 100 Z");
    pressureValue.textContent = "";
    pressureBar.style.width = "0%";
    pressureBar.style.backgroundColor = "#34d399";
    lightValue.textContent = "";
    lis3dhXValue.textContent = "X: 0.00 m/s²";
    lis3dhYValue.textContent = "Y: 0.00 m/s²";
    lis3dhZValue.textContent = "Z: 0.00 m/s²";
    hallValue.textContent = "";
    hallIcon.style.color = "#6b8af7";
    tlv493dXValue.textContent = "X: 0.00 mT";
    tlv493dYValue.textContent = "Y: 0.00 mT";
    tlv493dZValue.textContent = "Z: 0.00 mT";
    tlv493dXBar.style.width = "0%";
    tlv493dYBar.style.width = "0%";
    tlv493dZBar.style.width = "0%";
    tlv493dXBar.style.backgroundColor = "#6b8af7";
    tlv493dYBar.style.backgroundColor = "#6b8af7";
    tlv493dZBar.style.backgroundColor = "#6b8af7";
    tofValue.textContent = "";
    tofBar.style.width = "0%";
    tofBar.style.backgroundColor = "#34d399";
    uvValue.textContent = "UV: 0.00";
    ambientValue.textContent = "Ambient: 0.00 lux";
    uvBar.style.width = "0%";
    ambientBar.style.width = "0%";
    uvBar.style.backgroundColor = "#6b8af7";
    ambientBar.style.backgroundColor = "#6b8af7";
    irValue.textContent = "";
    updateSensorVisualizationVisibility();
  }
}

// Handle sensor selection
function selectSensor(sensor) {
  // If the selected sensor is already active, deselect it
  if (selectedSensor === sensor) {
    selectedSensor = null;
  } else {
    selectedSensor = sensor;
  }
  updateSensorUI();
}

// Parse sensor data and update presence
function parseSensorData(data) {
  const protocol = document.getElementById("sensor-select").value;
  if (!protocol) return;

  const lines = data.split("\n").map(line => line.trim()).filter(line => line);
  lines.forEach(line => {
    const sensorMatch = line.match(/^(.+?):\s*(.*)$/);
    if (sensorMatch) {
      const sensorName = sensorMatch[1].trim();
      let paramsStr = sensorMatch[2].trim();
      const params = paramsStr.split(',').map(p => p.trim());
      const paramMap = {};
      params.forEach(p => {
        const [key, value] = p.split(/[:=]/).map(part => part.trim());
        if (key && value !== undefined) {
          paramMap[key] = value;
        }
      });

      const sensors = sensorProtocolMap[protocol] || [];
      if (sensors.includes(sensorName)) {
        sensorStatus[protocol][sensorName.replace(" ", "")] = true;

        let keyMap = {};
        if (sensorName === "LIS3DH") {
          keyMap = {
            'X': 'AccelerationX',
            'Y': 'AccelerationY',
            'Z': 'AccelerationZ'
          };
        } else if (sensorName === "LTR390") {
          keyMap = {
            'UV Index': 'UV', // Map 'UV Index' to 'UV'
            'Ambient': 'AmbientLight' // Map 'Ambient' to 'AmbientLight' if applicable
          };
        }

        Object.entries(paramMap).forEach(([key, value]) => {
          const mappedKey = keyMap[key] || key;
          const formattedValue = isNaN(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
          sensorData[protocol][`${sensorName} ${mappedKey}`] = formattedValue;
        });

        if (selectedSensor === "BME680" || sensorName === "STTS751" || sensorName === "SHT40" || sensorName === "STS30") {
          currentTemperature = paramMap['Temperature'] ? parseFloat(paramMap['Temperature']) : null;
          currentHumidity = paramMap['Humidity'] ? parseFloat(paramMap['Humidity']) : null;
          if (sensorName === "BME680") {
            currentPressure = paramMap['Pressure'] ? parseFloat(paramMap['Pressure']) : null;
          }
        }
        if (sensorName === "Lux Sensor") {
          currentLight = paramMap['LightIntensity'] ? parseFloat(paramMap['LightIntensity']) : null;
        }
        if (sensorName === "LIS3DH") {
          currentAccelX = paramMap['X'] ? parseFloat(paramMap['X']) : null;
          currentAccelY = paramMap['Y'] ? parseFloat(paramMap['Y']) : null;
          currentAccelZ = paramMap['Z'] ? parseFloat(paramMap['Z']) : null;
        }
        if (sensorName === "Hall Sensor") {
          currentMagneticField = paramMap['MagneticField'];
        }
        if (sensorName === "TLV493D") {
          currentMagneticX = paramMap['MagneticX'] ? parseFloat(paramMap['MagneticX']) : null;
          currentMagneticY = paramMap['MagneticY'] ? parseFloat(paramMap['MagneticY']) : null;
          currentMagneticZ = paramMap['MagneticZ'] ? parseFloat(paramMap['MagneticZ']) : null;
        }
        if (sensorName === "TOFVL53L0X") {
          currentDistance = paramMap['Distance'] ? parseFloat(paramMap['Distance']) : null;
        }
        if (sensorName === "LTR390") {
          currentUV = paramMap['UV Index'] ? parseFloat(paramMap['UV Index']) : null;
          currentAmbient = paramMap['Ambient'] ? parseFloat(paramMap['Ambient']) : null;
        }
        if (sensorName === "IR Sensor") {
          currentIR = paramMap['Infrared'] ? parseFloat(paramMap['Infrared']) : null;
        }
        if (selectedSensor === sensorName) {
          updateSensorUI();
        }
      }
    }

    const rainMatch = line.match(/^Rain Tip Detected!\s*Hourly:\s*(\d+)\s*Daily:\s*(\d+)\s*Weekly:\s*(\d+)/);
    if (rainMatch && protocol === "ADC") {
      sensorStatus[protocol]["Rain Gauge"] = true;
      sensorData[protocol]["Rain Gauge Hourly"] = `${rainMatch[1]} tips`;
      sensorData[protocol]["Rain Gauge Daily"] = `${rainMatch[2]} tips`;
      sensorData[protocol]["Rain Gauge Weekly"] = `${rainMatch[3]} tips`;
      if (selectedSensor === "Rain Gauge") {
        updateSensorUI();
      }
    }
  });
}
async function listPorts() {
  const result = await window.electronAPI.listPorts();
  const select = document.getElementById("ports");
  select.innerHTML = "";

  if (result.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
    return;
  }

  result.forEach((p) => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    select.appendChild(option);
  });
}

async function connectPort() {
  const portName = document.getElementById("ports").value;
  const baudRate = document.getElementById("baud-rate").value;

  if (!portName) {
    document.getElementById("output").innerHTML += `<span style="color: red;">Please select a port.</span><br>`;
    return;
  }

  if (!baudRate || isNaN(baudRate) || baudRate <= 0) {
    document.getElementById("output").innerHTML += `<span style="color: red;">Please select a valid baud rate.</span><br>`;
    return;
  }

  const result = await window.electronAPI.connectPort(portName, baudRate);

  if (result.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
    return;
  }

  document.getElementById("output").innerHTML += `<span style="color: green;">${result}</span><br>`;
}

async function disconnectPort() {
  const result = await window.electronAPI.disconnectPort();
  if (result.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
    return;
  }
  document.getElementById("output").innerHTML += `<span style="color: green;">${result}</span><br>`;
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

async function setInterval() {
  const interval = document.getElementById("interval").value;

  if (!interval || isNaN(interval) || interval <= 0) {
    document.getElementById("output").innerHTML += `<span style="color: red;">Please enter a valid interval (positive seconds).</span><br>`;
    return;
  }

  const result = await window.electronAPI.setInterval(interval);
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
    const outputDiv = document.getElementById("output");
    let logClass = "log-default";

    parseSensorData(sanitizedData);

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

    outputDiv.innerHTML += `<span class="log-line ${logClass}">${sanitizedData}</span><br>`;
    outputDiv.scrollTop = outputDiv.scrollHeight;
  }
});

window.addEventListener("DOMContentLoaded", () => {
  listPorts();
  updateSensorUI();

  // Cube rotation variables
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
      cube.style.transition = 'none'; // Disable transition during drag
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousX;
        const deltaY = e.clientY - previousY;
        rotateY += deltaX * 0.5; // Adjust sensitivity
        rotateX -= deltaY * 0.5; // Adjust sensitivity
        cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        previousX = e.clientX;
        previousY = e.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      cube.style.transition = 'transform 0.3s ease'; // Re-enable transition
    });

    // Prevent text selection while dragging
    cubeWrapper.addEventListener('dragstart', (e) => e.preventDefault());
  }
});