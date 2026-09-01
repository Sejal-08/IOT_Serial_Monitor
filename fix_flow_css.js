const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Remove wind flow card from min-height 520px block
css = css.replace(/#wind-flow-card\s*\{\s*flex: 1 1 0;[\s\S]*?min-height: 520px;[\s\S]*?\}/g, '');

// Also remove from any other place that forces height/width
css = css.replace(/#wind-flow-card\s*\{\s*flex: 0 0 180px;[\s\S]*?min-height: 250px;[\s\S]*?\}/g, '');

// Remove all wind cards from weather-combined-grid restrictions!
css = css.replace(/\.weather-combined-grid #wind-direction-card,\s*\.weather-combined-grid #wind-speed-card,\s*\.weather-combined-grid #wind-flow-card,/g, '');
css = css.replace(/#wind-direction-card,\s*#wind-speed-card,\s*#wind-flow-card,/g, '');

// If there are lingering lines, let's just use regex to clean it safely
// It's safer to just do a global replace of `#wind-flow-card,`
css = css.replace(/#wind-flow-card,/g, '');
css = css.replace(/#wind-direction-card,/g, '');
css = css.replace(/#wind-speed-card,/g, '');

fs.writeFileSync('styles.css', css);
console.log('Fixed wind flow card overrides');
