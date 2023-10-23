const { app } = require("electron")
require("./events")
const createMainWin = require("./window")
const createTray = require("./tray")
app.whenReady().then(() => {
    createMainWin()
    createTray()
})