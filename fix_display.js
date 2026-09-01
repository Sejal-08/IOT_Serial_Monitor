const fs = require('fs');

let js = fs.readFileSync('renderer.js', 'utf8');

// Find the line where windFlowContainer is defined
js = js.replace(/const windFlowContainer = document.getElementById\("wind-flow-card"\);/, 'const windFlowContainer = document.getElementById("wind-flow-card");\n    const wind3dModelContainer = document.getElementById("wind-3d-model-card");');

// Find the line where they are displayed
js = js.replace(/if \(\["Wind Sensor"\].includes\(selectedSensor\)\s*&&\s*\(protocol === "RS232" \|\| protocol === "RS485"\)\) \{[\s\S]*?\}/, `if (["Wind Sensor"].includes(selectedSensor) && (protocol === "RS232" || protocol === "RS485")) {
      if (windDirectionContainer) windDirectionContainer.style.display = "flex";
      if (windSpeedContainer) windSpeedContainer.style.display = "flex";
      if (windFlowContainer) windFlowContainer.style.display = "flex";
      if (wind3dModelContainer) wind3dModelContainer.style.display = "flex";
    }`);

fs.writeFileSync('renderer.js', js);
console.log('Fixed visibility logic');
