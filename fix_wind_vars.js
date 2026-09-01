const fs = require('fs');

const missingVars = `
  /* Wind Sensor Variables */
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

let css = fs.readFileSync('styles.css', 'utf8');

// Insert after :root {
css = css.replace(/:root\s*\{/, `:root {\n${missingVars}`);

fs.writeFileSync('styles.css', css);
console.log('Injected missing variables');
