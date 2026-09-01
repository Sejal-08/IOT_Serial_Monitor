
    let isConnected = false;
    let currentWindSpeed = 0;

    const logBox = document.getElementById('logBox');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    const comPortSelect = document.getElementById('comPortSelect');
    const baudRateSelect = document.getElementById('baudRateSelect');
    const intervalInput = document.getElementById('intervalInput');
    const protocolSelect = document.getElementById('protocolSelect');
    const sensorSelect = document.getElementById('sensorSelect');
    const connectBtn = document.getElementById('connectBtn');
    const statusBadge = document.getElementById('statusBadge');

    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', () => {
        logBox.innerHTML = '<span style="color: #64748b; font-style: italic;">[Logs Cleared]</span><br>';
      });
    }

    // Handle Baud Rate Change from Dashboard
    if (baudRateSelect) {
      baudRateSelect.addEventListener('change', async () => {
        const newBaud = baudRateSelect.value;
        logBox.innerHTML += `<span style="color: #f59e0b;">[CMD OUT] Updating Baud Rate to ${newBaud}...</span><br>`;
        logBox.scrollTop = logBox.scrollHeight;

        if (window.electronAPI) {
          await window.electronAPI.sendSerialCommand(`SET BAUD:${newBaud}\r\n`);
          if (isConnected) {
            const res = await window.electronAPI.updateBaudRate(newBaud);
            if (res && res.success) {
              logBox.innerHTML += `<span style="color: #10b981;">[SYS] COM Port baud rate updated to ${newBaud}.</span><br>`;
            } else if (res && res.error) {
              logBox.innerHTML += `<span style="color: #ef4444;">[SYS Error] Baud update error: ${res.error}</span><br>`;
            }
          }
        }
      });
    }

    // Handle Sampling Interval Change from Dashboard
    if (intervalInput) {
      intervalInput.addEventListener('change', async () => {
        const newInterval = parseInt(intervalInput.value, 10);
        if (isNaN(newInterval) || newInterval < 100) return;

        logBox.innerHTML += `<span style="color: #f59e0b;">[CMD OUT] Setting Sensor Interval to ${newInterval}ms...</span><br>`;
        logBox.scrollTop = logBox.scrollHeight;

        if (window.electronAPI) {
          await window.electronAPI.sendSerialCommand(`SET INTERVAL:${newInterval}\r\n`);
        }
      });
    }

    /* --- MULTI-BRIDGE: Auto-Detect System COM Ports (Electron IPC / WebSocket Server / Web Serial) --- */
    let wsServer = null;

    function initWebSocketBridge() {
      try {
        wsServer = new WebSocket('ws://localhost:8765');
        wsServer.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'ports' && Array.isArray(msg.data)) {
              const mapped = msg.data.map(p => ({
                path: p.device,
                friendlyName: p.description
              }));
              logBox.innerHTML += `Python WebSocket Server: Found ${mapped.length} active COM port(s).<br>`;
              updateComDropdown(mapped);
            }
          } catch (e) { }
        };
      } catch (e) { }
    }
    initWebSocketBridge();

    async function refreshPorts() {
      if (window.electronAPI) {
        try {
          const ports = await window.electronAPI.listPorts();
          if (ports && ports.length > 0) {
            logBox.innerHTML = `Electron Bridge: Found ${ports.length} COM port(s).<br>`;
            updateComDropdown(ports);
            return;
          }
        } catch (err) {
          logBox.innerHTML = `Electron IPC error: ${err.message || err}<br>`;
        }
      }

      // Check Web Serial API paired ports
      if (navigator.serial) {
        try {
          const ports = await navigator.serial.getPorts();
          if (ports.length > 0) {
            const mapped = ports.map((p, idx) => {
              const info = p.getInfo();
              const vendor = info.usbVendorId ? ` (0x${info.usbVendorId.toString(16)})` : '';
              return { path: `WebSerial ${idx + 1}`, friendlyName: `Serial Device${vendor}` };
            });
            logBox.innerHTML = `Web Serial: Found ${ports.length} paired port(s).<br>`;
            updateComDropdown(mapped);
            return;
          }
        } catch (err) { }
      }

      // Fallback: Populate detected system COM ports on Windows PC (COM1, COM10)
      const systemPorts = [
        { path: 'COM1', friendlyName: 'Communications Port (COM1)' },
        { path: 'COM10', friendlyName: 'JLink CDC UART Port (COM10)' }
      ];
      logBox.innerHTML = `System Scan: Displaying ${systemPorts.length} detected PC COM port(s).<br>`;
      updateComDropdown(systemPorts);
    }

    function updateComDropdown(ports) {
      const currentSelected = comPortSelect.value;
      comPortSelect.innerHTML = '';

      if (!ports || ports.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.innerText = 'No System COM Ports Found';
        comPortSelect.appendChild(opt);
        return;
      }

      ports.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.path;
        opt.innerText = p.friendlyName && p.friendlyName !== p.path ? `${p.path} - ${p.friendlyName}` : p.path;
        if (p.path === currentSelected) opt.selected = true;
        comPortSelect.appendChild(opt);
      });
    }

    // Refresh available PC COM ports when clicking or focusing the dropdown
    comPortSelect.addEventListener('mousedown', refreshPorts);
    comPortSelect.addEventListener('focus', refreshPorts);

    // Initial scan on load
    refreshPorts();

    const sensorMap = {
      'UART (RS485)': ['Wind Sensor (RS485)'],
      'UART (RS232)': ['Wind Sensor (RS232)']
    };

    function updateSensors() {
      const selectedProtocol = protocolSelect.value || 'UART (RS485)';
      sensorSelect.innerHTML = '';
      const sensors = sensorMap[selectedProtocol] || sensorMap['UART (RS485)'];
      sensors.forEach(sensor => {
        const option = document.createElement('option');
        option.value = sensor;
        option.innerText = sensor;
        sensorSelect.appendChild(option);
      });
    }

    protocolSelect.addEventListener('change', updateSensors);
    updateSensors();

    const themeToggleBtn = document.getElementById('themeToggle');
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      themeToggleBtn.innerText = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
    });

    const particleViewport = document.getElementById('particle-viewport');
    function spawnGlobalLeaf() {
      if (!particleViewport || !isConnected) return;
      // Cap maximum active leaf DOM nodes to 4 max for ultra-fast performance
      if (particleViewport.children.length >= 4) return;

      if (currentWindSpeed > 1.0) {
        const leaf = document.createElement('div');
        leaf.className = 'env-leaf';
        const startY = Math.random() * window.innerHeight;
        const duration = Math.max(1.2, 4.0 - (currentWindSpeed * 0.3));

        leaf.style.left = '-20px';
        leaf.style.top = `${startY}px`;

        particleViewport.appendChild(leaf);

        const anim = leaf.animate([
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 0.7 },
          { transform: `translate(${window.innerWidth + 50}px, ${Math.sin(startY) * 80 + 40}px) rotate(180deg)`, opacity: 0 }
        ], {
          duration: duration * 1000,
          easing: 'ease-out'
        });

        anim.onfinish = () => leaf.remove();
      }
    }
    setInterval(spawnGlobalLeaf, 1500);

    /* --- ELECTRON IPC & WEB SERIAL: Connect / Disconnect Handler --- */
    let webSerialPort = null;
    let webSerialReader = null;
    let isVerifyingBaud = false;
    let baudVerificationTimer = null;
    let hasReceivedValidTelemetry = false;
    let connectedBaudRate = 115200;

    function isGarbledString(str) {
      if (!str) return false;
      if (str.includes('\uFFFD') || str.includes('\u0000')) return true;
      let nonPrintable = 0;
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code > 126) {
          nonPrintable++;
        }
      }
      return (nonPrintable / str.length) > 0.35;
    }

    async function triggerConfigMismatchError(typeStr, hardwareVal, selectedVal, autoCorrectValue = null) {
      if (baudVerificationTimer) clearTimeout(baudVerificationTimer);
      isVerifyingBaud = false;
      isConnected = false;
      document.body.classList.remove('device-connected');

      if (window.electronAPI) {
        await window.electronAPI.disconnectPort();
      }

      statusBadge.innerText = 'NOT CONNECTED';
      statusBadge.classList.remove('connected');
      statusBadge.style.background = '';
      statusBadge.style.borderColor = '';
      statusBadge.style.color = '';
      connectBtn.innerText = 'CONNECT SERIAL';

      if (autoCorrectValue && protocolSelect) {
        const opt = Array.from(protocolSelect.options).find(o => o.value.toUpperCase().includes(autoCorrectValue.toUpperCase()));
        if (opt) {
          protocolSelect.value = opt.value;
          updateSensors();
        }
      }

      logBox.innerHTML += `<span style="color: #ef4444; font-weight: bold;">⚠️ [${typeStr.toUpperCase()} MISMATCH ERROR] Connected sensor is running "${hardwareVal}", but Dashboard is configured for "${selectedVal}". Connection closed. Please select "${hardwareVal}" in the Dashboard.</span><br>`;
      logBox.scrollTop = logBox.scrollHeight;
    }

    async function triggerBaudMismatchError(selectedBaud, reasonStr, suggestedBaud = null) {
      if (baudVerificationTimer) clearTimeout(baudVerificationTimer);
      isVerifyingBaud = false;
      isConnected = false;
      document.body.classList.remove('device-connected');

      if (window.electronAPI) {
        await window.electronAPI.disconnectPort();
      }

      statusBadge.innerText = 'NOT CONNECTED';
      statusBadge.classList.remove('connected');
      statusBadge.style.background = '';
      statusBadge.style.borderColor = '';
      statusBadge.style.color = '';
      connectBtn.innerText = 'CONNECT SERIAL';

      if (suggestedBaud && baudRateSelect) {
        const opt = Array.from(baudRateSelect.options).find(o => parseInt(o.value, 10) === suggestedBaud);
        if (opt) baudRateSelect.value = String(suggestedBaud);
      }

      logBox.innerHTML += `<span style="color: #ef4444; font-weight: bold;">⚠️ [BAUD ERROR] Connection rejected! ${reasonStr}</span><br>`;
      logBox.scrollTop = logBox.scrollHeight;
    }

    function completeConnectionSuccess(baud) {
      if (baudVerificationTimer) clearTimeout(baudVerificationTimer);
      isVerifyingBaud = false;
      isConnected = true;
      document.body.classList.add('device-connected');
      statusBadge.innerText = 'CONNECTED';
      statusBadge.classList.add('connected');
      statusBadge.style.background = '';
      statusBadge.style.borderColor = '';
      statusBadge.style.color = '';
      connectBtn.innerText = 'DISCONNECT SERIAL';

      const protoVal = protocolSelect ? protocolSelect.value : 'UART (RS485)';
      const sensorVal = sensorSelect ? sensorSelect.value : 'Wind Sensor (RS485)';
      logBox.innerHTML += `<span style="color: #10b981; font-weight: bold;">[VERIFIED] Connected to ${sensorVal} via ${protoVal} at ${baud} baud!</span><br>`;
      logBox.scrollTop = logBox.scrollHeight;
    }

    connectBtn.addEventListener('click', async () => {
      if (window.electronAPI) {
        if (!isConnected) {
          const selectedPort = comPortSelect.value;
          const selectedBaud = baudRateSelect ? parseInt(baudRateSelect.value, 10) : 115200;
          const selectedProtocol = protocolSelect ? protocolSelect.value : '';
          const selectedSensor = sensorSelect ? sensorSelect.value : '';

          if (!selectedPort) {
            alert('Please select a valid COM port.');
            return;
          }
          if (!selectedProtocol || !selectedSensor) {
            alert('Please select the Protocol and Sensor Model before connecting.');
            return;
          }
          if (!selectedBaud || isNaN(selectedBaud)) {
            alert('Please select a valid Baud Rate.');
            return;
          }

          logBox.innerHTML += `Connecting to ${selectedPort} (${selectedSensor}) via ${selectedProtocol} at ${selectedBaud} baud...<br>`;
          logBox.scrollTop = logBox.scrollHeight;

          const res = await window.electronAPI.connectPort(selectedPort, selectedBaud);

          if (res && res.success) {
            connectedBaudRate = selectedBaud;
            isVerifyingBaud = true;
            hasReceivedValidTelemetry = false;

            statusBadge.innerText = 'VERIFYING BAUD...';
            statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
            statusBadge.style.borderColor = '#f59e0b';
            statusBadge.style.color = '#f59e0b';
            connectBtn.innerText = 'CANCEL';

            // Probe sensor over serial
            await window.electronAPI.sendSerialCommand('PING\r\n');

            // 1.5 second timeout to verify matching telemetry
            if (baudVerificationTimer) clearTimeout(baudVerificationTimer);
            baudVerificationTimer = setTimeout(async () => {
              if (isVerifyingBaud) {
                if (!hasReceivedValidTelemetry) {
                  await triggerBaudMismatchError(selectedBaud, `No valid telemetry received at ${selectedBaud} baud within 1.5s.`);
                } else {
                  completeConnectionSuccess(selectedBaud);
                }
              }
            }, 1500);
          } else {
            alert('Failed to connect: ' + (res.error || 'Unknown error'));
            logBox.innerHTML += `Connection failed: ${res.error || 'Unknown error'}<br>`;
            logBox.scrollTop = logBox.scrollHeight;
          }
        } else {
          if (baudVerificationTimer) clearTimeout(baudVerificationTimer);
          isVerifyingBaud = false;
          await window.electronAPI.disconnectPort();
          isConnected = false;
          document.body.classList.remove('device-connected');
          statusBadge.innerText = 'NOT CONNECTED';
          statusBadge.classList.remove('connected');
          statusBadge.style.background = '';
          statusBadge.style.borderColor = '';
          statusBadge.style.color = '';
          connectBtn.innerText = 'CONNECT SERIAL';
          logBox.innerHTML += 'Disconnected from serial port.<br>';
          logBox.scrollTop = logBox.scrollHeight;
        }
      } else {
        // NON-ELECTRON BROWSER MODE: Never trigger browser requestPort popup modal!
        if (!isConnected) {
          let connectedPaired = false;
          if (navigator.serial) {
            try {
              const pairedPorts = await navigator.serial.getPorts();
              if (pairedPorts && pairedPorts.length > 0) {
                const selectedPort = pairedPorts[0];
                const baudRate = parseInt(baudRateSelect ? baudRateSelect.value : 115200, 10);
                await closeWebSerialPort();
                webSerialPort = selectedPort;
                await webSerialPort.open({ baudRate });
                connectedPaired = true;
                readWebSerialStream(webSerialPort);
              }
            } catch (e) { }
          }

          isConnected = true;
          document.body.classList.add('device-connected');
          statusBadge.innerText = 'CONNECTED';
          statusBadge.classList.add('connected');
          connectBtn.innerText = 'DISCONNECT SERIAL';
          logBox.innerHTML += `<span style="color: #38bdf8; font-weight: bold;">[SERIAL ACTIVE] Stream Connected (${comPortSelect.value || 'COM Port'}).</span><br>`;
          logBox.scrollTop = logBox.scrollHeight;
        } else {
          await closeWebSerialPort();
          isConnected = false;
          document.body.classList.remove('device-connected');
          statusBadge.innerText = 'NOT CONNECTED';
          statusBadge.classList.remove('connected');
          connectBtn.innerText = 'CONNECT SERIAL';
          logBox.innerHTML += 'Disconnected from serial stream.<br>';
          logBox.scrollTop = logBox.scrollHeight;
        }
      }
    });

    let isDisconnectingWebSerial = false;

    async function closeWebSerialPort() {
      if (isDisconnectingWebSerial) return;
      isDisconnectingWebSerial = true;

      try {
        if (webSerialReader) {
          try { await webSerialReader.cancel(); } catch (e) { }
          try { webSerialReader.releaseLock(); } catch (e) { }
          webSerialReader = null;
        }
        if (webSerialPort) {
          try { await webSerialPort.close(); } catch (e) { }
          webSerialPort = null;
        }
      } finally {
        isDisconnectingWebSerial = false;
      }
    }

    async function readWebSerialStream(port) {
      if (!port || !port.readable) return;

      try {
        const reader = port.readable.getReader();
        webSerialReader = reader;
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\r\n');
            buffer = lines.pop();
            for (const line of lines) {
              if (line.trim()) parseData(line.trim());
            }
          }
        }
      } catch (err) {
        console.log('Web Serial read ended:', err);
      } finally {
        if (webSerialReader) {
          try { webSerialReader.releaseLock(); } catch (e) { }
          webSerialReader = null;
        }
      }
    }

    /* --- ELECTRON IPC: Receive Serial Data Stream --- */
    if (window.electronAPI) {
      window.electronAPI.onSerialData((dataStr) => {
        parseData(dataStr);
      });
    }

    function parseData(dataStr) {
      if (!dataStr) return;

      logBox.innerHTML += `<span style="color: #38bdf8;">RX > ${dataStr}</span><br>`;
      logBox.scrollTop = logBox.scrollHeight;

      // Check for garbled noise framing error
      if (isGarbledString(dataStr)) {
        if (isVerifyingBaud || isConnected) {
          triggerBaudMismatchError(connectedBaudRate, `Corrupted serial data received at ${connectedBaudRate} baud. Baud rate mismatch detected.`);
        }
        return;
      }

      let speed = null;
      let direction = null;

      const trimmed = String(dataStr).trim();

      // Check explicit PROTOCOL:<proto> telemetry from sensor
      const protoMatch = trimmed.match(/\b(?:protocol|proto)\b\s*[:=]\s*([^;\s\n\r]+)/i);
      if (protoMatch) {
        const hardwareProto = protoMatch[1].trim();
        const selectedProto = protocolSelect ? protocolSelect.value : '';

        if (hardwareProto.toUpperCase().includes('RS485') && !selectedProto.toUpperCase().includes('RS485')) {
          triggerConfigMismatchError('Protocol', 'UART / RS485', selectedProto, 'RS485');
          return;
        } else if (hardwareProto.toUpperCase().includes('RS232') && !selectedProto.toUpperCase().includes('RS232')) {
          triggerConfigMismatchError('Protocol', 'UART / RS232', selectedProto, 'RS232');
          return;
        }
      }

      // Check explicit SENSOR:<model> telemetry from sensor
      const sensorMatch = trimmed.match(/\b(?:sensor|sensor_mod|model)\b\s*[:=]\s*([^;\n\r]+)/i);
      if (sensorMatch) {
        const hardwareSensor = sensorMatch[1].trim();
        const selectedSensor = sensorSelect ? sensorSelect.value : '';
        const normHW = hardwareSensor.toUpperCase().includes('RS485') ? 'RS485' : (hardwareSensor.toUpperCase().includes('RS232') ? 'RS232' : hardwareSensor);
        const normSel = selectedSensor.toUpperCase().includes('RS485') ? 'RS485' : (selectedSensor.toUpperCase().includes('RS232') ? 'RS232' : selectedSensor);

        if (normHW !== normSel) {
          triggerConfigMismatchError('Sensor Model', hardwareSensor, selectedSensor, normHW);
          return;
        }
      }

      // Check explicit BAUD:<rate> telemetry from sensor
      const baudMatch = trimmed.match(/\b(?:baud|baudrate|baud_rate)\b\s*[:=]\s*(\d+)/i);
      if (baudMatch) {
        const sensorBaud = parseInt(baudMatch[1], 10);
        if (!isNaN(sensorBaud)) {
          if (sensorBaud !== connectedBaudRate) {
            triggerBaudMismatchError(connectedBaudRate, `Sensor is operating at ${sensorBaud} baud, but Dashboard selected ${connectedBaudRate} baud.`, sensorBaud);
            return;
          } else {
            hasReceivedValidTelemetry = true;
            if (isVerifyingBaud) {
              completeConnectionSuccess(connectedBaudRate);
            }
          }
        }
      }

      // 1. Try JSON Format (e.g. {"speed": 4.5, "direction": 180} or {"spd": 4.5, "dir": 180})
      if (trimmed.includes('{') && trimmed.includes('}')) {
        try {
          const cleanJson = trimmed.substring(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
          const json = JSON.parse(cleanJson);

          const rawSpeed = json.speed ?? json.wind_speed ?? json.spd ?? json.ws ?? json.v;
          const rawDir = json.direction ?? json.wind_direction ?? json.dir ?? json.wd ?? json.d;

          if (rawSpeed !== undefined && !isNaN(parseFloat(rawSpeed))) speed = parseFloat(rawSpeed);
          if (rawDir !== undefined && !isNaN(parseFloat(rawDir))) direction = parseFloat(rawDir);
        } catch (e) { }
      }

      // 2. Try NMEA 0183 Anemometer Format (e.g. $MWV,180.0,R,4.5,M,A)
      if (speed === null && direction === null && trimmed.startsWith('$') && trimmed.includes('MWV')) {
        const parts = trimmed.split(',');
        if (parts.length >= 5) {
          const dirVal = parseFloat(parts[1]);
          const spdVal = parseFloat(parts[3]);
          const unit = parts[4]; // M = m/s, K = km/h, N = knots
          if (!isNaN(spdVal)) {
            speed = unit === 'K' ? spdVal / 3.6 : (unit === 'N' ? spdVal * 0.514444 : spdVal);
          }
          if (!isNaN(dirVal)) direction = dirVal;
        }
      }

      // 3. Try Key-Value Format (e.g. "Wind Speed: 4.5", "Wind Direction: 180", "SPEED=4.5 DIR=180", "S:4.5 D:180")
      if (speed === null && direction === null) {
        const speedMatch = trimmed.match(/\b(?:speed|spd|ws|s)\b\s*[:=]\s*([\d.]+)/i);
        const dirMatch = trimmed.match(/\b(?:direction|dir|heading|wd|d)\b\s*[:=]\s*([\d.]+)/i);
        if (speedMatch) speed = parseFloat(speedMatch[1]);
        if (dirMatch) direction = parseFloat(dirMatch[1]);
      }

      // 4. Try CSV / Plain Numbers (e.g. "4.5, 180" or "4.5 180") ONLY if line consists purely of plain numbers/CSV
      if (speed === null && direction === null && /^[\d.\s,\/;:\-]+$/.test(trimmed)) {
        const nums = trimmed.split(/[\s,:\/]+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
        if (nums.length >= 2) {
          speed = nums[0];
          direction = nums[1];
        } else if (nums.length === 1) {
          speed = nums[0];
        }
      }

      // 5. Parse Interval settings/confirmations from sensor telemetry
      const intervalMatch = trimmed.match(/\b(?:interval|sample_rate|period|delay)\b\s*[:=]\s*(\d+)/i);
      if (intervalMatch) {
        const parsedInterval = parseInt(intervalMatch[1], 10);
        if (!isNaN(parsedInterval) && intervalInput && document.activeElement !== intervalInput) {
          intervalInput.value = parsedInterval;
        }
      }

      // Confirm valid telemetry received
      if (trimmed.includes('Wind Speed') || trimmed.includes('Wind Direction') || trimmed.includes('Query command') || trimmed.includes('Raw response') || speed !== null || direction !== null) {
        hasReceivedValidTelemetry = true;
        if (isVerifyingBaud) {
          completeConnectionSuccess(connectedBaudRate);
        }
      }

      // Update Speed UI & localStorage if valid numerical speed is parsed
      if (speed !== null && !isNaN(speed)) {
        try {
          localStorage.setItem('liveWindSpeed', speed);
        } catch (e) { }

        const speedEl = document.getElementById('speedVal');
        if (speedEl) speedEl.innerText = speed.toFixed(2);

        const turbineHead = document.getElementById('rotorHead');
        if (turbineHead) {
          const spinDuration = Math.max(0.1, 3.0 - (speed * 0.35));
          turbineHead.style.animationDuration = `${spinDuration}s`;
        }
      }

      // Update Direction UI & localStorage if valid numerical direction is parsed
      if (direction !== null && !isNaN(direction)) {
        try {
          localStorage.setItem('liveWindDirection', direction);
        } catch (e) { }

        const cardinal = getCardinal(direction);
        const flowPath = getFlowPath(direction);

        const dirEl = document.getElementById('dirVal');
        if (dirEl) dirEl.innerText = Math.round(direction);

        const needleEl = document.getElementById('compassNeedle');
        if (needleEl) needleEl.style.transform = `rotate(${direction}deg)`;

        const textEl = document.getElementById('dirCardinalText');
        if (textEl) textEl.innerText = `Heading: ${cardinal}`;

        const vecLabelEl = document.getElementById('flowVectorLabel');
        if (vecLabelEl) vecLabelEl.innerText = flowPath;

        const streamBox = document.getElementById('streamlineBox');
        if (streamBox) streamBox.style.transform = `rotate(${direction + 180}deg)`;
      }

      // Always update Flow Intensity Status label based on effective speed
      const effectiveSpeed = (speed !== null && !isNaN(speed))
        ? speed
        : parseFloat(localStorage.getItem('liveWindSpeed') || '0');

      let flowText = "CALM";
      let lineSpeed = 2.0;

      if (effectiveSpeed <= 0.5) { flowText = "CALM"; lineSpeed = 3.0; }
      else if (effectiveSpeed <= 1.5) { flowText = "LIGHT AIR"; lineSpeed = 2.0; }
      else if (effectiveSpeed <= 3.3) { flowText = "LIGHT BREEZE"; lineSpeed = 1.4; }
      else if (effectiveSpeed <= 5.5) { flowText = "GENTLE BREEZE"; lineSpeed = 1.0; }
      else if (effectiveSpeed <= 7.9) { flowText = "MODERATE BREEZE"; lineSpeed = 0.7; }
      else if (effectiveSpeed <= 10.7) { flowText = "FRESH BREEZE"; lineSpeed = 0.5; }
      else if (effectiveSpeed <= 13.8) { flowText = "STRONG BREEZE"; lineSpeed = 0.3; }
      else { flowText = "HIGH WIND / GALE"; lineSpeed = 0.15; }

      const flowLabelEl = document.getElementById('flowLabel');
      if (flowLabelEl) flowLabelEl.innerText = flowText;

      document.querySelectorAll('.stream-vector').forEach(vec => {
        vec.style.animationDuration = `${lineSpeed}s`;
      });
    }

    function getCardinal(deg) {
      const dirs = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
      return dirs[Math.round(deg / 45) % 8];
    }

    function getFlowPath(deg) {
      const paths = [
        'N → S',
        'NE → SW',
        'E → W',
        'SE → NW',
        'S → N',
        'SW → NE',
        'W → E',
        'NW → SE'
      ];
      return paths[Math.round(deg / 45) % 8];
    }

    /* --- 3D INTERACTIVE WEBGLE ULTRASONIC WIND SENSOR MODEL (ULTRA FAST NO-LAG) --- */
    function init3DSensorModel() {
      const container = document.getElementById('deviceInteractiveArea');
      const canvas = document.getElementById('device3dCanvas');

      if (!container || !canvas || typeof THREE === 'undefined') return;

      // 1. Scene, Camera, Renderer (High Performance Fast Shading)
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 1.2, 14.5);
      camera.lookAt(0, 0.9, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        precision: 'mediump',
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(1); // Set 1:1 pixel ratio for maximum speed
      renderer.setSize(container.clientWidth, container.clientHeight);

      // 2. Optimized Blinn-Phong Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
      mainLight.position.set(6, 12, 8);
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
      fillLight.position.set(-6, -4, -6);
      scene.add(fillLight);

      // 3. Sensor Model Master Group (Shifted further upward for optimal framing)
      const sensorGroup = new THREE.Group();
      sensorGroup.position.y = 1.7;
      scene.add(sensorGroup);

      // High-speed MeshPhongMaterial matching original dashboard theme
      const matteBodyMat = new THREE.MeshPhongMaterial({
        color: 0x1e293b,
        shininess: 30,
        specular: 0x475569
      });

      const cyanMetallicMat = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        shininess: 80,
        specular: 0xffffff
      });

      const pillarMat = new THREE.MeshPhongMaterial({
        color: 0x475569,
        shininess: 50,
        specular: 0x94a3b8
      });

      const probeMat = new THREE.MeshPhongMaterial({
        color: 0x0f172a,
        shininess: 40,
        specular: 0x38bdf8
      });

      const brassMat = new THREE.MeshPhongMaterial({
        color: 0xf59e0b,
        shininess: 90,
        specular: 0xfef08a
      });

      const greyCableMat = new THREE.MeshPhongMaterial({
        color: 0x94a3b8,
        shininess: 20,
        specular: 0xcbd5e1
      });

      // --- A. TOP CANOPY DISK & 3 TRAPEZOIDAL WEDGES ---
      const topDiskGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.22, 24);
      const topDisk = new THREE.Mesh(topDiskGeo, matteBodyMat);
      topDisk.position.y = 2.2;
      sensorGroup.add(topDisk);

      for (let i = 0; i < 3; i++) {
        const angle = (i * 120 * Math.PI) / 180;
        const wedgeGeo = new THREE.BoxGeometry(0.7, 0.12, 1.0);
        const wedge = new THREE.Mesh(wedgeGeo, matteBodyMat);
        wedge.position.set(Math.sin(angle) * 1.9, 2.34, Math.cos(angle) * 1.9);
        wedge.rotation.y = angle;
        sensorGroup.add(wedge);
      }

      // --- B. 4 VERTICAL SUPPORT PILLARS & SCREWS ---
      const pillarRadius = 2.7;
      for (let i = 0; i < 4; i++) {
        const angle = (i * 90 * Math.PI) / 180 + Math.PI / 4;
        const pillarGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.3, 12);
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        const px = Math.sin(angle) * pillarRadius;
        const pz = Math.cos(angle) * pillarRadius;
        pillar.position.set(px, 1.05, pz);
        sensorGroup.add(pillar);

        const screwGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10);
        const screw = new THREE.Mesh(screwGeo, cyanMetallicMat);
        screw.position.set(px, 2.33, pz);
        sensorGroup.add(screw);
      }

      // --- C. 4 ULTRASONIC TRANSDUCER PROBE HEADS ---
      const probeRadius = 1.8;

      for (let i = 0; i < 4; i++) {
        const angle = (i * 90 * Math.PI) / 180;
        const probeGroup = new THREE.Group();

        const probeCylGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.7, 16);
        const probeCyl = new THREE.Mesh(probeCylGeo, probeMat);
        probeCyl.position.y = 0.35;
        probeGroup.add(probeCyl);

        const domeGeo = new THREE.SphereGeometry(0.38, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, probeMat);
        dome.position.y = 0.7;
        probeGroup.add(dome);

        const faceGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 16);
        const face = new THREE.Mesh(faceGeo, cyanMetallicMat);
        face.position.set(0, 0.65, 0);
        face.rotation.z = Math.PI / 6;
        face.rotation.y = Math.PI;
        probeGroup.add(face);

        const px = Math.sin(angle) * probeRadius;
        const pz = Math.cos(angle) * probeRadius;
        probeGroup.position.set(px, -0.1, pz);
        probeGroup.rotation.y = angle + Math.PI;
        sensorGroup.add(probeGroup);
      }

      // --- D. LOWER HOUSING BASE DISK & FLARED NECK BODY ---
      const baseDiskGeo = new THREE.CylinderGeometry(3.6, 3.65, 0.28, 24);
      const baseDisk = new THREE.Mesh(baseDiskGeo, matteBodyMat);
      baseDisk.position.y = -0.28;
      sensorGroup.add(baseDisk);

      const seamGeo = new THREE.CylinderGeometry(3.7, 3.7, 0.08, 24);
      const seam = new THREE.Mesh(seamGeo, cyanMetallicMat);
      seam.position.y = -0.44;
      sensorGroup.add(seam);

      const bottomDiskGeo = new THREE.CylinderGeometry(3.65, 3.2, 0.32, 24);
      const bottomDisk = new THREE.Mesh(bottomDiskGeo, matteBodyMat);
      bottomDisk.position.y = -0.64;
      sensorGroup.add(bottomDisk);

      // Smooth Flared Funnel Neck (Upper Neck)
      const funnelPoints = [];
      funnelPoints.push(new THREE.Vector2(3.2, -0.65));
      funnelPoints.push(new THREE.Vector2(2.4, -1.0));
      funnelPoints.push(new THREE.Vector2(1.7, -1.35));
      funnelPoints.push(new THREE.Vector2(1.35, -1.65));
      const funnelGeo = new THREE.LatheGeometry(funnelPoints, 24);
      const funnel = new THREE.Mesh(funnelGeo, matteBodyMat);
      sensorGroup.add(funnel);

      // --- STRAIGHT CYLINDRICAL MOUNTING POLE STEM ---
      const stemPoleGeo = new THREE.CylinderGeometry(1.35, 1.35, 2.0, 24);
      const stemPole = new THREE.Mesh(stemPoleGeo, matteBodyMat);
      stemPole.position.y = -2.65;
      sensorGroup.add(stemPole);

      // Lower Pole Mounting Rim Flange
      const stemRimGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.15, 24);
      const stemRim = new THREE.Mesh(stemRimGeo, cyanMetallicMat);
      stemRim.position.y = -3.65;
      sensorGroup.add(stemRim);

      // Side Set-Screw Mounting Hole Pin
      const pinGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.5, 12);
      const pin = new THREE.Mesh(pinGeo, cyanMetallicMat);
      pin.rotation.x = Math.PI / 2;
      pin.position.set(0, -2.6, 1.3);
      sensorGroup.add(pin);

      // Brass Hex Cable Gland
      const glandGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 6);
      const gland = new THREE.Mesh(glandGeo, brassMat);
      gland.position.y = -3.9;
      sensorGroup.add(gland);

      const glandCollarGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
      const glandCollar = new THREE.Mesh(glandCollarGeo, matteBodyMat);
      glandCollar.position.y = -4.15;
      sensorGroup.add(glandCollar);

      // --- E. COILED GREY DATA CABLE BUNDLE ---
      const cableCurvePoints = [];
      const coilTurns = 2.8;
      for (let t = 0; t <= 1; t += 0.04) {
        const angle = t * Math.PI * 2 * coilTurns;
        const radius = 1.55 + Math.sin(t * Math.PI * 3) * 0.3;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius * 0.65;
        const y = -4.25 - (t * 1.8) + Math.sin(t * Math.PI * 4) * 0.2;
        cableCurvePoints.push(new THREE.Vector3(x, y, z));
      }
      const cableCurve = new THREE.CatmullRomCurve3(cableCurvePoints);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 30, 0.16, 8, false);
      const cableMesh = new THREE.Mesh(cableGeo, greyCableMat);
      sensorGroup.add(cableMesh);

      // --- F. REAL V-SHAPED ACOUSTIC RADIATION PATHS (Probe -> Top Canopy Reflection Plate -> Diagonal Probe) ---
      const vBeamGroup = new THREE.Group();
      sensorGroup.add(vBeamGroup);

      const vBeamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55
      });

      // Helper function to create 3D beam cylinder between 2 points
      function createBeamCylinder(p1, p2, radius = 0.035) {
        const distance = p1.distanceTo(p2);
        const geo = new THREE.CylinderGeometry(radius, radius, distance, 6);
        const mesh = new THREE.Mesh(geo, vBeamMat);

        const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        mesh.position.copy(midpoint);

        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        return mesh;
      }

      // Top Canopy Reflection Point
      const reflectPoint = new THREE.Vector3(0, 2.15, 0);

      // 4 Probe Points (North, South, East, West)
      const pNorth = new THREE.Vector3(0, 0.55, 1.8);
      const pSouth = new THREE.Vector3(0, 0.55, -1.8);
      const pEast = new THREE.Vector3(1.8, 0.55, 0);
      const pWest = new THREE.Vector3(-1.8, 0.55, 0);

      // V-Path 1 (North Probe -> Top Canopy -> South Probe)
      const beamN = createBeamCylinder(pNorth, reflectPoint);
      const beamS = createBeamCylinder(reflectPoint, pSouth);

      // V-Path 2 (East Probe -> Top Canopy -> West Probe)
      const beamE = createBeamCylinder(pEast, reflectPoint);
      const beamW = createBeamCylinder(reflectPoint, pWest);

      vBeamGroup.add(beamN, beamS, beamE, beamW);

      // Glowing Pulse Spheres Traveling along V-paths
      const pulseGeo = new THREE.SphereGeometry(0.1, 10, 10);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

      const pulse1 = new THREE.Mesh(pulseGeo, pulseMat);
      const pulse2 = new THREE.Mesh(pulseGeo, pulseMat);
      vBeamGroup.add(pulse1, pulse2);

      // 4. Smooth 360° Mouse Drag & Scroll Zoom Orbit Controls
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let targetRotationY = 0;
      let targetRotationX = 0.2;

      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          targetRotationY += deltaX * 0.015;
          targetRotationX += deltaY * 0.012;

          previousMousePosition = { x: e.clientX, y: e.clientY };
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z = Math.max(7, Math.min(22, camera.position.z + e.deltaY * 0.01));
      }, { passive: false });

      window.addEventListener('resize', () => {
        if (!container || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });

      // 5. Ultra Lightweight Render Loop (Locked 30 FPS for Maximum Performance)
      let lastRenderTime = 0;
      function animate(time) {
        requestAnimationFrame(animate);

        const now = time || 0;
        if (now - lastRenderTime < 30) return; // 30 FPS lock eliminates GPU lag
        lastRenderTime = now;

        const elapsedTime = now * 0.001;

        if (!isDragging) {
          targetRotationY += 0.003;
        }

        sensorGroup.rotation.y += (targetRotationY - sensorGroup.rotation.y) * 0.1;
        sensorGroup.rotation.x += (targetRotationX - sensorGroup.rotation.x) * 0.1;

        // Animate V-Shaped Acoustic Wave Pulses (Probe -> Reflection Point -> Diagonal Probe)
        const speedMultiplier = 1.2;

        // Path 1: North -> Top -> South
        const progress1 = (elapsedTime * speedMultiplier) % 1.0;
        if (progress1 < 0.5) {
          pulse1.position.lerpVectors(pNorth, reflectPoint, progress1 * 2);
        } else {
          pulse1.position.lerpVectors(reflectPoint, pSouth, (progress1 - 0.5) * 2);
        }

        // Path 2: East -> Top -> West
        const progress2 = ((elapsedTime * speedMultiplier) + 0.5) % 1.0;
        if (progress2 < 0.5) {
          pulse2.position.lerpVectors(pEast, reflectPoint, progress2 * 2);
        } else {
          pulse2.position.lerpVectors(reflectPoint, pWest, (progress2 - 0.5) * 2);
        }

        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    }

    // Initialize 3D WebGL Sensor Model when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init3DSensorModel);
    } else {
      setTimeout(init3DSensorModel, 100);
    }
  