const fs = require('fs');

const missingVars2 = `
  --card-bg: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  --border-color: rgba(56, 189, 248, 0.3);
  --text-main: #f0f9ff;
  --text-sub: #7dd3fc;
`;

let css = fs.readFileSync('styles.css', 'utf8');

// Insert after :root {
css = css.replace(/:root\s*\{/, `:root {\n${missingVars2}`);

fs.writeFileSync('styles.css', css);
console.log('Injected missing background variables');
