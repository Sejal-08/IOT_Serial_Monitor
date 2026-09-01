const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\.turbine-wrapper\s*\{[^}]+\}/g, (match) => {
  return match.replace(/height:\s*\d+px;/, 'height: 180px;');
});

fs.writeFileSync('styles.css', css);
console.log('Fixed turbine wrapper height');
