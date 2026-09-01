const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

css += `\n
/* Explicitly center the graphics in the wind cards */
.compass-dial, .turbine-wrapper, .streamline-box {
  margin: 0 auto !important;
}
`;

fs.writeFileSync('styles.css', css);
console.log('Fixed graphic centering');
