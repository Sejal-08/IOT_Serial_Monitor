const fs = require('fs');
let html = fs.readFileSync('arduino.html', 'utf8');

html = html.replace(/dY'" Wind Speed/g, '?? Wind Speed');
html = html.replace(/dY - Wind Direction/g, '?? Wind Direction');
html = html.replace(/dYOS Streamline Flow/g, '?? Streamline Flow');
html = html.replace(/<span class="card-unit">A<\/span>/g, '<span class="card-unit">°</span>');
html = html.replace(/<span id="dirVal">0<\/span><span class="card-unit">A<\/span>/g, '<span id="dirVal">0</span><span class="card-unit">°</span>');

// Just in case it's in a different format
html = html.replace(/A/g, '°');

fs.writeFileSync('arduino.html', html);
console.log('Fixed emojis');
