const fs = require('fs');

function fix(file) {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/\?\? 3D Ultrasonic Sensor/g, '🔬 3D Ultrasonic Sensor');
    html = html.replace(/\? 3D Ultrasonic Sensor/g, '🔬 3D Ultrasonic Sensor');
    html = html.replace(/ï¿½\? 3D Ultrasonic Sensor/g, '🔬 3D Ultrasonic Sensor');
    html = html.replace(/<span class="card-title">.*?3D Ultrasonic Sensor<\/span>/g, '<span class="card-title">🔬 3D Ultrasonic Sensor</span>');
    fs.writeFileSync(file, html, 'utf8');
}

fix('arduino.html');
fix('index.html');
console.log('Fixed 3D emoji');
