const fs = require('fs');

let arduino = fs.readFileSync('arduino.html', 'utf8');
let index = fs.readFileSync('index.html', 'utf8');

const extractBlock = (source, startId, endComment) => {
  const startIndex = source.indexOf(`<div id="${startId}"`);
  const endIndex = source.indexOf(endComment, startIndex);
  if (startIndex !== -1 && endIndex !== -1) {
    return source.substring(startIndex, endIndex).trim();
  }
  return null;
};

// We want to replace everything from wind-direction-card to VL53L0X in index.html with the same chunk from arduino.html
const startMarker = '<div id="wind-direction-card"';
const endMarker = '<!-- VL53L0X Distance Sensor Card -->';

const startIndexArd = arduino.indexOf(startMarker);
const endIndexArd = arduino.indexOf(endMarker, startIndexArd);

if (startIndexArd !== -1 && endIndexArd !== -1) {
  const chunk = arduino.substring(startIndexArd, endIndexArd);
  
  const startIndexIdx = index.indexOf(startMarker);
  const endIndexIdx = index.indexOf(endMarker, startIndexIdx);
  
  if (startIndexIdx !== -1 && endIndexIdx !== -1) {
    index = index.substring(0, startIndexIdx) + chunk + index.substring(endIndexIdx);
    fs.writeFileSync('index.html', index);
    console.log('Replaced entire wind sensor block perfectly');
  } else {
    console.log('Could not find markers in index.html');
  }
} else {
  console.log('Could not find markers in arduino.html');
}

