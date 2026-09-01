const fs = require('fs');

const js = fs.readFileSync('wind_js_extract.js', 'utf8');

const startIdx = js.indexOf('function init3DSensorModel() {');
let braceCount = 0;
let endIdx = -1;
let started = false;

for (let i = startIdx; i < js.length; i++) {
    if (js[i] === '{') {
        braceCount++;
        started = true;
    } else if (js[i] === '}') {
        braceCount--;
    }
    
    if (started && braceCount === 0) {
        endIdx = i + 1;
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const funcCode = js.substring(startIdx, endIdx);
    let renderer = fs.readFileSync('renderer.js', 'utf8');
    
    // Check if already injected
    if (renderer.includes('function init3DSensorModel')) {
        console.log('Already in renderer.js');
        // Let's replace it just in case it was mangled
        renderer = renderer.replace(/function init3DSensorModel\(\) \{[\s\S]*?(?=\n\n|\n$)/, funcCode);
        fs.writeFileSync('renderer.js', renderer);
        console.log('Replaced existing function.');
    } else {
        renderer += '\n\n' + funcCode + '\n';
        fs.writeFileSync('renderer.js', renderer);
        console.log('Appended function to renderer.js');
    }
} else {
    console.log('Could not find function bounds');
}
