const fs = require('fs');
let js = fs.readFileSync('renderer.js', 'utf8');
if (!js.includes('init3DSensorModel();')) {
    js = js.replace(/window\.addEventListener\("DOMContentLoaded",\s*\(\)\s*=>\s*\{/, 'window.addEventListener("DOMContentLoaded", () => {\n  if(typeof init3DSensorModel === "function") setTimeout(init3DSensorModel, 500);');
    fs.writeFileSync('renderer.js', js);
    console.log('Added call to init3DSensorModel');
}
