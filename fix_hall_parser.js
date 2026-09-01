const fs = require('fs');

let renderer = fs.readFileSync('renderer.js', 'utf8');

const oldCode = `      // Hall Sensor
      const hallOutputMatch = line.match(/Hall Sensor Output:\\s*(\\d+)/);
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
      }`;

const newCode = `      // Hall Sensor
      const hallOutputMatch = line.match(/Hall Sensor Output:\\s*(\\d+)/);
      const hallDetectMatch = line.match(/(No magnet detected|Magnet detected)/i);
      
      if (hallOutputMatch || hallDetectMatch) {
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

renderer = renderer.replace(oldCode, newCode);
fs.writeFileSync('renderer.js', renderer);
console.log('Fixed Hall Sensor parsing logic.');
