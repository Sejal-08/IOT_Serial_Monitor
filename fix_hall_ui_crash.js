const fs = require('fs');

let renderer = fs.readFileSync('renderer.js', 'utf8');

// The bad code inside updateSensorUI():
const badCode = `    // Acceleration
    if ((selectedSensor === "LIS3DH" || selectedSensor === "LIS2DH") && protocol === "I2C") {
      if (lis3dhContainer) lis3dhContainer.style.display = "flex";
    }
        // Hall Sensor
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

const goodCode = `    // Acceleration
    if ((selectedSensor === "LIS3DH" || selectedSensor === "LIS2DH") && protocol === "I2C") {
      if (lis3dhContainer) lis3dhContainer.style.display = "flex";
    }
    // Hall Sensor
    if (selectedSensor === "Hall Sensor" && protocol === "Analog") {
      if (hallContainer) hallContainer.style.display = "flex";
    }`;

renderer = renderer.replace(badCode, goodCode);

fs.writeFileSync('renderer.js', renderer);
console.log('Fixed Hall Sensor UI visibility block.');
