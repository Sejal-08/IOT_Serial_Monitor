// ============================================================
//  ROBO - The IoT Robot Mascot for School Mode
//  Reacts in real-time to all sensor readings on arduino.html
// ============================================================
(function () {
  'use strict';

  var lastState = '';
  var pollTimer = null;
  var bubbletimer = null;
  var shakeCount = 0;
  var lastAccelMag = 0;
  var lastSpeechState = '';

  // CSS for robot animations
  var ROBOT_CSS = [
    '#robo-wrapper { position:fixed; bottom:20px; right:24px; z-index:9999; display:flex; flex-direction:column; align-items:center; gap:6px; user-select:none; }',
    '#robo-container { position:relative; width:120px; height:180px; animation:robo-float 3s ease-in-out infinite; cursor:pointer; filter:drop-shadow(0 8px 20px rgba(0,0,0,.25)); }',
    '#robo-container:hover { filter:drop-shadow(0 10px 28px rgba(59,130,246,.5)); }',
    '#robo-svg { width:120px; height:180px; }',
    '#robo-label { font-family:"Nunito",sans-serif; font-size:13px; font-weight:800; color:#64748b; text-align:center; pointer-events:none; }',
    '.robo-bubble { position:absolute; bottom:130px; left:110px; background:white; border:2px solid #3b82f6; border-radius:16px 16px 16px 4px; padding:10px 14px; font-family:"Nunito",sans-serif; font-size:13px; font-weight:700; color:#1e293b; max-width:150px; min-width:100px; box-shadow:0 4px 16px rgba(59,130,246,.2); line-height:1.4; text-align:center; transition:opacity .3s,transform .3s; z-index:10000; }',
    'body:not(.light-mode) .robo-bubble { background:#1e293b; color:#f1f5f9; border-color:#3b82f6; }',
    '.robo-bubble.hidden { opacity:0; transform:translateY(10px); pointer-events:none; }',
    '.robo-bubble.visible { opacity:1; transform:translateY(0); }',
    '.robo-accessory { position:absolute; top:-30px; left:50%; transform:translateX(-50%); font-size:38px; transition:all .5s; }',
    '.robo-item { position:absolute; bottom:40px; left:-40px; font-size:36px; transition:all .5s; }',
    '@keyframes robo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }',
    '@keyframes robo-bounce { 0%,100%{transform:translateY(0) scale(1)} 25%{transform:translateY(-18px) scale(1.05)} 75%{transform:translateY(-8px) scale(.98)} }',
    '@keyframes robo-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px) rotate(-5deg)} 40%{transform:translateX(8px) rotate(5deg)} 60%{transform:translateX(-6px) rotate(-3deg)} 80%{transform:translateX(6px) rotate(3deg)} }',
    '@keyframes robo-shiver { 0%,100%{transform:rotate(0) translateX(0)} 25%{transform:rotate(-3deg) translateX(-3px)} 75%{transform:rotate(3deg) translateX(3px)} }',
    '@keyframes robo-sweat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }',
    '@keyframes robo-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }',
    '@keyframes robo-dance { 0%,100%{transform:rotate(0) translateY(0)} 25%{transform:rotate(-8deg) translateY(-12px)} 50%{transform:rotate(0) translateY(-6px)} 75%{transform:rotate(8deg) translateY(-12px)} }',
    '@keyframes robo-sleep { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(3px) rotate(2deg)} }'
  ].join('\n');

  var STATES = {
    very_hot:         { anim:'robo-sweat .4s', eyes:'squint', mouth:'sad', heart:'#ef4444', body:'#dc2626', ant:'#ef4444', acc:'\uD83E\uDD75', item:'\uD83E\uDDCA', msg:"IT'S SO HOT! Quick, get ice cream!" },
    hot:              { anim:'robo-sweat .8s', eyes:'squint', mouth:'sad', heart:'#f97316', body:'#ea580c', ant:'#f97316', acc:'\u2600\uFE0F', item:'', msg:"Getting warm... I'm sweating!" },
    comfortable_temp: { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDE0A', item:'', msg:"Perfect temperature! I feel great!" },
    cold:             { anim:'robo-shiver .3s', eyes:'wide', mouth:'sad', heart:'#60a5fa', body:'#1d4ed8', ant:'#93c5fd', acc:'\uD83E\uDDE3', item:'', msg:"Brr! It's chilly! Stay warm!" },
    low_pressure:     { anim:'robo-float 1s', eyes:'wide', mouth:'open', heart:'#93c5fd', body:'#1e3a8a', ant:'#93c5fd', acc:'\u2601\uFE0F', item:'', msg:"Low pressure! A storm might be coming!" },
    high_pressure:    { anim:'robo-shake .5s', eyes:'squint', mouth:'sad', heart:'#f87171', body:'#991b1b', ant:'#f87171', acc:'\uD83C\uDF2B\uFE0F', item:'', msg:"High pressure! Heavy air!" },
    very_cold:        { anim:'robo-shiver .2s', eyes:'wide', mouth:'sad', heart:'#bfdbfe', body:'#1e3a8a', ant:'#bfdbfe', acc:'\u2744\uFE0F', item:'\uD83D\uDD25', msg:"FREEZING! Someone light a fire!" },
    very_humid:       { anim:'robo-sweat .6s', eyes:'squint', mouth:'sad', heart:'#818cf8', body:'#4338ca', ant:'#818cf8', acc:'\uD83D\uDCA6', item:'', msg:"So muggy! I'm dripping!" },
    very_dry:         { anim:'robo-float 3s', eyes:'squint', mouth:'sad', heart:'#fbbf24', body:'#b45309', ant:'#fbbf24', acc:'\uD83C\uDF35', item:'', msg:"So dry! Bring water!" },
    normal_humidity:  { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDCA7', item:'', msg:"Humidity is just right!" },
    storm:            { anim:'robo-shake .3s', eyes:'wide', mouth:'open', heart:'#ef4444', body:'#374151', ant:'#fbbf24', acc:'\uD83C\uDF2A\uFE0F', item:'', msg:"STORM ALERT! Hold on tight!" },
    windy:            { anim:'robo-shake .6s', eyes:'wide', mouth:'open', heart:'#38bdf8', body:'#0369a1', ant:'#38bdf8', acc:'\uD83D\uDCA8', item:'', msg:"Whoosh! So windy!" },
    no_wind:            { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83C\uDF42', item:'', msg:"Not a breath of wind! So peaceful." },
      calm_wind:        { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83C\uDF43', item:'', msg:"Nice breeze! Perfect kite weather!" },
    heavy_rain:       { anim:'robo-dance 1.2s', eyes:'happy', mouth:'smile', heart:'#60a5fa', body:'#1d4ed8', ant:'#93c5fd', acc:'\u26C8\uFE0F', item:'\u2602\uFE0F', msg:"Heavy rain! Don't forget your umbrella!" },
    light_rain:       { anim:'robo-dance 1.5s', eyes:'happy', mouth:'smile', heart:'#38bdf8', body:'#0369a1', ant:'#38bdf8', acc:'\uD83C\uDF27\uFE0F', item:'\u2614', msg:"Light drizzle detected! Cool!" },
    no_rain:          { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83C\uDF24\uFE0F', item:'', msg:"No rain! Sunny vibes!" },
    very_dark:        { anim:'robo-sleep 1.5s', eyes:'sleep', mouth:'straight', heart:'#6b7280', body:'#1e293b', ant:'#6b7280', acc:'\uD83D\uDE34', item:'\uD83D\uDD26', msg:"Zzz... turning the lights off?" },
    very_bright:      { anim:'robo-bounce .5s', eyes:'star', mouth:'smile', heart:'#fbbf24', body:'#d97706', ant:'#fbbf24', acc:'\uD83D\uDE0E', item:'', msg:"WOW! Super bright! Sunglasses on!" },
    normal_light:     { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDCA1', item:'', msg:"Good lighting! Science time!" },
    shaking:          { anim:'robo-shake .2s', eyes:'wide', mouth:'open', heart:'#ef4444', body:'#dc2626', ant:'#ef4444', acc:'\uD83D\uDE31', item:'', msg:"EARTHQUAKE?! I feel the shakes!" },
    tilting:          { anim:'robo-float 3s', eyes:'wide', mouth:'open', heart:'#f97316', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDCD0', item:'', msg:"Whoa! Something is tilting!" },
    still:            { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDE0C', item:'', msg:"All still! No movement detected." },
    strong_magnet:    { anim:'robo-pulse .4s', eyes:'wide', mouth:'open', heart:'#a78bfa', body:'#7c3aed', ant:'#a78bfa', acc:'\uD83E\uDDF2', item:'', msg:"STRONG MAGNET! I can feel it!" },
    weak_magnet:      { anim:'robo-pulse 1s', eyes:'normal', mouth:'smile', heart:'#c4b5fd', body:'#4c1d95', ant:'#c4b5fd', acc:'\uD83D\uDD2E', item:'', msg:"I sense a magnetic field!" },
    no_magnet:        { anim:'robo-float 3s', eyes:'normal', mouth:'normal', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'', item:'', msg:"No magnets. Try holding one near!" },
    obstacle_near:    { anim:'robo-bounce .4s', eyes:'wide', mouth:'open', heart:'#f97316', body:'#ea580c', ant:'#f97316', acc:'\uD83D\uDEA8', item:'', msg:"OBSTACLE DETECTED! Something blocking!" },
    no_obstacle:      { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDC40', item:'', msg:"Path is clear! Nothing in the way!" },
    very_close:       { anim:'robo-shake .3s', eyes:'wide', mouth:'open', heart:'#ef4444', body:'#dc2626', ant:'#ef4444', acc:'\uD83D\uDE32', item:'', msg:"WHOA! Something RIGHT in front!" },
    close:            { anim:'robo-float 3s', eyes:'wide', mouth:'open', heart:'#f97316', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDC4B', item:'', msg:"Something close! Wave hello!" },
    far:              { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDD2D', item:'', msg:"It's far away! Path is clear!" },
    bad_air:          { anim:'robo-float 3s', eyes:'squint', mouth:'sad', heart:'#ef4444', body:'#b91c1c', ant:'#ef4444', acc:'\uD83D\uDE37', item:'\uD83D\uDE37', msg:"AIR QUALITY ALERT! Open a window!" },
    okay_air:         { anim:'robo-float 3s', eyes:'squint', mouth:'normal', heart:'#fbbf24', body:'#b45309', ant:'#fbbf24', acc:'\uD83C\uDF2B\uFE0F', item:'', msg:"Air is okay... could be better!" },
    clean_air:        { anim:'robo-bounce 1.5s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#15803d', ant:'#22c55e', acc:'\uD83C\uDF3F', item:'', msg:"Crystal clean air! Breathe deep!" },
    soil_dry:         { anim:'robo-float 3s', eyes:'squint', mouth:'sad', heart:'#fbbf24', body:'#b45309', ant:'#fbbf24', acc:'\uD83C\uDF35', item:'\uD83D\uDCA7', msg:"Soil is DRY! Water the plants!" },
    soil_wet:         { anim:'robo-sweat .8s', eyes:'normal', mouth:'normal', heart:'#60a5fa', body:'#1d4ed8', ant:'#60a5fa', acc:'\uD83D\uDCA6', item:'', msg:"Super wet soil! Don't over-water!" },
    soil_good:        { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#15803d', ant:'#22c55e', acc:'\uD83C\uDF31', item:'', msg:"Perfect moisture! Plants are happy!" },
    magnetic_3d:      { anim:'robo-pulse 1s', eyes:'star', mouth:'smile', heart:'#a78bfa', body:'#7c3aed', ant:'#a78bfa', acc:'\uD83D\uDD2E', item:'', msg:"Detecting magnetic fields in 3D!" },
    blinking:         { anim:'robo-bounce .5s', eyes:'star', mouth:'smile', heart:'#fbbf24', body:'#d97706', ant:'#fbbf24', acc:'\uD83D\uDCA1', item:'', msg:"Blink blink! The LED is flashing!" },
    buzzing:          { anim:'robo-shake .3s', eyes:'wide', mouth:'open', heart:'#f97316', body:'#c2410c', ant:'#f97316', acc:'\uD83D\uDD0A', item:'', msg:"BUZZZZ! I can hear it humming!" },
    touch:            { anim:'robo-bounce .4s', eyes:'star', mouth:'smile', heart:'#ec4899', body:'#be185d', ant:'#ec4899', acc:'\u261D\uFE0F', item:'', msg:"Touch detected! Tickles!" },
    connected_idle:   { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#22c55e', body:'#1e40af', ant:'#22c55e', acc:'\uD83D\uDCE1', item:'', msg:"Everything looks perfect! I feel great!" },
    idle:             { anim:'robo-float 3s', eyes:'happy', mouth:'smile', heart:'#3b82f6', body:'#1e40af', ant:'#3b82f6', acc:'\uD83D\uDC4B', item:'', msg:"Hello! I'm ROBO! Connect a sensor or try the Simulator!" }
  };

  function boot() {
    // Always inject CSS
    if (!document.getElementById('robo-style-tag')) {
      var style = document.createElement('style');
      style.id = 'robo-style-tag';
      style.textContent = ROBOT_CSS;
      document.head.appendChild(style);
    }

    // Add click listener
    var container = document.getElementById('robo-container');
    if (container && !container.dataset.roboReady) {
      container.dataset.roboReady = 'true';
      container.addEventListener('click', function() {
        var quips = [
          "Beep boop! I love data!",
          "Sensors are AWESOME!",
          "Keep exploring, scientist!",
          "You're doing great!",
          "Science is magic!",
          "Data never lies!"
        ];
        speak(quips[Math.floor(Math.random() * quips.length)], 3000);
      });
    }

    // Start polling
    if (!pollTimer) {
      pollTimer = setInterval(function() {
        applyState(computeState());
      }, 1200);
    }

    
  }

  function speak(text, dur) {
    var b = document.getElementById('robo-speech-bubble');
    if (!b) return;
    clearTimeout(bubbletimer);
    b.textContent = text;
    b.classList.remove('hidden');
    b.classList.add('visible');
  }

  function setEyes(mood) {
    var pL = document.getElementById('robo-pupilL');
    var pR = document.getElementById('robo-pupilR');
    var eL = document.getElementById('robo-eyeL');
    var eR = document.getElementById('robo-eyeR');
    var ckL = document.getElementById('robo-cheekL');
    var ckR = document.getElementById('robo-cheekR');
    if (!pL) return;
    eL.setAttribute('ry','10'); eL.setAttribute('rx','10');
    eR.setAttribute('ry','10'); eR.setAttribute('rx','10');
    pL.setAttribute('r','5'); pL.setAttribute('fill','#0f172a');
    pR.setAttribute('r','5'); pR.setAttribute('fill','#0f172a');
    ckL.setAttribute('opacity','0'); ckR.setAttribute('opacity','0');
    if (mood === 'happy') { ckL.setAttribute('opacity','0.8'); ckR.setAttribute('opacity','0.8'); }
    else if (mood === 'wide') { eL.setAttribute('ry','12'); eL.setAttribute('rx','12'); eR.setAttribute('ry','12'); eR.setAttribute('rx','12'); pL.setAttribute('r','6'); pR.setAttribute('r','6'); }
    else if (mood === 'squint') { eL.setAttribute('ry','4'); eR.setAttribute('ry','4'); }
    else if (mood === 'sleep') { eL.setAttribute('ry','3'); eR.setAttribute('ry','3'); }
    else if (mood === 'star') { pL.setAttribute('fill','#f59e0b'); pL.setAttribute('r','7'); pR.setAttribute('fill','#f59e0b'); pR.setAttribute('r','7'); }
  }

  function setMouth(mood) {
    var m = document.getElementById('robo-mouth');
    if (!m) return;
    if (mood === 'smile') m.setAttribute('d','M 44 58 Q 60 72 76 58');
    else if (mood === 'sad') m.setAttribute('d','M 44 66 Q 60 55 76 66');
    else if (mood === 'open') m.setAttribute('d','M 44 58 Q 60 76 76 58');
    else if (mood === 'straight') m.setAttribute('d','M 44 62 L 76 62');
    else m.setAttribute('d','M 44 60 Q 60 70 76 60');
  }

  function applyState(state) {
    if (state === lastState) return;
    lastState = state;
    var r = STATES[state] || STATES['connected_idle'];

    // Animation
    var c = document.getElementById('robo-container');
    if (c) c.style.animation = r.anim + ' ease-in-out infinite';

    // Eyes and mouth
    setEyes(r.eyes);
    setMouth(r.mouth);

    // Heart
    var h = document.getElementById('robo-heart');
    if (h) h.setAttribute('fill', r.heart);

    // Body color
    var ids = ['robo-body','robo-head','robo-armL','robo-armR'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.setAttribute('fill', r.body);
    }

    // Hands color (slightly lighter)
    var hL = document.getElementById('robo-handL');
    var hR = document.getElementById('robo-handR');
    if (hL) hL.setAttribute('fill', r.body);
    if (hR) hR.setAttribute('fill', r.body);

    // Antenna
    var ab = document.getElementById('robo-antennaBall');
    if (ab) ab.setAttribute('fill', r.ant);

    // Accessory and item
    var acc = document.getElementById('robo-accessory');
    if (acc) acc.textContent = r.acc;
    var itm = document.getElementById('robo-item');
    var armR = document.getElementById('robo-armR');
    var handR = document.getElementById('robo-handR');
    
    // Remove the fake stick if it exists
    var stick = document.getElementById('robo-umbrella-stick');
    if (stick) stick.style.display = 'none';
    
    if (itm && armR && handR) {
      itm.textContent = r.item;
      if (r.item === '\u2602\uFE0F' || r.item === '\u2614' || r.item === '?' || r.item.indexOf('~') !== -1) {
        // Raise right arm
        armR.style.transformOrigin = '109px 98px';
        armR.style.transform = 'rotate(-150deg)';
        handR.style.transformOrigin = '109px 98px';
        handR.style.transform = 'rotate(-150deg)';
        
        // Position umbrella hook exactly in hand, scale massively to cover head
        itm.style.bottom = '80px'; // Precisely at the raised hand's Y-level
        itm.style.left = '78px';    // Shifted right so the J-hook aligns with the hand
        itm.style.transformOrigin = 'bottom center'; 
        itm.style.transform = 'scale(3.8) rotate(15deg)'; // Massive scale, slight tilt
        itm.style.zIndex = '100';
      } else {
        // Reset arm
        armR.style.transform = 'rotate(0deg)';
        handR.style.transform = 'rotate(0deg)';
        
        // Reset item
        itm.style.bottom = '40px';
        itm.style.left = '-40px';
        itm.style.transformOrigin = 'center center';
        itm.style.transform = 'rotate(0deg) scale(1)';
        itm.style.zIndex = '1';
      }
    }

    // Speech
    if (state !== lastSpeechState && state !== 'idle') {
      lastSpeechState = state;
      speak(r.msg);
    }
  }

    function computeState() {
    var s = window.selectedSensor || '';
    if (!s) return 'idle';

    var temp = window.currentTemperature;
    if (temp === undefined) temp = null;
    if (temp === null && window.currentSEN66_Temp !== undefined) temp = window.currentSEN66_Temp;

    var hum = window.currentHumidity;
    if (hum === undefined) hum = null;

    var pres = window.currentPressure;
    if (pres === undefined) pres = null;

    var light = window.currentLight;
    if (light === undefined) light = null;
    if (light === null && window.currentVCNLLux !== undefined) light = window.currentVCNLLux;

    var ws = window.currentWindSpeed;
    if (ws === undefined) ws = null;

    var ax = window.currentAccelX;
    if (ax === undefined) ax = null;
    var ay = window.currentAccelY;
    if (ay === undefined) ay = null;
    var az = window.currentAccelZ;
    if (az === undefined) az = null;

    var mag = window.currentMagneticField;
    if (mag === undefined) mag = null;

    var dist = window.currentDistance;
    if (dist === undefined) dist = null;

    var ir = window.currentIR;
    if (ir === undefined) ir = null;

    var sm = window.currentSoilMoist;
    if (sm === undefined) sm = null;

    function checkTemp() {
      if (temp !== null && (s.indexOf('Shield') !== -1 || s === 'AHT20' || s === 'STTS751' || s === 'STS30' || s === 'SEN66' || s === 'BME680')) {
        if (temp > 38) return 'very_hot';
        if (temp > 30) return 'hot';
        if (temp < 5)  return 'very_cold';
        if (temp < 15) return 'cold';
      }
      return null;
    }

    function checkHum() {
      if (hum !== null && hum > 0 && s !== 'Rain Gauge') {
        if (hum > 80) return 'very_humid';
        if (hum < 20) return 'very_dry';
      }
      return null;
    }

    function checkPres() {
      if (pres !== null && (s.indexOf('Shield') !== -1 || s === 'BME680' || s === 'BMP280' || s === 'BMP388')) {
        if (pres > 1025) return 'high_pressure';
        if (pres < 980) return 'low_pressure';
      }
      return null;
    }

    function checkLight() {
      if (light !== null && (s === 'VCNL4040' || s === 'VEML7700' || s.indexOf('Shield') !== -1)) {
        if (light < 5) return 'very_dark';
        if (light > 5000) return 'very_bright';
      }
      return null;
    }

    function checkWind() {
      if (ws !== null && s === 'Wind Sensor') {
        if (ws > 15) return 'storm';
        if (ws > 5) return 'windy';
      }
      return null;
    }

    function checkRain() {
      if (s === 'Rain Gauge') {
        var re = document.getElementById('rain-total-value') || document.getElementById('rain-value');
        var rv = re ? parseFloat(re.textContent) : 0;
        if (rv > 2) return 'heavy_rain';
        if (rv > 0) return 'light_rain';
      }
      return null;
    }
    
    function checkAccel() {
      if ((ax !== null || ay !== null || az !== null) && (s === 'LIS3DH' || s === 'LIS2DH')) {
        var am = Math.sqrt((ax||0)*(ax||0) + (ay||0)*(ay||0) + (az||0)*(az||0));
        var lm = window.lastAccelMag || 1.0;
        var diff = Math.abs(am - lm);
        window.lastAccelMag = am;
        if (diff > 0.8) return 'shaking';
        if (Math.abs(ax) > 0.5 || Math.abs(ay) > 0.5) return 'tilting';
      }
      return null;
    }

    function checkMag() {
      if (s === 'TLV493D') {
        var mx = window.currentMagX || 0;
        var my = window.currentMagY || 0;
        var mz = window.currentMagZ || 0;
        if (Math.abs(mx)>20 || Math.abs(my)>20 || Math.abs(mz)>20) return 'magnetic_3d';
      }
      if (mag !== null && s === 'Hall Sensor') {
        if (Math.abs(mag) > 500) return 'strong_magnet';
        if (Math.abs(mag) > 100) return 'weak_magnet';
      }
      return null;
    }

    function checkDist() {
      if (dist !== null && (s === 'VL53L0X' || s === 'HC-SR04')) {
        if (dist < 10) return 'very_close';
        if (dist < 50) return 'close';
      }
      return null;
    }

    function checkAir() {
      if (s === 'SEN66') {
        var pm = window.currentSEN66_PM25 || 0;
        var voc = window.currentSEN66_VOC || 0;
        if (pm > 35 || voc > 200) return 'bad_air';
        if (pm > 12 || voc > 120) return 'okay_air';
        return 'clean_air';
      }
      return null;
    }

    function checkSoil() {
      if (s === 'Soil Sensor' && sm !== null) {
        if (sm < 20) return 'soil_dry';
        if (sm > 80) return 'soil_wet';
        return 'soil_good';
      }
      return null;
    }

    function checkBlink() {
      if (s === 'Blinky') {
        var ls = window.ledState;
        if (ls === true || ls === 'ON') return 'blinking';
      }
      return null;
    }

    function checkBuzz() {
      if (s === 'Buzzer') {
        if (window.buzzerState === 'ON') return 'buzzing';
      }
      return null;
    }

    function checkTouch() {
      if (s === 'TTP223') {
        if (window.touchState === 'TOUCHED') return 'touch';
      }
      return null;
    }

    // Try Last Touched First!
    var last = window.lastTouchedSensor;
    var res = null;
    if (last === 'currentTemperature') res = checkTemp();
    else if (last === 'currentHumidity') res = checkHum();
    else if (last === 'currentPressure') res = checkPres();
    else if (last === 'currentLight') res = checkLight();
    else if (last === 'currentWindSpeed') res = checkWind();
    else if (last === 'currentRainCount') res = checkRain();
    else if (last === 'currentDistance') res = checkDist();
    else if (last === 'currentMagneticField') res = checkMag();
    else if (last === 'currentSoilMoist') res = checkSoil();

    if (res) return res;

    // Standard Priority Fallback
    return checkTemp() || checkHum() || checkPres() || checkWind() || checkRain() || checkLight() || checkAccel() || checkMag() || checkDist() || checkAir() || checkSoil() || checkBlink() || checkBuzz() || checkTouch() || 'connected_idle';
  }

  function speak(text, dur) {
    var b = document.getElementById('robo-speech-bubble');
    if (!b) return;
    clearTimeout(bubbletimer);
    b.textContent = text;
    b.classList.remove('hidden');
    b.classList.add('visible');
  }

  function setEyes(mood) {
    var pL = document.getElementById('robo-pupilL');
    var pR = document.getElementById('robo-pupilR');
    var eL = document.getElementById('robo-eyeL');
    var eR = document.getElementById('robo-eyeR');
    var ckL = document.getElementById('robo-cheekL');
    var ckR = document.getElementById('robo-cheekR');
    if (!pL) return;
    eL.setAttribute('ry','10'); eL.setAttribute('rx','10');
    eR.setAttribute('ry','10'); eR.setAttribute('rx','10');
    pL.setAttribute('r','5'); pL.setAttribute('fill','#0f172a');
    pR.setAttribute('r','5'); pR.setAttribute('fill','#0f172a');
    ckL.setAttribute('opacity','0'); ckR.setAttribute('opacity','0');
    if (mood === 'happy') { ckL.setAttribute('opacity','0.8'); ckR.setAttribute('opacity','0.8'); }
    else if (mood === 'wide') { eL.setAttribute('ry','12'); eL.setAttribute('rx','12'); eR.setAttribute('ry','12'); eR.setAttribute('rx','12'); pL.setAttribute('r','6'); pR.setAttribute('r','6'); }
    else if (mood === 'squint') { eL.setAttribute('ry','4'); eR.setAttribute('ry','4'); }
    else if (mood === 'sleep') { eL.setAttribute('ry','3'); eR.setAttribute('ry','3'); }
    else if (mood === 'star') { pL.setAttribute('fill','#f59e0b'); pL.setAttribute('r','7'); pR.setAttribute('fill','#f59e0b'); pR.setAttribute('r','7'); }
  }

  function setMouth(mood) {
    var m = document.getElementById('robo-mouth');
    if (!m) return;
    if (mood === 'smile') m.setAttribute('d','M 44 58 Q 60 72 76 58');
    else if (mood === 'sad') m.setAttribute('d','M 44 66 Q 60 55 76 66');
    else if (mood === 'open') m.setAttribute('d','M 44 58 Q 60 76 76 58');
    else if (mood === 'straight') m.setAttribute('d','M 44 62 L 76 62');
    else m.setAttribute('d','M 44 60 Q 60 70 76 60');
  }

  function applyState(state) {
    if (state === lastState) return;
    lastState = state;
    var r = STATES[state] || STATES['connected_idle'];

    // Animation
    var c = document.getElementById('robo-container');
    if (c) c.style.animation = r.anim + ' ease-in-out infinite';

    // Eyes and mouth
    setEyes(r.eyes);
    setMouth(r.mouth);

    // Heart
    var h = document.getElementById('robo-heart');
    if (h) h.setAttribute('fill', r.heart);

    // Body color
    var ids = ['robo-body','robo-head','robo-armL','robo-armR'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.setAttribute('fill', r.body);
    }

    // Hands color (slightly lighter)
    var hL = document.getElementById('robo-handL');
    var hR = document.getElementById('robo-handR');
    if (hL) hL.setAttribute('fill', r.body);
    if (hR) hR.setAttribute('fill', r.body);

    // Antenna
    var ab = document.getElementById('robo-antennaBall');
    if (ab) ab.setAttribute('fill', r.ant);

    // Accessory and item
    var acc = document.getElementById('robo-accessory');
    if (acc) acc.textContent = r.acc;
    var itm = document.getElementById('robo-item');
    var armR = document.getElementById('robo-armR');
    var handR = document.getElementById('robo-handR');
    
    // Remove the fake stick if it exists
    var stick = document.getElementById('robo-umbrella-stick');
    if (stick) stick.style.display = 'none';
    
    if (itm && armR && handR) {
      itm.textContent = r.item;
      if (r.item === '\u2602\uFE0F' || r.item === '\u2614' || r.item === '?' || r.item.indexOf('~') !== -1) {
        // Raise right arm
        armR.style.transformOrigin = '109px 98px';
        armR.style.transform = 'rotate(-150deg)';
        handR.style.transformOrigin = '109px 98px';
        handR.style.transform = 'rotate(-150deg)';
        
        // Position umbrella hook exactly in hand, scale massively to cover head
        itm.style.bottom = '80px'; // Precisely at the raised hand's Y-level
        itm.style.left = '78px';    // Shifted right so the J-hook aligns with the hand
        itm.style.transformOrigin = 'bottom center'; 
        itm.style.transform = 'scale(3.8) rotate(15deg)'; // Massive scale, slight tilt
        itm.style.zIndex = '100';
      } else {
        // Reset arm
        armR.style.transform = 'rotate(0deg)';
        handR.style.transform = 'rotate(0deg)';
        
        // Reset item
        itm.style.bottom = '40px';
        itm.style.left = '-40px';
        itm.style.transformOrigin = 'center center';
        itm.style.transform = 'rotate(0deg) scale(1)';
        itm.style.zIndex = '1';
      }
    }

    // Speech
    if (state !== lastSpeechState && state !== 'idle') {
      lastSpeechState = state;
      speak(r.msg);
    }
  }

  function computeState() {
    var s = window.selectedSensor || '';
    if (!s) return 'idle';

    // Temperature sensors
    var temp = window.currentTemperature;
    if (temp === undefined) temp = null;
    if (temp === null && window.currentSEN66_Temp !== undefined) temp = window.currentSEN66_Temp;
    if (temp !== null && (s.indexOf('Shield') !== -1 || s === 'AHT20' || s === 'STTS751' || s === 'STS30' || s === 'SEN66')) {
      if (temp > 38) return 'very_hot';
      if (temp > 30) return 'hot';
      if (temp < 5)  return 'very_cold';
      if (temp < 15) return 'cold';

    }

    // Humidity
    var hum = window.currentHumidity;
    if (hum === undefined) hum = null;
    if (hum !== null && hum > 0 && s !== 'Rain Gauge') {
      if (hum > 80) return 'very_humid';
      if (hum < 20) return 'very_dry';

    }

    // Pressure
      var pres = window.currentPressure;
      if (pres === undefined) pres = null;
      if (pres !== null && (s.indexOf('Shield') !== -1 || s === 'BME680' || s === 'BMP280' || s === 'BMP388')) {
        if (pres > 1025) return 'high_pressure';
        if (pres < 980) return 'low_pressure';
      }

      // Wind
    var ws = window.currentWindSpeed;
    if (ws === undefined) ws = null;
    if (ws !== null && s === 'Wind Sensor') {
      if (ws > 15) return 'storm';
      if (ws > 5) return 'windy';

    }

    // Rain
    if (s === 'Rain Gauge') {
      var re = document.getElementById('rain-total-value') || document.getElementById('rain-value');
      var rv = re ? parseFloat(re.textContent) : 0;
      if (rv > 2) return 'heavy_rain';
      if (rv > 0) return 'light_rain';

    }

    // Light
    var light = window.currentLight;
    if (light === undefined) light = null;
    if (light === null && window.currentVCNLLux !== undefined) light = window.currentVCNLLux;
    if (light !== null && (s === 'VCNL4040' || s === 'VEML7700' || s.indexOf('Shield') !== -1)) {
      if (light < 5) return 'very_dark';
      if (light > 5000) return 'very_bright';

    }

    // Accelerometer
    var ax = window.currentAccelX;
    if (ax === undefined) ax = null;
    if (ax !== null && (s === 'LIS3DH' || s === 'LIS2DH')) {
      var ay = window.currentAccelY || 0;
      var az = window.currentAccelZ || 0;
      var mag = Math.sqrt(ax*ax + ay*ay + az*az);
      var delta = Math.abs(mag - lastAccelMag);
      lastAccelMag = mag;
      if (delta > 0.5) shakeCount++; else shakeCount = Math.max(0, shakeCount - 1);
      if (shakeCount > 3) return 'shaking';
      if (Math.abs(ax) > 0.5 || Math.abs(ay) > 0.5) return 'tilting';

    }

    // Hall Effect
    var mf = window.currentMagneticField;
    if (mf === undefined) mf = null;
    if (mf !== null && s === 'Hall Sensor') {
      if (Math.abs(mf) > 500) return 'strong_magnet';
      if (Math.abs(mf) > 50) return 'weak_magnet';

    }

    // IR
    var ir = window.currentIR;
    if (ir === undefined) ir = null;
    if (ir !== null && s === 'IR Sensor') {
      if (ir < 100) return 'obstacle_near';

    }

    // Distance
    var dist = window.currentDistance;
    if (dist === undefined) dist = null;
    if (dist !== null && (s === 'VL53L0X' || s === 'HC-SR04')) {
      if (dist < 10) return 'very_close';
      if (dist < 50) return 'close';

    }

    // SEN66
    var pm25 = window.currentSEN66_PM25;
    if (pm25 === undefined) pm25 = null;
    if (pm25 !== null && s === 'SEN66') {
      if (pm25 > 35) return 'bad_air';
      if (pm25 > 12) return 'okay_air';

    }

    // Soil
    var sm = window.currentSoilMoist;
    if (sm === undefined) sm = null;
    if (sm !== null && s === 'Soil Sensor') {
      if (sm < 20) return 'soil_dry';
      if (sm > 80) return 'soil_wet';

    }

    // GPIO sensors
    var normals = [];
    if (temp !== null && (s.indexOf('Shield') !== -1 || s === 'AHT20' || s === 'STTS751' || s === 'STS30' || s === 'SEN66')) normals.push('comfortable_temp');
    if (hum !== null && hum > 0 && s !== 'Rain Gauge') normals.push('normal_humidity');
    if (ws !== null && s !== 'Rain Gauge') { if (ws > 0) normals.push('calm_wind'); else normals.push('no_wind'); }
    if (rv !== null && s === 'Rain Gauge') normals.push('no_rain');
    if (light !== null) normals.push('normal_light');
    if (ax !== null) normals.push('still');
    if (mf !== null && (s === 'Hall Sensor' || s === 'TLV493D' || s === 'Reed Switch')) normals.push('no_magnet');
    if (ir !== null && s === 'IR Sensor') normals.push('no_obstacle');
    if (dist !== null) normals.push('far');
    if (pm25 !== null) normals.push('clean_air');
    if (sm !== null) normals.push('soil_good');
    
    if (normals.length > 0) {
      return normals[Math.floor(Date.now() / 4000) % normals.length];
    }
    
    if (s === 'TLV493D' || s === 'Reed Switch') return 'magnetic_3d';
    if (s === 'Blinky') return 'blinking';
    if (s === 'Buzzer' || s === 'Relay') return 'buzzing';
    if (s === 'TTP223') return 'touch';

    return 'connected_idle';
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
