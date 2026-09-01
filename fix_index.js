const fs = require('fs');

let arduino = fs.readFileSync('arduino.html', 'utf8');
let index = fs.readFileSync('index.html', 'utf8');

// Extract the 4 blocks from arduino.html
const getBlock = (id) => {
  const regex = new RegExp(`<div id="${id}"[^>]*>[\\s\\S]*?</div>\\s*(?=<!--|<div id=)`);
  const match = arduino.match(regex);
  return match ? match[0].trim() : null;
};

const getModelBlock = () => {
  const regex = /<!-- 3D Interactive Model Card[\s\S]*?<\/canvas>\s*<\/div>\s*<\/div>/;
  const match = arduino.match(regex);
  return match ? match[0].trim() : null;
};

const dirHtml = getBlock('wind-direction-card');
const speedHtml = getBlock('wind-speed-card');
const flowHtml = getBlock('wind-flow-card');
const modelHtml = getModelBlock();

if (dirHtml && speedHtml && flowHtml && modelHtml) {
  // Replace in index.html
  index = index.replace(/<div id="wind-direction-card"[^>]*>[\s\S]*?(?=<!--|<div id="wind-speed-card")/g, dirHtml + '\n\n  ');
  index = index.replace(/<div id="wind-speed-card"[^>]*>[\s\S]*?(?=<!--|<div id="wind-flow-card")/g, speedHtml + '\n\n  ');
  
  // For flow card and model, they might be tangled in index.html too.
  // Let's replace the whole chunk from wind-flow-card up to VL53L0X
  index = index.replace(/<div id="wind-flow-card"[^>]*>[\s\S]*?(?=<!-- VL53L0X)/, `${flowHtml}\n\n  ${modelHtml}\n\n  `);

  fs.writeFileSync('index.html', index);
  console.log('Fixed index.html perfectly');
} else {
  console.log('Failed to extract blocks from arduino.html');
}

