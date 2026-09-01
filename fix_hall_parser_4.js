const fs = require('fs');

let lines = fs.readFileSync('renderer.js', 'utf8').split('\n');
let newLines = [];
let replacing = false;
let braceCount = 0;

const newCode = `      // Hall Sensor
      const hallOutputMatch = line.match(/Hall Sensor Output:\\s*(\\d+)/);
      const hallDetectMatch = line.match(/(No magnet detected|Magnet detected)/i);
      
      if ((hallOutputMatch || hallDetectMatch) && protocol === "Analog") {
        if (hallOutputMatch) {
          currentMagneticField = parseInt(hallOutputMatch[1]);
        } else {
          currentMagneticField = hallDetectMatch[0].toLowerCase().includes("no") ? 0 : 1;
        }
        
        sensorStatus["Analog"]["Hall_Sensor"] = true;
        if (!selectedSensor) {
          selectedSensor = "Hall Sensor";
          const dropdown = document.getElementById("sensor-dropdown");
          if(dropdown) dropdown.value = "Hall Sensor";
        }
        updateSensorUI();
        dataParsed = true;
      }`;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Hall Sensor')) {
        replacing = true;
        newLines.push(newCode);
        braceCount = 0;
    }
    
    if (replacing) {
        if (lines[i].includes('{')) braceCount += (lines[i].match(/\{/g) || []).length;
        if (lines[i].includes('}')) braceCount -= (lines[i].match(/\}/g) || []).length;
        
        if (braceCount === 0 && lines[i].includes('}')) {
            replacing = false;
        }
    } else {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('renderer.js', newLines.join('\n'));
console.log('Fixed Hall Sensor parsing logic precisely.');
