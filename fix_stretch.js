const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Ensure weather-combined-grid has align-items: stretch !important
if (!css.includes('align-items: stretch !important;')) {
  css = css.replace(/\.weather-combined-grid\s*\{\s*display:\s*flex\s*!important;/, '.weather-combined-grid {\n  align-items: stretch !important;\n  display: flex !important;');
}

fs.writeFileSync('styles.css', css);
console.log('Added align-items stretch');
