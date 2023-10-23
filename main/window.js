const { BrowserWindow, ipcMain } = require("electron")

const path = require("path")

let moveTimer = null

const createMainWin = () => {
    const mainWin = new BrowserWindow({
        minWidth: 100,
        minHeight: 100,
        width: 200,
        height: 200,
        x: 100,
        y: 100,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.resolve(__dirname, "../preload/preload.js"),
        },
    })
    mainWin.loadFile(path.resolve(__dirname, "../index.html"))
    // mainWin.openDevTools()
    mainWin.setAspectRatio(1)
    mainWin.on("move", () => {
        clearTimeout(moveTimer)
        moveTimer = setTimeout(() => {
            mainWin.webContents.send("savePosition", mainWin.getPosition())
        }, 1000)
    })
}

module.exports = createMainWin