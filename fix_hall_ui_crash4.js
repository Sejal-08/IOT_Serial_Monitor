const fs = require('fs');
let renderer = fs.readFileSync('renderer.js', 'utf8');

renderer = renderer.replace('}/ TLV493D', '}    // TLV493D');
fs.writeFileSync('renderer.js', renderer);
console.log('Fixed syntax error.');
