const { contextBridge, ipcRenderer, screen } = require("electron")

contextBridge.exposeInMainWorld("api", {
    setScale: (scale) => ipcRenderer.send("set-scale", scale),
    handlePositonChange: (callback) => ipcRenderer.on('savePosition', callback),
    setPosition: (position) => ipcRenderer.send("set-position", position),
    setSize: (size) => ipcRenderer.send("set-size", size)
})