const { ipcMain, BrowserWindow, screen } = require("electron")

ipcMain.on("set-scale", (event, scale) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.setAspectRatio(scale[0] / scale[1])
})
ipcMain.on("set-position", (event, position) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.setPosition(position.x, position.y)
})
ipcMain.on("set-size", (event, size) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.setSize(size.width, size.height)
})
