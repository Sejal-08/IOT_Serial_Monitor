const fs = require('fs');

let rendererCode = fs.readFileSync('renderer.js', 'utf8');

// The fix: Add a ResizeObserver or an event listener that resizes the canvas when the container becomes visible.
// Or just check if clientWidth is 0, and if so, wait until it's not.
// Wait, we can just replace renderer.setSize() with a robust version that handles display: none.

// Also, let's inject a ResizeObserver into init3DSensorModel.
const resizeObserverCode = `
      // Fix for display: none initializing to 0x0
      const resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
      });
      resizeObserver.observe(container);
`;

// Insert the resizeObserverCode right after renderer.setSize
rendererCode = rendererCode.replace(
    /renderer\.setSize\(container\.clientWidth,\s*container\.clientHeight\);/,
    `renderer.setSize(container.clientWidth, container.clientHeight);\n${resizeObserverCode}`
);

fs.writeFileSync('renderer.js', rendererCode);
console.log('Injected ResizeObserver for Three.js canvas');
