let selectedSensor = null;


// Sensor protocol to sensor mapping
const sensorProtocolMap = {
  "I2C": ["SHT40", "BME680", "STS30", "STTS751", "LIS3DH", "VEML7700", "TLV493D", "VL53L0X", "LTR390"],
  "RS485": ["MD-02"],
  "SPI": [""],
  "Analog": ["Hall Sensor", "IR Sensor"],
};

// Track sensor presence and data
let sensorStatus = {
  "I2C": { SHT40: false, BME680: false, STS30: false, STTS751: false, LIS3DH: false, VEML7700: false, TLV493D: false, VL53L0X: false, LTR390: false },
  "RS485": { MD02: false },
  "SPI": {},
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
let currentMagneticField = null;
let currentMagneticX = null;
let currentMagneticY = null;
let currentMagneticZ = null;
let currentDistance = null;
let currentUV = null;
let currentIR = null;

let isConnected = false;
let currentBaud = null;
let currentPort = null;

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
  const hallArc = document.getElementById("hall-arc-path");
  const hallGlow = document.getElementById("hall-glow");

  const tlv493dXValue = document.getElementById("tlv493d-x-value");
  const tlv493dYValue = document.getElementById("tlv493d-y-value");
  const tlv493dZValue = document.getElementById("tlv493d-z-value");
  const tlv493dXBar = document.getElementById("tlv493d-x-bar");
  const tlv493dYBar = document.getElementById("tlv493d-y-bar");
  const tlv493dZBar = document.getElementById("tlv493d-z-bar");

  const tofValue = document.getElementById("tof-value");
  const tofPerson = document.getElementById("tof-person");

  const uvValue = document.getElementById("uv-value");
  const uvBar = document.getElementById("uv-bar");
  const uvSun = document.getElementById("uv-sun");
  const uvSunCircle = document.getElementById("uv-sun-circle");
  const uvRays = document.getElementById("uv-rays");
  const uvGlow = document.getElementById("uvGlow");

  const irValue = document.getElementById("ir-value");
  const irFlame = document.getElementById("ir-flame");
  const irGlow = document.querySelector("#ir-glow feGaussianBlur");

  sensorDropdown.innerHTML = '<option value="" disabled>Select a Sensor</option>';
  sensorDataDiv.innerHTML = "";

  // Define which sensors support which parameters
  const sensorParameters = {
    "BME680": ["Temperature", "Humidity", "Pressure"],
    "SHT40": ["Temperature", "Humidity"],
    "STTS751": ["Temperature"],
    "VEML7700": ["Lux"],
    "STS30": ["Temperature"],
    "LIS3DH": ["AccelerationX", "AccelerationY", "AccelerationZ"],
    "Hall Sensor": ["MagneticField"],
    "TLV493D": ["MagneticX", "MagneticY", "MagneticZ"],
    "VL53L0X": ["Distance"],
    "LTR390": ["UV"],
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
      lightContainer.style.display = supportedParams.includes("Lux") && currentLight !== null ? "block" : "none";
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
      wavePath.setAttribute("d", "M 0 100 V 100 H 0 Z");
    }

    // Update pressure card (only for I2C BME680)
    if (protocol === "I2C" && selectedSensor === "BME680" && currentPressure !== null) {
      updatePressureCard(parseFloat(currentPressure));
    }
      function updatePressureCard(hpa) {
        const card   = document.getElementById('pressure-card');
        const value  = document.getElementById('pressure-value');
        const needle = document.getElementById('pressureNeedle');

        if (hpa === null || isNaN(hpa)) { // no data → hide
          card.style.display = 'none';
          return;
        }

      card.style.display = 'flex';  // show card
       value.textContent = `${Number(hpa).toFixed(1)} hPa`;

        /* 300 hPa → 0° (left)   1100 hPa → 180° (right) */
        const minP = 300, maxP = 1100;
        const t    = Math.min(Math.max((hpa - minP) / (maxP - minP), 0), 1);
        /* 300 hPa → ‑90° (left)   1100 hPa → +90° (right) */
        const angle = (t * 180) - 90;          // ‑90° … +90°
      needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;

        // optional tiny pulse on update (kept from your last code)
        needle.classList.remove('needle-update');
        void needle.offsetWidth;
        needle.classList.add('needle-update');
      }

    // Update light intensity card (only for I2C Lux Sensor)
    if (protocol === "I2C" && selectedSensor === "VEML7700" && currentLight !== null) {
      lightCard.style.display = "block";
      const light = parseFloat(currentLight);
      const maxLight = 120000;
      const brightness = Math.min(Math.max(light / maxLight, 0), 1);

      const sunSvg = document.getElementById("light-sun");
      const moonSvg = document.getElementById("light-moon");
      const sunCircle = document.getElementById("sun-circle");
      const sunGradient = document.getElementById("sunGradient");
      const sunGlow = document.getElementById("sunGlow");
      const moonShape = document.getElementById("moon-shape");
      const moonGradient = document.getElementById("moonGradient");
      const moonGlow = document.getElementById("moonGlow");
      const moonSparkles = document.getElementById("moon-sparkles");
      const sunRays = document.getElementById("sun-rays");

      // Toggle Sun/Moon based on light value
      if (light < 100) {
        // Show Moon
        sunSvg.style.display = "none";
        moonSvg.style.display = "block";
        // Moon color interpolation (dim to bright moonlight)
        const lowColor = { r: 230, g: 230, b: 250 }; // Lavender
        const highColor = { r: 70, g: 130, b: 180 }; // Steel Blue
        const t = light / 100; // Scale from 0 to 100 lux
        const r = Math.round(lowColor.r + (highColor.r - lowColor.r) * t);
        const g = Math.round(lowColor.g + (highColor.g - lowColor.g) * t);
        const b = Math.round(lowColor.b + (highColor.b - lowColor.b) * t);
        const moonColor = `rgb(${r}, ${g}, ${b})`;
        moonGradient.children[0].setAttribute("style", `stop-color:${moonColor}; stop-opacity:0.9`);
        moonGradient.children[1].setAttribute("style", `stop-color:${moonColor}; stop-opacity:0.6`);
        moonGradient.children[2].setAttribute("style", `stop-color:${moonColor}; stop-opacity:0.3`);
        moonGlow.setAttribute("stdDeviation", 4 + 2 * t); // Glow increases slightly with light
        moonSparkles.style.opacity = 0.5 + 0.5 * t; // Sparkles more visible at higher lux
      } else {
        // Show Sun
        sunSvg.style.display = "block";
        moonSvg.style.display = "none";
        // Sun color interpolation (yellow to orange-red)
        const lowColor = { r: 255, g: 235, b: 59 }; // Bright Yellow
        const highColor = { r: 255, g: 69, b: 0 }; // Orange-Red
        const t = Math.min((light - 100) / (maxLight - 100), 1); // Scale from 100 to maxLight
        const r = Math.round(lowColor.r + (highColor.r - lowColor.r) * t);
        const g = Math.round(lowColor.g + (highColor.g - lowColor.g) * t);
        const b = Math.round(lowColor.b + (highColor.b - lowColor.b) * t);
        const sunColor = `rgb(${r}, ${g}, ${b})`;
        sunGradient.children[0].setAttribute("style", `stop-color:${sunColor}; stop-opacity:1`);
        sunGradient.children[1].setAttribute("style", `stop-color:${sunColor}; stop-opacity:0.8`);
        sunGradient.children[2].setAttribute("style", `stop-color:${sunColor}; stop-opacity:0.4`);
        sunGlow.setAttribute("stdDeviation", 3 + 3 * brightness); // Glow increases with brightness
        sunCircle.setAttribute("r", 24 + 9 * brightness); // Sun size increases with brightness
        sunRays.style.opacity = 0.6 + 0.4 * brightness; // Rays more visible at higher brightness
        // Update ray color to darker shade based on sun color
        const rayR = Math.max(r - 50, 0); // Darken red component
        const rayG = Math.max(g - 50, 0); // Darken green component
        const rayB = Math.max(b - 50, 0); // Darken blue component
        const rayColor = `rgb(${rayR}, ${rayG}, ${rayB})`;
        const rays = sunRays.getElementsByClassName("sun-ray");
        for (let ray of rays) {
          ray.setAttribute("stroke", rayColor);
        }
      }

      lightValue.textContent = `${light.toFixed(1)} lux`;
    }

    // Update LIS3DH acceleration card (only for I2C LIS3DH)
    if (protocol === "I2C" && selectedSensor === "LIS3DH" && currentAccelX !== null && currentAccelY !== null && currentAccelZ !== null) {
      const accelX = parseFloat(currentAccelX);
      const accelY = parseFloat(currentAccelY);
      const accelZ = parseFloat(currentAccelZ);
      lis3dhXValue.textContent = `X: ${accelX.toFixed(2)} m/s²`;
      lis3dhYValue.textContent = `Y: ${accelY.toFixed(2)} m/s²`;
      lis3dhZValue.textContent = `Z: ${accelZ.toFixed(2)} m/s²`;

      const scale = 75 / 12;
      const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
      const ballX = clamp(accelX * scale, -67.5, 67.5);
      const ballY = clamp(-accelY * scale, -67.5, 67.5);
      const ballZ = clamp(accelZ * scale, -67.5, 67.5);

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
    if (protocol === "Analog" && selectedSensor === "Hall Sensor" && currentMagneticField !== null && hallValue && hallArc && hallGlow) {
      const field = parseInt(currentMagneticField);
      hallValue.textContent = field === 1 ? "High (Detected)" : "Low (Not Detected)";
      hallArc.style.stroke = field === 1 ? "#f44336" : "#34d399";
      hallGlow.setAttribute("stdDeviation", field === 1 ? 5 : 0);
      hallArc.setAttribute("filter", field === 1 ? "url(#hall-glow)" : "");
    } else {
      if (hallValue) hallValue.textContent = "";
      if (hallArc && hallGlow) {
        hallArc.style.stroke = "#34d399";
        hallGlow.setAttribute("stdDeviation", 0);
        hallArc.removeAttribute("filter");
      }
    }

    // Update TLV493D magnetic field card (for I2C TLV493D)
    if (protocol === "I2C" && selectedSensor === "TLV493D" && currentMagneticX !== null && currentMagneticY !== null && currentMagneticZ !== null) {
      const magX = parseFloat(currentMagneticX);
      const magY = parseFloat(currentMagneticY);
      const magZ = parseFloat(currentMagneticZ);
      const maxMag = 200;
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

    // Update TOFVL53L0X distance card (for I2C VL53L0X)
    if (protocol === "I2C" && selectedSensor === "VL53L0X" && currentDistance !== null) {
      const distance = parseFloat(currentDistance);
      const maxDist = 800;
      tofValue.textContent = `${distance.toFixed(2)} cm`;
      const pos = 20 + Math.min(Math.max((distance / maxDist) * 170, 0), 170);
      tofPerson.setAttribute("transform", `translate(${pos}, 0)`);
    } else {
      tofValue.textContent = "";
      tofPerson.setAttribute("transform", "translate(20, 0)");
    }

    // Update LTR390 card (for I2C LTR390)
    if (protocol === "I2C" && selectedSensor === "LTR390" && currentUV !== null) {
      const uv = parseFloat(currentUV);
      const maxUV = 11;
      const barColor = "#6b8af7";
      const barWidthUV = Math.min(Math.max((uv / maxUV) * 100, 0), 100);
      uvValue.textContent = `UV: ${uv.toFixed(2)}`;
      uvBar.style.width = `${barWidthUV}%`;
      uvBar.style.backgroundColor = barColor;

      const uvRanges = [
        { range: [0, 2], label: "Low", color: "#ffeb3b" },
        { range: [2, 5], label: "Moderate", color: "#ff9800" },
        { range: [6, 7], label: "High", color: "#ff5500ff" },
        { range: [8, 10], label: "Very High", color: "#f11a0bff" },
        { range: [11, Infinity], label: "Extreme", color: "#9c27b0" }
      ];

      let uvColor = "#ffeb3b";
      let uvLabel = "Low";
      for (const range of uvRanges) {
        if (uv >= range.range[0] && uv <= range.range[1]) {
          uvColor = range.color;
          uvLabel = range.label;
          break;
        }
      }

      uvSunCircle.setAttribute("r", uv >= 3 ? 22 : 18);
      uvGlow.setAttribute("stdDeviation", uv >= 3 ? 5 : 3);
      uvSunGradient.children[0].setAttribute("style", `stop-color:${uvColor}; stop-opacity:1`);
      uvSunGradient.children[1].setAttribute("style", `stop-color:${uvColor}; stop-opacity:0.8`);
      uvSunGradient.children[2].setAttribute("style", `stop-color:${uvColor}; stop-opacity:0.4`);

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

      uvValue.textContent = `UV: ${uv.toFixed(2)} (${uvLabel})`;
    } else {
      uvValue.textContent = "UV: 0.00";
      uvBar.style.width = "0%";
      uvBar.style.backgroundColor = "#6b8af7";
      uvSunCircle.setAttribute("r", 18);
      uvGlow.setAttribute("stdDeviation", 3);
      uvSunGradient.children[0].setAttribute("style", "stop-color:#ffeb3b; stop-opacity:1");
      uvSunGradient.children[1].setAttribute("style", "stop-color:#ff9800; stop-opacity:0.8");
      uvSunGradient.children[2].setAttribute("style", "stop-color:#ff6b00; stop-opacity:0.4");
      const rays = uvRays.querySelectorAll(".uv-ray");
      rays.forEach(ray => {
        ray.setAttribute("stroke", "#ffeb3b");
        ray.style.opacity = 0;
      });
    }

  // Update IR Sensor card (for Analog IR Sensor)
if (protocol === "Analog" && selectedSensor === "IR Sensor" && currentIR !== null) {
  const ir = parseInt(currentIR); // Parse as integer since it's 0 or 1
  const irValue = document.getElementById("ir-value");
  const irBulbCircle = document.getElementById("ir-bulb-circle");
  const irGlow = document.querySelector("#ir-glow feGaussianBlur");

  // Set display text and bulb appearance based on binary state
  irValue.textContent = ir === 1 ? "On (Detected)" : "Off (Not Detected)";
  irBulbCircle.setAttribute("fill", ir === 1 ? "#ffeb3b" : "#ccc"); // Yellow when on, gray when off
  irGlow.setAttribute("stdDeviation", ir === 1 ? 5 : 0); // Glow when on
  irBulbCircle.setAttribute("filter", ir === 1 ? "url(#ir-glow)" : "");
} else {
  const irValue = document.getElementById("ir-value");
  const irBulbCircle = document.getElementById("ir-bulb-circle");
  const irGlow = document.querySelector("#ir-glow feGaussianBlur");
  if (irValue) irValue.textContent = "";
  if (irBulbCircle && irGlow) {
    irBulbCircle.setAttribute("fill", "#ccc");
    irGlow.setAttribute("stdDeviation", 0);
    irBulbCircle.removeAttribute("filter");
  }
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
    if (hallValue) hallValue.textContent = "";
    if (hallArc && hallGlow) {
      hallArc.style.stroke = "#34d399";
      hallGlow.setAttribute("stdDeviation", 0);
      hallArc.removeAttribute("filter");
    }
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
    if (tofPerson) tofPerson.setAttribute("transform", "translate(20, 0)");
    uvValue.textContent = "UV: 0.00";
    uvBar.style.width = "0%";
    uvBar.style.backgroundColor = "#6b8af7";
    irValue.textContent = "";
    updateSensorVisualizationVisibility();
  }
}

// Handle sensor selection
function selectSensor(sensor) {
  selectedSensor = sensor;
  updateSensorUI();
}

function parseSensorData(data) {
  const protocol = document.getElementById("sensor-select").value;
  if (!protocol) {
    return data;
  }

  const lines = data.split("\n").map(line => line.trim()).filter(line => line);
  let autoSelected = false;

  lines.forEach(line => {
    try {
      let cleanedLine = line.replace(/°C/g, "").replace(/%/g, "");
      const sensorMatch = cleanedLine.match(/^(.+?):\s*(.*)$/);
  
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

          // Automatically select the first detected sensor if none is selected
          if (!selectedSensor && !autoSelected) {
            selectedSensor = sensorName;
            autoSelected = true;
            const sensorDropdown = document.getElementById("sensor-dropdown");
            if (sensorDropdown) {
              sensorDropdown.value = sensorName;
            }
          }

          let keyMap = {};
          if (sensorName === "LIS3DH") {
            keyMap = {
              'X': 'AccelerationX',
              'Y': 'AccelerationY',
              'Z': 'AccelerationZ'
            };
          } else if (sensorName === "LTR390") {
            keyMap = {
              'UV Index': 'UV'
            };
          } else if (["BME680", "STTS751", "SHT40", "STS30"].includes(sensorName)) {
            currentTemperature = paramMap["Temperature"] ? parseFloat(paramMap["Temperature"]) : null;
            currentHumidity = paramMap["Humidity"] ? parseFloat(paramMap["Humidity"]) : null;
            if (sensorName === "BME680") {
              currentPressure = paramMap["Pressure"] ? parseFloat(paramMap["Pressure"]) : null;
            }
          }

          Object.entries(paramMap).forEach(([key, value]) => {
            const mappedKey = keyMap[key] || key;
            const formattedValue = isNaN(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
            sensorData[protocol][`${sensorName} ${mappedKey}`] = formattedValue;
          });

          if (sensorName === "BME680" || sensorName === "STTS751" || sensorName === "SHT40" || sensorName === "STS30") {
            currentTemperature = paramMap['Temperature'] ? parseFloat(paramMap['Temperature']) : null;
            currentHumidity = paramMap['Humidity'] ? parseFloat(paramMap['Humidity']) : null;
            if (sensorName === "BME680") {
              currentPressure = paramMap['Pressure'] ? parseFloat(paramMap['Pressure']) : null;
            }
          }
          if (sensorName === "VEML7700") {
           currentLight = paramMap['Lux'] ? parseFloat(paramMap['Lux']) : null;
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
          if (sensorName === "VL53L0X") {
            currentDistance = paramMap['Distance'] ? parseFloat(paramMap['Distance']) : null;
          }
          if (sensorName === "LTR390") {
            currentUV = paramMap['UV Index'] ? parseFloat(paramMap['UV Index']) : null;
            console.log(`LTR390 Data - UV: ${currentUV}`);
          }
          if (sensorName === "IR Sensor") {
            currentIR = paramMap['Infrared'] ? parseFloat(paramMap['Infrared']) : null;
          }

          if (selectedSensor === sensorName) {
            updateSensorUI();
          }
        }
      }
    } catch (error) {
      document.getElementById("output").innerHTML += `<span class="log-error">Parsing error: ${error.message}</span><br>`;
    }

    const rainMatch = line.match(/^Rain Tip Detected!\s*Hourly:\s*(\d+)\s*Daily:\s*(\d+)\s*Weekly:\s*(\d+)/);
    if (rainMatch && protocol === "ADC") {
      sensorStatus[protocol]["Rain Gauge"] = true;
      sensorData[protocol]["Rain Gauge Hourly"] = `${rainMatch[1]} tips`;
      sensorData[protocol]["Rain Gauge Daily"] = `${rainMatch[2]} tips`;
      sensorData[protocol]["Rain Gauge Weekly"] = `${rainMatch[3]} tips`;
      if (!selectedSensor && !autoSelected) {
        selectedSensor = "Rain Gauge";
        autoSelected = true;
        const sensorDropdown = document.getElementById("sensor-dropdown");
        if (sensorDropdown) {
          sensorDropdown.value = "Rain Gauge";
        }
      }
      if (selectedSensor === "Rain Gauge") {
        updateSensorUI();
      }
    }
  });

  if (autoSelected) {
    updateSensorUI();
  }

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

  sensorData = {
    "I2C": {},
    "ADC": {},
    "RS232": {},
    "RS485": {},
    "SPI": {},
    "Analog": {}
  };

  sensorStatus = {
    "I2C": { SHT40: false, BME680: false, STS30: false, STTS751: false, LIS3DH: false, VEML7700: false, TLV493D: false, VL53L0X: false, LTR390: false },
    "RS485": { MD02: false },
    "SPI": {},
    "Analog": { Hall_Sensor: false, IR_Sensor: false }
  };

  selectedSensor = null;
  updateSensorUI();
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

  if (isConnected && (baudRate !== currentBaud || portName !== currentPort)) {
    console.log(`Settings changed (port from ${currentPort} to ${portName}, baud from ${currentBaud} to ${baudRate}), disconnecting...`);
    const disconnectResult = await window.electronAPI.disconnectPort();
    if (!disconnectResult.error) {
      document.getElementById("output").innerHTML += `<span style="color: green;">Disconnected from previous connection (port: ${currentPort}, baud: ${currentBaud}). Please reconnect with new settings.</span><br>`;
      resetSensorData();
      isConnected = false;
      currentBaud = null;
      currentPort = null;
    } else {
      document.getElementById("output").innerHTML += `<span style="color: red;">Failed to disconnect: ${disconnectResult.error}</span><br>`;
      console.error(`Disconnect error: ${disconnectResult.error}`);
      return;
    }
  }

  if (!isConnected) {
    const result = await window.electronAPI.connectPort(portName, baudRate);
    if (result.error) {
      document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
      console.error(`Connect error: ${result.error}`);
      return;
    }

    document.getElementById("output").innerHTML += `<span style="color: green;">${result}</span><br>`;
    isConnected = true;
    currentBaud = baudRate;
    currentPort = portName;
    console.log(`Connected successfully, isConnected: ${isConnected}, currentPort: ${currentPort}, currentBaud: ${currentBaud}`);
  } else {
    document.getElementById("output").innerHTML += `<span style="color: orange;">Already connected to port ${currentPort} at ${currentBaud} baud.</span><br>`;
  }
}

async function disconnectPort() {
  console.log(`Disconnecting port, currentPort: ${currentPort}, currentBaud: ${currentBaud}`);
  const result = await window.electronAPI.disconnectPort();
  if (result.error) {
    document.getElementById("output").innerHTML += `<span style="color: red;">${result.error}</span><br>`;
    console.error(`Disconnect error: ${result.error}`);
    return;
  }
  document.getElementById("output").innerHTML += `<span style="color: green;">${result}</span><br>`;
  resetSensorData();
  isConnected = false;
  currentBaud = null;
  currentPort = null;
  console.log(`Disconnected successfully, isConnected: ${isConnected}, currentPort: ${currentPort}, currentBaud: ${currentBaud}`);
  await listPorts();
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

    if (sanitizedData.includes("Port disconnected due to cable unplug.")) {
      console.log("Cable unplugged detected, resetting data and state");
      resetSensorData();
      isConnected = false;
      currentBaud = null;
      currentPort = null;
      logClass = "log-error";
      listPorts();
    } else {
      parseSensorData(sanitizedData);
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

    outputDiv.innerHTML += `<span class="log-line ${logClass}">${sanitizedData}</span><br>`;
    outputDiv.scrollTop = outputDiv.scrollHeight;
  }
});

window.addEventListener("DOMContentLoaded", () => {
  listPorts();
  updateSensorUI();

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
    });
    cubeWrapper.addEventListener('dragstart', (e) => e.preventDefault());
  }
});