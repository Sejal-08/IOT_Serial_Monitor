const fs = require('fs');

const flowExtract = fs.readFileSync('wind_html_extract.html', 'utf8');
const flowCardMatch = flowExtract.match(/<div class="dash-card" id="flowCard">([\s\S]*?)<\/div>\s*<\/div>\s*<!-- Device Viewport Container/);

let flowHtml = '';
if (flowCardMatch) {
  flowHtml = flowCardMatch[1];
} else {
  console.log("Could not find flowCard in wind_html_extract.html");
}

let html = fs.readFileSync('arduino.html', 'utf8');
html = html.replace(/<div id="wind-flow-card"[^>]*>[\s\S]*?<\/div>/, `<div id="wind-flow-card" class="card-container dash-card" style="display: none; align-items:center;">\n${flowHtml}\n</div>`);

fs.writeFileSync('arduino.html', html);
console.log('Fixed HTML flow card replacement again');
