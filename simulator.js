// ============================================================
//  IoT Simulator for School Mode
// ============================================================
(function() {
  'use strict';

  var SIM_HTML = '<div id="sim-panel" class="hidden">' +
    '<div class="sim-header">' +
      '<h3>&#x1F3AE; Sensor Simulator</h3>' +
      '<button id="sim-close-btn">&times;</button>' +
    '</div>' +
    '<div id="sim-controls"></div>' +
  '</div>' +
  '<button id="sim-toggle-btn" style="position:fixed; bottom:30px; left:360px; z-index:10000; background:#8b5cf6; color:white; border:none; box-shadow:0 4px 15px rgba(139,92,246,0.4); font-weight:bold; padding:10px 16px; border-radius:20px; cursor:pointer; display:flex; align-items:center; gap:8px; font-family:Nunito,sans-serif; font-size:14px;">' +
    '<i class="fas fa-gamepad"></i> Simulator' +
  '</button>';

  var SIM_CSS = [
    '#sim-panel { position:fixed; bottom:70px; left:360px; width:280px; max-height:calc(100vh - 120px); background:var(--card-bg,#1e293b); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.3); z-index:10000; border:2px solid var(--input-border,#334155); font-family:"Nunito",sans-serif; transition:transform .3s,opacity .3s; overflow:hidden; display:flex; flex-direction:column; }',
    '#sim-panel.hidden { transform:translateY(20px); opacity:0; pointer-events:none; }',
    '.sim-header { background:#8b5cf6; color:white; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }',
    '.sim-header h3 { margin:0; font-size:15px; font-weight:800; }',
    '#sim-close-btn { background:none; border:none; color:white; font-size:20px; cursor:pointer; }',
    '#sim-controls { padding:14px; display:flex; flex-direction:column; gap:14px; overflow-y:auto; flex-grow:1; }',
    '.sim-control-group { display:flex; flex-direction:column; }',
    '.sim-control-group label { display:flex; justify-content:space-between; font-size:13px; font-weight:700; color:var(--text-main,#e2e8f0); margin-bottom:6px; }',
    '.sim-control-group input[type=range] { width:100%; accent-color:#8b5cf6; cursor:pointer; }'
  ].join('\n');

  var SENSOR_VARS = {
    'Temp':        { v:'currentTemperature',  min:-10,  max:50,   step:1,   unit:'C',     def: 0 },
    'Humidity':    { v:'currentHumidity',     min:0,    max:100,  step:1,   unit:'%',     def: 0 },
    'Pressure':    { v:'currentPressure',     min:900,  max:1100, step:1,   unit:'hPa',   def: 0 },
    'Light':       { v:'currentLight',        min:0,    max:10000,step:10,  unit:'lux',   def: 0 },
    'Wind':        { v:'currentWindSpeed',    min:0,    max:30,   step:1,   unit:'m/s',   def: 0 },
    'Rain':        { v:'currentRainCount',    min:0,    max:50,   step:1,   unit:'mm',    def: 0 },
    'Distance':    { v:'currentDistance',     min:0,    max:200,  step:1,   unit:'cm',    def: 0 },
    'Magnet':      { v:'currentMagneticField',min:-1000,max:1000, step:10,  unit:'uT',    def: 0 },
    'IR':          { v:'currentIR',           min:0,    max:1023, step:10,  unit:'',      def: 0 },
    'Accel X':     { v:'currentAccelX',       min:-2,   max:2,    step:0.1, unit:'g',     def: 0 },
    'Accel Y':     { v:'currentAccelY',       min:-2,   max:2,    step:0.1, unit:'g',     def: 0 },
    'Accel Z':     { v:'currentAccelZ',       min:-2,   max:2,    step:0.1, unit:'g',     def: 0 },
    'Soil Moist':  { v:'currentSoilMoist',    min:0,    max:100,  step:1,   unit:'%',     def: 0,  soilKey:'Moisture' },
    'Soil Temp':   { v:'currentSoilTemp',     min:0,    max:60,   step:1,   unit:'C',     def: 0,  soilKey:'Temperature' },
    'Soil pH':     { v:'currentSoilPH',       min:0,    max:14,   step:0.1, unit:'',      def: 0, soilKey:'pH' },
    'Soil N':      { v:'currentSoilN',        min:0,    max:200,  step:1,   unit:'mg/kg', def: 0,  soilKey:'Nitrogen' },
    'Soil P':      { v:'currentSoilP',        min:0,    max:200,  step:1,   unit:'mg/kg', def: 0,  soilKey:'Phosphorus' },
    'Soil K':      { v:'currentSoilK',        min:0,    max:200,  step:1,   unit:'mg/kg', def: 0,  soilKey:'Potassium' },
    'Soil EC':     { v:'currentSoilEC',       min:0,    max:5,    step:0.1, unit:'mS/cm', def: 0, soilKey:'EC' },
    'Soil Sal':    { v:'currentSoilSal',      min:0,    max:5000, step:10,  unit:'',      def: 0, soilKey:'Salinity' },
          'PM1.0':       { v:'currentSEN66_PM1',    min:0,    max:100,  step:1,   unit:'ug/m3', def: 0 },
      'PM2.5':       { v:'currentSEN66_PM25',   min:0,    max:100,  step:1,   unit:'ug/m3', def: 0 },
      'PM4.0':       { v:'currentSEN66_PM4',    min:0,    max:100,  step:1,   unit:'ug/m3', def: 0 },
      'PM10':        { v:'currentSEN66_PM10',   min:0,    max:100,  step:1,   unit:'ug/m3', def: 0 },
      'VOC':         { v:'currentSEN66_VOC',    min:0,    max:500,  step:1,   unit:'Idx',   def: 100 },
      'NOx':         { v:'currentSEN66_NOx',    min:0,    max:500,  step:1,   unit:'Idx',   def: 0 },
      'CO2':         { v:'currentSEN66_CO2',    min:400,  max:2000, step:10,  unit:'ppm',   def: 400 }
  };

  function getControls() {
    var s = window.selectedSensor || localStorage.getItem('arduinoSensor') || '';
    var c = [];
    if (s.indexOf('Shield') !== -1 || s === 'AHT20' || s === 'STTS751' || s === 'STS30' || s === 'SEN66') c.push('Temp');
    if (s.indexOf('Shield') !== -1 || s === 'AHT20' || s === 'SEN66') c.push('Humidity');
    if (s.indexOf('Shield') !== -1) { c.push('Pressure'); c.push('Light'); }
    if (s === 'VCNL4040' || s === 'VEML7700') c.push('Light');
    if (s === 'Wind Sensor') c.push('Wind');
    if (s === 'Rain Gauge') c.push('Rain');
    if (s === 'VL53L0X' || s === 'HC-SR04') c.push('Distance');
    if (s === 'Hall Sensor' || s === 'TLV493D' || s === 'Reed Switch') c.push('Magnet');
    if (s === 'IR Sensor') c.push('IR');
    if (s === 'LIS3DH' || s === 'LIS2DH') { c.push('Accel X'); c.push('Accel Y'); c.push('Accel Z'); }
    if (s === 'Soil Sensor') {
      c.push('Soil Moist'); c.push('Soil Temp'); c.push('Soil pH');
      c.push('Soil N'); c.push('Soil P'); c.push('Soil K');
      c.push('Soil EC'); c.push('Soil Sal');
    }
    if (s === 'SEN66') { c.push('PM1.0'); c.push('PM2.5'); c.push('PM4.0'); c.push('PM10'); c.push('VOC'); c.push('NOx'); c.push('CO2'); }
    if (c.length === 0 && s !== '') c.push('Temp');
    return c;
  }

  var currentControls = [];
  var simOpen = false;

  function buildControls() {
    var container = document.getElementById('sim-controls');
    if (!container) return;
    var needed = getControls();
    if (JSON.stringify(needed) === JSON.stringify(currentControls)) return;
    currentControls = needed;
    container.innerHTML = '';
    if (needed.length === 0) {
      container.innerHTML = '<p style="font-size:12px; color:#64748b; text-align:center;">Select a sensor first!</p>';
      return;
    }
    for (var i = 0; i < needed.length; i++) {
      (function(key) {
        var cfg = SENSOR_VARS[key];
        var div = document.createElement('div');
        div.className = 'sim-control-group';
        var label = document.createElement('label');
        var nameSpan = document.createElement('span');
        nameSpan.textContent = key;
        var valSpan = document.createElement('span');
        if (window[cfg.v] === null || window[cfg.v] === undefined) {
          window[cfg.v] = cfg.def;
        }
        valSpan.textContent = window[cfg.v] + ' ' + cfg.unit;
        label.appendChild(nameSpan);
        label.appendChild(valSpan);
        var input = document.createElement('input');
        input.type = 'range';
        input.min = cfg.min;
        input.max = cfg.max;
        input.step = cfg.step;
        input.value = window[cfg.v];
        input.addEventListener('input', function(e) {
          var val = parseFloat(e.target.value);
          valSpan.textContent = val + ' ' + cfg.unit;
          window[cfg.v] = val;
          if (key === 'Light') window.currentVCNLLux = val;
          if (key === 'Rain') {
            if (window.sensorData) {
              if (window.sensorData['ADC']) window.sensorData['ADC']['Rainfall'] = val.toFixed(1) + ' mm';
              if (window.sensorData['WEATHER']) window.sensorData['WEATHER']['Rainfall'] = val.toFixed(1) + ' mm';
            }
            var re = document.getElementById('rain-value');
            if (re) re.textContent = val.toFixed(1) + ' mm';
          }
          
            
            if (key === 'Temp') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 Temperature'] = val.toFixed(2) + ' \u00B0C'; }
            if (key === 'Humidity') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 Humidity'] = val.toFixed(1) + ' %'; }
            if (key === 'PM1.0') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 PM1.0'] = val.toFixed(1) + ' ug/m3'; }
            if (key === 'PM2.5') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 PM2.5'] = val.toFixed(1) + ' ug/m3'; }
            if (key === 'PM4.0') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 PM4'] = val.toFixed(1) + ' ug/m3'; }
            if (key === 'PM10') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 PM10'] = val.toFixed(1) + ' ug/m3'; }
            if (key === 'VOC') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 VOC'] = val.toFixed(0); }
            if (key === 'NOx') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 NOx'] = val.toFixed(0); }
            if (key === 'CO2') { if (window.sensorData && window.sensorData['I2C']) window.sensorData['I2C']['SEN66 CO2'] = val.toFixed(0) + ' ppm'; }
            if (key === 'Wind') {
            if (window.sensorData) {
              if (window.sensorData['RS485']) window.sensorData['RS485']['Wind Speed'] = val.toFixed(1) + ' m/s';
            }
            var we = document.getElementById('wind-speed-value');
            if (we) we.textContent = val.toFixed(1);
          }
          // Soil: inject into sensorData and update orbit display elements
          if (cfg.soilKey && window.sensorData) {
            var proto = 'RS485';
            if (!window.sensorData[proto]) window.sensorData[proto] = {};
            var suffix = cfg.unit ? val.toFixed(cfg.step < 1 ? 1 : 0) + ' ' + cfg.unit : val.toFixed(cfg.step < 1 ? 1 : 0);
            window.sensorData[proto]['Soil Sensor ' + cfg.soilKey] = suffix;
            // Update orbit card live values
            var orbitMap = {
              'Moisture':    'orbit-soil-moist-val',
              'Temperature': 'orbit-soil-temp-val',
              'pH':          'orbit-soil-ph-val',
              'Nitrogen':    'orbit-soil-n-val',
              'Phosphorus':  'orbit-soil-p-val',
              'Potassium':   'orbit-soil-k-val',
              'EC':          'orbit-soil-ec-val',
              'Salinity':    'orbit-soil-sal-val'
            };
            var elId = orbitMap[cfg.soilKey];
            if (elId) {
              var el = document.getElementById(elId);
              if (el) el.textContent = suffix;
            }
          }
          if (typeof window.updateSensorUI === 'function') window.updateSensorUI();
            if (typeof window.renderSensorData === 'function') window.renderSensorData();
        });
        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
      })(needed[i]);
    }
  }

  function toggleSim() {
    simOpen = !simOpen;
    var p = document.getElementById('sim-panel');
    if (simOpen) { p.classList.remove('hidden'); buildControls(); }
    else { p.classList.add('hidden'); }
  }

  function init() {
    if (document.getElementById('sim-panel')) return;
    var style = document.createElement('style');
    style.textContent = SIM_CSS;
    document.head.appendChild(style);
    var div = document.createElement('div');
    div.innerHTML = SIM_HTML;
    document.body.appendChild(div);
    document.getElementById('sim-toggle-btn').addEventListener('click', toggleSim);
    document.getElementById('sim-close-btn').addEventListener('click', toggleSim);
    setInterval(function() { if (simOpen) buildControls(); }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
