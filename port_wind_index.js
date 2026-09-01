const fs = require('fs');

const extract = fs.readFileSync('wind_html_extract.html', 'utf8');

// Match the cards from extraction
const dirMatch = extract.match(/<!-- Direction Card -->\s*<div class="dash-card" id="directionCard">([\s\S]*?)<\/div>\s*<!-- Speed Card/);
const speedMatch = extract.match(/<!-- Speed Card -->\s*<div class="dash-card" id="speedCard">([\s\S]*?)<\/div>\s*<!-- Flow Card/);
const flowMatch = extract.match(/<div class="dash-card" id="flowCard">([\s\S]*?)<\/div>\s*<\/div>\s*<!-- Device Viewport Container/);

const dirHtml = dirMatch ? dirMatch[1] : '';
const speedHtml = speedMatch ? speedMatch[1] : '';
const flowHtml = flowMatch ? flowMatch[1] : '';

let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace Direction Card
indexHtml = indexHtml.replace(
  /<div id="wind-direction-card" class="card-container" style="display: none;">[\s\S]*?<\/div>\s*<!-- Wind Speed Card -->/,
  `<div id="wind-direction-card" class="card-container dash-card" style="display: none; align-items:center;">\n${dirHtml}\n</div>\n\n  <!-- Wind Speed Card -->`
);

// Replace Speed Card
indexHtml = indexHtml.replace(
  /<div id="wind-speed-card" class="card-container" style="display: none;">[\s\S]*?<\/div>\s*<!-- Wind Flow Direction Card/g,
  `<div id="wind-speed-card" class="card-container dash-card" style="display: none; align-items:center;">\n${speedHtml}\n</div>\n\n  <!-- Wind Flow Direction Card`
);

// Replace Flow Card (stops at VL53L0X)
indexHtml = indexHtml.replace(
  /<div id="wind-flow-card"[^>]*>[\s\S]*?<\/div>\s*<!-- VL53L0X Distance Sensor Card -->/,
  `<div id="wind-flow-card" class="card-container dash-card" style="display: none; align-items:center;">\n${flowHtml}\n</div>\n\n  <!-- VL53L0X Distance Sensor Card -->`
);

// Add Three.js if not present
if (!indexHtml.includes('three.min.js')) {
    indexHtml = indexHtml.replace(
        '</head>',
        '  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n</head>'
    );
}

fs.writeFileSync('index.html', indexHtml);
console.log('Ported wind HTML to index.html');
