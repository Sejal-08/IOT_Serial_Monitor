const fs = require('fs');

let renderer = fs.readFileSync('renderer.js', 'utf8');
renderer = renderer.replace(
    /"GPIO": isArduinoBackend \? \["Blinky", "HC-SR04", "TTP223"\] : \["Blinky", "Buzzer", "Relay", "Reed Switch"\],/,
    '"GPIO": isArduinoBackend ? ["Blinky", "HC-SR04", "TTP223"] : ["Blinky", "Buzzer", "Relay"],'
);
fs.writeFileSync('renderer.js', renderer);
console.log('Removed Reed Switch from C/C++/Python dropdown.');
