const fs = require('fs');

const extract = fs.readFileSync('wind_html_extract.html', 'utf8');

// Extract the three cards from the extracted HTML
const speedCardMatch = extract.match(/<div class="dash-card" id="speedCard">([\s\S]*?)<\/div>\s*<!-- Direction Card -->/);
const dirCardMatch = extract.match(/<!-- Direction Card -->\s*<div class="dash-card" id="directionCard">([\s\S]*?)<\/div>\s*<!-- Flow Card/);
const flowCardMatch = extract.match(/<!-- Flow Card \(Streamline Flow Visualizer\) -->\s*<div class="dash-card" id="flowCard">([\s\S]*?)<\/div>\s*<!-- Device Container/);
const deviceMatch = extract.match(/<!-- Device Container.*?>\s*<div class="device-viewport-container"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);

let speedHtml = speedCardMatch ? speedCardMatch[1] : '';
let dirHtml = dirCardMatch ? dirCardMatch[1] : '';
let flowHtml = flowCardMatch ? flowCardMatch[1] : '';
let deviceHtml = deviceMatch ? deviceMatch[0] : ''; // Grab the whole viewport container

let arduino = fs.readFileSync('arduino.html', 'utf8');

// Replace Speed Card innerHTML
arduino = arduino.replace(
  /<div id="wind-speed-card" class="card-container" style="display: none;">[\s\S]*?<\/div>\s*<!-- Wind Flow Direction Card/g,
  `<div id="wind-speed-card" class="card-container dash-card" style="display: none; align-items:center;">\n${speedHtml}\n</div>\n\n  <!-- Wind Flow Direction Card`
);

// Replace Direction Card innerHTML
arduino = arduino.replace(
  /<div id="wind-direction-card" class="card-container" style="display: none;">[\s\S]*?<\/div>\s*<!-- Wind Speed Card/g,
  `<div id="wind-direction-card" class="card-container dash-card" style="display: none; align-items:center;">\n${dirHtml}\n</div>\n\n  <!-- Wind Speed Card`
);

// Replace Flow Card innerHTML
arduino = arduino.replace(
  /<div id="wind-flow-card" class="card-container" style="display: none;">[\s\S]*?<\/div>\s*<!-- Rain Gauge Card/g,
  `<div id="wind-flow-card" class="card-container dash-card" style="display: none; align-items:center;">\n${flowHtml}\n</div>\n\n  <!-- Rain Gauge Card`
);

// Also we need to inject the 3D device model. We can put it at the very bottom of the sensor-cards-container
if(deviceHtml) {
    if(!arduino.includes('device3dCanvas')) {
        arduino = arduino.replace(
            /<\/div>\s*<\/main>/,
            `  <!-- Wind Sensor 3D Model -->\n  <div id="wind-3d-model-card" class="card-container dash-card" style="display: none; width: 100%; height: 440px;">\n${deviceHtml}\n  </div>\n</div>\n</main>`
        );
    }
}

// Ensure Three.js is included
if(!arduino.includes('three.min.js')) {
    arduino = arduino.replace(
        /<\/head>/,
        `  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n</head>`
    );
}

fs.writeFileSync('arduino.html', arduino);
console.log('Ported HTML');
