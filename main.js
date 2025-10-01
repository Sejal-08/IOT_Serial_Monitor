const { app, BrowserWindow, ipcMain, dialog,Menu  } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const fs = require("fs").promises;
const dns = require("dns").promises;

let mainWindow;
let port;
let responseBuffer = "";

/**
 * Send a simple command to the firmware.
 */
async function sendCommand(message) {
  if (!port || !port.isOpen) {
    return { error: "Port not open!" };
  }

  try {
    // Flush UART buffer
    while (port.readable && port.readableLength > 0) {
      port.read();
    }
    const command = message + "\r\n";
    console.log(`Sending command: ${JSON.stringify(command)}`);
    mainWindow.webContents.send("serial-data", `> ${message}`);
    

    await new Promise((resolve, reject) => {
      port.write(command, (err) => (err ? reject(err) : resolve()));
    });

    return `Successfully sent: ${message}`;
  } catch (error) {
    console.error(`Failed to send command "${message}":`, error);
    return { error: `Failed to send data: ${error.message}` };
  }
}

/**
 * Create Electron window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: path.join(__dirname, "build", "icon.ico"), // 👈 add this
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

    Menu.setApplicationMenu(null);

  mainWindow.loadFile("index.html");
}

/**
 * App lifecycle.
 */
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (port && port.isOpen) {
      port.close(() => console.log("Serial port closed."));
    }
    app.quit();
  }
});

/**
 * IPC handlers.
 */
ipcMain.handle("list-ports", async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map((p) => p.path);
  } catch (error) {
    console.error("List ports error:", error);
    return { error: `Failed to list ports: ${error.message}` };
  }
});

ipcMain.handle("connect-port", async (event, portName, baudRate = 115200) => {
  try {
    if (port && port.isOpen) {
      await new Promise((resolve) => port.close(resolve));
    }
    responseBuffer = "";

    port = new SerialPort({
      path: portName,
      baudRate: parseInt(baudRate),
      dataBits: 8,
      parity: "none",
      stopBits: 1,
      autoOpen: false,
    });

    await new Promise((resolve, reject) => {
      port.open((err) => (err ? reject(err) : resolve()));
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    port.on("data", (data) => {
      try {
        const incomingText = data.toString("utf8");
        console.log(`Raw data received: "${incomingText}"`);

        responseBuffer += incomingText;
        let lines = responseBuffer.split(/\r?\n/);
        responseBuffer = lines.pop();

        for (const line of lines) {
          const message = line.trim();
          if (message) {
            console.log(`Processed line: "${message}"`);
            mainWindow.webContents.send("serial-data", message);
          }
        }
      } catch (err) {
        console.error("Error processing serial data:", err);
        mainWindow.webContents.send("serial-data", `Error: ${err.message}`);
      }
    });

    port.on("error", (err) => {
      console.error("Serial port error:", err.message);
      mainWindow.webContents.send("serial-data", `Port error: ${err.message}`);
    });

    return `Connected to ${portName} at ${baudRate} baud`;
  } catch (error) {
    console.error("Connect port error:", error);
    return { error: `Failed to connect to ${portName}: ${error.message}` };
  }
});

ipcMain.handle("disconnect-port", async () => {
  try {
    if (port && port.isOpen) {
      await new Promise((resolve) => port.close(resolve));
      responseBuffer = "";
      return "Disconnected from port.";
    }
    return "No port to disconnect.";
  } catch (error) {
    console.error("Disconnect port error:", error);
    return { error: `Failed to disconnect: ${error.message}` };
  }
});

// --- Device ID Config ---
ipcMain.handle("set-device-id", (event, deviceID) => sendCommand(`SET_DEVICE_ID:${deviceID}`));
// ipcMain.handle("get-device-id", () => sendCommand("GET_DEVICE_ID"));

// --- Basic config commands ---
ipcMain.handle("send-data", (event, message) => sendCommand(message));
ipcMain.handle("get-interval", () => sendCommand("GET_INTERVAL"));


ipcMain.handle("set-interval", (event, interval) => {
  const i = parseInt(interval);
  if (isNaN(i) || i <= 0) return { error: "Invalid interval" };
 return sendCommand(`Interval Configuration : ${i}`);

});
