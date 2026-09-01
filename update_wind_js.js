const fs = require('fs');

let js = fs.readFileSync('renderer.js', 'utf8');

// The logic we want to insert for Wind Speed, Direction, and Flow Updates:
const replacementLogic = `
  // === WIND SENSOR NEW 3D DASHBOARD UPDATE ===
  if ((protocol === "RS232" || protocol === "RS485" || isWeatherMode) && (isWeatherMode || selectedSensor === "Wind Sensor") && currentWindSpeed !== null && currentWindDirection !== null) {
    const speed = parseFloat(currentWindSpeed);
    const direction = parseFloat(currentWindDirection);

    // Update Speed Card
    const speedVal = document.getElementById('speedVal');
    if (speedVal) speedVal.innerText = speed.toFixed(2);

    const turbineHead = document.getElementById('rotorHead');
    if (turbineHead) {
      const spinDuration = Math.max(0.1, 3.0 - (speed * 0.35));
      turbineHead.style.animationDuration = \`\${spinDuration}s\`;
    }

    // Update Direction Card
    const dirVal = document.getElementById('dirVal');
    if (dirVal) dirVal.innerText = Math.round(direction);

    const needleEl = document.getElementById('compassNeedle');
    if (needleEl) needleEl.style.transform = \`rotate(\${direction}deg)\`;

    function getCardinal(deg) {
      const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      return cardinals[Math.round(deg / 45) % 8];
    }
    const cardinal = getCardinal(direction);

    const textEl = document.getElementById('dirCardinalText');
    if (textEl) textEl.innerText = \`Heading: \${cardinal}\`;

    // Update Flow Card
    function getFlowPath(deg) {
      if (deg > 337.5 || deg <= 22.5) return 'S \u2192 N';
      if (deg > 22.5 && deg <= 67.5) return 'SW \u2192 NE';
      if (deg > 67.5 && deg <= 112.5) return 'W \u2192 E';
      if (deg > 112.5 && deg <= 157.5) return 'NW \u2192 SE';
      if (deg > 157.5 && deg <= 202.5) return 'N \u2192 S';
      if (deg > 202.5 && deg <= 247.5) return 'NE \u2192 SW';
      if (deg > 247.5 && deg <= 292.5) return 'E \u2192 W';
      return 'SE \u2192 NW';
    }
    const flowPath = getFlowPath(direction);
    
    const vecLabelEl = document.getElementById('flowVectorLabel');
    if (vecLabelEl) vecLabelEl.innerText = flowPath;

    const streamBox = document.getElementById('streamlineBox');
    if (streamBox) streamBox.style.transform = \`rotate(\${direction + 180}deg)\`;

    const flowLabel = document.getElementById('flowLabel');
    if (flowLabel) {
      if (speed < 0.5) flowLabel.innerText = "CALM";
      else if (speed < 3.0) flowLabel.innerText = "BREEZE";
      else if (speed < 8.0) flowLabel.innerText = "GUST";
      else flowLabel.innerText = "GALE";
    }
  }
`;

// Remove old wind direction logic
js = js.replace(/if \(\(protocol === "RS232"[\s\S]*?if\s*\(windDirectionValue\)\s*\{\s*windDirectionValue\.textContent = \`\$\{direction\.toFixed\(0\)\}&deg;\`;\s*windDirectionValue\.style\.fontSize[^}]+\}\s*\}\s*\}/, '/* OLD WIND DIRECTION LOGIC REMOVED */');

// Remove old wind speed logic
js = js.replace(/\/\/ === WIND SPEED UPDATE ===[\s\S]*?(?=\/\/ === VCNL4040)/, replacementLogic + '\n\n  // === VCNL4040');

fs.writeFileSync('renderer.js', js);
console.log('Replaced renderer JS logic');
