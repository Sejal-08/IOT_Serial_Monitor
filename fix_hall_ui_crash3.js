const fs = require('fs');
let renderer = fs.readFileSync('renderer.js', 'utf8');

const startIdx = renderer.indexOf('// Hall Sensor', 26000);
const endIdx = renderer.indexOf('dataParsed = true;', startIdx) + 'dataParsed = true;'.length + 12; // roughly to the closing brace

const badBlock = renderer.substring(startIdx, endIdx);
console.log('Bad block:\n', badBlock);

const goodBlock = `// Hall Sensor
    if (selectedSensor === "Hall Sensor" && protocol === "Analog") {
      if (hallContainer) hallContainer.style.display = "flex";
    }`;

renderer = renderer.substring(0, startIdx) + goodBlock + renderer.substring(endIdx);
fs.writeFileSync('renderer.js', renderer);
console.log('Replaced bad block.');
