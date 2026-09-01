const fs = require('fs');

// 1. Update arduino_menu.html
let menu = fs.readFileSync('arduino_menu.html', 'utf8');
menu = menu.replace(/\{\s*name:\s*"Relay"[\s\S]*?\},\s*/g, '');
menu = menu.replace(/\{\s*name:\s*"Buzzer"[\s\S]*?\},\s*/g, '');
menu = menu.replace(/\{\s*name:\s*"Reed Switch"[\s\S]*?\},\s*/g, '');
fs.writeFileSync('arduino_menu.html', menu);

// 2. Update renderer.js
let renderer = fs.readFileSync('renderer.js', 'utf8');
renderer = renderer.replace(
    /"GPIO": isArduinoBackend \? \["Blinky", "Buzzer", "Relay", "HC-SR04", "TTP223", "Reed Switch"\] : \["Blinky", "Buzzer", "Relay"\],/,
    '"GPIO": isArduinoBackend ? ["Blinky", "HC-SR04", "TTP223"] : ["Blinky", "Buzzer", "Relay", "Reed Switch"],'
);
fs.writeFileSync('renderer.js', renderer);
console.log('Removed from arduino menu and updated dropdown logic.');
