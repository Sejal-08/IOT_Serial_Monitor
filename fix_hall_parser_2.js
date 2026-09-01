const fs = require('fs');

let renderer = fs.readFileSync('renderer.js', 'utf8');

const regex = /\/\/ Hall Sensor\s*const hallOutputMatch = line\.match\(\/Hall Sensor Output:\\s\*\\(\\\\d\+\)\/\);\s*if \(hallOutputMatch\) \{[\s\S]*?dataParsed = true;\s*\}/;

const newCode = `// Hall Sensor
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

if (regex.test(renderer)) {
    renderer = renderer.replace(regex, newCode);
    fs.writeFileSync('renderer.js', renderer);
    console.log('Fixed Hall Sensor parsing logic via Regex.');
} else {
    console.log('Regex did not match.');
}
