const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// The lines look like:
// .weather-combined-grid 
// .weather-combined-grid 
// .weather-combined-grid #wind-flow-card {

// Let's replace the whole blocks safely.
// For any block containing `#wind-flow-card` and `260px !important` or `200px !important`, we'll strip `#wind-flow-card`.
css = css.replace(/\.weather-combined-grid\s*\n*\s*\.weather-combined-grid\s*\n*\s*\.weather-combined-grid\s*#wind-flow-card/g, '/* removed */');
css = css.replace(/\.weather-combined-grid #wind-flow-card/g, '/* removed */');

fs.writeFileSync('styles.css', css);
console.log('Fixed broken selectors');
