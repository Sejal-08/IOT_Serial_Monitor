const fs = require('fs');

let lines = fs.readFileSync('renderer.js', 'utf8').split('\n');
let newLines = [];
let replacing = false;

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
    }
    
    if (!replacing) {
        newLines.push(lines[i]);
    }
    
    if (replacing && lines[i].includes('dataParsed = true;')) {
        replacing = false;
        // Check if the next line is the closing brace
        if (lines[i+1].includes('}')) {
            i++;
        }
    }
}

fs.writeFileSync('renderer.js', newLines.join('\n'));
console.log('Fixed Hall Sensor parsing logic via line-by-line.');
