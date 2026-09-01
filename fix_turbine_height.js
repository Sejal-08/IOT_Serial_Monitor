const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\.turbine-wrapper\s*\{[\s\S]*?height:\s*240px;[\s\S]*?\}/g, (match) => {
  return match.replace('height: 240px;', 'height: 180px;');
});

fs.writeFileSync('styles.css', css);
console.log('Fixed turbine wrapper height');
