const { BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')

class createWindow extends BrowserWindow {
  constructor(config, urlLocation) {
    const basicConfig = {
      width: 1000,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      },
      show: false,
      backgroundColor: '#efefef',
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadURL(urlLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
    if(isDev){
      this.webContents.openDevTools()
    }
    this.webContents.on('new-window',(event,url)=>{
      event.preventDefault()
    })
  }
}

module.exports = createWindow