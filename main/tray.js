const { Menu, Tray } = require('electron')
const path = require("path")
const createTray = () => {
    tray = new Tray(path.resolve(__dirname, process.platform === 'darwin' ? "../static/icon/tray/camera-mac.png" : "../static/icon/tray/camera.png"))
    const contextMenu = Menu.buildFromTemplate([
        { label: '退出', role: 'quit' },
    ])
    tray.setToolTip('摄像头')
    tray.setContextMenu(contextMenu)
}

module.exports = createTray