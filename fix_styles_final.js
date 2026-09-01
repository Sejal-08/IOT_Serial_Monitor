const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// 1. Inject missing variables into :root
const missingVars = `
  --card-bg: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  --border-color: rgba(56, 189, 248, 0.3);
  --text-main: #f0f9ff;
  --text-sub: #7dd3fc;
  --accent-cyan: #38bdf8;
  --accent-active: #60a5fa;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
  --input-bg: rgba(15, 23, 42, 0.8);
  --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  --card-glow: rgba(56, 189, 248, 0.25);
  --blade-start: #38bdf8;
  --blade-end: #1d4ed8;
  --tower-start: #475569;
  --tower-mid: #94a3b8;
  --tower-end: #334155;
`;
css = css.replace(/:root\s*\{/, `:root {\n${missingVars}`);

// 2. Append wind_styles_extract.css properly
let extract = fs.readFileSync('wind_styles_extract.css', 'utf8');
extract = extract.replace(/:root\s*\{[\s\S]*?\}/g, '');
extract = extract.replace(/body\s*\{[\s\S]*?\}/g, '');
extract = extract.replace(/\*\s*\{[\s\S]*?\}/g, '');

// Also fix the animation-play-state class
extract = extract.replace(/body:not\(\.device-connected\)/g, 'body:not(.sensors-connected)');

css += '\n/* === WIND SENSOR PORTED STYLES === */\n' + extract;

// 3. Add formatting tweaks (spacing, alignment)
css += `
/* Force background on dash-card to match dashboard */
.dash-card {
  background: var(--sensor-bg) !important;
  border: 1px solid var(--sensor-border) !important;
}

/* Add spacing below card headers */
.dash-card .card-header {
  margin-bottom: 25px !important;
}

/* Ensure cardinal text is centered properly */
#dirCardinalText {
  text-align: center !important;
  width: 100% !important;
  display: block !important;
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}

/* Explicitly center the graphics in the wind cards */
.compass-dial, .turbine-wrapper, .streamline-box {
  margin: 0 auto !important;
}
`;

// 4. In the old `styles.css`, `#wind-speed-card` and others had `min-height: 520px !important;`.
// The user wants the old unequal sizes, but NOT the 520px height that made them absurdly tall.
// If the user's first screenshot had 520px height, maybe that's what they wanted?
// Actually, in `media_1788257248415.png`, the Wind Direction and Wind Speed cards are NOT 520px tall!
// They are exactly 380px tall. Why?
// Because `.weather-combined-grid #wind-speed-card { height: 380px !important; }` OVERRODE the 520px!
// So they were 380px tall and 260px wide!
// That is the "unequal size" (relative to the 3D model card) they liked!
// So we don't need to change anything else. `styles.css` naturally has `height: 380px !important; width: 260px !important;` for the wind cards inside the grid.
// That's perfect.

fs.writeFileSync('styles.css', css);
console.log('Restored styles with fixes');
