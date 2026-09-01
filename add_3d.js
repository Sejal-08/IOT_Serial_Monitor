const fs = require('fs');

const modelHtml = `
  <!-- 3D Interactive Model Card (Added from Wind Dashboard) -->
  <div id="wind-3d-model-card" class="card-container dash-card" style="display: none; align-items:center; min-height: 400px !important;">
    <div class="card-header">
      <span class="card-title">?? 3D Ultrasonic Sensor</span>
      <div class="live-dot"></div>
    </div>
    <div class="device-viewport-container" id="deviceInteractiveArea" style="width: 100%; height: 100%; flex: 1;">
      <canvas id="device3dCanvas" style="width: 100%; height: 100%; max-height: 440px; cursor: grab; outline: none; display: block;"></canvas>
    </div>
  </div>
`;

function injectModel(file) {
    let html = fs.readFileSync(file, 'utf8');
    
    // Check if already injected
    if (html.includes('wind-3d-model-card')) {
        console.log(`Already in ${file}`);
        return;
    }
    
    html = html.replace(
        /(<div id="wind-flow-card"[\s\S]*?<\/div>)/,
        `$1\n${modelHtml}`
    );
    fs.writeFileSync(file, html);
    console.log(`Injected 3D model into ${file}`);
}

injectModel('arduino.html');
injectModel('index.html');
