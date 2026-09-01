const fs = require('fs');

let html = fs.readFileSync('arduino.html', 'utf8');

// Find the nested 3D model card
const modelCardRegex = /<!-- 3D Interactive Model Card[\s\S]*?<\/canvas>\s*<\/div>\s*<\/div>/;
const match = html.match(modelCardRegex);

if (match) {
  const modelCardHtml = match[0];
  // Remove it from its current position
  html = html.replace(modelCardRegex, '');
  
  // Find the END of wind-flow-card and insert it after
  // The flow card ends with:
  // </svg>
  // </div>
  // Wait, let's just insert it right before the VL53L0X Distance Sensor Card
  html = html.replace(/<!-- VL53L0X Distance Sensor Card -->/, `${modelCardHtml}\n\n  <!-- VL53L0X Distance Sensor Card -->`);
  
  fs.writeFileSync('arduino.html', html);
  console.log('Fixed overlapping cards in arduino.html');
} else {
  console.log('Could not find nested 3D model card');
}

