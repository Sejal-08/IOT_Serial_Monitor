const fs = require('fs');
let js = fs.readFileSync('renderer.js', 'utf8');

js = js.replace(/\uFFFD/g, '\\u00B0');

fs.writeFileSync('renderer.js', js);
console.log('Fixed degree symbol via unicode');
