const fs = require('fs');

let js = fs.readFileSync('renderer.js', 'utf8');

// Replace all occurrences of `&deg;` with the literal `°` symbol
js = js.replace(/&deg;/g, '°');

fs.writeFileSync('renderer.js', js);
console.log('Fixed &deg; to ° in renderer.js');
