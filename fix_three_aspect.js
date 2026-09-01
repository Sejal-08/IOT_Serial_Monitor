const fs = require('fs');

let rendererCode = fs.readFileSync('renderer.js', 'utf8');

// Replace the camera initialization to safely handle 0 height
rendererCode = rendererCode.replace(
    /new THREE\.PerspectiveCamera\(40,\s*container\.clientWidth\s*\/\s*container\.clientHeight,\s*0\.1,\s*100\)/,
    "new THREE.PerspectiveCamera(40, (container.clientWidth || 300) / (container.clientHeight || 300), 0.1, 100)"
);

rendererCode = rendererCode.replace(
    /renderer\.setSize\(container\.clientWidth,\s*container\.clientHeight\);/,
    "renderer.setSize(container.clientWidth || 300, container.clientHeight || 300);"
);

fs.writeFileSync('renderer.js', rendererCode);
console.log('Fixed Three.js aspect ratio safety');
