// School Mode Interactivity for Arduino Serial Monitor

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playConnectSound() {
    playTone(440, 'sine', 0.1);
    setTimeout(() => playTone(554, 'sine', 0.1), 100);
    setTimeout(() => playTone(659, 'sine', 0.2), 200);
}

function playDisconnectSound() {
    playTone(659, 'sine', 0.1);
    setTimeout(() => playTone(554, 'sine', 0.1), 100);
    setTimeout(() => playTone(440, 'sine', 0.2), 200);
}

let lastDataSoundTime = 0;
function playDataSound() {
    const now = Date.now();
    if (now - lastDataSoundTime > 1000) { // Throttle data sounds to 1 per second
        playTone(880, 'sine', 0.05, 0.01); 
        lastDataSoundTime = now;
    }
}

// Gamification
let dataPointsCollected = 0;
let badges = [];

const DID_YOU_KNOW = {
    'AHT20': "Did you know? Humidity is the amount of water vapor in the air! High humidity makes you feel hotter because sweat can't evaporate as fast.",
    'Rain Gauge': "Did you know? Rain gauges use a 'tipping bucket' inside. Every time it fills and tips, it counts how much rain fell!",
    'Weather Shield': "Did you know? Weather shields protect sensors from direct sunlight and rain, but let air flow through so the readings are accurate.",
    'Wind Sensor': "Did you know? Ultrasonic anemometers measure wind speed using sound waves instead of spinning cups!",
    'Soil Sensor': "Did you know? Soil sensors help farmers save water by telling them exactly when the plants are thirsty.",
    'VCNL4040': "Did you know? This sensor can tell how bright it is, just like your smartphone does to change the screen brightness!",
    'Hall Sensor': "Did you know? Hall sensors detect magnetic fields! They are used in cars and even your laptop to know when you close the lid.",
    'STTS751': "Did you know? Digital temperature sensors turn heat into numbers that computers can understand!",
    'STS30': "Did you know? The STS30 is so precise it can notice if the temperature changes by even a tiny fraction of a degree!",
    'LIS3DH': "Did you know? Accelerometers measure gravity and motion! Your phone uses one to know when you turn it sideways.",
    'LIS2DH': "Did you know? This motion sensor uses extremely little power, so it can run on a tiny battery for years!",
    'VEML7700': "Did you know? Ambient light sensors help save energy by turning off streetlights when the sun comes up.",
    'IR Sensor': "Did you know? Infrared sensors use invisible light to 'see' obstacles in the dark, just like your TV remote!",
    'SEN66': "Did you know? Particulate sensors laser-scan the air to count microscopic dust particles you can't even see!"
};

function updateGamification() {
    dataPointsCollected++;
    
    // Check for badges
    if (dataPointsCollected === 1 && !badges.includes('First Data')) {
        badges.push('First Data');
        showBadgeNotification('First Data', 'You received your first data point!');
    } else if (dataPointsCollected === 10 && !badges.includes('Data Explorer')) {
        badges.push('Data Explorer');
        showBadgeNotification('Data Explorer', 'You collected 10 data points! Keep it up!');
    } else if (dataPointsCollected === 50 && !badges.includes('Data Scientist')) {
        badges.push('Data Scientist');
        showBadgeNotification('Data Scientist', 'Wow! 50 data points! You are a pro.');
    } else if (dataPointsCollected === 100 && !badges.includes('Sensor Master')) {
        badges.push('Sensor Master');
        showBadgeNotification('Sensor Master', 'Incredible! 100 data points collected!');
    }
    
    updateScoreUI();
}

function updateScoreUI() {
    const scoreEl = document.getElementById('school-score');
    if (scoreEl) scoreEl.innerText = dataPointsCollected;
}

function showBadgeNotification(title, message) {
    const notif = document.createElement('div');
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
    notif.style.color = '#000';
    notif.style.padding = '15px 25px';
    notif.style.borderRadius = '10px';
    notif.style.boxShadow = '0 5px 15px rgba(255, 215, 0, 0.4)';
    notif.style.zIndex = '9999';
    notif.style.fontFamily = 'Share Tech Mono, sans-serif';
    notif.style.transform = 'translateY(100px)';
    notif.style.opacity = '0';
    notif.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    notif.innerHTML = `
        <div style="font-weight:bold; font-size: 1.2rem; margin-bottom: 5px;"><i class="fas fa-trophy"></i> BADGE UNLOCKED!</div>
        <div style="font-size: 1rem; margin-bottom: 5px;">${title}</div>
        <div style="font-size: 0.8rem; font-family: Inter, sans-serif;">${message}</div>
    `;
    document.body.appendChild(notif);
    
    playTone(523.25, 'triangle', 0.1, 0.2); // C5
    setTimeout(() => playTone(659.25, 'triangle', 0.1, 0.2), 150); // E5
    setTimeout(() => playTone(783.99, 'triangle', 0.3, 0.2), 300); // G5
    
    requestAnimationFrame(() => {
        notif.style.transform = 'translateY(0)';
        notif.style.opacity = '1';
    });
    
    setTimeout(() => {
        notif.style.transform = 'translateY(100px)';
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 4000);
}

// Inject UI for Gamification & Did You Know
function injectSchoolUI() {
    console.log("[SCHOOL MODE] injectSchoolUI called");
    // Inject Score
    const nav = document.querySelector('nav .nav-links');
    console.log("[SCHOOL MODE] nav element found:", !!nav);
    if (nav && !document.getElementById('school-score')) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="background: rgba(255,215,0,0.2); border: 1px solid #FFD700; color: #FFD700; padding: 6px 12px; border-radius: 20px; font-family: 'Share Tech Mono', monospace; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-star"></i> <span id="school-score">0</span> XP
            </div>
        `;
        nav.prepend(li);
    }
    
    // Inject "Did You Know?" Panel
    const rightPanel = document.querySelector('.dashboard') || document.querySelector('.right-panel .container');
    if (rightPanel && !document.getElementById('did-you-know-panel')) {
        const dyk = document.createElement('div');
        dyk.id = 'did-you-know-panel';
        dyk.style.background = '#fffbeb'; // Match sensor-kit-box background
        dyk.style.border = '2px dashed #fcd34d';
        dyk.style.borderRadius = '20px';
        dyk.style.padding = '15px';
        dyk.style.marginBottom = '15px';
        dyk.style.display = 'block'; // Show by default!
        dyk.style.color = '#b45309';
        dyk.style.fontFamily = "'Nunito', sans-serif";
        dyk.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
        dyk.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <i class="fas fa-lightbulb" style="color: #f59e0b; font-size: 1.5rem;"></i>
                <h4 style="margin: 0; color: #b45309; font-weight: 800; font-size: 1.2rem;">FUN FACT!</h4>
            </div>
            <p id="dyk-text" style="margin: 0; font-size: 1rem; line-height: 1.5; color: #92400e; font-weight: 600;"></p>
        `;
        // Insert right after dashboard header
        const gridContainer = document.getElementById('sensor-cards') || rightPanel.querySelector('.cyber-grid-container');
        if(gridContainer) {
            rightPanel.insertBefore(dyk, gridContainer);
        }
    }
    
    // Update the fact immediately
    setTimeout(updateDidYouKnow, 500); // Give a slight delay to let active-sensor-name populate
}

if (document.readyState === 'loading') {
    console.log("[SCHOOL MODE] Document loading, adding DOMContentLoaded listener");
    document.addEventListener('DOMContentLoaded', injectSchoolUI);
} else {
    console.log("[SCHOOL MODE] Document already loaded, injecting UI directly");
    injectSchoolUI();
}

function updateDidYouKnow() {
    const sensorName = document.getElementById('active-sensor-name')?.innerText;
    const dykPanel = document.getElementById('did-you-know-panel');
    const dykText = document.getElementById('dyk-text');
    
    if (sensorName && dykPanel && dykText) {
        const fact = DID_YOU_KNOW[sensorName] || "Did you know? Sensors are like the electronic eyes and ears of a robot!";
        dykText.innerText = fact;
        dykPanel.style.display = 'block';
    }
}

// Monkey-patching existing functions
setTimeout(() => {
    // Patch Connect
    if (typeof connectPort !== 'undefined') {
        const originalConnect = connectPort;
        window.connectPort = async function() {
            await originalConnect();
            const statusBox = document.getElementById('status-box');
            if(statusBox && !statusBox.classList.contains('disconnected')) {
                playConnectSound();
                updateDidYouKnow();
            }
        };
    }
    
    // Patch Disconnect
    if (typeof disconnectPort !== 'undefined') {
        const originalDisconnect = disconnectPort;
        window.disconnectPort = async function() {
            await originalDisconnect();
            playDisconnectSound();
            // Fun fact stays visible even when disconnected now!
        };
    }
    
    // Hook into electronAPI.onSerialData directly
    if (window.electronAPI && window.electronAPI.onSerialData) {
        window.electronAPI.onSerialData((data) => {
            const statusBox = document.getElementById('status-box');
            const isConnected = statusBox && !statusBox.classList.contains('disconnected');
            if (data && data.trim().length > 0 && isConnected) {
                playDataSound();
                updateGamification();
            }
        });
    }
}, 1000); // wait for renderer.js to load
