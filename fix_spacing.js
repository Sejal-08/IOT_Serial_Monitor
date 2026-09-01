const fs = require('fs');

// Fix CSS for spacing
let css = fs.readFileSync('styles.css', 'utf8');
css += `\n
/* Added spacing below card headers */
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
`;
fs.writeFileSync('styles.css', css);

console.log('Fixed CSS spacing');
