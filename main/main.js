const {autoUpdater} = require('electron-updater')

const {app,ipcMain,Menu,dialog,Tray} = require('electron')
const createWindow = require('./createWindow')
const isDev = require('electron-is-dev')
const path = require('path')

let mainWindow
let otherWindow

const createMainWindow=()=>{
  let mainWindowConfig = {}
  const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
  console.log(path.join(__dirname))
  mainWindow = new createWindow(mainWindowConfig, urlLocation)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  handleCheck()
}

const createOtherWindow=(config,url)=>{
  let otherWindowConfig = {
    ...config,
    width: 800,
    height: 600,
  }
  let otherWindowUrl = url?url: `file://${path.join(__dirname, '../build/index.html#/other')}`
  otherWindow = new createWindow(otherWindowConfig,otherWindowUrl)
  otherWindow.on('closed',()=>{
    otherWindow=null
  })
}

// 更新
const handleCheck=()=>{
  let message = {
    error: { status: -1, message: '检查更新出错' },
    checking: { status: 1, message: '正在检查更新……' },
    updateAva: { status: 2, message: '检测到新版本，正在下载……' },
    updateNotAva: { status: 3, message: '已是最新版本，无需更新' }
  }
  autoUpdater.autoDownload = false  // 手动指定下载
  
  if(isDev){
    autoUpdater.updateConfigPath=path.join(__dirname,'../dev-app-update.yml')
  }

  // autoUpdater.setFeedURL(url)
  autoUpdater.on('error', function (err) {
    sendUpdateMessage(message.error,err)
  })
  // 检查更新中
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
  })

  // 检测到有新版本更新
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage(message.updateAva)
  })

  // 暂无新版本可更新
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(message.updateNotAva,info)
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    mainWindow.webContents.send('downloadProgress', progressObj)
  })

  // 下载完成,退出且重新安装
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    autoUpdater.quitAndInstall()
  })
}  

const sendUpdateMessage =(text,info={}) =>{
  mainWindow.webContents.send('message', text,info)
}

// 菜单
const template = [
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      }, {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      }, {
        type: 'separator'
      }, {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      }, {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }, {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },{
        label: '切换开发者工具',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: '菜单一'
  },
  {
    label: '菜单一',
    submenu: [
      {
        label: '子菜单一',
        submenu: [
          {
            label: '子菜单'
          },
          {
            label: '子菜单'
          }
        ]
      },
      {
        label: '子菜单二'
      }
    ]
  },
  {
    label: '菜单二',
    submenu: [{
        label: '子菜单',
        click:()=>{
          dialog.showMessageBox({
            type:'info',
            title: '提示',
            message: '点击了子菜单',
            buttons:['ok','cancel']
          })
        }
    }, {
        label: '子菜单'
    }, {
        label: '子菜单'
    }]
  }
]

var list = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(list)

//托盘
let tray
const setTray=()=>{
  tray = new Tray(path.join(__dirname, '../assets/icon.png'))
  tray.on('click',()=>{
    if(!otherWindow){
      createOtherWindow()
    }
  })
  tray.on('right-click',()=>{
    const contextMenu = Menu.buildFromTemplate([
      {label:'创建other窗口',click:()=>{
        if(!otherWindow){
          createOtherWindow()
        }
      }},
      {label:'隐藏'},
    ])
    tray.popUpContextMenu(contextMenu)
  })
}

app.whenReady().then(()=>{
  setTray()
})

// 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', ()=>{
  createMainWindow()
  ipcMain.on('open-other-window',(event,config,url="")=>{
    createOtherWindow(config,url)
  })

  ipcMain.on('receive-message',(event,arg)=>{
    otherWindow.webContents.send('send-message',arg)
  })

  ipcMain.on('check-update', () => {
    // 开始检查更新
    autoUpdater.checkForUpdates()
  })
  
  ipcMain.on("download-update", () => {
    // 开始下载更新
    autoUpdater.downloadUpdate()
  })
  
  
  ipcMain.on('render-main-message', (event, arg) => {
    console.log(arg)
    // event.reply('main-reply', 'main的回复消息')
    event.sender.send('main-reply', 'main的回复消息2')
  })
  
  ipcMain.on('render-main-message-sync', (event, arg) => {
    console.log(arg)
    event.returnValue = 'mainde 回复'
  })
})
 
// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
 
app.on('activate', function () {
   // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createMainWindow()
  }
})