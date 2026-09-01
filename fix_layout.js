const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Remove wind cards from the 520px rule
css = css.replace(/#wind-direction-card,\s*#wind-speed-card,\s*#hall-card,/g, '#hall-card,');

// Also remove from any other place that forces 520px min-height
css = css.replace(/#wind-speed-card\s*\{\s*flex: 1 1 0;[\s\S]*?min-height: 520px;[\s\S]*?\}/g, '');
css = css.replace(/#wind-direction-card\s*\{\s*flex: 1;[\s\S]*?min-height: 520px;[\s\S]*?\}/g, '');
css = css.replace(/#wind-flow-card\s*\{\s*flex: 1;[\s\S]*?min-height: 520px;[\s\S]*?\}/g, '');

// Also they might be inside media queries that force them
css = css.replace(/#wind-direction-card,\s*#wind-speed-card\s*\{[\s\S]*?min-height:\s*\d+px;\s*\}/g, '');

// Remove the `h4` styles that give it the blue gradient, since we're using custom headers now
css = css.replace(/#wind-speed-card h4\s*\{[\s\S]*?text-fill-color:\s*transparent;[\s\S]*?\}/g, '');

// Ensure `.dash-card` gets precedence and resets minimums
css += `\n/* Force new layout for dash cards */\n.dash-card { min-height: 280px !important; max-width: none !important; width: 100% !important; flex: 1 1 280px !important; }`;

fs.writeFileSync('styles.css', css);
console.log('Fixed CSS layout overrides');

// Now let's fix arduino.html
let html = fs.readFileSync('arduino.html', 'utf8');

const flowExtract = fs.readFileSync('wind_html_extract.html', 'utf8');
const flowCardMatch = flowExtract.match(/<!-- Flow Card \(Streamline Flow Visualizer\) -->\s*<div class="dash-card" id="flowCard">([\s\S]*?)<\/div>\s*<!-- Device Container/);
let flowHtml = flowCardMatch ? flowCardMatch[1] : '';

// Find where wind-flow-card starts and ends (ends right before VL53L0X)
html = html.replace(/<div id="wind-flow-card"[^>]*>([\s\S]*?)<\/svg>\s*<div class="flow-degree"[^>]*>.*?<\/div>\s*<div class="flow-desc"[^>]*>.*?<\/div>\s*<\/div>/, `<div id="wind-flow-card" class="card-container dash-card" style="display: none; align-items:center;">\n${flowHtml}\n</div>`);

fs.writeFileSync('arduino.html', html);
console.log('Fixed HTML flow card replacement');

