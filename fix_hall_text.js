const fs = require('fs');

let renderer = fs.readFileSync('renderer.js', 'utf8');

// Change "High (Detected)" / "Low (Not Detected)" to just "Detected" / "Not Detected"
renderer = renderer.replace(
    /hallValue\.textContent = field === 1 \? "High \(Detected\)" : "Low \(Not Detected\)";/g,
    'hallValue.textContent = field === 1 ? "Detected" : "Not Detected";'
);

fs.writeFileSync('renderer.js', renderer);
console.log('Fixed Hall Sensor text.');
