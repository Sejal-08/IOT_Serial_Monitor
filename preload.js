const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  listPorts: () => ipcRenderer.invoke("list-ports"),
  connectPort: (portName, baudRate) => ipcRenderer.invoke("connect-port", portName, baudRate),
  disconnectPort: () => ipcRenderer.invoke("disconnect-port"),
  sendData: (msg) => ipcRenderer.invoke("send-data", msg),
  setInterval: (interval) => ipcRenderer.invoke("set-interval", interval),
  getInterval: () => ipcRenderer.invoke("get-interval"),
  onSerialData: (callback) => ipcRenderer.on("serial-data", (event, data) => callback(data)),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
 
});