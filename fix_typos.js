const fs = require('fs');
['arduino.html', 'index.html'].forEach(file => {
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/\\u00B0CTIVE/g, 'ACTIVE');
    html = html.replace(/B\\u00B0CKWARD/g, 'BACKWARD');
    html = html.replace(/#4C\\u00B0F50/g, '#4CAF50');
    html = html.replace(/#F\\u00B0F\\u00B0FA/g, '#FAFAFA');
    html = html.replace(/\\u00B0CCELERATION/g, 'ACCELERATION');
    html = html.replace(/S\\u00B0FE/g, 'SAFE');
    fs.writeFileSync(file, html);
    console.log(`Fixed typos in ${file}`);
  }
});
