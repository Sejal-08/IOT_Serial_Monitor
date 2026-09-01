const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Find the first occurrence of my appended CSS comments
const startIndex = css.indexOf('/* WIND SENSOR');
if (startIndex !== -1) {
  css = css.substring(0, startIndex);
}

// Now read the clean CSS again and append it perfectly
let extract = fs.readFileSync('wind_styles_extract.css', 'utf8');
extract = extract.replace(/:root\s*\{[\s\S]*?\}/g, '');
extract = extract.replace(/body\s*\{[\s\S]*?\}/g, '');
extract = extract.replace(/\*\s*\{[\s\S]*?\}/g, '');

css += '\n/* === WIND SENSOR PORTED STYLES === */\n' + extract;

// Add back the layout override
css += `\n/* Force new layout for dash cards */\n.dash-card { min-height: 280px !important; max-width: none !important; width: 100% !important; flex: 1 1 280px !important; background: var(--sensor-bg) !important; border: 1px solid var(--sensor-border) !important; }\n`;

fs.writeFileSync('styles.css', css);
console.log('Cleaned and appended CSS successfully');
